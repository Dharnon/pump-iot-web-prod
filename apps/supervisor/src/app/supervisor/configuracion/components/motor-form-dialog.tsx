"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Save } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { MotorPlantilla } from "@/lib/api";

interface MotorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motor: Partial<MotorPlantilla>;
  editingMotor: MotorPlantilla | null;
  onChange: (data: Partial<MotorPlantilla>) => void;
  onSubmit: () => void;
}

export function MotorFormDialog({
  open,
  onOpenChange,
  motor,
  editingMotor,
  onChange,
  onSubmit,
}: MotorFormDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {editingMotor ? t("config.motores.edit") : t("config.motores.new")}
          </DialogTitle>
          <DialogDescription>{t("config.motores.desc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">{t("field.model")} *</Label>
              <Input
                id="nombre"
                value={motor.nombre || ""}
                onChange={(e) => onChange({ ...motor, nombre: e.target.value })}
                placeholder="Motor Estándar 100kW"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marca">{t("col.client")}</Label>
              <Input
                id="marca"
                value={motor.marca || ""}
                onChange={(e) => onChange({ ...motor, marca: e.target.value })}
                placeholder="Siemens"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Input
                id="tipo"
                value={motor.tipo || ""}
                onChange={(e) => onChange({ ...motor, tipo: e.target.value })}
                placeholder="Trifásico"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="potencia">{t("pdf.power")} (kW)</Label>
              <Input
                id="potencia"
                type="number"
                value={motor.potencia || ""}
                onChange={(e) =>
                  onChange({
                    ...motor,
                    potencia: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="velocidad">Velocidad (RPM)</Label>
              <Input
                id="velocidad"
                type="number"
                value={motor.velocidad || ""}
                onChange={(e) =>
                  onChange({
                    ...motor,
                    velocidad: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="1500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="intensidad">Intensidad (A)</Label>
              <Input
                id="intensidad"
                type="number"
                value={motor.intensidad || ""}
                onChange={(e) =>
                  onChange({
                    ...motor,
                    intensidad: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="150"
              />
            </div>
          </div>
          <div className="border-t pt-4">
            <Label className="text-lg font-semibold">
              {t("config.motores.performance")}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t("config.motores.performanceDesc")}
            </p>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rendimiento25">25%</Label>
              <Input
                id="rendimiento25"
                type="number"
                step="0.1"
                value={motor.rendimiento25 || ""}
                onChange={(e) =>
                  onChange({
                    ...motor,
                    rendimiento25: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="85.5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rendimiento50">50%</Label>
              <Input
                id="rendimiento50"
                type="number"
                step="0.1"
                value={motor.rendimiento50 || ""}
                onChange={(e) =>
                  onChange({
                    ...motor,
                    rendimiento50: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="90.0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rendimiento75">75%</Label>
              <Input
                id="rendimiento75"
                type="number"
                step="0.1"
                value={motor.rendimiento75 || ""}
                onChange={(e) =>
                  onChange({
                    ...motor,
                    rendimiento75: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="92.5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rendimiento100">100%</Label>
              <Input
                id="rendimiento100"
                type="number"
                step="0.1"
                value={motor.rendimiento100 || ""}
                onChange={(e) =>
                  onChange({
                    ...motor,
                    rendimiento100: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="94.0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rendimiento125">125%</Label>
              <Input
                id="rendimiento125"
                type="number"
                step="0.1"
                value={motor.rendimiento125 || ""}
                onChange={(e) =>
                  onChange({
                    ...motor,
                    rendimiento125: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="93.0"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("config.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={!motor.nombre}>
            <Save className="mr-2 h-4 w-4" />
            {t("config.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
