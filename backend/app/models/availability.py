from sqlalchemy import Column, Integer, ForeignKey, Time
from sqlalchemy.orm import relationship

from app.database import Base


class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("mentor_profiles.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0 = Monday ... 6 = Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    mentor = relationship("MentorProfile", back_populates="availabilities")