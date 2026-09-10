from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    RECYCLER = "RECYCLER"
    COLLECTOR = "COLLECTOR"

class LotStatus(str, Enum):
    DRAFT = "DRAFT"
    AVAILABLE = "AVAILABLE"
    MATCHED = "MATCHED"
    QUOTED = "QUOTED"
    HANDOVER_PENDING = "HANDOVER_PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"