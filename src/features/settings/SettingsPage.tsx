import { useQuery } from "@tanstack/react-query";
import { Alert, Card, CardContent, FormControlLabel, Grid, Switch, TextField, Typography } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { useThemeMode } from "../../theme/AppTheme";
import { resourceApi } from "../../services/resourceApi";

export function SettingsPage() {
  const { mode, toggleMode } = useThemeMode();
  const settings = useQuery({ queryKey: ["settings"], queryFn: resourceApi.settings });

  return (
    <>
      <PageHeader title="Settings" subtitle="Workspace preferences" />
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Appearance</Typography>
          <FormControlLabel control={<Switch checked={mode === "dark"} onChange={toggleMode} />} label="Dark mode" />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Clinic Information</Typography>
          {settings.isError && <Alert severity="info" sx={{ mb: 2 }}>Clinic settings could not be loaded from the backend.</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Clinic Name" value={settings.data?.clinic_name || ""} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Phone" value={settings.data?.phone || ""} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email" value={settings.data?.email || ""} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Logo" value={settings.data?.logo || ""} disabled /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Address" value={settings.data?.address || ""} disabled /></Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
