import { useCallback, useEffect, useState } from "react";
import { fetchHealth } from "../api/chat";

export function useHealth(intervalMs = 10000) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (error) {
      setHealth({
        connected: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, intervalMs);
    return () => clearInterval(timer);
  }, [refresh, intervalMs]);

  const canSend =
    health?.connected && health?.model_ready !== false && !loading;

  return { health, loading, canSend, refresh };
}
