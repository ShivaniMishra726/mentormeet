from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.slot import Slot, SlotStatus
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.models.mentor_profile import MentorProfile
from app.schemas.booking import BookingOut, BookingDetailOut
from app.dependencies import require_student, require_mentor

from app.schemas.booking import BookingOut, BookingDetailOut, StudentBookingOut

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/{slot_id}", response_model=BookingOut)
def book_slot(slot_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    # Lock this specific slot row for the duration of this transaction.
    # If another request is simultaneously trying to book the same slot,
    # the database makes it WAIT here until this transaction finishes.
    slot = db.execute(
        select(Slot).where(Slot.id == slot_id).with_for_update()
    ).scalar_one_or_none()

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    if slot.status != SlotStatus.available:
        raise HTTPException(status_code=409, detail="Slot is no longer available")

    slot.status = SlotStatus.booked

    booking = Booking(
        slot_id=slot.id,
        student_id=current_user.id,
        status=BookingStatus.confirmed,
    )
    db.add(booking)

    try:
        db.commit()
    except IntegrityError:
        # Belt-and-suspenders: even if two transactions somehow both
        # got past the lock check, the unique constraint on
        # Booking.slot_id makes the database itself reject the second insert.
        db.rollback()
        raise HTTPException(status_code=409, detail="Slot is no longer available")

    db.refresh(booking)
    return booking


@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    if booking.status == BookingStatus.cancelled:
        raise HTTPException(status_code=409, detail="Booking already cancelled")

    booking.status = BookingStatus.cancelled

    slot = db.query(Slot).filter(Slot.id == booking.slot_id).first()
    if slot:
        slot.status = SlotStatus.available

    db.commit()
    db.refresh(booking)
    return booking


@router.get("/student/me", response_model=List[StudentBookingOut])
def my_bookings_as_student(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    bookings = (
        db.query(Booking)
        .filter(Booking.student_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    result = []
    for b in bookings:
        result.append(StudentBookingOut(
            id=b.id,
            slot_id=b.slot_id,
            status=b.status,
            created_at=b.created_at,
            slot_start=b.slot.start_datetime,
            slot_end=b.slot.end_datetime,
            mentor_name=b.slot.mentor.user.full_name,
        ))
    return result


@router.get("/mentor/me", response_model=List[BookingDetailOut])
def my_bookings_as_mentor(db: Session = Depends(get_db), current_user: User = Depends(require_mentor)):
    profile = db.query(MentorProfile).filter(MentorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    bookings = (
        db.query(Booking)
        .join(Slot, Booking.slot_id == Slot.id)
        .filter(Slot.mentor_id == profile.id)
        .order_by(Slot.start_datetime)
        .all()
    )

    result = []
    for b in bookings:
        result.append(BookingDetailOut(
            id=b.id,
            slot_id=b.slot_id,
            student_id=b.student_id,
            status=b.status,
            created_at=b.created_at,
            slot_start=b.slot.start_datetime,
            slot_end=b.slot.end_datetime,
            student_name=b.student.full_name,
        ))
    return result