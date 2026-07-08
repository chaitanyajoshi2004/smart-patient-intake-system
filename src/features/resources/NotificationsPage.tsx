import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusChip } from "../../components/common/StatusChip";
import { UnavailableState } from "../../components/common/UnavailableState";
import { resourceApi } from "../../services/resourceApi";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["notifications"], queryFn: resourceApi.notifications, refetchInterval: 30000 });
  const markRead = useMutation({
    mutationFn: resourceApi.markNotificationRead,
    onSuccess: () => {
      toast.success("Notification updated");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const markAllRead = useMutation({
    mutationFn: resourceApi.markAllNotificationsRead,
    onSuccess: () => {
      toast.success("Notifications updated");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <Box>
      <PageHeader title="Notifications" subtitle="Unread alerts and clinical operations updates" />
      {query.isError ? <UnavailableState feature="Notifications" onRetry={() => query.refetch()} /> : (
        <Stack spacing={2}>
          <Button variant="outlined" disabled={(query.data || []).every(item => item.is_read) || markAllRead.isPending} onClick={() => markAllRead.mutate()}>Mark all read</Button>
          {(query.data || []).map(item => (
            <Card key={item.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" gap={2}>
                  <Box><Typography fontWeight={700}>{item.title}</Typography><Typography color="text.secondary">{item.message}</Typography></Box>
                  <Stack alignItems="flex-end" spacing={1}>
                    <StatusChip value={item.is_read ? "read" : "unread"} />
                    {!item.is_read && <Button size="small" onClick={() => markRead.mutate(item.id)}>Mark read</Button>}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
