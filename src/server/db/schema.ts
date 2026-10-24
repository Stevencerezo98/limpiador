export type EstadoEmail = 'VALIDO' | 'GENERICO_ROL' | 'INVALIDO';
export type TipoEmail = 'Personal' | 'Corporativo' | 'De_Rol';
export type UserRole = 'admin' | 'digitalizador' | 'marketing' | 'visor' | 'custom';

export interface UserPermissions {
  canUploadFiles: boolean;          // Subir y procesar archivos (.csv, .xlsx, .txt)
  canValidateSingle: boolean;       // Validar correo individual en tiempo real
  canExportData: boolean;           // Descargar listas limpias en CSV, Excel, TXT
  canEditEmails: boolean;           // Editar y corregir correos en la tabla
  canDeleteEmails: boolean;         // Borrado individual y por selección
  canPurgeInvalid: boolean;         // Purgar y limpiar inválidos en 1 clic
  canManageCategories: boolean;     // Crear, editar y vaciar listas/categorías
  canManageCampaigns: boolean;      // Crear, editar y lanzar campañas masivas
  canConfigureSmtp: boolean;        // Conectar y configurar servidor SMTP
  canAccessAnalytics: boolean;      // Ver analítica y salud de entregabilidad
  canManageUsers: boolean;          // Crear y administrar usuarios y permisos (Admin)
  canManageSystemPlans: boolean;    // Modificar planes y créditos del sistema (Admin)
  canBackupRestore: boolean;        // Descargar y restaurar copias de seguridad (Admin)
}

export interface SystemUser {
  id: string;
  username: string;
  name: string;
  password: string;
  role: UserRole;
  status: 'active' | 'inactive';
  permissions: UserPermissions;
  createdAt: string;
  lastLogin?: string;
}

export interface UserSession {
  id?: string;
  username: string;
  name: string;
  role: UserRole;
  token: string;
  permissions?: UserPermissions;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canUploadFiles: true,
    canValidateSingle: true,
    canExportData: true,
    canEditEmails: true,
    canDeleteEmails: true,
    canPurgeInvalid: true,
    canManageCategories: true,
    canManageCampaigns: true,
    canConfigureSmtp: true,
    canAccessAnalytics: true,
    canManageUsers: true,
    canManageSystemPlans: true,
    canBackupRestore: true,
  },
  marketing: {
    canUploadFiles: true,
    canValidateSingle: true,
    canExportData: true,
    canEditEmails: true,
    canDeleteEmails: false,
    canPurgeInvalid: false,
    canManageCategories: true,
    canManageCampaigns: true,
    canConfigureSmtp: true,
    canAccessAnalytics: true,
    canManageUsers: false,
    canManageSystemPlans: false,
    canBackupRestore: false,
  },
  digitalizador: {
    canUploadFiles: true,
    canValidateSingle: true,
    canExportData: true,
    canEditEmails: true,
    canDeleteEmails: true,
    canPurgeInvalid: true,
    canManageCategories: true,
    canManageCampaigns: false,
    canConfigureSmtp: false,
    canAccessAnalytics: true,
    canManageUsers: false,
    canManageSystemPlans: false,
    canBackupRestore: false,
  },
  visor: {
    canUploadFiles: false,
    canValidateSingle: true,
    canExportData: false,
    canEditEmails: false,
    canDeleteEmails: false,
    canPurgeInvalid: false,
    canManageCategories: false,
    canManageCampaigns: false,
    canConfigureSmtp: false,
    canAccessAnalytics: true,
    canManageUsers: false,
    canManageSystemPlans: false,
    canBackupRestore: false,
  },
  custom: {
    canUploadFiles: true,
    canValidateSingle: true,
    canExportData: true,
    canEditEmails: false,
    canDeleteEmails: false,
    canPurgeInvalid: false,
    canManageCategories: false,
    canManageCampaigns: false,
    canConfigureSmtp: false,
    canAccessAnalytics: true,
    canManageUsers: false,
    canManageSystemPlans: false,
    canBackupRestore: false,
  },
};

export interface LandingPlan {
  id: string;
  name: string;
  badge?: string;
  credits: number;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  active: boolean;
}

export interface SmtpConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  senderName: string;
  senderEmail: string;
}

export interface SystemConfig {
  planName: string;
  planType: 'starter' | 'pro' | 'enterprise' | 'unlimited';
  creditosDisponibles: number;
  creditosUsados: number;
  limiteMensual: number;
  autoCleanDuplicates: boolean;
  strictMxChecking: boolean;
  alertaCreditosBajos: boolean;
  umbralAlerta: number;
  smtp?: SmtpConfig;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_creacion: string;
  // Conteo agregado
  total_correos?: number;
  validos?: number;
  genericos_rol?: number;
  invalidos?: number;
  corregidos?: number;
  promedio_score?: number;
}

export interface Correo {
  id: string;
  categoria_id: string;
  email: string;
  original_email: string;
  estado: EstadoEmail;
  tipo: TipoEmail;
  dominio: string;
  observacion: string;
  mx_valido: boolean;
  corregido: boolean;
  score_confianza: number; // Puntuación de confianza (0 - 100)
  verificado_externo: boolean;
  fuente_verificacion: string;
  fecha_creacion: string;
}

export interface EmailFilterOptions {
  categoria_id?: string;
  estado?: EstadoEmail | 'TODOS';
  tipo?: TipoEmail | 'TODOS';
  search?: string;
  min_score?: number;
  max_score?: number;
  page?: number;
  limit?: number;
}

export interface UploadProcessSummary {
  total_leidos: number;
  validos: number;
  genericos_rol: number;
  invalidos: number;
  corregidos: number;
  duplicados_omitidos: number;
  con_verificacion_externa: number;
  promedio_score: number;
  tiempo_procesamiento_ms: number;
  muestra_procesada: Correo[];
}

export type ExternalValidationProvider = 'debounce' | 'hunter' | 'zerobounce' | 'abstract' | 'auto';

export interface ExternalVerifyOptions {
  enabled: boolean;
  provider?: ExternalValidationProvider;
  apiKey?: string;
}

// ==========================================
// MÓDULO DE EMAIL MARKETING Y ENVÍOS MASIVOS
// ==========================================

export type CampaignStatus = 'DRAFT' | 'QUEUED' | 'SENDING' | 'SENT' | 'PAUSED' | 'FAILED';
export type CampaignLogStatus = 'QUEUED' | 'SENT' | 'OPENED' | 'FAILED';

export interface CampaignStats {
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  failedCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  htmlContent: string;
  listIds: string[]; // Obligatorio: IDs de listas depuradas asociadas
  status: CampaignStatus;
  stats: CampaignStats;
  pacingPerSecond: number; // Velocidad de envío
  delaySecondsBetweenEmails?: number; // Pausa en segundos entre cada correo para evitar envíos de golpe (ej. 2 a 10 seg)
  batchLimit?: number; // Cantidad seleccionada de correos a enviar en la tanda (ej. 50, 100 o todos)
  createdAt: string;
  sentAt?: string;
  completedAt?: string;
  error?: string;
}

export interface CampaignLog {
  id: string;
  campaignId: string;
  email: string;
  status: CampaignLogStatus;
  sentAt?: string;
  openedAt?: string;
  error?: string;
}

export interface UnsubscribedContact {
  id: string;
  email: string;
  campaignId?: string;
  reason?: string;
  unsubscribedAt: string;
}

export interface ListsRecipientsPreview {
  totalCandidates: number;
  validRecipients: number;
  excludedInvalidOrRisk: number;
  excludedUnsubscribed: number;
  duplicatesRemoved: number;
  listsSummary: {
    id: string;
    nombre: string;
    total: number;
    validos: number;
    invalidos_o_riesgo: number;
  }[];
}
