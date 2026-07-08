import { Chip } from "@mui/material";

export function StatusChip({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const color =
    normalized.includes("critical") || normalized.includes("cancelled") ? "error" :
    normalized.includes("completed") || normalized.includes("low") ? "success" :
    normalized.includes("progress") || normalized.includes("scheduled") ? "primary" :
    normalized.includes("medium") || normalized.includes("checked") ? "warning" :
    "default";

  return <Chip size="small" color={color} label={value.replaceAll("_", " ")} />;
}
