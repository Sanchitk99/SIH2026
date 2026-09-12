"""Create the initial material categories without creating duplicates.

Run from the repository root with the backend environment configured:
    python backend/scripts/seed_categories.py
"""

import os
import sys
from datetime import datetime, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.firebase import db


INITIAL_CATEGORIES = (
    {"name": "Smartphones", "description": "Mobile phones and smartphone parts."},
    {"name": "Laptops", "description": "Laptops, notebooks, and laptop parts."},
    {"name": "Batteries", "description": "Rechargeable and non-rechargeable electronic batteries."},
    {"name": "PCBs", "description": "Printed circuit boards and board assemblies."},
    {"name": "Cables", "description": "Power, data, charging, and other electronic cables."},
)


def seed_categories() -> int:
    collection = db.collection("material_categories")
    existing_names = {
        (document.to_dict() or {}).get("name", "").strip().casefold()
        for document in collection.stream()
    }
    timestamp = datetime.now(timezone.utc).isoformat()
    created = 0

    for category in INITIAL_CATEGORIES:
        if category["name"].casefold() in existing_names:
            continue
        collection.document().set(
            {
                **category,
                "is_active": True,
                "created_at": timestamp,
                "updated_at": timestamp,
            }
        )
        created += 1

    return created


if __name__ == "__main__":
    print(f"Created {seed_categories()} material categories.")
