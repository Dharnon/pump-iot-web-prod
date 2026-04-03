"use client";

import { Database, Settings2, Zap } from "lucide-react";

import { ConfigurationStatCard } from "./configuration-stat-card";

export function ConfigurationMetrics({
  activeBanks,
  banksWithoutMotor,
  motorTemplates,
  banksUsingMotorTemplate,
}: {
  activeBanks: number;
  banksWithoutMotor: number;
  motorTemplates: number;
  banksUsingMotorTemplate: number;
}) {
  return (
    <div className="grid auto-rows-min gap-3 md:grid-cols-3">
      <ConfigurationStatCard
        title="Bancos activos"
        value={activeBanks}
        description="Bancos listos para operar dentro del entorno."
        icon={Database}
      />
      <ConfigurationStatCard
        title="Sin motor asignado"
        value={banksWithoutMotor}
        description="Pendientes de vincular con una plantilla de motor."
        icon={Settings2}
      />
      <ConfigurationStatCard
        title="Plantillas de motor"
        value={motorTemplates}
        description={`${banksUsingMotorTemplate} bancos usan una plantilla actualmente.`}
        icon={Zap}
      />
    </div>
  );
}
