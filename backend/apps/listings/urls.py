from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health_check, name="health-check"),
    path("categories/", views.CategoryTreeView.as_view(), name="category-tree"),
    path("locations/", views.LocationTreeView.as_view(), name="location-tree"),
    path("listings/", views.ListingListView.as_view(), name="listing-list"),
    path("listings/create/", views.ListingCreateView.as_view(), name="listing-create"),
    path("listings/mine/", views.MyListingsView.as_view(), name="my-listings"),
    path("listings/watchlist/", views.MyWatchlistView.as_view(), name="my-watchlist"),
    path("listings/<slug:slug>/", views.ListingDetailView.as_view(), name="listing-detail"),
    path("listings/<slug:slug>/edit/", views.ListingUpdateView.as_view(), name="listing-update"),
    path("listings/<slug:slug>/delete/", views.ListingDeleteView.as_view(), name="listing-delete"),
    path("listings/<uuid:listing_id>/watch/", views.toggle_watchlist, name="toggle-watchlist"),
    path("sellers/<uuid:seller_id>/", views.SellerProfileView.as_view(), name="seller-profile"),
]
