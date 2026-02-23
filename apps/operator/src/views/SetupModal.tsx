/**
 * SetupModal.tsx - Enhanced with Tabs and Protocol Details
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  Plus,
  Minus,
  Settings as SettingsIconImport,
  ClipboardList as ClipboardListIconImport,
  FileText as FileTextIcon,
  Play,
  Save,
  CheckCircle2,
  AlertCircle,
  Activity,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useJob, TestPoint } from "@/contexts/JobProvider";
import { getTestPdf } from "@pump-iot/core/api";
import { useNavigation } from "@/contexts/NavigationProvider";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";

const BANK_OPTIONS = ["A", "B", "C", "D", "E"] as const;

// Fix for Lucide icons in some environments
const XIcon = X as any;
const SettingsIcon = SettingsIconImport as any;
const ClipboardListIcon = ClipboardListIconImport as any;
const FileTextIconFixed = FileTextIcon as any;
const PlusIcon = Plus as any;
const MinusIcon = Minus as any;
const SaveIcon = Save as any;
const FileCheckIcon = CheckCircle2 as any;
const ChevronRightIcon = ChevronRight as any;
const ActivityIcon = Activity as any;
const DropletsIcon = Droplets as any;

export const SetupModal: React.FC = () => {
  const {
    currentJob,
    testConfig,
    setTestConfig,
    updateJob,
    clearJob,
    lockProtocol,
    unlockProtocol,
  } = useJob();
  const { setCurrentView } = useNavigation();

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

  // Protocol Form State - Cast as any to avoid strict type checks on partial updates
  const [protocolForm, setProtocolForm] = useState<any>(
    currentJob?.protocolSpec || {},
  );
  const [isDirty, setIsDirty] = useState(false);

  // Sync form when currentJob updates with full backend details
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
      } catch (error) {
        console.error("Failed to save protocol", error);
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
    // Release the SignalR lock before navigating away
    clearJob();
    setCurrentView("dashboard");
  };

  if (!currentJob) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
      >
        {/* Blurred backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl border border-white/10 w-full max-w-[95vw] lg:max-w-7xl h-[90vh] flex flex-col overflow-hidden"
        >
          <Tabs
            defaultValue="protocol"
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Header with Integrated Tabs */}
            <div className="bg-card/50 backdrop-blur-xl p-4 md:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 z-10">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                    Prueba{" "}
                    <span className="text-muted-foreground font-mono font-normal">
                      #{currentJob.orderId}
                    </span>
                  </h2>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {currentJob.client} • {currentJob.model}
                  </p>
                </div>

                {/* Divider */}
                <div className="hidden md:block h-8 w-px bg-border/50 mx-2"></div>

                {/* Tabs List within Header */}
                <TabsList className="bg-secondary/50 p-1 rounded-xl hidden md:flex">
                  <TabsTrigger
                    value="protocol"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4"
                  >
                    <ClipboardListIcon className="w-4 h-4 mr-2" /> Protocolo
                  </TabsTrigger>
                  <TabsTrigger
                    value="config"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" /> Configuración
                  </TabsTrigger>
                  <TabsTrigger
                    value="docs"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4"
                  >
                    <FileTextIconFixed className="w-4 h-4 mr-2" /> Documentos
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex items-center gap-3">
                {/* Visible Tabs for Mobile */}
                <TabsList className="bg-secondary/50 p-1 rounded-xl flex md:hidden flex-1">
                  <TabsTrigger
                    value="protocol"
                    className="flex-1 rounded-lg text-xs"
                  >
                    <ClipboardListIcon className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="config"
                    className="flex-1 rounded-lg text-xs"
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="docs"
                    className="flex-1 rounded-lg text-xs"
                  >
                    <FileTextIconFixed className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>

                <button
                  onClick={handleClose}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary/80 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-secondary/5 p-4 md:p-8 relative">
              {/* PROTOCOL TAB (First position) */}
              <TabsContent
                value="protocol"
                className="space-y-6 m-0 pb-32 max-w-7xl mx-auto focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2"
              >
                {/* Row 0: General Info */}
                <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                  <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                    <FileTextIconFixed className="w-4 h-4 text-primary" />
                    Información General
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                        Pedido Cliente
                      </label>
                      <input
                        type="text"
                        value={protocolForm.customerOrder || ""}
                        onChange={(e) =>
                          handleProtocolChange("customerOrder", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                        className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                        Cantidad Bombas
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
                        className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                        Tolerancia
                      </label>
                      <input
                        type="text"
                        value={protocolForm.tolerance || ""}
                        onChange={(e) =>
                          handleProtocolChange("tolerance", e.target.value)
                        }
                        className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
                {/* Row 1: Pump & Motor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* BOMB SECTION */}
                  <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                    <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                      <SettingsIcon className="w-4 h-4 text-primary" />
                      Datos Bomba
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Work Order moved here */}
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Orden Trabajo
                        </label>
                        <input
                          type="text"
                          value={protocolForm.workOrder || ""}
                          onChange={(e) =>
                            handleProtocolChange("workOrder", e.target.value)
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Item
                        </label>
                        <input
                          type="text"
                          value={protocolForm.itemNumber || ""}
                          onChange={(e) =>
                            handleProtocolChange("itemNumber", e.target.value)
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Tipo
                        </label>
                        <input
                          type="text"
                          value={protocolForm.pumpType || ""}
                          onChange={(e) =>
                            handleProtocolChange("pumpType", e.target.value)
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Número de Serie
                        </label>
                        <input
                          type="text"
                          value={protocolForm.serialNumber || ""}
                          onChange={(e) =>
                            handleProtocolChange("serialNumber", e.target.value)
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Asp. Ø (mm)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Desc. Ø (mm)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Rodete Ø (mm)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Tipo Cierre
                        </label>
                        <select
                          value={protocolForm.sealType || "MECANICO"}
                          onChange={(e) =>
                            handleProtocolChange("sealType", e.target.value)
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        >
                          <option value="MECANICO">MECANICO</option>
                          <option value="CARTUCHO">CARTUCHO</option>
                          <option value="EMPAQUETADURA">EMPAQUETADURA</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex items-center gap-3 bg-secondary/20 p-3 rounded-xl border border-white/5">
                        <input
                          type="checkbox"
                          id="isVertical"
                          checked={protocolForm.isVertical || false}
                          onChange={(e) =>
                            handleProtocolChange("isVertical", e.target.checked)
                          }
                          className="w-5 h-5 rounded-md border-white/10 bg-secondary/50 text-primary focus:ring-primary/50"
                        />
                        <label
                          htmlFor="isVertical"
                          className="text-sm font-medium text-foreground cursor-pointer select-none"
                        >
                          Bomba Vertical
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* MOTOR SECTION */}
                  <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                    <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                      <ActivityIcon className="w-4 h-4 text-primary" />
                      Motor
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Marca
                        </label>
                        <input
                          type="text"
                          value={protocolForm.motorBrand || ""}
                          onChange={(e) =>
                            handleProtocolChange("motorBrand", e.target.value)
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Tipo
                        </label>
                        <input
                          type="text"
                          value={protocolForm.motorType || ""}
                          onChange={(e) =>
                            handleProtocolChange("motorType", e.target.value)
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Velocidad (rpm)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Intensidad (A)
                        </label>
                        <input
                          type="number"
                          value={protocolForm.current || ""}
                          onChange={(e) =>
                            handleProtocolChange(
                              "current",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>

                      {/* Efficiency Points */}
                      <div className="col-span-2 mt-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1 mb-2 block">
                          Rendimiento (%)
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {["25", "50", "75", "100", "125"].map((point) => (
                            <div key={point} className="space-y-1 text-center">
                              <span className="text-[10px] text-muted-foreground">
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
                                className="w-full bg-secondary/30 border border-white/5 rounded-lg px-1 py-1.5 text-xs font-mono font-bold text-center text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Pressures & Temps */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* PRESSURES */}
                  <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                    <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                      <DropletsIcon className="w-4 h-4 text-primary" />
                      Presiones
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TEMPERATURES */}
                  <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                    <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                      <DropletsIcon className="w-4 h-4 text-primary" />
                      Temperatura (°C)
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Tiempo op. (min)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Guaranteed Points */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* WATER POINT */}
                  <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                    <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                      <FileCheckIcon className="w-4 h-4 text-green-500" />
                      Punto Garantizado (Agua)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Velocidad (rpm)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-red-400 font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-red-400 font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FLUID POINT */}
                  <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                    <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                      <DropletsIcon className="w-4 h-4 text-primary" />
                      Punto Garantizado (Fluido Esp.)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Fluido
                        </label>
                        <input
                          type="text"
                          value={protocolForm.fluidName || ""}
                          onChange={(e) =>
                            handleProtocolChange("fluidName", e.target.value)
                          }
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Viscosidad (cst)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Densidad (kg/m³)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Caudal (m³/h)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Altura (m)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Velocidad (rpm)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Potencia (kW)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                          Rendimiento (%)
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
                          className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="col-span-2 mt-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1 mb-2 block">
                          Coeficientes (Curva Fluido)
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground">
                              Cq (Caudal)
                            </label>
                            <input
                              type="number"
                              value={protocolForm.cq || ""}
                              onChange={(e) =>
                                handleProtocolChange(
                                  "cq",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                              step="0.0001"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground">
                              Ch (Altura)
                            </label>
                            <input
                              type="number"
                              value={protocolForm.ch || ""}
                              onChange={(e) =>
                                handleProtocolChange(
                                  "ch",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                              step="0.0001"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground">
                              Ce (Rendim.)
                            </label>
                            <input
                              type="number"
                              value={protocolForm.ce || ""}
                              onChange={(e) =>
                                handleProtocolChange(
                                  "ce",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-secondary/30 border border-white/5 rounded-xl px-3 py-2 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                              step="0.0001"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMMENTS */}
                <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                    Comentarios Internos
                  </h3>
                  <textarea
                    value={protocolForm.internalComment || ""}
                    onChange={(e) =>
                      handleProtocolChange("internalComment", e.target.value)
                    }
                    className="w-full bg-secondary/30 border border-white/5 rounded-xl px-4 py-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/50 outline-none resize-none text-foreground placeholder:text-muted-foreground"
                    placeholder="Agregar comentarios sobre el equipo o la prueba..."
                  />
                </div>
              </TabsContent>

              {/* CONFIGURATION TAB (Second position) */}
              <TabsContent
                value="config"
                className="space-y-8 m-0 h-full max-w-6xl mx-auto focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Bank & Pressure */}
                  <div className="space-y-8">
                    <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                      <label className="text-sm font-semibold text-foreground mb-4 block flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4 text-primary" />
                        Selección de Banco
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {BANK_OPTIONS.map((bank) => (
                          <motion.button
                            key={bank}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedBank(bank)}
                            className={cn(
                              "w-16 h-16 rounded-2xl text-2xl font-bold transition-all border-2",
                              selectedBank === bank
                                ? "border-primary bg-primary/10 text-primary shadow-lg"
                                : "border-transparent bg-secondary text-muted-foreground hover:bg-secondary/80",
                            )}
                          >
                            {bank}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-border/50 bg-card/60">
                      <label className="text-sm font-semibold text-foreground mb-3 block">
                        Presión de Prueba (bar)
                      </label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={testPressure}
                          onChange={(e) =>
                            setTestPressure(Number(e.target.value))
                          }
                          className="h-16 text-3xl font-mono text-center font-bold rounded-2xl bg-secondary/30 border-secondary-foreground/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min={1}
                          max={20}
                          step={0.5}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Flow Points */}
                  <div className="glass-panel p-6 rounded-3xl border border-border/50 h-full flex flex-col bg-card/60">
                    <div className="flex justify-between items-center mb-6">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4 text-primary" />
                        Puntos de Caudal (m³/h)
                      </label>
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={removePoint}
                          disabled={points.length <= 2}
                          className="h-9 w-9 rounded-lg"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-bold font-mono">
                          {points.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={addPoint}
                          disabled={points.length >= 10}
                          className="h-9 w-9 rounded-lg"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-2 gap-4">
                        {points.map((point, index) => (
                          <div key={point.id} className="relative group">
                            <span className="absolute left-3 top-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider z-10">
                              {index === 0
                                ? "Mínimo"
                                : point.targetFlow === currentJob.targetFlow
                                  ? "Nominal"
                                  : `Punto ${index + 1}`}
                            </span>
                            <Input
                              type="number"
                              value={point.targetFlow}
                              onChange={(e) =>
                                updatePointFlow(index, Number(e.target.value))
                              }
                              className={cn(
                                "h-20 pt-7 pb-2 text-center font-mono text-xl font-bold rounded-2xl transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                point.targetFlow === currentJob.targetFlow
                                  ? "bg-primary/10 border-primary/30 text-primary ring-2 ring-primary/20"
                                  : "bg-secondary/30 border-transparent focus:bg-background",
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* DOCUMENTS TAB */}
              <TabsContent
                value="docs"
                className="m-0 h-full max-w-4xl mx-auto focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-panel p-8 rounded-3xl border border-border/50 flex flex-col items-center justify-center text-center gap-6 bg-secondary/20 min-h-[300px]">
                    <div className="w-24 h-24 rounded-3xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-2 shadow-inner">
                      <FileCheckIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        Protocolo de Prueba.pdf
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Versión 1.0 • 2.4 MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2 rounded-full px-6"
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
                      Abrir Documento
                    </Button>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl border border-border/50 flex flex-col items-center justify-center text-center gap-6 bg-secondary/20 min-h-[300px]">
                    <div className="w-24 h-24 rounded-3xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-2 shadow-inner">
                      <ClipboardListIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        Ficha Técnica
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {currentJob.model}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2 rounded-full px-6"
                    >
                      <FileTextIconFixed className="w-4 h-4" />
                      Abrir Ficha Técnica
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* Floating Actions */}
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-50 pointer-events-none">
              <AnimatePresence>
                {isDirty && (
                  <motion.button
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    onClick={handleSaveProtocol}
                    disabled={isSaving}
                    className="pointer-events-auto bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-5 h-5" />
                        Guardar Cambios
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                className="pointer-events-auto bg-green-600 text-white px-6 h-12 rounded-full font-bold shadow-md hover:bg-green-500 transition-all flex items-center gap-2 text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                Comenzar Prueba
              </motion.button>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
