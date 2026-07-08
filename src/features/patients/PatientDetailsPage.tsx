import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useParams } from "react-router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorState } from "../../components/common/ErrorState";
import { patientApi } from "../../services/patientApi";
import type { MedicalHistoryPayload } from "../../types/api";

export function PatientDetailsPage() {
  const patientId = Number(useParams().patientId);
  const [tab, setTab] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<MedicalHistoryPayload>();

  const query = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientApi.details(patientId),
    enabled: Number.isFinite(patientId),
  });

  const historyMutation = useMutation({
    mutationFn: (payload: MedicalHistoryPayload) => patientApi.addHistory(patientId, payload),
    onSuccess: () => {
      toast.success("History added");
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      setHistoryOpen(false);
      reset();
    },
  });

  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError || !query.data) return <ErrorState message="Unable to load patient." onRetry={() => query.refetch()} />;

  const patient = query.data;

  return (
    <Box>
      <PageHeader title={`${patient.first_name} ${patient.last_name}`} subtitle={`${patient.patient_code} · ${patient.phone}`} actionLabel="Add History" onAction={() => setHistoryOpen(true)} />
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            {[
              ["Date of Birth", patient.date_of_birth],
              ["Age", patient.age ?? "-"],
              ["Gender", patient.gender],
              ["Blood Group", patient.blood_group || "-"],
              ["Email", patient.email || "-"],
              ["Emergency Contact", patient.emergency_contact || "-"],
              ["Address", patient.address || "-"],
            ].map(([label, value]) => (
              <Grid key={label} size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography color="text.secondary" variant="body2">{label}</Typography>
                <Typography fontWeight={700}>{value}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label="Overview" />
          <Tab label="Medical History" />
          <Tab label="Vitals" />
          <Tab label="Visits" />
          <Tab label="Prescriptions" />
          <Tab label="Reports" />
          <Tab label="Timeline" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <Grid container spacing={2}>
              {[["History Records", patient.medical_history.length], ["Vitals", patient.vitals.length], ["Visits", patient.visits.length], ["Prescriptions", patient.prescriptions.length], ["Reports", patient.reports.length]].map(([label, value]) => (
                <Grid key={label} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined"><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h5">{value}</Typography></CardContent></Card>
                </Grid>
              ))}
            </Grid>
          )}
          {tab === 1 && (
            <Stack spacing={2}>
              {patient.medical_history.length === 0 ? <Typography color="text.secondary">No history recorded.</Typography> : patient.medical_history.map(item => (
                <Box key={item.id} sx={{ borderLeft: 3, borderColor: "primary.main", pl: 2 }}>
                  <Typography fontWeight={700}>{item.condition_name}</Typography>
                  <Typography color="text.secondary">{item.diagnosis || "No diagnosis"}</Typography>
                  <Typography variant="body2">{item.description}</Typography>
                </Box>
              ))}
            </Stack>
          )}
          {tab === 2 && (
            <Stack spacing={1.5}>
              {patient.vitals.length === 0 ? <Typography color="text.secondary">No vitals recorded.</Typography> : patient.vitals.map(vital => (
                <Box key={vital.id}>
                  <Typography fontWeight={700}>{new Date(vital.recorded_at).toLocaleString()}</Typography>
                  <Typography color="text.secondary">BP {vital.blood_pressure || "-"} · HR {vital.heart_rate || "-"} · BMI {vital.bmi || "-"}</Typography>
                  <Typography variant="body2">Temp {vital.temperature || "-"} · Oxygen {vital.oxygen_level || "-"}</Typography>
                </Box>
              ))}
            </Stack>
          )}
          {tab === 3 && (
            <Stack spacing={1.5}>
              {patient.visits.length === 0 ? <Typography color="text.secondary">No visits recorded.</Typography> : patient.visits.map(visit => (
                <Box key={visit.id}>
                  <Typography fontWeight={700}>{visit.visit_type} · {visit.status}</Typography>
                  <Typography color="text.secondary">{new Date(visit.visit_date).toLocaleString()}</Typography>
                  <Typography variant="body2">{visit.reason}</Typography>
                </Box>
              ))}
            </Stack>
          )}
          {tab === 4 && (
            <Stack spacing={1.5}>
              {patient.prescriptions.length === 0 ? <Typography color="text.secondary">No prescriptions recorded.</Typography> : patient.prescriptions.map(prescription => (
                <Box key={prescription.id}>
                  <Typography fontWeight={700}>{prescription.medicine_name}</Typography>
                  <Typography color="text.secondary">{prescription.dosage || "-"} · {prescription.frequency || "-"} · {prescription.duration || "-"}</Typography>
                  <Typography variant="body2">{prescription.instructions || "No instructions"}</Typography>
                </Box>
              ))}
            </Stack>
          )}
          {tab === 5 && (
            <Stack spacing={1.5}>
              {patient.reports.length === 0 ? <Typography color="text.secondary">No reports uploaded.</Typography> : patient.reports.map(report => (
                <Box key={report.id}>
                  <Typography fontWeight={700}>{report.report_name}</Typography>
                  <Typography color="text.secondary">{report.report_type} · {new Date(report.uploaded_at).toLocaleString()}</Typography>
                  <Button size="small" href={report.file_path} target="_blank">Open</Button>
                </Box>
              ))}
            </Stack>
          )}
          {tab === 6 && (
            <Stack spacing={2}>
              {[...patient.medical_history.map(item => ({ id: `history-${item.id}`, title: item.condition_name, date: item.diagnosed_date || item.created_at, detail: item.diagnosis || item.description || "History" })),
                ...patient.visits.map(item => ({ id: `visit-${item.id}`, title: item.visit_type, date: item.visit_date, detail: item.status })),
                ...patient.vitals.map(item => ({ id: `vital-${item.id}`, title: "Vitals recorded", date: item.recorded_at, detail: `BP ${item.blood_pressure || "-"} · HR ${item.heart_rate || "-"}` })),
                ...patient.prescriptions.map(item => ({ id: `prescription-${item.id}`, title: item.medicine_name, date: item.created_at, detail: item.dosage || "Prescription" })),
                ...patient.reports.map(item => ({ id: `report-${item.id}`, title: item.report_name, date: item.uploaded_at, detail: item.report_type })),
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                <Box key={item.id} sx={{ borderLeft: 3, borderColor: "divider", pl: 2 }}>
                  <Typography fontWeight={700}>{item.title}</Typography>
                  <Typography color="text.secondary" variant="body2">{new Date(item.date).toLocaleString()}</Typography>
                  <Typography variant="body2">{item.detail}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Medical History</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Condition" {...register("condition_name", { required: true })} />
            <TextField label="Diagnosis" {...register("diagnosis")} />
            <TextField label="Diagnosed Date" type="date" InputLabelProps={{ shrink: true }} {...register("diagnosed_date")} />
            <TextField label="Description" multiline minRows={3} {...register("description")} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={historyMutation.isPending} onClick={handleSubmit(payload => historyMutation.mutate(payload))}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
