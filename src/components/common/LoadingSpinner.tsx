import { Box, CircularProgress } from "@mui/material";

export function LoadingSpinner() {
  return (
    <Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}>
      <CircularProgress />
    </Box>
  );
}
