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
import { Banco } from "@/lib/api";

interface BancosTableProps {
  bancos: Banco[];
  loading: boolean;
  onEdit: (banco: Banco) => void;
  onDelete: (banco: Banco) => void;
  searchQuery: string;
}

export function BancosTable({
  bancos,
  loading,
  onEdit,
  onDelete,
  searchQuery,
}: BancosTableProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Motor asignado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Cargando bancos...
              </TableCell>
            </TableRow>
          ) : bancos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-28 text-center text-muted-foreground"
              >
                {searchQuery
                  ? "No hay bancos que coincidan con la busqueda actual."
                  : "No hay bancos configurados todavia."}
              </TableCell>
            </TableRow>
          ) : (
            bancos.map((banco) => (
              <TableRow key={banco.id}>
                <TableCell className="font-mono text-sm">{banco.id}</TableCell>
                <TableCell className="font-medium">{banco.nombre}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      banco.estado
                        ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {banco.estado ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {banco.motorPlantilla ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {banco.motorPlantilla.nombre}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {banco.motorPlantilla.marca}{" "}
                        {banco.motorPlantilla.potencia}kW
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sin motor asignado
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(banco)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => onDelete(banco)}
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
