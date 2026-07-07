import { useForm } from "react-hook-form";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import type { Patient, PatientPayload } from "../../types/api";

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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientPayload>({
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
    },
  });

  function close() {
    reset();
    onClose();
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
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button disabled={loading} variant="contained" onClick={handleSubmit(onSubmit)}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
