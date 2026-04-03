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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/70 bg-muted/15 text-foreground/80"
                    >
                      {motor.potencia} kW
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {motor.velocidad ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/70 bg-muted/15 text-foreground/80"
                    >
                      {motor.velocidad} RPM
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          aria-label="Acciones de la plantilla"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onEdit(motor)}>
                          <Pencil />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(motor)}
                        >
                          <Trash2 />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
