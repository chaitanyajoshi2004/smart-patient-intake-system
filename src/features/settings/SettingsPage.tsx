import { Card, CardContent, FormControlLabel, Switch, Typography } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { useThemeMode } from "../../theme/AppTheme";

export function SettingsPage() {
  const { mode, toggleMode } = useThemeMode();
  return (
    <>
      <PageHeader title="Settings" subtitle="Workspace preferences" />
      <Card>
        <CardContent>
          <Typography variant="h6">Appearance</Typography>
          <FormControlLabel control={<Switch checked={mode === "dark"} onChange={toggleMode} />} label="Dark mode" />
        </CardContent>
      </Card>
    </>
  );
}
