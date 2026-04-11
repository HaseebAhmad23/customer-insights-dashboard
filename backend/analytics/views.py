from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import UserProfile, Event
from .serializers import EventSerializer, UserProfileSerializer
from .scoring import compute_engagement_score, get_segment


class EventCreateView(APIView):
    """POST /api/events/ — track any event for a user."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardMetricsView(APIView):
    """GET /api/dashboard/metrics/?days=30"""

    permission_classes = [AllowAny]

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        since = timezone.now() - timedelta(days=days)

        # Daily signups
        daily_signups = (
            UserProfile.objects.filter(signup_date__gte=since)
            .annotate(date=TruncDate("signup_date"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        # Top features (feature_used events with metadata.feature)
        top_features = (
            Event.objects.filter(event_name="feature_used", timestamp__gte=since)
            .values("metadata__feature")
            .annotate(count=Count("id"))
            .order_by("-count")[:8]
        )

        # User segment distribution
        users = UserProfile.objects.prefetch_related("events").all()
        segment_counts = {"Active": 0, "Medium": 0, "At Risk": 0}
        for user in users:
            score = compute_engagement_score(user)
            segment_counts[get_segment(score)] += 1

        # Event type breakdown
        event_breakdown = (
            Event.objects.filter(timestamp__gte=since)
            .values("event_name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response(
            {
                "total_users": UserProfile.objects.count(),
                "total_events": Event.objects.filter(timestamp__gte=since).count(),
                "daily_signups": list(
                    daily_signups.values_list("date", "count")
                ),
                "daily_signups_labeled": [
                    {"date": str(row["date"]), "signups": row["count"]}
                    for row in daily_signups
                ],
                "top_features": [
                    {
                        "feature": row["metadata__feature"] or "unknown",
                        "count": row["count"],
                    }
                    for row in top_features
                ],
                "segment_distribution": [
                    {"segment": k, "count": v} for k, v in segment_counts.items()
                ],
                "event_breakdown": list(event_breakdown),
            }
        )


class UserSegmentsView(APIView):
    """GET /api/users/segments/?segment=Active&plan_type=pro"""

    permission_classes = [AllowAny]

    def get(self, request):
        segment_filter = request.query_params.get("segment")
        plan_filter = request.query_params.get("plan_type")

        qs = UserProfile.objects.prefetch_related("events").all()
        if plan_filter:
            qs = qs.filter(plan_type=plan_filter)

        results = []
        for user in qs:
            score = compute_engagement_score(user)
            segment = get_segment(score)
            if segment_filter and segment != segment_filter:
                continue
            results.append(
                {
                    "id": user.id,
                    "email": user.email,
                    "plan_type": user.plan_type,
                    "signup_date": user.signup_date,
                    "engagement_score": score,
                    "segment": segment,
                }
            )

        # Sort by score descending
        results.sort(key=lambda x: x["engagement_score"], reverse=True)
        return Response(results)


class TopFeaturesView(APIView):
    """GET /api/features/top/?days=30"""

    permission_classes = [AllowAny]

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        since = timezone.now() - timedelta(days=days)

        top_features = (
            Event.objects.filter(event_name="feature_used", timestamp__gte=since)
            .values("metadata__feature")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        return Response(
            [
                {"feature": row["metadata__feature"] or "unknown", "count": row["count"]}
                for row in top_features
            ]
        )


class UserProfileListCreateView(APIView):
    """GET/POST /api/users/"""

    permission_classes = [AllowAny]

    def get(self, request):
        users = UserProfile.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
