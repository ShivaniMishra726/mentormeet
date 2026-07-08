import enum
from datetime import datetime

from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship

from app.database import Base


class BookingStatus(str, enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(Integer, ForeignKey("slots.id"), unique=True, nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(BookingStatus), nullable=False, default=BookingStatus.confirmed)
    created_at = Column(DateTime, default=datetime.utcnow)

    slot = relationship("Slot", back_populates="booking")
    student = relationship("User", back_populates="bookings")