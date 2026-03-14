from django.utils.html import strip_tags
from rest_framework import serializers

from .models import Category, Listing, ListingImage, Location, Watchlist


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "parent", "children"]

    def get_children(self, obj):
        # Uses prefetched children from queryset — no extra queries
        if hasattr(obj, "_prefetched_objects_cache") and "children" in obj._prefetched_objects_cache:
            children = obj._prefetched_objects_cache["children"]
        else:
            children = obj.children.all()
        return CategorySerializer(children, many=True).data


class CategoryFlatSerializer(serializers.ModelSerializer):
    """Lightweight serializer without recursive children."""

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon"]


class LocationSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ["id", "name", "slug", "level", "parent", "children"]

    def get_children(self, obj):
        if obj.level == "city":
            return []
        if hasattr(obj, "_prefetched_objects_cache") and "children" in obj._prefetched_objects_cache:
            children = obj._prefetched_objects_cache["children"]
        else:
            children = obj.children.all()
        return LocationSerializer(children, many=True).data


class LocationFlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name", "slug", "level"]


class RelativeImageField(serializers.ImageField):
    """Always return a relative path (e.g. /media/...) instead of an absolute
    URL so that the browser resolves it against the current origin."""

    def to_representation(self, value):
        if not value:
            return None
        return value.url


class ListingImageSerializer(serializers.ModelSerializer):
    image = RelativeImageField()

    class Meta:
        model = ListingImage
        fields = ["id", "image", "ordering"]


class ListingListSerializer(serializers.ModelSerializer):
    """Compact listing for search results / feeds."""

    category = CategoryFlatSerializer(read_only=True)
    location = LocationFlatSerializer(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    seller_name = serializers.CharField(source="seller.full_name", read_only=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "slug",
            "price",
            "price_type",
            "condition",
            "status",
            "thumbnail",
            "category",
            "location",
            "seller_name",
            "views_count",
            "is_featured",
            "created_at",
        ]

    def get_thumbnail(self, obj):
        # Access prefetched images cache to avoid N+1
        images = list(obj.images.all())
        if images:
            return images[0].image.url
        return None


class ListingDetailSerializer(serializers.ModelSerializer):
    """Full listing detail including all images and seller info."""

    category = CategoryFlatSerializer(read_only=True)
    location = LocationFlatSerializer(read_only=True)
    images = ListingImageSerializer(many=True, read_only=True)
    seller_name = serializers.CharField(source="seller.full_name", read_only=True)
    seller_id = serializers.UUIDField(source="seller.id", read_only=True)
    seller_phone = serializers.CharField(source="seller.phone", read_only=True)
    seller_email = serializers.EmailField(source="seller.email", read_only=True)
    seller_is_verified = serializers.BooleanField(source="seller.is_verified", read_only=True)
    similar_listings = serializers.SerializerMethodField()
    breadcrumbs = serializers.SerializerMethodField()
    is_watched = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "price_type",
            "condition",
            "status",
            "images",
            "category",
            "location",
            "seller_name",
            "seller_id",
            "seller_phone",
            "seller_email",
            "seller_is_verified",
            "similar_listings",
            "views_count",
            "is_featured",
            "breadcrumbs",
            "is_watched",
            "created_at",
            "updated_at",
        ]

    def get_similar_listings(self, obj):
        similar = (
            Listing.objects.filter(
                category=obj.category,
                status=Listing.Status.ACTIVE,
            )
            .exclude(pk=obj.pk)
            .select_related("category", "location", "seller")
            .prefetch_related("images")
            .order_by("-is_featured", "-created_at")[:6]
        )
        return ListingListSerializer(similar, many=True, context=self.context).data

    def get_breadcrumbs(self, obj):
        ancestors = obj.category.get_ancestors() + [obj.category]
        return [{"name": c.name, "slug": c.slug} for c in ancestors]

    def get_is_watched(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        # Use annotation if available (set in view queryset), else query
        if hasattr(obj, "_is_watched"):
            return obj._is_watched
        return Watchlist.objects.filter(
            user=request.user, listing=obj
        ).exists()


class ListingCreateSerializer(serializers.ModelSerializer):
    """Handles ad creation with image uploads."""

    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Listing
        fields = [
            "title",
            "description",
            "price",
            "price_type",
            "condition",
            "category",
            "location",
            "images",
        ]

    def validate_title(self, value):
        # Strip HTML tags from title
        cleaned = strip_tags(value).strip()
        if len(cleaned) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")
        return cleaned

    def validate_description(self, value):
        cleaned = strip_tags(value).strip()
        if len(cleaned) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters."
            )
        return cleaned

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def validate_images(self, value):
        from PIL import Image

        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 images allowed.")
        for img in value:
            if img.size > 5 * 1024 * 1024:
                raise serializers.ValidationError(
                    f"Image {img.name} exceeds 5MB limit."
                )
            # Validate actual image content, not just MIME header
            try:
                im = Image.open(img)
                im.verify()
                img.seek(0)
            except Exception:
                raise serializers.ValidationError(
                    f"{img.name} is not a valid image file."
                )
        return value

    def create(self, validated_data):
        images_data = validated_data.pop("images", [])
        listing = Listing.objects.create(
            seller=self.context["request"].user,
            **validated_data,
        )
        for i, img in enumerate(images_data):
            ListingImage.objects.create(listing=listing, image=img, ordering=i)
        return listing


