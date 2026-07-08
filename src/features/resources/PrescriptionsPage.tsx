import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Tooltip } from "@mui/material";
import { Edit, Printer, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { TableToolbar } from "../../components/common/TableToolbar";
import { UnavailableState } from "../../components/common/UnavailableState";
import { resourceApi } from "../../services/resourceApi";
import { exportCsv } from "../../utils/exportCsv";
import { useClientTable } from "../../hooks/useClientTable";
import type { Prescription, PrescriptionPayload } from "../../types/api";

export function PrescriptionsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Prescription | null>(null);
  const { register, handleSubmit, reset } = useForm<PrescriptionPayload>();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["prescriptions"], queryFn: resourceApi.prescriptions });
  const table = useClientTable(query.data || [], row => `${row.patient_id} ${row.doctor_id} ${row.medicine_name} ${row.dosage}`);
  const saveMutation = useMutation({
    mutationFn: (payload: PrescriptionPayload) => editing ? resourceApi.updatePrescription(editing.id, payload) : resourceApi.createPrescription(payload),
    onSuccess: () => {
      toast.success(editing ? "Prescription updated" : "Prescription created");
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setOpen(false);
      setEditing(null);
      reset();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: resourceApi.deletePrescription,
    onSuccess: () => {
      toast.success("Prescription deleted");
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });

  function edit(row: Prescription) {
    setEditing(row);
    reset({
      patient_id: row.patient_id,
      doctor_id: row.doctor_id || undefined,
      visit_id: row.visit_id || undefined,
      medicine_name: row.medicine_name,
      dosage: row.dosage || "",
      frequency: row.frequency || "",
      duration: row.duration || "",
      instructions: row.instructions || "",
    });
    setOpen(true);
  }

  return (
    <Box>
      <PageHeader title="Prescriptions" subtitle="Medication orders and printable prescriptions" actionLabel="Create Prescription" onAction={() => { setEditing(null); reset({}); setOpen(true); }} />
      {query.isError ? <UnavailableState feature="Prescriptions" onRetry={() => query.refetch()} /> : (
        <Card>
          <TableToolbar search={table.search} onSearch={table.setSearch} onExportCsv={() => exportCsv("prescriptions.csv", table.filtered as unknown as Record<string, unknown>[])} onPrint={() => window.print()} />
          <Box sx={{ overflowX: "auto" }}>
            <Table stickyHeader><TableHead><TableRow>{["Patient", "Doctor", "Medicine", "Dosage", "Frequency", "Duration", "Instructions", "Created", "Actions"].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>{table.paged.map(row => <TableRow key={row.id}><TableCell>{row.patient_id}</TableCell><TableCell>{row.doctor_id ?? "-"}</TableCell><TableCell>{row.medicine_name}</TableCell><TableCell>{row.dosage ?? "-"}</TableCell><TableCell>{row.frequency ?? "-"}</TableCell><TableCell>{row.duration ?? "-"}</TableCell><TableCell>{row.instructions ?? "-"}</TableCell><TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell><TableCell><Tooltip title="Print prescription"><IconButton onClick={() => window.print()}><Printer size={18} /></IconButton></Tooltip><IconButton onClick={() => edit(row)}><Edit size={18} /></IconButton><IconButton color="error" onClick={() => deleteMutation.mutate(row.id)}><Trash2 size={18} /></IconButton></TableCell></TableRow>)}</TableBody>
            </Table>
          </Box>
          <TablePagination component="div" count={table.filtered.length} page={table.page} rowsPerPage={table.rowsPerPage} onPageChange={(_, p) => table.setPage(p)} onRowsPerPageChange={e => table.setRowsPerPage(Number(e.target.value))} />
        </Card>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Prescription" : "Create Prescription"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Patient ID" type="number" {...register("patient_id", { required: true, valueAsNumber: true })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Doctor ID" type="number" {...register("doctor_id", { valueAsNumber: true })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Medicine" {...register("medicine_name", { required: true })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Dosage" {...register("dosage")} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Frequency" {...register("frequency")} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Duration" {...register("duration")} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Status" {...register("status")} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth multiline minRows={3} label="Instructions" {...register("instructions")} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" disabled={saveMutation.isPending} onClick={handleSubmit(payload => saveMutation.mutate(payload))}>Save</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
