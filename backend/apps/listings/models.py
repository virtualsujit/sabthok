import uuid

from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.core.validators import MinLengthValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """Self-referencing tree for deeply nested categories.
    e.g. Real Estate -> For Rent -> Apartment
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )
    icon = models.CharField(max_length=60, blank=True, help_text="Icon class or emoji")
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "categories"
        ordering = ["ordering", "name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_ancestors(self):
        """Return list from root to self."""
        ancestors = []
        node = self.parent
        while node:
            ancestors.insert(0, node)
            node = node.parent
        return ancestors


class Location(models.Model):
    """Province -> District -> City hierarchy."""

    LEVEL_CHOICES = [
        ("province", "Province"),
        ("district", "District"),
        ("city", "City"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )

    class Meta:
        db_table = "locations"
        ordering = ["name"]
        unique_together = [("slug", "level")]

    def __str__(self):
        return f"{self.name} ({self.level})"


class Listing(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Review"
        ACTIVE = "active", "Active"
        SOLD = "sold", "Sold"
        HIDDEN = "hidden", "Hidden"
        REJECTED = "rejected", "Rejected"

    class Condition(models.TextChoices):
        NEW = "new", "Brand New"
        LIKE_NEW = "like_new", "Like New"
        USED = "used", "Used"

    class PriceType(models.TextChoices):
        FIXED = "fixed", "Fixed"
        NEGOTIABLE = "negotiable", "Negotiable"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="listings",
    )
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="listings"
    )
    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="listings"
    )

    title = models.CharField(max_length=200, validators=[MinLengthValidator(3)])
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(validators=[MinLengthValidator(10)])
    price = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    price_type = models.CharField(
        max_length=12, choices=PriceType.choices, default=PriceType.FIXED
    )
    condition = models.CharField(
        max_length=10, choices=Condition.choices, default=Condition.USED
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )

    views_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)

    # Full-text search vector (auto-updated via trigger or save)
    search_vector = SearchVectorField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "listings"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["location", "status"]),
            models.Index(fields=["price"]),
            models.Index(fields=["slug"]),
            GinIndex(fields=["search_vector"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "listing"
            unique_suffix = uuid.uuid4().hex[:8]
            self.slug = f"{base}-{unique_suffix}"
        # Update search vector
        from django.contrib.postgres.search import SearchVector

        super().save(*args, **kwargs)
        Listing.objects.filter(pk=self.pk).update(
            search_vector=SearchVector("title", weight="A")
            + SearchVector("description", weight="B")
        )


class ListingImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="listings/%Y/%m/%d/")
    ordering = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "listing_images"
        ordering = ["ordering"]


class Watchlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="watchlist",
    )
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="watchers"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "watchlist"
        unique_together = [("user", "listing")]
