"use client";

import type { ReactNode } from "react";

import type { ConfigurationTab } from "./configuration-toolbar";
import { ConfigurationHeaderRegistration } from "./configuration-header-registration";
import { ConfigurationMetrics } from "./configuration-metrics";
import { ConfigurationSurface } from "./configuration-surface";
import { ConfigurationToolbar } from "./configuration-toolbar";

export function ConfigurationPage({
  activeTab,
  onActiveTabChange,
  searchValue,
  onSearchValueChange,
  onCreate,
  banksCount,
  motorsCount,
  banksWithMotorCount,
  banksInactiveCount,
  activeBanks,
  banksWithoutMotor,
  motorTemplates,
  table,
  dialogs,
}: {
  activeTab: ConfigurationTab;
  onActiveTabChange: (value: ConfigurationTab) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onCreate: () => void;
  banksCount: number;
  motorsCount: number;
  banksWithMotorCount: number;
  banksInactiveCount: number;
  activeBanks: number;
  banksWithoutMotor: number;
  motorTemplates: number;
  table: ReactNode;
  dialogs?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--supervisor-page-background)]">
      <div className="scrollbar-surface flex flex-1 flex-col gap-4 overflow-auto p-4">
        <ConfigurationHeaderRegistration activeTab={activeTab} />

        <ConfigurationMetrics
          activeBanks={activeBanks}
          banksWithoutMotor={banksWithoutMotor}
          motorTemplates={motorTemplates}
          banksUsingMotorTemplate={banksWithMotorCount}
        />

        <ConfigurationSurface>
          <ConfigurationToolbar
            activeTab={activeTab}
            onActiveTabChange={onActiveTabChange}
            searchValue={searchValue}
            onSearchValueChange={onSearchValueChange}
            onCreate={onCreate}
            banksCount={banksCount}
            motorsCount={motorsCount}
            banksWithMotorCount={banksWithMotorCount}
            banksInactiveCount={banksInactiveCount}
          />

          <div className="flex min-h-0 flex-col">{table}</div>
        </ConfigurationSurface>
      </div>

      {dialogs}
    </div>
  );
}
