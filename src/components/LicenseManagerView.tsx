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
  Ban,
  Trash2,
  Server,
  Activity,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  UserSession,
  LicenseVerificationResult,
  AppLicensePayload,
  GeneratedLicenseRecord,
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

  // Registro Maestro de Licencias Emitidas
  const [generatedList, setGeneratedList] = useState<GeneratedLicenseRecord[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'REVOKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

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

  const fetchGeneratedList = async () => {
    if (session.role !== 'admin') return;
    try {
      setLoadingList(true);
      const res = await fetch('/api/license/generated', {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setGeneratedList(data.data);
      }
    } catch (err) {
      console.error('Error al consultar registro maestro de licencias:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchGeneratedList();
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
      fetchGeneratedList();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setActivating(false);
    }
  };

  // INVALIDAR / REVOCAR LICENCIA EN 1 CLIC
  const handleRevoke = async (licenseId: string, clientName: string) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas INVALIDAR / BLOQUEAR la licencia de "${clientName}" (${licenseId})?\n\nAl revocarla, el cliente perderá acceso inmediato a las funciones de depuración, exportación y envíos masivos.`
      )
    ) {
      return;
    }

    try {
      setActionInProgress(licenseId);
      const res = await fetch(`/api/license/revoke/${licenseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ reason: 'Revocada desde el panel administrativo.' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al revocar la licencia.');
      }

      setSuccessMsg(`¡Licencia ${licenseId} INVALIDADA con éxito! Acceso bloqueado.`);
      fetchGeneratedList();
      fetchStatus();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setActionInProgress(null);
    }
  };

  // REACTIVAR LICENCIA PREVIAMENTE REVOCADA
  const handleReactivate = async (licenseId: string) => {
    try {
      setActionInProgress(licenseId);
      const res = await fetch(`/api/license/reactivate/${licenseId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al reactivar la licencia.');
      }

      setSuccessMsg(`¡Licencia ${licenseId} reactivada correctamente!`);
      fetchGeneratedList();
      fetchStatus();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setActionInProgress(null);
    }
  };

  // ELIMINAR DEL REGISTRO
  const handleDeleteRecord = async (licenseId: string) => {
    if (!window.confirm(`¿Eliminar la licencia ${licenseId} del registro maestro?`)) {
      return;
    }

    try {
      setActionInProgress(licenseId);
      const res = await fetch(`/api/license/generated/${licenseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al eliminar.');
      }
      fetchGeneratedList();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setActionInProgress(null);
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
      fetchGeneratedList();
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

  // Filtrado de licencias generadas
  const filteredLicenses = generatedList.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.clientName.toLowerCase().includes(q) ||
        item.clientEmail.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        item.licenseId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countActive = generatedList.filter((l) => l.status === 'ACTIVE').length;
  const countPending = generatedList.filter((l) => l.status === 'PENDING').length;
  const countRevoked = generatedList.filter((l) => l.status === 'REVOKED').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Control de Licencias del Software CleanMail
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isValid
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              {isValid ? '● Licencia Local Activa' : '✕ Activación Requerida'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestor maestro de licencias emitidas, monitoreo de activaciones en servidores e invalidación remota.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchStatus();
            fetchGeneratedList();
          }}
          disabled={loading || loadingList}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingList ? 'animate-spin' : ''}`} />
          <span>Actualizar Todo</span>
        </button>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-semibold animate-fade-in shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tarjetas de Métricas de Licenciamiento */}
      {session.role === 'admin' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Emitidas
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono block">
              {generatedList.length}
            </span>
            <span className="text-[11px] text-slate-500">Licencias en registro</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Activas en Máquinas
            </span>
            <span className="text-2xl font-black text-emerald-700 font-mono block">
              {countActive}
            </span>
            <span className="text-[11px] text-slate-500">Instaladas y en uso</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pendientes
            </span>
            <span className="text-2xl font-black text-amber-700 font-mono block">
              {countPending}
            </span>
            <span className="text-[11px] text-slate-500">Sin activar aún</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Invalidadas / Bloqueadas
            </span>
            <span className="text-2xl font-black text-rose-700 font-mono block">
              {countRevoked}
            </span>
            <span className="text-[11px] text-slate-500">Acceso revocado</span>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: REGISTRO MAESTRO DE LICENCIAS EMITIDAS (ADMIN EXCLUSIVO) */}
      {session.role === 'admin' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00a2c7]/10 text-[#00a2c7] text-[11px] font-black uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel de Control Maestro</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Registro Maestro de Licencias Emitidas a Clientes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aquí ves exactamente si una licencia ya fue activada en una máquina y puedes invalidarla en 1 clic.
              </p>
            </div>

            {/* Buscador y Filtros */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar cliente, dominio o ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
              >
                <option value="ALL">Todas ({generatedList.length})</option>
                <option value="ACTIVE">Activas ({countActive})</option>
                <option value="PENDING">Pendientes ({countPending})</option>
                <option value="REVOKED">Invalidadas ({countRevoked})</option>
              </select>
            </div>
          </div>

          {/* Tabla de Licencias */}
          {loadingList ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <span className="w-3 h-3 rounded-full bg-[#00a2c7] animate-ping inline-block mr-2"></span>
              Cargando licencias del registro maestro...
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No se encontraron licencias emitidas con los filtros actuales.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">ID & Cliente</th>
                    <th className="py-3 px-4">Dominio Autorizado</th>
                    <th className="py-3 px-4">Plan & Validez</th>
                    <th className="py-3 px-4">Estado de Activación</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLicenses.map((item) => {
                    const isRevoked = item.status === 'REVOKED';
                    const isActive = item.status === 'ACTIVE';
                    const isPending = item.status === 'PENDING';
                    const isProcessing = actionInProgress === item.licenseId;

                    return (
                      <tr
                        key={item.licenseId}
                        className={`hover:bg-slate-50/80 transition ${
                          isRevoked ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        {/* Cliente */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0 font-mono text-[10px]">
                              {item.licenseId.replace('LIC-', '')}
                            </div>
                            <div className="overflow-hidden">
                              <span className="font-extrabold text-slate-900 block truncate">
                                {item.clientName}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {item.clientEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Dominio */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700">
                            <Globe className="w-3 h-3 text-[#00a2c7]" />
                            <span>{item.domain === '*' ? 'Cualquiera (*)' : item.domain}</span>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-800 uppercase block">
                            {item.plan}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Expira:{' '}
                            {item.expiresAt === 'never'
                              ? 'Vitalicia'
                              : new Date(item.expiresAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4">
                          {isRevoked ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                                <Ban className="w-3 h-3 text-rose-600" />
                                <span>Invalidada / Bloqueada</span>
                              </span>
                              {item.revokedAt && (
                                <span className="block text-[10px] text-rose-600 mt-0.5">
                                  El {new Date(item.revokedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : isActive ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                <span>Activa en Máquina</span>
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                                {item.activatedHost && (
                                  <span className="block font-mono truncate max-w-[150px]">
                                    Host: {item.activatedHost}
                                  </span>
                                )}
                                {item.activatedIp && (
                                  <span className="block font-mono text-slate-400">
                                    IP: {item.activatedIp}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pendiente de Activar</span>
                              </span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">
                                Aún no instalada
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.rawKey)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                              title="Copiar Clave de Licencia"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {isRevoked ? (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleReactivate(item.licenseId)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Reactivar licencia"
                              >
                                <Unlock className="w-3 h-3" />
                                <span>Reactivar</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleRevoke(item.licenseId, item.clientName)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Invalidar licencia para que no puedan acceder"
                              >
                                <Ban className="w-3 h-3 text-rose-600" />
                                <span>Invalidar</span>
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleDeleteRecord(item.licenseId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Eliminar del registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 2: GENERADOR INSTANTÁNEO DE LICENCIAS PARA CLIENTES */}
      {session.role === 'admin' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Emisor de Licencias Criptográficas</span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Generar Nueva Licencia para un Cliente
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea una licencia firmada con tu clave maestra. Se registrará automáticamente en tu tabla superior.
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
                  Dominio Autorizado (o * para cualquiera)
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
                <span>{generating ? 'Generando Criptográfica...' : 'Generar y Registrar Licencia'}</span>
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
                Entrega esta clave al cliente. Si más adelante no te paga o incumple los términos, puedes hacer clic en{' '}
                <strong className="text-rose-400">"Invalidar"</strong> en la tabla de arriba y no podrá acceder.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 3: ESTADO DE LA LICENCIA INSTALADA EN ESTE SERVIDOR */}
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
                Licencia Instalada en este Servidor
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

        {/* Desglose de detalles de la licencia instalada */}
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
              <p className="text-[11px] text-slate-500">Bloqueo por Host</p>
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

        {/* Formulario de Activación de Licencia Local */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Unlock className="w-4 h-4 text-[#00a2c7]" />
            <span>Activar o Renovar Licencia en este Servidor</span>
          </h4>
          <form onSubmit={handleActivate} className="space-y-3">
            <textarea
              rows={2}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="CLM-1.eyJsaWNlbnNlSWQiOiJMSUMt... (Pega aquí la clave de licencia completa)"
              className="w-full text-xs font-mono px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a2c7] bg-slate-50"
            />
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
      </div>
    </div>
  );
};
