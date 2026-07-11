from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, mentor, booking

app = FastAPI(title="MentorMeet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://mentormeet-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(mentor.router)
app.include_router(booking.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}