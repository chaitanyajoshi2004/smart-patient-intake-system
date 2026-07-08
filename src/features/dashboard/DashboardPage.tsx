import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { CalendarDays, Plus, Users, Activity, Clock, FileWarning, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../../components/common/PageHeader";
import { patientApi } from "../../services/patientApi";
import { resourceApi } from "../../services/resourceApi";
import { visitApi } from "../../services/visitApi";

function StatCard({ title, value, icon, caption }: { title: string; value: number | string; icon: React.ReactNode; caption?: string }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" variant="body2">{title}</Typography>
            <Typography variant="h4">{value}</Typography>
            {caption && <Typography color="text.secondary" variant="caption">{caption}</Typography>}
          </Box>
          <Box sx={{ color: "primary.main" }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const patients = useQuery({ queryKey: ["patients", "dashboard"], queryFn: () => patientApi.list({ page: 1, limit: 100 }), refetchInterval: 30000 });
  const visits = useQuery({ queryKey: ["visits", "dashboard"], queryFn: () => visitApi.list({}), refetchInterval: 30000 });
  const aiTriage = useQuery({ queryKey: ["ai-triage", "dashboard"], queryFn: resourceApi.aiTriage, refetchInterval: 30000, retry: false });
  const reports = useQuery({ queryKey: ["reports", "dashboard"], queryFn: resourceApi.reports, refetchInterval: 30000, retry: false });

  const todaysVisits = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return visits.data?.filter(visit => visit.visit_date.slice(0, 10) === today).length || 0;
  }, [visits.data]);
  const todaysRegistrations = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return patients.data?.data.filter(patient => patient.created_at.slice(0, 10) === today).length || 0;
  }, [patients.data]);

  const scheduledVisits = visits.data?.filter(visit => visit.status === "scheduled").length || 0;
  const completedVisits = visits.data?.filter(visit => visit.status === "completed").length || 0;
  const cancelledVisits = visits.data?.filter(visit => visit.status === "cancelled").length || 0;
  const totalVisits = visits.data?.length || 0;
  const activeVisits = visits.data?.filter(visit => ["checked_in", "in_progress"].includes(visit.status)).length || 0;
  const criticalCases = aiTriage.data?.filter(item => item.severity_level === "critical").length || 0;

  const genderData = useMemo(() => {
    const counts = new Map<string, number>();
    patients.data?.data.forEach(patient => counts.set(patient.gender || "Unknown", (counts.get(patient.gender || "Unknown") || 0) + 1));
    return Array.from(counts, ([name, value]) => ({ name, value }));
  }, [patients.data]);

  const visitStatusData = useMemo(() => {
    const counts = new Map<string, number>();
    visits.data?.forEach(visit => counts.set(visit.status, (counts.get(visit.status) || 0) + 1));
    return Array.from(counts, ([status, value]) => ({ status, value }));
  }, [visits.data]);

  const registrationTrend = useMemo(() => {
    const counts = new Map<string, number>();
    patients.data?.data.forEach(patient => {
      const day = patient.created_at.slice(0, 10);
      counts.set(day, (counts.get(day) || 0) + 1);
    });
    return Array.from(counts, ([day, value]) => ({ day, value })).sort((a, b) => a.day.localeCompare(b.day)).slice(-14);
  }, [patients.data]);

  const aiSeverityData = useMemo(() => {
    const counts = new Map<string, number>();
    aiTriage.data?.forEach(item => counts.set(item.severity_level, (counts.get(item.severity_level) || 0) + 1));
    return Array.from(counts, ([severity, value]) => ({ severity, value }));
  }, [aiTriage.data]);

  const ageData = useMemo(() => {
    const buckets = [
      { name: "0-18", value: 0 },
      { name: "19-35", value: 0 },
      { name: "36-55", value: 0 },
      { name: "56+", value: 0 },
    ];
    patients.data?.data.forEach(patient => {
      const age = patient.age ?? 0;
      if (age <= 18) buckets[0].value += 1;
      else if (age <= 35) buckets[1].value += 1;
      else if (age <= 55) buckets[2].value += 1;
      else buckets[3].value += 1;
    });
    return buckets;
  }, [patients.data]);

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Live overview of patient intake activity" />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Total Patients" value={patients.data?.total ?? 0} icon={<Users size={28} />} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Today's Registrations" value={todaysRegistrations} icon={<Users size={28} />} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Today's Visits" value={todaysVisits} icon={<CalendarDays size={28} />} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Active Visits" value={activeVisits} icon={<Activity size={28} />} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Completed Visits" value={completedVisits} icon={<Stethoscope size={28} />} /></Grid>
        {aiTriage.data && <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Critical Cases" value={criticalCases} icon={<FileWarning size={28} />} /></Grid>}
        {aiTriage.data && <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="AI Triage Count" value={aiTriage.data.length} icon={<FileWarning size={28} />} /></Grid>}
        {reports.data && <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Reports" value={reports.data.length} icon={<FileWarning size={28} />} /></Grid>}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Scheduled Visits" value={scheduledVisits} icon={<Clock size={28} />} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Cancelled Visits" value={cancelledVisits} icon={<Clock size={28} />} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Total Visits" value={totalVisits} icon={<CalendarDays size={28} />} /></Grid>
        {(aiTriage.isError || reports.isError) && <Grid size={{ xs: 12 }}><Alert severity="info">Some optional clinical metrics are hidden because their API responses are not available.</Alert></Grid>}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Registrations by Day</Typography><ResponsiveContainer width="100%" height={220}><BarChart data={registrationTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        </Grid>
        {aiSeverityData.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>AI Severity Distribution</Typography><ResponsiveContainer width="100%" height={220}><BarChart data={aiSeverityData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="severity" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#dc2626" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Visit Status</Typography><ResponsiveContainer width="100%" height={220}><BarChart data={visitStatusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Gender Distribution</Typography><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={genderData} dataKey="value" nameKey="name" outerRadius={80} label>{genderData.map((_, index) => <Cell key={index} fill={["#2563eb", "#16a34a", "#d97706", "#7c3aed"][index % 4]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Age Distribution</Typography><ResponsiveContainer width="100%" height={220}><BarChart data={ageData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#0891b2" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Patients</Typography>
              {patients.isLoading ? <Skeleton height={180} /> : (
                <Stack spacing={1.5}>
                  {patients.data?.data.map(patient => (
                    <Stack key={patient.id} direction="row" justifyContent="space-between">
                      <Typography>{patient.first_name} {patient.last_name}</Typography>
                      <Chip size="small" label={patient.patient_code} />
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Stack spacing={1.5}>
                <Button startIcon={<Plus size={18} />} variant="contained" onClick={() => navigate("/patients")}>Add Patient</Button>
                <Button startIcon={<Clock size={18} />} variant="outlined" onClick={() => navigate("/visits")}>Schedule Visit</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
