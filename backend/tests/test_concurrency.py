import threading
import requests

BASE_URL = "http://127.0.0.1:8000"

# Fill these in with real values before running
STUDENT_EMAIL = "student2@test.com"
STUDENT_PASSWORD = "password123"
SLOT_ID = 5  # pick a slot that's currently "available" in your DB

NUM_CONCURRENT_REQUESTS = 10


def get_token():
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": STUDENT_EMAIL,
        "password": STUDENT_PASSWORD,
    })
    resp.raise_for_status()
    return resp.json()["access_token"]


results = []
results_lock = threading.Lock()


def attempt_booking(token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(f"{BASE_URL}/bookings/{SLOT_ID}", headers=headers)
    with results_lock:
        results.append(resp.status_code)


def test_only_one_booking_succeeds():
    token = get_token()

    threads = [
        threading.Thread(target=attempt_booking, args=(token,))
        for _ in range(NUM_CONCURRENT_REQUESTS)
    ]

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    success_count = results.count(200)
    conflict_count = results.count(409)

    print(f"\nResults: {results}")
    print(f"Successes (200): {success_count}, Conflicts (409): {conflict_count}")

    assert success_count == 1, f"Expected exactly 1 success, got {success_count}"
    assert conflict_count == NUM_CONCURRENT_REQUESTS - 1