import { Avatar, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";

export function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <Box>
      <PageHeader title="Profile" subtitle="Account information and preferences" />
      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }}>
            <Avatar src={user?.profile_image || undefined} sx={{ width: 88, height: 88 }}>{user?.full_name.charAt(0)}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5">{user?.full_name}</Typography>
              <Typography color="text.secondary">{user?.role}</Typography>
            </Box>
            <Button variant="outlined" onClick={logout}>Logout</Button>
          </Stack>
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Full Name" value={user?.full_name || ""} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Role" value={user?.role || ""} disabled /></Grid>
            {user?.email && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email" value={user.email} disabled /></Grid>}
            {user?.phone && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Phone" value={user.phone} disabled /></Grid>}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
