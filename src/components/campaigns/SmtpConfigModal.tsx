import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
  Send,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';

interface SmtpConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmtpConfigModal: React.FC<SmtpConfigModalProps> = ({ isOpen, onClose }) => {
  const [enabled, setEnabled] = useState(false);
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [senderName, setSenderName] = useState('CleanMail Envíos');
  const [senderEmail, setSenderEmail] = useState('notificaciones@tuempresa.com');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/campaigns/smtp')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setEnabled(Boolean(data.data.enabled));
            setHost(data.data.host || 'smtp.gmail.com');
            setPort(Number(data.data.port) || 465);
            setSecure(data.data.secure !== undefined ? Boolean(data.data.secure) : true);
            setUser(data.data.user || 'stevencerezo2@gmail.com');
            setPass(data.data.pass || '');
            setSenderName(data.data.senderName || 'CleanMail Envíos');
            setSenderEmail(data.data.senderEmail || (data.data.user || 'stevencerezo2@gmail.com'));
            setTestEmail(data.data.user || 'stevencerezo2@gmail.com');
          } else {
            // Valores recomendados para Google por defecto
            setHost('smtp.gmail.com');
            setPort(465);
            setSecure(true);
            setUser('stevencerezo2@gmail.com');
            setSenderEmail('stevencerezo2@gmail.com');
            setTestEmail('stevencerezo2@gmail.com');
          }
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const cleanPass = pass ? pass.trim().replace(/\s+/g, '') : '';
      const cleanUser = user.trim();

      const res = await fetch('/api/campaigns/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true, // Se activa automáticamente al guardar credenciales
          host: host.trim() || 'smtp.gmail.com',
          port: Number(port) || 465,
          secure: Boolean(secure),
          user: cleanUser,
          pass: cleanPass,
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim() || cleanUser,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnabled(true);
        setStatusMsg({
          success: true,
          text: '¡Configuración SMTP guardada exitosamente! Ahora puedes realizar una prueba de envío real.',
        });
      } else {
        setStatusMsg({
          success: false,
          text: data.message || 'Error guardando configuración.',
        });
      }
    } catch (e: unknown) {
      setStatusMsg({
        success: false,
        text: (e as Error).message || 'Error de comunicación.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const targetEmail = testEmail.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setStatusMsg({
        success: false,
        text: 'Ingresa un correo válido en el campo de prueba para verificar el envío.',
      });
      return;
    }

    if (!user.trim()) {
      setStatusMsg({
        success: false,
        text: 'Debes ingresar tu correo de usuario (ej. stevencerezo2@gmail.com) para autenticar la conexión.',
      });
      return;
    }

    if (!pass.trim()) {
      setStatusMsg({
        success: false,
        text: 'Debes ingresar tu Contraseña de Aplicación de 16 caracteres de Google para probar.',
      });
      return;
    }

    setIsTesting(true);
    setStatusMsg(null);
    try {
      const cleanPass = pass.trim().replace(/\s+/g, '');
      const cleanUser = user.trim();

      const res = await fetch('/api/campaigns/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: host.trim() || 'smtp.gmail.com',
          port: Number(port) || 465,
          secure: Boolean(secure),
          user: cleanUser,
          pass: cleanPass,
          recipientEmail: targetEmail,
          senderName: senderName.trim() || 'CleanMail Conexión',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({
          success: true,
          text: `¡CORREO REAL ENTREGADO! Revisa de inmediato la bandeja de entrada o spam de ${targetEmail}. Tu cuenta de Google está 100% activa.`,
        });
      } else {
        setStatusMsg({
          success: false,
          text: data.message || 'Error en prueba de envío SMTP.',
        });
      }
    } catch (e: unknown) {
      setStatusMsg({
        success: false,
        text: (e as Error).message || 'Error al conectar con el servidor.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a2c7]/20 border border-[#00a2c7]/40 flex items-center justify-center text-[#00a2c7]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Configuración de Servidor SMTP</h2>
              <p className="text-xs text-slate-300">
                Conecta tu propio proveedor de correos (Gmail, SendGrid, Amazon SES, Brevo o cPanel)
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                statusMsg.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMsg.success ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Toggle Activar SMTP Propio */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800">
                Usar Servidor SMTP Personalizado
              </span>
              <p className="text-[11px] text-slate-500">
                Si está desactivado, CleanMail utiliza el motor de transporte directo del sistema.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a2c7]"></div>
            </label>
          </div>

          {/* Presets Rápidos de Proveedores */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#00a2c7]" />
              <span>Plantillas Rápidas (1 Clic para Autocompletar):</span>
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEnabled(true);
                  setHost('smtp.gmail.com');
                  setPort(465);
                  setSecure(true);
                  if (!user) setUser('stevencerezo2@gmail.com');
                  if (!senderEmail) setSenderEmail('stevencerezo2@gmail.com');
                  if (!testEmail) setTestEmail('stevencerezo2@gmail.com');
                }}
                className="px-3.5 py-2 bg-red-50 border-2 border-red-300 hover:border-red-500 hover:text-red-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <span>🔴 Autocompletar para Google (Gmail / Workspace)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEnabled(true);
                  setHost('mail.tudominio.com');
                  setPort(587);
                  setSecure(false);
                }}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:border-[#00a2c7] hover:text-[#00a2c7] rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <span>🏢 Servidor Propio (cPanel / VPS)</span>
              </button>
            </div>
          </div>

          {/* Guía Específica para Google (Gmail / Workspace) */}
          <div className="p-3.5 bg-red-50/70 border border-red-200/80 rounded-xl space-y-1.5 text-xs text-red-950">
            <div className="font-bold flex items-center gap-1.5">
              <span>🔑 ¿Cómo conectar tu cuenta de Google (Gmail o Workspace)?</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Google no permite usar tu contraseña personal habitual. Debes generar una <strong>Contraseña de Aplicación de 16 letras</strong>:
            </p>
            <ol className="text-[11px] text-slate-700 pl-4 list-decimal space-y-1">
              <li>Inicia sesión en tu Cuenta de Google y ve a <strong>Seguridad</strong>.</li>
              <li>Asegúrate de tener activa la <strong>Verificación en 2 pasos</strong>.</li>
              <li>Busca la opción <strong>Contraseñas de aplicaciones</strong> (o entra directo a <code>myaccount.google.com/apppasswords</code>).</li>
              <li>Escribe el nombre "CleanMail" y haz clic en <strong>Crear</strong>.</li>
              <li>Copia esa contraseña de 16 caracteres y pégala en el campo <strong>Contraseña / Token SMTP</strong> abajo.</li>
            </ol>
          </div>

          {/* Guía Técnica y Checklist Anti-Spam para Servidor Propio */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-2 text-xs text-blue-950">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#00a2c7]" />
                <span>¿Envías desde tu propio servidor? Checklist Vital para NO caer en SPAM:</span>
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-700 pl-4 list-disc leading-relaxed">
              <li>
                <strong>Registro SPF (TXT en tu DNS):</strong> <code>v=spf1 ip4:TU_IP include:_spf.tudominio.com ~all</code> (autoriza a tu servidor a enviar en nombre de tu dominio).
              </li>
              <li>
                <strong>Firma DKIM:</strong> Clave criptográfica pública en DNS que certifica que el mensaje no fue modificado en el camino.
              </li>
              <li>
                <strong>Política DMARC (TXT):</strong> <code>v=DMARC1; p=none; rua=mailto:dmarc@tudominio.com</code> (protege contra suplantación de identidad).
              </li>
              <li>
                <strong>DNS Inverso (PTR / rDNS):</strong> La IP de tu servidor DEBE resolver a tu hostname de correo (ej. <code>mail.tudominio.com</code>). Si no hay PTR, Gmail y Outlook rechazan el mensaje con error 550.
              </li>
              <li>
                <strong>Pacing Regulado:</strong> Envía con velocidad controlada (5 a 8 correos/segundo, ya preconfigurado en CleanMail) para evitar bloqueos por tasa de envío.
              </li>
            </ul>
          </div>

          {/* Campos de configuración */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Servidor SMTP (Host)
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="smtp.gmail.com o mail.tudominio.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Puerto (Port)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  placeholder="587 o 465"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
                <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 shrink-0">
                  <input
                    type="checkbox"
                    checked={secure}
                    onChange={(e) => setSecure(e.target.checked)}
                    className="accent-[#00a2c7]"
                  />
                  <span>SSL (465)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Usuario / Correo SMTP
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="usuario@tudominio.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña / Token SMTP
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Contraseña o App Password de Gmail"
                  className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de Remitente por Defecto
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Ej: Notificaciones CleanMail"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo de Remitente por Defecto
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="notificaciones@tudominio.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
              />
            </div>
          </div>

          {/* Prueba de conexión y entrega real */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Probar Conexión y Enviar Correo Real de Prueba:</span>
              </span>
              <button
                type="button"
                onClick={() => setTestEmail('stevencerezo2@gmail.com')}
                className="text-[11px] text-[#00a2c7] hover:underline font-semibold cursor-pointer"
              >
                Usar stevencerezo2@gmail.com
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              CleanMail enviará un mensaje de prueba real a la dirección que indiques abajo utilizando las credenciales actuales para certificar que llegan a tu bandeja de entrada.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Ingresa tu correo para recibir la prueba..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTesting ? 'Enviando Correo...' : 'Enviar Prueba Real'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba8] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
