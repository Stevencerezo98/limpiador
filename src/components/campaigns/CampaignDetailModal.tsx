import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Pause,
  Play,
  Mail,
  CheckCircle,
  Eye,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Campaign, CampaignLog, CampaignLogStatus } from '../../server/db/schema.ts';

interface CampaignDetailModalProps {
  campaignId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCampaignUpdated: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaignId,
  isOpen,
  onClose,
  onCampaignUpdated,
}) => {
  const [campaign, setCampaign] = useState<
    (Campaign & { listsInfo: { id: string; nombre: string; validos: number }[] }) | null
  >(null);
  const [logs, setLogs] = useState<CampaignLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Acción de envío o pausa
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testStatusMsg, setTestStatusMsg] = useState('');

  const fetchCampaignData = useCallback(async () => {
    if (!campaignId) return;
    try {
      const [campRes, logsRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}`),
        fetch(`/api/campaigns/${campaignId}/logs${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`),
      ]);

      const campData = await campRes.json();
      const logsData = await logsRes.json();

      if (campData.success && campData.data) {
        setCampaign(campData.data);
      }
      if (logsData.success && logsData.data) {
        setLogs(logsData.data);
      }
    } catch (err) {
      console.error('Error fetching campaign detail:', err);
    }
  }, [campaignId, statusFilter]);

  useEffect(() => {
    if (isOpen && campaignId) {
      setLoading(true);
      fetchCampaignData().finally(() => setLoading(false));
    }
  }, [isOpen, campaignId, fetchCampaignData]);

  // Polling automático mientras la campaña esté en proceso de envío ('SENDING')
  useEffect(() => {
    if (!isOpen || !campaign || campaign.status !== 'SENDING') return;

    const interval = setInterval(() => {
      fetchCampaignData();
      onCampaignUpdated();
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, campaign?.status, fetchCampaignData, onCampaignUpdated]);

  if (!isOpen || !campaignId) return null;

  // Iniciar envío masivo
  const handleStartSend = async () => {
    if (!campaignId) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchCampaignData();
        onCampaignUpdated();
      } else {
        alert(data.message || 'Error al iniciar el envío');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Pausar envío activo
  const handlePauseSend = async () => {
    if (!campaignId) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchCampaignData();
        onCampaignUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reiniciar campaña a borrador
  const handleResetCampaign = async () => {
    if (!campaignId) return;
    if (!confirm('¿Deseas reiniciar esta campaña a estado BORRADOR para poder volver a enviarla o realizar pruebas?')) {
      return;
    }
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchCampaignData();
        onCampaignUpdated();
      } else {
        alert(data.message || 'Error al reiniciar campaña');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Enviar prueba individual
  const handleSendTest = async () => {
    const target = testEmail.trim() || 'stevencerezo2@gmail.com';
    if (!target.includes('@') || !campaignId) return;
    setTestStatusMsg('Enviando prueba...');
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: target }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatusMsg(`¡Enviado a ${target}!`);
      } else {
        setTestStatusMsg(data.message || 'Fallo al enviar prueba');
      }
      setTimeout(() => setTestStatusMsg(''), 5000);
    } catch {
      setTestStatusMsg('Error enviando prueba');
    }
  };

  // Filtrado de logs en cliente por búsqueda
  const filteredLogs = logs.filter((l) =>
    searchTerm ? l.email.toLowerCase().includes(searchTerm.toLowerCase().trim()) : true
  );

  const stats = campaign?.stats || { totalRecipients: 0, sentCount: 0, openedCount: 0, failedCount: 0 };
  const percentSent = stats.totalRecipients > 0 ? Math.round((stats.sentCount / stats.totalRecipients) * 100) : 0;
  const percentOpened = stats.sentCount > 0 ? Math.round((stats.openedCount / stats.sentCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a2c7]/20 border border-[#00a2c7]/30 flex items-center justify-center text-[#00a2c7]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{campaign?.name || 'Detalle de Campaña'}</h2>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    campaign?.status === 'SENT'
                      ? 'bg-emerald-500 text-white'
                      : campaign?.status === 'SENDING'
                      ? 'bg-[#00a2c7] text-white animate-pulse'
                      : campaign?.status === 'PAUSED'
                      ? 'bg-amber-500 text-white'
                      : campaign?.status === 'FAILED'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {campaign?.status === 'SENT'
                    ? 'Completada'
                    : campaign?.status === 'SENDING'
                    ? 'Enviando...'
                    : campaign?.status === 'PAUSED'
                    ? 'Pausada'
                    : campaign?.status === 'FAILED'
                    ? 'Fallida'
                    : 'Borrador'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Asunto: <span className="text-white font-medium">{campaign?.subject}</span> &bull; Remitente:{' '}
                {campaign?.senderName} &lt;{campaign?.senderEmail}&gt;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchCampaignData();
                onCampaignUpdated();
              }}
              title="Refrescar métricas"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Listas depuradas asociadas */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00a2c7]" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Listas Depuradas Vinculadas:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {campaign?.listsInfo && campaign.listsInfo.length > 0 ? (
                campaign.listsInfo.map((l) => (
                  <span
                    key={l.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{l.nombre}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                      {l.validos.toLocaleString()} válidos
                    </span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Sin listas</span>
              )}
            </div>
          </div>

          {/* Tarjetas de Métricas de la Campaña */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Destinatarios Válidos
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats.totalRecipients.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                100% clasificados VÁLIDOS
              </p>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Enviados con Éxito
              </span>
              <div className="text-2xl font-extrabold text-blue-950 mt-1">
                {stats.sentCount.toLocaleString()}
              </div>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                {percentSent}% del total
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Aperturas Registradas
              </span>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1">
                {stats.openedCount.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                {percentOpened}% tasa de apertura
              </p>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                Fallos / Rebotes
              </span>
              <div className="text-2xl font-extrabold text-rose-950 mt-1">
                {stats.failedCount.toLocaleString()}
              </div>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                {stats.failedCount === 0 ? 'Sin fallos' : 'Revisar logs'}
              </p>
            </div>
          </div>

          {/* Barra de Progreso de Envío */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span>Progreso de Distribución:</span>
                {campaign?.status === 'SENDING' && (
                  <span className="text-[11px] text-[#00a2c7] font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#00a2c7] animate-ping" />
                    {campaign.delaySecondsBetweenEmails
                      ? `Envío progresivo: 1 correo cada ${campaign.delaySecondsBetweenEmails}s (Sin envíos de golpe)`
                      : `Pacing activo (${campaign.pacingPerSecond || 2} envíos/seg)`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {campaign?.batchLimit && (
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                    Cupo de lote: {campaign.batchLimit} correos
                  </span>
                )}
                <span>
                  {stats.sentCount} de {stats.totalRecipients} ({percentSent}%)
                </span>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00a2c7] to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${percentSent}%` }}
              />
            </div>
          </div>

          {/* Acciones principales de la campaña */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {campaign?.status === 'DRAFT' || campaign?.status === 'PAUSED' ? (
                <button
                  type="button"
                  onClick={handleStartSend}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba8] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isActionLoading ? 'Iniciando...' : 'Iniciar Envío Masivo a Correos Válidos'}</span>
                </button>
              ) : campaign?.status === 'SENDING' ? (
                <button
                  type="button"
                  onClick={handlePauseSend}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pausar Envío en Cola</span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border ${
                      campaign?.status === 'SENT'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {campaign?.status === 'SENT'
                        ? 'Campaña completada'
                        : 'Envío finalizado con fallos'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetCampaign}
                    disabled={isActionLoading}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#00a2c7]" />
                    <span>Reiniciar Campaña a Borrador</span>
                  </button>
                </div>
              )}
            </div>

            {/* Envío de prueba rápida */}
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enviar prueba a este correo..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-52 focus:outline-none focus:ring-1 focus:ring-[#00a2c7]"
              />
              <button
                type="button"
                onClick={handleSendTest}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Probar
              </button>
              {testStatusMsg && <span className="text-[11px] text-emerald-600 font-medium">{testStatusMsg}</span>}
            </div>
          </div>

          {/* TABLA DE DESTINATARIOS Y LOGS */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  Logs de Destinatarios ({filteredLogs.length})
                </h3>
                <span className="text-xs text-slate-400">
                  Historial individual con tracking de aperturas
                </span>
              </div>

              {/* Filtros de estado y buscador */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por correo..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#00a2c7] w-44"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  {['ALL', 'QUEUED', 'SENT', 'OPENED', 'FAILED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                        statusFilter === st
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {st === 'ALL'
                        ? 'Todos'
                        : st === 'QUEUED'
                        ? 'En Cola'
                        : st === 'SENT'
                        ? 'Enviados'
                        : st === 'OPENED'
                        ? 'Abiertos'
                        : 'Fallidos'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-4">Correo Destinatario</th>
                      <th className="py-2.5 px-4">Estado de Entrega</th>
                      <th className="py-2.5 px-4">Enviado en</th>
                      <th className="py-2.5 px-4">Apertura (Pixel)</th>
                      <th className="py-2.5 px-4">Detalle / Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          {loading ? 'Cargando registros...' : 'No hay destinatarios registrados aún'}
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            {log.email}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                log.status === 'OPENED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'SENT'
                                  ? 'bg-blue-100 text-blue-800'
                                  : log.status === 'FAILED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {log.status === 'OPENED'
                                ? 'Abierto'
                                : log.status === 'SENT'
                                ? 'Enviado'
                                : log.status === 'FAILED'
                                ? 'Fallido'
                                : 'En Cola'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                            {log.sentAt ? new Date(log.sentAt).toLocaleTimeString() : '-'}
                          </td>
                          <td className="py-2.5 px-4">
                            {log.openedAt ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{new Date(log.openedAt).toLocaleTimeString()}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                            {log.error ? (
                              <span className="text-rose-600 font-medium">{log.error}</span>
                            ) : log.status === 'SENT' || log.status === 'OPENED' ? (
                              <span className="text-emerald-600 font-medium">Entregado exitosamente</span>
                            ) : (
                              'Esperando turno'
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>CleanMail Anti-Spam & Delivery Protection Activo</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
