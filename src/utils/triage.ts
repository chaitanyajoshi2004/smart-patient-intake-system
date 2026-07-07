import type { Department, Urgency } from "../types/patient";

const URGENT_KEYWORDS = ["chest pain", "shortness of breath", "stroke", "seizure", "severe bleeding"];
const PRIORITY_KEYWORDS = ["fever", "dizziness", "blurred vision", "allergy", "persistent pain"];

export function predictUrgency(symptoms: string): Urgency {
  const normalized = symptoms.toLowerCase();

  if (URGENT_KEYWORDS.some(keyword => normalized.includes(keyword))) {
    return "urgent";
  }

  if (PRIORITY_KEYWORDS.some(keyword => normalized.includes(keyword))) {
    return "priority";
  }

  return "routine";
}

export function suggestDepartment(symptoms: string): Department {
  const normalized = symptoms.toLowerCase();

  if (normalized.includes("chest") || normalized.includes("heart")) return "Cardiology";
  if (normalized.includes("headache") || normalized.includes("vision") || normalized.includes("seizure")) return "Neurology";
  if (normalized.includes("bone") || normalized.includes("back") || normalized.includes("joint")) return "Orthopedics";
  if (normalized.includes("rash") || normalized.includes("skin")) return "Dermatology";
  if (normalized.includes("ear") || normalized.includes("throat") || normalized.includes("hearing")) return "ENT";
  if (normalized.includes("child") || normalized.includes("pediatric")) return "Pediatrics";

  return predictUrgency(symptoms) === "urgent" ? "Emergency" : "General";
}
