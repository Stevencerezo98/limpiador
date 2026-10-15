import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Server,
  Layers,
  HardDrive,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  FileJson,
} from 'lucide-react';
import { UserSession } from '../server/db/schema.ts';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onRestoreSuccess?: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  session,
  onRestoreSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'server_guide'>('backup');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Descargar Copia de Seguridad completa del servidor
  const handleDownloadBackup = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) {
        throw new Error('No se pudo generar la copia de seguridad desde el servidor.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `cleanmail_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert((err as Error).message || 'Error al descargar la copia de seguridad.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Restaurar Copia de Seguridad desde archivo JSON
  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setRestoreStatus({
        success: false,
        message: 'Por favor selecciona un archivo con formato .json válido de CleanMail.',
      });
      e.target.value = '';
      return;
    }

    if (
      !confirm(
        `¿Deseas restaurar la base de datos con el archivo "${file.name}"? Los datos de listas, correos depurados y campañas se actualizarán con este respaldo.`
      )
    ) {
      e.target.value = '';
      return;
    }

    setIsRestoring(true);
    setRestoreStatus(null);

    try {
      const fileText = await file.text();
      const parsedData = JSON.parse(fileText);

      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(parsedData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRestoreStatus({
          success: true,
          message: data.message || '¡Base de datos restaurada exitosamente!',
        });
        if (onRestoreSuccess) {
          onRestoreSuccess();
        }
      } else {
        setRestoreStatus({
          success: false,
          message: data.message || 'Error al procesar la restauración.',
        });
      }
    } catch (err) {
      setRestoreStatus({
        success: false,
        message:
          (err as Error).message ||
          'El archivo seleccionado no tiene una estructura JSON válida de CleanMail.',
      });
    } finally {
      setIsRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a2c7]/20 border border-[#00a2c7]/40 flex items-center justify-center text-[#00a2c7]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Copia de Seguridad & Actualización de Servidor</h2>
              <p className="text-xs text-slate-300">
                Respalda tus listas depuradas y aprende a actualizar el código sin perder ningún dato
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'bg-white text-[#00a2c7] border-t-2 border-[#00a2c7] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Descargar Respaldo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('restore')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'restore'
                ? 'bg-white text-[#00a2c7] border-t-2 border-[#00a2c7] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Restaurar Copia</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('server_guide')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'server_guide'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>¿Cómo Actualizar en mi Servidor?</span>
          </button>
        </div>

        {/* Contenido de la Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* TAB 1: DESCARGAR COPIA DE SEGURIDAD */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-emerald-950">
                    Copia de Seguridad Integral con 1 Clic
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Al descargar esta copia, obtendrás un archivo JSON completo que incluye todas tus
                    categorías, todos los correos depurados (válidos, descartados, con sus scores y
                    estados), tus campañas de email marketing, registros de entrega y configuración SMTP.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Formato</span>
                  <span className="text-sm font-black text-slate-800">JSON Estructurado</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Ubicación en Servidor
                  </span>
                  <span className="text-sm font-mono font-bold text-[#00a2c7]">data/db.json</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Seguridad</span>
                  <span className="text-sm font-bold text-emerald-700">Listo para Migrar</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={isDownloading}
                  className="px-6 py-3.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba8] disabled:opacity-50 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
                >
                  <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>
                    {isDownloading ? 'Generando descarga...' : 'Descargar Copia de Seguridad (.json)'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  Guarda este archivo en tu computadora antes de realizar cualquier actualización en tu servidor.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: RESTAURAR COPIA */}
          {activeTab === 'restore' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-950">Restauración de Base de Datos</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Si formateaste tu servidor, cambiaste de VPS o recreaste tu contenedor Docker, puedes
                    subir aquí tu archivo de respaldo anterior. CleanMail reincorporará inmediatamente todas
                    tus listas y registros depurados.
                  </p>
                </div>
              </div>

              {restoreStatus && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    restoreStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {restoreStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block text-xs">
                      {restoreStatus.success ? 'Restauración Exitosa' : 'Atención al Restaurar'}
                    </span>
                    <p className="text-xs mt-0.5">{restoreStatus.message}</p>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-300 hover:border-[#00a2c7] rounded-2xl p-8 text-center bg-slate-50/50 transition">
                <FileJson className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Selecciona tu archivo de respaldo</h4>
                <p className="text-slate-500 text-xs mt-1 mb-4">
                  Debe ser un archivo previamente descargado con extensión <strong>.json</strong>
                </p>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-md transition">
                  <Upload className="w-4 h-4" />
                  <span>{isRestoring ? 'Restaurando datos...' : 'Cargar Archivo de Respaldo (.json)'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    disabled={isRestoring}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: GUÍA PASO A PASO PARA EL SERVIDOR */}
          {activeTab === 'server_guide' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950">
                    ¿Dónde se guardan mis datos depurados en el servidor?
                  </h4>
                  <p className="text-[11px] text-purple-900/80 mt-0.5 leading-relaxed">
                    CleanMail almacena todas las listas, correos y campañas en la carpeta:{' '}
                    <code className="px-1.5 py-0.5 rounded bg-purple-100 font-mono font-bold text-purple-900">
                      /data/db.json
                    </code>
                    . Mientras esa carpeta no sea eliminada, tu información siempre permanecerá intacta.
                  </p>
                </div>
              </div>

              {/* Método 1: Docker */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Si usas Docker (La regla de oro: Mapear el volumen persistente)</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Recomendado Docker
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Para que al actualizar tu imagen o contenedor Docker no pierdas tus datos, siempre debes
                  arrancar el contenedor montando el volumen{' '}
                  <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">
                    -v $(pwd)/data:/app/data
                  </code>
                  :
                </p>

                <div className="relative bg-slate-950 rounded-xl p-3.5 font-mono text-[11px] text-slate-200 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'docker run -d -p 3000:3000 -v $(pwd)/data:/app/data --name cleanmail cleanmail-app',
                        'docker-cmd'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copiar comando"
                  >
                    {copiedCode === 'docker-cmd' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <code>
                    docker run -d -p 3000:3000 -v $(pwd)/data:/app/data --name cleanmail cleanmail-app
                  </code>
                </div>
                <p className="text-[11px] text-slate-500">
                  ✅ <strong>Ventaja:</strong> Puedes hacer <code className="font-mono">docker rm -f cleanmail</code>,
                  reconstruir la imagen con la nueva versión y volver a ejecutarlo. Todo tu trabajo de
                  depuración continuará allí sin borrarse.
                </p>
              </div>

              {/* Método 2: Git / VPS / SSH */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Si usas Linux / VPS directo (Git + PM2 o Node.js)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Script Paso a Paso
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Ejecuta esta secuencia en tu terminal para actualizar el código sin tocar tu base de datos:
                </p>

                <div className="relative bg-slate-950 rounded-xl p-3.5 font-mono text-[11px] text-slate-200 space-y-1">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `# 1. Copia de respaldo preventiva\ncp data/db.json data/db_backup_$(date +%F).json\n\n# 2. Descargar código nuevo\ngit pull\n\n# 3. Compilar nueva versión\nnpm install\nnpm run build\n\n# 4. Reiniciar servicio\npm2 restart cleanmail`,
                        'vps-cmd'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copiar secuencia"
                  >
                    {copiedCode === 'vps-cmd' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <p className="text-slate-500"># 1. Copia preventiva por seguridad</p>
                  <p className="text-emerald-400">cp data/db.json data/db_backup_$(date +%F).json</p>
                  <p className="text-slate-500 mt-2"># 2. Descargar cambios del repositorio</p>
                  <p className="text-cyan-400">git pull</p>
                  <p className="text-slate-500 mt-2"># 3. Compilar la aplicación</p>
                  <p className="text-amber-300">npm install && npm run build</p>
                  <p className="text-slate-500 mt-2"># 4. Reiniciar el proceso</p>
                  <p className="text-emerald-400">pm2 restart cleanmail</p>
                </div>
                <p className="text-[11px] text-slate-500">
                  El archivo <code className="font-mono">data/db.json</code> no se sobreescribe con{' '}
                  <code className="font-mono">git pull</code>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">CleanMail &bull; Sistema Autónomo y Persistente</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
