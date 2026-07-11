from datetime import datetime, timedelta, time
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.user import User
from app.models.mentor_profile import MentorProfile
from app.models.availability import Availability
from app.models.slot import Slot, SlotStatus
from app.schemas.mentor import MentorProfileUpdate, MentorProfileOut, MentorPublicOut
from app.schemas.availability import AvailabilityCreate, AvailabilityOut
from app.schemas.slot import SlotOut
from app.dependencies import require_mentor

router = APIRouter(prefix="/mentor", tags=["mentor"])

SLOT_DURATION_MINUTES = 30
WEEKS_AHEAD = 4


def _get_profile(db: Session, current_user: User) -> MentorProfile:
    profile = db.query(MentorProfile).filter(MentorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    return profile


@router.put("/profile", response_model=MentorProfileOut)
def update_profile(payload: MentorProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_mentor)):
    profile = _get_profile(db, current_user)
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.skills is not None:
        profile.skills = payload.skills
    if payload.experience_years is not None:
        profile.experience_years = payload.experience_years
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/availability", response_model=AvailabilityOut)
def add_availability(payload: AvailabilityCreate, db: Session = Depends(get_db), current_user: User = Depends(require_mentor)):
    profile = _get_profile(db, current_user)

    availability = Availability(
        mentor_id=profile.id,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )
    db.add(availability)
    db.commit()
    db.refresh(availability)

    _generate_slots_for_availability(db, profile.id, availability)

    return availability


@router.get("", response_model=List[MentorPublicOut])
def list_mentors(skill: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MentorProfile).join(User, MentorProfile.user_id == User.id)
    profiles = query.all()

    result = []
    for p in profiles:
        if skill:
            mentor_skills = [s.lower() for s in (p.skills or [])]
            if skill.lower() not in mentor_skills:
                continue

        result.append(MentorPublicOut(
            id=p.id,
            user_id=p.user_id,
            full_name=p.user.full_name,
            email=p.user.email,
            bio=p.bio,
            skills=p.skills,
            experience_years=p.experience_years,
        ))
    return result


@router.get("/{mentor_id}", response_model=MentorPublicOut)
def get_mentor(mentor_id: int, db: Session = Depends(get_db)):
    profile = db.query(MentorProfile).filter(MentorProfile.id == mentor_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Mentor not found")

    return MentorPublicOut(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.user.full_name,
        email=profile.user.email,
        bio=profile.bio,
        skills=profile.skills,
        experience_years=profile.experience_years,
    )


@router.get("/{mentor_id}/slots", response_model=List[SlotOut])
def get_mentor_slots(mentor_id: int, db: Session = Depends(get_db)):
    slots = db.query(Slot).filter(Slot.mentor_id == mentor_id).order_by(Slot.start_datetime).all()
    return slots


def _generate_slots_for_availability(db: Session, mentor_id: int, availability: Availability):
    today = datetime.utcnow().date()
    for week in range(WEEKS_AHEAD):
        days_ahead = (availability.day_of_week - today.weekday()) % 7 + (week * 7)
        target_date = today + timedelta(days=days_ahead)

        current_dt = datetime.combine(target_date, availability.start_time)
        end_dt = datetime.combine(target_date, availability.end_time)

        while current_dt + timedelta(minutes=SLOT_DURATION_MINUTES) <= end_dt:
            slot_end = current_dt + timedelta(minutes=SLOT_DURATION_MINUTES)

            existing = db.query(Slot).filter(
                Slot.mentor_id == mentor_id,
                Slot.start_datetime == current_dt,
            ).first()

            if not existing:
                slot = Slot(
                    mentor_id=mentor_id,
                    start_datetime=current_dt,
                    end_datetime=slot_end,
                    status=SlotStatus.available,
                )
                db.add(slot)
                try:
                    db.commit()
                except IntegrityError:
                    db.rollback()

            current_dt = slot_end


