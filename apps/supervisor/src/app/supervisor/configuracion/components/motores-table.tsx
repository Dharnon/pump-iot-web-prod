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
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Plantilla</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Potencia</TableHead>
            <TableHead>Velocidad</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Cargando motores...
              </TableCell>
            </TableRow>
          ) : motores.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-28 text-center text-muted-foreground"
              >
                {searchQuery
                  ? "No hay plantillas que coincidan con la busqueda actual."
                  : "No hay plantillas de motor disponibles."}
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
