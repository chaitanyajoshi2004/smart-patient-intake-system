import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import { Edit, Trash2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../../components/common/PageHeader";
import { TableToolbar } from "../../components/common/TableToolbar";
import { UnavailableState } from "../../components/common/UnavailableState";
import { resourceApi } from "../../services/resourceApi";
import { exportCsv } from "../../utils/exportCsv";
import { useClientTable } from "../../hooks/useClientTable";
import type { Vital, VitalPayload } from "../../types/api";

export function VitalsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vital | null>(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, control } = useForm<VitalPayload>();
  const height = useWatch({ control, name: "height" });
  const weight = useWatch({ control, name: "weight" });
  const bmi = useMemo(() => {
    const h = Number(height || 0) / 100;
    const w = Number(weight || 0);
    return h > 0 && w > 0 ? Number((w / (h * h)).toFixed(1)) : undefined;
  }, [height, weight]);
  const query = useQuery({ queryKey: ["vitals"], queryFn: resourceApi.vitals });
  const table = useClientTable(query.data || [], row => `${row.patient_id} ${row.blood_pressure} ${row.heart_rate}`);
  const saveMutation = useMutation({
    mutationFn: (payload: VitalPayload) => editing ? resourceApi.updateVital(editing.id, { ...payload, bmi }) : resourceApi.createVital({ ...payload, bmi }),
    onSuccess: () => {
      toast.success(editing ? "Vital updated" : "Vital added");
      queryClient.invalidateQueries({ queryKey: ["vitals"] });
      setOpen(false);
      setEditing(null);
      reset();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: resourceApi.deleteVital,
    onSuccess: () => {
      toast.success("Vital deleted");
      queryClient.invalidateQueries({ queryKey: ["vitals"] });
    },
  });

  function edit(row: Vital) {
    setEditing(row);
    reset({
      patient_id: row.patient_id,
      visit_id: row.visit_id || undefined,
      height: row.height || undefined,
      weight: row.weight || undefined,
      temperature: row.temperature || undefined,
      blood_pressure: row.blood_pressure || "",
      heart_rate: row.heart_rate || undefined,
      oxygen_level: row.oxygen_level || undefined,
    });
    setOpen(true);
  }

  return (
    <Box>
      <PageHeader title="Vitals" subtitle="Clinical measurements, BMI, and trends" actionLabel="Add Vital" onAction={() => { setEditing(null); reset({}); setOpen(true); }} />
      {query.isError ? <UnavailableState feature="Vitals" onRetry={() => query.refetch()} /> : (
        <Card>
          <TableToolbar search={table.search} onSearch={table.setSearch} onExportCsv={() => exportCsv("vitals.csv", table.filtered as unknown as Record<string, unknown>[])} onPrint={() => window.print()} />
          {table.filtered[0] && <CardContent><Typography variant="h6">Latest Vital</Typography><Typography color="text.secondary">Patient {table.filtered[0].patient_id} · BP {table.filtered[0].blood_pressure || "-"} · HR {table.filtered[0].heart_rate || "-"} · BMI {table.filtered[0].bmi || "-"}</Typography></CardContent>}
          <Box sx={{ height: 240, p: 2 }}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={table.filtered}><XAxis dataKey="recorded_at" hide /><YAxis /><Tooltip /><Line type="monotone" dataKey="bmi" stroke="#2563eb" /><Line type="monotone" dataKey="heart_rate" stroke="#dc2626" /></LineChart></ResponsiveContainer>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <Table stickyHeader><TableHead><TableRow>{["Patient", "Height", "Weight", "BMI", "Temp", "BP", "Heart Rate", "Oxygen", "Recorded", "Actions"].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>{table.paged.map(row => <TableRow key={row.id}><TableCell>{row.patient_id}</TableCell><TableCell>{row.height ?? "-"}</TableCell><TableCell>{row.weight ?? "-"}</TableCell><TableCell>{row.bmi ?? "-"}</TableCell><TableCell>{row.temperature ?? "-"}</TableCell><TableCell>{row.blood_pressure ?? "-"}</TableCell><TableCell>{row.heart_rate ?? "-"}</TableCell><TableCell>{row.oxygen_level ?? "-"}</TableCell><TableCell>{new Date(row.recorded_at).toLocaleString()}</TableCell><TableCell><IconButton onClick={() => edit(row)}><Edit size={18} /></IconButton><IconButton color="error" onClick={() => deleteMutation.mutate(row.id)}><Trash2 size={18} /></IconButton></TableCell></TableRow>)}</TableBody>
            </Table>
          </Box>
          <TablePagination component="div" count={table.filtered.length} page={table.page} rowsPerPage={table.rowsPerPage} onPageChange={(_, p) => table.setPage(p)} onRowsPerPageChange={e => table.setRowsPerPage(Number(e.target.value))} />
        </Card>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Vital" : "Add Vital"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Patient ID" type="number" {...register("patient_id", { required: true, valueAsNumber: true })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Visit ID" type="number" {...register("visit_id", { valueAsNumber: true })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Height (cm)" type="number" {...register("height", { min: 30, max: 250, valueAsNumber: true })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Weight (kg)" type="number" {...register("weight", { min: 1, max: 400, valueAsNumber: true })} /></Grid>
            <Grid size={{ xs: 12 }}><Typography color="text.secondary">BMI: {bmi || "-"}</Typography></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Temperature" type="number" {...register("temperature", { valueAsNumber: true })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Blood Pressure" {...register("blood_pressure")} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Heart Rate" type="number" {...register("heart_rate", { valueAsNumber: true })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Oxygen Level" type="number" {...register("oxygen_level", { valueAsNumber: true })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" disabled={saveMutation.isPending} onClick={handleSubmit(payload => saveMutation.mutate(payload))}>Save</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
