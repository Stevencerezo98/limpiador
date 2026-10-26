# 📬 CleanMail & Bulk Mail Engine (2026 Enterprise Edition)

Plataforma integral de depuración masiva de correos electrónicos, verificación de sintaxis RFC 5322, consulta DNS MX en vivo, detección de correos temporales/desechables, motor de email marketing con envíos escalonados y control criptográfico de licencias.

---

## 🚀 Guías Incluidas en el Repositorio

- **`README_VENTA.md`**: Ficha técnica y propuesta comercial lista para presentar y vender el sistema a clientes y agencias.
- **`AAPANEL_GUIA.md`**: Paso a paso para desplegar en **aaPanel** con dos dominios: `unio.my` (Landing) y `cleanmail.unio.my` (App).
- **`DEPLOY.md`**: Guía para servidores VPS limpios con PM2, Nginx, Docker y certificados SSL gratuitos con Certbot.
- **`scripts/generate-license.cjs`**: Generador oficial de licencias criptográficas HMAC-SHA256 para clientes.

---

## 🔑 Cómo Generar Licencias Válidas para tus Clientes

Para evitar que los clientes bajen el software y lo utilicen sin pagar, CleanMail bloquea automáticamente las funciones de depuración, exportación y envíos si no cuentan con una clave de licencia activa firmada criptográficamente con tu clave secreta.

### Generar una licencia desde tu Terminal:

```bash
# Ejemplo: Licencia por 1 año (365 días) para el dominio cleanmail.cliente.com
node scripts/generate-license.cjs \
  --client "Empresa Cliente S.A.S." \
  --email "contacto@cliente.com" \
  --domain "cleanmail.cliente.com" \
  --days 365 \
  --plan enterprise
```

### Opciones de la Línea de Comandos:
- `--client`: Nombre o Razón Social del comprador.
- `--email`: Correo del cliente.
- `--domain`: Dominio autorizado (ej. `cleanmail.unio.my` o `*` para cualquier dominio).
- `--days`: Días de validez (ej. `30`, `90`, `365`, o `0` para licencia Vitalicia/Lifetime).
- `--plan`: `starter`, `pro`, `enterprise` o `lifetime`.

### Generar licencias directamente desde la Web:
Si eres el Administrador, también puedes ingresar al panel de CleanMail en la sección:  
**ADMINISTRACIÓN EXCLUSIVA ➔ Licencia del Software**  
Allí encontrarás el formulario visual *"Generador Instantáneo de Licencias para tus Clientes"* donde completas los datos y copias la clave en 1 clic.

---

## 🛠️ Instalación y Puesta en Marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar para producción
npm run build

# 3. Iniciar el servidor
npm run start
```

---

## 🔒 Seguridad y Privacidad

- **Cero Retención Comercial**: Las bases de datos de correos se almacenan de forma privada y cifrada en `data/db.json`.
- **Firma HMAC-SHA256**: Las licencias son a prueba de manipulaciones; cualquier alteración en el texto o fecha invalida la firma criptográfica en el acto.
