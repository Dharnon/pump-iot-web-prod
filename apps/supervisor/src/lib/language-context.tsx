"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "es";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export type UseLanguageReturn = LanguageContextType;

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Simple translation dictionary for demo purposes
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Login
    "login.title": "Pump IoT Platform",
    "login.subtitle": "Pump Testing Management System",
    "login.username": "Username",
    "login.password": "Password",
    "login.submit": "Sign In",
    "login.loading": "Signing in...",
    "login.error": "Invalid credentials. Use: admin / admin123",
    "footer.version": "Flowserve IoT Platform v1.0",
    "quick.access": "Quick Access (Demo)",
    "btn.operator": "Operator",
    "btn.supervisor": "Supervisor",

    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.csv": "CSV Lists",
    "sidebar.pdf": "PDF Extractor",
    "sidebar.powered": "Powered by",
    "sidebar.logout": "Logout",

    // Dashboard
    "dash.title": "Dashboard",
    "dash.subtitle": "Pump Testing Management",
    "dash.stat.total": "Total",
    "dash.stat.pending": "Pending",
    "dash.stat.process": "In Progress",
    "dash.stat.generated": "Processed",
    "dash.stat.completed": "Completed",
    "dash.stat.lastFile": "Last File:",

    // Table Headers
    "table.title": "Tests",
    "table.records": "records",
    "table.search": "Search in table...",
    "table.filter": "Status",
    "table.refresh": "Refresh",

    // Table Columns
    "col.status": "Status",
    "col.order": "Order",
    "col.position": "Position",
    "col.client": "Client",
    "col.model": "Model",
    "col.workOrder": "Work Order",
    "col.qty": "Qty",

    // Statuses
    "status.all": "All statuses",
    "status.PENDING": "Pending",
    "status.IN_PROGRESS": "In Progress",
    "status.SIN_PROCESAR": "Unprocessed",
    "status.EN_BANCO": "In Bench",
    "status.GENERADO": "Processed",
    "status.GENERATED": "Processed",
    "status.PROCESSED": "Processed",
    "status.COMPLETED": "Completed",

    // Empty State
    "empty.title": "No tests registered",
    "empty.desc": "Import your first CSV or Excel file to get started.",

    // Test Details
    "test.notFound.title": "Test Not Found",
    "test.notFound.desc": "The requested record does not exist.",
    "test.back": "Back",
    "test.tests": "Tests",
    "test.finalize": "Finalize Test",
    "test.viewing": "Viewing File",
    "test.changePdf": "Change PDF",
    "test.upload.title": "Upload a PDF report",
    "test.upload.desc": "View the report and extract data automatically.",
    "test.upload.btn": "Select PDF",
    "test.generalInfo": "General Information",
    "test.testsToPerform": "Tests to Perform",
    "test.pdfData": "PDF Data Sheet",
    "test.analyze": "Analyze Real PDF",
    "test.analyzing": "Analyzing...",
    "test.section.perf": "Performance",
    "test.section.fluid": "Fluid",
    "test.section.cons": "Construction",
    "test.section.other": "Other",

    // Fields
    "field.order": "Order",
    "field.position": "Position",
    "field.qty": "Qty Pumps",
    "field.date": "Date",
    "field.client": "Client",
    "field.model": "Model",
    "field.workOrder": "Work Order",
    "field.item": "ITEM",
    "field.clientOrder": "Client Order",

    // PDF Fields
    "pdf.flow": "Flow",
    "pdf.head": "Head",
    "pdf.power": "Power",
    "pdf.eff": "Efficiency",
    "pdf.fluid": "Fluid",
    "pdf.temp": "Temp.",
    "pdf.density": "Density",
    "pdf.viscosity": "Viscosity",
    "pdf.impeller": "Imp. Dia.",
    "pdf.suction": "Suction",
    "pdf.discharge": "Discharge",
    "pdf.tolerance": "Tolerance",
    "pdf.seal": "Seal Type",

    // Configuration
    "config.title": "Configuration",
    "config.desc": "Manage test benches and motor templates.",
    "config.bancos": "Benches",
    "config.motores": "Motors",
    "config.bancos.total": "Total Benches",
    "config.bancos.active": "Active Benches",
    "config.bancos.inactive": "Inactive Benches",
    "config.bancos.manage": "Bench Management",
    "config.bancos.desc":
      "Manage test benches and their associated motor templates.",
    "config.bancos.new": "New Bench",
    "config.bancos.edit": "Edit Bench",
    "config.bancos.deleteTitle": "Are you sure you want to delete this bench?",
    "config.bancos.deleteDesc":
      "This action cannot be undone. The bench will be permanently deleted.",
    "config.motores.total": "Total Motor Templates",
    "config.motores.manage": "Motor Templates",
    "config.motores.desc":
      "Manage motor templates that can be associated with benches.",
    "config.motores.new": "New Template",
    "config.motores.edit": "Edit Motor Template",
    "config.motores.deleteTitle":
      "Are you sure you want to delete this motor template?",
    "config.motores.deleteDesc":
      "This action cannot be undone. The template will be permanently deleted.",
    "config.motores.performance": "Performance (%) - Optional",
    "config.motores.performanceDesc":
      "Enter the motor performance values at different loads.",
    "config.save": "Save",
    "config.cancel": "Cancel",
    "config.delete": "Delete",
    "config.active": "Active",
    "config.inactive": "Inactive",
    "config.noMotor": "No motor assigned",
  },
  es: {
    // Login
    "login.title": "Plataforma Pump IoT",
    "login.subtitle": "Sistema de gestión de pruebas de bombas",
    "login.username": "Usuario",
    "login.password": "Contraseña",
    "login.submit": "Iniciar Sesión",
    "login.loading": "Iniciando...",
    "login.error": "Credenciales inválidas. Usa: admin / admin123",
    "footer.version": "Flowserve IoT Platform v1.0",
    "quick.access": "Acceso Rápido (Demo)",
    "btn.operator": "Operador",
    "btn.supervisor": "Supervisor",

    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.csv": "Listados CSV",
    "sidebar.pdf": "Extractor PDF",
    "sidebar.powered": "Desarrollado por",
    "sidebar.logout": "Cerrar sesión",

    // Dashboard
    "dash.title": "Dashboard",
    "dash.subtitle": "Gestión de pruebas de bombas",
    "dash.stat.total": "Total",
    "dash.stat.pending": "Pendientes",
    "dash.stat.process": "En Proceso",
    "dash.stat.generated": "Procesados",
    "dash.stat.completed": "Completados",
    "dash.stat.lastFile": "Último archivo:",

    // Table Headers
    "table.title": "Pruebas",
    "table.records": "registros",
    "table.search": "Buscar en la tabla...",
    "table.filter": "Estado",
    "table.refresh": "Actualizar",

    // Table Columns
    "col.status": "Estado",
    "col.order": "Pedido",
    "col.position": "Posición",
    "col.client": "Cliente",
    "col.model": "Modelo",
    "col.workOrder": "Orden",
    "col.qty": "Nº",

    // Statuses
    "status.all": "Todos los estados",
    "status.PENDING": "Pendiente",
    "status.IN_PROGRESS": "En Proceso",
    "status.SIN_PROCESAR": "Sin procesar",
    "status.EN_BANCO": "En Banco",
    "status.GENERADO": "Procesado",
    "status.GENERATED": "Procesado",
    "status.PROCESSED": "Procesado",
    "status.COMPLETED": "Completado",

    // Empty State
    "empty.title": "No hay pruebas registradas",
    "empty.desc": "Importa tu primer archivo CSV o Excel para comenzar.",

    // Test Details
    "test.notFound.title": "Prueba no encontrada",
    "test.notFound.desc": "El registro solicitado no existe.",
    "test.back": "Volver",
    "test.tests": "Pruebas",
    "test.finalize": "Generar Protocolo",
    "test.viewing": "Visualizando archivo",
    "test.changePdf": "Cambiar PDF",
    "test.upload.title": "Sube un reporte PDF",
    "test.upload.desc": "Visualiza el reporte y extrae datos automáticamente.",
    "test.upload.btn": "Seleccionar PDF",
    "test.generalInfo": "Información General",
    "test.testsToPerform": "Pruebas a Realizar",
    "test.pdfData": "Hoja de Datos PDF",
    "test.analyze": "Analizar PDF Real",
    "test.generated": "Protocolo Procesado",
    "test.analyzing": "Analizando...",
    "test.section.perf": "Performance",
    "test.section.fluid": "Fluido",
    "test.section.cons": "Construcción",
    "test.section.other": "Otros",

    // Fields
    "field.order": "Pedido",
    "field.position": "Posición",
    "field.qty": "Nº Bombas",
    "field.date": "Fecha",
    "field.client": "Cliente",
    "field.model": "Modelo",
    "field.workOrder": "Orden Trabajo",
    "field.item": "ITEM",
    "field.clientOrder": "Ped. Cliente",

    // PDF Fields
    "pdf.flow": "Caudal",
    "pdf.head": "TDH",
    "pdf.power": "Potencia",
    "pdf.eff": "Eficiencia",
    "pdf.fluid": "Fluido Cliente",
    "pdf.temp": "Temp.",
    "pdf.density": "Densidad",
    "pdf.viscosity": "Viscosidad",
    "pdf.impeller": "D. Impulsor",
    "pdf.suction": "Aspiración",
    "pdf.discharge": "Descarga",
    "pdf.tolerance": "Tolerancia",
    "pdf.seal": "Tipo Cierre",

    // Configuración
    "config.title": "Configuración",
    "config.desc":
      "Administre los bancos de pruebas y las plantillas de motor.",
    "config.bancos": "Bancos",
    "config.motores": "Motores",
    "config.bancos.total": "Total Bancos",
    "config.bancos.active": "Bancos Activos",
    "config.bancos.inactive": "Bancos Inactivos",
    "config.bancos.manage": "Gestión de Bancos",
    "config.bancos.desc":
      "Administra los bancos de pruebas y sus plantillas de motor asociadas.",
    "config.bancos.new": "Nuevo Banco",
    "config.bancos.edit": "Editar Banco",
    "config.bancos.deleteTitle": "¿Está seguro de eliminar este banco?",
    "config.bancos.deleteDesc":
      "Esta acción no se puede deshacer. El banco será eliminado permanentemente.",
    "config.motores.total": "Total Plantillas de Motor",
    "config.motores.manage": "Plantillas de Motor",
    "config.motores.desc":
      "Administra las plantillas de motor que pueden asociarse a bancos.",
    "config.motores.new": "Nueva Plantilla",
    "config.motores.edit": "Editar Plantilla de Motor",
    "config.motores.deleteTitle":
      "¿Está seguro de eliminar esta plantilla de motor?",
    "config.motores.deleteDesc":
      "Esta acción no se puede deshacer. La plantilla será eliminada permanentemente.",
    "config.motores.performance": "Rendimientos (%) - Opcional",
    "config.motores.performanceDesc":
      "Ingrese los valores de rendimiento del motor a diferentes cargas.",
    "config.save": "Guardar",
    "config.cancel": "Cancelar",
    "config.delete": "Eliminar",
    "config.active": "Activo",
    "config.inactive": "Inactivo",
    "config.noMotor": "Sin motor asignado",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("language") as Language;
    if (stored && (stored === "en" || stored === "es")) {
      setLanguage(stored);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
