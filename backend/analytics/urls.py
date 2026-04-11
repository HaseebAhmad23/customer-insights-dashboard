from django.urls import path
from .views import (
    EventCreateView,
    DashboardMetricsView,
    UserSegmentsView,
    TopFeaturesView,
    UserProfileListCreateView,
)

urlpatterns = [
    path("events/", EventCreateView.as_view(), name="event-create"),
    path("dashboard/metrics/", DashboardMetricsView.as_view(), name="dashboard-metrics"),
    path("users/", UserProfileListCreateView.as_view(), name="user-list"),
    path("users/segments/", UserSegmentsView.as_view(), name="user-segments"),
    path("features/top/", TopFeaturesView.as_view(), name="features-top"),
]
