export type TriageUrgency = "Routine" | "Priority" | "Urgent";
export type TriageSeverity = "low" | "medium" | "high" | "critical";

export interface TriageResult {
  urgency: TriageUrgency;
  department: string;
  confidence: number;
  recommendation: string;
  riskScore: number;
  severity: TriageSeverity;
}

interface TriageRule {
  keywords: string[];
  urgency: TriageUrgency;
  department: string;
  severity: TriageSeverity;
  riskScore: number;
  recommendation: string;
}

const rules: TriageRule[] = [
  {
    keywords: ["chest pain", "shortness of breath", "radiating pain", "heart attack", "pressure in chest"],
    urgency: "Urgent",
    department: "Cardiology",
    severity: "critical",
    riskScore: 95,
    recommendation: "Move patient to urgent clinical review and capture vitals immediately.",
  },
  {
    keywords: ["stroke", "seizure", "facial droop", "weakness", "loss of consciousness", "severe headache"],
    urgency: "Urgent",
    department: "Neurology",
    severity: "critical",
    riskScore: 92,
    recommendation: "Escalate for emergency neurological assessment and document onset time.",
  },
  {
    keywords: ["fever", "cold", "cough", "infection", "sore throat", "body ache"],
    urgency: "Priority",
    department: "General Medicine",
    severity: "medium",
    riskScore: 58,
    recommendation: "Prioritize consultation, record temperature, oxygen level, and symptom duration.",
  },
  {
    keywords: ["fracture", "sprain", "bone pain", "joint pain", "fall injury", "swelling"],
    urgency: "Priority",
    department: "Orthopedics",
    severity: "medium",
    riskScore: 62,
    recommendation: "Route to orthopedic assessment and limit movement of the affected area.",
  },
  {
    keywords: ["skin rash", "rash", "itching", "acne", "lesion", "allergy"],
    urgency: "Routine",
    department: "Dermatology",
    severity: "low",
    riskScore: 28,
    recommendation: "Schedule routine dermatology review and note exposure or allergy history.",
  },
];

export function analyzeSymptoms(symptoms: string): TriageResult {
  const normalized = symptoms.toLowerCase();
  const matched = rules
    .map(rule => ({ rule, matches: rule.keywords.filter(keyword => normalized.includes(keyword)) }))
    .filter(item => item.matches.length > 0)
    .sort((a, b) => b.rule.riskScore + b.matches.length * 8 - (a.rule.riskScore + a.matches.length * 8))[0];

  if (!matched) {
    return {
      urgency: "Routine",
      department: "General Medicine",
      confidence: symptoms.trim().length > 10 ? 54 : 35,
      recommendation: "Complete registration and route to general clinical screening.",
      riskScore: symptoms.trim().length > 10 ? 35 : 18,
      severity: "low",
    };
  }

  return {
    urgency: matched.rule.urgency,
    department: matched.rule.department,
    confidence: Math.min(98, 70 + matched.matches.length * 9),
    recommendation: matched.rule.recommendation,
    riskScore: matched.rule.riskScore,
    severity: matched.rule.severity,
  };
}

export function predictUrgency(symptoms: string) {
  return analyzeSymptoms(symptoms).urgency.toLowerCase();
}

export function suggestDepartment(symptoms: string) {
  return analyzeSymptoms(symptoms).department;
}
