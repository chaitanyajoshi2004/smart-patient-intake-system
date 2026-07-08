# 🏥 Smart Patient Intake System

> A modern enterprise-grade Hospital Management and Smart Patient Intake System built using **React**, **FastAPI**, and **PostgreSQL**, featuring AI-assisted patient triage, patient management, analytics, and secure role-based access.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![Material UI](https://img.shields.io/badge/Material_UI-MUI-007FFF?logo=mui)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

# 📖 Overview

The **Smart Patient Intake System** is an enterprise-level healthcare application designed to streamline patient registration, AI-assisted triage, medical records management, clinical workflows, and hospital administration.

The system enables receptionists, doctors, staff, and administrators to efficiently manage patient information through a secure, responsive, and modern web application.

---

# ✨ Features

## 🔐 Authentication

- JWT Authentication
- Role-Based Access Control (RBAC)
- Protected Routes
- Secure Login / Logout
- Axios Authorization Interceptors

---

## 👨‍⚕️ Patient Management

- Register Patient
- Edit Patient
- Delete Patient
- Search Patients
- Patient Profile
- Patient Timeline
- Patient Details

Patient Registration includes:

- Full Name
- Age
- Gender
- Contact Number
- Symptoms / Notes

---

## 🤖 AI-Assisted Patient Triage

A built-in rule-based AI engine analyzes patient symptoms and automatically suggests:

- Urgency Level
  - Routine
  - Priority
  - Urgent

- Recommended Department

Examples:

- Cardiology
- Neurology
- General Medicine
- Pulmonology
- Orthopedics
- Gastroenterology
- Dermatology
- Emergency
- Psychiatry
- ENT
- Dental
- Gynecology
- Ophthalmology

Receptionists can:

- Review AI recommendations
- Accept suggestions
- Override urgency
- Change department
- Save the final decision

---

## 🏥 Medical Modules

### Patients

- Patient List
- Search
- Filters
- Pagination
- Patient Details

### Visits

- Today's Visits
- Scheduled Visits
- Completed Visits
- Visit Details

### Medical History

- Timeline View
- History Records
- Patient-wise History

### Vitals

- View Patient Vitals
- BMI Calculation
- Trend Graph UI

### Prescriptions

- Medication List
- Prescription Table
- Printable View

### Reports

- Medical Reports
- Report Viewer
- Download Support

---

# 📊 Dashboard

Professional hospital dashboard including:

- Total Patients
- Today's Visits
- Active Visits
- Completed Visits
- Dashboard Charts
- Patient Statistics
- Visit Analytics
- Recent Activity
- Quick Actions

---

# 📈 Analytics

- Patient Growth
- Visit Trends
- Age Distribution
- Gender Distribution
- AI Triage Statistics

---

# 🔍 Global Search

Search across:

- Patients
- Visits
- Reports
- Prescriptions

Keyboard Shortcut:

```
Ctrl + K
```

---

# 🎨 Enterprise User Interface

- Responsive Layout
- Material UI
- Collapsible Sidebar
- Sticky Navbar
- Live Date & Time
- Dark / Light Theme
- Notification Panel
- Breadcrumb Navigation
- Responsive Mobile Drawer
- Profile Menu
- Fullscreen Mode

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Material UI
- React Router
- React Query
- Axios
- React Hot Toast
- Framer Motion
- Day.js

---

## Backend

- FastAPI
- SQLAlchemy
- JWT Authentication
- Pydantic
- REST APIs

---

## Database

- PostgreSQL
- Supabase PostgreSQL (Compatible)

---

## Documentation

- Swagger / OpenAPI

---

# 📂 Project Structure

```text
smart-patient-intake-system/

├── backend/
│   ├── app/
│   ├── routers/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   ├── database.py
│   ├── config.py
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── theme/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-patient-intake-system.git

cd smart-patient-intake-system
```

---

# Backend Setup

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Windows

```bash
.venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn app.main:app --reload
```

Backend runs at

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# Environment Variables

Frontend

```env
VITE_API_BASE_URL=http://localhost:8000
```

Backend

```env
DATABASE_URL=postgresql://username:password@host:5432/database

SECRET_KEY=your-secret-key

ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

# Current Status

| Module | Status |
|---------|--------|
| Authentication | ✅ Complete |
| Patient Registration | ✅ Complete |
| AI Triage | ✅ Complete |
| Visits | ✅ Complete |
| Medical History | ✅ Complete |
| Dashboard | ✅ Complete |
| Analytics | ✅ Complete |
| Search | ✅ Complete |
| Reports | ✅ Complete |
| Responsive UI | ✅ Complete |
| Settings | ✅ Complete |
| Notifications UI | ✅ Complete |

---

# Future Enhancements

- Patient Portal
- Doctor Dashboard
- Staff Dashboard
- Billing Module
- Pharmacy Module
- Laboratory Module
- Inventory Management
- OCR for Medical Reports
- OpenAI / LLM Integration
- SMS & Email Notifications
- Appointment Scheduling
- Telemedicine
- Redis Caching
- Docker Deployment
- Kubernetes
- CI/CD Pipeline
- FHIR / HL7 Integration
- Mobile Application
- Progressive Web App (PWA)

---

# API Documentation

Swagger UI

```
http://localhost:8000/docs
```

---

# Screenshots

Add screenshots in the `docs/screenshots` folder.

Suggested screenshots:

- Login
- Dashboard
- Patients
- Registration
- AI Triage
- Visits
- Medical History
- Analytics
- Reports

---

# License

This project is licensed under the **MIT License**.

---

# Developer

**Smart Patient Intake System**

Developed using:

- React
- TypeScript
- FastAPI
- PostgreSQL
- Material UI

Enterprise Hospital Management System with AI-Assisted Patient Intake.
