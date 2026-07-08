import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Card, CardContent, Grid, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusChip } from "../../components/common/StatusChip";
import { TableToolbar } from "../../components/common/TableToolbar";
import { UnavailableState } from "../../components/common/UnavailableState";
import { useClientTable } from "../../hooks/useClientTable";
import { resourceApi } from "../../services/resourceApi";
import { exportCsv } from "../../utils/exportCsv";
import { analyzeSymptoms } from "../../utils/triage";

export function AITriagePage() {
  const [symptoms, setSymptoms] = useState("");
  const query = useQuery({ queryKey: ["ai-triage"], queryFn: resourceApi.aiTriage });
  const table = useClientTable(query.data || [], row => `${row.patient_id} ${row.symptoms} ${row.severity_level}`);
  const severity = ["low", "medium", "high", "critical"].map(level => ({ level, count: (query.data || []).filter(item => item.severity_level === level).length }));
  const prediction = useMemo(() => analyzeSymptoms(symptoms), [symptoms]);

  return (
    <Box>
      <PageHeader title="AI Triage" subtitle="Risk, severity, predictions, and recommendations" />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <TextField fullWidth multiline minRows={5} label="Symptoms" value={symptoms} onChange={event => setSymptoms(event.target.value)} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Live Triage</Typography>
              <Stack spacing={1}>
                <Typography>Urgency: <strong>{prediction.urgency}</strong></Typography>
                <Typography>Department: <strong>{prediction.department}</strong></Typography>
                <Typography>Confidence: <strong>{prediction.confidence}%</strong></Typography>
                <Typography>Risk score: <strong>{prediction.riskScore}</strong></Typography>
                <Typography color="text.secondary">{prediction.recommendation}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {query.isError ? <UnavailableState feature="AI Triage" onRetry={() => query.refetch()} /> : (
        <Card>
          <Box sx={{ height: 220, p: 2 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={severity}><XAxis dataKey="level" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#dc2626" /></BarChart></ResponsiveContainer></Box>
          <TableToolbar search={table.search} onSearch={table.setSearch} onExportCsv={() => exportCsv("ai-triage.csv", table.filtered as unknown as Record<string, unknown>[])} onPrint={() => window.print()} />
          <Box sx={{ overflowX: "auto" }}><Table stickyHeader><TableHead><TableRow>{["Patient", "Symptoms", "Severity", "Risk", "Prediction", "Recommendation", "Confidence"].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead><TableBody>{table.paged.map(row => <TableRow key={row.id}><TableCell>{row.patient_id}</TableCell><TableCell>{row.symptoms}</TableCell><TableCell><StatusChip value={row.severity_level} /></TableCell><TableCell>{row.risk_score ?? "-"}</TableCell><TableCell>{row.ai_prediction ?? "-"}</TableCell><TableCell>{row.recommendation ?? "-"}</TableCell><TableCell>{row.confidence_score ?? "-"}</TableCell></TableRow>)}</TableBody></Table></Box>
          <TablePagination component="div" count={table.filtered.length} page={table.page} rowsPerPage={table.rowsPerPage} onPageChange={(_, p) => table.setPage(p)} onRowsPerPageChange={e => table.setRowsPerPage(Number(e.target.value))} />
        </Card>
      )}
    </Box>
  );
}
