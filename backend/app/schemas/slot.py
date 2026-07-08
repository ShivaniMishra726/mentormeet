from datetime import datetime
from pydantic import BaseModel
from app.models.slot import SlotStatus


class SlotOut(BaseModel):
    id: int
    mentor_id: int
    start_datetime: datetime
    end_datetime: datetime
    status: SlotStatus

    class Config:
        from_attributes = True