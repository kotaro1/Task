import { useEffect } from "react";

export function useFocusRefetch(callback: () => void) {
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") callback();
    }
    window.addEventListener("focus", callback);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", callback);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [callback]);
}
