"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw, ExternalLink, Play, CheckCircle2 } from "lucide-react";
import { getListados, type Listado, getBancos, generateProtocols, type Banco } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * CSV List Page - View imported CSV/Excel data and generate protocols
 */
export default function CsvListPage() {
    const [listados, setListados] = useState<Listado[]>([]);
    const [bancos, setBancos] = useState<Banco[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBanco, setSelectedBanco] = useState<string>("");
    const [prefix, setPrefix] = useState<string>("C8r");
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [listadosData, bancosData] = await Promise.all([
                getListados(),
                getBancos()
            ]);
            setListados(listadosData);
            setBancos(bancosData);
            if (bancosData.length > 0) setSelectedBanco(bancosData[0].id.toString());
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerate = async (listadoId: number) => {
        if (!selectedBanco) {
            toast.error("Por favor selecciona un banco");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await generateProtocols(
                listadoId, 
                parseInt(selectedBanco), 
                prefix
            );

            if (response.success) {
                toast.success(`${response.message} (${response.protocolos.length} creados)`);
                router.push("/supervisor"); // Redirigir al dashboard para ver los protocolos
            }
        } catch (error: any) {
            toast.error(error.message || "Error al generar protocolos");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full overflow-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Listados de Producción</h1>
                    <p className="text-muted-foreground">
                        Gestión de pedidos importados y generación de protocolos
                    </p>
                </div>
                <Button variant="outline" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Actualizar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pedidos Pendientes</CardDescription>
                        <CardTitle className="text-4xl">{listados.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Clientes</CardDescription>
                        <CardTitle className="text-4xl">
                            {new Set(listados.map(l => l.cliente)).size}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Bancos Disponibles</CardDescription>
                        <CardTitle className="text-4xl">{bancos.length}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <FileSpreadsheet className="w-5 h-5" />
                        Pedidos en Cola de Producción
                    </CardTitle>
                    <CardDescription>
                        Selecciona un pedido para generar sus protocolos de prueba individuales
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-4">
                                <RefreshCw className="w-10 h-10 animate-spin text-primary mx-auto opacity-50" />
                                <p className="text-sm text-muted-foreground">Cargando datos de producción...</p>
                            </div>
                        </div>
                    ) : listados.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/5">
                            <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <h3 className="text-lg font-medium text-muted-foreground">No hay datos en staging</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                                Importa un archivo Excel o CSV desde el Dashboard para ver los pedidos aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Bomba</TableHead>
                                        <TableHead>OT</TableHead>
                                        <TableHead className="text-center">Cant.</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listados.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono font-bold text-primary">{item.pedido}</TableCell>
                                            <TableCell className="font-medium">{item.cliente}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{item.tipoDeBomba}</TableCell>
                                            <TableCell className="font-mono text-xs">{item.ordenDeTrabajo}</TableCell>
                                            <TableCell className="text-center font-bold">{item.numeroBombas}</TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" className="gap-2">
                                                            <Play className="w-3.5 h-3.5" />
                                                            Generar
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle>Generar Protocolos</DialogTitle>
                                                            <DialogDescription>
                                                                Se crearán <strong>{item.numeroBombas}</strong> protocolos de prueba para el pedido {item.pedido}.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="banco">Banco de Pruebas</Label>
                                                                <Select value={selectedBanco} onValueChange={setSelectedBanco}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecciona un banco" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {bancos.map(b => (
                                                                            <SelectItem key={b.id} value={b.id.toString()}>
                                                                                {b.nombre}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    Indica en qué banco se realizarán físicamente estas pruebas.
                                                                </p>
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="prefix">Prefijo Nº Serie (Opcional)</Label>
                                                                <Input 
                                                                    id="prefix" 
                                                                    value={prefix} 
                                                                    onChange={(e) => setPrefix(e.target.value)}
                                                                    placeholder="Ej: C8r"
                                                                />
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    Generará números correlativos: {prefix}01, {prefix}02...
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button 
                                                                onClick={() => handleGenerate(item.id)} 
                                                                disabled={isGenerating}
                                                                className="w-full"
                                                            >
                                                                {isGenerating ? (
                                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                )}
                                                                Confirmar Generación
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
