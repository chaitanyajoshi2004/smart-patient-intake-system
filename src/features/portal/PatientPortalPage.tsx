import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { CalendarDays, FileText, HeartPulse, Pill, UserRound } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { patientApi } from "../../services/patientApi";

export function PatientPortalPage() {
  const [patientId, setPatientId] = useState<number | "">("");
  const patients = useQuery({ queryKey: ["portal-patients"], queryFn: () => patientApi.list({ page: 1, limit: 100 }) });
  const patient = useQuery({
    queryKey: ["portal-patient", patientId],
    queryFn: () => patientApi.details(Number(patientId)),
    enabled: patientId !== "",
  });

  const timeline = useMemo(() => {
    if (!patient.data) return [];
    return [
      ...patient.data.medical_history.map(item => ({ id: `history-${item.id}`, title: item.condition_name, date: item.diagnosed_date || item.created_at, detail: item.diagnosis || item.description || "Medical history" })),
      ...patient.data.visits.map(item => ({ id: `visit-${item.id}`, title: item.visit_type, date: item.visit_date, detail: item.status })),
      ...patient.data.vitals.map(item => ({ id: `vital-${item.id}`, title: "Vitals recorded", date: item.recorded_at, detail: `BP ${item.blood_pressure || "-"} · HR ${item.heart_rate || "-"}` })),
      ...patient.data.prescriptions.map(item => ({ id: `rx-${item.id}`, title: item.medicine_name, date: item.created_at, detail: item.dosage || "Prescription" })),
      ...patient.data.reports.map(item => ({ id: `report-${item.id}`, title: item.report_name, date: item.uploaded_at, detail: item.report_type })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [patient.data]);

  return (
    <Box>
      <PageHeader title="Patient Portal" subtitle="Patient health summary, visits, reports, prescriptions, and timeline" />
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Patient</InputLabel>
            <Select label="Patient" value={patientId} onChange={event => setPatientId(Number(event.target.value))}>
              {(patients.data?.data || []).map(item => (
                <MenuItem key={item.id} value={item.id}>{item.first_name} {item.last_name} · {item.patient_code}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {patient.isLoading && <LoadingSpinner />}
      {patient.data && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card><CardContent><Stack direction="row" spacing={2} alignItems="center"><UserRound /><Box><Typography variant="h6">{patient.data.first_name} {patient.data.last_name}</Typography><Typography color="text.secondary">{patient.data.phone}</Typography></Box></Stack></CardContent></Card>
          </Grid>
          {[
            ["Visits", patient.data.visits.length, CalendarDays],
            ["Medical History", patient.data.medical_history.length, HeartPulse],
            ["Vitals", patient.data.vitals.length, HeartPulse],
            ["Prescriptions", patient.data.prescriptions.length, Pill],
            ["Reports", patient.data.reports.length, FileText],
          ].map(([title, value, Icon]) => (
            <Grid key={String(title)} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card><CardContent><Stack direction="row" spacing={2} alignItems="center"><Icon /><Box><Typography color="text.secondary">{String(title)}</Typography><Typography variant="h5">{String(value)}</Typography></Box></Stack></CardContent></Card>
            </Grid>
          ))}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Health Summary</Typography><Typography>Blood group: {patient.data.blood_group || "-"}</Typography><Typography>Age: {patient.data.age || "-"}</Typography><Typography>Emergency contact: {patient.data.emergency_contact || "-"}</Typography></CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Timeline</Typography><Stack spacing={1.5}>{timeline.slice(0, 8).map(item => <Box key={item.id}><Typography fontWeight={700}>{item.title}</Typography><Typography color="text.secondary" variant="body2">{new Date(item.date).toLocaleString()} · {item.detail}</Typography></Box>)}</Stack></CardContent></Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
