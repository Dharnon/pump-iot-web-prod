/**
 * SetupPage.tsx - Full-page Setup view with dense layout
 *
 * Converted from modal to full-page view with:
 * - Sidebar navigation
 * - Dense CSS Grid layout
 * - All fields visible without scrolling
 */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Settings as SettingsIconImport,
  ClipboardList as ClipboardListIconImport,
  FileText as FileTextIcon,
  Save,
  CheckCircle2,
  AlertCircle as AlertCircleImport,
  Activity,
  Droplets,
  Home,
  Wrench,
  LogOut,
  Search,
  BarChart3,
  Play as PlayImport,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useJob, TestPoint } from "@/contexts/JobProvider";
import { getTestPdf } from "@pump-iot/core/api";
import { useNavigation } from "@/contexts/NavigationProvider";
import { useTestSessionNavigation } from "@/hooks/useTestSessionNavigation";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";

const BANK_OPTIONS = ["A", "B", "C", "D", "E"] as const;

// Fix for Lucide icons - type casting
const SettingsIcon = SettingsIconImport as any;
const ClipboardListIcon = ClipboardListIconImport as any;
const FileTextIconFixed = FileTextIcon as any;
const PlusIcon = Plus as any;
const MinusIcon = Minus as any;
const SaveIcon = Save as any;
const FileCheckIcon = CheckCircle2 as any;
const ActivityIcon = Activity as any;
const DropletsIcon = Droplets as any;
const HomeIcon = Home as any;
const WrenchIcon = Wrench as any;
const LogOutIcon = LogOut as any;
const BarChart3Icon = BarChart3 as any;
const AlertCircleFixed = AlertCircleImport as any;
const PlayFixed = PlayImport as any;

export const SetupPage: React.FC = () => {
  const { currentJob, testConfig, setTestConfig, updateJob } = useJob();
  const { setCurrentView } = useNavigation();
  const { leaveTestSession } = useTestSessionNavigation();

  const [selectedBank, setSelectedBank] = useState<
    (typeof BANK_OPTIONS)[number]
  >(testConfig?.bankId || "A");
  const [testPressure, setTestPressure] = useState(
    testConfig?.testPressure || 6,
  );
  const [points, setPoints] = useState<TestPoint[]>(
    testConfig?.points || [
      { id: 1, targetFlow: 0, captured: false },
      { id: 2, targetFlow: 5, captured: false },
      { id: 3, targetFlow: currentJob?.targetFlow || 10.7, captured: false },
      {
        id: 4,
        targetFlow: (currentJob?.targetFlow || 10.7) * 1.1,
        captured: false,
      },
      {
        id: 5,
        targetFlow: (currentJob?.targetFlow || 10.7) * 1.3,
        captured: false,
      },
    ],
  );

  // Protocol Form State
  const [protocolForm, setProtocolForm] = useState<any>(
    currentJob?.protocolSpec || {},
  );
  const [isDirty, setIsDirty] = useState(false);

  // Sync form when currentJob updates
  useEffect(() => {
    if (currentJob?.protocolSpec) {
      setProtocolForm(currentJob.protocolSpec);
    }
  }, [currentJob]);

  // Helper to update protocol form
  const handleProtocolChange = (field: string, value: any) => {
    setProtocolForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProtocol = async () => {
    if (currentJob) {
      setIsSaving(true);
      try {
        await updateJob({ protocolSpec: protocolForm });
        setIsDirty(false);
        toast.success("Protocolo guardado correctamente");
      } catch (error) {
        console.error("Failed to save protocol", error);
        toast.error("Error al guardar el protocolo");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const addPoint = () => {
    if (points.length >= 10) return;
    const newPoint: TestPoint = {
      id: points.length + 1,
      targetFlow: 0,
      captured: false,
    };
    setPoints([...points, newPoint]);
  };

  const removePoint = () => {
    if (points.length <= 2) return;
    setPoints(points.slice(0, -1));
  };

  const updatePointFlow = (index: number, value: number) => {
    const updated = [...points];
    updated[index] = { ...updated[index], targetFlow: value };
    setPoints(updated);
  };

  const handleConfirm = () => {
    setTestConfig({
      bankId: selectedBank,
      testPressure,
      points,
    });
    setCurrentView("cockpit");
  };

  const handleClose = () => {
    leaveTestSession("dashboard");
  };

  const sidebarItems = [
    {
      icon: HomeIcon,
      label: "Inicio",
      onClick: () => leaveTestSession("dashboard"),
    },
    {
      icon: WrenchIcon,
      label: "Programación",
      onClick: () => leaveTestSession("programacion"),
    },
    {
      icon: BarChart3Icon,
      label: "Reportes",
      onClick: () => setCurrentView("analytics"),
    },
    {
      icon: LogOutIcon,
      label: "Salir",
      onClick: handleClose,
    },
  ];

  if (!currentJob) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircleFixed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No hay trabajo seleccionado
          </h2>
          <p className="text-muted-foreground mb-4">
            Selecciona un trabajo desde el Dashboard para comenzar
          </p>
          <Button
            onClick={() => setCurrentView("dashboard")}
            className="rounded-xl"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-16 md:w-20 lg:w-24 bg-card border-r border-border flex flex-col items-center py-4 shrink-0">
        <div className="flex flex-col gap-2 w-full px-2">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                "hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] hidden lg:block">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card/50 backdrop-blur-sm border-b border-border px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                Prueba{" "}
                <span className="text-muted-foreground font-mono font-normal">
                  #{currentJob.orderId}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentJob.client} • {currentJob.model}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="protocol" className="hidden md:block">
            <TabsList className="bg-secondary/50 p-1 rounded-xl">
              <TabsTrigger value="protocol" className="rounded-lg px-3 text-xs">
                <ClipboardListIcon className="w-3 h-3 mr-1.5" /> Protocolo
              </TabsTrigger>
              <TabsTrigger value="config" className="rounded-lg px-3 text-xs">
                <SettingsIcon className="w-3 h-3 mr-1.5" /> Configuración
              </TabsTrigger>
              <TabsTrigger value="docs" className="rounded-lg px-3 text-xs">
                <FileTextIconFixed className="w-3 h-3 mr-1.5" /> Documentos
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Mobile Tabs */}
          <Tabs defaultValue="protocol" className="md:hidden">
            <TabsList className="bg-secondary/50 p-1 rounded-xl">
              <TabsTrigger value="protocol" className="rounded-lg px-2">
                <ClipboardListIcon className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="config" className="rounded-lg px-2">
                <SettingsIcon className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="docs" className="rounded-lg px-2">
                <FileTextIconFixed className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isDirty && (
              <Button
                size="sm"
                onClick={handleSaveProtocol}
                disabled={isSaving}
                className="rounded-xl bg-primary text-primary-foreground"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Guardar</span>
                  </>
                )}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleConfirm}
              className="rounded-xl bg-green-600 hover:bg-green-500 text-white"
            >
              <PlayFixed className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Comenzar</span>
            </Button>
          </div>
        </header>

        {/* Content Area - Dense Grid Layout */}
        <div className="flex-1 overflow-y-auto p-2 md:p-3 w-full bg-secondary/5">
          <Tabs defaultValue="protocol" className="h-full">
            {/* PROTOCOL TAB - Dense Grid */}
            <TabsContent
              value="protocol"
              className="m-0 h-full focus-visible:outline-none"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
                {/* Balanced Grid for Protocol Fields - 2 Rows of 4 Cards */}
                <div className="bg-card/60 rounded-xl border border-border/50 p-2">
                  <h3 className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileTextIconFixed className="w-3 h-3 text-primary" />
                    Información General
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Pedido Cliente
                      </label>
                      <input
                        type="text"
                        value={protocolForm.customerOrder || ""}
                        onChange={(e) =>
                          handleProtocolChange("customerOrder", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={
                          protocolForm.jobDate
                            ? typeof protocolForm.jobDate === "string" &&
                              protocolForm.jobDate.includes("T")
                              ? protocolForm.jobDate.split("T")[0]
                              : protocolForm.jobDate
                            : ""
                        }
                        onChange={(e) =>
                          handleProtocolChange("jobDate", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Cant. Bombas
                      </label>
                      <input
                        type="number"
                        value={protocolForm.pumpQuantity || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "pumpQuantity",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Tolerancia
                      </label>
                      <input
                        type="text"
                        value={protocolForm.tolerance || ""}
                        onChange={(e) =>
                          handleProtocolChange("tolerance", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Main Grid - 4 columns */}
                <div className="bg-card/60 rounded-xl border border-border/50 p-2">
                  <h3 className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <SettingsIcon className="w-3 h-3 text-primary" />
                    Bomba
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="col-span-2 space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Orden Trabajo / SN
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={protocolForm.workOrder || ""}
                          onChange={(e) =>
                            handleProtocolChange("workOrder", e.target.value)
                          }
                          className="flex-1 bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs"
                          placeholder="OT"
                        />
                        <input
                          type="text"
                          value={protocolForm.serialNumber || ""}
                          onChange={(e) =>
                            handleProtocolChange("serialNumber", e.target.value)
                          }
                          className="flex-1 bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs"
                          placeholder="SN"
                        />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Item
                      </label>
                      <input
                        type="text"
                        value={protocolForm.itemNumber || ""}
                        onChange={(e) =>
                          handleProtocolChange("itemNumber", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Tipo
                      </label>
                      <input
                        type="text"
                        value={protocolForm.pumpType || ""}
                        onChange={(e) =>
                          handleProtocolChange("pumpType", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Asp. Ø
                      </label>
                      <input
                        type="number"
                        value={protocolForm.suctionDiameter || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "suctionDiameter",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Desc. Ø
                      </label>
                      <input
                        type="number"
                        value={protocolForm.dischargeDiameter || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "dischargeDiameter",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Rodete
                      </label>
                      <input
                        type="text"
                        value={protocolForm.impellerDiameter || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "impellerDiameter",
                            e.target.value,
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Cierre
                      </label>
                      <select
                        value={protocolForm.sealType || "MECANICO"}
                        onChange={(e) =>
                          handleProtocolChange("sealType", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-0.5 text-xs h-[26px]"
                      >
                        <option value="MECANICO">MECANICO</option>
                        <option value="CARTUCHO">CARTUCHO</option>
                        <option value="EMPAQUETADURA">EMPAQUETADURA</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 bg-secondary/20 px-2 py-1.5 rounded-lg mt-0.5">
                      <input
                        type="checkbox"
                        id="isVertical"
                        checked={protocolForm.isVertical || false}
                        onChange={(e) =>
                          handleProtocolChange("isVertical", e.target.checked)
                        }
                        className="w-3.5 h-3.5"
                      />
                      <label
                        htmlFor="isVertical"
                        className="text-[10px] font-medium"
                      >
                        Bomba Vertical
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-card/60 rounded-xl border border-border/50 p-2">
                  <h3 className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <ActivityIcon className="w-3 h-3 text-primary" />
                    Motor
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Marca
                      </label>
                      <input
                        type="text"
                        value={protocolForm.motorBrand || ""}
                        onChange={(e) =>
                          handleProtocolChange("motorBrand", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Tipo
                      </label>
                      <input
                        type="text"
                        value={protocolForm.motorType || ""}
                        onChange={(e) =>
                          handleProtocolChange("motorType", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Potencia (kW)
                      </label>
                      <input
                        type="number"
                        value={protocolForm.motorPower || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "motorPower",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Velocidad
                      </label>
                      <input
                        type="number"
                        value={protocolForm.nominalSpeed || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "nominalSpeed",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-2 space-y-1 mt-1">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Rendimiento (%)
                      </label>
                      <div className="grid grid-cols-5 gap-1">
                        {["25", "50", "75", "100", "125"].map((point) => (
                          <div key={point} className="text-center">
                            <span className="text-[7px] text-muted-foreground">
                              {point}%
                            </span>
                            <input
                              type="number"
                              value={protocolForm[`efficiency${point}`] || ""}
                              onChange={(e) =>
                                handleProtocolChange(
                                  `efficiency${point}`,
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-secondary/30 border border-white/5 rounded px-1 py-1 text-[9px] font-mono text-center"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card/60 rounded-xl border border-border/50 p-2">
                  <h3 className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <FileCheckIcon className="w-3 h-3 text-green-500" />
                    Punto Garantizado (Agua)
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Caudal (m³/h)
                      </label>
                      <input
                        type="number"
                        value={protocolForm.guaranteedFlow || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "guaranteedFlow",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Altura (m)
                      </label>
                      <input
                        type="number"
                        value={protocolForm.guaranteedHead || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "guaranteedHead",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Velocidad
                      </label>
                      <input
                        type="number"
                        value={protocolForm.guaranteedSpeed || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "guaranteedSpeed",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Potencia (kW)
                      </label>
                      <input
                        type="number"
                        value={protocolForm.guaranteedPower || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "guaranteedPower",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Rendimiento (%)
                      </label>
                      <input
                        type="number"
                        value={protocolForm.guaranteedEfficiency || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "guaranteedEfficiency",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        NPSH Req. (m)
                      </label>
                      <input
                        type="number"
                        value={protocolForm.guaranteedNpshr || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "guaranteedNpshr",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-red-500 font-semibold">
                        Q Min (m³/h)
                      </label>
                      <input
                        type="number"
                        value={protocolForm.guaranteedQMin || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "guaranteedQMin",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/10 border border-red-500/20 rounded-lg px-2 py-1 text-xs font-mono text-red-400"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-red-500 font-semibold">
                        BEP (m³/h)
                      </label>
                      <input
                        type="number"
                        value={protocolForm.bestEfficiencyPointFlow || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "bestEfficiencyPointFlow",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/10 border border-red-500/20 rounded-lg px-2 py-1 text-xs font-mono text-red-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card/60 rounded-xl border border-border/50 p-2 flex flex-col gap-3">
                  {/* Presiones */}
                  <div>
                    <h3 className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <DropletsIcon className="w-3 h-3 text-primary" />
                      Presiones
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Correc. Manom.
                        </label>
                        <input
                          type="number"
                          value={protocolForm.manometricCorrection || ""}
                          onChange={(e) =>
                            handleProtocolChange(
                              "manometricCorrection",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                          P. Atmosférica
                        </label>
                        <input
                          type="number"
                          value={protocolForm.atmosphericPressure || ""}
                          onChange={(e) =>
                            handleProtocolChange(
                              "atmosphericPressure",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Temperaturas */}
                  <div className="border-t border-border/50 pt-2">
                    <h3 className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <DropletsIcon className="w-3 h-3 text-orange-400" />
                      Temp. (°C)
                    </h3>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                      <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Agua
                        </label>
                        <input
                          type="number"
                          value={protocolForm.waterTemperature || ""}
                          onChange={(e) =>
                            handleProtocolChange(
                              "waterTemperature",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Ambiente
                        </label>
                        <input
                          type="number"
                          value={protocolForm.ambientTemperature || ""}
                          onChange={(e) =>
                            handleProtocolChange(
                              "ambientTemperature",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Lado Acople
                        </label>
                        <input
                          type="number"
                          value={protocolForm.couplingTemperature || ""}
                          onChange={(e) =>
                            handleProtocolChange(
                              "couplingTemperature",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Lado Bomba
                        </label>
                        <input
                          type="number"
                          value={protocolForm.pumpTemperature || ""}
                          onChange={(e) =>
                            handleProtocolChange(
                              "pumpTemperature",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-2 space-y-0.5">
                        <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Tiempo op.
                        </label>
                        <input
                          type="number"
                          value={protocolForm.runTime || ""}
                          onChange={(e) =>
                            handleProtocolChange(
                              "runTime",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Fluid Point (Wide 2Cols) & Comments (Wide 2Cols) */}
                <div className="md:col-span-3 lg:col-span-2 bg-card/60 rounded-xl border border-border/50 p-2">
                  <h3 className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <DropletsIcon className="w-3 h-3 text-primary" />
                    Punto Garantizado (Fluido Esp.)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="col-span-2 space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Fluido
                      </label>
                      <input
                        type="text"
                        value={protocolForm.fluidName || ""}
                        onChange={(e) =>
                          handleProtocolChange("fluidName", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Temp. (°C)
                      </label>
                      <input
                        type="number"
                        value={protocolForm.fluidTemperature || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "fluidTemperature",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Viscosidad
                      </label>
                      <input
                        type="number"
                        value={protocolForm.fluidViscosity || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "fluidViscosity",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Densidad
                      </label>
                      <input
                        type="number"
                        value={protocolForm.fluidDensity || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "fluidDensity",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Caudal
                      </label>
                      <input
                        type="number"
                        value={protocolForm.fluidFlow || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "fluidFlow",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Altura
                      </label>
                      <input
                        type="number"
                        value={protocolForm.fluidHead || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "fluidHead",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Velocidad
                      </label>
                      <input
                        type="number"
                        value={protocolForm.fluidSpeed || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "fluidSpeed",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Potencia
                      </label>
                      <input
                        type="number"
                        value={protocolForm.fluidPower || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "fluidPower",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Rendimiento
                      </label>
                      <input
                        type="number"
                        value={protocolForm.fluidEfficiency || ""}
                        onChange={(e) =>
                          handleProtocolChange(
                            "fluidEfficiency",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5 block">
                        Coeficientes (cq, ch, ce)
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={protocolForm.cq || ""}
                          onChange={(e) =>
                            handleProtocolChange("cq", Number(e.target.value))
                          }
                          className="flex-1 bg-secondary/30 border border-white/5 rounded px-2 py-1 text-[11px] font-mono"
                          step="0.0001"
                        />
                        <input
                          type="number"
                          value={protocolForm.ch || ""}
                          onChange={(e) =>
                            handleProtocolChange("ch", Number(e.target.value))
                          }
                          className="flex-1 bg-secondary/30 border border-white/5 rounded px-2 py-1 text-[11px] font-mono"
                          step="0.0001"
                        />
                        <input
                          type="number"
                          value={protocolForm.ce || ""}
                          onChange={(e) =>
                            handleProtocolChange("ce", Number(e.target.value))
                          }
                          className="flex-1 bg-secondary/30 border border-white/5 rounded px-2 py-1 text-[11px] font-mono"
                          step="0.0001"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card/60 rounded-xl border border-border/50 p-2">
                  <h3 className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileTextIconFixed className="w-3 h-3 text-primary" />
                    Comentarios Internos
                  </h3>
                  <textarea
                    value={protocolForm.internalComment || ""}
                    onChange={(e) =>
                      handleProtocolChange("internalComment", e.target.value)
                    }
                    className="w-full h-[152px] bg-secondary/20 border border-white/5 rounded-lg px-3 py-2 text-xs resize-none"
                    placeholder="Escribe aquí notas sobre la prueba..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* CONFIGURATION TAB */}
            <TabsContent
              value="config"
              className="m-0 h-full focus-visible:outline-none"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
                {/* Bank Selection */}
                <div className="bg-card/60 rounded-xl border border-border/50 p-3">
                  <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-primary" />
                    Selección de Banco
                  </label>
                  <div className="flex gap-2">
                    {BANK_OPTIONS.map((bank) => (
                      <button
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={cn(
                          "w-12 h-12 rounded-xl text-lg font-bold transition-all border-2",
                          selectedBank === bank
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-transparent bg-secondary text-muted-foreground hover:bg-secondary/80",
                        )}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Pressure */}
                <div className="bg-card/60 rounded-xl border border-border/50 p-3">
                  <label className="text-sm font-semibold text-foreground mb-3 block">
                    Presión de Prueba (bar)
                  </label>
                  <Input
                    type="number"
                    value={testPressure}
                    onChange={(e) => setTestPressure(Number(e.target.value))}
                    className="h-12 text-xl font-mono text-center font-bold rounded-xl bg-secondary/30"
                    min={1}
                    max={20}
                    step={0.5}
                  />
                </div>

                {/* Flow Points */}
                <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 bg-card/60 rounded-xl border border-border/50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <SettingsIcon className="w-4 h-4 text-primary" />
                      Puntos de Caudal (m³/h)
                    </label>
                    <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removePoint}
                        disabled={points.length <= 2}
                        className="h-7 w-7 rounded-md"
                      >
                        <MinusIcon className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-xs font-bold font-mono">
                        {points.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={addPoint}
                        disabled={points.length >= 10}
                        className="h-7 w-7 rounded-md"
                      >
                        <PlusIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {points.map((point, index) => (
                      <div key={point.id} className="relative">
                        <span className="absolute left-2 top-1 text-[8px] font-medium text-muted-foreground uppercase">
                          {index === 0
                            ? "Mín"
                            : index === points.length - 1
                              ? "Máx"
                              : `P${index + 1}`}
                        </span>
                        <Input
                          type="number"
                          value={point.targetFlow}
                          onChange={(e) =>
                            updatePointFlow(index, Number(e.target.value))
                          }
                          className={cn(
                            "h-12 pt-5 text-center font-mono text-sm font-bold rounded-lg",
                            point.targetFlow === currentJob.targetFlow
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-secondary/30",
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* DOCUMENTS TAB */}
            <TabsContent
              value="docs"
              className="m-0 h-full focus-visible:outline-none"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl mx-auto">
                <div className="bg-card/60 rounded-xl border border-border/50 p-6 flex flex-col items-center text-center gap-4 bg-secondary/20 min-h-[200px] justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <FileCheckIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Protocolo de Prueba.pdf
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Versión 1.0 • 2.4 MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl gap-2"
                    onClick={async () => {
                      try {
                        const blob = await getTestPdf(currentJob.id);
                        const url = window.URL.createObjectURL(blob);
                        window.open(url, "_blank");
                      } catch (error) {
                        console.error("Error opening PDF:", error);
                        toast.error("Error al abrir el documento");
                      }
                    }}
                  >
                    <FileTextIconFixed className="w-4 h-4" />
                    Abrir
                  </Button>
                </div>

                <div className="bg-card/60 rounded-xl border border-border/50 p-6 flex flex-col items-center text-center gap-4 bg-secondary/20 min-h-[200px] justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <ClipboardListIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Ficha Técnica
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {currentJob.model}
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <FileTextIconFixed className="w-4 h-4" />
                    Abrir
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
