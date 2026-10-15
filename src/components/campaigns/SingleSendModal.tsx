import React, { useState } from 'react';
import {
  X,
  Send,
  Upload,
  FileCode,
  Eye,
  Code,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface SingleSendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_TEMPLATES = [
  {
    name: 'ACTUASEG - Corredora de Seguros',
    subject: 'Asesoría y Coberturas Exclusivas - ACTUASEG',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #1e3a8a, #0284c7); padding: 32px 24px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ACTUASEG</h2>
    <p style="margin: 6px 0 0; opacity: 0.95; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Corredora de Seguros & Asesoría Integral</p>
  </div>
  <div style="padding: 28px 24px; color: #334155; line-height: 1.6;">
    <h3 style="color: #0f172a; font-size: 18px; margin-top: 0;">Estimado/a cliente en {{email}},</h3>
    <p>Nos complace saludarte desde <strong>ACTUASEG</strong>. Queremos recordarte los beneficios exclusivos y coberturas preferenciales disponibles para tu protección patrimonial, vehicular y de salud este mes.</p>
    
    <div style="margin: 20px 0;">
      <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 12px;">
        <strong style="color: #0f172a; font-size: 14px;">🛡️ Cobertura Integral de Vehículos y Flotas</strong>
        <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">Asistencia 24/7 y tasas preferenciales con las mejores aseguradoras del país.</p>
      </div>
      <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 0 8px 8px 0;">
        <strong style="color: #0f172a; font-size: 14px;">📋 Seguros Corporativos & Fianzas</strong>
        <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">Pólizas de cumplimiento y responsabilidad civil con emisión expedita.</p>
      </div>
    </div>

    <div style="text-align: center; margin: 26px 0;">
      <a href="mailto:actuariosa@gmail.com" style="background: #0284c7; color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Solicitar Cotización Sin Costo</a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
      ACTUASEG &bull; Respaldo, Solidez y Confianza para {{dominio}} &bull; Fecha: {{fecha}}
    </p>
  </div>
</div>`,
  },
  {
    name: 'Prueba Rápida con Estilos CSS',
    subject: 'Verificación de Plantilla y Entrega 1 a 1',
    html: `<div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #00a2c7, #008ba8); padding: 30px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Prueba de Envío Individual</h1>
    <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">Comprobación de renderizado para {{email}}</p>
  </div>
  <div style="padding: 26px 24px; color: #334155; line-height: 1.6;">
    <p style="font-size: 15px; margin-top: 0;">¡Hola!</p>
    <p>Este es un correo de prueba individual (1 a 1) emitido desde <strong>CleanMail</strong> para verificar cómo se visualiza tu diseño en bandejas de entrada reales.</p>
    
    <div style="background: #f8fafc; border-left: 4px solid #00a2c7; padding: 14px 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px;">Especificaciones Técnicas:</h4>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #64748b;">
        <li>HTML5 estructurado con CSS inline compatible.</li>
        <li>Variables dinámicas procesadas: {{dominio}}</li>
        <li>Fecha de emisión: {{fecha}}</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 26px 0;">
      <a href="https://cleanmail.io" style="background: #00a2c7; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Verificar Enlace</a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
      Si estás viendo este correo correctamente, tu plantilla está lista para envíos masivos.
    </p>
  </div>
</div>`,
  },
  {
    name: 'Plantilla en Blanco',
    subject: 'Mi Plantilla Personalizada',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
  <h2 style="color: #0f172a; margin-top: 0;">Hola {{email}}</h2>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Escribe o pega aquí el contenido de tu mensaje. Puedes subir tu archivo HTML con CSS usando el botón superior.
  </p>
</div>`,
  },
];

export const SingleSendModal: React.FC<SingleSendModalProps> = ({ isOpen, onClose }) => {
  const [recipientEmail, setRecipientEmail] = useState('stevencerezo2@gmail.com');
  const [subject, setSubject] = useState('Prueba de Plantilla y Renderizado');
  const [senderName, setSenderName] = useState('CleanMail Tester');
  const [senderEmail, setSenderEmail] = useState('stevencerezo2@gmail.com');
  const [htmlContent, setHtmlContent] = useState(SAMPLE_TEMPLATES[0].html);

  const [previewMode, setPreviewMode] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [resultStatus, setResultStatus] = useState<{
    success: boolean;
    msg: string;
    details?: string;
  } | null>(null);

  // Cargar configuración de remitente SMTP por defecto si existe
  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/campaigns/smtp')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            if (data.data.senderName) setSenderName(data.data.senderName);
            if (data.data.user) {
              setSenderEmail(data.data.user);
              if (!recipientEmail) setRecipientEmail(data.data.user);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Manejo de subida de archivo .html o .htm desde el ordenador
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('Por favor selecciona un archivo con extensión .html o .htm');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setHtmlContent(content);
        setUploadedFileName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
        setResultStatus({
          success: true,
          msg: `Plantilla "${file.name}" cargada con éxito en el editor.`,
        });
      }
    };
    reader.readAsText(file);
  };

  // Enviar el correo individual 1 a 1
  const handleSendSingle = async () => {
    setResultStatus(null);

    if (!recipientEmail || !recipientEmail.trim() || !recipientEmail.includes('@')) {
      setResultStatus({
        success: false,
        msg: 'Debes ingresar una dirección de correo destinatario válida para la prueba.',
      });
      return;
    }

    if (!subject.trim()) {
      setResultStatus({
        success: false,
        msg: 'El asunto del mensaje es obligatorio.',
      });
      return;
    }

    if (!htmlContent.trim()) {
      setResultStatus({
        success: false,
        msg: 'El contenido HTML de la plantilla no puede estar vacío.',
      });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/campaigns/single-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          subject: subject.trim(),
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim(),
          htmlContent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResultStatus({
          success: true,
          msg: `¡Correo enviado exitosamente a ${recipientEmail}!`,
          details: 'Revisa tu bandeja de entrada o spam para ver el renderizado exacto.',
        });
      } else {
        setResultStatus({
          success: false,
          msg: data.message || 'Error al procesar el envío.',
        });
      }
    } catch (err: unknown) {
      setResultStatus({
        success: false,
        msg: (err as Error).message || 'Error de conexión con el servidor de envío.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getRenderedPreview = () => {
    const sampleEmail = recipientEmail || 'usuario.prueba@ejemplo.com';
    const domain = sampleEmail.includes('@') ? sampleEmail.split('@')[1] : 'ejemplo.com';
    const now = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return htmlContent
      .replace(/\{\{\s*email\s*\}\}/gi, sampleEmail)
      .replace(/\{\{\s*dominio\s*\}\}/gi, domain)
      .replace(/\{\{\s*fecha\s*\}\}/gi, now)
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, '#unsubscribe-demo');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a2c7]/20 border border-[#00a2c7]/40 flex items-center justify-center text-[#00a2c7]">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Envío Individual de Prueba (1 a 1)</h2>
              <p className="text-xs text-slate-300">
                Prueba el envío real y el renderizado de tu plantilla antes de lanzar campañas masivas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Alerta de Resultado */}
          {resultStatus && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                resultStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {resultStatus.success ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-sm">{resultStatus.msg}</p>
                {resultStatus.details && <p className="mt-0.5 opacity-90">{resultStatus.details}</p>}
              </div>
            </div>
          )}

          {/* Formulario de Remitente y Destinatario de Prueba */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Destinatario y Datos del Mensaje
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Destinatario de Prueba *
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="tu-correo-personal@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asunto del Correo (Subject) *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Prueba de diseño CleanMail"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Remitente
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ej: Carlos de CleanMail"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Remitente
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="Ej: notificaciones@tuempresa.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>
            </div>
          </div>

          {/* Subida de Plantilla HTML & Editor */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Plantilla HTML con Estilos CSS</span>
                  {uploadedFileName && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {uploadedFileName}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Sube tu archivo .html desde tu ordenador o edítalo directamente en el panel.
                </p>
              </div>

              {/* Botón de Subida de Archivo HTML */}
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#00a2c7] text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#00a2c7]" />
                  <span>Subir Archivo .html</span>
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Switch Editor vs Preview */}
                <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('editor')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      previewMode === 'editor'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5 inline mr-1" />
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('preview')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      previewMode === 'preview'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1" />
                    Vista Previa
                  </button>
                </div>
              </div>
            </div>

            {/* Aviso Educativo sobre HTML, CSS y JavaScript en Correos */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>¿Por qué HTML & CSS sí, pero JavaScript NO en emails?</strong>
                <p className="mt-0.5">
                  Los clientes de correo (Gmail, Outlook, Apple Mail) aceptan <strong>HTML y estilos CSS</strong> (diseño responsive, botones, colores y tipografías). Sin embargo, <strong>bloquean al 100% el código JavaScript (`&lt;script&gt;`)</strong> por estrictos estándares internacionales de ciberseguridad para prevenir malware y phishing. Si envías JS, el correo será mandado directamente a SPAM. Usa estilos CSS para tus interacciones.
                </p>
              </div>
            </div>

            {/* Editor o Preview */}
            {previewMode === 'editor' ? (
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={10}
                className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-300 bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#00a2c7] leading-relaxed resize-y"
                placeholder="Pega o escribe tu código HTML con CSS..."
              />
            ) : (
              <div className="bg-slate-200 rounded-xl p-4 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2 bg-white p-1 rounded-lg border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-[#00a2c7] text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-[#00a2c7] text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Móvil</span>
                  </button>
                </div>

                <div
                  className={`bg-white rounded-xl shadow-md border border-slate-300 p-4 overflow-y-auto ${
                    previewDevice === 'desktop' ? 'w-full max-w-xl' : 'w-[320px]'
                  }`}
                  style={{ maxHeight: '350px' }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: getRenderedPreview() }}
                    className="prose prose-xs max-w-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Envío de prueba individual aislado (no afecta a ninguna lista de producción)
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSendSingle}
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba8] text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Enviando prueba...' : 'Enviar Correo Individual (1 a 1)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
