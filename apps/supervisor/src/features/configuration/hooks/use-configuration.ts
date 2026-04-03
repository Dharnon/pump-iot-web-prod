import { useConfigurationActions } from "./use-configuration-actions";
import { useConfigurationData } from "./use-configuration-data";
import { useConfigurationWorkspaceState } from "./use-configuration-workspace-state";

export function useConfiguration() {
  const workspace = useConfigurationWorkspaceState();
  const data = useConfigurationData();
  const actions = useConfigurationActions(data);

  return {
    activeTab: workspace.activeTab,
    setActiveTab: workspace.setActiveTab,
    ...data.motores,
    ...data.bancos,
    ...actions,
  };
}
