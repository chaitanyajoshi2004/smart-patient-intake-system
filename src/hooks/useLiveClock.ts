import dayjs from "dayjs";
import { useEffect, useState } from "react";

export function useLiveClock() {
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(dayjs()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return {
    day: now.format("dddd"),
    date: now.format("DD MMMM YYYY"),
    time: now.format("hh:mm:ss A"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
