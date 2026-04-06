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
import { Checkbox } from "@/components/ui/checkbox";
import { Database, Save } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Banco } from "@/lib/api";

interface BancoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banco: Partial<Banco>;
  editingBanco: Banco | null;
  onChange: (data: Partial<Banco>) => void;
  onSubmit: () => void;
}

export function BancoFormDialog({
  open,
  onOpenChange,
  banco,
  editingBanco,
  onChange,
  onSubmit,
}: BancoFormDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-secondary sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {editingBanco ? t("config.bancos.edit") : t("config.bancos.new")}
          </DialogTitle>
          <DialogDescription>{t("config.bancos.desc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="banco-nombre">{t("field.model")} *</Label>
            <Input
              id="banco-nombre"
              className="bg-background"
              value={banco.nombre || ""}
              onChange={(e) => onChange({ ...banco, nombre: e.target.value })}
              placeholder="Banco A"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="banco-estado"
              checked={banco.estado ?? true}
              onCheckedChange={(checked) =>
                onChange({ ...banco, estado: checked === true })
              }
            />
            <Label htmlFor="banco-estado">{t("config.active")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("config.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={!banco.nombre}>
            <Save className="mr-2 h-4 w-4" />
            {t("config.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
