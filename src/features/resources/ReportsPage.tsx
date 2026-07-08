import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import { Download, Eye, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { TableToolbar } from "../../components/common/TableToolbar";
import { UnavailableState } from "../../components/common/UnavailableState";
import { resourceApi } from "../../services/resourceApi";
import { exportCsv } from "../../utils/exportCsv";
import { useClientTable } from "../../hooks/useClientTable";

export function ReportsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["reports"], queryFn: resourceApi.reports });
  const table = useClientTable(query.data || [], row => `${row.patient_id} ${row.report_name} ${row.report_type}`);
  const uploadMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("patient_id", patientId);
      formData.append("report_name", reportName);
      formData.append("report_type", reportType);
      if (file) formData.append("file", file);
      return resourceApi.uploadReport(formData);
    },
    onSuccess: () => {
      toast.success("Report uploaded");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setUploadOpen(false);
      setPatientId("");
      setReportName("");
      setReportType("");
      setFile(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: resourceApi.deleteReport,
    onSuccess: () => {
      toast.success("Report deleted");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Medical reports, previews, downloads, and uploads" actionLabel="Upload Report" onAction={() => setUploadOpen(true)} />
      {query.isError ? <UnavailableState feature="Reports" onRetry={() => query.refetch()} /> : (
        <Card>
          <TableToolbar search={table.search} onSearch={table.setSearch} onExportCsv={() => exportCsv("reports.csv", table.filtered as unknown as Record<string, unknown>[])} onPrint={() => window.print()} />
          <Box sx={{ overflowX: "auto" }}>
            <Table stickyHeader><TableHead><TableRow>{["Patient", "Report", "Type", "Uploaded", "Actions"].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>{table.paged.map(row => <TableRow key={row.id}><TableCell>{row.patient_id}</TableCell><TableCell>{row.report_name}</TableCell><TableCell>{row.report_type}</TableCell><TableCell>{new Date(row.uploaded_at).toLocaleString()}</TableCell><TableCell><Button size="small" startIcon={<Eye size={16} />} href={row.file_path} target="_blank">Preview</Button><Button size="small" startIcon={<Download size={16} />} href={row.file_path}>Download</Button><IconButton color="error" onClick={() => deleteMutation.mutate(row.id)}><Trash2 size={18} /></IconButton></TableCell></TableRow>)}</TableBody>
            </Table>
          </Box>
          <TablePagination component="div" count={table.filtered.length} page={table.page} rowsPerPage={table.rowsPerPage} onPageChange={(_, p) => table.setPage(p)} onRowsPerPageChange={e => table.setRowsPerPage(Number(e.target.value))} />
        </Card>
      )}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Report</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Patient ID" type="number" value={patientId} onChange={event => setPatientId(event.target.value)} />
            <TextField label="Report Name" value={reportName} onChange={event => setReportName(event.target.value)} />
            <TextField label="Report Type" value={reportType} onChange={event => setReportType(event.target.value)} />
            <Button variant="outlined" component="label">Choose File<input hidden type="file" onChange={event => setFile(event.target.files?.[0] || null)} /></Button>
            {file && <TextField label="Selected File" value={file.name} InputProps={{ readOnly: true }} />}
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setUploadOpen(false)}>Cancel</Button><Button variant="contained" disabled={!patientId || !reportName || !reportType || !file || uploadMutation.isPending} onClick={() => uploadMutation.mutate()}>Upload</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
