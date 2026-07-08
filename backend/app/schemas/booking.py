from datetime import datetime
from pydantic import BaseModel
from app.models.booking import BookingStatus


class BookingOut(BaseModel):
    id: int
    slot_id: int
    student_id: int
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True


class BookingDetailOut(BaseModel):
    id: int
    slot_id: int
    student_id: int
    status: BookingStatus
    created_at: datetime
    slot_start: datetime
    slot_end: datetime
    student_name: str

    class Config:
        from_attributes = True

class StudentBookingOut(BaseModel):
    id: int
    slot_id: int
    status: BookingStatus
    created_at: datetime
    slot_start: datetime
    slot_end: datetime
    mentor_name: str

    class Config:
        from_attributes = True