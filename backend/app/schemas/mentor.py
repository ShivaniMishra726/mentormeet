from typing import List, Optional
from pydantic import BaseModel


class MentorProfileUpdate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None


class MentorProfileOut(BaseModel):
    id: int
    user_id: int
    bio: Optional[str]
    skills: Optional[List[str]]
    experience_years: Optional[int]

    class Config:
        from_attributes = True

class MentorPublicOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    bio: Optional[str]
    skills: Optional[List[str]]
    experience_years: Optional[int]

    class Config:
        from_attributes = True