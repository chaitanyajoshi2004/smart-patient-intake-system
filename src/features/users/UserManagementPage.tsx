import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { authApi } from "../../services/authApi";
import type { CreateUserPayload, UserRole } from "../../types/api";

const roles: UserRole[] = ["admin", "doctor", "nurse", "staff"];

export function UserManagementPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserPayload>({ defaultValues: { role: "staff" } });
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: user => {
      toast.success(`${user.full_name} created`);
      reset({ role: "staff", full_name: "", email: "", password: "", phone: "" });
    },
  });

  return (
    <>
      <PageHeader title="User Management" subtitle="Admin-only staff account creation" />
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Create Hospital User</Typography>
          <Grid container spacing={2} component="form" onSubmit={handleSubmit(payload => mutation.mutate(payload))}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Full Name" error={Boolean(errors.full_name)} {...register("full_name", { required: "Full name is required" })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email" type="email" error={Boolean(errors.email)} {...register("email", { required: "Email is required" })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Password" type="password" error={Boolean(errors.password)} {...register("password", { required: "Password is required", minLength: 8 })} /></Grid>
            <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth label="Phone" {...register("phone")} /></Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth select label="Role" defaultValue="staff" {...register("role")}>
                {roles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" justifyContent="flex-end">
                <Button type="submit" variant="contained" disabled={mutation.isPending}>Create User</Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
