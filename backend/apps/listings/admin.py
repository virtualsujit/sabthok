from django.contrib import admin

from .models import Category, Listing, ListingImage, Location, Watchlist


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "parent", "ordering"]
    list_filter = ["parent"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "level", "parent"]
    list_filter = ["level"]


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ["title", "seller", "category", "price", "status", "created_at"]
    list_filter = ["status", "condition", "category"]
    search_fields = ["title", "description"]
    readonly_fields = ["views_count", "slug"]
    inlines = [ListingImageInline]


@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ["user", "listing", "created_at"]
