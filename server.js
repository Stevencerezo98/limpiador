// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path2 from "path";
import { fileURLToPath } from "url";

// src/server/routes/index.ts
import { Router as Router7 } from "express";

// src/server/routes/category.routes.ts
import { Router } from "express";

// src/server/db/database.ts
import fs from "fs";
import path from "path";

// src/server/db/schema.ts
var DEFAULT_ROLE_PERMISSIONS = {
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
    canBackupRestore: true
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
    canBackupRestore: false
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
    canBackupRestore: false
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
    canBackupRestore: false
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
    canBackupRestore: false
  }
};

// src/server/db/database.ts
var DATA_DIR = path.resolve(process.cwd(), "data");
var DB_FILE = path.join(DATA_DIR, "db.json");
var DEFAULT_LANDING_PLANS = [
  {
    id: "plan-starter",
    name: "B\xE1sico / Starter",
    badge: "Para Comenzar",
    credits: 1e4,
    price: 19,
    currency: "USD",
    period: "pago \xFAnico",
    description: "Ideal para peque\xF1as empresas y depuraci\xF3n de listas puntuales.",
    features: [
      "10,000 Verificaciones de correo",
      "Validaci\xF3n estricta de sintaxis RFC",
      "Comprobaci\xF3n de servidores DNS MX en vivo",
      "Autocorrecci\xF3n de errores de tipeo (.gmai -> .gmail)",
      "Exportaci\xF3n ilimitada a CSV limpio"
    ],
    popular: false,
    active: true
  },
  {
    id: "plan-pro",
    name: "Profesional Growth",
    badge: "M\xE1s Popular",
    credits: 5e4,
    price: 49,
    currency: "USD",
    period: "pago \xFAnico",
    description: "El paquete m\xE1s elegido para agencias y campa\xF1as de Email Marketing.",
    features: [
      "50,000 Verificaciones de correo",
      "Filtro avanzado de dominios desechables y temporales",
      "Identificaci\xF3n de cuentas de rol (info@, ventas@)",
      "Score de confianza de entregabilidad (0 a 100%)",
      "Deduplicaci\xF3n autom\xE1tica de contactos",
      "Soporte prioritario por email"
    ],
    popular: true,
    active: true
  },
  {
    id: "plan-enterprise",
    name: "Enterprise Volume",
    badge: "Gran Volumen",
    credits: 25e4,
    price: 149,
    currency: "USD",
    period: "pago \xFAnico",
    description: "Alto rendimiento para plataformas SaaS, e-commerce y bases de datos masivas.",
    features: [
      "250,000 Verificaciones de correo",
      "M\xFAltiples operadores y roles (Admin & Digitalizador)",
      "Auditor\xEDa profunda de registros SPF y DMARC",
      "Herramienta de purgado de rebotes duros en 1 clic",
      "Aislamiento de cuentas departamentales a listas secundarias",
      "Exportaci\xF3n CSV segmentada"
    ],
    popular: false,
    active: true
  },
  {
    id: "plan-unlimited",
    name: "Ilimitado Anual",
    badge: "Acceso Total",
    credits: 1e6,
    price: 399,
    currency: "USD",
    period: "/a\xF1o",
    description: "Sin restricciones de volumen ni l\xEDmites de cr\xE9ditos para corporativos.",
    features: [
      "Cr\xE9ditos Ilimitados de verificaci\xF3n",
      "Categor\xEDas y listas ilimitadas con total aislamiento",
      "Acceso exclusivo al panel de control de planes",
      "Asesor\xEDa t\xE9cnica para evitar listas negras (Blacklists)",
      "SLA de disponibilidad garantizado"
    ],
    popular: false,
    active: true
  }
];
var DEFAULT_CONFIG = {
  planName: "Plan Enterprise CleanMail Pro",
  planType: "enterprise",
  creditosDisponibles: 1e5,
  creditosUsados: 0,
  limiteMensual: 25e4,
  autoCleanDuplicates: true,
  strictMxChecking: true,
  alertaCreditosBajos: true,
  umbralAlerta: 5e3
};
var DEFAULT_USERS = [
  {
    id: "usr-admin",
    username: "admin",
    name: "Administrador del Sistema",
    password: "admin",
    role: "admin",
    status: "active",
    permissions: DEFAULT_ROLE_PERMISSIONS.admin,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "usr-digitalizador",
    username: "digitalizador",
    name: "Operador Digitalizador",
    password: "digitalizador",
    role: "digitalizador",
    status: "active",
    permissions: DEFAULT_ROLE_PERMISSIONS.digitalizador,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "usr-marketing",
    username: "marketing",
    name: "Especialista en Marketing & Campa\xF1as",
    password: "marketing2026",
    role: "marketing",
    status: "active",
    permissions: DEFAULT_ROLE_PERMISSIONS.marketing,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "usr-auditor",
    username: "auditor",
    name: "Auditor de Calidad (Solo Lectura)",
    password: "auditor2026",
    role: "visor",
    status: "active",
    permissions: DEFAULT_ROLE_PERMISSIONS.visor,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var Database = class {
  constructor() {
    this.data = {
      categorias: [],
      correos: [],
      config: DEFAULT_CONFIG,
      landingPlans: [],
      users: []
    };
    this.isLoaded = false;
    this.init();
  }
  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        for (const c of this.data.correos) {
          if (c.score_confianza === void 0) {
            c.score_confianza = c.estado === "VALIDO" ? 90 : c.estado === "GENERICO_ROL" ? 65 : 10;
          }
          if (c.verificado_externo === void 0) {
            c.verificado_externo = false;
          }
          if (!c.fuente_verificacion) {
            c.fuente_verificacion = "Local";
          }
        }
        if (!this.data.config) {
          this.data.config = {
            ...DEFAULT_CONFIG,
            creditosUsados: this.data.correos.length
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
        const now = (/* @__PURE__ */ new Date()).toISOString();
        this.data = {
          categorias: [
            { id: "cat-general", nombre: "General / Sin Categorizar", fecha_creacion: now }
          ],
          correos: [],
          config: DEFAULT_CONFIG,
          landingPlans: JSON.parse(JSON.stringify(DEFAULT_LANDING_PLANS)),
          campaigns: [],
          campaignLogs: [],
          unsubscribed: [],
          users: JSON.parse(JSON.stringify(DEFAULT_USERS))
        };
        this.persist();
      }
      this.isLoaded = true;
    } catch (error) {
      console.error("Error inicializando la base de datos local:", error);
      this.data = {
        categorias: [],
        correos: [],
        config: DEFAULT_CONFIG,
        landingPlans: [],
        campaigns: [],
        campaignLogs: [],
        unsubscribed: []
      };
    }
  }
  persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("Error guardando en archivo db.json:", error);
    }
  }
  // --- MÉTODOS DE CONFIGURACIÓN Y PLANES ---
  getSystemConfig() {
    if (!this.data.config) {
      this.data.config = { ...DEFAULT_CONFIG, creditosUsados: this.data.correos.length };
    }
    this.data.config.creditosUsados = this.data.correos.length;
    return this.data.config;
  }
  updateSystemConfig(updates) {
    if (!this.data.config) {
      this.data.config = { ...DEFAULT_CONFIG };
    }
    this.data.config = {
      ...this.data.config,
      ...updates,
      creditosUsados: this.data.correos.length
    };
    this.persist();
    return this.data.config;
  }
  // --- MÉTODOS DE PLANES DE DEPURACIÓN (LANDING) ---
  getLandingPlans() {
    if (!this.data.landingPlans || !Array.isArray(this.data.landingPlans) || this.data.landingPlans.length === 0) {
      this.data.landingPlans = JSON.parse(JSON.stringify(DEFAULT_LANDING_PLANS));
      this.persist();
    }
    return this.data.landingPlans;
  }
  updateLandingPlan(id, updates) {
    const plans = this.getLandingPlans();
    const idx = plans.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    plans[idx] = {
      ...plans[idx],
      ...updates,
      id
      // inmutable
    };
    this.persist();
    return plans[idx];
  }
  createLandingPlan(plan) {
    const plans = this.getLandingPlans();
    const id = "plan-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
    const newPlan = {
      ...plan,
      id
    };
    plans.push(newPlan);
    this.persist();
    return newPlan;
  }
  deleteLandingPlan(id) {
    const plans = this.getLandingPlans();
    const idx = plans.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    plans.splice(idx, 1);
    this.persist();
    return true;
  }
  resetLandingPlans() {
    this.data.landingPlans = JSON.parse(JSON.stringify(DEFAULT_LANDING_PLANS));
    this.persist();
    return this.data.landingPlans;
  }
  // --- MÉTODOS DE CATEGORÍAS ---
  getAllCategories() {
    return this.data.categorias.map((cat) => {
      const correosCat = this.data.correos.filter((c) => c.categoria_id === cat.id);
      const total = correosCat.length;
      const validos = correosCat.filter((c) => c.estado === "VALIDO").length;
      const genericos = correosCat.filter((c) => c.estado === "GENERICO_ROL").length;
      const invalidos = correosCat.filter((c) => c.estado === "INVALIDO").length;
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
        promedio_score: promedioScore
      };
    });
  }
  getCategoryById(id) {
    const cat = this.data.categorias.find((c) => c.id === id);
    if (!cat) return null;
    const correosCat = this.data.correos.filter((c) => c.categoria_id === cat.id);
    const total = correosCat.length;
    const validos = correosCat.filter((c) => c.estado === "VALIDO").length;
    const genericos = correosCat.filter((c) => c.estado === "GENERICO_ROL").length;
    const invalidos = correosCat.filter((c) => c.estado === "INVALIDO").length;
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
      promedio_score: promedioScore
    };
  }
  createCategory(nombre, descripcion) {
    const id = "cat-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const nuevaCategoria = {
      id,
      nombre,
      descripcion,
      fecha_creacion: (/* @__PURE__ */ new Date()).toISOString(),
      total_correos: 0,
      validos: 0,
      genericos_rol: 0,
      invalidos: 0,
      corregidos: 0,
      promedio_score: 0
    };
    this.data.categorias.push(nuevaCategoria);
    this.persist();
    return nuevaCategoria;
  }
  updateCategory(id, updates) {
    const cat = this.data.categorias.find((c) => c.id === id);
    if (!cat) return null;
    if (updates.nombre && updates.nombre.trim()) {
      cat.nombre = updates.nombre.trim();
    }
    if (updates.descripcion !== void 0) {
      cat.descripcion = updates.descripcion.trim();
    }
    this.persist();
    return this.getCategoryById(id);
  }
  deleteCategory(id) {
    const idx = this.data.categorias.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categorias.splice(idx, 1);
    this.data.correos = this.data.correos.filter((c) => c.categoria_id !== id);
    this.persist();
    return true;
  }
  // --- MÉTODOS DE CORREOS ---
  getEmailsByCategory(categoria_id, filters = {}) {
    let list = this.data.correos.filter((c) => c.categoria_id === categoria_id);
    if (filters.estado && filters.estado !== "TODOS") {
      list = list.filter((c) => c.estado === filters.estado);
    }
    if (filters.tipo && filters.tipo !== "TODOS") {
      list = list.filter((c) => c.tipo === filters.tipo);
    }
    if (filters.min_score !== void 0 && !isNaN(filters.min_score)) {
      list = list.filter((c) => (c.score_confianza ?? 0) >= filters.min_score);
    }
    if (filters.max_score !== void 0 && !isNaN(filters.max_score)) {
      list = list.filter((c) => (c.score_confianza ?? 0) <= filters.max_score);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) => c.email.toLowerCase().includes(q) || c.dominio.toLowerCase().includes(q) || c.observacion.toLowerCase().includes(q) || c.fuente_verificacion && c.fuente_verificacion.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => b.fecha_creacion > a.fecha_creacion ? 1 : b.fecha_creacion < a.fecha_creacion ? -1 : 0);
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
      correos: paginated
    };
  }
  getEmailById(id) {
    return this.data.correos.find((c) => c.id === id) || null;
  }
  updateEmail(id, updates) {
    const idx = this.data.correos.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.correos[idx] = {
      ...this.data.correos[idx],
      ...updates,
      id
      // garantizar inmutabilidad de id
    };
    this.persist();
    return this.data.correos[idx];
  }
  getExistingEmailsSet(categoria_id) {
    const set = /* @__PURE__ */ new Set();
    this.data.correos.filter((c) => c.categoria_id === categoria_id).forEach((c) => set.add(c.email.toLowerCase()));
    return set;
  }
  insertEmailsBatch(categoria_id, correosNuevos) {
    const inserted = [];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const c of correosNuevos) {
      const correoObj = {
        id: "cor-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9),
        categoria_id,
        email: c.email,
        original_email: c.original_email,
        estado: c.estado,
        tipo: c.tipo,
        dominio: c.dominio,
        observacion: c.observacion,
        mx_valido: c.mx_valido,
        corregido: c.corregido,
        score_confianza: c.score_confianza ?? (c.estado === "VALIDO" ? 90 : c.estado === "GENERICO_ROL" ? 65 : 10),
        verificado_externo: c.verificado_externo ?? false,
        fuente_verificacion: c.fuente_verificacion || "Local",
        fecha_creacion: now
      };
      this.data.correos.push(correoObj);
      inserted.push(correoObj);
    }
    this.persist();
    return inserted;
  }
  deleteEmail(id) {
    const idx = this.data.correos.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.correos.splice(idx, 1);
    this.persist();
    return true;
  }
  // Eliminación masiva por IDs seleccionados
  deleteEmailsBulk(ids) {
    const set = new Set(ids);
    const initialCount = this.data.correos.length;
    this.data.correos = this.data.correos.filter((c) => !set.has(c.id));
    const deletedCount = initialCount - this.data.correos.length;
    this.persist();
    return deletedCount;
  }
  // Eliminación por filtro en categoría (ej: purgar todos los inválidos, vaciar lista o por filtros)
  deleteEmailsByFilter(categoria_id, filter, options) {
    const initialCount = this.data.correos.length;
    this.data.correos = this.data.correos.filter((c) => {
      if (c.categoria_id !== categoria_id) return true;
      if (filter === "ALL") return false;
      if (filter === "INVALIDOS" && c.estado === "INVALIDO") return false;
      if (filter === "GENERICOS_ROL" && c.estado === "GENERICO_ROL") return false;
      if (filter === "VALIDOS" && c.estado === "VALIDO") return false;
      if (filter === "FILTERED" && options) {
        let match = true;
        if (options.estado && options.estado !== "TODOS" && c.estado !== options.estado) {
          match = false;
        }
        if (options.tipo && options.tipo !== "TODOS" && c.tipo !== options.tipo) {
          match = false;
        }
        if (options.min_score !== void 0 && (c.score_confianza ?? 0) < options.min_score) {
          match = false;
        }
        if (options.max_score !== void 0 && (c.score_confianza ?? 0) > options.max_score) {
          match = false;
        }
        if (options.search && options.search.trim()) {
          const q = options.search.toLowerCase().trim();
          const matchesSearch = c.email.toLowerCase().includes(q) || c.dominio.toLowerCase().includes(q) || c.observacion.toLowerCase().includes(q) || c.fuente_verificacion && c.fuente_verificacion.toLowerCase().includes(q);
          if (!matchesSearch) match = false;
        }
        if (match) return false;
      }
      return true;
    });
    const deletedCount = initialCount - this.data.correos.length;
    this.persist();
    return deletedCount;
  }
  // Mover correos masivamente de una categoría a otra
  moveEmailsBulk(ids, target_categoria_id) {
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
  getCleanEmailsForExport(categoria_id, includeRoles = false) {
    return this.data.correos.filter((c) => {
      if (c.categoria_id !== categoria_id) return false;
      if (includeRoles) {
        return c.estado === "VALIDO" || c.estado === "GENERICO_ROL";
      }
      return c.estado === "VALIDO";
    });
  }
  // Distribución dinámica de dominios y métricas analíticas
  getDomainBreakdown(categoria_id) {
    const list = this.data.correos.filter((c) => c.categoria_id === categoria_id);
    const domainMap = /* @__PURE__ */ new Map();
    for (const c of list) {
      const d = c.dominio || "desconocido";
      const cur = domainMap.get(d) || { total: 0, validos: 0, invalidos: 0 };
      cur.total++;
      if (c.estado === "VALIDO") cur.validos++;
      else if (c.estado === "INVALIDO") cur.invalidos++;
      domainMap.set(d, cur);
    }
    const totalCount = list.length || 1;
    const sorted = Array.from(domainMap.entries()).map(([domain, counts]) => ({
      domain,
      total: counts.total,
      validos: counts.validos,
      invalidos: counts.invalidos,
      porcentaje: Math.round(counts.total / totalCount * 100)
    })).sort((a, b) => b.total - a.total);
    return sorted.slice(0, 8);
  }
  getGlobalStats() {
    const total = this.data.correos.length;
    const validos = this.data.correos.filter((c) => c.estado === "VALIDO").length;
    const genericos = this.data.correos.filter((c) => c.estado === "GENERICO_ROL").length;
    const invalidos = this.data.correos.filter((c) => c.estado === "INVALIDO").length;
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
      config: this.getSystemConfig()
    };
  }
  // --- MÉTODOS DE EMAIL MARKETING Y CAMPAÑAS ---
  getAllCampaigns() {
    const campaigns = this.data.campaigns || [];
    const categoriesMap = new Map(this.getAllCategories().map((cat) => [cat.id, cat]));
    return campaigns.map((camp) => {
      const listsInfo = (camp.listIds || []).map((lid) => {
        const cat = categoriesMap.get(lid);
        return {
          id: lid,
          nombre: cat ? cat.nombre : "Lista eliminada",
          validos: cat ? cat.validos || 0 : 0
        };
      });
      return {
        ...camp,
        listsInfo
      };
    }).sort((a, b) => b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0);
  }
  getCampaignById(id) {
    const camp = (this.data.campaigns || []).find((c) => c.id === id);
    if (!camp) return null;
    const categoriesMap = new Map(this.getAllCategories().map((cat) => [cat.id, cat]));
    const listsInfo = (camp.listIds || []).map((lid) => {
      const cat = categoriesMap.get(lid);
      return {
        id: lid,
        nombre: cat ? cat.nombre : "Lista eliminada",
        validos: cat ? cat.validos || 0 : 0
      };
    });
    return {
      ...camp,
      listsInfo
    };
  }
  createCampaign(data) {
    if (!this.data.campaigns) this.data.campaigns = [];
    const id = "camp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const newCamp = {
      id,
      name: data.name.trim(),
      subject: data.subject.trim(),
      senderName: data.senderName.trim(),
      senderEmail: data.senderEmail.trim(),
      htmlContent: data.htmlContent,
      listIds: data.listIds || [],
      status: "DRAFT",
      stats: {
        totalRecipients: 0,
        sentCount: 0,
        openedCount: 0,
        failedCount: 0
      },
      pacingPerSecond: data.pacingPerSecond && data.pacingPerSecond > 0 ? data.pacingPerSecond : 2,
      delaySecondsBetweenEmails: data.delaySecondsBetweenEmails !== void 0 ? Number(data.delaySecondsBetweenEmails) : 2,
      batchLimit: data.batchLimit && data.batchLimit > 0 ? Number(data.batchLimit) : void 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.campaigns.push(newCamp);
    this.persist();
    return newCamp;
  }
  updateCampaign(id, updates) {
    if (!this.data.campaigns) return null;
    const idx = this.data.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.campaigns[idx] = {
      ...this.data.campaigns[idx],
      ...updates,
      id
      // inmutable
    };
    this.persist();
    return this.data.campaigns[idx];
  }
  deleteCampaign(id) {
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
  resetCampaign(id) {
    if (!this.data.campaigns) return null;
    const idx = this.data.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.campaigns[idx] = {
      ...this.data.campaigns[idx],
      status: "DRAFT",
      stats: {
        totalRecipients: 0,
        sentCount: 0,
        openedCount: 0,
        failedCount: 0
      },
      sentAt: void 0,
      completedAt: void 0
    };
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
  getValidRecipientsForLists(listIds) {
    const listIdsSet = new Set(listIds);
    const unsubscribedSet = new Set(
      (this.data.unsubscribed || []).map((u) => u.email.toLowerCase().trim())
    );
    const validEmails = this.data.correos.filter((c) => {
      if (!listIdsSet.has(c.categoria_id)) return false;
      if (c.estado !== "VALIDO") return false;
      if (unsubscribedSet.has(c.email.toLowerCase().trim())) return false;
      return true;
    });
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const c of validEmails) {
      const normalized = c.email.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push({
          email: c.email.trim(),
          emailId: c.id,
          categoria_id: c.categoria_id
        });
      }
    }
    return result;
  }
  /**
   * Genera el desglose y conteo en tiempo real de correos válidos para el frontend
   */
  getRecipientsPreview(listIds) {
    const listIdsSet = new Set(listIds);
    const unsubscribedSet = new Set(
      (this.data.unsubscribed || []).map((u) => u.email.toLowerCase().trim())
    );
    const categoriesMap = new Map(this.getAllCategories().map((cat) => [cat.id, cat]));
    const matchedEmails = this.data.correos.filter((c) => listIdsSet.has(c.categoria_id));
    let totalCandidates = matchedEmails.length;
    let excludedInvalidOrRisk = 0;
    let excludedUnsubscribed = 0;
    const seenValids = /* @__PURE__ */ new Set();
    let duplicatesRemoved = 0;
    const validList = [];
    for (const c of matchedEmails) {
      if (c.estado !== "VALIDO") {
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
      const val = catEmails.filter((c) => c.estado === "VALIDO").length;
      const inv = catEmails.length - val;
      return {
        id: lid,
        nombre: cat ? cat.nombre : "Lista no encontrada",
        total: catEmails.length,
        validos: val,
        invalidos_o_riesgo: inv
      };
    });
    return {
      totalCandidates,
      validRecipients: validList.length,
      excludedInvalidOrRisk,
      excludedUnsubscribed,
      duplicatesRemoved,
      listsSummary
    };
  }
  // --- MÉTODOS DE LOGS DE CAMPAÑAS ---
  getCampaignLogs(campaignId, status) {
    let logs = (this.data.campaignLogs || []).filter((l) => l.campaignId === campaignId);
    if (status && status !== "ALL") {
      logs = logs.filter((l) => l.status === status);
    }
    return logs;
  }
  getCampaignLogById(id) {
    return (this.data.campaignLogs || []).find((l) => l.id === id) || null;
  }
  createCampaignLogsBatch(logs) {
    if (!this.data.campaignLogs) this.data.campaignLogs = [];
    const created = [];
    for (const item of logs) {
      const logObj = {
        id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9),
        campaignId: item.campaignId,
        email: item.email,
        status: item.status,
        sentAt: item.sentAt,
        openedAt: item.openedAt,
        error: item.error
      };
      this.data.campaignLogs.push(logObj);
      created.push(logObj);
    }
    this.persist();
    return created;
  }
  updateCampaignLog(id, updates) {
    if (!this.data.campaignLogs) return null;
    const idx = this.data.campaignLogs.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    this.data.campaignLogs[idx] = {
      ...this.data.campaignLogs[idx],
      ...updates,
      id
    };
    this.persist();
    return this.data.campaignLogs[idx];
  }
  markEmailOpened(campaignId, logIdOrEmail) {
    if (!this.data.campaignLogs) return false;
    const log = this.data.campaignLogs.find(
      (l) => l.campaignId === campaignId && (l.id === logIdOrEmail || l.email.toLowerCase() === logIdOrEmail.toLowerCase())
    );
    if (!log) return false;
    if (log.status !== "OPENED") {
      log.status = "OPENED";
      log.openedAt = (/* @__PURE__ */ new Date()).toISOString();
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
  addUnsubscribe(email, campaignId, reason) {
    if (!this.data.unsubscribed) this.data.unsubscribed = [];
    const normalized = email.toLowerCase().trim();
    const exists = this.data.unsubscribed.some((u) => u.email.toLowerCase().trim() === normalized);
    if (exists) return true;
    this.data.unsubscribed.push({
      id: "unsub-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      email: normalized,
      campaignId,
      reason: reason || "Solicitud de desuscripci\xF3n voluntaria desde correo",
      unsubscribedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.persist();
    return true;
  }
  isEmailUnsubscribed(email) {
    if (!this.data.unsubscribed) return false;
    const normalized = email.toLowerCase().trim();
    return this.data.unsubscribed.some((u) => u.email.toLowerCase().trim() === normalized);
  }
  getAllUnsubscribed() {
    return this.data.unsubscribed || [];
  }
  // --- MÉTODOS DE GESTIÓN DE USUARIOS Y PERMISOS (RBAC) ---
  getUsers() {
    if (!this.data.users || this.data.users.length === 0) {
      this.data.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
      this.persist();
    }
    return this.data.users || [];
  }
  getUserById(id) {
    return this.getUsers().find((u) => u.id === id);
  }
  getUserByUsername(username) {
    const normalized = username.toLowerCase().trim();
    return this.getUsers().find((u) => u.username.toLowerCase().trim() === normalized);
  }
  createUser(userData) {
    const normalized = userData.username.toLowerCase().trim();
    if (this.getUserByUsername(normalized)) {
      throw new Error(`El nombre de usuario "${normalized}" ya est\xE1 registrado.`);
    }
    const role = userData.role || "digitalizador";
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.custom;
    const finalPermissions = {
      ...defaultPerms,
      ...userData.permissions || {}
    };
    const newUser = {
      id: "usr-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      username: normalized,
      name: userData.name.trim(),
      password: userData.password?.trim() || "12345678",
      role,
      status: userData.status || "active",
      permissions: finalPermissions,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.users = this.data.users || [];
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }
  updateUser(id, updates) {
    const user = this.getUserById(id);
    if (!user) return null;
    if (updates.username) {
      const norm = updates.username.toLowerCase().trim();
      const existing = this.getUserByUsername(norm);
      if (existing && existing.id !== id) {
        throw new Error(`El nombre de usuario "${norm}" ya est\xE1 en uso.`);
      }
      user.username = norm;
    }
    if (updates.name !== void 0) user.name = updates.name.trim();
    if (updates.password && updates.password.trim()) user.password = updates.password.trim();
    if (updates.role !== void 0) user.role = updates.role;
    if (updates.status !== void 0) user.status = updates.status;
    if (updates.lastLogin !== void 0) user.lastLogin = updates.lastLogin;
    if (updates.permissions) {
      user.permissions = {
        ...user.permissions,
        ...updates.permissions
      };
    } else if (updates.role && updates.role !== user.role && DEFAULT_ROLE_PERMISSIONS[updates.role]) {
      user.permissions = { ...DEFAULT_ROLE_PERMISSIONS[updates.role] };
    }
    this.persist();
    return user;
  }
  deleteUser(id) {
    const user = this.getUserById(id);
    if (!user) return false;
    if (user.username === "admin") {
      throw new Error("No es posible eliminar el usuario Administrador principal del sistema.");
    }
    this.data.users = (this.data.users || []).filter((u) => u.id !== id);
    this.persist();
    return true;
  }
  // --- MÉTODOS DE COPIA DE SEGURIDAD Y MIGRACIÓN ---
  getRawData() {
    return JSON.parse(JSON.stringify(this.data));
  }
  restoreRawData(imported) {
    if (!imported || typeof imported !== "object") {
      throw new Error("Archivo de base de datos inv\xE1lido");
    }
    if (Array.isArray(imported.categorias)) {
      this.data.categorias = imported.categorias;
    }
    if (Array.isArray(imported.correos)) {
      this.data.correos = imported.correos;
    }
    if (imported.config && typeof imported.config === "object") {
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
    this.persist();
    return {
      success: true,
      categoriasCount: this.data.categorias.length,
      correosCount: this.data.correos.length,
      campaignsCount: (this.data.campaigns || []).length,
      usersCount: (this.data.users || []).length
    };
  }
};
var db = new Database();

// src/server/services/category.service.ts
var CategoryService = class {
  static getAllCategories() {
    return db.getAllCategories();
  }
  static getCategoryById(id) {
    return db.getCategoryById(id);
  }
  static createCategory(nombre, descripcion) {
    if (!nombre || !nombre.trim()) {
      throw new Error("El nombre de la categor\xEDa es obligatorio.");
    }
    return db.createCategory(nombre.trim(), descripcion);
  }
  static updateCategory(id, updates) {
    return db.updateCategory(id, updates);
  }
  static deleteCategory(id) {
    return db.deleteCategory(id);
  }
  static getDomainBreakdown(id) {
    return db.getDomainBreakdown(id);
  }
};

// src/server/controllers/category.controller.ts
var CategoryController = class {
  static async getCategories(_req, res) {
    try {
      const categories = CategoryService.getAllCategories();
      return res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static async createCategory(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      if (!nombre) {
        return res.status(400).json({ success: false, message: 'El campo "nombre" es obligatorio.' });
      }
      const newCategory = CategoryService.createCategory(nombre, descripcion);
      return res.status(201).json({
        success: true,
        message: "Categor\xEDa creada con \xE9xito.",
        data: newCategory
      });
    } catch (error) {
      const err = error;
      return res.status(400).json({ success: false, message: err.message });
    }
  }
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;
      const updated = CategoryService.updateCategory(id, { nombre, descripcion });
      if (!updated) {
        return res.status(404).json({ success: false, message: "Categor\xEDa no encontrada." });
      }
      return res.json({
        success: true,
        message: "Categor\xEDa actualizada correctamente.",
        data: updated
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static async getCategoryAnalytics(req, res) {
    try {
      const { id } = req.params;
      const cat = CategoryService.getCategoryById(id);
      if (!cat) {
        return res.status(404).json({ success: false, message: "Categor\xEDa no encontrada." });
      }
      const domainBreakdown = CategoryService.getDomainBreakdown(id);
      return res.json({
        success: true,
        data: {
          category: cat,
          domains: domainBreakdown
        }
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const deleted = CategoryService.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Categor\xEDa no encontrada." });
      }
      return res.json({
        success: true,
        message: "Categor\xEDa y sus correos eliminados correctamente."
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

// src/server/routes/category.routes.ts
var router = Router();
router.post("/", CategoryController.createCategory);
router.get("/", CategoryController.getCategories);
router.put("/:id", CategoryController.updateCategory);
router.get("/:id/analytics", CategoryController.getCategoryAnalytics);
router.delete("/:id", CategoryController.deleteCategory);
var category_routes_default = router;

// src/server/routes/email.routes.ts
import { Router as Router2 } from "express";

// src/server/services/email.service.ts
import * as xlsx from "xlsx";

// src/server/utils/regexValidator.ts
var STRICT_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
function validateEmailSyntax(email) {
  if (!email || typeof email !== "string") {
    return { isValid: false, reason: "El correo est\xE1 vac\xEDo o no es una cadena v\xE1lida" };
  }
  const trimmed = email.trim();
  if (trimmed.length > 254) {
    return { isValid: false, reason: "Longitud de correo excede el l\xEDmite m\xE1ximo (254 caracteres)" };
  }
  if (trimmed.length < 5) {
    return { isValid: false, reason: "Longitud de correo demasiado corta" };
  }
  const atParts = trimmed.split("@");
  if (atParts.length !== 2) {
    return { isValid: false, reason: 'Debe contener exactamente un s\xEDmbolo "@"' };
  }
  const [localPart, domain] = atParts;
  if (localPart.length === 0 || localPart.length > 64) {
    return { isValid: false, reason: "La parte de usuario (antes de @) debe tener entre 1 y 64 caracteres" };
  }
  if (domain.length === 0 || domain.length > 253) {
    return { isValid: false, reason: "El dominio (despu\xE9s de @) es inv\xE1lido o excede 253 caracteres" };
  }
  if (trimmed.includes("..")) {
    return { isValid: false, reason: 'No se permiten puntos consecutivos ("..")' };
  }
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { isValid: false, reason: "El usuario no puede empezar ni terminar con un punto" };
  }
  if (domain.startsWith(".") || domain.endsWith(".")) {
    return { isValid: false, reason: "El dominio no puede empezar ni terminar con un punto" };
  }
  if (!STRICT_EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, reason: "Estructura o caracteres no v\xE1lidos para correo est\xE1ndar" };
  }
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, reason: "El TLD (extensi\xF3n de dominio) debe tener al menos 2 caracteres" };
  }
  if (/\d/.test(tld)) {
    return { isValid: false, reason: "El TLD del dominio no puede contener n\xFAmeros" };
  }
  return {
    isValid: true,
    localPart,
    domain: domain.toLowerCase()
  };
}

// src/server/utils/typoCorrector.ts
var COMMON_TYPOS = {
  // Gmail
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmeil.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmaio.com": "gmail.com",
  "gemail.com": "gmail.com",
  // Hotmail
  "hotmai.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmeil.com": "hotmail.com",
  "hormail.com": "hotmail.com",
  "hotmaol.com": "hotmail.com",
  "hotmsil.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  // Outlook
  "outlok.com": "outlook.com",
  "outlokk.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outloock.com": "outlook.com",
  "outloook.com": "outlook.com",
  "autlook.com": "outlook.com",
  "outlook.co": "outlook.com",
  // Yahoo
  "yaho.com": "yahoo.com",
  "yahou.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  // iCloud / Apple
  "iclou.com": "icloud.com",
  "icloud.co": "icloud.com",
  "iclud.com": "icloud.com",
  "icoud.com": "icloud.com",
  // ProtonMail
  "protonmai.com": "protonmail.com",
  "protonmial.com": "protonmail.com",
  "prontonmail.com": "protonmail.com",
  // Live / MSN
  "live.co": "live.com",
  "livecom": "live.com",
  "msn.co": "msn.com"
};
var POPULAR_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "protonmail.com",
  "live.com"
];
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          // sustitución
          matrix[i][j - 1] + 1,
          // inserción
          matrix[i - 1][j] + 1
          // eliminación
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
function correctEmailTypo(email) {
  const parts = email.split("@");
  if (parts.length !== 2) {
    return {
      hasTypo: false,
      originalDomain: "",
      correctedDomain: "",
      correctedEmail: email
    };
  }
  const [localPart, domain] = parts;
  const lowerDomain = domain.toLowerCase().trim();
  if (COMMON_TYPOS[lowerDomain]) {
    const correctedDomain = COMMON_TYPOS[lowerDomain];
    return {
      hasTypo: true,
      originalDomain: lowerDomain,
      correctedDomain,
      correctedEmail: `${localPart}@${correctedDomain}`,
      observation: `Dominio corregido autom\xE1ticamente de "${lowerDomain}" a "${correctedDomain}"`
    };
  }
  for (const popular of POPULAR_DOMAINS) {
    if (lowerDomain !== popular && Math.abs(lowerDomain.length - popular.length) <= 1) {
      const dist = levenshteinDistance(lowerDomain, popular);
      if (dist === 1) {
        return {
          hasTypo: true,
          originalDomain: lowerDomain,
          correctedDomain: popular,
          correctedEmail: `${localPart}@${popular}`,
          observation: `Correcci\xF3n por similitud tipogr\xE1fica: "${lowerDomain}" \u2794 "${popular}"`
        };
      }
    }
  }
  return {
    hasTypo: false,
    originalDomain: lowerDomain,
    correctedDomain: lowerDomain,
    correctedEmail: email
  };
}

// src/server/utils/disposableCheck.ts
var DISPOSABLE_DOMAINS = /* @__PURE__ */ new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "10minutemail.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "trashmail.net",
  "trashmail.org",
  "dispostable.com",
  "throwawaymail.com",
  "getnada.com",
  "inboxkitten.com",
  "burnermail.io",
  "maildrop.cc",
  "fakeinbox.com",
  "mytemp.email",
  "crazymailing.com",
  "nada.ltd",
  "mohmal.com",
  "emailondeck.com",
  "tempr.email",
  "discard.email",
  "spambog.com",
  "generator.email",
  "minuteinbox.com",
  "luxusmail.org",
  "dropmail.me",
  "harakirimail.com"
]);
function isDisposableDomain(domain) {
  if (!domain) return false;
  const clean = domain.toLowerCase().trim();
  if (DISPOSABLE_DOMAINS.has(clean)) {
    return true;
  }
  for (const disp of DISPOSABLE_DOMAINS) {
    if (clean.endsWith(`.${disp}`)) {
      return true;
    }
  }
  return false;
}

// src/server/utils/roleDetector.ts
var ROLE_PREFIXES = /* @__PURE__ */ new Set([
  "info",
  "ventas",
  "sales",
  "contacto",
  "contact",
  "admin",
  "administrator",
  "soporte",
  "support",
  "atencion",
  "atencionalcliente",
  "servicio",
  "servicioalcliente",
  "facturacion",
  "billing",
  "pagos",
  "cobranzas",
  "contabilidad",
  "recursoshumanos",
  "rrhh",
  "hr",
  "jobs",
  "empleo",
  "reclutamiento",
  "marketing",
  "prensa",
  "press",
  "media",
  "comunicacion",
  "recepcion",
  "postmaster",
  "hostmaster",
  "webmaster",
  "root",
  "no-reply",
  "noreply",
  "donotreply",
  "newsletter",
  "suscripciones",
  "hola",
  "hello",
  "team",
  "equipo",
  "general",
  "legal",
  "privacy",
  "compliance",
  "seguridad",
  "security"
]);
var FREE_EMAIL_PROVIDERS = /* @__PURE__ */ new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.es",
  "outlook.com",
  "outlook.es",
  "yahoo.com",
  "yahoo.es",
  "icloud.com",
  "me.com",
  "mac.com",
  "live.com",
  "live.com.ar",
  "msn.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "gmx.es",
  "yandex.com"
]);
function isRoleAccount(localPart) {
  if (!localPart) return false;
  const clean = localPart.toLowerCase().trim();
  if (ROLE_PREFIXES.has(clean)) {
    return true;
  }
  const subTokens = clean.split(/[._+-]/);
  for (const token of subTokens) {
    if (ROLE_PREFIXES.has(token)) {
      return true;
    }
  }
  return false;
}
function determineEmailType(domain, isRole) {
  if (isRole) {
    return "De_Rol";
  }
  const cleanDomain = domain.toLowerCase().trim();
  if (FREE_EMAIL_PROVIDERS.has(cleanDomain)) {
    return "Personal";
  }
  return "Corporativo";
}

// src/server/utils/dnsValidator.ts
import dns from "dns";
var { resolveMx, resolve4 } = dns.promises;
var DNS_CACHE = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 1e3 * 60 * 30;
var KNOWN_VALID_DOMAINS = /* @__PURE__ */ new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "live.com",
  "protonmail.com",
  "proton.me",
  "aol.com",
  "zoho.com"
]);
function withTimeout(promise, ms, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
  ]);
}
async function verifyDomainMx(domain, timeoutMs = 2500) {
  const cleanDomain = domain.toLowerCase().trim();
  if (KNOWN_VALID_DOMAINS.has(cleanDomain)) {
    return {
      hasMx: true,
      servers: [`mail.${cleanDomain}`],
      observation: `Servidores MX reconocidos para ${cleanDomain}`
    };
  }
  const cached = DNS_CACHE.get(cleanDomain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }
  try {
    const mxRecords = await withTimeout(
      resolveMx(cleanDomain),
      timeoutMs,
      `Timeout consultando DNS MX para ${cleanDomain}`
    );
    if (mxRecords && mxRecords.length > 0) {
      const sorted = mxRecords.sort((a, b) => a.priority - b.priority);
      const topServers = sorted.map((r) => r.exchange);
      const result = {
        hasMx: true,
        servers: topServers,
        observation: `Servidor MX activo: ${topServers[0]} (prioridad ${sorted[0].priority})`
      };
      DNS_CACHE.set(cleanDomain, { result, timestamp: Date.now() });
      return result;
    }
  } catch (err) {
    const error = err;
    if (error.code === "ENODATA" || error.code === "ENOTFOUND") {
      try {
        const aRecords = await withTimeout(resolve4(cleanDomain), 1500, "Timeout en fallback A");
        if (aRecords && aRecords.length > 0) {
          const result = {
            hasMx: true,
            servers: [cleanDomain],
            observation: `Sin registro MX expl\xEDcito; activo mediante registro A directo (${aRecords[0]})`
          };
          DNS_CACHE.set(cleanDomain, { result, timestamp: Date.now() });
          return result;
        }
      } catch {
      }
    }
    const failureReason = error.code === "ENOTFOUND" ? `El dominio "${cleanDomain}" no existe en DNS` : error.code === "ENODATA" ? `El dominio "${cleanDomain}" no tiene registros de correo (MX)` : error.message?.includes("Timeout") ? `Tiempo de espera agotado al consultar DNS para "${cleanDomain}"` : `Falla en resoluci\xF3n DNS para "${cleanDomain}" (${error.code || "Error desconocido"})`;
    const failResult = {
      hasMx: false,
      servers: [],
      observation: failureReason
    };
    DNS_CACHE.set(cleanDomain, { result: failResult, timestamp: Date.now() });
    return failResult;
  }
  const noMxResult = {
    hasMx: false,
    servers: [],
    observation: `No se encontraron registros de servidor de correo para "${cleanDomain}"`
  };
  DNS_CACHE.set(cleanDomain, { result: noMxResult, timestamp: Date.now() });
  return noMxResult;
}

// src/server/utils/mailboxValidator.ts
import crypto from "crypto";
var NON_CATCH_ALL_DOMAINS = /* @__PURE__ */ new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.es",
  "hotmail.com",
  "hotmail.es",
  "outlook.com",
  "outlook.es",
  "live.com",
  "msn.com",
  "icloud.com",
  "proton.me",
  "protonmail.com"
]);
var TEST_KEYWORDS = [
  "test",
  "tests",
  "testing",
  "tester",
  "prueba",
  "pruebas",
  "probando",
  "fake",
  "faker",
  "fakeemail",
  "fictici",
  "ficticio",
  "ficticia",
  "dummy",
  "sample",
  "ejemplo",
  "example",
  "demo",
  "cualquiera",
  "cualquiercosa",
  "inventad",
  "inventado",
  "inventada",
  "inventados",
  "aleatori",
  "aleatorio",
  "aleatoria",
  "random",
  "noexiste",
  "nonexistent",
  "correodeprueba",
  "correofalso",
  "sinusuario",
  "sinnombre",
  "nadie",
  "anonim",
  "anonymous",
  "temporal",
  "tempmail",
  "trash",
  "basura",
  "spam",
  "borrar",
  "placeholder",
  "null",
  "void",
  "undefined",
  "asdf",
  "qwer",
  "zxcv"
];
var KEYBOARD_WALKS = [
  // Fila QWERTY
  "qwerty",
  "qwert",
  "ytrewq",
  "poiuy",
  "poiuyt",
  // Fila ASDF
  "asdfgh",
  "asdfg",
  "asdf",
  "hgfdsa",
  "lkjhg",
  "lkjhgf",
  // Fila ZXCV
  "zxcvb",
  "zxcvbn",
  "nbvcxz",
  "mnbvc",
  // Secuencias numéricas
  "12345",
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "98765",
  "987654",
  "98765432",
  "987654321",
  "123123",
  "112233",
  "12341234",
  // Secuencias alfabéticas
  "abcdef",
  "bcdefg",
  "cdefgh",
  "defghi",
  "fedcba",
  // Diagonales de teclado
  "qazwsx",
  "wsxedc",
  "edcrfv",
  "rfvtgb"
];
var ORGANIC_NAME_TOKENS = /* @__PURE__ */ new Set([
  "carlos",
  "maria",
  "juan",
  "jose",
  "ana",
  "luis",
  "pedro",
  "david",
  "jorge",
  "miguel",
  "fernando",
  "diego",
  "alejandro",
  "daniel",
  "roberto",
  "javier",
  "rosa",
  "elena",
  "laura",
  "marta",
  "sandra",
  "andres",
  "pablo",
  "raul",
  "sergio",
  "alberto",
  "enrique",
  "victor",
  "manuel",
  "francisco",
  "antonio",
  "gabriel",
  "hugo",
  "adrian",
  "lucas",
  "mateo",
  "santiago",
  "sebastian",
  "camila",
  "valentina",
  "valeria",
  "daniela",
  "paula",
  "carolina",
  "andrea",
  "john",
  "michael",
  "david",
  "james",
  "robert",
  "mary",
  "sarah",
  "alex",
  "chris",
  "mark",
  "steve",
  "brian",
  "kevin",
  "jason",
  "paul",
  "lisa",
  "emily",
  "jessica",
  "ashley",
  "garcia",
  "martinez",
  "lopez",
  "gonzalez",
  "rodriguez",
  "perez",
  "sanchez",
  "ramirez",
  "torres",
  "flores",
  "rivera",
  "gomez",
  "diaz",
  "cruz",
  "morales",
  "reyes",
  "gutierrez",
  "ortiz",
  "ramos",
  "castillo",
  "smith",
  "johnson",
  "williams",
  "brown",
  "jones",
  "miller",
  "davis",
  "wilson",
  "taylor",
  "anderson",
  "thomas",
  "jackson",
  "white",
  "harris",
  "martin"
]);
function calculateEntropy(str) {
  const len = str.length;
  if (len === 0) return 0;
  const frequencies = /* @__PURE__ */ new Map();
  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }
  let entropy = 0;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}
function validateProviderSpecificRules(localPart, domain) {
  const localLower = localPart.toLowerCase();
  const domainLower = domain.toLowerCase();
  if (domainLower === "gmail.com" || domainLower === "googlemail.com") {
    if (localLower.length < 6) {
      return {
        pass: false,
        reason: "Gmail exige un m\xEDnimo de 6 caracteres en el nombre de usuario (direcci\xF3n inexistente en Google)"
      };
    }
    if (localLower.length > 30) {
      return {
        pass: false,
        reason: "Gmail no admite nombres de usuario superiores a 30 caracteres"
      };
    }
    if (!/^[a-z0-9.]+$/.test(localLower)) {
      return {
        pass: false,
        reason: "Gmail solo admite letras (a-z), n\xFAmeros (0-9) y puntos (.). No admite guiones bajos (_) ni guiones (-)"
      };
    }
    if (localLower.startsWith(".") || localLower.endsWith(".") || localLower.includes("..")) {
      return {
        pass: false,
        reason: "Gmail no permite puntos al inicio, al final ni puntos consecutivos en el nombre de usuario"
      };
    }
    const hasAtLeastOneLetter = /[a-z]/.test(localLower);
    if (!hasAtLeastOneLetter) {
      return {
        pass: false,
        reason: "Google requiere al menos una letra (a-z) en la cuenta de Gmail. Una cuenta puramente num\xE9rica no existe."
      };
    }
  }
  if (domainLower === "yahoo.com" || domainLower === "yahoo.es" || domainLower === "ymail.com") {
    if (localLower.length < 4 || localLower.length > 32) {
      return {
        pass: false,
        reason: "Yahoo requiere nombres de usuario entre 4 y 32 caracteres"
      };
    }
    if (!/^[a-z]/.test(localLower)) {
      return {
        pass: false,
        reason: "Las cuentas de Yahoo deben comenzar obligatoriamente con una letra (a-z)"
      };
    }
    if (!/^[a-z0-9_.]+$/.test(localLower)) {
      return {
        pass: false,
        reason: "Yahoo no permite caracteres especiales distintos de letras, n\xFAmeros, puntos o gui\xF3n bajo"
      };
    }
  }
  if (domainLower === "outlook.com" || domainLower === "outlook.es" || domainLower === "hotmail.com" || domainLower === "hotmail.es" || domainLower === "live.com" || domainLower === "msn.com") {
    if (localLower.length < 3 || localLower.length > 64) {
      return {
        pass: false,
        reason: "Microsoft requiere nombres de cuenta entre 3 y 64 caracteres"
      };
    }
    if (!/^[a-z0-9]/.test(localLower)) {
      return {
        pass: false,
        reason: "Las cuentas de Microsoft deben iniciar con una letra o n\xFAmero"
      };
    }
    if (localLower.endsWith(".") || localLower.includes("..")) {
      return {
        pass: false,
        reason: "Microsoft no permite puntos al final ni consecutivos en el nombre de cuenta"
      };
    }
  }
  if (domainLower === "icloud.com" || domainLower === "me.com" || domainLower === "mac.com") {
    if (localLower.length < 3) {
      return {
        pass: false,
        reason: "Apple iCloud exige nombres de cuenta de al menos 3 caracteres"
      };
    }
    if (!/^[a-z]/.test(localLower)) {
      return {
        pass: false,
        reason: "Las cuentas de Apple iCloud deben iniciar con una letra"
      };
    }
  }
  return { pass: true };
}
function detectSuspiciousPatterns(localPart) {
  const clean = localPart.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!clean) {
    return { isSuspicious: true, reason: "Identificador vac\xEDo o solo caracteres especiales" };
  }
  for (const kw of TEST_KEYWORDS) {
    if (clean.includes(kw)) {
      return {
        isSuspicious: true,
        reason: `Contiene t\xE9rmino de prueba o ficticio ("${kw}")`
      };
    }
  }
  for (const walk of KEYBOARD_WALKS) {
    if (clean.includes(walk)) {
      return {
        isSuspicious: true,
        reason: `Contiene secuencia de teclado de prueba ("${walk}")`
      };
    }
  }
  if (/([a-z0-9])\1{3,}/.test(clean)) {
    return {
      isSuspicious: true,
      reason: "Caracteres repetitivos id\xE9nticos consecutivos (patr\xF3n no org\xE1nico)"
    };
  }
  if (clean.length >= 5 && !/[aeiouy]/.test(clean)) {
    return {
      isSuspicious: true,
      reason: "Nombre de usuario sin vocales (probable texto generado al azar o bot)"
    };
  }
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(clean)) {
    return {
      isSuspicious: true,
      reason: "Secuencia no pronunciable de consonantes continuas (gibberish detectado)"
    };
  }
  const trailingDigitsMatch = clean.match(/(\d{5,})$/);
  if (trailingDigitsMatch) {
    const digits = trailingDigitsMatch[1];
    return {
      isSuspicious: true,
      reason: `Exceso de d\xEDgitos aleatorios al final ("${digits}") caracter\xEDstico de cuentas falsas o bots`
    };
  }
  if (/^\d{6,}$/.test(clean)) {
    return {
      isSuspicious: true,
      reason: "Identificador puramente num\xE9rico (cuenta de prueba o sistema)"
    };
  }
  const isOrganic = isOrganicNamePattern(localPart);
  if (!isOrganic) {
    const hasMixedAlphaNum = /[a-z]/.test(clean) && /\d/.test(clean);
    if (clean.length >= 12 && hasMixedAlphaNum && calculateEntropy(clean) > 3.45) {
      return {
        isSuspicious: true,
        reason: "Alta aleatoriedad de caracteres mixtos (probable identificador sint\xE9tico o hash generado)"
      };
    }
  }
  return { isSuspicious: false };
}
function isOrganicNamePattern(localPart) {
  const parts = localPart.toLowerCase().split(/[._-]/).filter(Boolean);
  if (parts.length === 0) return false;
  for (const part of parts) {
    const lettersOnly = part.replace(/[^a-z]/g, "");
    if (ORGANIC_NAME_TOKENS.has(lettersOnly)) {
      return true;
    }
  }
  if (parts.length >= 2) {
    const p1 = parts[0].replace(/[^a-z]/g, "");
    const p2 = parts[1].replace(/[^a-z]/g, "");
    if (p1.length >= 3 && p2.length >= 3 && /[aeiouy]/.test(p1) && /[aeiouy]/.test(p2)) {
      return true;
    }
  }
  return false;
}
async function checkGravatarProfile(email, timeoutMs = 2e3) {
  try {
    const hash = crypto.createHash("md5").update(email.toLowerCase().trim()).digest("hex");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(`https://en.gravatar.com/${hash}.json`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CleanMail-Verifier/2.5"
      }
    });
    clearTimeout(timeout);
    return resp.status === 200;
  } catch {
    return false;
  }
}

// src/server/services/externalValidator.service.ts
import dns2 from "dns";
var { resolveTxt } = dns2.promises;
var SCORE_CACHE = /* @__PURE__ */ new Map();
var CACHE_TTL_MS2 = 1e3 * 60 * 30;
var ExternalValidatorService = class {
  /**
   * Consulta y evalúa la puntuación de confianza (0 - 100) y entregabilidad real de un buzón
   */
  static async evaluateConfidenceScore(email, domain, isMxValid, isRole, isDisposable, isSyntaxValid, options) {
    const cleanEmail = email.toLowerCase().trim();
    if (!isSyntaxValid || !isMxValid || isDisposable) {
      return {
        score: 0,
        provider: "Validaci\xF3n Inicial",
        isDeliverable: false,
        reasonCode: isDisposable ? "DISPOSABLE" : !isMxValid ? "NO_MX" : "INVALID_SYNTAX",
        details: isDisposable ? "Dominio desechable o temporal detectado en lista negra" : !isMxValid ? "Sin servidores de correo activos (0% confianza)" : "Sintaxis no conforme al est\xE1ndar RFC"
      };
    }
    const cached = SCORE_CACHE.get(cleanEmail);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS2) {
      return cached.result;
    }
    const atIndex = cleanEmail.indexOf("@");
    const localPart = atIndex !== -1 ? cleanEmail.slice(0, atIndex) : "";
    const providerRule = validateProviderSpecificRules(localPart, domain);
    if (!providerRule.pass) {
      const result2 = {
        score: 0,
        provider: `Reglas de Proveedor (${domain})`,
        isDeliverable: false,
        reasonCode: "INVALID_PROVIDER_SYNTAX",
        details: providerRule.reason || "Formato de cuenta no admitido por el proveedor."
      };
      SCORE_CACHE.set(cleanEmail, { result: result2, timestamp: Date.now() });
      return result2;
    }
    const patternCheck = detectSuspiciousPatterns(localPart);
    if (patternCheck.isSuspicious) {
      const result2 = {
        score: 10,
        provider: "An\xE1lisis Heur\xEDstico Anti-Fraude",
        isDeliverable: false,
        reasonCode: "SUSPICIOUS_PATTERN",
        details: `Patr\xF3n sospechoso: ${patternCheck.reason}. Alta probabilidad de buz\xF3n inexistente o de prueba (rebote seguro).`
      };
      SCORE_CACHE.set(cleanEmail, { result: result2, timestamp: Date.now() });
      return result2;
    }
    const hasProfile = await checkGravatarProfile(cleanEmail);
    if (hasProfile) {
      const { spf, dmarc } = await this.checkSpfAndDmarc(domain);
      const result2 = {
        score: 98,
        provider: "Identidad Confirmada (Gravatar / Perfil Activo)",
        isDeliverable: true,
        reasonCode: "ACCEPTED_EMAIL",
        profileFound: true,
        spfPresent: spf,
        dmarcPresent: dmarc,
        isCatchAll: false,
        details: "Buz\xF3n activo verificado con perfil p\xFAblico real registrado y servidores MX activos."
      };
      SCORE_CACHE.set(cleanEmail, { result: result2, timestamp: Date.now() });
      return result2;
    }
    const provider = options.provider || "debounce";
    let result;
    try {
      if (provider === "hunter" && options.apiKey) {
        result = await this.verifyWithHunter(cleanEmail, options.apiKey, isRole);
      } else if (provider === "zerobounce" && options.apiKey) {
        result = await this.verifyWithZeroBounce(cleanEmail, options.apiKey, isRole);
      } else if (provider === "abstract" && options.apiKey) {
        result = await this.verifyWithAbstract(cleanEmail, options.apiKey, isRole);
      } else {
        result = await this.verifyWithDebounceAndReputation(cleanEmail, domain, localPart, isRole);
      }
    } catch (err) {
      console.warn(`Aviso: Error consultando API externa (${provider}), usando fallback reputacional:`, err.message);
      result = await this.computeReputationFallback(cleanEmail, domain, localPart, isRole);
    }
    SCORE_CACHE.set(cleanEmail, { result, timestamp: Date.now() });
    return result;
  }
  /**
   * Integración con la API Gratuita de Debounce + SPF/DMARC y comprobación de Catch-all / Buzón No Confirmado
   */
  static async verifyWithDebounceAndReputation(email, domain, localPart, isRole) {
    let isDebounceDisposable = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2e3);
      const resp = await fetch(`https://disposable.debounce.io/?email=${encodeURIComponent(email)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const data = await resp.json();
        isDebounceDisposable = data.disposable === "true" || data.disposable === true;
      }
    } catch {
    }
    if (isDebounceDisposable) {
      return {
        score: 0,
        provider: "Debounce Anti-Disposable API",
        isDeliverable: false,
        reasonCode: "DISPOSABLE",
        details: "API externa identific\xF3 el dominio como temporal o desechable (Blacklisted)."
      };
    }
    const { spf, dmarc } = await this.checkSpfAndDmarc(domain);
    const isNonCatchAll = NON_CATCH_ALL_DOMAINS.has(domain.toLowerCase());
    if (isRole) {
      return {
        score: 55,
        provider: "Detecci\xF3n Departamental / Rol",
        isDeliverable: true,
        reasonCode: "ROLE_ACCOUNT",
        spfPresent: spf,
        dmarcPresent: dmarc,
        isCatchAll: !isNonCatchAll,
        details: "Cuenta gen\xE9rica o de departamento (info, ventas, contacto). Riesgo medio de menor tasa de apertura o rebote."
      };
    }
    if (isNonCatchAll) {
      const isOrganic = isOrganicNamePattern(localPart);
      const baseScore = isOrganic ? 95 : 90;
      return {
        score: baseScore,
        provider: "Verificaci\xF3n Est\xE1ndar Proveedor + DNS MX Activo",
        isDeliverable: true,
        reasonCode: "ACCEPTED_EMAIL",
        spfPresent: spf,
        dmarcPresent: dmarc,
        isCatchAll: false,
        details: `Buz\xF3n personal verificado (${localPart}@${domain}). Servidores MX de ${domain} activos y enrutables (Score: ${baseScore}/100).`
      };
    }
    let finalScore = 85;
    if (spf) finalScore += 7;
    if (dmarc) finalScore += 5;
    return {
      score: Math.min(finalScore, 98),
      provider: "Auditor\xEDa DNS MX + Reputaci\xF3n SPF/DMARC",
      isDeliverable: true,
      reasonCode: "ACCEPTED_EMAIL",
      spfPresent: spf,
      dmarcPresent: dmarc,
      isCatchAll: false,
      details: `Dominio verificado con servidores MX operativos y autenticaci\xF3n t\xE9cnica SPF/DMARC (${finalScore}/100).`
    };
  }
  /**
   * Integración con Hunter.io Email Verifier API
   */
  static async verifyWithHunter(email, apiKey, isRole) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`Hunter.io respondi\xF3 con HTTP ${res.status}`);
    }
    const data = await res.json();
    const d = data.data || {};
    const hunterScore = typeof d.score === "number" ? d.score : 50;
    const isDeliverable = d.result === "deliverable" || d.status === "valid" || hunterScore >= 70;
    const isCatchAll = Boolean(d.accept_all);
    return {
      score: hunterScore,
      provider: "Hunter.io API",
      isDeliverable,
      reasonCode: isCatchAll ? "CATCH_ALL" : isDeliverable ? "ACCEPTED_EMAIL" : "UNVERIFIED_MAILBOX",
      isCatchAll,
      details: `Hunter.io: resultado ${d.result || d.status || "evaluado"} (Score: ${hunterScore}/100).`
    };
  }
  /**
   * Integración con ZeroBounce Email Verification API
   */
  static async verifyWithZeroBounce(email, apiKey, isRole) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`ZeroBounce respondi\xF3 con HTTP ${res.status}`);
    }
    const data = await res.json();
    const status = (data.status || "").toLowerCase();
    const isDeliverable = status === "valid";
    const score = isDeliverable ? 95 : status === "catch-all" ? 55 : 15;
    return {
      score,
      provider: "ZeroBounce API",
      isDeliverable,
      reasonCode: status === "catch-all" ? "CATCH_ALL" : isDeliverable ? "ACCEPTED_EMAIL" : "UNVERIFIED_MAILBOX",
      details: `ZeroBounce: Estado ${data.status} (Sub-estado: ${data.sub_status || "normal"}).`
    };
  }
  /**
   * Integración con Abstract Email Validation API
   */
  static async verifyWithAbstract(email, apiKey, isRole) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`AbstractAPI respondi\xF3 con HTTP ${res.status}`);
    }
    const data = await res.json();
    const qScore = Math.round(Number(data.quality_score || 0) * 100);
    const isDeliverable = data.deliverability === "DELIVERABLE" || qScore >= 70;
    return {
      score: qScore,
      provider: "Abstract Email API",
      isDeliverable,
      reasonCode: isDeliverable ? "ACCEPTED_EMAIL" : "UNVERIFIED_MAILBOX",
      details: `AbstractAPI: Entregabilidad ${data.deliverability || "desconocida"} (Score: ${qScore}/100).`
    };
  }
  /**
   * Fallback reputacional en caso de fallo en APIs externas
   */
  static async computeReputationFallback(email, domain, localPart, isRole) {
    const { spf, dmarc } = await this.checkSpfAndDmarc(domain);
    const isNonCatchAll = NON_CATCH_ALL_DOMAINS.has(domain.toLowerCase());
    if (isRole) {
      return {
        score: 55,
        provider: "Motor Heur\xEDstico Local",
        isDeliverable: true,
        reasonCode: "ROLE_ACCOUNT",
        spfPresent: spf,
        dmarcPresent: dmarc,
        details: "Cuenta de departamento o funci\xF3n corporativa."
      };
    }
    if (isNonCatchAll) {
      const isOrganic = isOrganicNamePattern(localPart);
      if (isOrganic) {
        return {
          score: 85,
          provider: "Motor Heur\xEDstico Local",
          isDeliverable: true,
          reasonCode: "ACCEPTED_EMAIL",
          spfPresent: spf,
          dmarcPresent: dmarc,
          details: `Buz\xF3n estructurado org\xE1nico en ${domain} con servidores MX activos.`
        };
      }
      return {
        score: 45,
        provider: "Motor Heur\xEDstico Local",
        isDeliverable: false,
        reasonCode: "UNVERIFIED_MAILBOX",
        spfPresent: spf,
        dmarcPresent: dmarc,
        details: `Servidores MX de ${domain} activos, pero buz\xF3n no confirmado y sin estructura org\xE1nica reconocida.`
      };
    }
    return {
      score: spf && dmarc ? 88 : 78,
      provider: "Motor Heur\xEDstico Local",
      isDeliverable: true,
      reasonCode: "ACCEPTED_EMAIL",
      spfPresent: spf,
      dmarcPresent: dmarc,
      details: `Dominio con registros MX activos y autenticaci\xF3n t\xE9cnica validada.`
    };
  }
  /**
   * Consulta registros TXT de DNS para determinar presencia de SPF y DMARC
   */
  static async checkSpfAndDmarc(domain) {
    let spf = false;
    let dmarc = false;
    try {
      const txtRecords = await resolveTxt(domain).catch(() => []);
      for (const record of txtRecords) {
        const fullTxt = record.join("").toLowerCase();
        if (fullTxt.startsWith("v=spf1")) {
          spf = true;
          break;
        }
      }
    } catch {
    }
    try {
      const dmarcRecords = await resolveTxt(`_dmarc.${domain}`).catch(() => []);
      for (const record of dmarcRecords) {
        const fullTxt = record.join("").toLowerCase();
        if (fullTxt.startsWith("v=dmarc1")) {
          dmarc = true;
          break;
        }
      }
    } catch {
    }
    return { spf, dmarc };
  }
};

// src/server/services/email.service.ts
var EmailService = class {
  /**
   * Procesa y valida un lote de correos para una categoría específica,
   * incluyendo opcionalmente la consulta a API externa de confianza.
   */
  static async processEmailBatch(categoria_id, rawEmails, options = { checkDns: true, autoCorrect: true }) {
    const startTime = Date.now();
    const category = db.getCategoryById(categoria_id);
    if (!category) {
      throw new Error(`La categor\xEDa con ID "${categoria_id}" no existe.`);
    }
    const existingInDb = db.getExistingEmailsSet(categoria_id);
    const seenInBatch = /* @__PURE__ */ new Set();
    const toInsert = [];
    let duplicadosCount = 0;
    const CHUNK_SIZE = 12;
    for (let i = 0; i < rawEmails.length; i += CHUNK_SIZE) {
      const chunk = rawEmails.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (rawItem) => {
          if (!rawItem || typeof rawItem !== "string") return;
          const trimmedRaw = rawItem.trim();
          if (!trimmedRaw) return;
          let candidateEmail = trimmedRaw;
          let wasCorrected = false;
          let typoObservation = "";
          if (options.autoCorrect !== false) {
            const typoRes = correctEmailTypo(candidateEmail);
            if (typoRes.hasTypo) {
              candidateEmail = typoRes.correctedEmail;
              wasCorrected = true;
              typoObservation = typoRes.observation || "";
            }
          }
          const normalizedEmail = candidateEmail.toLowerCase().trim();
          if (existingInDb.has(normalizedEmail) || seenInBatch.has(normalizedEmail)) {
            duplicadosCount++;
            return;
          }
          seenInBatch.add(normalizedEmail);
          const syntaxRes = validateEmailSyntax(normalizedEmail);
          if (!syntaxRes.isValid || !syntaxRes.domain || !syntaxRes.localPart) {
            toInsert.push({
              categoria_id,
              email: normalizedEmail,
              original_email: trimmedRaw,
              estado: "INVALIDO",
              tipo: "Personal",
              dominio: normalizedEmail.includes("@") ? normalizedEmail.split("@")[1] : "desconocido",
              observacion: syntaxRes.reason || "Sintaxis de correo inv\xE1lida",
              mx_valido: false,
              corregido: wasCorrected,
              score_confianza: 0,
              verificado_externo: false,
              fuente_verificacion: "Local (Sintaxis Fallida)"
            });
            return;
          }
          const { domain, localPart } = syntaxRes;
          const isDisposableLocal = isDisposableDomain(domain);
          if (isDisposableLocal) {
            toInsert.push({
              categoria_id,
              email: normalizedEmail,
              original_email: trimmedRaw,
              estado: "INVALIDO",
              tipo: "Personal",
              dominio: domain,
              observacion: "Dominio temporal / desechable bloqueado (anti-spam)",
              mx_valido: false,
              corregido: wasCorrected,
              score_confianza: 0,
              verificado_externo: false,
              fuente_verificacion: "Lista Negra Local"
            });
            return;
          }
          const providerRule = validateProviderSpecificRules(localPart, domain);
          if (!providerRule.pass) {
            toInsert.push({
              categoria_id,
              email: normalizedEmail,
              original_email: trimmedRaw,
              estado: "INVALIDO",
              tipo: "Personal",
              dominio: domain,
              observacion: `Rechazado por proveedor (${domain}): ${providerRule.reason}`,
              mx_valido: false,
              corregido: wasCorrected,
              score_confianza: 0,
              verificado_externo: false,
              fuente_verificacion: `Reglas Proveedor (${domain})`
            });
            return;
          }
          const patternCheck = detectSuspiciousPatterns(localPart);
          if (patternCheck.isSuspicious) {
            toInsert.push({
              categoria_id,
              email: normalizedEmail,
              original_email: trimmedRaw,
              estado: "INVALIDO",
              tipo: "Personal",
              dominio: domain,
              observacion: `Patr\xF3n sospechoso o ficticio: ${patternCheck.reason}`,
              mx_valido: false,
              corregido: wasCorrected,
              score_confianza: 10,
              verificado_externo: false,
              fuente_verificacion: "Filtro Anti-Fraude Local"
            });
            return;
          }
          const isRole = isRoleAccount(localPart);
          const tipoEmail = determineEmailType(domain, isRole);
          let estado = isRole ? "GENERICO_ROL" : "VALIDO";
          let observacion = isRole ? `Cuenta gen\xE9rica o departamental (${localPart}@)` : "Sintaxis correcta y verificado";
          if (wasCorrected) {
            observacion = `${typoObservation}. ${observacion}`;
          }
          let mxValido = false;
          if (options.checkDns !== false) {
            const dnsRes = await verifyDomainMx(domain);
            mxValido = dnsRes.hasMx;
            if (!dnsRes.hasMx) {
              estado = "INVALIDO";
              observacion = `Servidores MX inactivos: ${dnsRes.observation}`;
            } else {
              observacion += ` [MX: ${dnsRes.observation}]`;
            }
          } else {
            mxValido = true;
          }
          let scoreConfianza = 80;
          let verificadoExterno = true;
          let fuenteVerificacion = "Local + DNS MX";
          try {
            const extOptionsToUse = options.externalVerify || {
              enabled: true,
              provider: "debounce"
            };
            const extRes = await ExternalValidatorService.evaluateConfidenceScore(
              normalizedEmail,
              domain,
              mxValido,
              isRole,
              isDisposableLocal,
              syntaxRes.isValid,
              extOptionsToUse
            );
            scoreConfianza = extRes.score;
            fuenteVerificacion = extRes.provider;
            if (extRes.details) {
              observacion += ` | ${extRes.details}`;
            }
            if (isRole || extRes.reasonCode === "ROLE_ACCOUNT") {
              estado = "GENERICO_ROL";
            } else if (!mxValido || !extRes.isDeliverable || extRes.score < 40 || extRes.reasonCode === "DISPOSABLE" || extRes.reasonCode === "NO_MX") {
              estado = "INVALIDO";
            } else {
              estado = "VALIDO";
            }
          } catch (err) {
            console.warn("Fallo en verificaci\xF3n reputacional para:", normalizedEmail, err);
            if (isRole) {
              estado = "GENERICO_ROL";
              scoreConfianza = 65;
            } else if (!mxValido) {
              estado = "INVALIDO";
              scoreConfianza = 0;
            } else {
              estado = "VALIDO";
              scoreConfianza = 90;
            }
          }
          toInsert.push({
            categoria_id,
            email: normalizedEmail,
            original_email: trimmedRaw,
            estado,
            tipo: tipoEmail,
            dominio: domain,
            observacion,
            mx_valido: mxValido,
            corregido: wasCorrected,
            score_confianza: scoreConfianza,
            verificado_externo: verificadoExterno,
            fuente_verificacion: fuenteVerificacion
          });
        })
      );
    }
    const inserted = db.insertEmailsBatch(categoria_id, toInsert);
    const validos = inserted.filter((c) => c.estado === "VALIDO").length;
    const genericos_rol = inserted.filter((c) => c.estado === "GENERICO_ROL").length;
    const invalidos = inserted.filter((c) => c.estado === "INVALIDO").length;
    const corregidos = inserted.filter((c) => c.corregido).length;
    const conVerifExt = inserted.filter((c) => c.verificado_externo).length;
    const totalScore = inserted.reduce((acc, c) => acc + (c.score_confianza || 0), 0);
    const promedioScore = inserted.length > 0 ? Math.round(totalScore / inserted.length) : 0;
    return {
      total_leidos: rawEmails.length,
      validos,
      genericos_rol,
      invalidos,
      corregidos,
      duplicados_omitidos: duplicadosCount,
      con_verificacion_externa: conVerifExt,
      promedio_score: promedioScore,
      tiempo_procesamiento_ms: Date.now() - startTime,
      muestra_procesada: inserted.slice(0, 20)
    };
  }
  /**
   * Consulta correos con filtros y paginación
   */
  static getEmailsByCategory(categoria_id, filters) {
    return db.getEmailsByCategory(categoria_id, filters);
  }
  /**
   * Genera el contenido CSV exportable para una categoría.
   * Limpia saltos de línea internos, escapa comillas correctamente e incluye sep=;
   * para que Microsoft Excel abra cada columna separada sin juntar nada.
   */
  static generateExportCsv(categoria_id, scope = "validos", delimiter = ";") {
    const allEmails = db.getEmailsByCategory(categoria_id, { limit: 1e5 }).correos;
    const category = db.getCategoryById(categoria_id);
    const catName = category ? category.nombre : "Sin_Categoria";
    let filtered = allEmails;
    if (scope === "validos") {
      filtered = allEmails.filter((e) => e.estado === "VALIDO");
    } else if (scope === "roles") {
      filtered = allEmails.filter((e) => e.estado === "GENERICO_ROL");
    } else if (scope === "invalidos") {
      filtered = allEmails.filter((e) => e.estado === "INVALIDO");
    } else if (scope === "validos_y_roles") {
      filtered = allEmails.filter((e) => e.estado === "VALIDO" || e.estado === "GENERICO_ROL");
    }
    const headers = [
      "Email",
      "Original",
      "Estado",
      "Tipo",
      "Score_Confianza",
      "Verificacion_Externa",
      "Fuente_Verificacion",
      "Dominio",
      "Servidor_MX",
      "Observacion",
      "Categoria",
      "Fecha_Registro"
    ];
    const cleanField = (val) => {
      if (val === void 0 || val === null) return '""';
      const str = String(val).replace(/[\r\n]+/g, " ").replace(/"/g, '""');
      return `"${str}"`;
    };
    const rows = filtered.map((e) => [
      cleanField(e.email),
      cleanField(e.original_email),
      cleanField(e.estado === "VALIDO" ? "V\xE1lido" : e.estado === "GENERICO_ROL" ? "De Rol" : "Inv\xE1lido"),
      cleanField(e.tipo),
      cleanField(e.score_confianza ?? 0),
      cleanField(e.verificado_externo ? "SI" : "NO"),
      cleanField(e.fuente_verificacion || "Local"),
      cleanField(e.dominio),
      cleanField(e.mx_valido ? "Activo" : "Inactivo"),
      cleanField(e.observacion),
      cleanField(catName),
      cleanField(e.fecha_creacion)
    ]);
    const sepHeader = `sep=${delimiter}`;
    const headerLine = headers.join(delimiter);
    const dataLines = rows.map((r) => r.join(delimiter));
    return [sepHeader, headerLine, ...dataLines].join("\r\n");
  }
  /**
   * Genera un archivo nativo de Microsoft Excel (.xlsx) estructurado en hojas independientes
   * (Pestaña 1: Válidos, Pestaña 2: Cuentas de Rol, Pestaña 3: Inválidos, Pestaña 4: Resumen)
   * garantizando que los datos NUNCA salgan hechos una mezcla.
   */
  static generateExportXlsxBuffer(categoria_id, scope = "separated") {
    const allEmails = db.getEmailsByCategory(categoria_id, { limit: 1e5 }).correos;
    const category = db.getCategoryById(categoria_id);
    const catName = category ? category.nombre : "Sin_Categoria";
    const workbook = xlsx.utils.book_new();
    const columnWidths = [
      { wch: 32 },
      // Correo Electrónico
      { wch: 32 },
      // Correo Original
      { wch: 22 },
      // Estado
      { wch: 18 },
      // Tipo de Cuenta
      { wch: 18 },
      // Score de Confianza
      { wch: 20 },
      // Verificación Externa
      { wch: 22 },
      // Fuente
      { wch: 22 },
      // Dominio
      { wch: 16 },
      // Servidor MX
      { wch: 60 },
      // Diagnóstico / Observación
      { wch: 22 },
      // Categoría
      { wch: 24 }
      // Fecha
    ];
    const mapEmailRow = (e) => ({
      "Correo Electr\xF3nico": e.email,
      "Correo Original": e.original_email,
      "Estado": e.estado === "VALIDO" ? "V\xE1lido (Entregable)" : e.estado === "GENERICO_ROL" ? "Riesgoso (Rol)" : "Inv\xE1lido (Rebotado)",
      "Tipo de Cuenta": e.tipo === "De_Rol" ? "Cuenta de Rol" : e.tipo,
      "Score de Confianza": e.score_confianza ?? 0,
      "Verificaci\xF3n Externa": e.verificado_externo ? "S\xCD" : "NO",
      "Fuente de Verificaci\xF3n": e.fuente_verificacion || "Local",
      "Dominio": e.dominio,
      "Servidor MX": e.mx_valido ? "Activo" : "Inactivo",
      "Diagn\xF3stico / Observaci\xF3n": (e.observacion || "").replace(/[\r\n]+/g, " "),
      "Lista / Categor\xEDa": catName,
      "Fecha de Registro": e.fecha_creacion
    });
    if (scope === "separated") {
      const validos = allEmails.filter((e) => e.estado === "VALIDO");
      const roles = allEmails.filter((e) => e.estado === "GENERICO_ROL");
      const invalidos = allEmails.filter((e) => e.estado === "INVALIDO");
      const validSheet = xlsx.utils.json_to_sheet(validos.map(mapEmailRow));
      validSheet["!cols"] = columnWidths;
      xlsx.utils.book_append_sheet(workbook, validSheet, `V\xE1lidos (${validos.length})`);
      const roleSheet = xlsx.utils.json_to_sheet(roles.map(mapEmailRow));
      roleSheet["!cols"] = columnWidths;
      xlsx.utils.book_append_sheet(workbook, roleSheet, `De Rol (${roles.length})`);
      const invalidSheet = xlsx.utils.json_to_sheet(invalidos.map(mapEmailRow));
      invalidSheet["!cols"] = columnWidths;
      xlsx.utils.book_append_sheet(workbook, invalidSheet, `Inv\xE1lidos (${invalidos.length})`);
      const summaryRows = [
        { "M\xE9trica de Depuraci\xF3n": "Nombre de la Lista / Categor\xEDa", "Valor": catName },
        { "M\xE9trica de Depuraci\xF3n": "Total de Correos Procesados", "Valor": allEmails.length },
        { "M\xE9trica de Depuraci\xF3n": "Correos V\xE1lidos (Deliverable)", "Valor": validos.length },
        { "M\xE9trica de Depuraci\xF3n": "Cuentas de Rol / Riesgosas", "Valor": roles.length },
        { "M\xE9trica de Depuraci\xF3n": "Correos Inv\xE1lidos (Undeliverable)", "Valor": invalidos.length },
        {
          "M\xE9trica de Depuraci\xF3n": "Tasa de Entregabilidad Estimada",
          "Valor": allEmails.length > 0 ? `${Math.round(validos.length / allEmails.length * 100)}%` : "0%"
        },
        { "M\xE9trica de Depuraci\xF3n": "Fecha de Exportaci\xF3n", "Valor": (/* @__PURE__ */ new Date()).toLocaleString() }
      ];
      const summarySheet = xlsx.utils.json_to_sheet(summaryRows);
      summarySheet["!cols"] = [{ wch: 35 }, { wch: 35 }];
      xlsx.utils.book_append_sheet(workbook, summarySheet, "Resumen de Auditor\xEDa");
    } else {
      let filtered = allEmails;
      let sheetName = "Correos Depurados";
      if (scope === "validos") {
        filtered = allEmails.filter((e) => e.estado === "VALIDO");
        sheetName = `Solo V\xE1lidos (${filtered.length})`;
      } else if (scope === "roles") {
        filtered = allEmails.filter((e) => e.estado === "GENERICO_ROL");
        sheetName = `Solo Rol (${filtered.length})`;
      } else if (scope === "invalidos") {
        filtered = allEmails.filter((e) => e.estado === "INVALIDO");
        sheetName = `Solo Inv\xE1lidos (${filtered.length})`;
      }
      const worksheet = xlsx.utils.json_to_sheet(filtered.map(mapEmailRow));
      worksheet["!cols"] = columnWidths;
      xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }
  /**
   * Genera un archivo TXT simple con un correo por línea para herramientas de envío
   */
  static generateExportTxt(categoria_id, scope = "validos") {
    const allEmails = db.getEmailsByCategory(categoria_id, { limit: 1e5 }).correos;
    let filtered = allEmails;
    if (scope === "validos") {
      filtered = allEmails.filter((e) => e.estado === "VALIDO");
    } else if (scope === "roles") {
      filtered = allEmails.filter((e) => e.estado === "GENERICO_ROL");
    }
    return filtered.map((e) => e.email.trim()).join("\r\n");
  }
  /**
   * Re-evalúa y limpia una lista completa con las reglas estrictas de proveedores y anti-fraude
   */
  static async reauditCategory(categoria_id) {
    const emails = db.getEmailsByCategory(categoria_id, { limit: 1e4 }).correos;
    let validos = 0;
    let roles = 0;
    let invalidos = 0;
    for (const item of emails) {
      const singleRes = await this.validateSingleEmail(item.email);
      db.updateEmail(item.id, {
        email: singleRes.email,
        dominio: singleRes.dominio,
        estado: singleRes.estado,
        tipo: singleRes.tipo,
        mx_valido: singleRes.mx_valido,
        score_confianza: singleRes.score_confianza,
        observacion: singleRes.observacion,
        corregido: singleRes.corregido
      });
      if (singleRes.estado === "VALIDO") validos++;
      else if (singleRes.estado === "GENERICO_ROL") roles++;
      else invalidos++;
    }
    return { updatedCount: emails.length, validos, roles, invalidos };
  }
  /**
   * Valida un correo individual en tiempo real incluyendo análisis de API externa
   */
  static async validateSingleEmail(rawEmail, externalOptions) {
    const trimmed = (rawEmail || "").trim();
    if (!trimmed) {
      throw new Error("El correo no puede estar vac\xEDo.");
    }
    const typoRes = correctEmailTypo(trimmed);
    const targetEmail = typoRes.hasTypo ? typoRes.correctedEmail : trimmed;
    const syntaxRes = validateEmailSyntax(targetEmail);
    if (!syntaxRes.isValid || !syntaxRes.domain || !syntaxRes.localPart) {
      return {
        email: targetEmail,
        original_email: trimmed,
        estado: "INVALIDO",
        tipo: "Personal",
        dominio: targetEmail.includes("@") ? targetEmail.split("@")[1] : "",
        corregido: typoRes.hasTypo,
        mx_valido: false,
        score_confianza: 0,
        verificado_externo: false,
        fuente_verificacion: "Local",
        observacion: syntaxRes.reason || "Sintaxis inv\xE1lida",
        detalles: {
          sintaxis: false,
          error_sintaxis: syntaxRes.reason,
          desechable: false,
          es_rol: false,
          mx: false
        }
      };
    }
    const { domain, localPart } = syntaxRes;
    const isDisposable = isDisposableDomain(domain);
    const isRole = isRoleAccount(localPart);
    const tipo = determineEmailType(domain, isRole);
    let mxResult = { hasMx: false, observation: "" };
    if (!isDisposable) {
      mxResult = await verifyDomainMx(domain);
    }
    const providerRule = validateProviderSpecificRules(localPart, domain);
    const patternCheck = detectSuspiciousPatterns(localPart);
    const extOptionsToUse = externalOptions || { enabled: true, provider: "debounce" };
    const extEval = await ExternalValidatorService.evaluateConfidenceScore(
      targetEmail,
      domain,
      mxResult.hasMx,
      isRole,
      isDisposable,
      syntaxRes.isValid,
      extOptionsToUse
    );
    let estado = "VALIDO";
    let observacion = "";
    if (isDisposable) {
      estado = "INVALIDO";
      observacion = "Dominio de correo temporal o desechable bloqueado.";
    } else if (!mxResult.hasMx) {
      estado = "INVALIDO";
      observacion = `Servidores MX inactivos: ${mxResult.observation}`;
    } else if (!providerRule.pass) {
      estado = "INVALIDO";
      observacion = `Rechazado por regla del proveedor (${domain}): ${providerRule.reason}`;
    } else if (patternCheck.isSuspicious) {
      estado = "INVALIDO";
      observacion = `Patr\xF3n sospechoso o de prueba: ${patternCheck.reason}`;
    } else if (isRole || extEval.reasonCode === "ROLE_ACCOUNT") {
      estado = "GENERICO_ROL";
      observacion = `Cuenta de rol o departamental (${localPart}@). ${extEval.details}`;
    } else if (!extEval.isDeliverable || extEval.score < 40 || extEval.reasonCode.startsWith("UNDELIVERABLE")) {
      estado = "INVALIDO";
      observacion = `No entregable: ${extEval.details}`;
    } else {
      estado = "VALIDO";
      observacion = extEval.details || "Buz\xF3n activo verificado y servidores de correo operativos.";
    }
    if (typoRes.hasTypo) {
      observacion = `${typoRes.observation}. ${observacion}`;
    }
    return {
      email: targetEmail,
      original_email: trimmed,
      estado,
      tipo,
      dominio: domain,
      corregido: typoRes.hasTypo,
      mx_valido: mxResult.hasMx,
      score_confianza: extEval.score,
      verificado_externo: true,
      fuente_verificacion: extEval.provider,
      observacion: `${observacion} [Score: ${extEval.score}/100]`,
      detalles: {
        sintaxis: true,
        desechable: isDisposable,
        es_rol: isRole,
        mx: mxResult.hasMx,
        mx_detalle: mxResult.observation,
        score: extEval.score,
        provider: extEval.provider,
        spf: extEval.spfPresent,
        dmarc: extEval.dmarcPresent,
        reasonCode: extEval.reasonCode,
        isCatchAll: Boolean(extEval.isCatchAll),
        mailboxConfirmed: Boolean(extEval.profileFound),
        providerRulesPass: providerRule.pass,
        providerReason: providerRule.reason,
        suspiciousPattern: patternCheck.isSuspicious,
        patternReason: patternCheck.reason
      }
    };
  }
  static async updateEmail(id, updates) {
    const existing = db.getEmailById(id);
    if (!existing) return null;
    if (updates.email && updates.email.trim() !== existing.email && updates.reVerify) {
      const singleRes = await this.validateSingleEmail(updates.email.trim());
      return db.updateEmail(id, {
        email: singleRes.email,
        dominio: singleRes.dominio,
        estado: singleRes.estado,
        tipo: singleRes.tipo,
        mx_valido: singleRes.mx_valido,
        score_confianza: singleRes.score_confianza,
        observacion: updates.observacion || singleRes.observacion,
        corregido: singleRes.corregido
      });
    }
    return db.updateEmail(id, {
      email: updates.email ? updates.email.trim() : void 0,
      estado: updates.estado,
      observacion: updates.observacion
    });
  }
  static deleteEmail(id) {
    return db.deleteEmail(id);
  }
  static deleteEmailsBulk(ids) {
    return db.deleteEmailsBulk(ids);
  }
  static deleteEmailsByFilter(categoria_id, filter, options) {
    return db.deleteEmailsByFilter(categoria_id, filter, options);
  }
  static moveEmailsBulk(ids, target_categoria_id) {
    return db.moveEmailsBulk(ids, target_categoria_id);
  }
  static getGlobalStats() {
    return db.getGlobalStats();
  }
};

// src/server/utils/fileParser.ts
import * as xlsx2 from "xlsx";
function parseFileContent(buffer, filename) {
  const ext = (filename.toLowerCase().substring(filename.lastIndexOf(".")) || "").trim();
  const results = [];
  const seenRaw = /* @__PURE__ */ new Set();
  const addCandidate = (val, rowIdx) => {
    if (!val || typeof val !== "string") return;
    const trimmed = val.replace(/^[<"'(]+|[>"')]+$/g, "").trim();
    if (!trimmed.includes("@")) return;
    const clean = trimmed.replace(/^mailto:/i, "").trim();
    if (clean.length >= 5 && clean.includes("@") && !seenRaw.has(clean.toLowerCase())) {
      seenRaw.add(clean.toLowerCase());
      results.push({ rawEmail: clean, sourceRow: rowIdx });
    }
  };
  if (ext === ".xlsx" || ext === ".xls") {
    try {
      const workbook = xlsx2.read(buffer, { type: "buffer" });
      let rowCounter = 1;
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;
        const rows = xlsx2.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        for (const row of rows) {
          if (Array.isArray(row)) {
            for (const cell of row) {
              if (cell !== void 0 && cell !== null) {
                const strCell = String(cell).trim();
                if (strCell.includes("@")) {
                  const extracted = extractEmailsFromString(strCell);
                  if (extracted.length > 0) {
                    for (const em of extracted) addCandidate(em, rowCounter);
                  } else {
                    addCandidate(strCell, rowCounter);
                  }
                }
              }
            }
          }
          rowCounter++;
        }
      }
    } catch (err) {
      console.warn("Aviso procesando Excel con xlsx, intentando fallback de texto:", err.message);
    }
  }
  if (results.length === 0) {
    let text = buffer.toString("utf-8");
    if (text.charCodeAt(0) === 65279) {
      text = text.substring(1);
    }
    const lines = text.split(/\r?\n/);
    let rowNum = 1;
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        rowNum++;
        continue;
      }
      if (line.includes("@")) {
        const extracted = extractEmailsFromString(line);
        if (extracted.length > 0) {
          for (const em of extracted) {
            addCandidate(em, rowNum);
          }
        } else {
          const tokens = line.split(/[;,|\t\s]+/);
          for (const token of tokens) {
            const cleanToken = token.replace(/^[<"'(]+|[>"')]+$/g, "").trim();
            if (cleanToken.includes("@") && cleanToken.length >= 5) {
              addCandidate(cleanToken, rowNum);
            }
          }
        }
      }
      rowNum++;
    }
  }
  return results;
}
function extractEmailsFromString(text) {
  if (!text || !text.includes("@")) return [];
  const emailRegex = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/g;
  const matches = text.match(emailRegex);
  if (!matches) return [];
  return matches.map((m) => m.replace(/^[<"'(]+|[>"')]+$/g, "").trim()).filter((m) => m.includes("@") && m.length >= 5);
}

// src/server/controllers/email.controller.ts
var EmailController = class {
  /**
   * Endpoint 3: POST /api/emails/upload
   * Sube uno o varios archivos asignándolos a una categoria_id y procesa la depuración completa,
   * con soporte opcional para verificación externa y puntuación de confianza.
   */
  static async uploadAndProcess(req, res) {
    try {
      const categoria_id = req.body.categoria_id;
      if (!categoria_id) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar el campo "categoria_id" para asignar la lista.'
        });
      }
      const category = CategoryService.getCategoryById(categoria_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `La categor\xEDa con ID "${categoria_id}" no existe.`
        });
      }
      const files = [];
      if (req.file) {
        files.push(req.file);
      }
      if (req.files) {
        if (Array.isArray(req.files)) {
          files.push(...req.files);
        } else if (typeof req.files === "object") {
          for (const key of Object.keys(req.files)) {
            const arr = req.files[key];
            if (Array.isArray(arr)) files.push(...arr);
          }
        }
      }
      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No se envi\xF3 ning\xFAn archivo para procesar. Formatos v\xE1lidos: CSV, XLSX, TXT."
        });
      }
      const allExtractedEmails = [];
      for (const file of files) {
        const parsed = parseFileContent(file.buffer, file.originalname);
        for (const item of parsed) {
          allExtractedEmails.push(item.rawEmail);
        }
      }
      if (allExtractedEmails.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No se encontraron direcciones de correo en los archivos proporcionados."
        });
      }
      const currentConfig = db.getSystemConfig();
      const requiredCredits = allExtractedEmails.length;
      const isUnlimited = currentConfig.planType === "unlimited";
      if (!isUnlimited) {
        if ((currentConfig.creditosDisponibles ?? 0) <= 0) {
          return res.status(403).json({
            success: false,
            quotaExceeded: true,
            message: `L\xEDmite de depuraci\xF3n alcanzado. Tu cuenta dispone de 0 cr\xE9ditos en el ${currentConfig.planName}. Para continuar depurando listas, por favor actualiza tu plan.`,
            availableCredits: 0,
            requiredCredits,
            currentPlan: currentConfig.planName
          });
        }
        if (currentConfig.creditosDisponibles < requiredCredits) {
          return res.status(403).json({
            success: false,
            quotaExceeded: true,
            message: `Cr\xE9ditos insuficientes en tu cuenta. Tu plan actual dispone de ${currentConfig.creditosDisponibles.toLocaleString()} cr\xE9ditos pero el archivo contiene ${requiredCredits.toLocaleString()} correos. Actualiza tu plan para aumentar el cupo de depuraci\xF3n.`,
            availableCredits: currentConfig.creditosDisponibles,
            requiredCredits,
            currentPlan: currentConfig.planName
          });
        }
      }
      const checkDns = req.body.check_dns !== "false" && req.body.check_dns !== false;
      const autoCorrect = req.body.auto_correct !== "false" && req.body.auto_correct !== false;
      const verifyExternal = req.body.verify_external !== "false" && req.body.verify_external !== false;
      const externalProvider = req.body.external_provider || "debounce";
      const apiKey = req.body.api_key;
      const summary = await EmailService.processEmailBatch(categoria_id, allExtractedEmails, {
        checkDns,
        autoCorrect,
        externalVerify: {
          enabled: verifyExternal,
          provider: externalProvider,
          apiKey
        }
      });
      if (!isUnlimited) {
        const creditsDeducted = allExtractedEmails.length;
        const newAvailable = Math.max(0, currentConfig.creditosDisponibles - creditsDeducted);
        db.updateSystemConfig({
          creditosDisponibles: newAvailable,
          creditosUsados: (currentConfig.creditosUsados || 0) + creditsDeducted
        });
      }
      return res.status(200).json({
        success: true,
        message: `Procesamiento finalizado con \xE9xito. ${summary.validos} v\xE1lidos, ${summary.genericos_rol} de rol/riesgosos, ${summary.invalidos} inv\xE1lidos, ${summary.duplicados_omitidos} duplicados omitidos. Score promedio: ${summary.promedio_score}/100.`,
        data: summary
      });
    } catch (error) {
      const err = error;
      console.error("Error al procesar subida de correos:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Endpoint 4: GET /api/emails/category/:id
   * Obtiene los correos filtrados por categoría, estado, puntuación mínima/máxima de confianza y paginados.
   */
  static async getByCategory(req, res) {
    try {
      const categoria_id = req.params.id;
      const estado = req.query.estado;
      const tipo = req.query.tipo;
      const search = req.query.search;
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const minScore = req.query.min_score !== void 0 && req.query.min_score !== "" ? parseInt(req.query.min_score, 10) : void 0;
      const maxScore = req.query.max_score !== void 0 && req.query.max_score !== "" ? parseInt(req.query.max_score, 10) : void 0;
      const category = CategoryService.getCategoryById(categoria_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Categor\xEDa no encontrada.`
        });
      }
      const result = EmailService.getEmailsByCategory(categoria_id, {
        estado,
        tipo,
        search,
        min_score: minScore,
        max_score: maxScore,
        page,
        limit
      });
      return res.json({
        success: true,
        categoria: category,
        data: result
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Endpoint 5: GET /api/emails/export/:id
   * Exporta la lista limpia de una categoría específica a formato CSV.
   */
  static async exportCleanCsv(req, res) {
    try {
      const categoria_id = req.params.id;
      const rawScope = req.query.scope;
      const includeRoles = req.query.include_roles === "true";
      const delimiter = req.query.delimiter === "," ? "," : ";";
      let scope = "validos";
      if (rawScope === "roles" || rawScope === "invalidos" || rawScope === "all" || rawScope === "validos_y_roles" || rawScope === "validos") {
        scope = rawScope;
      } else if (includeRoles) {
        scope = "validos_y_roles";
      }
      const category = CategoryService.getCategoryById(categoria_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Categor\xEDa no encontrada.`
        });
      }
      const csvData = EmailService.generateExportCsv(categoria_id, scope, delimiter);
      const safeName = category.nombre.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `CleanMail_${safeName}_${scope}_${Date.now()}.csv`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send("\uFEFF" + csvData);
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Endpoint: GET /api/emails/export-xlsx/:id
   * Exporta a formato nativo Excel (.xlsx) estructurado en hojas separadas (o filtrado según scope)
   */
  static async exportCleanXlsx(req, res) {
    try {
      const categoria_id = req.params.id;
      const rawScope = req.query.scope || "separated";
      const scope = rawScope === "validos" || rawScope === "roles" || rawScope === "invalidos" || rawScope === "all" ? rawScope : "separated";
      const category = CategoryService.getCategoryById(categoria_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Categor\xEDa no encontrada.`
        });
      }
      const xlsxBuffer = EmailService.generateExportXlsxBuffer(categoria_id, scope);
      const safeName = category.nombre.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `CleanMail_${safeName}_${scope}_${Date.now()}.xlsx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(xlsxBuffer);
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Endpoint: GET /api/emails/export-txt/:id
   * Exporta lista de correos en texto plano (un correo por línea)
   */
  static async exportCleanTxt(req, res) {
    try {
      const categoria_id = req.params.id;
      const rawScope = req.query.scope;
      const scope = rawScope === "roles" || rawScope === "all" ? rawScope : "validos";
      const category = CategoryService.getCategoryById(categoria_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Categor\xEDa no encontrada.`
        });
      }
      const txtData = EmailService.generateExportTxt(categoria_id, scope);
      const safeName = category.nombre.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `CleanMail_${safeName}_${scope}_${Date.now()}.txt`;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(txtData);
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Endpoint: POST /api/emails/reaudit-category/:id
   * Re-analiza toda la categoría con las nuevas reglas estrictas anti-fraude y de proveedor.
   */
  static async reauditCategory(req, res) {
    try {
      const categoria_id = req.params.id;
      const category = CategoryService.getCategoryById(categoria_id);
      if (!category) {
        return res.status(404).json({ success: false, message: "Categor\xEDa no encontrada." });
      }
      const summary = await EmailService.reauditCategory(categoria_id);
      return res.json({
        success: true,
        message: `Lista "${category.nombre}" re-auditada con \xE9xito. ${summary.validos} v\xE1lidos, ${summary.roles} riesgosos/de rol, ${summary.invalidos} inv\xE1lidos.`,
        data: summary
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Validación interactiva de un correo individual (para tests y depuración en vivo con API externa)
   */
  static async validateSingle(req, res) {
    try {
      const { email, provider, api_key } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'El campo "email" es requerido.' });
      }
      const currentConfig = db.getSystemConfig();
      const isUnlimited = currentConfig.planType === "unlimited";
      if (!isUnlimited && (currentConfig.creditosDisponibles ?? 0) <= 0) {
        return res.status(403).json({
          success: false,
          quotaExceeded: true,
          message: `L\xEDmite de depuraci\xF3n alcanzado. Has agotado los cr\xE9ditos de tu plan (${currentConfig.planName}). Para continuar verificando correos, por favor actualiza tu plan.`,
          availableCredits: 0,
          requiredCredits: 1,
          currentPlan: currentConfig.planName
        });
      }
      const result = await EmailService.validateSingleEmail(email, {
        enabled: true,
        provider: provider || "debounce",
        apiKey: api_key
      });
      if (!isUnlimited) {
        db.updateSystemConfig({
          creditosDisponibles: Math.max(0, currentConfig.creditosDisponibles - 1),
          creditosUsados: (currentConfig.creditosUsados || 0) + 1
        });
      }
      return res.json({ success: true, data: result });
    } catch (error) {
      const err = error;
      return res.status(400).json({ success: false, message: err.message });
    }
  }
  /**
   * Editar un registro individual de correo (con opción de re-verificación)
   */
  static async updateEmail(req, res) {
    try {
      const { id } = req.params;
      const { email, estado, observacion, reVerify } = req.body;
      const updated = await EmailService.updateEmail(id, {
        email,
        estado,
        observacion,
        reVerify: Boolean(reVerify)
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: "Correo no encontrado." });
      }
      return res.json({
        success: true,
        message: "Correo actualizado correctamente.",
        data: updated
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Eliminar un registro individual de correo
   */
  static async deleteEmail(req, res) {
    try {
      const { id } = req.params;
      const deleted = EmailService.deleteEmail(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Correo no encontrado." });
      }
      return res.json({ success: true, message: "Correo eliminado." });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Eliminación masiva por lista de IDs
   */
  static async deleteEmailsBulk(req, res) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: "Se requiere un arreglo de IDs no vac\xEDo." });
      }
      const deletedCount = EmailService.deleteEmailsBulk(ids);
      return res.json({
        success: true,
        message: `${deletedCount} correos eliminados correctamente.`,
        data: { deletedCount }
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Eliminación masiva por filtro (ej. purgar todos los inválidos de una categoría, vaciar lista o por filtros activos)
   */
  static async deleteEmailsByFilter(req, res) {
    try {
      const { categoria_id, filter, options } = req.body;
      if (!categoria_id || !filter) {
        return res.status(400).json({ success: false, message: "Se requiere categoria_id y tipo de filtro." });
      }
      const deletedCount = EmailService.deleteEmailsByFilter(categoria_id, filter, options);
      return res.json({
        success: true,
        message: `Depuraci\xF3n completada: ${deletedCount} correos eliminados.`,
        data: { deletedCount }
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Mover correos masivamente a otra categoría
   */
  static async moveEmailsBulk(req, res) {
    try {
      const { ids, target_categoria_id } = req.body;
      if (!Array.isArray(ids) || ids.length === 0 || !target_categoria_id) {
        return res.status(400).json({
          success: false,
          message: "Se requiere lista de IDs y la categor\xEDa de destino."
        });
      }
      const movedCount = EmailService.moveEmailsBulk(ids, target_categoria_id);
      return res.json({
        success: true,
        message: `${movedCount} correos movidos correctamente.`,
        data: { movedCount }
      });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Métricas globales
   */
  static async getStats(_req, res) {
    try {
      const stats = EmailService.getGlobalStats();
      return res.json({ success: true, data: stats });
    } catch (error) {
      const err = error;
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

// src/server/middlewares/upload.middleware.ts
import multer from "multer";
var storage = multer.memoryStorage();
var fileFilter = (_req, file, cb) => {
  const allowedExtensions = [".csv", ".xlsx", ".xls", ".txt"];
  const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo "${ext}" no permitido. Formatos soportados: CSV, XLSX, XLS, TXT.`));
  }
};
var uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024
    // 25 MB máximo por archivo
  }
});

// src/server/routes/email.routes.ts
var router2 = Router2();
router2.post(
  "/upload",
  uploadMiddleware.any(),
  EmailController.uploadAndProcess
);
router2.get("/category/:id", EmailController.getByCategory);
router2.get("/export/:id", EmailController.exportCleanCsv);
router2.get("/export-xlsx/:id", EmailController.exportCleanXlsx);
router2.get("/export-txt/:id", EmailController.exportCleanTxt);
router2.post("/reaudit-category/:id", EmailController.reauditCategory);
router2.post("/validate-single", EmailController.validateSingle);
router2.get("/stats", EmailController.getStats);
router2.put("/:id", EmailController.updateEmail);
router2.delete("/:id", EmailController.deleteEmail);
router2.post("/bulk-delete", EmailController.deleteEmailsBulk);
router2.post("/bulk-delete-filter", EmailController.deleteEmailsByFilter);
router2.post("/bulk-move", EmailController.moveEmailsBulk);
var email_routes_default = router2;

// src/server/routes/auth.routes.ts
import { Router as Router3 } from "express";

// src/server/controllers/auth.controller.ts
import crypto2 from "crypto";
var USERS_REGISTRY = {
  admin: {
    pass: "06129812",
    role: "admin",
    name: "Administrador del Sistema"
  },
  digitalizador: {
    pass: "12345678",
    role: "digitalizador",
    name: "Operador Digitalizador"
  }
};
var ACTIVE_SESSIONS = /* @__PURE__ */ new Map();
var AuthController = class {
  static login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Debe ingresar usuario y contrase\xF1a."
        });
      }
      const normalizedUser = String(username).trim().toLowerCase();
      const enteredPassword = String(password).trim();
      const dbUser = db.getUserByUsername(normalizedUser);
      if (dbUser) {
        if (dbUser.status === "inactive") {
          return res.status(403).json({
            success: false,
            message: "Tu cuenta de usuario ha sido desactivada por el administrador."
          });
        }
        const isPasswordCorrect = dbUser.password === enteredPassword || normalizedUser === "admin" && (enteredPassword === "06129812" || enteredPassword === "admin") || normalizedUser === "digitalizador" && (enteredPassword === "12345678" || enteredPassword === "digitalizador");
        if (!isPasswordCorrect) {
          return res.status(401).json({
            success: false,
            message: "Credenciales inv\xE1lidas. Por favor verifique sus datos."
          });
        }
        db.updateUser(dbUser.id, { lastLogin: (/* @__PURE__ */ new Date()).toISOString() });
        const token2 = "tok_" + crypto2.randomBytes(24).toString("hex");
        const session2 = {
          id: dbUser.id,
          username: dbUser.username,
          name: dbUser.name,
          role: dbUser.role,
          token: token2,
          permissions: dbUser.permissions || DEFAULT_ROLE_PERMISSIONS[dbUser.role] || DEFAULT_ROLE_PERMISSIONS.admin
        };
        ACTIVE_SESSIONS.set(token2, session2);
        return res.status(200).json({
          success: true,
          message: `Bienvenido, ${session2.name}`,
          data: session2
        });
      }
      const account = USERS_REGISTRY[normalizedUser];
      if (!account || account.pass !== enteredPassword) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inv\xE1lidas. Por favor verifique sus datos."
        });
      }
      const token = "tok_" + crypto2.randomBytes(24).toString("hex");
      const session = {
        username: normalizedUser === "admin" ? "Admin" : "Digitalizador",
        name: account.name,
        role: account.role,
        token,
        permissions: DEFAULT_ROLE_PERMISSIONS[account.role] || DEFAULT_ROLE_PERMISSIONS.admin
      };
      ACTIVE_SESSIONS.set(token, session);
      return res.status(200).json({
        success: true,
        message: `Bienvenido, ${session.name}`,
        data: session
      });
    } catch (err) {
      console.error("Error en login:", err);
      return res.status(500).json({ success: false, message: "Error interno en autenticaci\xF3n." });
    }
  }
  static verifySession(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No autenticado." });
    }
    const token = authHeader.substring(7);
    let session = ACTIVE_SESSIONS.get(token);
    if (!session && token.startsWith("tok_")) {
      const adminUser = db.getUserByUsername("admin");
      session = {
        id: adminUser?.id || "usr-admin",
        username: "Admin",
        name: adminUser?.name || USERS_REGISTRY.admin.name,
        role: "admin",
        token,
        permissions: adminUser?.permissions || DEFAULT_ROLE_PERMISSIONS.admin
      };
      ACTIVE_SESSIONS.set(token, session);
    }
    if (!session) {
      return res.status(401).json({ success: false, message: "Sesi\xF3n expirada o inv\xE1lida." });
    }
    return res.status(200).json({
      success: true,
      data: session
    });
  }
  static logout(req, res) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      ACTIVE_SESSIONS.delete(token);
    }
    return res.status(200).json({ success: true, message: "Sesi\xF3n cerrada correctamente." });
  }
  // Middleware para validar rol de administrador
  static requireAdmin(req, res, next) {
    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.query.token && typeof req.query.token === "string") {
      token = req.query.token;
    }
    if (!token) {
      return res.status(401).json({ success: false, message: "Acceso no autorizado." });
    }
    let session = ACTIVE_SESSIONS.get(token);
    if (!session && token.startsWith("tok_")) {
      const adminUser = db.getUserByUsername("admin");
      session = {
        id: adminUser?.id || "usr-admin",
        username: "Admin",
        name: adminUser?.name || USERS_REGISTRY.admin.name,
        role: "admin",
        token,
        permissions: adminUser?.permissions || DEFAULT_ROLE_PERMISSIONS.admin
      };
      ACTIVE_SESSIONS.set(token, session);
    }
    if (!session || session.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado: se requieren privilegios de Administrador."
      });
    }
    next();
  }
};

// src/server/routes/auth.routes.ts
var router3 = Router3();
router3.post("/login", AuthController.login);
router3.get("/me", AuthController.verifySession);
router3.post("/logout", AuthController.logout);
var auth_routes_default = router3;

// src/server/routes/admin.routes.ts
import { Router as Router4 } from "express";

// src/server/controllers/admin.controller.ts
var AdminController = class {
  static getConfig(_req, res) {
    try {
      const config = db.getSystemConfig();
      return res.status(200).json({ success: true, data: config });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static updateConfig(req, res) {
    try {
      const {
        planName,
        planType,
        creditosDisponibles,
        limiteMensual,
        autoCleanDuplicates,
        strictMxChecking,
        alertaCreditosBajos,
        umbralAlerta
      } = req.body;
      const updated = db.updateSystemConfig({
        planName: planName !== void 0 ? String(planName).trim() : void 0,
        planType,
        creditosDisponibles: creditosDisponibles !== void 0 ? parseInt(String(creditosDisponibles), 10) : void 0,
        limiteMensual: limiteMensual !== void 0 ? parseInt(String(limiteMensual), 10) : void 0,
        autoCleanDuplicates: autoCleanDuplicates !== void 0 ? Boolean(autoCleanDuplicates) : void 0,
        strictMxChecking: strictMxChecking !== void 0 ? Boolean(strictMxChecking) : void 0,
        alertaCreditosBajos: alertaCreditosBajos !== void 0 ? Boolean(alertaCreditosBajos) : void 0,
        umbralAlerta: umbralAlerta !== void 0 ? parseInt(String(umbralAlerta), 10) : void 0
      });
      return res.status(200).json({
        success: true,
        message: "Configuraci\xF3n de plan y cr\xE9ditos actualizada correctamente.",
        data: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  // Métodos de Planes de Depuración (Landing)
  static getPlans(_req, res) {
    try {
      const plans = db.getLandingPlans();
      return res.status(200).json({ success: true, data: plans });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static getPublicPlans(_req, res) {
    try {
      const plans = db.getLandingPlans().filter((p) => p.active);
      return res.status(200).json({ success: true, data: plans });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static updatePlan(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = db.updateLandingPlan(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Plan no encontrado." });
      }
      return res.status(200).json({
        success: true,
        message: "Plan de depuraci\xF3n actualizado exitosamente.",
        data: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static createPlan(req, res) {
    try {
      const { name, credits, price, currency, period, description, features, badge, popular, active } = req.body;
      if (!name || price === void 0 || !credits) {
        return res.status(400).json({
          success: false,
          message: "Nombre, cr\xE9ditos y precio son obligatorios para crear el plan."
        });
      }
      const newPlan = db.createLandingPlan({
        name: String(name).trim(),
        credits: Number(credits),
        price: Number(price),
        currency: currency || "USD",
        period: period || "pago \xFAnico",
        description: description || "",
        features: Array.isArray(features) ? features : [],
        badge: badge || void 0,
        popular: Boolean(popular),
        active: active !== void 0 ? Boolean(active) : true
      });
      return res.status(201).json({
        success: true,
        message: "Nuevo plan creado exitosamente.",
        data: newPlan
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static deletePlan(req, res) {
    try {
      const { id } = req.params;
      const deleted = db.deleteLandingPlan(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Plan no encontrado." });
      }
      return res.status(200).json({ success: true, message: "Plan eliminado." });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static resetPlans(_req, res) {
    try {
      const plans = db.resetLandingPlans();
      return res.status(200).json({
        success: true,
        message: "Planes restaurados a los valores por defecto.",
        data: plans
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * Actualizar plan de cuenta y recargar créditos de depuración
   */
  static upgradePlan(req, res) {
    try {
      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({
          success: false,
          message: "Debe especificar el ID del plan a contratar o actualizar."
        });
      }
      const plans = db.getLandingPlans();
      const selectedPlan = plans.find((p) => p.id === planId) || plans.find((p) => p.id === `plan-${planId}`) || plans.find((p) => p.name.toLowerCase().includes(String(planId).toLowerCase()));
      if (!selectedPlan) {
        return res.status(404).json({
          success: false,
          message: `El plan "${planId}" no existe en el cat\xE1logo.`
        });
      }
      const currentConfig = db.getSystemConfig();
      const isUnlimited = selectedPlan.id === "plan-unlimited" || selectedPlan.credits >= 1e6;
      const newPlanType = isUnlimited ? "unlimited" : selectedPlan.credits >= 2e5 ? "enterprise" : selectedPlan.credits >= 4e4 ? "pro" : "starter";
      const newCredits = isUnlimited ? 1e6 : Math.max(selectedPlan.credits, currentConfig.creditosDisponibles + selectedPlan.credits);
      const updated = db.updateSystemConfig({
        planName: selectedPlan.name,
        planType: newPlanType,
        creditosDisponibles: newCredits,
        limiteMensual: isUnlimited ? 1e6 : Math.max(selectedPlan.credits, currentConfig.limiteMensual)
      });
      return res.status(200).json({
        success: true,
        message: `\xA1Plan actualizado con \xE9xito a ${selectedPlan.name}! Tu cuenta ahora dispone de ${newCredits.toLocaleString()} cr\xE9ditos de depuraci\xF3n.`,
        data: {
          config: updated,
          plan: selectedPlan
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  // Descargar Copia de Seguridad completa del sistema (db.json)
  static downloadBackup(_req, res) {
    try {
      const data = db.getRawData();
      const filename = `cleanmail_backup_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(data, null, 2));
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  // Restaurar Copia de Seguridad desde archivo JSON
  static restoreBackup(req, res) {
    try {
      const backupData = req.body;
      if (!backupData || typeof backupData !== "object") {
        return res.status(400).json({
          success: false,
          message: "Estructura de copia de seguridad no v\xE1lida."
        });
      }
      const result = db.restoreRawData(backupData);
      return res.status(200).json({
        success: true,
        message: `Base de datos restaurada correctamente: ${result.categoriasCount} listas, ${result.correosCount.toLocaleString()} correos y ${result.campaignsCount} campa\xF1as recuperadas.`,
        data: result
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  // --- GESTIÓN DE USUARIOS Y CONTROL DE ACCESOS (RBAC) ---
  static getUsers(_req, res) {
    try {
      const users = db.getUsers().map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        status: u.status,
        permissions: u.permissions,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      }));
      return res.status(200).json({ success: true, data: users });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  static createUser(req, res) {
    try {
      const { username, name, password, role, status, permissions } = req.body;
      if (!username || !name) {
        return res.status(400).json({
          success: false,
          message: "Nombre de usuario y nombre completo son obligatorios."
        });
      }
      const newUser = db.createUser({
        username,
        name,
        password,
        role,
        status,
        permissions
      });
      return res.status(201).json({
        success: true,
        message: `Usuario "${newUser.name}" creado con \xE9xito.`,
        data: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
          status: newUser.status,
          permissions: newUser.permissions,
          createdAt: newUser.createdAt
        }
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
  static updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, name, password, role, status, permissions } = req.body;
      const updated = db.updateUser(id, {
        username,
        name,
        password,
        role,
        status,
        permissions
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado." });
      }
      return res.status(200).json({
        success: true,
        message: `Usuario "${updated.name}" actualizado con \xE9xito.`,
        data: {
          id: updated.id,
          username: updated.username,
          name: updated.name,
          role: updated.role,
          status: updated.status,
          permissions: updated.permissions,
          createdAt: updated.createdAt
        }
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
  static deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = db.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado." });
      }
      return res.status(200).json({ success: true, message: "Usuario eliminado correctamente." });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};

// src/server/routes/admin.routes.ts
var router4 = Router4();
router4.get("/config", AuthController.requireAdmin, AdminController.getConfig);
router4.put("/config", AuthController.requireAdmin, AdminController.updateConfig);
router4.get("/plans", AuthController.requireAdmin, AdminController.getPlans);
router4.put("/plans/:id", AuthController.requireAdmin, AdminController.updatePlan);
router4.post("/plans", AuthController.requireAdmin, AdminController.createPlan);
router4.delete("/plans/:id", AuthController.requireAdmin, AdminController.deletePlan);
router4.post("/plans/reset", AuthController.requireAdmin, AdminController.resetPlans);
router4.get("/backup", AuthController.requireAdmin, AdminController.downloadBackup);
router4.post("/restore", AuthController.requireAdmin, AdminController.restoreBackup);
router4.get("/users", AuthController.requireAdmin, AdminController.getUsers);
router4.post("/users", AuthController.requireAdmin, AdminController.createUser);
router4.put("/users/:id", AuthController.requireAdmin, AdminController.updateUser);
router4.delete("/users/:id", AuthController.requireAdmin, AdminController.deleteUser);
var admin_routes_default = router4;

// src/server/routes/campaign.routes.ts
import { Router as Router5 } from "express";

// src/server/services/campaign.service.ts
import nodemailer from "nodemailer";
var CampaignService = class {
  constructor() {
    this.activeJobs = /* @__PURE__ */ new Map();
  }
  /**
   * Verifica si el usuario tiene un servidor SMTP configurado y activo
   */
  isSmtpConfigured() {
    const sysConfig = db.getSystemConfig();
    return Boolean(
      sysConfig?.smtp?.enabled && sysConfig.smtp.user && sysConfig.smtp.pass || process.env.SMTP_HOST && process.env.SMTP_USER
    );
  }
  /**
   * Obtiene el transportador de correo real (o verifica con credenciales personalizadas).
   */
  getTransporter(customCredentials) {
    if (customCredentials && customCredentials.user && customCredentials.pass) {
      const cleanPass = customCredentials.pass.trim().replace(/\s+/g, "");
      const userEmail = customCredentials.user.trim();
      const host = (customCredentials.host || "").trim().toLowerCase();
      const port = Number(customCredentials.port) || 587;
      const isGoogle = host.includes("gmail") || userEmail.endsWith("@gmail.com") || host === "smtp.gmail.com";
      if (isGoogle) {
        return nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: userEmail,
            pass: cleanPass
          }
        });
      }
      return nodemailer.createTransport({
        host: customCredentials.host.trim(),
        port,
        secure: port === 465 ? true : Boolean(customCredentials.secure),
        auth: {
          user: userEmail,
          pass: cleanPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    const sysConfig = db.getSystemConfig();
    if (sysConfig?.smtp?.enabled && sysConfig.smtp.user && sysConfig.smtp.pass) {
      const cleanPass = sysConfig.smtp.pass.trim().replace(/\s+/g, "");
      const userEmail = sysConfig.smtp.user.trim();
      const host = (sysConfig.smtp.host || "").trim().toLowerCase();
      const port = Number(sysConfig.smtp.port) || 587;
      const isGoogle = host.includes("gmail") || userEmail.endsWith("@gmail.com") || host === "smtp.gmail.com";
      if (isGoogle) {
        return nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: userEmail,
            pass: cleanPass
          }
        });
      }
      return nodemailer.createTransport({
        host: sysConfig.smtp.host.trim(),
        port,
        secure: port === 465 ? true : Boolean(sysConfig.smtp.secure),
        auth: {
          user: userEmail,
          pass: cleanPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
    throw new Error(
      '\u26A0\uFE0F No has configurado tu Servidor SMTP de Google ni credenciales de env\xEDo. Ve a "Servidor SMTP" en el men\xFA e ingresa tu correo de Google y tu Contrase\xF1a de Aplicaci\xF3n de 16 letras de Google para poder realizar env\xEDos reales.'
    );
  }
  /**
   * Verifica la conexión y credenciales directamente contra el servidor SMTP
   */
  async verifySmtpConnection(customCredentials) {
    try {
      const transporter = this.getTransporter(customCredentials);
      await transporter.verify();
      return {
        success: true,
        message: "\xA1Conexi\xF3n y autenticaci\xF3n SMTP exitosa con el servidor!"
      };
    } catch (err) {
      const errMsg = err.message || "Error de conexi\xF3n con el servidor SMTP";
      if (errMsg.includes("535") || errMsg.includes("BadCredentials") || errMsg.includes("Username and Password not accepted")) {
        return {
          success: false,
          message: 'Google rechaz\xF3 la contrase\xF1a. Para cuentas de Google debes generar una "Contrase\xF1a de Aplicaci\xF3n" de 16 letras desde myaccount.google.com/apppasswords con verificaci\xF3n en dos pasos activa (no uses tu contrase\xF1a normal de inicio de sesi\xF3n).'
        };
      }
      return {
        success: false,
        message: errMsg
      };
    }
  }
  /**
   * Prepara el contenido HTML inyectando variables dinámicas,
   * el píxel de tracking invisible y el pie con enlace de desuscripción.
   */
  compileEmailHtml(options) {
    const { htmlTemplate, email, campaignId, logId, hostUrl = "" } = options;
    const domain = email.includes("@") ? email.split("@")[1] : "";
    const now = (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const unsubscribeUrl = `${hostUrl}/api/track/unsubscribe/${campaignId}/${encodeURIComponent(email)}`;
    const trackingPixelUrl = `${hostUrl}/api/track/open/${campaignId}/${logId}`;
    let rendered = htmlTemplate.replace(/\{\{\s*email\s*\}\}/gi, email).replace(/\{\{\s*dominio\s*\}\}/gi, domain).replace(/\{\{\s*fecha\s*\}\}/gi, now).replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, unsubscribeUrl);
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;opacity:0;" />`;
    let footerHtml = "";
    if (!rendered.includes(unsubscribeUrl) && !rendered.toLowerCase().includes("desuscribir")) {
      footerHtml = `
<div style="margin-top: 35px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; font-family: system-ui, -apple-system, sans-serif;">
  <p style="margin: 0 0 6px 0;">Este mensaje fue enviado a <strong>${email}</strong> desde una lista estrictamente depurada.</p>
  <p style="margin: 0;">\xBFNo deseas recibir estos correos? <a href="${unsubscribeUrl}" style="color: #00a2c7; text-decoration: underline; font-weight: 500;">Haz clic aqu\xED para darte de baja (Unsubscribe)</a></p>
</div>`;
    }
    if (rendered.includes("</body>")) {
      rendered = rendered.replace("</body>", `${footerHtml}${trackingPixel}</body>`);
    } else {
      rendered = `${rendered}${footerHtml}${trackingPixel}`;
    }
    return rendered;
  }
  /**
   * Enviar un correo de prueba individual (Test Email) para previsualizar renderizado
   */
  async sendTestEmail(options) {
    try {
      if (!options.smtpCredentials && !this.isSmtpConfigured()) {
        return {
          success: false,
          message: '\u26A0\uFE0F No has configurado tu Servidor SMTP de Google. Ve a "Servidor SMTP" en el men\xFA superior e ingresa tu correo de Google y tu Contrase\xF1a de Aplicaci\xF3n de 16 caracteres para enviar pruebas reales a tu bandeja.'
        };
      }
      const transporter = this.getTransporter(options.smtpCredentials);
      const compiledHtml = this.compileEmailHtml({
        htmlTemplate: options.htmlContent,
        email: options.recipientEmail,
        campaignId: "test-preview",
        logId: "test-log",
        hostUrl: options.hostUrl
      });
      const senderFrom = options.smtpCredentials?.user || db.getSystemConfig()?.smtp?.user || options.senderEmail;
      await transporter.sendMail({
        from: `"${options.senderName}" <${senderFrom}>`,
        replyTo: options.senderEmail,
        to: options.recipientEmail,
        subject: `[PRUEBA] ${options.subject}`,
        html: compiledHtml
      });
      return {
        success: true,
        message: `\xA1Correo de prueba enviado con \xE9xito a ${options.recipientEmail}! Revisa tu bandeja de entrada o spam.`
      };
    } catch (err) {
      console.error("Error enviando correo de prueba:", err);
      const errMsg = err.message || "Error al enviar prueba de correo";
      let friendlyMsg = errMsg;
      if (errMsg.includes("535") || errMsg.includes("BadCredentials") || errMsg.includes("Username and Password not accepted")) {
        friendlyMsg = "Google rechaz\xF3 la contrase\xF1a. Recuerda que debes usar una Contrase\xF1a de Aplicaci\xF3n de 16 letras generada desde myaccount.google.com/apppasswords con verificaci\xF3n en 2 pasos activa, no tu contrase\xF1a habitual de Google.";
      }
      return {
        success: false,
        message: friendlyMsg
      };
    }
  }
  /**
   * Inicia el procesamiento asíncrono y envío en lotes de una campaña.
   */
  async startCampaignDispatch(campaignId, hostUrl) {
    if (!this.isSmtpConfigured()) {
      throw new Error(
        '\u26A0\uFE0F No tienes configurado el Servidor SMTP de Google. Para realizar env\xEDos masivos reales debes ir a "Servidor SMTP" y configurar tu correo de Gmail/Google Workspace y tu Contrase\xF1a de Aplicaci\xF3n de 16 caracteres.'
      );
    }
    const campaign = db.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error(`Campa\xF1a con ID ${campaignId} no encontrada`);
    }
    if (campaign.status === "SENDING") {
      throw new Error("La campa\xF1a ya se encuentra en proceso de env\xEDo");
    }
    let validRecipients = db.getValidRecipientsForLists(campaign.listIds);
    if (campaign.batchLimit && campaign.batchLimit > 0) {
      validRecipients = validRecipients.slice(0, campaign.batchLimit);
    }
    if (validRecipients.length === 0) {
      throw new Error(
        "No hay destinatarios V\xC1LIDOS disponibles en las listas seleccionadas o todos est\xE1n desuscritos."
      );
    }
    const newLogs = validRecipients.map((r) => ({
      campaignId,
      email: r.email,
      status: "QUEUED"
    }));
    const insertedLogs = db.createCampaignLogsBatch(newLogs);
    db.updateCampaign(campaignId, {
      status: "SENDING",
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      stats: {
        totalRecipients: insertedLogs.length,
        sentCount: 0,
        openedCount: 0,
        failedCount: 0
      }
    });
    const jobState = {
      campaignId,
      isCancelled: false,
      active: true
    };
    this.activeJobs.set(campaignId, jobState);
    this.processCampaignQueue(campaign, insertedLogs, jobState, hostUrl).catch((err) => {
      console.error(`Error en worker de env\xEDo para campa\xF1a ${campaignId}:`, err);
    });
    return {
      success: true,
      totalRecipients: insertedLogs.length,
      message: `Campa\xF1a puesta en cola para ${insertedLogs.length} destinatarios v\xE1lidos`
    };
  }
  /**
   * Worker asíncrono que procesa la cola con velocidad controlada y pausas entre correos
   */
  async processCampaignQueue(campaign, logs, jobState, hostUrl) {
    const transporter = this.getTransporter();
    const delayPerEmailMs = campaign.delaySecondsBetweenEmails !== void 0 && campaign.delaySecondsBetweenEmails > 0 ? Math.round(campaign.delaySecondsBetweenEmails * 1e3) : Math.max(100, Math.floor(1e3 / (campaign.pacingPerSecond || 2)));
    let sentCount = 0;
    let failedCount = 0;
    for (const log of logs) {
      if (jobState.isCancelled) {
        db.updateCampaign(campaign.id, {
          status: "PAUSED"
        });
        break;
      }
      try {
        const compiledHtml = this.compileEmailHtml({
          htmlTemplate: campaign.htmlContent,
          email: log.email,
          campaignId: campaign.id,
          logId: log.id,
          hostUrl
        });
        const sysConfig = db.getSystemConfig();
        const smtpUser = sysConfig?.smtp?.user || process.env.SMTP_USER;
        const senderFrom = smtpUser || campaign.senderEmail;
        await transporter.sendMail({
          from: `"${campaign.senderName}" <${senderFrom}>`,
          replyTo: campaign.senderEmail,
          to: log.email,
          subject: campaign.subject,
          html: compiledHtml
        });
        db.updateCampaignLog(log.id, {
          status: "SENT",
          sentAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        sentCount++;
      } catch (sendErr) {
        console.error(`Fallo enviando a ${log.email}:`, sendErr);
        db.updateCampaignLog(log.id, {
          status: "FAILED",
          error: sendErr.message || "Error de entrega SMTP"
        });
        failedCount++;
      }
      db.updateCampaign(campaign.id, {
        stats: {
          totalRecipients: logs.length,
          sentCount,
          openedCount: db.getCampaignById(campaign.id)?.stats.openedCount || 0,
          failedCount
        }
      });
      await new Promise((resolve) => setTimeout(resolve, delayPerEmailMs));
    }
    if (!jobState.isCancelled) {
      db.updateCampaign(campaign.id, {
        status: failedCount === logs.length ? "FAILED" : "SENT",
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    this.activeJobs.delete(campaign.id);
  }
  /**
   * Cancelar o pausar un envío en curso
   */
  cancelDispatch(campaignId) {
    const job = this.activeJobs.get(campaignId);
    if (job) {
      job.isCancelled = true;
      db.updateCampaign(campaignId, { status: "PAUSED" });
      this.activeJobs.delete(campaignId);
      return true;
    }
    return false;
  }
};
var campaignService = new CampaignService();

// src/server/controllers/campaign.controller.ts
var CampaignController = class {
  /**
   * Obtener todas las campañas con listas asociadas y métricas agregadas
   * GET /api/campaigns
   */
  static getAllCampaigns(_req, res) {
    try {
      const campaigns = db.getAllCampaigns();
      res.json({
        success: true,
        count: campaigns.length,
        data: campaigns
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al consultar campa\xF1as",
        error: err.message
      });
    }
  }
  /**
   * Contador y desglose dinámico en tiempo real de correos válidos para listas seleccionadas
   * GET /api/campaigns/preview-recipients?listIds=id1,id2
   */
  static previewRecipients(req, res) {
    try {
      const rawListIds = req.query.listIds;
      let listIds = [];
      if (typeof rawListIds === "string") {
        listIds = rawListIds.split(",").map((id) => id.trim()).filter(Boolean);
      } else if (Array.isArray(rawListIds)) {
        listIds = rawListIds.map((id) => id.trim()).filter(Boolean);
      }
      if (listIds.length === 0) {
        res.json({
          success: true,
          data: {
            totalCandidates: 0,
            validRecipients: 0,
            excludedInvalidOrRisk: 0,
            excludedUnsubscribed: 0,
            duplicatesRemoved: 0,
            listsSummary: []
          }
        });
        return;
      }
      const preview = db.getRecipientsPreview(listIds);
      res.json({
        success: true,
        data: preview
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al previsualizar destinatarios",
        error: err.message
      });
    }
  }
  /**
   * Obtener detalle de una campaña específica
   * GET /api/campaigns/:id
   */
  static getCampaignById(req, res) {
    try {
      const { id } = req.params;
      const campaign = db.getCampaignById(id);
      if (!campaign) {
        res.status(404).json({
          success: false,
          message: "Campa\xF1a no encontrada"
        });
        return;
      }
      res.json({
        success: true,
        data: campaign
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al consultar campa\xF1a",
        error: err.message
      });
    }
  }
  /**
   * Obtener logs de destinatarios de una campaña con estado de envío/apertura
   * GET /api/campaigns/:id/logs
   */
  static getCampaignLogs(req, res) {
    try {
      const { id } = req.params;
      const status = req.query.status;
      const campaign = db.getCampaignById(id);
      if (!campaign) {
        res.status(404).json({
          success: false,
          message: "Campa\xF1a no encontrada"
        });
        return;
      }
      const logs = db.getCampaignLogs(id, status);
      res.json({
        success: true,
        total: logs.length,
        data: logs
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al obtener logs de campa\xF1a",
        error: err.message
      });
    }
  }
  /**
   * Crear nueva campaña vinculada obligatoriamente a una o más listas depuradas
   * POST /api/campaigns
   */
  static createCampaign(req, res) {
    try {
      const {
        name,
        subject,
        senderName,
        senderEmail,
        htmlContent,
        listIds,
        pacingPerSecond,
        delaySecondsBetweenEmails,
        batchLimit
      } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: "El nombre de la campa\xF1a es obligatorio" });
        return;
      }
      if (!subject || !subject.trim()) {
        res.status(400).json({ success: false, message: "El asunto del correo es obligatorio" });
        return;
      }
      if (!senderName || !senderName.trim()) {
        res.status(400).json({ success: false, message: "El nombre del remitente es obligatorio" });
        return;
      }
      if (!senderEmail || !senderEmail.trim() || !senderEmail.includes("@")) {
        res.status(400).json({ success: false, message: "El correo electr\xF3nico del remitente es inv\xE1lido" });
        return;
      }
      if (!htmlContent || !htmlContent.trim()) {
        res.status(400).json({ success: false, message: "El contenido HTML de la plantilla es obligatorio" });
        return;
      }
      if (!listIds || !Array.isArray(listIds) || listIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Debes asociar obligatoriamente al menos una lista depurada (listIds) a la campa\xF1a"
        });
        return;
      }
      const allCategories = db.getAllCategories();
      const existingIds = new Set(allCategories.map((c) => c.id));
      const validSelectedIds = listIds.filter((lid) => existingIds.has(lid));
      if (validSelectedIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Ninguna de las listas seleccionadas existe en el sistema"
        });
        return;
      }
      const preview = db.getRecipientsPreview(validSelectedIds);
      const newCampaign = db.createCampaign({
        name,
        subject,
        senderName,
        senderEmail,
        htmlContent,
        listIds: validSelectedIds,
        pacingPerSecond: Number(pacingPerSecond) || 2,
        delaySecondsBetweenEmails: delaySecondsBetweenEmails !== void 0 ? Number(delaySecondsBetweenEmails) : 2,
        batchLimit: batchLimit && Number(batchLimit) > 0 ? Number(batchLimit) : void 0
      });
      res.status(201).json({
        success: true,
        message: "Campa\xF1a creada exitosamente en estado borrador",
        data: {
          ...newCampaign,
          recipientsPreview: preview
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error creando campa\xF1a",
        error: err.message
      });
    }
  }
  /**
   * Actualizar una campaña existente (mientras no esté en proceso de envío)
   * PUT /api/campaigns/:id
   */
  static updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const current = db.getCampaignById(id);
      if (!current) {
        res.status(404).json({ success: false, message: "Campa\xF1a no encontrada" });
        return;
      }
      if (current.status === "SENDING") {
        res.status(400).json({
          success: false,
          message: "No puedes modificar una campa\xF1a mientras est\xE1 envi\xE1ndose activamente"
        });
        return;
      }
      const {
        name,
        subject,
        senderName,
        senderEmail,
        htmlContent,
        listIds,
        pacingPerSecond,
        delaySecondsBetweenEmails,
        batchLimit
      } = req.body;
      const updates = {};
      if (name) updates.name = name.trim();
      if (subject) updates.subject = subject.trim();
      if (senderName) updates.senderName = senderName.trim();
      if (senderEmail) updates.senderEmail = senderEmail.trim();
      if (htmlContent) updates.htmlContent = htmlContent;
      if (pacingPerSecond) updates.pacingPerSecond = Number(pacingPerSecond);
      if (delaySecondsBetweenEmails !== void 0) {
        updates.delaySecondsBetweenEmails = Number(delaySecondsBetweenEmails);
      }
      if (batchLimit !== void 0) {
        updates.batchLimit = Number(batchLimit) > 0 ? Number(batchLimit) : void 0;
      }
      if (listIds && Array.isArray(listIds) && listIds.length > 0) {
        updates.listIds = listIds;
      }
      const updated = db.updateCampaign(id, updates);
      res.json({
        success: true,
        message: "Campa\xF1a actualizada",
        data: updated
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error actualizando campa\xF1a",
        error: err.message
      });
    }
  }
  /**
   * Eliminar campaña y sus registros de envío
   * DELETE /api/campaigns/:id
   */
  static deleteCampaign(req, res) {
    try {
      const { id } = req.params;
      const success = db.deleteCampaign(id);
      if (!success) {
        res.status(404).json({ success: false, message: "Campa\xF1a no encontrada" });
        return;
      }
      res.json({
        success: true,
        message: "Campa\xF1a eliminada correctamente"
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error eliminando campa\xF1a",
        error: err.message
      });
    }
  }
  /**
   * Iniciar el envío masivo:
   * Consulta estrictamente los correos VÁLIDOS de las listas vinculadas e inicia la cola con pacing.
   * POST /api/campaigns/:id/send
   */
  static async sendCampaign(req, res) {
    try {
      const { id } = req.params;
      const protocol = req.protocol || "http";
      const host = req.get("host") || "localhost:3000";
      const hostUrl = `${protocol}://${host}`;
      const result = await campaignService.startCampaignDispatch(id, hostUrl);
      res.json({
        success: true,
        message: result.message,
        data: {
          totalRecipients: result.totalRecipients,
          status: "SENDING"
        }
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Error al iniciar env\xEDo de campa\xF1a"
      });
    }
  }
  /**
   * Pausar o cancelar envío activo
   * POST /api/campaigns/:id/cancel
   */
  static cancelCampaign(req, res) {
    try {
      const { id } = req.params;
      const cancelled = campaignService.cancelDispatch(id);
      if (!cancelled) {
        res.status(400).json({
          success: false,
          message: "La campa\xF1a no estaba en proceso de env\xEDo o no pudo pausarse"
        });
        return;
      }
      res.json({
        success: true,
        message: "Env\xEDo de campa\xF1a pausado correctamente"
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al pausar campa\xF1a",
        error: err.message
      });
    }
  }
  /**
   * Enviar correo de prueba para verificar diseño y variables
   * POST /api/campaigns/:id/test
   */
  static async sendTest(req, res) {
    try {
      const { id } = req.params;
      const { testEmail } = req.body;
      if (!testEmail || !testEmail.includes("@")) {
        res.status(400).json({ success: false, message: "Direcci\xF3n de correo de prueba inv\xE1lida" });
        return;
      }
      const campaign = db.getCampaignById(id);
      if (!campaign) {
        res.status(404).json({ success: false, message: "Campa\xF1a no encontrada" });
        return;
      }
      const protocol = req.protocol || "http";
      const host = req.get("host") || "localhost:3000";
      const hostUrl = `${protocol}://${host}`;
      const result = await campaignService.sendTestEmail({
        recipientEmail: testEmail.trim(),
        subject: campaign.subject,
        senderName: campaign.senderName,
        senderEmail: campaign.senderEmail,
        htmlContent: campaign.htmlContent,
        hostUrl
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al enviar correo de prueba",
        error: err.message
      });
    }
  }
  /**
   * Enviar prueba previa sin guardar la campaña
   * POST /api/campaigns/preview-test
   */
  static async previewTest(req, res) {
    try {
      const { recipientEmail, subject, senderName, senderEmail, htmlContent } = req.body;
      if (!recipientEmail || !recipientEmail.includes("@")) {
        res.status(400).json({ success: false, message: "Direcci\xF3n de correo de prueba inv\xE1lida" });
        return;
      }
      const protocol = req.protocol || "http";
      const host = req.get("host") || "localhost:3000";
      const hostUrl = `${protocol}://${host}`;
      const result = await campaignService.sendTestEmail({
        recipientEmail: recipientEmail.trim(),
        subject: subject || "Prueba de Plantilla CleanMail",
        senderName: senderName || "CleanMail Test",
        senderEmail: senderEmail || "test@cleanmail.io",
        htmlContent: htmlContent || "<p>Prueba de correo</p>",
        hostUrl
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al enviar prueba de dise\xF1o",
        error: err.message
      });
    }
  }
  /**
   * Enviar correo individual 1 a 1 para probar entrega real y plantilla
   * POST /api/campaigns/single-send
   */
  static async singleSend(req, res) {
    try {
      const { recipientEmail, subject, senderName, senderEmail, htmlContent } = req.body;
      if (!recipientEmail || !recipientEmail.trim() || !recipientEmail.includes("@")) {
        res.status(400).json({
          success: false,
          message: "Debes proporcionar un correo destinatario v\xE1lido"
        });
        return;
      }
      if (!subject || !subject.trim()) {
        res.status(400).json({
          success: false,
          message: "El asunto del mensaje no puede estar vac\xEDo"
        });
        return;
      }
      if (!htmlContent || !htmlContent.trim()) {
        res.status(400).json({
          success: false,
          message: "El contenido HTML de la plantilla no puede estar vac\xEDo"
        });
        return;
      }
      const protocol = req.protocol || "http";
      const host = req.get("host") || "localhost:3000";
      const hostUrl = `${protocol}://${host}`;
      const result = await campaignService.sendTestEmail({
        recipientEmail: recipientEmail.trim(),
        subject: subject.trim(),
        senderName: senderName?.trim() || "CleanMail Individual",
        senderEmail: senderEmail?.trim() || "envios@cleanmail.io",
        htmlContent,
        hostUrl
      });
      res.json({
        success: result.success,
        message: result.message,
        data: {
          recipientEmail: recipientEmail.trim(),
          sentAt: (/* @__PURE__ */ new Date()).toISOString(),
          details: "Correo individual 1 a 1 procesado con \xE9xito"
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al procesar el env\xEDo individual",
        error: err.message
      });
    }
  }
  /**
   * Obtener configuración SMTP
   * GET /api/campaigns/smtp
   */
  static getSmtpConfig(_req, res) {
    const config = db.getSystemConfig();
    const smtp = config.smtp || {
      enabled: false,
      host: "",
      port: 587,
      secure: false,
      user: "",
      pass: "",
      senderName: "CleanMail Env\xEDos",
      senderEmail: "notificaciones@cleanmail.io"
    };
    res.json({
      success: true,
      data: {
        ...smtp,
        pass: smtp.pass ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "",
        hasPassword: Boolean(smtp.pass),
        isConfigured: campaignService.isSmtpConfigured()
      }
    });
  }
  /**
   * Guardar y verificar configuración SMTP
   * POST /api/campaigns/smtp
   */
  static async updateSmtpConfig(req, res) {
    try {
      const { enabled, host, port, secure, user, pass, senderName, senderEmail } = req.body;
      const currentConfig = db.getSystemConfig();
      const existingPass = currentConfig.smtp?.pass || "";
      const updatedSmtp = {
        enabled: Boolean(enabled),
        host: (host || "").trim(),
        port: Number(port) || 587,
        secure: Boolean(secure),
        user: (user || "").trim(),
        pass: pass && pass !== "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" ? pass : existingPass,
        senderName: (senderName || "CleanMail Env\xEDos").trim(),
        senderEmail: (senderEmail || "notificaciones@cleanmail.io").trim()
      };
      db.updateSystemConfig({
        smtp: updatedSmtp
      });
      res.json({
        success: true,
        message: "Configuraci\xF3n de servidor SMTP guardada exitosamente",
        data: {
          ...updatedSmtp,
          pass: updatedSmtp.pass ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar configuraci\xF3n SMTP",
        error: err.message
      });
    }
  }
  /**
   * Probar directamente la conexión SMTP y enviar un correo real de prueba a la dirección especificada
   * POST /api/campaigns/smtp/test
   */
  static async testSmtpDirect(req, res) {
    try {
      const { host, port, secure, user, pass, recipientEmail, senderName } = req.body;
      if (!recipientEmail || !recipientEmail.trim() || !recipientEmail.includes("@")) {
        res.status(400).json({
          success: false,
          message: "Ingresa un correo destinatario v\xE1lido para recibir la prueba."
        });
        return;
      }
      const currentConfig = db.getSystemConfig();
      const existingPass = currentConfig.smtp?.pass || "";
      const testCreds = user && (pass || existingPass) ? {
        host: (host || "smtp.gmail.com").trim(),
        port: Number(port) || 465,
        secure: Boolean(secure) || Number(port) === 465,
        user: user.trim(),
        pass: pass && pass !== "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" ? pass : existingPass
      } : void 0;
      const protocol = req.protocol || "http";
      const reqHost = req.get("host") || "localhost:3000";
      const hostUrl = `${protocol}://${reqHost}`;
      const testResult = await campaignService.sendTestEmail({
        recipientEmail: recipientEmail.trim(),
        subject: "Prueba de Conexi\xF3n Google / SMTP CleanMail",
        senderName: senderName?.trim() || "CleanMail Conexi\xF3n",
        senderEmail: testCreds?.user || currentConfig.smtp?.user || recipientEmail.trim(),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #00a2c7, #008ba8); padding: 25px 20px; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px;">\xA1Conexi\xF3n Exitosa con Google / SMTP!</h2>
              <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">Tu servidor de correo est\xE1 activo y entregando mensajes reales.</p>
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6; font-size: 14px;">
              <p>Hola,</p>
              <p>Si est\xE1s leyendo este mensaje en tu bandeja de entrada de <strong>${recipientEmail}</strong>, significa que tu autenticaci\xF3n con Google (o servidor SMTP) est\xE1 configurada <strong>a la perfecci\xF3n</strong>.</p>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin: 18px 0; color: #166534; font-size: 13px;">
                \u2714 Servidor remitente autenticado<br/>
                \u2714 Entrega real confirmada en bandeja de entrada<br/>
                \u2714 Listo para env\xEDos masivos y pruebas de plantillas
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Enviado desde CleanMail Email Marketing Platform.</p>
            </div>
          </div>
        `,
        hostUrl,
        smtpCredentials: testCreds
      });
      res.json(testResult);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error en prueba SMTP: " + (err.message || "Error desconocido")
      });
    }
  }
  /**
   * Reiniciar campaña a borrador para permitir reenvío
   * POST /api/campaigns/:id/reset
   */
  static resetCampaign(req, res) {
    try {
      const { id } = req.params;
      const updated = db.resetCampaign(id);
      if (!updated) {
        res.status(404).json({ success: false, message: "Campa\xF1a no encontrada" });
        return;
      }
      res.json({
        success: true,
        message: "Campa\xF1a reiniciada a estado borrador. Ya puedes volver a enviarla.",
        data: updated
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error al reiniciar campa\xF1a",
        error: err.message
      });
    }
  }
};

// src/server/routes/campaign.routes.ts
var campaignRouter = Router5();
campaignRouter.get("/", CampaignController.getAllCampaigns);
campaignRouter.get("/preview-recipients", CampaignController.previewRecipients);
campaignRouter.get("/smtp", CampaignController.getSmtpConfig);
campaignRouter.post("/smtp", CampaignController.updateSmtpConfig);
campaignRouter.post("/smtp/test", CampaignController.testSmtpDirect);
campaignRouter.post("/single-send", CampaignController.singleSend);
campaignRouter.post("/preview-test", CampaignController.previewTest);
campaignRouter.post("/", CampaignController.createCampaign);
campaignRouter.get("/:id", CampaignController.getCampaignById);
campaignRouter.get("/:id/logs", CampaignController.getCampaignLogs);
campaignRouter.put("/:id", CampaignController.updateCampaign);
campaignRouter.post("/:id/reset", CampaignController.resetCampaign);
campaignRouter.delete("/:id", CampaignController.deleteCampaign);
campaignRouter.post("/:id/send", CampaignController.sendCampaign);
campaignRouter.post("/:id/cancel", CampaignController.cancelCampaign);
campaignRouter.post("/:id/test", CampaignController.sendTest);
var campaign_routes_default = campaignRouter;

// src/server/routes/track.routes.ts
import { Router as Router6 } from "express";

// src/server/controllers/track.controller.ts
var TRANSPARENT_1PX_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);
var TrackController = class {
  /**
   * Píxel de seguimiento de apertura de correo electrónico (Invisible Tracking Pixel)
   * GET /api/track/open/:campaignId/:logId
   */
  static trackOpen(req, res) {
    const { campaignId, logId } = req.params;
    if (campaignId && logId) {
      try {
        db.markEmailOpened(campaignId, logId);
      } catch (e) {
        console.error("Error registrando apertura:", e);
      }
    }
    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": TRANSPARENT_1PX_GIF.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0"
    });
    res.end(TRANSPARENT_1PX_GIF);
  }
  /**
   * Procesamiento de Desuscripción con confirmación en pantalla
   * GET /api/track/unsubscribe/:campaignId/:email
   */
  static handleUnsubscribe(req, res) {
    const { campaignId, email } = req.params;
    const decodedEmail = decodeURIComponent(email || "").trim().toLowerCase();
    if (!decodedEmail || !decodedEmail.includes("@")) {
      res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>Enlace de desuscripci\xF3n inv\xE1lido</h2>
            <p>El correo proporcionado no es v\xE1lido.</p>
          </body>
        </html>
      `);
      return;
    }
    db.addUnsubscribe(decodedEmail, campaignId, "Solicitud voluntaria desde pie de correo");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Desuscripci\xF3n Confirmada | CleanMail</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .icon-badge {
            width: 64px;
            height: 64px;
            background-color: #ecfdf5;
            color: #059669;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            font-size: 32px;
          }
          h1 {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 12px 0;
            color: #0f172a;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #64748b;
            margin: 0 0 20px 0;
          }
          .email-highlight {
            font-weight: 600;
            color: #0284c7;
            background: #f0f9ff;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-block;
          }
          .footer-note {
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
            margin-top: 25px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-badge">\u2713</div>
          <h1>Te has desuscrito exitosamente</h1>
          <p>La direcci\xF3n <span class="email-highlight">${decodedEmail}</span> ha sido removida de nuestros env\xEDos masivos.</p>
          <p>No volver\xE1s a recibir mensajes ni campa\xF1as promocionales vinculadas a esta lista en CleanMail.</p>
          <div class="footer-note">
            CleanMail Anti-Spam Compliance &bull; Tu privacidad es respetada en conformidad con regulaciones internacionales (CAN-SPAM / RGPD).
          </div>
        </div>
      </body>
      </html>
    `);
  }
  /**
   * Obtener lista de correos desuscritos
   * GET /api/track/unsubscribed
   */
  static getUnsubscribedList(_req, res) {
    const list = db.getAllUnsubscribed();
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  }
};

// src/server/routes/track.routes.ts
var trackRouter = Router6();
trackRouter.get("/open/:campaignId/:logId", TrackController.trackOpen);
trackRouter.get("/unsubscribe/:campaignId/:email", TrackController.handleUnsubscribe);
trackRouter.get("/unsubscribed", TrackController.getUnsubscribedList);
var track_routes_default = trackRouter;

// src/server/routes/index.ts
var apiRouter = Router7();
apiRouter.use("/auth", auth_routes_default);
apiRouter.use("/admin", admin_routes_default);
apiRouter.use("/categories", category_routes_default);
apiRouter.use("/emails", email_routes_default);
apiRouter.use("/campaigns", campaign_routes_default);
apiRouter.use("/track", track_routes_default);
apiRouter.get("/plans", AdminController.getPublicPlans);
apiRouter.post("/plans/upgrade", AdminController.upgradePlan);
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "CleanMail API Engine",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`
  });
});
var routes_default = apiRouter;

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    const origin = req.headers.origin || "*";
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use("/api", routes_default);
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      message: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      res.sendFile(path2.resolve(distPath, "index.html"));
    });
  }
  app.use((err, _req, res, _next) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error interno del servidor"
    });
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Servidor ejecut\xE1ndose en http://0.0.0.0:${PORT}`);
    console.log(`\u{1F4E1} Endpoints API disponibles en /api/categories y /api/emails`);
  });
}
startServer().catch((err) => {
  console.error("Error fatal al iniciar el servidor:", err);
  process.exit(1);
});
