import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Droplets, Gauge, Camera, Settings2, Sliders, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FloatingActionBarProps {
    motorOn: boolean;
    onMotorToggle: (on: boolean) => void;
    valveOpening: number;
    onValveChange: (val: number) => void;
    pressureData?: {
        suction: number;
        discharge: number;
        differential: number;
    };
    onCameraPreset?: (preset: 'default' | 'pump' | 'valve' | 'motor') => void;
    className?: string;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
    motorOn,
    onMotorToggle,
    valveOpening,
    onValveChange,
    pressureData = { suction: 1.2, discharge: 4.5, differential: 3.3 },
    onCameraPreset,
    className,
}) => {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const toggleExpand = (item: string) => {
        setExpandedItem(expandedItem === item ? null : item);
    };

    return (
        <TooltipProvider delayDuration={0}>
            <div className={cn("fixed left-6 top-1/2 -translate-y-1/2 z-50 flex items-start gap-4", className)}>
                {/* Main Vertical Bar */}
                <div className="bg-card/80 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl flex flex-col gap-2">
                    {/* Motor Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onMotorToggle(!motorOn)}
                                className={cn(
                                    "w-12 h-12 rounded-xl transition-all duration-300",
                                    motorOn
                                        ? "bg-success text-success-foreground shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                                )}
                            >
                                <Power className={cn("w-6 h-6", motorOn && "animate-pulse")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{motorOn ? 'Detener Motor' : 'Arrancar Motor'}</p>
                        </TooltipContent>
                    </Tooltip>

                    <div className="w-8 h-px bg-white/10 mx-auto my-1" />

                    {/* Valve Control */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleExpand('valve')}
                                className={cn(
                                    "w-12 h-12 rounded-xl transition-colors",
                                    expandedItem === 'valve' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50"
                                )}
                            >
                                <Droplets className="w-6 h-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Control de Válvula ({valveOpening}%)</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Pressure Panel */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleExpand('pressure')}
                                className={cn(
                                    "w-12 h-12 rounded-xl transition-colors",
                                    expandedItem === 'pressure' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50"
                                )}
                            >
                                <Gauge className="w-6 h-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Panel de Presiones</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Camera Controls */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleExpand('camera')}
                                className={cn(
                                    "w-12 h-12 rounded-xl transition-colors",
                                    expandedItem === 'camera' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50"
                                )}
                            >
                                <Camera className="w-6 h-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Vistas de Cámara</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Expandable Panels */}
                <AnimatePresence mode="wait">
                    {expandedItem === 'valve' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-card/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl w-64"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                    <Sliders className="w-4 h-4 text-primary" />
                                    Apertura Válvula
                                </h3>
                                <span className="text-xs font-mono font-bold bg-primary/20 text-primary px-2 py-0.5 rounded">
                                    {valveOpening}%
                                </span>
                            </div>
                            <Slider
                                value={[valveOpening]}
                                onValueChange={(v) => onValveChange(v[0])}
                                max={100}
                                min={0}
                                step={1}
                                className="my-6"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                <span>Cerrada</span>
                                <span>Abierta</span>
                            </div>
                        </motion.div>
                    )}

                    {expandedItem === 'pressure' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-card/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl w-64"
                        >
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                                <Activity className="w-4 h-4 text-primary" />
                                Monitoreo de Presión
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg border border-primary/10">
                                    <span className="text-xs text-muted-foreground">Aspiración</span>
                                    <span className="text-sm font-mono font-bold">{pressureData.suction.toFixed(2)} bar</span>
                                </div>
                                <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg border border-primary/10">
                                    <span className="text-xs text-muted-foreground">Impulsión</span>
                                    <span className="text-sm font-mono font-bold">{pressureData.discharge.toFixed(2)} bar</span>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="flex items-center justify-between bg-primary/10 p-2 rounded-lg border border-primary/20">
                                    <span className="text-xs font-semibold">Diferencial</span>
                                    <span className="text-sm font-mono font-bold text-primary">{pressureData.differential.toFixed(2)} bar</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {expandedItem === 'camera' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-card/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 shadow-2xl w-48"
                        >
                            <h3 className="text-sm font-semibold mb-3 px-1 text-foreground">Vistas 3D</h3>
                            <div className="grid grid-cols-1 gap-1">
                                {(['default', 'pump', 'valve', 'motor'] as const).map((preset) => (
                                    <Button
                                        key={preset}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            onCameraPreset?.(preset);
                                            setExpandedItem(null);
                                        }}
                                        className="justify-start capitalize h-9 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        <Camera className="w-3.5 h-3.5 mr-2 opacity-70" />
                                        Vista {preset}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    );
};
