import { useCallback } from "react";
import { useJob, type Job } from "@/contexts/JobProvider";
import { type AppView, useNavigation, isTestSessionView } from "@/contexts/NavigationProvider";
import { useTelemetry } from "@/contexts/TelemetryProvider";

export function useTestSessionNavigation() {
  const { selectJob, clearJob, setTestConfig, currentJob } = useJob();
  const { currentView, setCurrentView } = useNavigation();
  const { resetTelemetry } = useTelemetry();

  const isInTestSession = isTestSessionView(currentView);

  const openTestSession = useCallback(
    async (job: Job, targetView: Extract<AppView, "setup" | "analytics">) => {
      resetTelemetry();
      await selectJob(job);

      if (targetView === "analytics" && job.testResults) {
        setTestConfig(job.testResults.testConfig);
      }

      setCurrentView(targetView);
    },
    [resetTelemetry, selectJob, setCurrentView, setTestConfig],
  );

  const leaveTestSession = useCallback(
    (targetView: Exclude<AppView, "setup" | "cockpit" | "analytics"> = "dashboard") => {
      resetTelemetry();
      clearJob();
      setCurrentView(targetView);
    },
    [resetTelemetry, clearJob, setCurrentView],
  );

  const goToTestView = useCallback(
    (targetView: Extract<AppView, "setup" | "cockpit" | "analytics">) => {
      setCurrentView(targetView);
    },
    [setCurrentView],
  );

  return {
    currentJob,
    isInTestSession,
    openTestSession,
    leaveTestSession,
    goToTestView,
  };
}

