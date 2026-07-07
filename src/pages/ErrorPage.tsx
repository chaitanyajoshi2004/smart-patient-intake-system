import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

export function ErrorPage({ code, title }: { code: string; title: string }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3, textAlign: "center" }}>
      <Box>
        <Typography variant="h2">{code}</Typography>
        <Typography variant="h5" sx={{ mb: 3 }}>{title}</Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained">Back to Dashboard</Button>
      </Box>
    </Box>
  );
}
