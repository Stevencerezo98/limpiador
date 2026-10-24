import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  MailCheck,
  Server,
  Layers,
  HelpCircle,
  LogIn,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Globe,
  Star,
  Users,
  CopyX,
  Wand2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Send,
  MessageCircle,
  Award,
  Activity,
  Lock,
  Clock,
  ThumbsUp,
} from 'lucide-react';
import {
  LandingPlan,
  LandingConfig,
  DEFAULT_LANDING_CONFIG,
  UserSession,
} from '../server/db/schema.ts';

interface LandingViewProps {
  onGoToLogin: () => void;
  session: UserSession | null;
  onGoToDashboard: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGoToLogin,
  session,
  onGoToDashboard,
}) => {
  const [plans, setPlans] = useState<LandingPlan[]>([]);
  const [config, setConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [listSize, setListSize] = useState<number>(50000);

  // Estados del Probador de Email en Vivo en el Hero
  const [testEmailInput, setTestEmailInput] = useState('');
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    validSyntax: boolean;
    hasMx: boolean;
    isDisposable: boolean;
    score: number;
    provider: string;
    status: 'VALIDO' | 'INVALIDO' | 'RIESGO';
  } | null>(null);
  const [testing, setTesting] = useState(false);

  // Estados del Acordeón FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Cargar planes y configuración CMS en paralelo
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPlans(true);
        const [plansRes, configRes] = await Promise.all([
          fetch('/api/plans'),
          fetch('/api/landing'),
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          if (plansData.success && Array.isArray(plansData.data)) {
            setPlans(plansData.data);
          }
        }

        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.success && configData.data) {
            setConfig(configData.data);
          }
        }
      } catch (err) {
        console.error('Error cargando datos de la landing:', err);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchData();
  }, []);

  // Simulación de auditoría de correo en vivo en el Hero
  const handleRunQuickAudit = (emailToTest?: string) => {
    const email = (emailToTest || testEmailInput).trim().toLowerCase();
    if (!email || !email.includes('@')) {
      alert('Por favor ingresa un correo electrónico válido para auditar.');
      return;
    }

    setTestEmailInput(email);
    setTesting(true);

    setTimeout(() => {
      const isSyntaxOk = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
      const isDisposable =
        email.includes('10minutemail') ||
        email.includes('tempmail') ||
        email.includes('guerrillamail') ||
        email.includes('mailinator');
      const isBadDomain = email.includes('fake') || email.includes('invalid') || email.endsWith('.xyz');

      let score = 98;
      let status: 'VALIDO' | 'INVALIDO' | 'RIESGO' = 'VALIDO';
      let provider = 'Google Workspace MX';

      if (email.includes('outlook') || email.includes('hotmail')) provider = 'Microsoft 365 Exchange MX';
      if (email.includes('yahoo')) provider = 'Yahoo Mail MX';
      if (!email.includes('gmail') && !email.includes('outlook') && !email.includes('yahoo')) {
        provider = 'Servidor Corporativo Dedicado MX';
      }

      if (isDisposable) {
        score = 8;
        status = 'INVALIDO';
        provider = 'Servicio Temporal Desechable';
      } else if (isBadDomain || !isSyntaxOk) {
        score = 12;
        status = 'INVALIDO';
        provider = 'Servidor Inexistente (Sin MX)';
      } else if (email.startsWith('ventas@') || email.startsWith('info@') || email.startsWith('soporte@')) {
        score = 85;
        status = 'RIESGO';
      }

      setTestResult({
        tested: true,
        validSyntax: isSyntaxOk,
        hasMx: !isBadDomain && !isDisposable,
        isDisposable,
        score,
        provider,
        status,
      });
      setTesting(false);
    }, 450);
  };

  // URL dinámica de la app o login
  const handlePrimaryAction = () => {
    if (typeof window !== 'undefined' && !window.location.hostname.includes('cleanmail')) {
      const target = window.location.hostname.includes('unio.my') ? 'cleanmail.unio.my' : 'cleanmail.uno.my';
      window.location.href = `https://${target}`;
      return;
    }

    if (session) {
      onGoToDashboard();
    } else {
      onGoToLogin();
    }
  };

  // Enlace de WhatsApp
  const whatsappUrl = `https://wa.me/${config.contact.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    config.contact.whatsappMessage
  )}`;

  return (
    <div className="min-h-screen bg-[#f3f6f9] text-slate-800 antialiased font-sans flex flex-col selection:bg-[#00a2c7] selection:text-white">
      {/* 1. Top Announcement Bar */}
      {config.announcement.enabled && (
        <aside aria-label="Anuncio especial" className="bg-gradient-to-r from-slate-900 via-[#0a2335] to-slate-900 text-white px-4 py-2 text-xs flex items-center justify-center gap-2 border-b border-slate-800 text-center">
          <span className="px-2 py-0.5 rounded-full bg-[#00a2c7] text-[10px] font-black uppercase tracking-wider text-white">
            {config.announcement.badge}
          </span>
          <span className="font-medium text-slate-200">{config.announcement.text}</span>
          <a
            href={config.announcement.linkUrl || '#planes'}
            className="hidden sm:inline-flex items-center gap-1 text-[#00a2c7] hover:underline font-bold ml-1"
          >
            <span>Ver planes</span>
            <ChevronRight className="w-3 h-3" />
          </a>
        </aside>
      )}

      {/* Top Banner if user has active session */}
      {session && (
        <div className="bg-slate-800 text-white px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              Sesión activa como <strong>{session.name}</strong> ({session.role})
            </span>
          </div>
          <button
            onClick={onGoToDashboard}
            className="px-3 py-1 bg-[#00a2c7] hover:bg-[#0092b3] text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <span>Ir a la Plataforma</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Navigation Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#00a2c7] flex items-center justify-center text-white shadow-md shadow-[#00a2c7]/20">
              <CheckCircle className="w-6 h-6 fill-white text-[#00a2c7]" />
            </div>
            <div>
              <span className="font-script text-2xl tracking-wide text-[#00a2c7] font-bold">
                CleanMail
              </span>
              <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase -mt-1">
                Email Cleaner &amp; Verifier
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-slate-600">
            <a href="#probador" className="hover:text-[#00a2c7] transition">
              Probador en Vivo
            </a>
            <a href="#benchmark" className="hover:text-[#00a2c7] transition">
              Antes vs Después
            </a>
            <a href="#planes" className="hover:text-[#00a2c7] transition">
              Planes &amp; Precios
            </a>
            <a href="#testimonios" className="hover:text-[#00a2c7] transition">
              Casos de Éxito
            </a>
            <a href="#seguridad" className="hover:text-[#00a2c7] transition">
              Privacidad &amp; SLA
            </a>
            <a href="#faq" className="hover:text-[#00a2c7] transition">
              FAQ
            </a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrimaryAction}
              className="px-5 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#0092b3] text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-2"
            >
              {session ? (
                <>
                  <span>Ir a la Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Acceso Clientes / Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section con Probador en Vivo */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-b from-white via-[#f0f9fb]/40 to-[#f3f6f9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00a2c7]/10 text-[#00a2c7] border border-[#00a2c7]/20 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{config.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            {config.hero.titleStart}{' '}
            <span className="text-[#00a2c7] underline decoration-[#00a2c7]/30 decoration-wavy">
              {config.hero.titleHighlight}
            </span>{' '}
            {config.hero.titleEnd}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {config.hero.subtitle}
          </p>

          {/* Botones de acción principales */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handlePrimaryAction}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#00a2c7] hover:bg-[#0092b3] text-white font-extrabold text-sm shadow-lg shadow-[#00a2c7]/25 hover:shadow-xl hover:-translate-y-0.5 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{config.hero.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#planes"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition flex items-center justify-center gap-2"
            >
              <span>{config.hero.secondaryCtaText}</span>
            </a>
          </div>

          {/* 4. Widget Probador en Vivo (Interactivo) */}
          {config.quickTester.enabled && (
            <div id="probador" className="mt-14 max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl text-left">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  {config.quickTester.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">{config.quickTester.subtitle}</p>

              {/* Input y Botón de Auditoría */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder={config.quickTester.placeholder}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunQuickAudit()}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
                <button
                  type="button"
                  onClick={() => handleRunQuickAudit()}
                  disabled={testing}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <Activity className={`w-4 h-4 text-[#00a2c7] ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Auditando...' : config.quickTester.buttonText}</span>
                </button>
              </div>

              {/* Botones de Ejemplo Rápido */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-slate-500">
                <span className="font-semibold">Probar ejemplos:</span>
                <button
                  type="button"
                  onClick={() => handleRunQuickAudit('ceo@google.com')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer transition"
                >
                  ceo@google.com
                </button>
                <button
                  type="button"
                  onClick={() => handleRunQuickAudit('usuario@10minutemail.com')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer transition"
                >
                  usuario@10minutemail.com
                </button>
                <button
                  type="button"
                  onClick={() => handleRunQuickAudit('ventas@empresa.com')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer transition"
                >
                  ventas@empresa.com
                </button>
              </div>

              {/* Resultado de la auditoría en vivo */}
              {testResult && (
                <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-fade-in space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {testEmailInput}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        testResult.status === 'VALIDO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : testResult.status === 'RIESGO'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {testResult.status === 'VALIDO'
                        ? '● 100% Entregable'
                        : testResult.status === 'RIESGO'
                        ? '▲ Rol / Genérico'
                        : '✕ Inválido / Rebote'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">SINTAXIS RFC</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Correcta
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">DNS MX EN VIVO</span>
                      <span
                        className={`font-bold flex items-center gap-1 mt-0.5 ${
                          testResult.hasMx ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {testResult.hasMx ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Activo
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" /> Sin Servidor
                          </>
                        )}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">TEMPORAL</span>
                      <span
                        className={`font-bold flex items-center gap-1 mt-0.5 ${
                          testResult.isDisposable ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {testResult.isDisposable ? 'Detectado' : 'No Desechable'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">SCORE CONFIANZA</span>
                      <span className="font-extrabold text-[#00a2c7] font-mono text-sm mt-0.5 block">
                        {testResult.score}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1">
                    Servidor detectado: <strong>{testResult.provider}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5. Métricas de Confianza (Stats) */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {config.stats.map((stat, idx) => (
              <div key={stat.id || idx} className="space-y-1">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-mono block">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                  {stat.label}
                </span>
                {stat.sublabel && (
                  <span className="text-[11px] text-slate-400 block">{stat.sublabel}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Comparativa Antes vs Después (Benchmark) */}
      {config.benchmark.enabled && (
        <section id="benchmark" className="py-20 bg-[#f3f6f9]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-extrabold text-[#00a2c7] uppercase tracking-wider block mb-2">
                BENCHMARK DE ENTREGABILIDAD
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {config.benchmark.title}
              </h2>
              <p className="text-sm text-slate-600 mt-3">{config.benchmark.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tarjeta 1: SIN CleanMail */}
              <div className="bg-white rounded-3xl border border-rose-200 p-8 shadow-sm space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">
                    {config.benchmark.beforeCleanMail.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                    Alto Riesgo
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                    <span className="text-xs font-semibold text-slate-700">Tasa de Rebote Duro</span>
                    <span className="text-sm font-extrabold text-rose-700 font-mono">
                      {config.benchmark.beforeCleanMail.bounceRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Correos a la Carpeta Spam</span>
                    <span className="text-sm font-extrabold text-slate-700 font-mono">
                      {config.benchmark.beforeCleanMail.spamRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Aperturas Reales</span>
                    <span className="text-sm font-extrabold text-slate-700 font-mono">
                      {config.benchmark.beforeCleanMail.openRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Estado del Dominio</span>
                    <span className="text-xs font-bold text-rose-600">
                      {config.benchmark.beforeCleanMail.reputationStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: CON CleanMail */}
              <div className="bg-white rounded-3xl border-2 border-[#00a2c7] p-8 shadow-xl shadow-[#00a2c7]/10 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00a2c7]"></div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">
                    {config.benchmark.afterCleanMail.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    Garantizado
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs font-semibold text-slate-700">Tasa de Rebote Duro</span>
                    <span className="text-sm font-extrabold text-emerald-700 font-mono">
                      {config.benchmark.afterCleanMail.bounceRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#00a2c7]/10 border border-[#00a2c7]/20">
                    <span className="text-xs font-semibold text-slate-700">Llegada a Bandeja de Entrada</span>
                    <span className="text-sm font-extrabold text-[#00a2c7] font-mono">
                      {config.benchmark.afterCleanMail.spamRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Aperturas Reales</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {config.benchmark.afterCleanMail.openRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Estado del Dominio</span>
                    <span className="text-xs font-bold text-emerald-600">
                      {config.benchmark.afterCleanMail.reputationStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Planes de Depuración */}
      <section id="planes" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#00a2c7] uppercase tracking-wider block mb-2">
              TARIFAS TRANSPARENTES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Planes de Depuración &amp; Envíos Masivos
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Créditos sin fecha de expiración. Paga únicamente por los correos que necesitas auditar o contrata suscripción mensual.
            </p>
          </div>

          {loadingPlans ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <span className="w-3 h-3 rounded-full bg-[#00a2c7] animate-ping inline-block mr-2"></span>
              Cargando planes vigentes...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const isPopular = Boolean(plan.popular);
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between ${
                      isPopular
                        ? 'bg-gradient-to-b from-[#f0f9fb] to-white border-2 border-[#00a2c7] shadow-xl shadow-[#00a2c7]/15 ring-2 ring-[#00a2c7]/20 -translate-y-1'
                        : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                            isPopular ? 'bg-[#00a2c7] text-white' : 'bg-slate-800 text-white'
                          }`}
                        >
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="pb-4 border-b border-slate-100 mt-2">
                        <h3 className="font-extrabold text-lg text-slate-900">{plan.name}</h3>
                        <p className="text-[11px] text-slate-500 mt-1 min-h-[32px] leading-tight">
                          {plan.description}
                        </p>
                      </div>

                      <div className="py-5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-slate-500">
                            {plan.currency === 'USD' ? '$' : plan.currency}
                          </span>
                          <span className="text-4xl font-black text-slate-900 tracking-tight font-mono">
                            {plan.price}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{plan.currency}</span>
                          <span className="text-xs text-slate-500 ml-1">
                            {plan.period ? `/${plan.period}` : ''}
                          </span>
                        </div>

                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{plan.credits.toLocaleString()} Verificaciones</span>
                        </div>
                      </div>

                      <div className="space-y-2.5 py-4 border-t border-slate-100">
                        <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          Incluye:
                        </p>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={handlePrimaryAction}
                        className={`w-full py-3 rounded-xl font-extrabold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
                          isPopular
                            ? 'bg-[#00a2c7] hover:bg-[#0092b3] text-white shadow-md shadow-[#00a2c7]/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>Comenzar Ahora</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 8. Testimonios de Clientes (Casos de Éxito) */}
      <section id="testimonios" className="py-20 bg-[#f3f6f9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-[#00a2c7] uppercase tracking-wider block mb-2">
              CASOS DE ÉXITO B2B &amp; B2C
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Descubre cómo equipos de marketing y agencias protegen la entregabilidad de sus dominios con CleanMail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  {/* Impact Metric Pill */}
                  {t.metricHighlight && (
                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200 font-mono">
                      {t.metricHighlight}
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#00a2c7]/15 text-[#00a2c7] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {t.avatarText || t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-extrabold text-slate-900 block truncate">
                      {t.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {t.role} • {t.company}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Seguridad, Privacidad & Garantía de Cero Retención */}
      <section id="seguridad" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-slate-900 via-[#0d2a3f] to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a2c7]/20 text-[#00a2c7] border border-[#00a2c7]/30 text-xs font-bold mb-4">
                <ShieldCheck className="w-4 h-4" />
                <span>{config.guarantee.slaPercentage} Garantizado</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {config.guarantee.title}
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {config.guarantee.zeroDataRetentionText}
              </p>
            </div>

            {/* Badges de Certificación y Cumplimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              {config.guarantee.complianceBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Preguntas Frecuentes (FAQ) */}
      <section id="faq" className="py-20 bg-[#f3f6f9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold text-[#00a2c7] uppercase tracking-wider block mb-2">
              RESOLVEMOS TUS DUDAS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Todo lo que necesitas saber sobre el motor de auditoría DNS y envíos masivos.
            </p>
          </div>

          <div className="space-y-3">
            {config.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-slate-900">{item.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#00a2c7] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. Sección de Contacto Directo / WhatsApp */}
      {config.contact.enabled && (
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <MessageCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">{config.contact.headline}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
                {config.contact.subheadline}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chatear por WhatsApp ({config.contact.whatsappNumber})</span>
              </a>

              <a
                href={`mailto:${config.contact.supportEmail}`}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{config.contact.supportEmail}</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 12. Floating WhatsApp Widget */}
      {config.contact.enabled && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl hover:scale-105 transition duration-200 cursor-pointer font-bold text-xs"
          title="Habla con un asesor por WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-white text-emerald-500" />
          <span className="hidden sm:inline">¿Dudas? Escríbenos</span>
        </a>
      )}

      {/* 13. Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00a2c7] flex items-center justify-center text-white">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-script text-2xl text-white font-bold block">
                  {config.footer.companyName}
                </span>
                <span className="text-[11px] text-slate-400 block">{config.footer.tagline}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-300">
              <a href="#planes" className="hover:text-white transition">
                Planes
              </a>
              <a href="#benchmark" className="hover:text-white transition">
                Comparativa
              </a>
              <a href="#seguridad" className="hover:text-white transition">
                Seguridad &amp; Privacidad
              </a>
              <a href="#faq" className="hover:text-white transition">
                Preguntas Frecuentes
              </a>
              <button onClick={handlePrimaryAction} className="text-[#00a2c7] hover:underline cursor-pointer">
                Acceso Plataforma
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} {config.footer.companyName}. {config.footer.copyrightText}
            </p>
            <div className="flex items-center gap-4">
              <span>● Servidores DNS MX Operativos</span>
              <span>● 256-bit SSL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
