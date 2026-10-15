import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code,
  Smartphone,
  Monitor,
  ShieldCheck,
  Check,
  Info,
  Upload,
} from 'lucide-react';
import { Categoria, ListsRecipientsPreview } from '../../server/db/schema.ts';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Categoria[];
  onCampaignCreated: () => void;
}

const TEMPLATES = [
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
    name: 'Newsletter Corporativo',
    subject: 'Novedades y Actualizaciones del Mes',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background: #00a2c7; padding: 32px 24px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Boletín Informativo</h1>
    <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Resumen exclusivo para {{email}}</p>
  </div>
  <div style="padding: 30px 24px; color: #334155; line-height: 1.6;">
    <p style="font-size: 16px; margin-top: 0;">Hola,</p>
    <p>Nos complace compartir contigo nuestras últimas noticias y actualizaciones destacadas de este mes.</p>
    <div style="background: #f8fafc; border-left: 4px solid #00a2c7; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 8px; color: #0f172a; font-size: 15px;">🌟 Destacado de la semana</h3>
      <p style="margin: 0; font-size: 14px; color: #64748b;">Optimiza tus procesos con nuestras nuevas herramientas y listas 100% verificadas.</p>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="#" style="background: #00a2c7; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Conoce más detalles</a>
    </div>
    <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Fecha de emisión: {{fecha}}</p>
  </div>
</div>`,
  },
  {
    name: 'Lanzamiento & Oferta',
    subject: '¡Lanzamiento Especial para tu Empresa!',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 36px 24px; text-align: center; color: white;">
    <span style="background: #00a2c7; color: white; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">Nuevo Servicio</span>
    <h1 style="margin: 14px 0 6px; font-size: 26px;">Impulsa tu Alcance al Máximo</h1>
    <p style="margin: 0; color: #94a3b8; font-size: 14px;">Preparado especialmente para el dominio {{dominio}}</p>
  </div>
  <div style="padding: 30px 24px; color: #334155; line-height: 1.6;">
    <p style="font-size: 15px;">Estimado contacto en <strong>{{email}}</strong>,</p>
    <p>Queremos invitarte a probar nuestra nueva solución con un beneficio preferencial para tus campañas de alta entregabilidad.</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; text-align: center; margin: 22px 0;">
      <span style="font-size: 24px; font-weight: 800; color: #166534;">20% OFF</span>
      <p style="margin: 4px 0 0; font-size: 13px; color: #15803d;">Válido durante este mes para registros calificados</p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="#" style="background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">Activar Beneficio Ahora</a>
    </div>
  </div>
</div>`,
  },
  {
    name: 'Notificación de Servicio',
    subject: 'Actualización Importante sobre tu Cuenta',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; padding: 32px 24px;">
  <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
    <span style="color: #00a2c7; font-weight: 800; font-size: 18px;">CleanMail Services</span>
  </div>
  <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Notificación oficial</h2>
  <p style="color: #475569; line-height: 1.6; font-size: 14px;">
    Hola, te informamos que hemos finalizado la depuración preventiva para el dominio <strong>{{dominio}}</strong> con fecha {{fecha}}.
  </p>
  <p style="color: #475569; line-height: 1.6; font-size: 14px;">
    Tu cuenta asociada a <strong>{{email}}</strong> se encuentra totalmente operativa y validada.
  </p>
  <div style="margin: 25px 0;">
    <a href="#" style="background: #0f172a; color: white; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">Ir al Panel de Control</a>
  </div>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
    Si no realizaste ninguna solicitud, puedes ignorar este aviso con tranquilidad.
  </p>
</div>`,
  },
];

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCampaignCreated,
}) => {
  // Datos del formulario
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [senderName, setSenderName] = useState('Equipo CleanMail');
  const [senderEmail, setSenderEmail] = useState('notificaciones@cleanmail.io');
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [pacingPerSecond, setPacingPerSecond] = useState(2);
  const [delaySecondsBetweenEmails, setDelaySecondsBetweenEmails] = useState<number>(3); // 3 seg por defecto (óptimo para Google)
  const [batchLimit, setBatchLimit] = useState<number | ''>(''); // Vacío = todos los válidos
  const [htmlContent, setHtmlContent] = useState(TEMPLATES[0].html);

  // Estados de vista y UI
  const [previewMode, setPreviewMode] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ListsRecipientsPreview | null>(null);

  // Subida de archivo HTML local
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('Por favor selecciona un archivo con formato .html o .htm');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setHtmlContent(content);
        setUploadedFileName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
      }
    };
    reader.readAsText(file);
  };

  // Prueba de envío
  const [testEmail, setTestEmail] = useState('stevencerezo2@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Envío final / guardado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar configuración de remitente SMTP por defecto si existe
  useEffect(() => {
    if (isOpen) {
      fetch('/api/campaigns/smtp')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            if (data.data.senderName) setSenderName(data.data.senderName);
            if (data.data.user) {
              setSenderEmail(data.data.user);
              setTestEmail(data.data.user);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Seleccionar la primera categoría por defecto al abrir
  useEffect(() => {
    if (isOpen && categories.length > 0 && selectedListIds.length === 0) {
      // Buscar primera categoría con correos válidos
      const firstValid = categories.find((c) => (c.validos ?? 0) > 0) || categories[0];
      setSelectedListIds([firstValid.id]);
    }
  }, [isOpen, categories, selectedListIds.length]);

  // Consultar el contador dinámico en tiempo real cuando cambian las listas seleccionadas
  useEffect(() => {
    if (selectedListIds.length === 0) {
      setPreviewData(null);
      return;
    }

    let isMounted = true;
    setIsLoadingPreview(true);

    fetch(`/api/campaigns/preview-recipients?listIds=${selectedListIds.join(',')}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.data) {
          setPreviewData(data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching recipients preview:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedListIds]);

  if (!isOpen) return null;

  // Manejador para toggle de categorías
  const toggleListId = (id: string) => {
    setSelectedListIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllLists = () => {
    if (selectedListIds.length === categories.length) {
      setSelectedListIds([]);
    } else {
      setSelectedListIds(categories.map((c) => c.id));
    }
  };

  // Insertar variable dinámica en el editor HTML
  const insertVariable = (tag: string) => {
    setHtmlContent((prev) => prev + ` ${tag} `);
  };

  // Cargar plantilla prediseñada
  const loadTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setHtmlContent(tmpl.html);
    if (!subject.trim()) {
      setSubject(tmpl.subject);
    }
  };

  // Enviar correo de prueba
  const handleSendTest = async () => {
    const targetEmail = testEmail.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setTestStatus({ success: false, msg: 'Ingresa un correo de prueba válido (ej: stevencerezo2@gmail.com)' });
      return;
    }
    setIsSendingTest(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/campaigns/preview-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: targetEmail,
          subject: subject || 'Prueba de Campaña CleanMail',
          senderName: senderName || 'CleanMail Envíos',
          senderEmail: senderEmail || 'stevencerezo2@gmail.com',
          htmlContent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestStatus({
          success: true,
          msg: `¡Correo de prueba entregado con éxito a ${targetEmail}! Revisa tu bandeja de entrada o spam.`,
        });
      } else {
        setTestStatus({
          success: false,
          msg: data.message || 'Error en prueba de envío. Asegúrate de configurar tu cuenta en "Servidor SMTP".',
        });
      }
    } catch (err: unknown) {
      setTestStatus({
        success: false,
        msg: (err as Error).message || 'Error de conexión al enviar prueba.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Guardar campaña
  const handleSubmit = async (shouldSendImmediately: boolean) => {
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Debes asignar un nombre a la campaña.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Debes ingresar el asunto del correo.');
      return;
    }
    if (!senderEmail.trim() || !senderEmail.includes('@')) {
      setErrorMsg('Debes ingresar un correo de remitente válido.');
      return;
    }
    if (selectedListIds.length === 0) {
      setErrorMsg('Debes seleccionar al menos una lista depurada.');
      return;
    }
    if (!previewData || previewData.validRecipients === 0) {
      setErrorMsg(
        'Las listas seleccionadas no contienen correos en estado VÁLIDO para enviar. Por favor depura contactos primero.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          senderName,
          senderEmail,
          htmlContent,
          listIds: selectedListIds,
          pacingPerSecond: 2,
          delaySecondsBetweenEmails: Number(delaySecondsBetweenEmails) || 3,
          batchLimit: batchLimit ? Number(batchLimit) : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Error al guardar la campaña');
      }

      const createdCampaignId = data.data.id;

      // Si el usuario eligió iniciar el envío de inmediato
      if (shouldSendImmediately && createdCampaignId) {
        const sendRes = await fetch(`/api/campaigns/${createdCampaignId}/send`, {
          method: 'POST',
        });
        const sendData = await sendRes.json();
        if (!sendData.success) {
          console.warn('Campaña creada pero falló el inicio inmediato:', sendData.message);
        }
      }

      onCampaignCreated();
      onClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Error al procesar la campaña');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render HTML preview con reemplazo de etiquetas simuladas
  const getRenderedPreview = () => {
    const sampleEmail = 'contacto.demo@ejemplo.com';
    const sampleDomain = 'ejemplo.com';
    const sampleDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return htmlContent
      .replace(/\{\{\s*email\s*\}\}/gi, sampleEmail)
      .replace(/\{\{\s*dominio\s*\}\}/gi, sampleDomain)
      .replace(/\{\{\s*fecha\s*\}\}/gi, sampleDate)
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, '#unsubscribe-demo');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a2c7]/20 border border-[#00a2c7]/40 flex items-center justify-center text-[#00a2c7]">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nueva Campaña de Email Marketing</h2>
              <p className="text-xs text-slate-300">
                Envíos vinculados estrictamente a contactos depurados con estado VÁLIDO
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PASO 1: ASOCIACIÓN OBLIGATORIA DE LISTAS DEPURADAS */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00a2c7] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Selección de Listas Depuradas Obligatorias</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      Filtro Estricto: Solo VÁLIDOS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Marca las listas de CleanMail que alimentarán esta campaña.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSelectAllLists}
                className="text-xs font-semibold text-[#00a2c7] hover:underline cursor-pointer"
              >
                {selectedListIds.length === categories.length
                  ? 'Deseleccionar todas'
                  : 'Seleccionar todas las listas'}
              </button>
            </div>

            {/* Selector de Listas (Checkbox Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedListIds.includes(cat.id);
                const validos = cat.validos ?? 0;
                const total = cat.total_correos ?? 0;
                const invalidosOriesgo = total - validos;

                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleListId(cat.id)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 relative ${
                      isSelected
                        ? 'border-[#00a2c7] bg-white ring-2 ring-[#00a2c7]/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isSelected
                          ? 'bg-[#00a2c7] border-[#00a2c7] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{cat.nombre}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {validos.toLocaleString()} válidos
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-500">{total.toLocaleString()} totales</span>
                      </div>
                      {invalidosOriesgo > 0 && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          ↳ {invalidosOriesgo.toLocaleString()} riesgos/inválidos omitidos
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CONTADOR DINÁMICO EN TIEMPO REAL */}
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Destinatarios Válidos Garantizados:
                    </span>
                    {isLoadingPreview && (
                      <span className="text-xs text-slate-400 animate-pulse">Calculando...</span>
                    )}
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-2">
                    <span>{previewData ? previewData.validRecipients.toLocaleString() : 0}</span>
                    <span className="text-xs font-medium text-emerald-600">
                      correos 100% limpios y deduplicados
                    </span>
                  </div>
                </div>
              </div>

              {previewData && (
                <div className="flex flex-wrap items-center gap-3 text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                  <div className="bg-slate-100 px-3 py-1.5 rounded-lg">
                    <span className="text-slate-500">Listas Vinculadas:</span>{' '}
                    <strong className="text-slate-800">{selectedListIds.length}</strong>
                  </div>
                  <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-100">
                    <span>Excluidos (Riesgo/Inválidos):</span>{' '}
                    <strong>{previewData.excludedInvalidOrRisk.toLocaleString()}</strong>
                  </div>
                  {previewData.duplicatesRemoved > 0 && (
                    <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">
                      <span>Duplicados Omitidos:</span>{' '}
                      <strong>{previewData.duplicatesRemoved.toLocaleString()}</strong>
                    </div>
                  )}
                  {previewData.excludedUnsubscribed > 0 && (
                    <div className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg">
                      <span>Desuscritos Protegidos:</span>{' '}
                      <strong>{previewData.excludedUnsubscribed.toLocaleString()}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PASO 2: DATOS DEL REMITENTE Y ASUNTO */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
              <div className="w-7 h-7 rounded-lg bg-[#00a2c7] text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Configuración del Remitente y Envío
                </h3>
                <p className="text-xs text-slate-500">
                  Define quién envía el mensaje y la velocidad de entrega controlada.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Campaña (Interno) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Newsletter Octubre 2026 - Clientes VIP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
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
                  placeholder="Ej: Novedades importantes para tu equipo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Remitente (Sender Name) *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ej: Carlos de CleanMail"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo del Remitente (Sender Email) *
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="Ej: notificaciones@tuempresa.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>
            </div>

            {/* Control de Cantidad a Enviar y Pausa Progresiva (Anti-Burst / Google Limits) */}
            <div className="pt-2 border-t border-slate-200/80 space-y-4">
              {/* 1. Límite de cantidad de correos a enviar */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Cantidad de correos a enviar en esta tanda:</span>
                    <span className="text-[#00a2c7] font-extrabold">
                      {batchLimit
                        ? `${batchLimit} correos seleccionados`
                        : `Todos (${previewData?.validRecipients || 0} válidos)`}
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Control de lote para no exceder cuotas de Google
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchLimit('')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      batchLimit === ''
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos los válidos
                  </button>
                  {[25, 50, 100, 200, 500].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBatchLimit(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        batchLimit === num
                          ? 'bg-[#00a2c7] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[11px] text-slate-500 font-medium">Personalizado:</span>
                    <input
                      type="number"
                      min="1"
                      max={previewData?.validRecipients || 10000}
                      value={batchLimit}
                      onChange={(e) =>
                        setBatchLimit(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder="Ej: 40"
                      className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#00a2c7]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Control de Pausa entre correos (Para no enviar de golpe) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Pausa entre cada correo (No enviar de golpe):</span>
                    <span className="text-[#00a2c7] font-extrabold">
                      {delaySecondsBetweenEmails} seg de descanso
                    </span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    ✓ Simulación humana progresiva
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { sec: 1, label: '1 seg (Rápido)' },
                    { sec: 2, label: '2 seg (Seguro)' },
                    { sec: 3, label: '3 seg (Recomendado Google)' },
                    { sec: 5, label: '5 seg (Ultra Cauteloso)' },
                    { sec: 10, label: '10 seg (Espaciado Máximo)' },
                  ].map((item) => (
                    <button
                      key={item.sec}
                      type="button"
                      onClick={() => setDelaySecondsBetweenEmails(item.sec)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        delaySecondsBetweenEmails === item.sec
                          ? 'bg-[#00a2c7] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Al agregar una pausa de {delaySecondsBetweenEmails}s entre cada mensaje, tus correos se despachan uno a uno en fila india, evitando picos de tráfico repentinos que puedan alertar a Google o a tu servidor de correo.
                </p>
              </div>
            </div>
          </div>

          {/* PASO 3: PLANTILLA, EDITOR HTML Y PREVISUALIZACIÓN */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00a2c7] text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Contenido y Plantilla de Email
                  </h3>
                  <p className="text-xs text-slate-500">
                    Usa variables dinámicas y verifica la previsualización en vivo.
                  </p>
                </div>
              </div>

              {/* Controles de Plantilla: Subir Archivo y Switch de Vista */}
              <div className="flex items-center gap-2">
                <label className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#00a2c7] text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#00a2c7]" />
                  <span>Subir .html</span>
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('editor')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      previewMode === 'editor'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Editor HTML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      previewMode === 'preview'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Vista Previa</span>
                  </button>
                </div>
              </div>
            </div>

            {uploadedFileName && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                <span>
                  ✓ Plantilla importada exitosamente: <strong>{uploadedFileName}</strong>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Listo en el editor</span>
              </div>
            )}

            {/* Guía Técnica sobre HTML, CSS y JavaScript en Correos */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Compatibilidad de Código: HTML & CSS sí, JavaScript NO</strong>
                <p className="mt-0.5">
                  Puedes incluir cualquier estructura <strong>HTML5 y estilos CSS</strong> (estilos inline recomendados y etiquetas <code>&lt;style&gt;</code> para diseño responsive). <strong>JavaScript (<code>&lt;script&gt;</code>) está prohibido en todo el mundo por clientes de correo</strong> (Gmail, Outlook, Yahoo) por seguridad; incluir JS enviaría tu mensaje directo a SPAM.
                </p>
              </div>
            </div>

            {/* Plantillas prediseñadas rápidas */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Cargar Plantilla:</span>
              </span>
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => loadTemplate(tmpl)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#00a2c7] hover:text-[#00a2c7] font-medium transition cursor-pointer shadow-2xs"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            {/* Tags dinámicos */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-500">Variables Disponibles:</span>
              <button
                type="button"
                onClick={() => insertVariable('{{email}}')}
                className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 transition cursor-pointer"
              >
                + &#123;&#123;email&#125;&#125;
              </button>
              <button
                type="button"
                onClick={() => insertVariable('{{dominio}}')}
                className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded hover:bg-indigo-100 transition cursor-pointer"
              >
                + &#123;&#123;dominio&#125;&#125;
              </button>
              <button
                type="button"
                onClick={() => insertVariable('{{fecha}}')}
                className="text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded hover:bg-purple-100 transition cursor-pointer"
              >
                + &#123;&#123;fecha&#125;&#125;
              </button>
              <button
                type="button"
                onClick={() => insertVariable('{{unsubscribe_url}}')}
                className="text-xs font-mono bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded hover:bg-rose-100 transition cursor-pointer"
              >
                + &#123;&#123;unsubscribe_url&#125;&#125;
              </button>
            </div>

            {/* Editor o Preview */}
            {previewMode === 'editor' ? (
              <div>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={12}
                  className="w-full font-mono text-xs p-4 rounded-xl border border-slate-200 bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#00a2c7] leading-relaxed resize-y"
                  placeholder="Ingresa tu código HTML aquí..."
                />
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#00a2c7]" />
                  <span>
                    El píxel de seguimiento de apertura y el pie de desuscripción se inyectan
                    automáticamente en cada correo para asegurar cumplimiento legal (CAN-SPAM).
                  </span>
                </p>
              </div>
            ) : (
              <div className="bg-slate-200 rounded-xl p-4 flex flex-col items-center">
                {/* Switch Desktop / Mobile */}
                <div className="flex items-center gap-2 mb-3 bg-white p-1 rounded-lg border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-[#00a2c7] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-[#00a2c7] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Móvil</span>
                  </button>
                </div>

                {/* Contenedor del Preview */}
                <div
                  className={`bg-white rounded-xl shadow-lg border border-slate-300 p-4 overflow-y-auto transition-all ${
                    previewDevice === 'desktop' ? 'w-full max-w-2xl' : 'w-[360px]'
                  }`}
                  style={{ maxHeight: '450px' }}
                >
                  <div className="border-b border-slate-100 pb-2 mb-3 text-xs text-slate-400 flex items-center justify-between">
                    <div>
                      <strong>De:</strong> {senderName} &lt;{senderEmail}&gt;
                    </div>
                    <div>
                      <strong>Asunto:</strong> {subject || '(Sin Asunto)'}
                    </div>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: getRenderedPreview() }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN DE PRUEBA RÁPIDA (TEST SEND) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-[#00a2c7]" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Prueba de Renderizado antes del Envío Masivo
                </p>
                <p className="text-[11px] text-slate-500">
                  Verifica cómo se visualiza el diseño en tu bandeja de entrada personal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="tu-correo@empresa.com"
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#00a2c7] w-full sm:w-56"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? 'Enviando...' : 'Enviar Prueba'}
              </button>
            </div>
          </div>
          {testStatus && (
            <p
              className={`text-xs px-3 py-1.5 rounded-lg ${
                testStatus.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {testStatus.msg}
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Total a enviar:{' '}
            <strong className="text-slate-900">
              {previewData ? previewData.validRecipients.toLocaleString() : 0} correos válidos
            </strong>{' '}
            a {pacingPerSecond} emails/seg
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              Guardar como Borrador
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !previewData || previewData.validRecipients === 0}
              className="px-5 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba8] text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Procesando...' : 'Guardar e Iniciar Envío Masivo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
