import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Patient, PatientPayload } from "../../types/api";
import { analyzeSymptoms } from "../../utils/triage";

interface PatientFormValues extends PatientPayload {
  symptoms: string;
  notes: string;
}

export function PatientFormDialog({
  open,
  patient,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  patient?: Patient | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: PatientPayload) => void;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const { register, handleSubmit, reset, control, getValues, formState: { errors } } = useForm<PatientFormValues>({
    values: patient ? {
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      blood_group: patient.blood_group || "",
      phone: patient.phone,
      email: patient.email || "",
      address: patient.address || "",
      emergency_contact: patient.emergency_contact || "",
      symptoms: "",
      notes: "",
    } : {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      blood_group: "",
      phone: "",
      email: "",
      address: "",
      emergency_contact: "",
      symptoms: "",
      notes: "",
    },
  });
  const symptoms = useWatch({ control, name: "symptoms" });
  const aiReview = useMemo(() => analyzeSymptoms(symptoms || ""), [symptoms]);

  function close() {
    reset();
    setReviewOpen(false);
    onClose();
  }

  function submitReviewed(values: PatientFormValues) {
    const payload: PatientPayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      date_of_birth: values.date_of_birth,
      gender: values.gender,
      blood_group: values.blood_group,
      phone: values.phone,
      email: values.email,
      address: values.address,
      emergency_contact: values.emergency_contact,
    };
    onSubmit(payload);
    setReviewOpen(false);
  }

  return (
    <Dialog open={open} onClose={close} maxWidth="md" fullWidth>
      <DialogTitle>{patient ? "Edit Patient" : "Add Patient"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {[
            ["first_name", "First Name"],
            ["last_name", "Last Name"],
            ["date_of_birth", "Date of Birth"],
            ["gender", "Gender"],
            ["blood_group", "Blood Group"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["emergency_contact", "Emergency Contact"],
            ["address", "Address"],
          ].map(([name, label]) => (
            <Grid key={name} size={{ xs: 12, md: name === "address" ? 12 : 6 }}>
              <TextField
                fullWidth
                label={label}
                type={name === "date_of_birth" ? "date" : name === "email" ? "email" : "text"}
                InputLabelProps={name === "date_of_birth" ? { shrink: true } : undefined}
                error={Boolean(errors[name as keyof PatientPayload])}
                helperText={errors[name as keyof PatientPayload]?.message}
                {...register(name as keyof PatientPayload, {
                  required: ["first_name", "last_name", "date_of_birth", "gender", "phone"].includes(name) ? `${label} is required` : false,
                })}
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Symptoms" multiline minRows={3} {...register("symptoms")} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Clinical Notes" multiline minRows={2} {...register("notes")} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">AI Review</Typography>
              <Typography color="text.secondary" variant="body2">
                {aiReview.urgency} · {aiReview.department} · {aiReview.confidence}% confidence · {aiReview.recommendation}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button disabled={loading} variant="contained" onClick={handleSubmit(() => setReviewOpen(true))}>
          {loading ? "Saving..." : "Review & Save"}
        </Button>
      </DialogActions>
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Review</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Symptoms" value={getValues("symptoms")} multiline minRows={3} InputProps={{ readOnly: true }} />
            <TextField select label="Urgency" defaultValue={aiReview.urgency}>
              {["Routine", "Priority", "Urgent"].map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
            <TextField label="Department" defaultValue={aiReview.department} />
            <TextField label="Recommendation" value={aiReview.recommendation} multiline minRows={2} InputProps={{ readOnly: true }} />
            <Typography color="text.secondary">Confidence {aiReview.confidence}% · Risk score {aiReview.riskScore}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)}>Back</Button>
          <Button variant="contained" disabled={loading} onClick={handleSubmit(submitReviewed)}>Accept & Save</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
