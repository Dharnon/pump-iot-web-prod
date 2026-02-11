# ✅ Checklist de Despliegue - Pump IoT Web

## 📋 Antes de Desplegar

### Requisitos del Sistema
- [ ] Node.js 18.x o superior instalado
- [ ] pnpm 9.15.4 o superior instalado
- [ ] Git instalado
- [ ] Acceso SSH a la máquina virtual (si es remoto)
- [ ] Puertos 3000 y 5002 disponibles
- [ ] Mínimo 4GB de RAM disponible
- [ ] Mínimo 10GB de espacio en disco

### Preparación
- [ ] Repositorio clonado
- [ ] Backend API funcionando y accesible
- [ ] IP del servidor backend conocida
- [ ] Credenciales de acceso (si aplica)

---

## 🔧 Durante la Instalación

### Instalación Básica
- [ ] Dependencias instaladas con `pnpm install`
- [ ] Sin errores durante la instalación
- [ ] Archivo `.env.local` creado
- [ ] Variable `NEXT_PUBLIC_API_URL` configurada correctamente

### Configuración de Red
- [ ] Firewall configurado para permitir puerto 3000
- [ ] IP de la VM identificada
- [ ] Conectividad con el backend verificada
- [ ] DNS configurado (si aplica)

### Build de Producción
- [ ] Build completado sin errores: `pnpm build`
- [ ] Directorio `.next` creado en apps/supervisor
- [ ] Archivos estáticos generados correctamente
- [ ] Sin warnings críticos durante el build

---

## 🚀 Despliegue

### Inicio de la Aplicación
- [ ] Aplicación iniciada correctamente
- [ ] Proceso corriendo (verificar con `pm2 status` o `ps aux`)
- [ ] Puerto 3000 en uso (verificar con `netstat -tulpn | grep 3000`)
- [ ] Logs sin errores críticos

### Configuración PM2 (Si aplica)
- [ ] PM2 instalado globalmente
- [ ] Aplicación registrada en PM2
- [ ] Configuración guardada: `pm2 save`
- [ ] Inicio automático configurado: `pm2 startup`
- [ ] PM2 reinicia la app automáticamente en caso de crash

### Nginx (Opcional)
- [ ] Nginx instalado y configurado
- [ ] Proxy reverso funcionando
- [ ] Certificado SSL instalado (si aplica)
- [ ] Redirección HTTP a HTTPS configurada (si aplica)

---

## ✅ Verificación Post-Despliegue

### Accesibilidad
- [ ] Aplicación accesible desde localhost
- [ ] Aplicación accesible desde la red local
- [ ] Aplicación accesible desde Internet (si aplica)
- [ ] URLs correctas en todas las rutas

### Funcionalidad Básica
- [ ] Página principal carga correctamente
- [ ] Navegación entre páginas funciona
- [ ] Conexión con backend establecida
- [ ] Datos se cargan correctamente

### Funcionalidad Avanzada
- [ ] Importación de CSV/Excel funciona
- [ ] Listado de tests/protocolos se muestra
- [ ] Navegación a tests pendientes funciona (`/supervisor/test/{id}`)
- [ ] Navegación a protocolos generados funciona (`/supervisor/protocolo/{id}`)
- [ ] PDF upload funciona en vista de test
- [ ] Extracción de datos de PDF funciona
- [ ] Todos los campos son editables en vista de protocolo
- [ ] Secciones de Motor y Detalles se muestran en vista de protocolo
- [ ] Botón de colapsar PDF funciona en vista de protocolo
- [ ] Guardado de datos funciona correctamente

### Rendimiento
- [ ] Página carga en menos de 3 segundos
- [ ] Transiciones son fluidas
- [ ] No hay memory leaks visibles
- [ ] CPU usage es razonable (<50% en idle)

### Seguridad
- [ ] Variables de entorno protegidas (.env.local no en git)
- [ ] Acceso restringido si es necesario
- [ ] HTTPS configurado (si es producción pública)
- [ ] Headers de seguridad configurados (si aplica)

---

## 📊 Monitoreo

### Logs
- [ ] Logs accesibles y legibles
- [ ] Sistema de rotación de logs configurado
- [ ] No hay errores críticos en logs

### Recursos
- [ ] Uso de CPU monitoreado
- [ ] Uso de memoria monitoreado
- [ ] Uso de disco monitoreado
- [ ] Alertas configuradas (opcional)

### Backup
- [ ] Backup de configuración realizado
- [ ] Procedimiento de restauración documentado
- [ ] Backup programado (opcional)

---

## 📝 Documentación

### Para el Equipo
- [ ] Documentación leída y comprendida
- [ ] Credenciales documentadas (en lugar seguro)
- [ ] Procedimientos de mantenimiento documentados
- [ ] Contactos de soporte registrados

### Para Usuarios
- [ ] Manual de usuario disponible (si aplica)
- [ ] URLs de acceso compartidas
- [ ] Procedimiento de reporte de bugs comunicado

---

## 🔄 Mantenimiento

### Plan de Actualizaciones
- [ ] Procedimiento de actualización definido
- [ ] Horarios de mantenimiento establecidos
- [ ] Plan de rollback definido

### Tareas Recurrentes
- [ ] Revisar logs semanalmente
- [ ] Actualizar dependencias mensualmente
- [ ] Verificar backups mensualmente
- [ ] Revisar uso de recursos mensualmente

---

## 🆘 Troubleshooting

### Información de Contacto
- **Desarrollador Principal**: [Nombre y contacto]
- **Administrador de Sistemas**: [Nombre y contacto]
- **Documentación**: `/docs` y `DESPLIEGUE.md`

### Comandos Útiles de Emergencia
```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs pump-iot-supervisor --lines 100

# Reiniciar aplicación
pm2 restart pump-iot-supervisor

# Verificar conectividad con backend
curl http://localhost:5002/api/health

# Ver uso de recursos
htop

# Ver procesos usando puerto 3000
sudo lsof -i :3000
```

---

## ✨ Entrega Final

### Antes de entregar a producción
- [ ] Todas las pruebas pasadas
- [ ] Documentación completa entregada
- [ ] Credenciales transferidas de forma segura
- [ ] Sesión de capacitación realizada (si aplica)
- [ ] Período de soporte acordado

### Firma de Aceptación
- **Fecha de despliegue**: _______________
- **Desplegado por**: _______________
- **Verificado por**: _______________
- **Status**: ⬜ Exitoso ⬜ Con observaciones ⬜ Fallido

### Notas Adicionales
```
[Espacio para notas, observaciones o configuraciones específicas]





```

---

**Versión del Checklist**: 1.0  
**Última actualización**: Febrero 2026
