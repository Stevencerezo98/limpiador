# 💎 CleanMail & Bulk Mail – Propuesta Comercial & Ficha Técnica de Venta

> **Plataforma Integral de Limpieza de Listas, Verificación DNS MX en Tiempo Real y Envíos Masivos de Email Marketing.**  
> *Garantiza hasta un 99.2% de entregabilidad en bandeja de entrada y protege la reputación de los dominios de tus clientes.*

---

## 🎯 1. Resumen Ejecutivo: ¿Qué es CleanMail?

**CleanMail** es una solución de software empresarial diseñada para empresas B2B, tiendas de comercio electrónico, agencias de marketing digital y equipos de ventas que necesitan **auditar bases de datos masivas de correo electrónico** y **lanzar campañas de email marketing** de alta efectividad sin intermediarios ni suscripciones abusivas.

A diferencia de los servicios convencionales que cobran mensualmente sumas elevadas por cada lista subida (como ZeroBounce, NeverBounce o Hunter), **CleanMail te permite ser el dueño de tu propio motor de validación y plataforma de envíos**, instalado en tu propio servidor o entregado como servicio llave en mano.

---

## ⚡ 2. El Problema que Resuelve (Dolor de los Clientes)

Enviar correos a bases de datos desactualizadas o no verificadas destruye el negocio de cualquier empresa:
- **Rebotes Duros (Hard Bounces)**: Servidores que ya no existen o dominios que expiraron provocan bloqueos inmediatos en Google Workspace, Microsoft 365, Yahoo y Mailchimp.
- **Caída en Carpeta de Spam**: Bastan 2 o 3 quejas de spam o rebotes superiores al 2% para que el dominio principal de la empresa quede en listas negras (Spamhaus, Barracuda).
- **Costos Innecesarios**: Pagar a plataformas de email marketing por contactos inválidos, temporales o duplicados quema el presupuesto publicitario.

### 🛡️ La Solución con CleanMail:
1. **Auditoría DNS MX en Vivo**: Consulta los servidores de correo activos en segundos.
2. **Filtro Anti-Desechables**: Detecta más de 4,000 servicios de correo temporal (10MinuteMail, TempMail, etc.).
3. **Reparación Automática de Typos**: Corrige errores humanos como `@gmai.com` ➔ `@gmail.com`.
4. **Segmentación de Correos de Rol**: Aísla buzones compartidos (`info@`, `ventas@`, `soporte@`) para proteger el dominio.
5. **Envíos Masivos Escalonados**: Envía campañas con pausas inteligentes en segundos (ej. 3 seg entre correos) evitando filtros anti-bloqueo.

---

## 🚀 3. Funcionalidades Principales del Software

| Módulo | Descripción y Valor para el Negocio |
| :--- | :--- |
| **Auditoría Masiva** | Carga archivos en **CSV, Excel (.xlsx) y TXT** de cientos de miles de registros con barra de progreso en vivo. |
| **Probador en Vivo 1-a-1** | Valida cualquier dirección individual en menos de 1 segundo con desglose sintáctico y score de confianza. |
| **Deduplicación Automática** | Elimina correos repetidos en la misma base o entre listas para no gastar recursos. |
| **Campañas de Email Masivo** | Editor de plantillas HTML, soporte para tags personalizados (`{{email}}`), tracking de aperturas en tiempo real con pixel transparente y gestión de desuscripciones. |
| **Gestión Multi-Usuario (RBAC)** | Matriz granular de **13 permisos independientes** y 5 roles (Administrador, Marketing, Digitalizador, Auditor/Visor y Personalizado). |
| **Editor CMS de Landing Page** | Personaliza en vivo los textos, planes, testimonios, FAQs y botón de WhatsApp de tu landing comercial (`unio.my`) sin tocar código. |
| **API REST Completa** | Integra la depuración de correos directamente con formularios de captura, WordPress, CRMs o pasarelas de pago. |
| **Copias de Seguridad en 1 Clic** | Descarga y restauración total de la base de datos en JSON para migrar servidores en segundos. |

---

## 💼 4. Modelos de Venta y Comercialización

Puedes comercializar CleanMail a tus clientes bajo tres modalidades sumamente rentables:

### Modelo A: Licencia On-Premise / Servidor Propio (Pago Único o Anual)
- Vendes la plataforma instalada en el servidor VPS del cliente (con aaPanel, Docker o Ubuntu).
- El cliente tiene control 100% de sus datos y no paga suscripciones a terceros.
- **Precio sugerido al mercado**: **$499 USD - $1,499 USD** por año (o pago único con mantenimiento).
- **Control**: Protegido con el **Sistema de Licencias Criptográficas CleanMail** que tú controlas.

### Modelo B: Plataforma SaaS por Créditos / Suscripción
- Tú alojas la plataforma en tu servidor (ej. `unio.my` para la landing y `cleanmail.unio.my` para la app).
- Vendes paquetes de depuración:
  - *Starter*: 10,000 correos por **$19 USD**.
  - *Pro*: 50,000 correos por **$69 USD**.
  - *Enterprise*: 250,000 correos por **$199 USD**.
  - *Ilimitado*: **$499 USD/año**.

### Modelo C: Marca Blanca (White-Label) para Agencias
- Le entregas la plataforma a agencias con su propio logotipo, nombre de dominio y colores para que ellos la revendan a sus propios clientes.
- **Precio sugerido**: **$1,500 USD - $3,000 USD** + cuota mensual de soporte.

---

## 🔒 5. Sistema Anti-Piratería y Control de Licencias

CleanMail incluye un motor de seguridad criptográfica basado en **firmas HMAC-SHA256**:

1. **Sin Licencia Válida, el Sistema se Bloquea**:
   - Las operaciones clave (subida de archivos masivos, verificación en vivo, exportaciones de listas limpias y envíos de campañas) requieren obligatoriamente una licencia activa.
   - Si la licencia expira o alguien intenta clonar el software en otro dominio no autorizado, las funciones se bloquean y el sistema muestra la pantalla de activación.
2. **Generador de Licencias Exclusivo para Ti**:
   - Puedes emitir licencias en 5 segundos desde tu terminal o desde la pestaña **Licencia del Software** en el panel de administrador.
   - Puedes definir:
     - Nombre del cliente y correo.
     - Dominio autorizado (ej. `cleanmail.cliente.com` o `*` para cualquier servidor).
     - Duración en días (ej. 30 días, 365 días o Vitalicia).
     - Límite de créditos y usuarios.

---

## 🛠️ 6. Requisitos Técnicos de Instalación

El software es extremadamente ligero y de alto rendimiento:

- **Sistema Operativo**: Linux (Ubuntu 20.04/22.04/24.04, Debian 11/12, CentOS, AlmaLinux).
- **Panel de Hosting compatible**: **aaPanel** (Recomendado), cPanel, CyberPanel o servidor limpio vía terminal.
- **Entorno de Ejecución**: Node.js v20 o v22 LTS.
- **Memoria RAM Mínima**: 1 GB RAM (Recomendado 2 GB para procesar archivos de 1 millón de registros).
- **Almacenamiento**: 500 MB libres para el sistema y espacio para las bases de datos locales (`data/db.json`).
- **Servidor Web**: Nginx con Proxy Inverso y Certificado SSL (Let's Encrypt gratuito).

---

## 📞 7. Contacto & Adquisición de Licencias

Para adquirir una licencia oficial, cotizaciones empresariales o solicitar una demostración en vivo:

- **Sitio Web Oficial**: `https://unio.my`
- **Plataforma de Prueba**: `https://cleanmail.unio.my`
- **WhatsApp Directo**: Consulta desde el botón flotante en la landing o contacta al administrador.
- **Correo Electrónico**: `soporte@unio.my`
