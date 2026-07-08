import { useMemo, useState } from "react";

export function useClientTable<T>(rows: T[], searchable: (row: T) => string, initialRowsPerPage = 10) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(row => searchable(row).toLowerCase().includes(q));
  }, [rows, search, searchable]);

  const paged = useMemo(() => (
    filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  ), [filtered, page, rowsPerPage]);

  return { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, filtered, paged };
}
