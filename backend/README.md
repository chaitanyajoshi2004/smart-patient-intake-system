# Smart Patient Intake Backend

Production-style FastAPI database foundation for the Smart Patient Intake System.

## Stack

- Python 3.11+
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- Alembic migrations
- Pydantic schemas
- JWT authentication
- bcrypt password hashing

## Installation

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

## PostgreSQL Setup

The migration error `connection refused ... localhost:5432` means PostgreSQL is not running or not listening on port `5432`.

Option A, with Docker:

```bash
docker compose up -d postgres
```

This starts PostgreSQL on port `5432` and creates `smart_patient_intake_db`.

Option B, with a local PostgreSQL installation:

Create the database:

```sql
CREATE DATABASE smart_patient_intake_db;
```

On Windows, start PostgreSQL from Services or run the PostgreSQL installer if it is not installed. Then verify the server is reachable:

```bash
psql -h localhost -U postgres -d postgres
```

Configure environment variables in `.env`:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/smart_patient_intake_db
SECRET_KEY=replace-with-a-long-random-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Migrations

Apply the included initial migration:

```bash
alembic upgrade head
```

For future schema changes:

```bash
alembic revision --autogenerate -m "initial healthcare database"
alembic upgrade head
```

## Seed Data

Insert starter users, sample patients, and connected clinical records:

```bash
python scripts/seed.py
```

Default admin:

```text
Email: admin@test.com
Password: password123
Role: admin
```

## Tests

```bash
python -m pytest -p no:cacheprovider
```

## Run API

```bash
uvicorn app.main:app --reload
```

Swagger docs:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Database Structure

- `users`: staff authentication and role management
- `patients`: patient demographics with generated `PT-000001` style patient codes
- `medical_history`: patient diagnosis and condition history
- `visits`: appointments and encounters linked to patients and doctors
- `vitals`: height, weight, BMI, temperature, blood pressure, heart rate, oxygen level
- `prescriptions`: medicines linked to patient, doctor, and visit
- `ai_triage`: AI symptom analysis, severity, risk score, prediction, recommendation
- `medical_reports`: uploaded lab reports, PDFs, images, and documents
- `notifications`: user notifications
- `clinic_settings`: clinic identity and contact configuration
- `audit_logs`: healthcare activity tracking

## API Modules

- `/auth`
- `/patients`
- `/visits`
- `/medical-history`
- `/vitals`
- `/prescriptions`
- `/triage`
- `/reports`
- `/analytics`
- `/settings`

Patient APIs are implemented and protected by JWT. The additional routers are registered and ready for module-specific CRUD implementation.

## Swagger Test Examples

Register:

```json
{
  "full_name": "Dr John",
  "email": "doctor@test.com",
  "password": "password123",
  "role": "doctor",
  "phone": "9999999999"
}
```

Login:

```json
{
  "email": "doctor@test.com",
  "password": "password123"
}
```

Create patient:

```json
{
  "first_name": "Rahul",
  "last_name": "Sharma",
  "date_of_birth": "1992-01-05",
  "gender": "Male",
  "blood_group": "O+",
  "phone": "9999999999",
  "email": "rahul@example.com",
  "address": "Pune",
  "emergency_contact": "8888888888"
}
```

Create patient history at `/patients/{patient_id}/history`:

```json
{
  "condition_name": "Hypertension",
  "diagnosis": "Stage 1 hypertension",
  "description": "Requires routine blood pressure monitoring.",
  "diagnosed_date": "2025-01-15"
}
```

Create visit:

```json
{
  "patient_id": 1,
  "doctor_id": 2,
  "visit_date": "2026-07-07T10:30:00Z",
  "visit_type": "Consultation",
  "reason": "Follow-up review",
  "notes": "Patient reports improvement.",
  "status": "scheduled"
}
```

## Validation Checklist

After PostgreSQL is running:

```bash
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload
```

Then verify:

- PostgreSQL connection works
- All tables are created
- Foreign keys are present
- Relationships load through SQLAlchemy
- Seed data is inserted
- Swagger docs include all registered API modules
