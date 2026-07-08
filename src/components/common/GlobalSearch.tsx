import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";
import { Box, InputAdornment, ListItemIcon, ListItemText, MenuItem, Paper, Popper, Stack, TextField, Typography } from "@mui/material";
import { Activity, FileText, Pill, Search, Stethoscope, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { patientApi } from "../../services/patientApi";
import { resourceApi } from "../../services/resourceApi";
import { visitApi } from "../../services/visitApi";

interface SearchResult {
  id: string;
  label: string;
  detail: string;
  path: string;
  icon: ReactNode;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [patients, visits, reports, prescriptions] = useQueries({
    queries: [
      { queryKey: ["global-search", "patients"], queryFn: () => patientApi.list({ page: 1, limit: 100 }), retry: false },
      { queryKey: ["global-search", "visits"], queryFn: () => visitApi.list({}), retry: false },
      { queryKey: ["global-search", "reports"], queryFn: resourceApi.reports, retry: false },
      { queryKey: ["global-search", "prescriptions"], queryFn: resourceApi.prescriptions, retry: false },
    ],
  });

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];

    const patientResults: SearchResult[] = (patients.data?.data || []).map(patient => ({
      id: `patient-${patient.id}`,
      label: `${patient.first_name} ${patient.last_name}`,
      detail: `Patient ${patient.patient_code} · ${patient.phone}`,
      path: `/patients/${patient.id}`,
      icon: <UserRound size={18} />,
    }));

    const visitResults: SearchResult[] = (visits.data || []).map(visit => ({
      id: `visit-${visit.id}`,
      label: `${visit.visit_type} visit`,
      detail: `Patient ${visit.patient_id} · ${visit.status} · ${new Date(visit.visit_date).toLocaleString()}`,
      path: `/visits?patient_id=${visit.patient_id}`,
      icon: <Activity size={18} />,
    }));

    const reportResults: SearchResult[] = (reports.data || []).map(report => ({
      id: `report-${report.id}`,
      label: report.report_name,
      detail: `Report · ${report.report_type} · Patient ${report.patient_id}`,
      path: `/reports`,
      icon: <FileText size={18} />,
    }));

    const prescriptionResults: SearchResult[] = (prescriptions.data || []).map(prescription => ({
      id: `prescription-${prescription.id}`,
      label: prescription.medicine_name,
      detail: `Prescription · Patient ${prescription.patient_id} · ${prescription.dosage || "No dosage"}`,
      path: `/prescriptions`,
      icon: <Pill size={18} />,
    }));

    return [...patientResults, ...visitResults, ...reportResults, ...prescriptionResults]
      .filter(result => `${result.label} ${result.detail}`.toLowerCase().includes(term))
      .slice(0, 8);
  }, [patients.data, prescriptions.data, query, reports.data, visits.data]);

  function selectResult(result: SearchResult) {
    setQuery("");
    setOpen(false);
    navigate(result.path);
  }

  return (
    <Box ref={anchorRef} sx={{ flex: 1, maxWidth: 520, position: "relative" }}>
      <TextField
        fullWidth
        inputRef={inputRef}
        size="small"
        value={query}
        onChange={event => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
      />
      <Popper open={open && query.trim().length >= 2} anchorEl={anchorRef.current} placement="bottom-start" sx={{ zIndex: theme => theme.zIndex.modal, width: anchorRef.current?.clientWidth }}>
        <Paper elevation={6} sx={{ mt: 1, overflow: "hidden" }}>
          {results.length > 0 ? results.map(result => (
            <MenuItem key={result.id} onClick={() => selectResult(result)}>
              <ListItemIcon>{result.icon}</ListItemIcon>
              <ListItemText primary={result.label} secondary={result.detail} />
            </MenuItem>
          )) : (
            <Stack alignItems="center" spacing={1} sx={{ p: 2.5, textAlign: "center" }}>
              <Stethoscope size={22} />
              <Typography variant="body2" color="text.secondary">No matching records found.</Typography>
            </Stack>
          )}
        </Paper>
      </Popper>
    </Box>
  );
}
