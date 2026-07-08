import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useSearchParams } from "react-router";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { TableToolbar } from "../../components/common/TableToolbar";
import { visitApi } from "../../services/visitApi";
import type { VisitPayload, VisitStatus } from "../../types/api";
import { exportCsv } from "../../utils/exportCsv";

const statuses: VisitStatus[] = ["scheduled", "checked_in", "in_progress", "completed", "cancelled"];

export function VisitsPage() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<VisitStatus | "">("");
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { register, handleSubmit, reset } = useForm<VisitPayload>({ defaultValues: { status: "scheduled" } });
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["visits", status, patientId, doctorId, date],
    queryFn: () => visitApi.list({
      status,
      date: date || undefined,
      patient_id: patientId ? Number(patientId) : undefined,
      doctor_id: doctorId ? Number(doctorId) : undefined,
    }),
  });

  useEffect(() => {
    const routeStatus = searchParams.get("status") as VisitStatus | null;
    const routeDate = searchParams.get("date");
    const routePatientId = searchParams.get("patient_id");

    setStatus(routeStatus && statuses.includes(routeStatus) ? routeStatus : "");
    setDate(routeDate === "today" ? new Date().toISOString().slice(0, 10) : routeDate || "");
    setPatientId(routePatientId || "");
  }, [searchParams]);

  const filteredVisits = useMemo(() => (
    (query.data || []).filter(visit => (
      !search || [visit.visit_type, visit.reason, visit.status, String(visit.patient_id), String(visit.doctor_id || "")].some(value => value?.toLowerCase().includes(search.toLowerCase()))
    ))
  ), [query.data, search]);

  const pagedVisits = useMemo(() => filteredVisits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredVisits, page, rowsPerPage]);

  const mutation = useMutation({
    mutationFn: (payload: VisitPayload) => visitApi.create({ ...payload, patient_id: Number(payload.patient_id), doctor_id: payload.doctor_id ? Number(payload.doctor_id) : undefined }),
    onSuccess: () => {
      toast.success("Visit created");
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      setOpen(false);
      reset();
    },
  });

  return (
    <Box>
      <PageHeader title="Visits" subtitle="Schedule and track clinical encounters" actionLabel="Create Visit" onAction={() => setOpen(true)} />
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField label="Patient ID" value={patientId} onChange={event => setPatientId(event.target.value)} />
          <TextField label="Doctor ID" value={doctorId} onChange={event => setDoctorId(event.target.value)} />
          <TextField label="Date" type="date" value={date} onChange={event => setDate(event.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField select label="Status" value={status} onChange={event => setStatus(event.target.value as VisitStatus | "")} sx={{ minWidth: 180 }}>
            <MenuItem value="">All</MenuItem>
            {statuses.map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
        </Stack>
      </Card>
      <Card>
        <TableToolbar
          search={search}
          onSearch={setSearch}
          onExportCsv={() => exportCsv("visits.csv", filteredVisits.map(visit => ({
            id: visit.id,
            patient_id: visit.patient_id,
            doctor_id: visit.doctor_id,
            visit_date: visit.visit_date,
            status: visit.status,
            reason: visit.reason,
          })))}
          onPrint={() => window.print()}
        />
        {filteredVisits.length === 0 ? <EmptyState title="No visits found" /> : (
          <Box sx={{ overflowX: "auto" }}>
            <Table stickyHeader>
              <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Patient</TableCell><TableCell>Doctor</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell>Reason</TableCell></TableRow></TableHead>
              <TableBody>
                {pagedVisits.map(visit => (
                  <TableRow key={visit.id}>
                    <TableCell>{new Date(visit.visit_date).toLocaleString()}</TableCell>
                    <TableCell>{visit.patient_id}</TableCell>
                    <TableCell>{visit.doctor_id || "-"}</TableCell>
                    <TableCell>{visit.visit_type}</TableCell>
                    <TableCell>{visit.status}</TableCell>
                    <TableCell>{visit.reason || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        <TablePagination component="div" count={filteredVisits.length} page={page} rowsPerPage={rowsPerPage} onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={event => { setRowsPerPage(Number(event.target.value)); setPage(0); }} />
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Visit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Patient ID" type="number" {...register("patient_id", { required: true })} />
            <TextField label="Doctor ID" type="number" {...register("doctor_id")} />
            <TextField label="Visit Date" type="datetime-local" InputLabelProps={{ shrink: true }} {...register("visit_date", { required: true })} />
            <TextField label="Visit Type" {...register("visit_type", { required: true })} />
            <TextField select label="Status" defaultValue="scheduled" {...register("status")}>
              {statuses.map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField label="Reason" {...register("reason")} />
            <TextField label="Notes" multiline minRows={3} {...register("notes")} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={mutation.isPending} onClick={handleSubmit(payload => mutation.mutate(payload))}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
