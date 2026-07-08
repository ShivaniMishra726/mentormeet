import enum
from datetime import datetime

from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class SlotStatus(str, enum.Enum):
    available = "available"
    booked = "booked"
    unavailable = "unavailable"


class Slot(Base):
    __tablename__ = "slots"
    __table_args__ = (
        UniqueConstraint("mentor_id", "start_datetime", name="uq_mentor_slot_start"),
    )

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("mentor_profiles.id"), nullable=False)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    status = Column(Enum(SlotStatus), nullable=False, default=SlotStatus.available)

    mentor = relationship("MentorProfile", back_populates="slots")
    booking = relationship("Booking", back_populates="slot", uselist=False)