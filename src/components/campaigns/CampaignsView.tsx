import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Plus,
  Mail,
  CheckCircle,
  Eye,
  Clock,
  Layers,
  Search,
  RefreshCw,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  FileText,
  Users,
  Server,
  Zap,
  Database,
} from 'lucide-react';
import { Campaign, Categoria, UserSession } from '../../server/db/schema.ts';
import { NewCampaignModal } from './NewCampaignModal.tsx';
import { CampaignDetailModal } from './CampaignDetailModal.tsx';
import { SingleSendModal } from './SingleSendModal.tsx';
import { SmtpConfigModal } from './SmtpConfigModal.tsx';
import { BackupRestoreModal } from '../BackupRestoreModal.tsx';

interface CampaignsViewProps {
  categories: Categoria[];
  onOpenCategories?: () => void;
  session?: UserSession;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ categories, session }) => {
  const [campaigns, setCampaigns] = useState<
    (Campaign & { listsInfo: { id: string; nombre: string; validos: number }[] })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isSmtpConfigured, setIsSmtpConfigured] = useState<boolean | null>(null);

  // Modales
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [isSingleSendOpen, setIsSingleSendOpen] = useState(false);
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Verificar si SMTP está configurado
  const checkSmtp = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns/smtp');
      if (!res.ok) {
        setIsSmtpConfigured(false);
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setIsSmtpConfigured(Boolean(data.data.isConfigured));
      }
    } catch {
      setIsSmtpConfigured(false);
    }
  }, []);

  useEffect(() => {
    checkSmtp();
  }, [checkSmtp]);

  // Cargar campañas
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCampaigns(data.data);
      }
    } catch (err) {
      console.error('Error cargando campañas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Polling si hay alguna campaña en estado 'SENDING'
  useEffect(() => {
    const hasSending = campaigns.some((c) => c.status === 'SENDING');
    if (!hasSending) return;

    const interval = setInterval(() => {
      fetchCampaigns();
    }, 3000);

    return () => clearInterval(interval);
  }, [campaigns, fetchCampaigns]);

  // Eliminar campaña
  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la campaña "${name}" y todos sus registros de envío?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCampaigns();
      }
    } catch (err) {
      console.error('Error eliminando campaña:', err);
    }
  };

  // Reiniciar campaña a borrador
  const handleResetCampaign = async (id: string) => {
    if (!confirm('¿Deseas reiniciar esta campaña a borrador para volver a enviarla o realizar pruebas?')) {
      return;
    }
    try {
      const res = await fetch(`/api/campaigns/${id}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchCampaigns();
      } else {
        alert(data.message || 'Error al reiniciar la campaña');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Iniciar envío de campaña rápido desde la tarjeta
  const handleLaunchCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchCampaigns();
        setSelectedDetailId(id); // Abrir detalle para ver el avance en vivo
      } else {
        alert(data.message || 'Error al iniciar el envío');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cálculos estadísticos globales
  const totalCampaigns = campaigns.length;
  const totalRecipients = campaigns.reduce((acc, c) => acc + (c.stats.sentCount || 0), 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + (c.stats.openedCount || 0), 0);
  const averageOpenRate =
    totalRecipients > 0 ? Math.round((totalOpened / totalRecipients) * 100) : 0;
  const uniqueListsUsed = new Set(campaigns.flatMap((c) => c.listIds || [])).size;

  // Filtrado de campañas
  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchSubject = c.subject.toLowerCase().includes(q);
      const matchSender = c.senderEmail.toLowerCase().includes(q);
      return matchName || matchSubject || matchSender;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#00a2c7]/10 border border-[#00a2c7]/30 flex items-center justify-center text-[#00a2c7]">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Envíos Masivos & Email Marketing
              </h1>
              <p className="text-xs text-slate-500">
                Campañas de alta entregabilidad vinculadas exclusivamente a listas depuradas de correos VÁLIDOS
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchCampaigns()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
            title="Actualizar listado"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsSingleSendOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Mail className="w-4 h-4 text-[#00a2c7]" />
            <span>Probar Envío (1 a 1)</span>
          </button>

          <button
            onClick={() => setIsSmtpModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Configurar servidor SMTP propio"
          >
            <Server className="w-4 h-4 text-purple-600" />
            <span>Servidor SMTP</span>
          </button>

          {session?.role === 'admin' && (
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="px-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Copia de seguridad y migración del servidor"
            >
              <Database className="w-4 h-4 text-purple-600" />
              <span>Respaldo Servidor</span>
            </button>
          )}

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba8] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nueva Campaña</span>
          </button>
        </div>
      </div>

      {/* Alerta de Configuración SMTP Pendiente */}
      {isSmtpConfigured === false && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Configuración Requerida: Conecta tu Cuenta de Google (Gmail/Workspace)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Para que tus correos lleguen <strong>realmente a las bandejas de entrada</strong> de tus contactos y destinatarios de prueba, necesitas vincular tu cuenta de Google mediante una <strong>Contraseña de Aplicación</strong> de 16 caracteres.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSmtpModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <Server className="w-4 h-4" />
            <span>Configurar Google / SMTP Ahora</span>
          </button>
        </div>
      )}

      {/* Regla de negocio estricta / Banner de Seguridad Anti-Spam */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Filtro Estricto de Seguridad y Entregabilidad Activo
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Al vincular tus listas a una campaña, el sistema filtra de forma obligatoria y automática{' '}
              <strong>ÚNICAMENTE los correos con estado "VÁLIDO"</strong>. Los correos clasificados como
              inválidos, cuentas departamentales de riesgo y contactos desuscritos son excluidos en su totalidad.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-white/80 border border-emerald-200 px-3 py-1.5 rounded-xl">
            Pacing Regulado: 5-10 emails/seg
          </span>
        </div>
      </div>

      {/* Tarjetas de Métricas de Email Marketing */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Campañas Creadas</span>
            <FileText className="w-4 h-4 text-[#00a2c7]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalCampaigns}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total en el historial</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Correos Válidos Enviados</span>
            <Send className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {totalRecipients.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">100% clasificados válidos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tasa Media de Apertura</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{averageOpenRate}%</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            {totalOpened.toLocaleString()} lecturas registradas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Listas Vinculadas</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{uniqueListsUsed}</div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Bases de datos asociadas</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, asunto o correo de remitente..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'DRAFT', label: 'Borradores' },
            { id: 'SENDING', label: 'Enviando' },
            { id: 'SENT', label: 'Completadas' },
            { id: 'PAUSED', label: 'Pausadas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Campañas */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#00a2c7]/10 text-[#00a2c7] flex items-center justify-center mx-auto">
            <Mail className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800">No hay campañas registradas</h3>
            <p className="text-xs text-slate-500 mt-1">
              Crea tu primera campaña de email marketing seleccionando una de tus listas depuradas. Solo
              los correos con estado VÁLIDO recibirán el mensaje.
            </p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba8] text-white text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primera Campaña</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCampaigns.map((camp) => {
            const stats = camp.stats || {
              totalRecipients: 0,
              sentCount: 0,
              openedCount: 0,
              failedCount: 0,
            };
            const percentSent =
              stats.totalRecipients > 0
                ? Math.round((stats.sentCount / stats.totalRecipients) * 100)
                : 0;
            const percentOpened =
              stats.sentCount > 0 ? Math.round((stats.openedCount / stats.sentCount) * 100) : 0;

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-sm transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900">{camp.name}</h3>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          camp.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : camp.status === 'SENDING'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                            : camp.status === 'PAUSED'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : camp.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {camp.status === 'SENT'
                          ? 'Completada'
                          : camp.status === 'SENDING'
                          ? 'Enviando...'
                          : camp.status === 'PAUSED'
                          ? 'Pausada'
                          : camp.status === 'FAILED'
                          ? 'Fallida'
                          : 'Borrador'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Asunto:</strong> {camp.subject} &bull; <strong>Remitente:</strong>{' '}
                      {camp.senderName} &lt;{camp.senderEmail}&gt;
                    </p>
                  </div>

                  {/* Acciones de la Campaña */}
                  <div className="flex items-center gap-2">
                    {camp.status === 'DRAFT' || camp.status === 'PAUSED' ? (
                      <button
                        onClick={() => handleLaunchCampaign(camp.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba8] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Enviar Ahora</span>
                      </button>
                    ) : null}

                    {camp.status === 'SENT' || camp.status === 'FAILED' ? (
                      <button
                        onClick={() => handleResetCampaign(camp.id)}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Reiniciar campaña a borrador para reenviar o volver a probar"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#00a2c7]" />
                        <span>Reiniciar / Reenviar</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => setSelectedDetailId(camp.id)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#00a2c7]" />
                      <span>Ver Reporte & Logs</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Eliminar campaña"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Listas depuradas asociadas (Badges) */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#00a2c7]" />
                    <span>Listas Depuradas:</span>
                  </span>
                  {camp.listsInfo && camp.listsInfo.length > 0 ? (
                    camp.listsInfo.map((l) => (
                      <span
                        key={l.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span className="font-medium">{l.nombre}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded font-mono font-bold">
                          {l.validos.toLocaleString()} válidos
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Sin listas</span>
                  )}
                </div>

                {/* Barra de progreso y métricas de entrega */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                      <span>
                        Progreso:{' '}
                        <strong className="text-slate-900">
                          {stats.sentCount} / {stats.totalRecipients}
                        </strong>{' '}
                        enviados
                      </span>
                      <span>{percentSent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00a2c7] to-emerald-500 transition-all duration-300"
                        style={{ width: `${percentSent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0 md:border-l md:border-slate-200 md:pl-4">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Aperturas</span>
                      <strong className="text-emerald-700 font-bold">
                        {stats.openedCount} ({percentOpened}%)
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Fallidos</span>
                      <strong className="text-slate-700 font-bold">{stats.failedCount}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Velocidad</span>
                      <strong className="text-[#00a2c7] font-bold">
                        {camp.pacingPerSecond || 8}/seg
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Creación */}
      <NewCampaignModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        categories={categories}
        onCampaignCreated={() => {
          fetchCampaigns();
        }}
      />

      {/* Modal de Detalle y Logs */}
      <CampaignDetailModal
        campaignId={selectedDetailId}
        isOpen={Boolean(selectedDetailId)}
        onClose={() => setSelectedDetailId(null)}
        onCampaignUpdated={() => {
          fetchCampaigns();
        }}
      />

      {/* Modal de Envío Individual 1 a 1 */}
      <SingleSendModal
        isOpen={isSingleSendOpen}
        onClose={() => setIsSingleSendOpen(false)}
      />

      {/* Modal de Configuración Servidor SMTP */}
      <SmtpConfigModal
        isOpen={isSmtpModalOpen}
        onClose={() => {
          setIsSmtpModalOpen(false);
          checkSmtp();
        }}
      />

      {/* Modal de Copia de Seguridad y Guía de Servidor */}
      {session && (
        <BackupRestoreModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
          session={session}
          onRestoreSuccess={() => {
            fetchCampaigns();
            checkSmtp();
          }}
        />
      )}
    </div>
  );
};
