import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { TableToolbar } from "../../components/common/TableToolbar";
import { useClientTable } from "../../hooks/useClientTable";
import { patientApi } from "../../services/patientApi";
import type { MedicalHistoryPayload } from "../../types/api";
import { exportCsv } from "../../utils/exportCsv";

export function MedicalHistoryPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | "">("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<MedicalHistoryPayload>();

  const patients = useQuery({ queryKey: ["history-patients"], queryFn: () => patientApi.list({ page: 1, limit: 100 }) });
  const history = useQuery({
    queryKey: ["medical-history", selectedPatientId],
    queryFn: () => patientApi.history(Number(selectedPatientId)),
    enabled: selectedPatientId !== "",
  });

  const selectedPatient = useMemo(
    () => patients.data?.data.find(patient => patient.id === selectedPatientId),
    [patients.data, selectedPatientId],
  );

  const sortedHistory = useMemo(() => (
    [...(history.data || [])].sort((a, b) => new Date(b.diagnosed_date || b.created_at).getTime() - new Date(a.diagnosed_date || a.created_at).getTime())
  ), [history.data]);

  const table = useClientTable(sortedHistory, row => `${row.condition_name} ${row.diagnosis || ""} ${row.description || ""}`, 8);

  const addMutation = useMutation({
    mutationFn: (payload: MedicalHistoryPayload) => patientApi.addHistory(Number(selectedPatientId), payload),
    onSuccess: () => {
      toast.success("Medical history added");
      queryClient.invalidateQueries({ queryKey: ["medical-history", selectedPatientId] });
      setDialogOpen(false);
      reset();
    },
  });

  return (
    <Box>
      <PageHeader
        title="Medical History"
        subtitle="Patient conditions, diagnoses, timelines, and clinical notes"
        actionLabel="Add History"
        onAction={selectedPatientId === "" ? undefined : () => setDialogOpen(true)}
      />
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select label="Patient" value={selectedPatientId} onChange={event => setSelectedPatientId(Number(event.target.value))}>
                  {(patients.data?.data || []).map(patient => (
                    <MenuItem key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name} · {patient.patient_code}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography color="text.secondary">
                {selectedPatient ? `${selectedPatient.phone} · ${selectedPatient.gender} · ${selectedPatient.blood_group || "No blood group"}` : "Select a patient to load history."}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedPatientId !== "" && (
        <Grid container spacing={2.5} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Timeline</Typography>
                <Stack spacing={2}>
                  {sortedHistory.length === 0 && <Typography color="text.secondary">No medical history recorded.</Typography>}
                  {sortedHistory.slice(0, 8).map(item => (
                    <Box key={item.id} sx={{ borderLeft: 3, borderColor: "primary.main", pl: 2 }}>
                      <Typography fontWeight={700}>{item.condition_name}</Typography>
                      <Typography color="text.secondary" variant="body2">{item.diagnosed_date || item.created_at}</Typography>
                      <Typography variant="body2">{item.diagnosis || item.description || "No clinical note"}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <TableToolbar search={table.search} onSearch={table.setSearch} onExportCsv={() => exportCsv("medical-history.csv", table.filtered as unknown as Record<string, unknown>[])} onPrint={() => window.print()} />
              <Box sx={{ overflowX: "auto" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>{["Condition", "Diagnosis", "Diagnosed", "Description", "Actions"].map(header => <TableCell key={header}>{header}</TableCell>)}</TableRow>
                  </TableHead>
                  <TableBody>
                    {table.paged.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.condition_name}</TableCell>
                        <TableCell>{item.diagnosis || "-"}</TableCell>
                        <TableCell>{item.diagnosed_date || "-"}</TableCell>
                        <TableCell>{item.description || "-"}</TableCell>
                        <TableCell><Button size="small" disabled>Edit</Button><Button size="small" disabled>Delete</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <TablePagination component="div" count={table.filtered.length} page={table.page} rowsPerPage={table.rowsPerPage} onPageChange={(_, page) => table.setPage(page)} onRowsPerPageChange={event => table.setRowsPerPage(Number(event.target.value))} />
            </Card>
          </Grid>
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={addMutation.isPending} onClick={handleSubmit(payload => addMutation.mutate(payload))}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
