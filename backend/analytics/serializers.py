from rest_framework import serializers
from .models import UserProfile, Event, Feature


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["id", "email", "signup_date", "plan_type"]
        read_only_fields = ["id", "signup_date"]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "user", "event_name", "timestamp", "metadata"]
        read_only_fields = ["id", "timestamp"]


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ["id", "name", "description"]
