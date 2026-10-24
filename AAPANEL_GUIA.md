# 📌 Guía Paso a Paso para Desplegar en aaPanel
### Landing en `unio.my` y App en `cleanmail.unio.my`

Con **aaPanel** no necesitas correr dos proyectos de Node ni duplicar archivos. **Un solo proyecto de Node atiende ambos dominios**, y la aplicación detecta automáticamente por cuál dominio entra el visitante para mostrar la pantalla correspondiente.

---

## Paso 1. Subir los Archivos a tu Servidor

1. En aaPanel ve a **Files**.
2. Entra a `/www/wwwroot/` y crea una carpeta llamada `cleanmail`.
3. Sube los archivos del proyecto a `/www/wwwroot/cleanmail`.
4. Abre la **Terminal** en aaPanel y ejecuta:
   ```bash
   cd /www/wwwroot/cleanmail
   npm install
   npm run build
   ```

---

## Paso 2. Crear el Proyecto Node en aaPanel

1. En el menú izquierdo de aaPanel ve a **Website** ➔ pestaña **Node project** (o en **App Store** ➔ **Node.js project manager**).
2. Haz clic en **Add Node Project**:
   - **Project Name**: `cleanmail`
   - **Path**: `/www/wwwroot/cleanmail`
   - **Run Opt**: `npm run start` (o `node server.ts`)
   - **Port**: Elige o anota el puerto que asignes (por ejemplo: `3001` o el que tengas libre).
   - **Node Version**: Node v20 o v22.
3. Haz clic en **Submit**. Verifica que el proyecto quede en estado **Running**.

*(Copia el número de puerto que configuraste, lo usaremos en el siguiente paso).*

---

## Paso 3. Crear los Sitios Web y el Reverse Proxy en aaPanel

Ahora le diremos a aaPanel que dirija el tráfico de ambos dominios a tu proyecto de Node:

### Sitio 1: Para la Landing (`unio.my`)
1. En aaPanel ve a **Website** ➔ **Add site**.
2. En **Domain name** escribe:
   ```
   unio.my
   www.unio.my
   ```
3. Clic en **Submit**.
4. Haz clic sobre el nombre del sitio `unio.my` para abrir su configuración (**Settings**):
   - Ve a la pestaña **Reverse Proxy** ➔ **Add reverse proxy**.
   - **Proxy name**: `landing-proxy`
   - **Target URL**: `http://127.0.0.1:TU_PUERTO` *(reemplaza TU_PUERTO por el puerto de tu Node, ej. 3001)*.
   - **Sent domain**: `$host`
   - Clic en **Save**.
   - *(Opcional)* En la pestaña **SSL** ➔ **Let's Encrypt** ➔ Selecciona ambos dominios y activa el SSL con un clic.

---

### Sitio 2: Para la App / Plataforma (`cleanmail.unio.my`)
1. En aaPanel ve a **Website** ➔ **Add site**.
2. En **Domain name** escribe:
   ```
   cleanmail.unio.my
   ```
3. Clic en **Submit**.
4. Haz clic sobre el nombre del sitio `cleanmail.unio.my` para abrir su configuración (**Settings**):
   - Ve a la pestaña **Reverse Proxy** ➔ **Add reverse proxy**.
   - **Proxy name**: `app-proxy`
   - **Target URL**: `http://127.0.0.1:TU_PUERTO` *(el MISMO puerto que el anterior)*.
   - **Sent domain**: `$host`
   - Clic en **Save**.
   - En la pestaña **SSL** ➔ **Let's Encrypt** ➔ Activa el SSL para `cleanmail.unio.my`.

---

## ¿Cómo Funciona la Separación Automática?

La aplicación CleanMail incluye un detector inteligente de dominios en tiempo real:

1. **Cuando alguien entra a `https://unio.my`**:
   - Detecta que está en el dominio raíz comercial.
   - Muestra de inmediato la **Landing Page** con los planes, la calculadora y los precios.
   - Al hacer clic en *"Acceso Clientes / Iniciar Sesión"* o *"Ir a la Plataforma"*, la landing los transfiere automáticamente a `https://cleanmail.unio.my`.

2. **Cuando alguien entra a `https://cleanmail.unio.my`**:
   - Detecta el prefijo `cleanmail`.
   - Si no ha iniciado sesión, muestra directamente el **Login** del sistema.
   - Si ya está autenticado, abre directamente el panel de depuración, listas de correo y campañas de email marketing.

3. **Carga de Archivos Grandes en aaPanel**:
   - En la configuración de cada sitio en aaPanel ➔ pestaña **Site Settings** ➔ **Config**:
     Verifica que tenga `client_max_body_size 50m;` para que permita subir listas CSV y Excel de gran tamaño sin rechazar la conexión.
