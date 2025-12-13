from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, time, date
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== MODELS ====================

# Guest Model
class Guest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    total_visits: int = 0
    total_spend: float = 0.0
    preferences: Optional[str] = None
    vip_status: bool = False
    last_visit: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GuestCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    total_visits: int = 0
    total_spend: float = 0.0
    preferences: Optional[str] = None
    vip_status: bool = False
    last_visit: Optional[str] = None
    notes: Optional[str] = None


class GuestUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    total_visits: Optional[int] = None
    total_spend: Optional[float] = None
    preferences: Optional[str] = None
    vip_status: Optional[bool] = None
    last_visit: Optional[str] = None
    notes: Optional[str] = None


# Reservation Model
class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    guest_id: str
    guest_name: str
    service_date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    party_size: int
    notes: Optional[str] = None
    status: str = "confirmed"  # confirmed, cancelled, completed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReservationCreate(BaseModel):
    guest_id: str
    guest_name: str
    service_date: str
    time: str
    party_size: int
    notes: Optional[str] = None
    status: str = "confirmed"


class ReservationUpdate(BaseModel):
    guest_id: Optional[str] = None
    guest_name: Optional[str] = None
    service_date: Optional[str] = None
    time: Optional[str] = None
    party_size: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[str] = None


# Staff Model
class Staff(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    position: str  # server, host, bartender, chef, manager
    hourly_rate: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StaffCreate(BaseModel):
    name: str
    position: str
    hourly_rate: float


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    hourly_rate: Optional[float] = None


# Staff Schedule Model
class StaffSchedule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    staff_id: str
    staff_name: str
    position: str
    service_date: str  # YYYY-MM-DD format
    shift_start: str  # HH:MM format
    shift_end: str  # HH:MM format
    scheduled_hours: float
    hourly_rate: float
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StaffScheduleCreate(BaseModel):
    staff_id: str
    staff_name: str
    position: str
    service_date: str
    shift_start: str
    shift_end: str
    scheduled_hours: float
    hourly_rate: float
    notes: Optional[str] = None


class StaffScheduleUpdate(BaseModel):
    staff_id: Optional[str] = None
    staff_name: Optional[str] = None
    position: Optional[str] = None
    service_date: Optional[str] = None
    shift_start: Optional[str] = None
    shift_end: Optional[str] = None
    scheduled_hours: Optional[float] = None
    hourly_rate: Optional[float] = None
    notes: Optional[str] = None


# Service Configuration Model
class ServiceConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_date: str
    expected_walk_in_min: int = 0
    expected_walk_in_max: int = 0
    peak_time_start: Optional[str] = None
    peak_time_end: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ServiceConfigCreate(BaseModel):
    service_date: str
    expected_walk_in_min: int = 0
    expected_walk_in_max: int = 0
    peak_time_start: Optional[str] = None
    peak_time_end: Optional[str] = None
    notes: Optional[str] = None


class ServiceConfigUpdate(BaseModel):
    expected_walk_in_min: Optional[int] = None
    expected_walk_in_max: Optional[int] = None
    peak_time_start: Optional[str] = None
    peak_time_end: Optional[str] = None
    notes: Optional[str] = None


# Briefing Request/Response
class BriefingRequest(BaseModel):
    service_date: str


class BriefingResponse(BaseModel):
    service_date: str
    briefing_text: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== HELPER FUNCTIONS ====================

def serialize_datetime(obj):
    """Convert datetime objects to ISO strings for MongoDB"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


def deserialize_datetime(doc):
    """Convert ISO strings back to datetime objects"""
    if doc and 'created_at' in doc and isinstance(doc['created_at'], str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc


# ==================== GUEST ENDPOINTS ====================

@api_router.post("/guests", response_model=Guest)
async def create_guest(input: GuestCreate):
    guest_dict = input.model_dump()
    guest_obj = Guest(**guest_dict)
    
    doc = guest_obj.model_dump()
    doc['created_at'] = serialize_datetime(doc['created_at'])
    
    await db.guests.insert_one(doc)
    return guest_obj


@api_router.get("/guests", response_model=List[Guest])
async def get_guests():
    guests = await db.guests.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(g) for g in guests]


@api_router.get("/guests/{guest_id}", response_model=Guest)
async def get_guest(guest_id: str):
    guest = await db.guests.find_one({"id": guest_id}, {"_id": 0})
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return deserialize_datetime(guest)


@api_router.put("/guests/{guest_id}", response_model=Guest)
async def update_guest(guest_id: str, input: GuestUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.guests.update_one({"id": guest_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    guest = await db.guests.find_one({"id": guest_id}, {"_id": 0})
    return deserialize_datetime(guest)


@api_router.delete("/guests/{guest_id}")
async def delete_guest(guest_id: str):
    result = await db.guests.delete_one({"id": guest_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    return {"message": "Guest deleted successfully"}


# ==================== RESERVATION ENDPOINTS ====================

@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(input: ReservationCreate):
    reservation_dict = input.model_dump()
    reservation_obj = Reservation(**reservation_dict)
    
    doc = reservation_obj.model_dump()
    doc['created_at'] = serialize_datetime(doc['created_at'])
    
    await db.reservations.insert_one(doc)
    return reservation_obj


@api_router.get("/reservations", response_model=List[Reservation])
async def get_reservations(service_date: Optional[str] = None):
    query = {"service_date": service_date} if service_date else {}
    reservations = await db.reservations.find(query, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(r) for r in reservations]


@api_router.get("/reservations/{reservation_id}", response_model=Reservation)
async def get_reservation(reservation_id: str):
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return deserialize_datetime(reservation)


@api_router.put("/reservations/{reservation_id}", response_model=Reservation)
async def update_reservation(reservation_id: str, input: ReservationUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.reservations.update_one({"id": reservation_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    return deserialize_datetime(reservation)


@api_router.delete("/reservations/{reservation_id}")
async def delete_reservation(reservation_id: str):
    result = await db.reservations.delete_one({"id": reservation_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    return {"message": "Reservation deleted successfully"}


# ==================== STAFF ENDPOINTS ====================

@api_router.post("/staff", response_model=Staff)
async def create_staff(input: StaffCreate):
    staff_dict = input.model_dump()
    staff_obj = Staff(**staff_dict)
    
    doc = staff_obj.model_dump()
    doc['created_at'] = serialize_datetime(doc['created_at'])
    
    await db.staff.insert_one(doc)
    return staff_obj


@api_router.get("/staff", response_model=List[Staff])
async def get_staff():
    staff = await db.staff.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(s) for s in staff]


@api_router.get("/staff/{staff_id}", response_model=Staff)
async def get_staff_member(staff_id: str):
    staff = await db.staff.find_one({"id": staff_id}, {"_id": 0})
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return deserialize_datetime(staff)


@api_router.put("/staff/{staff_id}", response_model=Staff)
async def update_staff(staff_id: str, input: StaffUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.staff.update_one({"id": staff_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Staff member not found")
    
    staff = await db.staff.find_one({"id": staff_id}, {"_id": 0})
    return deserialize_datetime(staff)


@api_router.delete("/staff/{staff_id}")
async def delete_staff(staff_id: str):
    result = await db.staff.delete_one({"id": staff_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Staff member not found")
    
    return {"message": "Staff member deleted successfully"}


# ==================== STAFF SCHEDULE ENDPOINTS ====================

@api_router.post("/schedules", response_model=StaffSchedule)
async def create_schedule(input: StaffScheduleCreate):
    schedule_dict = input.model_dump()
    schedule_obj = StaffSchedule(**schedule_dict)
    
    doc = schedule_obj.model_dump()
    doc['created_at'] = serialize_datetime(doc['created_at'])
    
    await db.schedules.insert_one(doc)
    return schedule_obj


@api_router.get("/schedules", response_model=List[StaffSchedule])
async def get_schedules(service_date: Optional[str] = None):
    query = {"service_date": service_date} if service_date else {}
    schedules = await db.schedules.find(query, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(s) for s in schedules]


@api_router.put("/schedules/{schedule_id}", response_model=StaffSchedule)
async def update_schedule(schedule_id: str, input: StaffScheduleUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.schedules.update_one({"id": schedule_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    schedule = await db.schedules.find_one({"id": schedule_id}, {"_id": 0})
    return deserialize_datetime(schedule)


@api_router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str):
    result = await db.schedules.delete_one({"id": schedule_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    return {"message": "Schedule deleted successfully"}


# ==================== SERVICE CONFIG ENDPOINTS ====================

@api_router.post("/service-config", response_model=ServiceConfig)
async def create_service_config(input: ServiceConfigCreate):
    # Check if config already exists for this date
    existing = await db.service_configs.find_one({"service_date": input.service_date})
    if existing:
        raise HTTPException(status_code=400, detail="Service config already exists for this date. Use PUT to update.")
    
    config_dict = input.model_dump()
    config_obj = ServiceConfig(**config_dict)
    
    doc = config_obj.model_dump()
    doc['created_at'] = serialize_datetime(doc['created_at'])
    
    await db.service_configs.insert_one(doc)
    return config_obj


@api_router.get("/service-config", response_model=Optional[ServiceConfig])
async def get_service_config(service_date: str):
    config = await db.service_configs.find_one({"service_date": service_date}, {"_id": 0})
    if not config:
        return None
    return deserialize_datetime(config)


@api_router.put("/service-config/{service_date}", response_model=ServiceConfig)
async def update_service_config(service_date: str, input: ServiceConfigUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.service_configs.update_one({"service_date": service_date}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service config not found")
    
    config = await db.service_configs.find_one({"service_date": service_date}, {"_id": 0})
    return deserialize_datetime(config)


# ==================== BRIEFING GENERATION ENDPOINT ====================

@api_router.post("/generate-briefing", response_model=BriefingResponse)
async def generate_briefing(request: BriefingRequest):
    service_date = request.service_date
    
    # Fetch all relevant data for the service date
    reservations = await db.reservations.find(
        {"service_date": service_date, "status": "confirmed"}, 
        {"_id": 0}
    ).to_list(1000)
    
    schedules = await db.schedules.find(
        {"service_date": service_date}, 
        {"_id": 0}
    ).to_list(1000)
    
    service_config = await db.service_configs.find_one(
        {"service_date": service_date}, 
        {"_id": 0}
    )
    
    # Fetch guest details for reservations
    guest_ids = [r['guest_id'] for r in reservations]
    guests_data = {}
    if guest_ids:
        guests = await db.guests.find(
            {"id": {"$in": guest_ids}}, 
            {"_id": 0}
        ).to_list(1000)
        guests_data = {g['id']: g for g in guests}
    
    # Calculate metrics
    total_booked_covers = sum(r['party_size'] for r in reservations)
    walk_in_min = service_config.get('expected_walk_in_min', 0) if service_config else 0
    walk_in_max = service_config.get('expected_walk_in_max', 0) if service_config else 0
    total_expected_min = total_booked_covers + walk_in_min
    total_expected_max = total_booked_covers + walk_in_max
    
    total_scheduled_hours = sum(s['scheduled_hours'] for s in schedules)
    total_labor_cost = sum(s['scheduled_hours'] * s['hourly_rate'] for s in schedules)
    
    # Identify VIP/high-value guests
    vip_guests = []
    for reservation in reservations:
        guest_id = reservation['guest_id']
        if guest_id in guests_data:
            guest = guests_data[guest_id]
            if guest.get('vip_status') or guest.get('total_spend', 0) > 1000:
                vip_guests.append({
                    'name': guest['name'],
                    'party_size': reservation['party_size'],
                    'time': reservation['time'],
                    'vip_status': guest.get('vip_status', False),
                    'total_visits': guest.get('total_visits', 0),
                    'total_spend': guest.get('total_spend', 0),
                    'preferences': guest.get('preferences', ''),
                    'notes': reservation.get('notes', '')
                })
    
    # Group reservations by time to identify peak periods
    time_slots = {}
    for r in reservations:
        time_slot = r['time']
        if time_slot not in time_slots:
            time_slots[time_slot] = 0
        time_slots[time_slot] += r['party_size']
    
    peak_times = sorted(time_slots.items(), key=lambda x: x[1], reverse=True)[:3]
    
    # Build the prompt for the LLM
    system_prompt = """You are an experienced restaurant General Manager with 20+ years of operational experience in full-service and fine-dining restaurants.

Your job is to help restaurant operators make better real-time decisions by clearly explaining operational data in plain language.

You do NOT act like a data analyst or dashboard.
You do NOT list raw numbers without interpretation.

You:
• Think like an operator preparing for service
• Connect operational dots across sales, staffing, and guests
• Use cautious, realistic language (e.g., "likely," "suggests," "appears")
• Never invent data or assumptions not provided
• Never overstate certainty

If data is insufficient, say so clearly.
Your goal is clarity, context, and actionable insight — not prediction."""

    user_prompt = f"""You are generating a pre-shift operational briefing for a restaurant manager.

The data below includes:
• Tonight's reservations
• Expected walk-in range
• Staffing schedule and overtime risk
• Basic guest history and preferences

This briefing will be read quickly before service.
Assume the reader has NO time to interpret charts or tables.

SERVICE DATE: {service_date}

RESERVATIONS DATA:
- Total confirmed reservations: {len(reservations)}
- Total booked covers: {total_booked_covers}
- Expected walk-ins: {walk_in_min}-{walk_in_max}
- Total expected guest range: {total_expected_min}-{total_expected_max}

PEAK PERIODS:
{chr(10).join([f"- {time}: {covers} covers" for time, covers in peak_times]) if peak_times else "- No clear peak identified"}

STAFFING DATA:
- Total staff scheduled: {len(schedules)}
- Total scheduled hours: {total_scheduled_hours}
- Estimated labor cost: ${total_labor_cost:.2f}
Staff breakdown:
{chr(10).join([f"- {s['staff_name']} ({s['position']}): {s['shift_start']}-{s['shift_end']} ({s['scheduled_hours']}hrs @ ${s['hourly_rate']}/hr)" for s in schedules]) if schedules else "- No staff scheduled"}

VIP/HIGH-VALUE GUESTS:
{chr(10).join([f"- {g['name']} (Party of {g['party_size']}) at {g['time']} - {g['total_visits']} visits, ${g['total_spend']:.2f} lifetime spend{' - VIP' if g['vip_status'] else ''}{' - ' + g['preferences'] if g['preferences'] else ''}{' - Note: ' + g['notes'] if g['notes'] else ''}" for g in vip_guests]) if vip_guests else "- No VIP or high-value guests identified"}

Generate a concise operational story using the exact format below.

Rules:
• Do NOT use bullet points unless explicitly shown
• Do NOT include raw tables or JSON
• Do NOT exceed 250–300 words
• Use calm, confident, operator-friendly tone
• Avoid technical or analytical jargon

TITLE:
Tonight's Service Intelligence — {service_date}

SECTION 1 — HEADLINE
Write 1–2 sentences summarizing the most important operational takeaway for tonight.

SECTION 2 — WHAT TONIGHT LOOKS LIKE
Briefly explain:
• Booked covers
• Expected total guest range
• Peak periods

SECTION 3 — STAFFING INSIGHT
Explain whether staffing appears aligned or misaligned.
Mention overtime risk ONLY if relevant.
Frame recommendations as considerations, not commands.

SECTION 4 — GUEST HIGHLIGHTS
Mention ONLY guests that materially impact service or revenue.
Explain why they matter operationally.

SECTION 5 — SUGGESTED ACTIONS
List 2–3 clear, practical actions the manager could consider before or during service.
Phrase actions as suggestions, not instructions."""

    # Call OpenAI using emergentintegrations
    try:
        llm_api_key = os.environ['EMERGENT_LLM_KEY']
        
        chat = LlmChat(
            api_key=llm_api_key,
            session_id=f"briefing-{service_date}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=user_prompt)
        briefing_text = await chat.send_message(user_message)
        
        return BriefingResponse(
            service_date=service_date,
            briefing_text=briefing_text
        )
        
    except Exception as e:
        logging.error(f"Error generating briefing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating briefing: {str(e)}")


# ==================== ROOT ENDPOINT ====================

@api_router.get("/")
async def root():
    return {"message": "Restaurant Operations Briefing API"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
