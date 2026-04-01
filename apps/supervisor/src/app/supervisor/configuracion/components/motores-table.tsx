"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { MotorPlantilla } from "@/lib/api";

interface MotoresTableProps {
  motores: MotorPlantilla[];
  loading: boolean;
  onEdit: (motor: MotorPlantilla) => void;
  onDelete: (motor: MotorPlantilla) => void;
  searchQuery: string;
}

export function MotoresTable({
  motores,
  loading,
  onEdit,
  onDelete,
  searchQuery,
}: MotoresTableProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{t("field.model")}</TableHead>
            <TableHead>{t("col.client")}</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>{t("pdf.power")}</TableHead>
            <TableHead>Velocidad</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {t("login.loading")}
              </TableCell>
            </TableRow>
          ) : motores.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                {searchQuery ? t("empty.desc") : t("empty.title")}
              </TableCell>
            </TableRow>
          ) : (
            motores.map((motor) => (
              <TableRow key={motor.id}>
                <TableCell className="font-mono text-sm">{motor.id}</TableCell>
                <TableCell className="font-medium">{motor.nombre}</TableCell>
                <TableCell>{motor.marca || "-"}</TableCell>
                <TableCell>{motor.tipo || "-"}</TableCell>
                <TableCell>
                  {motor.potencia ? (
                    <Badge variant="outline">{motor.potencia} kW</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {motor.velocidad ? (
                    <Badge variant="outline">{motor.velocidad} RPM</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(motor)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => onDelete(motor)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
