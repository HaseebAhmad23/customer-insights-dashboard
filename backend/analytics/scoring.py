from django.utils import timezone
from datetime import timedelta


WEIGHT_FEATURE_USED = 2
WEIGHT_DEFAULT = 1

THRESHOLD_ACTIVE = 10
THRESHOLD_MEDIUM = 3


def compute_engagement_score(user) -> int:
    week_ago = timezone.now() - timedelta(days=7)
    events = user.events.filter(timestamp__gte=week_ago)
    score = 0
    for event in events:
        if event.event_name == "feature_used":
            score += WEIGHT_FEATURE_USED
        else:
            score += WEIGHT_DEFAULT
    return score


def get_segment(score: int) -> str:
    if score >= THRESHOLD_ACTIVE:
        return "Active"
    elif score >= THRESHOLD_MEDIUM:
        return "Medium"
    return "At Risk"
