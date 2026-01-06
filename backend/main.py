"""
SmartHostel FastAPI Backend
Connect this to your MySQL smarthostel database

Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy import text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
import enum
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:System123@localhost/smarthostel")
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

app = FastAPI(
    title="SmartHostel API",
    description="Backend API for SmartHostel Management System",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ENUMS ====================

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MESS_STAFF = "MESS_STAFF"
    STUDENT = "STUDENT"

class EmployeeRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MESS_STAFF = "MESS_STAFF"
    SECURITY = "SECURITY"
    WARDEN = "WARDEN"

class HostelType(str, enum.Enum):
    BOYS = "BOYS"
    GIRLS = "GIRLS"

class AttendanceType(str, enum.Enum):
    IN = "IN"
    OUT = "OUT"

class MealTime(str, enum.Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"

class DayOfWeek(str, enum.Enum):
    MON = "MON"
    TUE = "TUE"
    WED = "WED"
    THU = "THU"
    FRI = "FRI"
    SAT = "SAT"
    SUN = "SUN"


# ==================== MODELS ====================

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    name = Column(String(255))
    password = Column(String(255))
    role = Column(Enum(UserRole))
    room_number = Column(String(50), nullable=True)
    employee_ssn = Column(String(50), nullable=True)
    student_id = Column(String(50), nullable=True)

class Student(Base):
    __tablename__ = "student"
    studentid = Column(String(50), primary_key=True)
    first_name = Column(String(100))
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100))
    hostel_no = Column(Integer)
    room_no = Column(String(50))

class Employee(Base):
    __tablename__ = "employees"
    ssn = Column(String(50), primary_key=True)
    first_name = Column(String(100))
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100))
    role = Column(Enum(EmployeeRole))

class Hostel(Base):
    __tablename__ = "hostels"
    hostel_no = Column(Integer, primary_key=True)
    hostel_name = Column(String(255))
    total_floors = Column(Integer)
    total_rooms = Column(Integer)
    type = Column(Enum(HostelType))

class Room(Base):
    __tablename__ = "room"
    room_no = Column(String(50), primary_key=True)
    capacity = Column(Integer)
    floor = Column(Integer)
    hostel_no = Column(Integer, ForeignKey("hostels.hostel_no"))

class RoomAssignment(Base):
    __tablename__ = "roomassignedto"
    id = Column(Integer, primary_key=True)
    assigned_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    room_no = Column(String(50), ForeignKey("room.room_no"))
    studentid = Column(String(50), ForeignKey("student.studentid"))

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, autoincrement=True)
    location = Column(String(255))
    time_stamp = Column(DateTime, default=datetime.utcnow)
    type = Column(Enum(AttendanceType))
    studentid = Column(String(50), ForeignKey("student.studentid"))
    employeessn = Column(String(50), ForeignKey("employees.ssn"), nullable=True)

class MealChoice(Base):
    __tablename__ = "choice"
    optid = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(DateTime)
    meal_time = Column(Enum(MealTime))
    opted_out = Column(Boolean, default=False)
    studentid = Column(String(50), ForeignKey("student.studentid"))

class MealMenu(Base):
    __tablename__ = "mealmenu"
    poolid = Column(Integer, primary_key=True)
    category = Column(String(100))
    day = Column(Enum(DayOfWeek))
    meal_time = Column(Enum(MealTime))
    menu_item = Column(String(255))

class StudentPhoneNo(Base):
    __tablename__ = "studentphoneno"
    id = Column(Integer, primary_key=True)
    is_primary = Column(Boolean, default=False)
    phone_no = Column(String(20))
    studentid = Column(String(50), ForeignKey("student.studentid"))


# ==================== SCHEMAS ====================

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    room_number: Optional[str]
    employee_ssn: Optional[str]
    student_id: Optional[str]

class AttendanceCreate(BaseModel):
    location: str
    type: AttendanceType
    studentid: str
    employeessn: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: int
    location: str
    time_stamp: datetime
    type: str
    studentid: str
    employeessn: Optional[str]

class MealChoiceCreate(BaseModel):
    date: str
    meal_time: MealTime
    opted_out: bool
    studentid: str

class AnalyticsResponse(BaseModel):
    attendance: dict
    mealOptout: dict
    hostelOccupancy: dict


# ==================== DEPENDENCIES ====================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


# ==================== AUTH ROUTES ====================

@app.post("/api/auth/login", response_model=Token)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "room_number": user.room_number,
            "employee_ssn": user.employee_ssn,
            "student_id": user.student_id
        }
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role.value,
        "room_number": current_user.room_number,
        "employee_ssn": current_user.employee_ssn,
        "student_id": current_user.student_id
    }


# ==================== STUDENT ROUTES ====================

@app.get("/api/students")
async def get_students(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    students = db.query(Student).all()
    return [{"studentid": s.studentid, "first_name": s.first_name, "middle_name": s.middle_name, 
             "last_name": s.last_name, "hostel_no": s.hostel_no, "room_no": s.room_no} for s in students]

@app.get("/api/students/{student_id}")
async def get_student(student_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.studentid == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"studentid": student.studentid, "first_name": student.first_name, 
            "middle_name": student.middle_name, "last_name": student.last_name,
            "hostel_no": student.hostel_no, "room_no": student.room_no}


# ==================== ATTENDANCE ROUTES ====================

@app.get("/api/attendance")
async def get_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(Attendance).order_by(Attendance.time_stamp.desc()).limit(100).all()
    return [{"id": r.id, "location": r.location, "time_stamp": r.time_stamp.isoformat(),
             "type": r.type.value, "studentid": r.studentid, "employeessn": r.employeessn} for r in records]

@app.post("/api/attendance")
async def mark_attendance(data: AttendanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attendance = Attendance(
        location=data.location,
        type=data.type,
        studentid=data.studentid,
        employeessn=data.employeessn,
        time_stamp=datetime.utcnow()
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return {"id": attendance.id, "location": attendance.location, 
            "time_stamp": attendance.time_stamp.isoformat(),
            "type": attendance.type.value, "studentid": attendance.studentid}




# ==================== MEAL ROUTES ====================

@app.get("/api/mealmenu")
async def get_menu(day: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MealMenu)
    if day:
        query = query.filter(MealMenu.day == day)
    items = query.all()
    return [{"poolid": m.poolid, "category": m.category, "day": m.day.value,
             "meal_time": m.meal_time.value, "menu_item": m.menu_item} for m in items]

@app.get("/api/choice")
async def get_choices(studentid: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(MealChoice)
    if studentid:
        query = query.filter(MealChoice.studentid == studentid)
    choices = query.order_by(MealChoice.date.desc()).limit(50).all()
    return [{"optid": c.optid, "date": c.date.isoformat(), "meal_time": c.meal_time.value,
             "opted_out": c.opted_out, "studentid": c.studentid} for c in choices]

@app.post("/api/choice")
async def opt_out_meal(data: MealChoiceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    choice = MealChoice(
        date=datetime.fromisoformat(data.date),
        meal_time=data.meal_time,
        opted_out=data.opted_out,
        studentid=data.studentid
    )
    db.add(choice)
    db.commit()
    db.refresh(choice)
    return {"optid": choice.optid, "date": choice.date.isoformat(),
            "meal_time": choice.meal_time.value, "opted_out": choice.opted_out}


# ==================== ADMIN ROUTES ====================

@app.get("/api/employees")
async def get_employees(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    employees = db.query(Employee).all()
    return [{"ssn": e.ssn, "first_name": e.first_name, "middle_name": e.middle_name,
             "last_name": e.last_name, "role": e.role.value} for e in employees]

@app.get("/api/rooms")
async def get_rooms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rooms = db.query(Room).all()
    return [{"room_no": r.room_no, "capacity": r.capacity, "floor": r.floor,
             "hostel_no": r.hostel_no} for r in rooms]

@app.get("/api/hostels")
async def get_hostels(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    hostels = db.query(Hostel).all()
    return [{"hostel_no": h.hostel_no, "hostel_name": h.hostel_name,
             "total_floors": h.total_floors, "total_rooms": h.total_rooms,
             "type": h.type.value} for h in hostels]

@app.get("/api/analytics", response_model=AnalyticsResponse)
async def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    today = datetime.utcnow().date()

    # -------- Attendance --------
    total_students = db.query(Student).count()

    present_today = db.query(Attendance).filter(
        Attendance.time_stamp >= datetime.combine(today, datetime.min.time()),
        Attendance.type == AttendanceType.IN
    ).distinct(Attendance.studentid).count()

    present_pct = (present_today / total_students * 100) if total_students else 0
    absent_pct = 100 - present_pct

    # -------- Meal Opt-out --------
    choices = db.query(MealChoice).filter(
        MealChoice.date >= datetime.combine(today, datetime.min.time()),
        MealChoice.opted_out == True
    ).all()

    breakfast = len([c for c in choices if c.meal_time == MealTime.BREAKFAST])
    lunch = len([c for c in choices if c.meal_time == MealTime.LUNCH])
    dinner = len([c for c in choices if c.meal_time == MealTime.DINNER])

    # -------- Hostel Occupancy --------
    boys_total = db.execute(text("""
        SELECT COUNT(*) FROM room r
        JOIN hostels h ON r.hostel_no = h.hostel_no
        WHERE h.type = 'BOYS'
    """)).scalar()

    girls_total = db.execute(text("""
        SELECT COUNT(*) FROM room r
        JOIN hostels h ON r.hostel_no = h.hostel_no
        WHERE h.type = 'GIRLS'
    """)).scalar()

    boys_occupied = db.execute(text("""
        SELECT COUNT(DISTINCT r.room_no) FROM roomassignedto ra
        JOIN room r ON ra.room_no = r.room_no
        JOIN hostels h ON r.hostel_no = h.hostel_no
        WHERE ra.is_active = 1 AND h.type = 'BOYS'
    """)).scalar()

    girls_occupied = db.execute(text("""
        SELECT COUNT(DISTINCT r.room_no) FROM roomassignedto ra
        JOIN room r ON ra.room_no = r.room_no
        JOIN hostels h ON r.hostel_no = h.hostel_no
        WHERE ra.is_active = 1 AND h.type = 'GIRLS'
    """)).scalar()

    boys_pct = (boys_occupied / boys_total * 100) if boys_total else 0
    girls_pct = (girls_occupied / girls_total * 100) if girls_total else 0

    return {
        "attendance": {
            "present": round(present_pct),
            "absent": round(absent_pct)
        },
        "mealOptout": {
            "breakfast": round(breakfast),
            "lunch": round(lunch),
            "dinner": round(dinner)
        },
        "hostelOccupancy": {
            "boys": round(boys_pct),
            "girls": round(girls_pct)
        }
    }


# ==================== HEALTH CHECK ====================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
