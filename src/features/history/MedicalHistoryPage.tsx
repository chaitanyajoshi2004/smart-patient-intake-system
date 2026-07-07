import { Alert, Card, CardContent, Typography } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";

export function MedicalHistoryPage() {
  return (
    <>
      <PageHeader title="Medical History" subtitle="Open a patient profile to view or add timeline history" />
      <Card>
        <CardContent>
          <Alert severity="info">
            Medical history is managed from each patient detail page through the existing `/patients/{`{patient_id}`}/history` APIs.
          </Alert>
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Use Patients, open a patient, then select Add History.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
