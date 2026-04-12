from django.contrib import admin
from .models import UserProfile, Event, Feature


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["id", "email", "plan_type", "signup_date"]
    list_filter = ["plan_type"]
    search_fields = ["email"]


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "event_name", "timestamp"]
    list_filter = ["event_name"]
    search_fields = ["user__email"]
    raw_id_fields = ["user"]


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "description"]
    search_fields = ["name"]
