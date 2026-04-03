import { useState } from "react";

import type { ConfigurationTab } from "../lib/configuration-model";

export function useConfigurationWorkspaceState() {
  const [activeTab, setActiveTab] = useState<ConfigurationTab>("bancos");

  return {
    activeTab,
    setActiveTab,
  };
}
