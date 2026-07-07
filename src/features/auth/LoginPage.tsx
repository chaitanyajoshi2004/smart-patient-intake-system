import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Stethoscope } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage, safeToastMessage } from "../../api/client";

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: { email: "admin@test.com", password: "password123" },
  });

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    try {
      await login(values);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(safeToastMessage(getErrorMessage(error) || "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}>
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Stack spacing={1} alignItems="center">
                <Box sx={{ bgcolor: "primary.main", color: "white", borderRadius: 2, display: "grid", height: 52, placeItems: "center", width: 52 }}>
                  <Stethoscope />
                </Box>
                <Typography variant="h4" textAlign="center">Smart Patient Intake</Typography>
                <Typography color="text.secondary" textAlign="center">Sign in to the hospital dashboard</Typography>
              </Stack>
              <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  {...register("email", { required: "Email is required" })}
                />
                <TextField
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  {...register("password", { required: "Password is required" })}
                />
                <Button disabled={loading} type="submit" size="large" variant="contained">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
