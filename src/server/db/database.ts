import fs from 'fs';
import path from 'path';
import type {
  Categoria,
  Correo,
  EmailFilterOptions,
  SystemConfig,
  LandingPlan,
  Campaign,
  CampaignLog,
  UnsubscribedContact,
  ListsRecipientsPreview,
  SystemUser,
  UserRole,
  UserPermissions,
  LandingConfig,
  AppLicense,
  GeneratedLicenseRecord,
} from './schema.ts';
import { DEFAULT_ROLE_PERMISSIONS, DEFAULT_LANDING_CONFIG } from './schema.ts';

interface DatabaseData {
  categorias: Categoria[];
  correos: Correo[];
  config?: SystemConfig;
  landingPlans: LandingPlan[];
  campaigns?: Campaign[];
  campaignLogs?: CampaignLog[];
  unsubscribed?: UnsubscribedContact[];
  users?: SystemUser[];
  landingConfig?: LandingConfig;
  license?: AppLicense;
  generatedLicenses?: GeneratedLicenseRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_LANDING_PLANS: LandingPlan[] = [
  {
    id: 'plan-starter',
    name: 'Básico / Starter',
    badge: 'Para Comenzar',
    credits: 10000,
    price: 19,
    currency: 'USD',
    period: 'pago único',
    description: 'Ideal para pequeñas empresas y depuración de listas puntuales.',
    features: [
      '10,000 Verificaciones de correo',
      'Validación estricta de sintaxis RFC',
      'Comprobación de servidores DNS MX en vivo',
      'Autocorrección de errores de tipeo (.gmai -> .gmail)',
      'Exportación ilimitada a CSV limpio',
    ],
    popular: false,
    active: true,
  },
  {
    id: 'plan-pro',
    name: 'Profesional Growth',
    badge: 'Más Popular',
    credits: 50000,
    price: 49,
    currency: 'USD',
    period: 'pago único',
    description: 'El paquete más elegido para agencias y campañas de Email Marketing.',
    features: [
      '50,000 Verificaciones de correo',
      'Filtro avanzado de dominios desechables y temporales',
      'Identificación de cuentas de rol (info@, ventas@)',
      'Score de confianza de entregabilidad (0 a 100%)',
      'Deduplicación automática de contactos',
      'Soporte prioritario por email',
    ],
    popular: true,
    active: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Volume',
    badge: 'Gran Volumen',
    credits: 250000,
    price: 149,
    currency: 'USD',
    period: 'pago único',
    description: 'Alto rendimiento para plataformas SaaS, e-commerce y bases de datos masivas.',
    features: [
      '250,000 Verificaciones de correo',
      'Múltiples operadores y roles (Admin & Digitalizador)',
      'Auditoría profunda de registros SPF y DMARC',
      'Herramienta de purgado de rebotes duros en 1 clic',
      'Aislamiento de cuentas departamentales a listas secundarias',
      'Exportación CSV segmentada',
    ],
    popular: false,
    active: true,
  },
  {
    id: 'plan-unlimited',
    name: 'Ilimitado Anual',
    badge: 'Acceso Total',
    credits: 1000000,
    price: 399,
    currency: 'USD',
    period: '/año',
    description: 'Sin restricciones de volumen ni límites de créditos para corporativos.',
    features: [
      'Créditos Ilimitados de verificación',
      'Categorías y listas ilimitadas con total aislamiento',
      'Acceso exclusivo al panel de control de planes',
      'Asesoría técnica para evitar listas negras (Blacklists)',
      'SLA de disponibilidad garantizado',
    ],
    popular: false,
    active: true,
  },
];

const DEFAULT_CONFIG: SystemConfig = {
  planName: 'Plan Enterprise CleanMail Pro',
  planType: 'enterprise',
  creditosDisponibles: 100000,
  creditosUsados: 0,
  limiteMensual: 250000,
  autoCleanDuplicates: true,
  strictMxChecking: true,
  alertaCreditosBajos: true,
  umbralAlerta: 5000,
};

const DEFAULT_USERS: SystemUser[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrador del Sistema',
    password: 'admin',
    role: 'admin',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.admin,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-digitalizador',
    username: 'digitalizador',
    name: 'Operador Digitalizador',
    password: 'digitalizador',
    role: 'digitalizador',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.digitalizador,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-marketing',
    username: 'marketing',
    name: 'Especialista en Marketing & Campañas',
    password: 'marketing2026',
    role: 'marketing',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.marketing,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-auditor',
    username: 'auditor',
    name: 'Auditor de Calidad (Solo Lectura)',
    password: 'auditor2026',
    role: 'visor',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.visor,
    createdAt: new Date().toISOString(),
  },
];

class Database {
  private data: DatabaseData = {
    categorias: [],
    correos: [],
    config: DEFAULT_CONFIG,
    landingPlans: [],
    users: [],
  };
  private isLoaded = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);

        // Garantizar retrocompatibilidad si existen correos sin campos de score
        for (const c of this.data.correos) {
          if (c.score_confianza === undefined) {
            c.score_confianza = c.estado === 'VALIDO' ? 90 : c.estado === 'GENERICO_ROL' ? 65 : 10;
          }
          if (c.verificado_externo === undefined) {
            c.verificado_externo = false;
          }
          if (!c.fuente_verificacion) {
            c.fuente_verificacion = 'Local';
          }
        }

        if (!this.data.config) {
          this.data.config = {
            ...DEFAULT_CONFIG,
            creditosUsados: this.data.correos.length,
          };
        }

        if (!this.data.landingPlans || !Array.isArray(this.data.landingPlans) || this.data.landingPlans.length === 0) {
          this.data.landingPlans = JSON.parse(JSON.stringify(DEFAULT_LANDING_PLANS));
        }

        if (!this.data.campaigns || !Array.isArray(this.data.campaigns)) {
          this.data.campaigns = [];
        }
        if (!this.data.campaignLogs || !Array.isArray(this.data.campaignLogs)) {
          this.data.campaignLogs = [];
        }
        if (!this.data.unsubscribed || !Array.isArray(this.data.unsubscribed)) {
          this.data.unsubscribed = [];
        }
        if (!this.data.users || !Array.isArray(this.data.users) || this.data.users.length === 0) {
          this.data.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
          this.persist();
        }
      } else {
        const now = new Date().toISOString();
        this.data = {
          categorias: [
            { id: 'cat-general', nombre: 'General / Sin Categorizar', fecha_creacion: now },
          ],
          correos: [],
          config: DEFAULT_CONFIG,
          landingPlans: JSON.parse(JSON.stringify(DEFAULT_LANDING_PLANS)),
          campaigns: [],
          campaignLogs: [],
          unsubscribed: [],
          users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
        };
        this.persist();
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('Error inicializando la base de datos local:', error);
      this.data = {
        categorias: [],
        correos: [],
        config: DEFAULT_CONFIG,
        landingPlans: [],
        campaigns: [],
        campaignLogs: [],
        unsubscribed: [],
      };
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error guardando en archivo db.json:', error);
    }
  }

  // --- MÉTODOS DE CONFIGURACIÓN Y PLANES ---

  public getSystemConfig(): SystemConfig {
    if (!this.data.config) {
      this.data.config = { ...DEFAULT_CONFIG, creditosUsados: this.data.correos.length };
    }
    this.data.config.creditosUsados = this.data.correos.length;
    return this.data.config;
  }

  public updateSystemConfig(updates: Partial<SystemConfig>): SystemConfig {
    if (!this.data.config) {
      this.data.config = { ...DEFAULT_CONFIG };
    }
    this.data.config = {
      ...this.data.config,
      ...updates,
      creditosUsados: this.data.correos.length,
    };
    this.persist();
    return this.data.config;
  }

  // --- MÉTODOS DE PLANES DE DEPURACIÓN (LANDING) ---

  public getLandingPlans(): LandingPlan[] {
    if (!this.data.landingPlans || !Array.isArray(this.data.landingPlans) || this.data.landingPlans.length === 0) {
      this.data.landingPlans = JSON.parse(JSON.stringify(DEFAULT_LANDING_PLANS));
      this.persist();
    }
    return this.data.landingPlans;
  }

  public updateLandingPlan(id: string, updates: Partial<LandingPlan>): LandingPlan | null {
    const plans = this.getLandingPlans();
    const idx = plans.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    plans[idx] = {
      ...plans[idx],
      ...updates,
      id, // inmutable
    };
    this.persist();
    return plans[idx];
  }

  public createLandingPlan(plan: Omit<LandingPlan, 'id'>): LandingPlan {
    const plans = this.getLandingPlans();
    const id = 'plan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newPlan: LandingPlan = {
      ...plan,
      id,
    };
    plans.push(newPlan);
    this.persist();
    return newPlan;
  }

  public deleteLandingPlan(id: string): boolean {
    const plans = this.getLandingPlans();
    const idx = plans.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    plans.splice(idx, 1);
    this.persist();
    return true;
  }

  public resetLandingPlans(): LandingPlan[] {
    this.data.landingPlans = JSON.parse(JSON.stringify(DEFAULT_LANDING_PLANS));
    this.persist();
    return this.data.landingPlans;
  }

  // --- MÉTODOS DE CATEGORÍAS ---

  public getAllCategories(): Categoria[] {
    return this.data.categorias.map((cat) => {
      const correosCat = this.data.correos.filter((c) => c.categoria_id === cat.id);
      const total = correosCat.length;
      const validos = correosCat.filter((c) => c.estado === 'VALIDO').length;
      const genericos = correosCat.filter((c) => c.estado === 'GENERICO_ROL').length;
      const invalidos = correosCat.filter((c) => c.estado === 'INVALIDO').length;
      const corregidos = correosCat.filter((c) => c.corregido).length;
      const totalScore = correosCat.reduce((acc, c) => acc + (c.score_confianza || 0), 0);
      const promedioScore = total > 0 ? Math.round(totalScore / total) : 0;

      return {
        ...cat,
        total_correos: total,
        validos,
        genericos_rol: genericos,
        invalidos,
        corregidos,
        promedio_score: promedioScore,
      };
    });
  }

  public getCategoryById(id: string): Categoria | null {
    const cat = this.data.categorias.find((c) => c.id === id);
    if (!cat) return null;

    const correosCat = this.data.correos.filter((c) => c.categoria_id === cat.id);
    const total = correosCat.length;
    const validos = correosCat.filter((c) => c.estado === 'VALIDO').length;
    const genericos = correosCat.filter((c) => c.estado === 'GENERICO_ROL').length;
    const invalidos = correosCat.filter((c) => c.estado === 'INVALIDO').length;
    const corregidos = correosCat.filter((c) => c.corregido).length;
    const totalScore = correosCat.reduce((acc, c) => acc + (c.score_confianza || 0), 0);
    const promedioScore = total > 0 ? Math.round(totalScore / total) : 0;

    return {
      ...cat,
      total_correos: total,
      validos,
      genericos_rol: genericos,
      invalidos,
      corregidos,
      promedio_score: promedioScore,
    };
  }

  public createCategory(nombre: string, descripcion?: string): Categoria {
    const id = 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const nuevaCategoria: Categoria = {
      id,
      nombre,
      descripcion,
      fecha_creacion: new Date().toISOString(),
      total_correos: 0,
      validos: 0,
      genericos_rol: 0,
      invalidos: 0,
      corregidos: 0,
      promedio_score: 0,
    };
    this.data.categorias.push(nuevaCategoria);
    this.persist();
    return nuevaCategoria;
  }

  public updateCategory(id: string, updates: { nombre?: string; descripcion?: string }): Categoria | null {
    const cat = this.data.categorias.find((c) => c.id === id);
    if (!cat) return null;

    if (updates.nombre && updates.nombre.trim()) {
      cat.nombre = updates.nombre.trim();
    }
    if (updates.descripcion !== undefined) {
      cat.descripcion = updates.descripcion.trim();
    }
    this.persist();
    return this.getCategoryById(id);
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categorias.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    this.data.categorias.splice(idx, 1);
    this.data.correos = this.data.correos.filter((c) => c.categoria_id !== id);
    this.persist();
    return true;
  }

  // --- MÉTODOS DE CORREOS ---

  public getEmailsByCategory(
    categoria_id: string,
    filters: EmailFilterOptions = {}
  ): { total: number; page: number; limit: number; totalPages: number; correos: Correo[] } {
    let list = this.data.correos.filter((c) => c.categoria_id === categoria_id);

    if (filters.estado && filters.estado !== 'TODOS') {
      list = list.filter((c) => c.estado === filters.estado);
    }

    if (filters.tipo && filters.tipo !== 'TODOS') {
      list = list.filter((c) => c.tipo === filters.tipo);
    }

    if (filters.min_score !== undefined && !isNaN(filters.min_score)) {
      list = list.filter((c) => (c.score_confianza ?? 0) >= filters.min_score!);
    }

    if (filters.max_score !== undefined && !isNaN(filters.max_score)) {
      list = list.filter((c) => (c.score_confianza ?? 0) <= filters.max_score!);
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.dominio.toLowerCase().includes(q) ||
          c.observacion.toLowerCase().includes(q) ||
          (c.fuente_verificacion && c.fuente_verificacion.toLowerCase().includes(q))
      );
    }

    // Ordenar descendente por fecha con comparación rápida ISO
    list.sort((a, b) => (b.fecha_creacion > a.fecha_creacion ? 1 : b.fecha_creacion < a.fecha_creacion ? -1 : 0));

    const total = list.length;
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      total,
      page,
      limit,
      totalPages,
      correos: paginated,
    };
  }

  public getEmailById(id: string): Correo | null {
    return this.data.correos.find((c) => c.id === id) || null;
  }

  public updateEmail(id: string, updates: Partial<Correo>): Correo | null {
    const idx = this.data.correos.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.data.correos[idx] = {
      ...this.data.correos[idx],
      ...updates,
      id, // garantizar inmutabilidad de id
    };
    this.persist();
    return this.data.correos[idx];
  }

  public getExistingEmailsSet(categoria_id: string): Set<string> {
    const set = new Set<string>();
    this.data.correos
      .filter((c) => c.categoria_id === categoria_id)
      .forEach((c) => set.add(c.email.toLowerCase()));
    return set;
  }

  public insertEmailsBatch(categoria_id: string, correosNuevos: Omit<Correo, 'id' | 'fecha_creacion'>[]): Correo[] {
    const inserted: Correo[] = [];
    const now = new Date().toISOString();

    for (const c of correosNuevos) {
      const correoObj: Correo = {
        id: 'cor-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
        categoria_id,
        email: c.email,
        original_email: c.original_email,
        estado: c.estado,
        tipo: c.tipo,
        dominio: c.dominio,
        observacion: c.observacion,
        mx_valido: c.mx_valido,
        corregido: c.corregido,
        score_confianza: c.score_confianza ?? (c.estado === 'VALIDO' ? 90 : c.estado === 'GENERICO_ROL' ? 65 : 10),
        verificado_externo: c.verificado_externo ?? false,
        fuente_verificacion: c.fuente_verificacion || 'Local',
        fecha_creacion: now,
      };
      this.data.correos.push(correoObj);
      inserted.push(correoObj);
    }

    this.persist();
    return inserted;
  }

  public deleteEmail(id: string): boolean {
    const idx = this.data.correos.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.correos.splice(idx, 1);
    this.persist();
    return true;
  }

  // Eliminación masiva por IDs seleccionados
  public deleteEmailsBulk(ids: string[]): number {
    const set = new Set(ids);
    const initialCount = this.data.correos.length;
    this.data.correos = this.data.correos.filter((c) => !set.has(c.id));
    const deletedCount = initialCount - this.data.correos.length;
    this.persist();
    return deletedCount;
  }

  // Eliminación por filtro en categoría (ej: purgar todos los inválidos, vaciar lista o por filtros)
  public deleteEmailsByFilter(
    categoria_id: string,
    filter: 'INVALIDOS' | 'GENERICOS_ROL' | 'VALIDOS' | 'ALL' | 'FILTERED',
    options?: {
      search?: string;
      estado?: string;
      tipo?: string;
      min_score?: number;
      max_score?: number;
    }
  ): number {
    const initialCount = this.data.correos.length;
    this.data.correos = this.data.correos.filter((c) => {
      if (c.categoria_id !== categoria_id) return true;
      if (filter === 'ALL') return false;
      if (filter === 'INVALIDOS' && c.estado === 'INVALIDO') return false;
      if (filter === 'GENERICOS_ROL' && c.estado === 'GENERICO_ROL') return false;
      if (filter === 'VALIDOS' && c.estado === 'VALIDO') return false;

      if (filter === 'FILTERED' && options) {
        let match = true;
        if (options.estado && options.estado !== 'TODOS' && c.estado !== options.estado) {
          match = false;
        }
        if (options.tipo && options.tipo !== 'TODOS' && c.tipo !== options.tipo) {
          match = false;
        }
        if (options.min_score !== undefined && (c.score_confianza ?? 0) < options.min_score) {
          match = false;
        }
        if (options.max_score !== undefined && (c.score_confianza ?? 0) > options.max_score) {
          match = false;
        }
        if (options.search && options.search.trim()) {
          const q = options.search.toLowerCase().trim();
          const matchesSearch =
            c.email.toLowerCase().includes(q) ||
            c.dominio.toLowerCase().includes(q) ||
            c.observacion.toLowerCase().includes(q) ||
            (c.fuente_verificacion && c.fuente_verificacion.toLowerCase().includes(q));
          if (!matchesSearch) match = false;
        }
        if (match) return false; // descartar / eliminar este registro
      }

      return true;
    });
    const deletedCount = initialCount - this.data.correos.length;
    this.persist();
    return deletedCount;
  }

  // Mover correos masivamente de una categoría a otra
  public moveEmailsBulk(ids: string[], target_categoria_id: string): number {
    const set = new Set(ids);
    let movedCount = 0;
    for (const c of this.data.correos) {
      if (set.has(c.id)) {
        c.categoria_id = target_categoria_id;
        movedCount++;
      }
    }
    this.persist();
    return movedCount;
  }

  public getCleanEmailsForExport(categoria_id: string, includeRoles = false): Correo[] {
    return this.data.correos.filter((c) => {
      if (c.categoria_id !== categoria_id) return false;
      if (includeRoles) {
        return c.estado === 'VALIDO' || c.estado === 'GENERICO_ROL';
      }
      return c.estado === 'VALIDO';
    });
  }

  // Distribución dinámica de dominios y métricas analíticas
  public getDomainBreakdown(categoria_id: string): {
    domain: string;
    total: number;
    validos: number;
    invalidos: number;
    porcentaje: number;
  }[] {
    const list = this.data.correos.filter((c) => c.categoria_id === categoria_id);
    const domainMap = new Map<string, { total: number; validos: number; invalidos: number }>();

    for (const c of list) {
      const d = c.dominio || 'desconocido';
      const cur = domainMap.get(d) || { total: 0, validos: 0, invalidos: 0 };
      cur.total++;
      if (c.estado === 'VALIDO') cur.validos++;
      else if (c.estado === 'INVALIDO') cur.invalidos++;
      domainMap.set(d, cur);
    }

    const totalCount = list.length || 1;
    const sorted = Array.from(domainMap.entries())
      .map(([domain, counts]) => ({
        domain,
        total: counts.total,
        validos: counts.validos,
        invalidos: counts.invalidos,
        porcentaje: Math.round((counts.total / totalCount) * 100),
      }))
      .sort((a, b) => b.total - a.total);

    return sorted.slice(0, 8); // Top 8 dominios
  }

  public getGlobalStats() {
    const total = this.data.correos.length;
    const validos = this.data.correos.filter((c) => c.estado === 'VALIDO').length;
    const genericos = this.data.correos.filter((c) => c.estado === 'GENERICO_ROL').length;
    const invalidos = this.data.correos.filter((c) => c.estado === 'INVALIDO').length;
    const corregidos = this.data.correos.filter((c) => c.corregido).length;
    const totalScore = this.data.correos.reduce((acc, c) => acc + (c.score_confianza || 0), 0);
    const promedioScore = total > 0 ? Math.round(totalScore / total) : 0;

    return {
      total_listas: this.data.categorias.length,
      total_correos: total,
      validos,
      genericos_rol: genericos,
      invalidos,
      corregidos,
      promedio_score: promedioScore,
      config: this.getSystemConfig(),
    };
  }

  // --- MÉTODOS DE EMAIL MARKETING Y CAMPAÑAS ---

  public getAllCampaigns(): (Campaign & { listsInfo: { id: string; nombre: string; validos: number }[] })[] {
    const campaigns = this.data.campaigns || [];
    const categoriesMap = new Map(this.getAllCategories().map((cat) => [cat.id, cat]));

    return campaigns.map((camp) => {
      const listsInfo = (camp.listIds || []).map((lid) => {
        const cat = categoriesMap.get(lid);
        return {
          id: lid,
          nombre: cat ? cat.nombre : 'Lista eliminada',
          validos: cat ? cat.validos || 0 : 0,
        };
      });

      return {
        ...camp,
        listsInfo,
      };
    }).sort((a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0));
  }

  public getCampaignById(id: string): (Campaign & { listsInfo: { id: string; nombre: string; validos: number }[] }) | null {
    const camp = (this.data.campaigns || []).find((c) => c.id === id);
    if (!camp) return null;

    const categoriesMap = new Map(this.getAllCategories().map((cat) => [cat.id, cat]));
    const listsInfo = (camp.listIds || []).map((lid) => {
      const cat = categoriesMap.get(lid);
      return {
        id: lid,
        nombre: cat ? cat.nombre : 'Lista eliminada',
        validos: cat ? cat.validos || 0 : 0,
      };
    });

    return {
      ...camp,
      listsInfo,
    };
  }

  public createCampaign(data: {
    name: string;
    subject: string;
    senderName: string;
    senderEmail: string;
    htmlContent: string;
    listIds: string[];
    pacingPerSecond?: number;
    delaySecondsBetweenEmails?: number;
    batchLimit?: number;
  }): Campaign {
    if (!this.data.campaigns) this.data.campaigns = [];

    const id = 'camp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newCamp: Campaign = {
      id,
      name: data.name.trim(),
      subject: data.subject.trim(),
      senderName: data.senderName.trim(),
      senderEmail: data.senderEmail.trim(),
      htmlContent: data.htmlContent,
      listIds: data.listIds || [],
      status: 'DRAFT',
      stats: {
        totalRecipients: 0,
        sentCount: 0,
        openedCount: 0,
        failedCount: 0,
      },
      pacingPerSecond: data.pacingPerSecond && data.pacingPerSecond > 0 ? data.pacingPerSecond : 2,
      delaySecondsBetweenEmails:
        data.delaySecondsBetweenEmails !== undefined ? Number(data.delaySecondsBetweenEmails) : 2,
      batchLimit: data.batchLimit && data.batchLimit > 0 ? Number(data.batchLimit) : undefined,
      createdAt: new Date().toISOString(),
    };

    this.data.campaigns.push(newCamp);
    this.persist();
    return newCamp;
  }

  public updateCampaign(id: string, updates: Partial<Campaign>): Campaign | null {
    if (!this.data.campaigns) return null;
    const idx = this.data.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.data.campaigns[idx] = {
      ...this.data.campaigns[idx],
      ...updates,
      id, // inmutable
    };
    this.persist();
    return this.data.campaigns[idx];
  }

  public deleteCampaign(id: string): boolean {
    if (!this.data.campaigns) return false;
    const idx = this.data.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    this.data.campaigns.splice(idx, 1);
    if (this.data.campaignLogs) {
      this.data.campaignLogs = this.data.campaignLogs.filter((l) => l.campaignId !== id);
    }
    this.persist();
    return true;
  }

  public resetCampaign(id: string): Campaign | null {
    if (!this.data.campaigns) return null;
    const idx = this.data.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.data.campaigns[idx] = {
      ...this.data.campaigns[idx],
      status: 'DRAFT',
      stats: {
        totalRecipients: 0,
        sentCount: 0,
        openedCount: 0,
        failedCount: 0,
      },
      sentAt: undefined,
      completedAt: undefined,
    };

    // Eliminar logs anteriores para permitir nuevo despacho limpio
    if (this.data.campaignLogs) {
      this.data.campaignLogs = this.data.campaignLogs.filter((l) => l.campaignId !== id);
    }

    this.persist();
    return this.data.campaigns[idx];
  }


  /**
   * Obtiene exclusivamente los destinatarios VÁLIDOS de las listas seleccionadas.
   * Regla de negocio estricta:
   * 1. categoria_id IN (listIds)
   * 2. estado === 'VALIDO' (excluye por completo 'INVALIDO' y 'GENERICO_ROL')
   * 3. no desuscrito (is_unsubscribed === false)
   * 4. deduplicación por correo
   */
  public getValidRecipientsForLists(listIds: string[]): { email: string; emailId: string; categoria_id: string }[] {
    const listIdsSet = new Set(listIds);
    const unsubscribedSet = new Set(
      (this.data.unsubscribed || []).map((u) => u.email.toLowerCase().trim())
    );

    // Consulta estricta
    const validEmails = this.data.correos.filter((c) => {
      if (!listIdsSet.has(c.categoria_id)) return false;
      if (c.estado !== 'VALIDO') return false; // Solo estado 'VALIDO'
      if (unsubscribedSet.has(c.email.toLowerCase().trim())) return false; // Excluye desuscritos
      return true;
    });

    // Deduplicación en memoria para garantizar 1 solo envío por contacto si está en múltiples listas
    const seen = new Set<string>();
    const result: { email: string; emailId: string; categoria_id: string }[] = [];

    for (const c of validEmails) {
      const normalized = c.email.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push({
          email: c.email.trim(),
          emailId: c.id,
          categoria_id: c.categoria_id,
        });
      }
    }

    return result;
  }

  /**
   * Genera el desglose y conteo en tiempo real de correos válidos para el frontend
   */
  public getRecipientsPreview(listIds: string[]): ListsRecipientsPreview {
    const listIdsSet = new Set(listIds);
    const unsubscribedSet = new Set(
      (this.data.unsubscribed || []).map((u) => u.email.toLowerCase().trim())
    );

    const categoriesMap = new Map(this.getAllCategories().map((cat) => [cat.id, cat]));
    const matchedEmails = this.data.correos.filter((c) => listIdsSet.has(c.categoria_id));

    let totalCandidates = matchedEmails.length;
    let excludedInvalidOrRisk = 0;
    let excludedUnsubscribed = 0;
    const seenValids = new Set<string>();
    let duplicatesRemoved = 0;
    const validList: string[] = [];

    for (const c of matchedEmails) {
      if (c.estado !== 'VALIDO') {
        excludedInvalidOrRisk++;
        continue;
      }

      const emailLower = c.email.toLowerCase().trim();
      if (unsubscribedSet.has(emailLower)) {
        excludedUnsubscribed++;
        continue;
      }

      if (seenValids.has(emailLower)) {
        duplicatesRemoved++;
        continue;
      }

      seenValids.add(emailLower);
      validList.push(c.email);
    }

    const listsSummary = listIds.map((lid) => {
      const cat = categoriesMap.get(lid);
      const catEmails = this.data.correos.filter((c) => c.categoria_id === lid);
      const val = catEmails.filter((c) => c.estado === 'VALIDO').length;
      const inv = catEmails.length - val;

      return {
        id: lid,
        nombre: cat ? cat.nombre : 'Lista no encontrada',
        total: catEmails.length,
        validos: val,
        invalidos_o_riesgo: inv,
      };
    });

    return {
      totalCandidates,
      validRecipients: validList.length,
      excludedInvalidOrRisk,
      excludedUnsubscribed,
      duplicatesRemoved,
      listsSummary,
    };
  }

  // --- MÉTODOS DE LOGS DE CAMPAÑAS ---

  public getCampaignLogs(campaignId: string, status?: string): CampaignLog[] {
    let logs = (this.data.campaignLogs || []).filter((l) => l.campaignId === campaignId);
    if (status && status !== 'ALL') {
      logs = logs.filter((l) => l.status === status);
    }
    return logs;
  }

  public getCampaignLogById(id: string): CampaignLog | null {
    return (this.data.campaignLogs || []).find((l) => l.id === id) || null;
  }

  public createCampaignLogsBatch(logs: Omit<CampaignLog, 'id'>[]): CampaignLog[] {
    if (!this.data.campaignLogs) this.data.campaignLogs = [];
    const created: CampaignLog[] = [];

    for (const item of logs) {
      const logObj: CampaignLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
        campaignId: item.campaignId,
        email: item.email,
        status: item.status,
        sentAt: item.sentAt,
        openedAt: item.openedAt,
        error: item.error,
      };
      this.data.campaignLogs.push(logObj);
      created.push(logObj);
    }

    this.persist();
    return created;
  }

  public updateCampaignLog(id: string, updates: Partial<CampaignLog>): CampaignLog | null {
    if (!this.data.campaignLogs) return null;
    const idx = this.data.campaignLogs.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    this.data.campaignLogs[idx] = {
      ...this.data.campaignLogs[idx],
      ...updates,
      id,
    };
    this.persist();
    return this.data.campaignLogs[idx];
  }

  public markEmailOpened(campaignId: string, logIdOrEmail: string): boolean {
    if (!this.data.campaignLogs) return false;

    // Buscar por ID del log o por email
    const log = this.data.campaignLogs.find(
      (l) => l.campaignId === campaignId && (l.id === logIdOrEmail || l.email.toLowerCase() === logIdOrEmail.toLowerCase())
    );

    if (!log) return false;

    if (log.status !== 'OPENED') {
      log.status = 'OPENED';
      log.openedAt = new Date().toISOString();

      // Actualizar contador en la campaña
      const camp = (this.data.campaigns || []).find((c) => c.id === campaignId);
      if (camp) {
        camp.stats.openedCount = (camp.stats.openedCount || 0) + 1;
      }

      this.persist();
      return true;
    }

    return true;
  }

  // --- MÉTODOS DE DESUSCRIPCIONES (UNSUBSCRIBE) ---

  public addUnsubscribe(email: string, campaignId?: string, reason?: string): boolean {
    if (!this.data.unsubscribed) this.data.unsubscribed = [];
    const normalized = email.toLowerCase().trim();

    const exists = this.data.unsubscribed.some((u) => u.email.toLowerCase().trim() === normalized);
    if (exists) return true;

    this.data.unsubscribed.push({
      id: 'unsub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      email: normalized,
      campaignId,
      reason: reason || 'Solicitud de desuscripción voluntaria desde correo',
      unsubscribedAt: new Date().toISOString(),
    });

    this.persist();
    return true;
  }

  public isEmailUnsubscribed(email: string): boolean {
    if (!this.data.unsubscribed) return false;
    const normalized = email.toLowerCase().trim();
    return this.data.unsubscribed.some((u) => u.email.toLowerCase().trim() === normalized);
  }

  public getAllUnsubscribed(): UnsubscribedContact[] {
    return this.data.unsubscribed || [];
  }

  // --- MÉTODOS DE GESTIÓN DE USUARIOS Y PERMISOS (RBAC) ---

  public getUsers(): SystemUser[] {
    if (!this.data.users || this.data.users.length === 0) {
      this.data.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
      this.persist();
    }
    return this.data.users || [];
  }

  public getUserById(id: string): SystemUser | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getUserByUsername(username: string): SystemUser | undefined {
    const normalized = username.toLowerCase().trim();
    return this.getUsers().find((u) => u.username.toLowerCase().trim() === normalized);
  }

  public createUser(userData: {
    username: string;
    name: string;
    password?: string;
    role: UserRole;
    status?: 'active' | 'inactive';
    permissions?: Partial<UserPermissions>;
  }): SystemUser {
    const normalized = userData.username.toLowerCase().trim();
    if (this.getUserByUsername(normalized)) {
      throw new Error(`El nombre de usuario "${normalized}" ya está registrado.`);
    }

    const role: UserRole = userData.role || 'digitalizador';
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.custom;
    const finalPermissions: UserPermissions = {
      ...defaultPerms,
      ...(userData.permissions || {}),
    };

    const newUser: SystemUser = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      username: normalized,
      name: userData.name.trim(),
      password: userData.password?.trim() || '12345678',
      role,
      status: userData.status || 'active',
      permissions: finalPermissions,
      createdAt: new Date().toISOString(),
    };

    this.data.users = this.data.users || [];
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUser(
    id: string,
    updates: Partial<{
      username: string;
      name: string;
      password?: string;
      role: UserRole;
      status: 'active' | 'inactive';
      permissions: Partial<UserPermissions>;
      lastLogin?: string;
    }>
  ): SystemUser | null {
    const user = this.getUserById(id);
    if (!user) return null;

    if (updates.username) {
      const norm = updates.username.toLowerCase().trim();
      const existing = this.getUserByUsername(norm);
      if (existing && existing.id !== id) {
        throw new Error(`El nombre de usuario "${norm}" ya está en uso.`);
      }
      user.username = norm;
    }

    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.password && updates.password.trim()) user.password = updates.password.trim();
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.status !== undefined) user.status = updates.status;
    if (updates.lastLogin !== undefined) user.lastLogin = updates.lastLogin;

    if (updates.permissions) {
      user.permissions = {
        ...user.permissions,
        ...updates.permissions,
      };
    } else if (updates.role && updates.role !== user.role && DEFAULT_ROLE_PERMISSIONS[updates.role]) {
      user.permissions = { ...DEFAULT_ROLE_PERMISSIONS[updates.role] };
    }

    this.persist();
    return user;
  }

  public deleteUser(id: string): boolean {
    const user = this.getUserById(id);
    if (!user) return false;

    if (user.username === 'admin') {
      throw new Error('No es posible eliminar el usuario Administrador principal del sistema.');
    }

    this.data.users = (this.data.users || []).filter((u) => u.id !== id);
    this.persist();
    return true;
  }

  // --- MÉTODOS DE COPIA DE SEGURIDAD Y MIGRACIÓN ---

  public getRawData(): DatabaseData {
    return JSON.parse(JSON.stringify(this.data));
  }

  public restoreRawData(imported: Partial<DatabaseData>): {
    success: boolean;
    categoriasCount: number;
    correosCount: number;
    campaignsCount: number;
    usersCount: number;
  } {
    if (!imported || typeof imported !== 'object') {
      throw new Error('Archivo de base de datos inválido');
    }

    if (Array.isArray(imported.categorias)) {
      this.data.categorias = imported.categorias;
    }
    if (Array.isArray(imported.correos)) {
      this.data.correos = imported.correos;
    }
    if (imported.config && typeof imported.config === 'object') {
      this.data.config = { ...this.data.config, ...imported.config };
    }
    if (Array.isArray(imported.landingPlans)) {
      this.data.landingPlans = imported.landingPlans;
    }
    if (Array.isArray(imported.campaigns)) {
      this.data.campaigns = imported.campaigns;
    }
    if (Array.isArray(imported.campaignLogs)) {
      this.data.campaignLogs = imported.campaignLogs;
    }
    if (Array.isArray(imported.unsubscribed)) {
      this.data.unsubscribed = imported.unsubscribed;
    }
    if (Array.isArray(imported.users)) {
      this.data.users = imported.users;
    }
    if (imported.landingConfig && typeof imported.landingConfig === 'object') {
      this.data.landingConfig = imported.landingConfig;
    }
    if (imported.license && typeof imported.license === 'object') {
      this.data.license = imported.license;
    }
    if (Array.isArray(imported.generatedLicenses)) {
      this.data.generatedLicenses = imported.generatedLicenses;
    }

    this.persist();

    return {
      success: true,
      categoriasCount: this.data.categorias.length,
      correosCount: this.data.correos.length,
      campaignsCount: (this.data.campaigns || []).length,
      usersCount: (this.data.users || []).length,
    };
  }

  public getLandingConfig(): LandingConfig {
    if (!this.data.landingConfig) {
      this.data.landingConfig = JSON.parse(JSON.stringify(DEFAULT_LANDING_CONFIG));
      this.persist();
    }
    return this.data.landingConfig || DEFAULT_LANDING_CONFIG;
  }

  public updateLandingConfig(configUpdates: Partial<LandingConfig>): LandingConfig {
    const current = this.getLandingConfig();
    this.data.landingConfig = {
      ...current,
      ...configUpdates,
    };
    this.persist();
    return this.data.landingConfig || DEFAULT_LANDING_CONFIG;
  }

  public resetLandingConfig(): LandingConfig {
    this.data.landingConfig = JSON.parse(JSON.stringify(DEFAULT_LANDING_CONFIG));
    this.persist();
    return this.data.landingConfig || DEFAULT_LANDING_CONFIG;
  }

  public getLicense(): AppLicense | null {
    return this.data.license || null;
  }

  public saveLicense(license: AppLicense): void {
    this.data.license = license;
    this.persist();
  }

  public deleteLicense(): void {
    delete this.data.license;
    this.persist();
  }

  public getGeneratedLicenses(): GeneratedLicenseRecord[] {
    if (!Array.isArray(this.data.generatedLicenses)) {
      this.data.generatedLicenses = [];
      this.persist();
    }
    return this.data.generatedLicenses;
  }

  public addGeneratedLicense(record: GeneratedLicenseRecord): void {
    const list = this.getGeneratedLicenses();
    const existingIdx = list.findIndex((l) => l.licenseId === record.licenseId);
    if (existingIdx >= 0) {
      list[existingIdx] = record;
    } else {
      list.unshift(record);
    }
    this.data.generatedLicenses = list;
    this.persist();
  }

  public updateGeneratedLicense(
    licenseId: string,
    updates: Partial<GeneratedLicenseRecord>
  ): GeneratedLicenseRecord | null {
    const list = this.getGeneratedLicenses();
    const idx = list.findIndex((l) => l.licenseId === licenseId);
    if (idx < 0) return null;
    list[idx] = { ...list[idx], ...updates };
    this.data.generatedLicenses = list;
    this.persist();
    return list[idx];
  }

  public revokeLicense(licenseId: string, reason?: string): boolean {
    const updated = this.updateGeneratedLicense(licenseId, {
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
      revocationReason: reason || 'Revocada manualmente por el Administrador.',
    });

    // Si la licencia activa en este servidor coincide con la revocada, invalidarla
    if (this.data.license?.payload.licenseId === licenseId) {
      this.data.license.payload.features = [];
      this.persist();
    }

    return Boolean(updated);
  }

  public reactivateLicense(licenseId: string): boolean {
    const updated = this.updateGeneratedLicense(licenseId, {
      status: 'ACTIVE',
      revokedAt: undefined,
      revocationReason: undefined,
    });
    return Boolean(updated);
  }

  public deleteGeneratedLicense(licenseId: string): boolean {
    const list = this.getGeneratedLicenses();
    const filtered = list.filter((l) => l.licenseId !== licenseId);
    if (filtered.length === list.length) return false;
    this.data.generatedLicenses = filtered;
    this.persist();
    return true;
  }

  public isLicenseRevoked(licenseId: string): boolean {
    const list = this.getGeneratedLicenses();
    const found = list.find((l) => l.licenseId === licenseId);
    return Boolean(found && found.status === 'REVOKED');
  }
}

export const db = new Database();
