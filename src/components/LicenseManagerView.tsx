import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Globe,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Zap,
  Building,
  Mail,
  Sliders,
} from 'lucide-react';
import {
  UserSession,
  LicenseVerificationResult,
  AppLicensePayload,
} from '../server/db/schema.ts';

interface LicenseManagerViewProps {
  session: UserSession;
}

export const LicenseManagerView: React.FC<LicenseManagerViewProps> = ({ session }) => {
  const [licenseStatus, setLicenseStatus] = useState<LicenseVerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Estados del Generador Rápido (exclusivo para el creador del software)
  const [genClientName, setGenClientName] = useState('');
  const [genClientEmail, setGenClientEmail] = useState('');
  const [genDomain, setGenDomain] = useState('cleanmail.unio.my');
  const [genPlan, setGenPlan] = useState<'starter' | 'pro' | 'enterprise' | 'lifetime'>('enterprise');
  const [genDays, setGenDays] = useState<number>(365);
  const [generatedResult, setGeneratedResult] = useState<{ rawKey: string; payload: AppLicensePayload } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedGeneratedKey, setCopiedGeneratedKey] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/license/status');
      const data = await res.json();
      if (data.success && data.data) {
        setLicenseStatus(data.data);
      }
    } catch (err) {
      console.error('Error al consultar estado de la licencia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setErrorMsg('Por favor introduce una clave de licencia válida.');
      return;
    }

    try {
      setActivating(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ licenseKey: inputKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'La clave de licencia no es válida o ha sido adulterada.');
      }

      setLicenseStatus(data.data);
      setSuccessMsg(data.message || '¡Licencia activada con éxito!');
      setInputKey('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setActivating(false);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genClientName.trim() || !genClientEmail.trim()) {
      alert('Debes indicar el nombre y correo del cliente.');
      return;
    }

    try {
      setGenerating(true);
      const res = await fetch('/api/license/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          clientName: genClientName,
          clientEmail: genClientEmail,
          domain: genDomain,
          plan: genPlan,
          daysValid: Number(genDays),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al generar clave de licencia.');
      }

      setGeneratedResult(data.data);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, isGen = false) => {
    navigator.clipboard.writeText(text);
    if (isGen) {
      setCopiedGeneratedKey(true);
      setTimeout(() => setCopiedGeneratedKey(false), 2500);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const lic = licenseStatus?.license;
  const isValid = Boolean(licenseStatus?.valid);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Licencia del Software CleanMail
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isValid
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              {isValid ? '● Licencia Activa' : '✕ Activación Requerida'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sistema criptográfico de control de licencias anti-piratería firmado con HMAC-SHA256.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStatus}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Verificar Estado</span>
        </button>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-semibold animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tarjeta de Estado de la Licencia Actual */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                isValid ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              <Key className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Plan Licenciado
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 uppercase">
                {lic?.plan ? `CleanMail ${lic.plan}` : 'Sin Licencia Activa'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isValid ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {lic?.expiresAt === 'never'
                    ? 'Licencia Vitalicia (Lifetime)'
                    : `${licenseStatus?.daysRemaining ?? 0} días restantes`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{licenseStatus?.message || 'Licencia inválida o expirada'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Desglose de detalles de la licencia */}
        {lic && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-[#00a2c7]" /> Titular / Cliente
              </span>
              <p className="text-sm font-extrabold text-slate-800 truncate">{lic.clientName}</p>
              <p className="text-[11px] text-slate-500 truncate">{lic.clientEmail}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#00a2c7]" /> Dominio Autorizado
              </span>
              <p className="text-sm font-extrabold text-slate-800 font-mono truncate">
                {lic.domain === '*' ? 'Cualquier Dominio (*)' : lic.domain}
              </p>
              <p className="text-[11px] text-slate-500">Bloqueo por DNS Host</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#00a2c7]" /> Vencimiento
              </span>
              <p className="text-sm font-extrabold text-slate-800">
                {lic.expiresAt === 'never' ? 'Nunca' : new Date(lic.expiresAt).toLocaleDateString()}
              </p>
              <p className="text-[11px] text-slate-500">
                Emitida el: {new Date(lic.issuedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#00a2c7]" /> Módulos Habilitados
              </span>
              <p className="text-sm font-extrabold text-emerald-700">6 de 6 Módulos</p>
              <p className="text-[10px] text-slate-500">DNS MX, SMTP, CMS, API</p>
            </div>
          </div>
        )}

        {/* Clave activa instalada (modo copia) */}
        {licenseStatus?.rawKey && (
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Clave de Licencia Activa (Firma HMAC-SHA256):</span>
              <button
                type="button"
                onClick={() => copyToClipboard(licenseStatus.rawKey || '')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copiada' : 'Copiar'}</span>
              </button>
            </div>
            <p className="font-mono text-[11px] text-[#00a2c7] break-all select-all">
              {licenseStatus.rawKey}
            </p>
          </div>
        )}
      </div>

      {/* Formulario de Activación / Actualización de Licencia */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Unlock className="w-5 h-5 text-[#00a2c7]" />
            <span>Activar o Renovar Licencia</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pega aquí la clave de licencia entregada por el desarrollador para renovar tu período o ampliar créditos.
          </p>
        </div>

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <textarea
              rows={3}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="CLM-1.eyJsaWNlbnNlSWQiOiJMSUMt... (Pega aquí la clave de licencia completa)"
              className="w-full text-xs font-mono px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a2c7] bg-slate-50"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={activating}
              className="px-6 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ea8] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{activating ? 'Validando con Servidor...' : 'Activar Licencia Ahora'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* GENERADOR EXCLUSIVO PARA EL DUEÑO / VENDEDOR (STEVEN) */}
      {session.role === 'admin' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Panel del Creador / Vendedor</span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Generador Instantáneo de Licencias para tus Clientes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea licencias firmadas criptográficamente para vender a empresas, agencias o clientes directos.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nombre o Razón Social del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Marketing Global S.A.S."
                  value={genClientName}
                  onChange={(e) => setGenClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Correo de Contacto del Cliente</label>
                <input
                  type="email"
                  required
                  placeholder="ej. director@marketingglobal.com"
                  value={genClientEmail}
                  onChange={(e) => setGenClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Dominio Autorizado (o * para todos)
                </label>
                <input
                  type="text"
                  placeholder="ej. cleanmail.cliente.com o *"
                  value={genDomain}
                  onChange={(e) => setGenDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Plan a Asignar</label>
                <select
                  value={genPlan}
                  onChange={(e) => setGenPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/20 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                >
                  <option value="starter">Starter / Básico</option>
                  <option value="pro">Pro / Profesional</option>
                  <option value="enterprise">Enterprise / Empresarial</option>
                  <option value="lifetime">Vitalicio / Lifetime</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Días de Validez (0 = Vitalicia)</label>
                <input
                  type="number"
                  min="0"
                  value={genDays}
                  onChange={(e) => setGenDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={generating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00a2c7] to-[#008ea8] hover:from-[#008ea8] hover:to-[#007b92] text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Generando Criptográfica...' : 'Generar Clave de Licencia'}</span>
              </button>
            </div>
          </form>

          {/* Resultado de la Generación */}
          {generatedResult && (
            <div className="p-5 rounded-2xl bg-white/5 border border-purple-400/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-xs">
                    ¡Licencia Generada para {generatedResult.payload.clientName}!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedResult.rawKey, true)}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedGeneratedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGeneratedKey ? 'Copiada al Portapapeles' : 'Copiar Clave para Cliente'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-emerald-300 break-all select-all">
                {generatedResult.rawKey}
              </div>

              <p className="text-[11px] text-slate-400">
                Entrega esta clave a tu cliente. Solo funcionará en el dominio{' '}
                <strong className="text-white">{generatedResult.payload.domain}</strong> hasta el{' '}
                <strong className="text-white">
                  {generatedResult.payload.expiresAt === 'never'
                    ? 'Infinito'
                    : new Date(generatedResult.payload.expiresAt).toLocaleDateString()}
                </strong>
                .
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
