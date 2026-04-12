"""
Usage: python manage.py seed_data
Creates realistic dummy users and events for development.
"""
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from analytics.models import UserProfile, Event, Feature

FEATURES = [
    "dashboard_view",
    "export_csv",
    "segment_filter",
    "date_range_picker",
    "user_search",
    "chart_zoom",
    "api_access",
    "bulk_import",
]

EVENT_NAMES = ["signup", "login", "feature_used", "upgrade_clicked"]

PLAN_TYPES = ["free", "pro", "enterprise"]


class Command(BaseCommand):
    help = "Seed development database with sample analytics data"

    def add_arguments(self, parser):
        parser.add_argument("--users", type=int, default=60)
        parser.add_argument("--events", type=int, default=400)
        parser.add_argument("--clear", action="store_true", help="Clear existing data first")

    def handle(self, *args, **options):
        if options["clear"]:
            Event.objects.all().delete()
            UserProfile.objects.all().delete()
            Feature.objects.all().delete()
            self.stdout.write("Cleared existing data.")

        # Create features
        for name in FEATURES:
            Feature.objects.get_or_create(name=name, defaults={"description": name.replace("_", " ").title()})

        # Create users spread across last 60 days
        users = []
        for i in range(options["users"]):
            days_ago = random.randint(0, 60)
            signup_dt = timezone.now() - timedelta(days=days_ago)
            user, created = UserProfile.objects.get_or_create(
                email=f"user{i+1}@example.com",
                defaults={
                    "plan_type": random.choices(PLAN_TYPES, weights=[60, 30, 10])[0],
                },
            )
            if created:
                # Backdate signup_date via queryset update (auto_now_add workaround)
                UserProfile.objects.filter(pk=user.pk).update(signup_date=signup_dt)
                user.refresh_from_db()
            users.append(user)

        # Create events spread across last 30 days
        for _ in range(options["events"]):
            user = random.choice(users)
            event_name = random.choices(
                EVENT_NAMES, weights=[5, 40, 45, 10]
            )[0]
            days_ago = random.randint(0, 30)
            ts = timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 23))

            metadata = {}
            if event_name == "feature_used":
                metadata["feature"] = random.choice(FEATURES)

            event = Event.objects.create(
                user=user,
                event_name=event_name,
                metadata=metadata,
            )
            Event.objects.filter(pk=event.pk).update(timestamp=ts)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {options['users']} users and {options['events']} events."
            )
        )
