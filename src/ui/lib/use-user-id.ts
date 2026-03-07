import { useCallback, useState } from "react";

const STORAGE_KEY = "yfm3_user_id";

function getStoredUserId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function useUserId(): [string, (id: string) => void] {
  const [userId, setUserIdState] = useState(getStoredUserId);

  const setUserId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setUserIdState(id);
  }, []);

  return [userId, setUserId];
}
