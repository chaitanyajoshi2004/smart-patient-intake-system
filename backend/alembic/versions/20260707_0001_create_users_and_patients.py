"""initial healthcare database

Revision ID: 20260707_0001
Revises:
Create Date: 2026-07-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260707_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    bind = op.get_bind()

    user_role = postgresql.ENUM(
        "admin",
        "doctor",
        "nurse",
        "staff",
        name="user_role",
        create_type=False
    )

    visit_status = postgresql.ENUM(
        "scheduled",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        name="visit_status",
         create_type=False
    )

    severity_level = postgresql.ENUM(
        "low",
        "medium",
        "high",
        "critical",
        name="severity_level",
         create_type=False
    )

    user_role.create(bind, checkfirst=True)
    visit_status.create(bind, checkfirst=True)
    severity_level.create(bind, checkfirst=True)
    op.execute(sa.text("CREATE SEQUENCE IF NOT EXISTS patient_code_seq START WITH 1 INCREMENT BY 1"))

    op.create_table(
    "users",
    sa.Column("id", sa.Integer(), nullable=False),
    sa.Column("full_name", sa.String(length=120), nullable=False),
    sa.Column("email", sa.String(length=255), nullable=False),
    sa.Column("password_hash", sa.String(length=255), nullable=False),

    sa.Column(
        "role",
        user_role,
        nullable=False
    ),

    sa.Column("phone", sa.String(length=40), nullable=True),
    sa.Column("profile_image", sa.String(length=500), nullable=True),
    sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),

    sa.PrimaryKeyConstraint("id"),
)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "patient_code",
            sa.String(length=20),
            server_default=sa.text("'PT-' || lpad(nextval('patient_code_seq')::text, 6, '0')"),
            nullable=False,
        ),
        sa.Column("first_name", sa.String(length=80), nullable=False),
        sa.Column("last_name", sa.String(length=80), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("gender", sa.String(length=30), nullable=False),
        sa.Column("blood_group", sa.String(length=10), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("emergency_contact", sa.String(length=120), nullable=True),
        sa.Column("profile_image", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("patient_code"),
    )
    op.create_index(op.f("ix_patients_email"), "patients", ["email"], unique=False)
    op.create_index(op.f("ix_patients_first_name"), "patients", ["first_name"], unique=False)
    op.create_index(op.f("ix_patients_id"), "patients", ["id"], unique=False)
    op.create_index(op.f("ix_patients_last_name"), "patients", ["last_name"], unique=False)
    op.create_index(op.f("ix_patients_patient_code"), "patients", ["patient_code"], unique=True)
    op.create_index(op.f("ix_patients_phone"), "patients", ["phone"], unique=False)

    op.create_table(
        "clinic_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("clinic_name", sa.String(length=160), nullable=False),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("logo", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_clinic_settings_id"), "clinic_settings", ["id"], unique=False)

    op.create_table(
        "medical_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("condition_name", sa.String(length=160), nullable=False),
        sa.Column("diagnosis", sa.String(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("diagnosed_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_medical_history_id"), "medical_history", ["id"], unique=False)
    op.create_index(op.f("ix_medical_history_patient_id"), "medical_history", ["patient_id"], unique=False)

    op.create_table(
        "visits",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("doctor_id", sa.Integer(), nullable=True),
        sa.Column("visit_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("visit_type", sa.String(length=80), nullable=False),
        sa.Column("reason", sa.String(length=255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", visit_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["doctor_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_visits_doctor_id"), "visits", ["doctor_id"], unique=False)
    op.create_index(op.f("ix_visits_id"), "visits", ["id"], unique=False)
    op.create_index(op.f("ix_visits_patient_id"), "visits", ["patient_id"], unique=False)

    op.create_table(
        "ai_triage",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("symptoms", sa.Text(), nullable=False),
        sa.Column("severity_level", severity_level, nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=True),
        sa.Column("ai_prediction", sa.Text(), nullable=True),
        sa.Column("recommendation", sa.Text(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ai_triage_id"), "ai_triage", ["id"], unique=False)
    op.create_index(op.f("ix_ai_triage_patient_id"), "ai_triage", ["patient_id"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("entity", sa.String(length=120), nullable=False),
        sa.Column("entity_id", sa.String(length=80), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_logs_id"), "audit_logs", ["id"], unique=False)
    op.create_index(op.f("ix_audit_logs_user_id"), "audit_logs", ["user_id"], unique=False)

    op.create_table(
        "medical_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("uploaded_by", sa.Integer(), nullable=True),
        sa.Column("report_name", sa.String(length=160), nullable=False),
        sa.Column("report_type", sa.String(length=80), nullable=False),
        sa.Column("file_path", sa.String(length=500), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["uploaded_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_medical_reports_id"), "medical_reports", ["id"], unique=False)
    op.create_index(op.f("ix_medical_reports_patient_id"), "medical_reports", ["patient_id"], unique=False)
    op.create_index(op.f("ix_medical_reports_uploaded_by"), "medical_reports", ["uploaded_by"], unique=False)

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("notification_type", sa.String(length=60), nullable=False),
        sa.Column("is_read", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notifications_id"), "notifications", ["id"], unique=False)
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"], unique=False)

    op.create_table(
        "prescriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("doctor_id", sa.Integer(), nullable=True),
        sa.Column("visit_id", sa.Integer(), nullable=True),
        sa.Column("medicine_name", sa.String(length=160), nullable=False),
        sa.Column("dosage", sa.String(length=80), nullable=True),
        sa.Column("frequency", sa.String(length=80), nullable=True),
        sa.Column("duration", sa.String(length=80), nullable=True),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["doctor_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["visit_id"], ["visits.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_prescriptions_doctor_id"), "prescriptions", ["doctor_id"], unique=False)
    op.create_index(op.f("ix_prescriptions_id"), "prescriptions", ["id"], unique=False)
    op.create_index(op.f("ix_prescriptions_patient_id"), "prescriptions", ["patient_id"], unique=False)
    op.create_index(op.f("ix_prescriptions_visit_id"), "prescriptions", ["visit_id"], unique=False)

    op.create_table(
        "vitals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("visit_id", sa.Integer(), nullable=True),
        sa.Column("height", sa.Float(), nullable=True),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.Column("bmi", sa.Float(), nullable=True),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("blood_pressure", sa.String(length=30), nullable=True),
        sa.Column("heart_rate", sa.Integer(), nullable=True),
        sa.Column("oxygen_level", sa.Float(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["visit_id"], ["visits.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vitals_id"), "vitals", ["id"], unique=False)
    op.create_index(op.f("ix_vitals_patient_id"), "vitals", ["patient_id"], unique=False)
    op.create_index(op.f("ix_vitals_visit_id"), "vitals", ["visit_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_vitals_visit_id"), table_name="vitals")
    op.drop_index(op.f("ix_vitals_patient_id"), table_name="vitals")
    op.drop_index(op.f("ix_vitals_id"), table_name="vitals")
    op.drop_table("vitals")

    op.drop_index(op.f("ix_prescriptions_visit_id"), table_name="prescriptions")
    op.drop_index(op.f("ix_prescriptions_patient_id"), table_name="prescriptions")
    op.drop_index(op.f("ix_prescriptions_id"), table_name="prescriptions")
    op.drop_index(op.f("ix_prescriptions_doctor_id"), table_name="prescriptions")
    op.drop_table("prescriptions")

    op.drop_index(op.f("ix_notifications_user_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_id"), table_name="notifications")
    op.drop_table("notifications")

    op.drop_index(op.f("ix_medical_reports_uploaded_by"), table_name="medical_reports")
    op.drop_index(op.f("ix_medical_reports_patient_id"), table_name="medical_reports")
    op.drop_index(op.f("ix_medical_reports_id"), table_name="medical_reports")
    op.drop_table("medical_reports")

    op.drop_index(op.f("ix_audit_logs_user_id"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_id"), table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index(op.f("ix_ai_triage_patient_id"), table_name="ai_triage")
    op.drop_index(op.f("ix_ai_triage_id"), table_name="ai_triage")
    op.drop_table("ai_triage")

    op.drop_index(op.f("ix_visits_patient_id"), table_name="visits")
    op.drop_index(op.f("ix_visits_id"), table_name="visits")
    op.drop_index(op.f("ix_visits_doctor_id"), table_name="visits")
    op.drop_table("visits")

    op.drop_index(op.f("ix_medical_history_patient_id"), table_name="medical_history")
    op.drop_index(op.f("ix_medical_history_id"), table_name="medical_history")
    op.drop_table("medical_history")

    op.drop_index(op.f("ix_clinic_settings_id"), table_name="clinic_settings")
    op.drop_table("clinic_settings")

    op.drop_index(op.f("ix_patients_phone"), table_name="patients")
    op.drop_index(op.f("ix_patients_patient_code"), table_name="patients")
    op.drop_index(op.f("ix_patients_last_name"), table_name="patients")
    op.drop_index(op.f("ix_patients_id"), table_name="patients")
    op.drop_index(op.f("ix_patients_first_name"), table_name="patients")
    op.drop_index(op.f("ix_patients_email"), table_name="patients")
    op.drop_table("patients")

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    op.execute(sa.text("DROP SEQUENCE IF EXISTS patient_code_seq"))

    bind = op.get_bind()

    postgresql.ENUM(
        name="severity_level"
    ).drop(bind, checkfirst=True)

    postgresql.ENUM(
        name="visit_status"
    ).drop(bind, checkfirst=True)

    postgresql.ENUM(
        name="user_role"
    ).drop(bind, checkfirst=True)