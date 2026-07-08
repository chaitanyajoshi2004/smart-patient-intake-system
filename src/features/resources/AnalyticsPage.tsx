import { useQuery } from "@tanstack/react-query";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../../components/common/PageHeader";
import { patientApi } from "../../services/patientApi";
import { resourceApi } from "../../services/resourceApi";
import { visitApi } from "../../services/visitApi";

export function AnalyticsPage() {
  const patients = useQuery({ queryKey: ["analytics", "patients"], queryFn: () => patientApi.list({ page: 1, limit: 100 }) });
  const visits = useQuery({ queryKey: ["analytics", "visits"], queryFn: () => visitApi.list({}) });
  const aiTriage = useQuery({ queryKey: ["analytics", "ai"], queryFn: resourceApi.aiTriage, retry: false });

  const patientsPerMonth = Object.entries((patients.data?.data || []).reduce<Record<string, number>>((acc, patient) => {
    const month = patient.created_at.slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {})).map(([month, value]) => ({ month, value }));

  const visitsByStatus = Object.entries((visits.data || []).reduce<Record<string, number>>((acc, visit) => {
    acc[visit.status] = (acc[visit.status] || 0) + 1;
    return acc;
  }, {})).map(([status, value]) => ({ status, value }));

  const gender = Object.entries((patients.data?.data || []).reduce<Record<string, number>>((acc, patient) => {
    acc[patient.gender || "Unknown"] = (acc[patient.gender || "Unknown"] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const aiSeverity = Object.entries((aiTriage.data || []).reduce<Record<string, number>>((acc, item) => {
    acc[item.severity_level] = (acc[item.severity_level] || 0) + 1;
    return acc;
  }, {})).map(([severity, value]) => ({ severity, value }));

  return (
    <Box>
      <PageHeader title="Analytics" subtitle="Backend-powered operational analytics" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Card><CardContent><Typography color="text.secondary">Patients</Typography><Typography variant="h4">{patients.data?.total || 0}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><Card><CardContent><Typography color="text.secondary">Visits</Typography><Typography variant="h4">{visits.data?.length || 0}</Typography></CardContent></Card></Grid>
        {aiTriage.data && <Grid size={{ xs: 12, sm: 6, md: 3 }}><Card><CardContent><Typography color="text.secondary">AI Triage</Typography><Typography variant="h4">{aiTriage.data.length}</Typography></CardContent></Card></Grid>}
        <Grid size={{ xs: 12, md: 6 }}><Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Patients per Month</Typography><ResponsiveContainer width="100%" height={240}><BarChart data={patientsPerMonth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#2563eb" /></BarChart></ResponsiveContainer></CardContent></Card></Grid>
        <Grid size={{ xs: 12, md: 6 }}><Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Visits by Status</Typography><ResponsiveContainer width="100%" height={240}><BarChart data={visitsByStatus}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#16a34a" /></BarChart></ResponsiveContainer></CardContent></Card></Grid>
        <Grid size={{ xs: 12, md: 6 }}><Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Gender</Typography><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={gender} dataKey="value" nameKey="name" outerRadius={80} label /><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card></Grid>
        {aiSeverity.length > 0 && <Grid size={{ xs: 12, md: 6 }}><Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>AI Severity</Typography><ResponsiveContainer width="100%" height={240}><BarChart data={aiSeverity}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="severity" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#dc2626" /></BarChart></ResponsiveContainer></CardContent></Card></Grid>}
      </Grid>
    </Box>
  );
}
