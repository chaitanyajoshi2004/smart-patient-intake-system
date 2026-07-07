import { Box, Button, Typography } from "@mui/material";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="h6">{title}</Typography>
      {description && <Typography color="text.secondary" sx={{ mt: 1 }}>{description}</Typography>}
      {actionLabel && onAction && (
        <Button variant="contained" sx={{ mt: 3 }} onClick={onAction}>{actionLabel}</Button>
      )}
    </Box>
  );
}
