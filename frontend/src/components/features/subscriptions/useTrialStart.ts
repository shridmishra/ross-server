import { useState, useCallback } from "react";
import { apiService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/lib/toast";

export function useTrialStart() {
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const { refreshUser } = useAuth();

  const confirmTrial = useCallback(async (onSuccess?: () => void) => {
    if (isStartingTrial) return;
    setIsStartingTrial(true);
    try {
      await apiService.startTrial();
      await refreshUser();
      showToast.success("🎉 Your 7-day free trial has started!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Failed to start trial:", error);
      showToast.error(error.message || "Failed to start free trial.");
    } finally {
      setIsStartingTrial(false);
    }
  }, [isStartingTrial, refreshUser]);

  return {
    confirmTrial,
    isStartingTrial,
  };
}
