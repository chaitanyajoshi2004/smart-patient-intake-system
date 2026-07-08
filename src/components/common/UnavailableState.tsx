import { Alert, Box, Button, Typography } from "@mui/material";

export function UnavailableState({ feature, onRetry }: { feature: string; onRetry?: () => void }) {
  return (
    <Box sx={{ py: 6, textAlign: "center" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{feature} is currently unavailable</Typography>
      <Alert severity="info" sx={{ display: "inline-flex", maxWidth: 680, textAlign: "left" }}>
        This feature cannot load because the backend does not currently expose the required API response for this workspace.
      </Alert>
      {onRetry && (
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={onRetry}>Retry</Button>
        </Box>
      )}
    </Box>
  );
}
