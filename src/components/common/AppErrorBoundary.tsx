import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application render error", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ display: "grid", minHeight: "100vh", placeItems: "center", p: 3 }}>
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Something went wrong</Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              {this.state.error.message || "The application hit an unexpected rendering error."}
            </Alert>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload Application
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}
