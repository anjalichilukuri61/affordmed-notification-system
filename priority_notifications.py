"""
Stage 6 - Priority Notifications
Fetches notifications from the API and returns top-n by priority.
Priority: Placement > Result > Event, then by recency (latest first).
"""

import urllib.request
import urllib.error
import json
from datetime import datetime

API_URL = "http://4.224.186.213/evaluation-service/notifications"

PRIORITY_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
}


def fetch_notifications():
    """Fetch all notifications from the evaluation API."""
    try:
        req = urllib.request.Request(API_URL)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            return data.get("notifications", [])
    except urllib.error.URLError as e:
        print(f"[ERROR] Could not reach API: {e}")
        return []
    except json.JSONDecodeError:
        print("[ERROR] Invalid JSON response from API")
        return []


def parse_timestamp(ts: str) -> datetime:
    """Parse timestamp string to datetime object."""
    try:
        return datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        try:
            return datetime.fromisoformat(ts)
        except ValueError:
            return datetime.min


def get_top_n_priority_notifications(n: int = 10):
    """
    Fetch and return top-n notifications sorted by:
    1. Priority weight (Placement=3, Result=2, Event=1) - descending
    2. Recency (latest created_at) - descending
    """
    notifications = fetch_notifications()

    if not notifications:
        print("No notifications found.")
        return []

    # Sort by priority weight first, then by recency
    sorted_notifications = sorted(
        notifications,
        key=lambda n: (
            PRIORITY_WEIGHT.get(n.get("Type", "Event"), 0),
            parse_timestamp(n.get("Timestamp", ""))
        ),
        reverse=True
    )

    return sorted_notifications[:n]


def display_notifications(notifications: list, n: int):
    """Display notifications in a formatted table."""
    print("\n" + "=" * 70)
    print(f"  TOP {n} PRIORITY NOTIFICATIONS")
    print("=" * 70)
    print(f"{'Rank':<5} {'Type':<12} {'Message':<30} {'Timestamp'}")
    print("-" * 70)

    for rank, notif in enumerate(notifications, 1):
        notif_type = notif.get("Type", "Unknown")
        message = notif.get("Message", "")[:28]
        timestamp = notif.get("Timestamp", "")
        priority = PRIORITY_WEIGHT.get(notif_type, 0)

        # Add priority indicator
        indicator = "🔴" if notif_type == "Placement" else "🟡" if notif_type == "Result" else "🟢"

        print(f"{rank:<5} {indicator} {notif_type:<10} {message:<30} {timestamp}")

    print("=" * 70)
    print(f"\nPriority Legend: 🔴 Placement (High) | 🟡 Result (Medium) | 🟢 Event (Low)")
    print(f"Total notifications fetched, showing top {n}.\n")


def maintain_top_n(existing: list, new_notification: dict, n: int) -> list:
    """
    Efficiently maintain top-n list when a new notification arrives.
    Instead of re-sorting all notifications, insert and trim.
    """
    existing.append(new_notification)

    # Re-sort and keep top n
    sorted_list = sorted(
        existing,
        key=lambda x: (
            PRIORITY_WEIGHT.get(x.get("Type", "Event"), 0),
            parse_timestamp(x.get("Timestamp", ""))
        ),
        reverse=True
    )

    return sorted_list[:n]


if __name__ == "__main__":
    # Get top n from user input
    try:
        n = int(input("Enter number of top priority notifications to display (default 10): ").strip() or "10")
    except ValueError:
        n = 10

    print(f"\nFetching notifications from API...")
    top_notifications = get_top_n_priority_notifications(n)

    if top_notifications:
        display_notifications(top_notifications, n)

        # Show maintain_top_n demo
        print("\n--- Demo: New notification arrives ---")
        new_notif = {
            "ID": "demo-id-001",
            "Type": "Placement",
            "Message": "Google hiring - urgent",
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        updated = maintain_top_n(top_notifications, new_notif, n)
        print(f"New Placement notification added. Top {n} updated.")
        print(f"New #1: [{updated[0]['Type']}] {updated[0]['Message']}")
    else:
        print("Could not retrieve notifications. Check your network/API.")
