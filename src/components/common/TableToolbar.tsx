import { Button, Stack, TextField, Tooltip } from "@mui/material";
import { Download, Printer, SlidersHorizontal } from "lucide-react";

export function TableToolbar({
  search,
  onSearch,
  onExportCsv,
  onPrint,
}: {
  search: string;
  onSearch: (value: string) => void;
  onExportCsv?: () => void;
  onPrint?: () => void;
}) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ p: 2 }} alignItems={{ md: "center" }}>
      <TextField
        label="Search"
        value={search}
        onChange={event => onSearch(event.target.value)}
        size="small"
        sx={{ flex: 1 }}
      />
      <Tooltip title="Column preferences are unavailable for this backend version.">
        <Button startIcon={<SlidersHorizontal size={16} />} variant="outlined" disabled>Columns</Button>
      </Tooltip>
      <Button startIcon={<Download size={16} />} variant="outlined" onClick={onExportCsv}>CSV</Button>
      <Button startIcon={<Download size={16} />} variant="outlined" disabled>Excel</Button>
      <Button startIcon={<Printer size={16} />} variant="outlined" onClick={onPrint}>Print</Button>
    </Stack>
  );
}
