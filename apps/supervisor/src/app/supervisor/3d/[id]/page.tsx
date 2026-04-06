"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Scene3D } from '@/components/3d/Scene3D';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2, Gauge, Droplets, Thermometer, Zap } from 'lucide-react';

export default function Test3DViewer() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.id as string;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRunning] = useState(true);
  const [motorSpeed] = useState(50);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--supervisor-page-background)]">
      {/* 3D Scene - Full Background */}
      <div className="absolute inset-0 z-0">
        <Scene3D 
          isRunning={isRunning} 
          motorSpeed={motorSpeed}
          className="w-full h-full" 
        />
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-white font-bold text-lg">Vista 3D - Bomba</h1>
              <p className="text-white/70 text-xs">Protocolo #{testId}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Overlay - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-6">
          <MetricPill icon={Gauge} label="Presión" value="12.5 bar" color="text-blue-400" />
          <MetricPill icon={Droplets} label="Caudal" value="1500 m³/h" color="text-cyan-400" />
          <MetricPill icon={Thermometer} label="Temp" value="45°C" color="text-orange-400" />
          <MetricPill icon={Zap} label="Potencia" value="180 kW" color="text-yellow-400" />
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-20 right-4 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-xs font-medium">En Tiempo Real</span>
        </div>
      </div>
    </div>
  );
}

function MetricPill({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full">
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="flex flex-col">
        <span className="text-white/60 text-[10px] uppercase tracking-wider">{label}</span>
        <span className="text-white font-mono font-semibold text-sm">{value}</span>
      </div>
    </div>
  );
}
