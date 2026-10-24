import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  PhoneCall,
  Activity,
  Plus,
  Trash2,
  Star,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  LandingConfig,
  DEFAULT_LANDING_CONFIG,
  LandingTestimonial,
  LandingFaqItem,
  UserSession,
} from '../server/db/schema.ts';

interface LandingEditorViewProps {
  session: UserSession;
  onPreviewLanding: () => void;
}

type TabType =
  | 'hero'
  | 'tester'
  | 'stats'
  | 'benchmark'
  | 'testimonials'
  | 'guarantee'
  | 'faq'
  | 'contact';

export const LandingEditorView: React.FC<LandingEditorViewProps> = ({
  session,
  onPreviewLanding,
}) => {
  const [config, setConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar configuración actual desde GET /api/landing
  const fetchLandingConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/landing');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (err) {
      console.error('Error cargando configuración de la landing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandingConfig();
  }, []);

  // Guardar cambios vía PUT /api/admin/landing
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await fetch('/api/admin/landing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al guardar cambios de la landing.');
      }

      setConfig(data.data);
      setSuccessMessage('¡Página Landing actualizada con éxito en unio.my!');
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  // Restablecer a valores de fábrica
  const handleReset = async () => {
    if (!window.confirm('¿Seguro que deseas restablecer todos los textos de la landing a los valores recomendados iniciales?')) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/landing/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al restablecer.');
      }
      setConfig(data.data);
      setSuccessMessage('¡Textos y secciones restablecidos a los valores iniciales recomendados!');
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Helpers para modificar items de testimonios
  const addTestimonial = () => {
    const newTestimonial: LandingTestimonial = {
      id: 'test-' + Date.now(),
      name: 'Nuevo Cliente',
      role: 'Director de Marketing',
      company: 'Empresa Digital',
      avatarText: 'NC',
      rating: 5,
      comment: 'Describe aquí el testimonio y los resultados alcanzados tras depurar con CleanMail.',
      metricHighlight: '+250% Entregabilidad',
      verified: true,
    };
    setConfig((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial],
    }));
  };

  const removeTestimonial = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
  };

  const updateTestimonial = (id: string, updates: Partial<LandingTestimonial>) => {
    setConfig((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  };

  // Helpers para FAQ
  const addFaqItem = () => {
    const newItem: LandingFaqItem = {
      id: 'faq-' + Date.now(),
      question: '¿Nueva pregunta frecuente?',
      answer: 'Escribe aquí la respuesta clara y detallada para tus clientes potenciales.',
      category: 'General',
    };
    setConfig((prev) => ({
      ...prev,
      faq: [...prev.faq, newItem],
    }));
  };

  const removeFaqItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      faq: prev.faq.filter((f) => f.id !== id),
    }));
  };

  const updateFaqItem = (id: string, updates: Partial<LandingFaqItem>) => {
    setConfig((prev) => ({
      ...prev,
      faq: prev.faq.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="flex items-center justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00a2c7] animate-ping"></span>
          <span className="text-xs font-semibold">Cargando editor CMS de Landing Page...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Editor de Landing Page (CMS)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider border border-purple-200">
              Admin Exclusivo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personaliza en tiempo real los textos, métricas, testimonios, garantías y canales de contacto de tu página en{' '}
            <strong className="text-slate-700">unio.my</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onPreviewLanding}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4 text-[#00a2c7]" />
            <span>Previsualizar Landing</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title="Restablecer valores recomendados"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ea8] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Publicar Cambios'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-semibold animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl text-xs font-bold">
        {[
          { id: 'hero', label: 'Hero & Anuncio', icon: Sparkles },
          { id: 'tester', label: 'Probador en Vivo', icon: Activity },
          { id: 'stats', label: 'Métricas de Confianza', icon: Award },
          { id: 'benchmark', label: 'Antes vs Después', icon: TrendingUp },
          { id: 'testimonials', label: `Testimonios (${config.testimonials.length})`, icon: MessageSquare },
          { id: 'guarantee', label: 'Garantía & Seguridad', icon: ShieldCheck },
          { id: 'faq', label: `Preguntas FAQ (${config.faq.length})`, icon: HelpCircle },
          { id: 'contact', label: 'Contacto & WhatsApp', icon: PhoneCall },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00a2c7]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT CARDS */}

      {/* 1. Hero & Anuncio */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Barra de Anuncio Superior */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Barra de Notificación Superior</h3>
                <p className="text-xs text-slate-500">Cintillo promocional en la parte más alta de la landing.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.announcement.enabled}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, enabled: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                />
                <span className="text-xs font-bold text-slate-700">Mostrar Anuncio</span>
              </label>
            </div>

            {config.announcement.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Etiqueta / Badge</label>
                  <input
                    type="text"
                    value={config.announcement.badge}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        announcement: { ...prev.announcement, badge: e.target.value },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00a2c7]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mensaje de Notificación</label>
                  <input
                    type="text"
                    value={config.announcement.text}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        announcement: { ...prev.announcement, text: e.target.value },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00a2c7]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sección Hero Principal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Encabezado Hero Principal
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Badge Superior del Hero</label>
                <input
                  type="text"
                  value={config.hero.badge}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, badge: e.target.value },
                    }))
                  }
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Inicio del Título</label>
                  <input
                    type="text"
                    value={config.hero.titleStart}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, titleStart: e.target.value },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00a2c7]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 text-[#00a2c7]">
                    Texto Resaltado (Azul)
                  </label>
                  <input
                    type="text"
                    value={config.hero.titleHighlight}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, titleHighlight: e.target.value },
                      }))
                    }
                    className="w-full text-xs font-bold text-[#00a2c7] px-3 py-2 rounded-xl border border-[#00a2c7]/40 focus:ring-2 focus:ring-[#00a2c7]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fin del Título</label>
                  <input
                    type="text"
                    value={config.hero.titleEnd}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, titleEnd: e.target.value },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00a2c7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtítulo Descriptivo</label>
                <textarea
                  rows={3}
                  value={config.hero.subtitle}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value },
                    }))
                  }
                  className="w-full text-xs font-normal px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Botón Principal (CTA)</label>
                  <input
                    type="text"
                    value={config.hero.primaryCtaText}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, primaryCtaText: e.target.value },
                      }))
                    }
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Botón Secundario</label>
                  <input
                    type="text"
                    value={config.hero.secondaryCtaText}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, secondaryCtaText: e.target.value },
                      }))
                    }
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Probador en Vivo */}
      {activeTab === 'tester' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Widget del Probador en Vivo</h3>
              <p className="text-xs text-slate-500">
                Permite a los visitantes probar una dirección en 1 segundo directamente en la landing para comprobar la tecnología.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.quickTester.enabled}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    quickTester: { ...prev.quickTester, enabled: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
              />
              <span className="text-xs font-bold text-slate-700">Habilitar Widget</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Título del Widget</label>
              <input
                type="text"
                value={config.quickTester.title}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    quickTester: { ...prev.quickTester, title: e.target.value },
                  }))
                }
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Texto del Botón</label>
              <input
                type="text"
                value={config.quickTester.buttonText}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    quickTester: { ...prev.quickTester, buttonText: e.target.value },
                  }))
                }
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Subtítulo Guía</label>
              <input
                type="text"
                value={config.quickTester.subtitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    quickTester: { ...prev.quickTester, subtitle: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Métricas de Confianza */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">4 Métricas de Confianza y Volumen</h3>
            <p className="text-xs text-slate-500">
              Estadísticas destacadas para generar credibilidad con clientes potenciales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.stats.map((stat, idx) => (
              <div key={stat.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Métrica #{idx + 1}
                </span>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Cifra Destacada</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = [...config.stats];
                      updated[idx].value = e.target.value;
                      setConfig({ ...config, stats: updated });
                    }}
                    className="w-full text-base font-extrabold text-[#00a2c7] px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Título / Etiqueta</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const updated = [...config.stats];
                      updated[idx].label = e.target.value;
                      setConfig({ ...config, stats: updated });
                    }}
                    className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Detalle / Subtítulo</label>
                  <input
                    type="text"
                    value={stat.sublabel || ''}
                    onChange={(e) => {
                      const updated = [...config.stats];
                      updated[idx].sublabel = e.target.value;
                      setConfig({ ...config, stats: updated });
                    }}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Benchmark Antes vs Después */}
      {activeTab === 'benchmark' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Comparativa de Entregabilidad (Antes vs Después)</h3>
              <p className="text-xs text-slate-500">Muestra el costo de no limpiar correos frente a la tranquilidad de usar CleanMail.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.benchmark.enabled}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    benchmark: { ...prev.benchmark, enabled: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
              />
              <span className="text-xs font-bold text-slate-700">Mostrar Sección</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sin CleanMail */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
              <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>{config.benchmark.beforeCleanMail.title}</span>
              </h4>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Tasa de Rebote (Bounces)</label>
                <input
                  type="text"
                  value={config.benchmark.beforeCleanMail.bounceRate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      benchmark: {
                        ...prev.benchmark,
                        beforeCleanMail: {
                          ...prev.benchmark.beforeCleanMail,
                          bounceRate: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full text-xs font-bold text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Destino a Carpeta Spam</label>
                <input
                  type="text"
                  value={config.benchmark.beforeCleanMail.spamRate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      benchmark: {
                        ...prev.benchmark,
                        beforeCleanMail: {
                          ...prev.benchmark.beforeCleanMail,
                          spamRate: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Aperturas Promedio</label>
                <input
                  type="text"
                  value={config.benchmark.beforeCleanMail.openRate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      benchmark: {
                        ...prev.benchmark,
                        beforeCleanMail: {
                          ...prev.benchmark.beforeCleanMail,
                          openRate: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Estado de Reputación</label>
                <input
                  type="text"
                  value={config.benchmark.beforeCleanMail.reputationStatus}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      benchmark: {
                        ...prev.benchmark,
                        beforeCleanMail: {
                          ...prev.benchmark.beforeCleanMail,
                          reputationStatus: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Con CleanMail */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>{config.benchmark.afterCleanMail.title}</span>
              </h4>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Tasa de Rebote (Garantizada)</label>
                <input
                  type="text"
                  value={config.benchmark.afterCleanMail.bounceRate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      benchmark: {
                        ...prev.benchmark,
                        afterCleanMail: {
                          ...prev.benchmark.afterCleanMail,
                          bounceRate: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Llegada a Bandeja de Entrada (Inbox)</label>
                <input
                  type="text"
                  value={config.benchmark.afterCleanMail.spamRate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      benchmark: {
                        ...prev.benchmark,
                        afterCleanMail: {
                          ...prev.benchmark.afterCleanMail,
                          spamRate: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Aperturas Promedio Logradas</label>
                <input
                  type="text"
                  value={config.benchmark.afterCleanMail.openRate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      benchmark: {
                        ...prev.benchmark,
                        afterCleanMail: {
                          ...prev.benchmark.afterCleanMail,
                          openRate: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Estado de Reputación</label>
                <input
                  type="text"
                  value={config.benchmark.afterCleanMail.reputationStatus}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      benchmark: {
                        ...prev.benchmark,
                        afterCleanMail: {
                          ...prev.benchmark.afterCleanMail,
                          reputationStatus: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Testimonios */}
      {activeTab === 'testimonials' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Casos de Éxito &amp; Testimonios de Clientes ({config.testimonials.length})
              </h3>
              <p className="text-xs text-slate-500">
                Agrega, edita y organiza opiniones reales con métricas de impacto comercial.
              </p>
            </div>
            <button
              type="button"
              onClick={addTestimonial}
              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Testimonio</span>
            </button>
          </div>

          <div className="space-y-4">
            {config.testimonials.map((t, idx) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">Testimonio #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeTestimonial(t.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Eliminar testimonio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Nombre del Cliente</label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => updateTestimonial(t.id, { name: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Cargo / Rol</label>
                    <input
                      type="text"
                      value={t.role}
                      onChange={(e) => updateTestimonial(t.id, { role: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Empresa</label>
                    <input
                      type="text"
                      value={t.company}
                      onChange={(e) => updateTestimonial(t.id, { company: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                      Métrica Destacada (Pill)
                    </label>
                    <input
                      type="text"
                      value={t.metricHighlight || ''}
                      placeholder="ej. +310% Entregabilidad Inbox"
                      onChange={(e) => updateTestimonial(t.id, { metricHighlight: e.target.value })}
                      className="w-full text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={t.verified}
                        onChange={(e) => updateTestimonial(t.id, { verified: e.target.checked })}
                        className="w-4 h-4 rounded text-[#00a2c7]"
                      />
                      <span className="text-xs font-semibold text-slate-700">Verificado</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Comentario / Reseña</label>
                  <textarea
                    rows={2}
                    value={t.comment}
                    onChange={(e) => updateTestimonial(t.id, { comment: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Garantía & Seguridad */}
      {activeTab === 'guarantee' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">Política de Cero Retención &amp; Privacidad</h3>
            <p className="text-xs text-slate-500">Transmite total seguridad jurídica y técnica sobre el manejo de contactos.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Título de la Sección</label>
              <input
                type="text"
                value={config.guarantee.title}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    guarantee: { ...prev.guarantee, title: e.target.value },
                  }))
                }
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Declaración de Cero Retención Comercial</label>
              <textarea
                rows={3}
                value={config.guarantee.zeroDataRetentionText}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    guarantee: { ...prev.guarantee, zeroDataRetentionText: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Insignias de Cumplimiento (Separadas por comas)</label>
              <input
                type="text"
                value={config.guarantee.complianceBadges.join(', ')}
                onChange={(e) => {
                  const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setConfig((prev) => ({
                    ...prev,
                    guarantee: { ...prev.guarantee, complianceBadges: items },
                  }));
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. FAQ */}
      {activeTab === 'faq' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Preguntas Frecuentes (FAQ) ({config.faq.length})
              </h3>
              <p className="text-xs text-slate-500">Resuelve dudas técnicas antes de que el cliente tome una decisión.</p>
            </div>
            <button
              type="button"
              onClick={addFaqItem}
              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Pregunta</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.faq.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">Pregunta #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFaqItem(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateFaqItem(item.id, { question: e.target.value })}
                    className="w-full text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={item.answer}
                    onChange={(e) => updateFaqItem(item.id, { answer: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Contacto & WhatsApp */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Contacto Directo &amp; Ventas por WhatsApp</h3>
              <p className="text-xs text-slate-500">
                Canal directo de atención para cotizaciones de alto volumen y soporte técnico.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.contact.enabled}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, enabled: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
              />
              <span className="text-xs font-bold text-slate-700">Habilitar Botón</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="text"
                placeholder="+573001234567"
                value={config.contact.whatsappNumber}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, whatsappNumber: e.target.value },
                  }))
                }
                className="w-full text-xs font-bold font-mono px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Correo de Soporte</label>
              <input
                type="email"
                placeholder="soporte@unio.my"
                value={config.contact.supportEmail}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, supportEmail: e.target.value },
                  }))
                }
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Mensaje Predeterminado de WhatsApp</label>
              <input
                type="text"
                value={config.contact.whatsappMessage}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, whatsappMessage: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Reminder */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00a2c7] flex items-center justify-center font-bold text-white text-xs">
            CMS
          </div>
          <div className="text-xs">
            <span className="font-bold block">Tus cambios se reflejan inmediatamente en la landing.</span>
            <span className="text-slate-400 text-[11px]">Recuerda hacer clic en Publicar Cambios para guardar en el servidor.</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ea8] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : 'Publicar Cambios'}</span>
        </button>
      </div>
    </div>
  );
};
