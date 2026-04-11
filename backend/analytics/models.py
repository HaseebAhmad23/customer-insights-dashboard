from django.db import models


class UserProfile(models.Model):
    PLAN_CHOICES = [
        ("free", "Free"),
        ("pro", "Pro"),
        ("enterprise", "Enterprise"),
    ]

    email = models.EmailField(unique=True)
    signup_date = models.DateTimeField(auto_now_add=True)
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES, default="free")

    class Meta:
        ordering = ["-signup_date"]

    def __str__(self):
        return self.email


class Feature(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Event(models.Model):
    EVENT_CHOICES = [
        ("signup", "Signup"),
        ("login", "Login"),
        ("feature_used", "Feature Used"),
        ("upgrade_clicked", "Upgrade Clicked"),
    ]

    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="events"
    )
    event_name = models.CharField(max_length=100, choices=EVENT_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.user.email} — {self.event_name}"
