import type { Test } from "@/lib/api";
import type { Locks } from "@/hooks/useSignalR";

export type InboxViewMode =
  | "pending"
  | "protocols"
  | "en_banco"
  | "completed";
export type InboxStatusFilter =
  | "all"
  | "PENDING"
  | "GENERATED"
  | "GENERADO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EN_BANCO";

export function getPendingTests(tests: Test[]) {
  return tests.filter((test) => test.id.startsWith("pending-"));
}

export function getGeneratedTests(tests: Test[]) {
  return tests.filter((test) => !test.id.startsWith("pending-"));
}

export function getGeneratedTestsOnly(tests: Test[], locks: Locks) {
  return tests.filter((test) => {
    const isGenerated =
      test.status === "GENERATED" || test.status === "GENERADO";
    return isGenerated && !locks[test.id];
  });
}

export function getInProgressTests(tests: Test[], locks: Locks) {
  return tests.filter(
    (test) => test.status === "IN_PROGRESS" || Boolean(locks[test.id]),
  );
}

export function filterInboxTests({
  viewMode,
  statusFilter,
  pendingTests,
  generatedTests,
  locks,
}: {
  viewMode: InboxViewMode;
  statusFilter: InboxStatusFilter;
  pendingTests: Test[];
  generatedTests: Test[];
  locks: Locks;
}) {
  if (viewMode === "pending") {
    const dataSource = pendingTests;

    if (statusFilter === "all") {
      return dataSource;
    }

    return dataSource.filter((test) => test.status === statusFilter);
  }

  if (viewMode === "en_banco") {
    return generatedTests.filter((test) => test.status === "EN_BANCO");
  }

  if (viewMode === "completed") {
    return generatedTests.filter((test) => test.status === "COMPLETED");
  }

  const dataSource = generatedTests;

  if (statusFilter === "all") {
    return dataSource;
  }

  return dataSource.filter((test) => {
    if (statusFilter === "IN_PROGRESS") {
      return test.status === "IN_PROGRESS" || Boolean(locks[test.id]);
    }

    if (statusFilter === "GENERATED" || statusFilter === "GENERADO") {
      const isGenerated =
        test.status === "GENERATED" || test.status === "GENERADO";
      return isGenerated && !locks[test.id];
    }

    if (statusFilter === "EN_BANCO") {
      return test.status === "EN_BANCO";
    }

    return test.status === statusFilter;
  });
}
