from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY
from sqlalchemy.orm import relationship

from app.database import Base


class MentorProfile(Base):
    __tablename__ = "mentor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(String, nullable=True)
    skills = Column(ARRAY(String), nullable=True)
    experience_years = Column(Integer, nullable=True)

    user = relationship("User", back_populates="mentor_profile")
    availabilities = relationship("Availability", back_populates="mentor", cascade="all, delete-orphan")
    slots = relationship("Slot", back_populates="mentor", cascade="all, delete-orphan")