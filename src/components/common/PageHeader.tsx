import { Box, Breadcrumbs, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <RouterLink to="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</RouterLink>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>
      <Box sx={{ alignItems: "center", display: "flex", gap: 2, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4">{title}</Typography>
          {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
        </Box>
        {actionLabel && onAction && <Button variant="contained" onClick={onAction}>{actionLabel}</Button>}
      </Box>
    </Box>
  );
}
