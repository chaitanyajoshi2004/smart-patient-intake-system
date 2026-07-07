import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { CalendarDays, Plus, Users, Activity, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { PageHeader } from "../../components/common/PageHeader";
import { patientApi } from "../../services/patientApi";
import { visitApi } from "../../services/visitApi";

function StatCard({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" variant="body2">{title}</Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box sx={{ color: "primary.main" }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const patients = useQuery({ queryKey: ["patients", "dashboard"], queryFn: () => patientApi.list({ page: 1, limit: 5 }) });
  const visits = useQuery({ queryKey: ["visits", "dashboard"], queryFn: () => visitApi.list({}) });

  const todaysVisits = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return visits.data?.filter(visit => visit.visit_date.slice(0, 10) === today).length || 0;
  }, [visits.data]);

  const activeVisits = visits.data?.filter(visit => ["checked_in", "in_progress"].includes(visit.status)).length || 0;

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Live overview of patient intake activity" />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title="Total Patients" value={patients.data?.total ?? 0} icon={<Users size={28} />} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title="Today's Visits" value={todaysVisits} icon={<CalendarDays size={28} />} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title="Active Visits" value={activeVisits} icon={<Activity size={28} />} /></Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Patients</Typography>
              {patients.isLoading ? <Skeleton height={180} /> : (
                <Stack spacing={1.5}>
                  {patients.data?.data.map(patient => (
                    <Stack key={patient.id} direction="row" justifyContent="space-between">
                      <Typography>{patient.first_name} {patient.last_name}</Typography>
                      <Typography color="text.secondary">{patient.patient_code}</Typography>
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
