from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db import IntegrityError
from django.db.models import BooleanField, Exists, F, OuterRef, Value
from django_filters import rest_framework as filters
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from .models import Category, Listing, Location, Watchlist
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    CategorySerializer,
    ListingCreateSerializer,
    ListingDetailSerializer,
    ListingListSerializer,
    LocationSerializer,
)


class ListingCreateThrottle(UserRateThrottle):
    rate = "10/hour"


# ── Filters ──────────────────────────────────────────────────────────


class ListingFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    category = filters.UUIDFilter(field_name="category__id")
    category_slug = filters.CharFilter(field_name="category__slug")
    location = filters.UUIDFilter(field_name="location__id")
    condition = filters.ChoiceFilter(choices=Listing.Condition.choices)
    q = filters.CharFilter(method="search_text")

    class Meta:
        model = Listing
        fields = ["category", "location", "condition", "min_price", "max_price"]

    def search_text(self, queryset, _name, value):
        query = SearchQuery(value, search_type="websearch")
        return (
            queryset.filter(search_vector=query)
            .annotate(rank=SearchRank(F("search_vector"), query))
            .order_by("-rank")
        )


# ── Category & Location Views ────────────────────────────────────────


class CategoryTreeView(generics.ListAPIView):
    """Returns root categories with nested children."""

    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(parent__isnull=True).prefetch_related(
            "children__children__children"
        )


class LocationTreeView(generics.ListAPIView):
    """Returns province -> district -> city tree."""

    serializer_class = LocationSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Location.objects.filter(parent__isnull=True).prefetch_related(
            "children__children"
        )


# ── Listing Views ────────────────────────────────────────────────────


class ListingListView(generics.ListAPIView):
    """Public listing feed with advanced filtering."""

    serializer_class = ListingListSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = ListingFilter

    def get_queryset(self):
        return (
            Listing.objects.filter(status=Listing.Status.ACTIVE)
            .select_related("category", "location", "seller")
            .prefetch_related("images")
            .order_by("-is_featured", "-created_at")
        )


class ListingDetailView(generics.RetrieveAPIView):
    """Single listing detail by slug. Increments view count atomically."""

    serializer_class = ListingDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        qs = (
            Listing.objects.filter(status=Listing.Status.ACTIVE)
            .select_related(
                "category", "category__parent", "category__parent__parent",
                "location", "seller",
            )
            .prefetch_related("images")
        )
        # Annotate is_watched to avoid N+1 in serializer
        user = self.request.user
        if user.is_authenticated:
            qs = qs.annotate(
                _is_watched=Exists(
                    Watchlist.objects.filter(user=user, listing=OuterRef("pk"))
                )
            )
        else:
            qs = qs.annotate(_is_watched=Value(False, output_field=BooleanField()))
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Atomic increment and refresh to return accurate count
        Listing.objects.filter(pk=instance.pk).update(views_count=F("views_count") + 1)
        instance.refresh_from_db(fields=["views_count"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ListingCreateView(generics.CreateAPIView):
    """Create a new ad listing. Requires authentication."""

    serializer_class = ListingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ListingCreateThrottle]

    def perform_create(self, serializer):
        listing = serializer.save()
        from apps.moderation.tasks import moderate_listing

        moderate_listing.delay(str(listing.id))


class MyListingsView(generics.ListAPIView):
    """Listings owned by the authenticated user."""

    serializer_class = ListingListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Listing.objects.filter(seller=self.request.user)
            .select_related("category", "location", "seller")
            .prefetch_related("images")
        )


class ListingUpdateView(generics.UpdateAPIView):
    """Update a listing. Only the owner can edit."""

    serializer_class = ListingCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = "slug"

    def get_queryset(self):
        return Listing.objects.filter(seller=self.request.user)


class ListingDeleteView(generics.DestroyAPIView):
    """Delete a listing. Only the owner can delete."""

    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "slug"

    def get_queryset(self):
        return Listing.objects.filter(seller=self.request.user)


# ── Seller Profile ──────────────────────────────────────────────────


class SellerProfileView(generics.GenericAPIView):
    """Public seller profile with their active listings and verified status."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, seller_id):
        from apps.accounts.models import User

        try:
            seller = User.objects.get(pk=seller_id)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        listings = (
            Listing.objects.filter(seller=seller, status=Listing.Status.ACTIVE)
            .select_related("category", "location", "seller")
            .prefetch_related("images")
            .order_by("-created_at")[:20]
        )

        return Response({
            "id": str(seller.id),
            "full_name": seller.full_name or "Anonymous",
            "date_joined": seller.date_joined.isoformat(),
            "is_verified": seller.is_verified,
            "listings": ListingListSerializer(listings, many=True, context={"request": request}).data,
        })


# ── Watchlist ────────────────────────────────────────────────────────


class MyWatchlistView(generics.ListAPIView):
    """Listings in the authenticated user's watchlist."""

    serializer_class = ListingListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Listing.objects.filter(
                watchers__user=self.request.user,
                status=Listing.Status.ACTIVE,
            )
            .select_related("category", "location", "seller")
            .prefetch_related("images")
            .order_by("-watchers__created_at")
        )


@api_view(["POST", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def toggle_watchlist(request, listing_id):
    try:
        listing = Listing.objects.get(pk=listing_id, status=Listing.Status.ACTIVE)
    except Listing.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "POST":
        try:
            Watchlist.objects.get_or_create(user=request.user, listing=listing)
        except IntegrityError:
            pass  # Already exists — idempotent
        return Response({"watched": True}, status=status.HTTP_200_OK)

    Watchlist.objects.filter(user=request.user, listing=listing).delete()
    return Response({"watched": False}, status=status.HTTP_200_OK)


# ── Health Check ─────────────────────────────────────────────────────


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({"status": "ok"})
