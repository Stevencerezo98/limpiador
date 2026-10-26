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

// ==========================================
// MÓDULO DE CONFIGURACIÓN DE LANDING COMERCIAL (CMS)
// ==========================================

export interface LandingTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarText?: string;
  rating: number;
  comment: string;
  metricHighlight?: string;
  verified: boolean;
}

export interface LandingFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface LandingTrustStat {
  id: string;
  value: string;
  label: string;
  sublabel?: string;
}

export interface LandingSecurityBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface LandingConfig {
  announcement: {
    enabled: boolean;
    text: string;
    badge: string;
    linkUrl?: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    primaryCtaText: string;
    primaryCtaUrl?: string;
    secondaryCtaText: string;
    secondaryCtaUrl?: string;
  };
  quickTester: {
    enabled: boolean;
    title: string;
    subtitle: string;
    placeholder: string;
    buttonText: string;
  };
  stats: LandingTrustStat[];
  benchmark: {
    enabled: boolean;
    title: string;
    subtitle: string;
    beforeCleanMail: {
      title: string;
      bounceRate: string;
      spamRate: string;
      openRate: string;
      reputationStatus: string;
    };
    afterCleanMail: {
      title: string;
      bounceRate: string;
      spamRate: string;
      openRate: string;
      reputationStatus: string;
    };
  };
  testimonials: LandingTestimonial[];
  guarantee: {
    title: string;
    subtitle: string;
    slaPercentage: string;
    zeroDataRetentionText: string;
    complianceBadges: string[];
  };
  securityBadges: LandingSecurityBadge[];
  faq: LandingFaqItem[];
  contact: {
    enabled: boolean;
    headline: string;
    subheadline: string;
    whatsappNumber: string;
    whatsappMessage: string;
    supportEmail: string;
    telegramUsername?: string;
  };
  footer: {
    companyName: string;
    tagline: string;
    copyrightText: string;
  };
}

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  announcement: {
    enabled: true,
    text: 'Motor de verificación DNS MX en vivo activo con 99.8% de precisión en entregabilidad',
    badge: 'ACTUALIZACIÓN 2026',
    linkUrl: '#planes',
  },
  hero: {
    badge: 'Motor Profesional de Verificación & Entregabilidad',
    titleStart: 'Limpia tus listas de correo y',
    titleHighlight: 'garantiza el 99%',
    titleEnd: 'de entregabilidad',
    subtitle: 'Elimina rebotes duros, filtra servidores inexistentes mediante DNS MX en vivo, detecta correos temporales o desechables y obtén máxima puntuación de confianza para tus bases de datos CSV y XLSX.',
    primaryCtaText: 'Probar Limpieza Gratis',
    primaryCtaUrl: 'https://cleanmail.unio.my',
    secondaryCtaText: 'Ver Planes de Depuración',
    secondaryCtaUrl: '#planes',
  },
  quickTester: {
    enabled: true,
    title: 'Auditoría Rápida de Correo en Vivo',
    subtitle: 'Prueba la velocidad y precisión de nuestra verificación sintáctica y DNS en 1 segundo:',
    placeholder: 'ejemplo@empresa.com o tu-correo@gmail.com',
    buttonText: 'Auditar Correo',
  },
  stats: [
    {
      id: 'stat-1',
      value: '14.2M+',
      label: 'Correos Depurados',
      sublabel: 'Sin rebotes duros',
    },
    {
      id: 'stat-2',
      value: '99.8%',
      label: 'Precisión DNS MX',
      sublabel: 'En servidores globales',
    },
    {
      id: 'stat-3',
      value: '4,900+',
      label: 'Empresas & Agencias',
      sublabel: 'Confían en CleanMail',
    },
    {
      id: 'stat-4',
      value: '0%',
      label: 'Listas Compartidas',
      sublabel: 'Privacidad 100% aislada',
    },
  ],
  benchmark: {
    enabled: true,
    title: 'El Impacto Real de Limpiar tus Listas',
    subtitle: 'Compara el rendimiento antes y después de pasar tus bases de datos por CleanMail:',
    beforeCleanMail: {
      title: 'Tus Campañas SIN Depurar',
      bounceRate: '24.8% de Rebotes',
      spamRate: '42.0% en Carpeta Spam',
      openRate: '11.5% Tasa de Apertura',
      reputationStatus: 'Alto riesgo de Lista Negra',
    },
    afterCleanMail: {
      title: 'Tus Campañas CON CleanMail',
      bounceRate: '< 0.5% Rebotes Duros',
      spamRate: '99.2% Bandeja de Entrada',
      openRate: '38.4% Tasa de Apertura',
      reputationStatus: 'Reputación 10/10 en ESPs',
    },
  },
  testimonials: [
    {
      id: 'test-1',
      name: 'Carlos Mendoza',
      role: 'Director de Crecimiento',
      company: 'ScaleMarketing B2B',
      avatarText: 'CM',
      rating: 5,
      comment: 'Redujimos nuestra tasa de rebote del 19% al 0.3% en SendGrid desde la primera depuración. Salvaron nuestro dominio principal de ser catalogado como spammer.',
      metricHighlight: '+310% Entregabilidad Inbox',
      verified: true,
    },
    {
      id: 'test-2',
      name: 'Valentina Restrepo',
      role: 'Especialista en Email Marketing',
      company: 'Nova Ecommerce Global',
      avatarText: 'VR',
      rating: 5,
      comment: 'Procesar bases de datos de más de 80,000 contactos en minutos y luego poder lanzar la campaña desde la misma plataforma nos ahorró pagar 2 suscripciones adicionales.',
      metricHighlight: 'Ahorro de $450/mes',
      verified: true,
    },
    {
      id: 'test-3',
      name: 'Andrés Felipe Gómez',
      role: 'Head of Sales Operations',
      company: 'LeadPros SaaS',
      avatarText: 'AG',
      rating: 5,
      comment: 'La detección estricta de servidores MX identifica instantáneamente dominios de clientes que quebraron o dieron de baja su hosting. Esencial para prospección en frío.',
      metricHighlight: '99.4% Entregabilidad Real',
      verified: true,
    },
    {
      id: 'test-4',
      name: 'Mariana Silva',
      role: 'Coordinadora de Campañas',
      company: 'Agencia Digital Nexus',
      avatarText: 'MS',
      rating: 5,
      comment: 'El sistema de permisos por roles y la deduplicación masiva automática evita que dos personas del equipo contacten o carguen dos veces la misma lista.',
      metricHighlight: 'Cero Quejas de Spam',
      verified: true,
    },
  ],
  guarantee: {
    title: 'Garantía de Privacidad & Cero Retención',
    subtitle: 'La seguridad y confidencialidad de tus contactos es nuestra prioridad absoluta.',
    slaPercentage: '99.9% SLA',
    zeroDataRetentionText: 'Tus listas de contactos son estrictamente confidenciales. Nunca vendemos, compartimos, alquilamos ni entrenamos modelos con los datos que subes. Todos los archivos se procesan de forma privada y cifrada.',
    complianceBadges: [
      'Cifrado SSL/TLS de 256 bits',
      'Cumplimiento GDPR & CAN-SPAM',
      'Procesamiento Aislado por Cuenta',
      'Sin Retención Comercial de Datos',
    ],
  },
  securityBadges: [
    {
      id: 'sec-1',
      title: 'DNS MX en Tiempo Real',
      description: 'Consultas en vivo a los servidores de correo de Google, Microsoft, Yahoo y corporativos.',
      iconName: 'Server',
    },
    {
      id: 'sec-2',
      title: 'Filtro Anti-Desechables',
      description: 'Base de datos actualizada con más de 4,000 dominios de correos temporales (10MinuteMail, TempMail).',
      iconName: 'ShieldAlert',
    },
    {
      id: 'sec-3',
      title: 'Corrección Automática de Typos',
      description: 'Repara automáticamente errores comunes como @gmai.com, @hotmial.com o @yahooo.es.',
      iconName: 'Wand2',
    },
    {
      id: 'sec-4',
      title: 'Deduplicación Inteligente',
      description: 'Elimina registros duplicados en cargas masivas para ahorrar créditos y evitar envíos dobles.',
      iconName: 'CopyX',
    },
  ],
  faq: [
    {
      id: 'faq-1',
      question: '¿Cómo funciona la verificación de servidores MX en vivo?',
      answer: 'CleanMail realiza una consulta DNS de alta velocidad a los registros MX (Mail Exchange) del dominio del correo. Si el dominio no tiene un servidor de correo activo capaz de recibir mensajes, el correo se clasifica inmediatamente como Inválido, evitando rebotes duros.',
      category: 'Técnico',
    },
    {
      id: 'faq-2',
      question: '¿Qué ocurre con los correos temporales o desechables?',
      answer: 'Nuestro motor compara el dominio con una lista permanentemente actualizada de servicios de correo desechables (como GuerrillaMail, TempMail, Yopmail). Estos correos se marcan como Inválidos o de Alto Riesgo.',
      category: 'Seguridad',
    },
    {
      id: 'faq-3',
      question: '¿Qué son los correos de Rol o Genéricos?',
      answer: 'Son direcciones como ventas@, info@, soporte@, admin@ o billing@. Aunque técnicamente pueden recibir correos, suelen pertenecer a buzones compartidos con altas tasas de quejas. CleanMail te permite aislarlos en una lista separada para proteger tu reputación.',
      category: 'Entregabilidad',
    },
    {
      id: 'faq-4',
      question: '¿Puedo enviar campañas directamente desde CleanMail?',
      answer: 'Sí. CleanMail incluye un módulo completo de Email Marketing que te permite redactar correos en HTML, conectar tu servidor SMTP (o Gmail, SendGrid, Amazon SES) y realizar envíos escalonados con pausas entre correos para evitar bloqueos.',
      category: 'Envíos',
    },
    {
      id: 'faq-5',
      question: '¿Mis contactos y bases de datos se almacenan de forma segura?',
      answer: 'Absolutamente. Todas las bases de datos están aisladas en tu instancia privada, protegidas mediante cifrado de 256 bits y sujetas a nuestra política de Cero Retención Comercial. Nadie más tiene acceso a tus listas.',
      category: 'Privacidad',
    },
    {
      id: 'faq-6',
      question: '¿Cómo adquiero más créditos si se me agotan?',
      answer: 'Puedes actualizar tu plan o solicitar una recarga de créditos en cualquier momento desde tu panel o poniéndote en contacto con nuestro equipo de soporte por WhatsApp.',
      category: 'Planes',
    },
  ],
  contact: {
    enabled: true,
    headline: '¿Necesitas un Plan a Medida o Soporte Empresarial?',
    subheadline: 'Habla directamente con nuestro equipo de entregabilidad para cotizaciones especiales o soporte técnico.',
    whatsappNumber: '+57 300 123 4567',
    whatsappMessage: 'Hola, me interesa información sobre los planes de depuración y envíos masivos de CleanMail.',
    supportEmail: 'soporte@unio.my',
    telegramUsername: 'cleanmail_support',
  },
  footer: {
    companyName: 'CleanMail',
    tagline: 'Plataforma Profesional de Limpieza, Verificación y Envíos Masivos de Email',
    copyrightText: 'Todos los derechos reservados. Desarrollado para alta entregabilidad en marketing B2B y B2C.',
  },
};

// ==========================================
// MÓDULO DE SEGURIDAD & LICENCIAMIENTO (ANTI-PIRATERÍA)
// ==========================================

export type LicensePlan = 'starter' | 'pro' | 'enterprise' | 'lifetime' | 'trial';

export interface AppLicensePayload {
  licenseId: string;
  clientName: string;
  clientEmail: string;
  domain: string; // ej. "cleanmail.unio.my", "*" o múltiples separados por coma
  plan: LicensePlan;
  issuedAt: string;
  expiresAt: string; // Fecha ISO o "never"
  maxCredits: number; // -1 para ilimitados
  maxUsers: number; // -1 para ilimitados
  features: string[];
}

export interface AppLicense {
  rawKey: string; // Formato: CLM-1.<payloadBase64>.<signatureHex>
  payload: AppLicensePayload;
  signature: string;
  activatedAt: string;
}

export interface GeneratedLicenseRecord {
  licenseId: string;
  rawKey: string;
  clientName: string;
  clientEmail: string;
  domain: string;
  plan: LicensePlan;
  issuedAt: string;
  expiresAt: string;
  maxCredits: number;
  maxUsers: number;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  revokedAt?: string;
  revocationReason?: string;
  activatedAt?: string;
  activatedHost?: string;
  activatedIp?: string;
  lastPingAt?: string;
}

export interface LicenseVerificationResult {
  valid: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'DOMAIN_MISMATCH' | 'INVALID_SIGNATURE' | 'NO_LICENSE';
  message: string;
  daysRemaining?: number;
  license?: AppLicensePayload;
  rawKey?: string;
}

// Exportaciones de compatibilidad en tiempo de ejecución para Node.js ESM nativo
export const Categoria = {} as any;
export const Correo = {} as any;
export const EmailFilterOptions = {} as any;
export const SystemConfig = {} as any;
export const LandingPlan = {} as any;
export const Campaign = {} as any;
export const CampaignLog = {} as any;
export const UnsubscribedContact = {} as any;
export const ListsRecipientsPreview = {} as any;
export const SystemUser = {} as any;
export const UserRole = {} as any;
export const UserPermissions = {} as any;
export const EstadoEmail = {} as any;
export const TipoEmail = {} as any;
export const ExternalValidationProvider = {} as any;
export const ExternalVerifyOptions = {} as any;
export const UserSession = {} as any;
export const UploadProcessSummary = {} as any;
export const LandingConfig = {} as any;
export const LandingTestimonial = {} as any;
export const LandingFaqItem = {} as any;
export const LandingTrustStat = {} as any;
export const LandingSecurityBadge = {} as any;
export const AppLicense = {} as any;
export const LicenseVerificationResult = {} as any;
export const AppLicensePayload = {} as any;
export const GeneratedLicenseRecord = {} as any;



