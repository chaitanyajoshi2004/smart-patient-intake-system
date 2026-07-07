import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { PageHeader } from "../../components/common/PageHeader";
import { patientApi } from "../../services/patientApi";
import type { Patient, PatientPayload } from "../../types/api";
import { PatientFormDialog } from "./PatientFormDialog";

export function PatientsPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["patients", page, limit, search, gender],
    queryFn: () => patientApi.list({ page: page + 1, limit, search: search || undefined, gender: gender || undefined }),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: PatientPayload) => editing ? patientApi.update(editing.id, payload) : patientApi.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Patient updated" : "Patient created");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setDialogOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (patientId: number) => patientApi.remove(patientId),
    onSuccess: () => {
      toast.success("Patient deleted");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setDeleting(null);
    },
  });

  return (
    <Box>
      <PageHeader title="Patients" subtitle="Search, register, edit, and review patient records" actionLabel="Add Patient" onAction={() => setDialogOpen(true)} />
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField label="Search" placeholder="Name, phone, patient code" value={search} onChange={event => { setPage(0); setSearch(event.target.value); }} fullWidth />
          <TextField select label="Gender" value={gender} onChange={event => setGender(event.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Stack>
      </Card>
      <Card>
        {query.data?.data.length === 0 ? <EmptyState title="No patients found" description="Try another search or add a new patient." /> : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data?.data.map(patient => (
                  <TableRow key={patient.id} hover>
                    <TableCell>{patient.first_name} {patient.last_name}</TableCell>
                    <TableCell>{patient.patient_code}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.blood_group || "-"}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => navigate(`/patients/${patient.id}`)}><Eye size={18} /></IconButton>
                      <IconButton onClick={() => { setEditing(patient); setDialogOpen(true); }}><Edit size={18} /></IconButton>
                      <IconButton color="error" onClick={() => setDeleting(patient)}><Trash2 size={18} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        <TablePagination
          component="div"
          count={query.data?.total || 0}
          page={page}
          rowsPerPage={limit}
          onPageChange={(_, next) => setPage(next)}
          onRowsPerPageChange={event => { setLimit(Number(event.target.value)); setPage(0); }}
        />
      </Card>
      <PatientFormDialog open={dialogOpen} patient={editing} loading={saveMutation.isPending} onClose={() => { setDialogOpen(false); setEditing(null); }} onSubmit={payload => saveMutation.mutate(payload)} />
      <ConfirmDialog open={Boolean(deleting)} title="Delete patient" description="This patient will be deactivated and hidden from active lists." confirmLabel="Delete" onClose={() => setDeleting(null)} onConfirm={() => deleting && deleteMutation.mutate(deleting.id)} />
    </Box>
  );
}
