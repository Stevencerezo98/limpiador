# 🚀 Guía de Despliegue en Producción – CleanMail

Esta guía detalla los pasos para desplegar **CleanMail** en tu servidor VPS (Ubuntu/Debian) con los dominios configurados:
- **Plataforma / App**: `https://cleanmail.uno.my`
- **Página Landing / Comercial**: `https://unio.my`

---

## 1. Configuración de DNS en tu Registrador / Cloudflare
Crea los registros DNS tipo **A** apuntando a la IP pública de tu servidor VPS:

| Tipo | Nombre (Host) | Contenido (Valor) | Propósito |
| :--- | :--- | :--- | :--- |
| **A** | `cleanmail` (en zona `uno.my`) | `IP_DE_TU_SERVIDOR` | Plataforma CleanMail |
| **A** | `@` (en zona `unio.my`) | `IP_DE_TU_SERVIDOR` | Landing comercial |
| **A** | `www` (en zona `unio.my`) | `IP_DE_TU_SERVIDOR` | Redirección landing |

---

## 2. Preparar el Servidor VPS (Node.js 22 & PM2)

En tu VPS vía SSH:

```bash
# Actualizar el sistema e instalar Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx git

# Instalar PM2 de forma global
sudo npm install -g pm2
```

---

## 3. Subir y Compilar CleanMail en el Servidor

```bash
# Navegar al directorio donde estará la app (ejemplo: /var/www/cleanmail)
sudo mkdir -p /var/www/cleanmail
sudo chown -R $USER:$USER /var/www/cleanmail
cd /var/www/cleanmail

# Subir tus archivos (git clone o scp / rsync)
# Instalar dependencias
npm install

# Generar el paquete de producción optimizado
npm run build
```

---

## 4. Iniciar la Aplicación con PM2

El repositorio incluye el archivo `ecosystem.config.cjs` preconfigurado:

```bash
# Iniciar con PM2 en modo producción
pm2 start ecosystem.config.cjs

# Configurar para que inicie automáticamente al reiniciar el VPS
pm2 save
pm2 startup
```

Para verificar que el proceso esté corriendo en el puerto 3000:
```bash
curl http://localhost:3000/api/health
```

---

## 5. Configurar Nginx y Certificados SSL Gratuitos

Copia la configuración incluida en `nginx-cleanmail.conf`:

```bash
sudo cp nginx-cleanmail.conf /etc/nginx/sites-available/cleanmail.conf
sudo ln -s /etc/nginx/sites-available/cleanmail.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Genera certificados SSL automáticos y gratuitos con Let's Encrypt:
```bash
sudo certbot --nginx -d cleanmail.uno.my -d unio.my -d www.unio.my
```

¡Listo! Certbot actualizará automáticamente la configuración de Nginx con redirección segura `http -> https`.

---

## 6. Opción Alternativa: Despliegue con Docker

Si prefieres usar Docker y Docker Compose:
```bash
# Compilar y levantar contenedor
docker compose up -d --build

# Ver logs
docker compose logs -f
```

---

## 7. Persistencia y Copias de Seguridad
Toda la base de datos se guarda en `data/db.json` (correos, listas, planes, campañas y usuarios). 
Desde la misma plataforma en **Configuración Sistema ➔ Copia de Seguridad & Servidor** puedes descargar backups en JSON o restaurarlos en cualquier momento con un solo clic.
