import crypto from 'crypto';
import type {
  AppLicense,
  AppLicensePayload,
  LicenseVerificationResult,
  LicensePlan,
} from '../db/schema.ts';
import { db } from '../db/database.ts';

// Clave Secreta Maestra del Desarrollador (usada para firmar y verificar tokens)
// Solo tú (el vendedor) conoces esta clave para generar licencias que los clientes no puedan falsificar.
const MASTER_LICENSE_SECRET =
  process.env.CLEANMAIL_LICENSE_SECRET ||
  'CLEANMAIL_PRO_HMAC256_MASTER_SECRET_KEY_2026_STEVE_DEVELOPMENT';

export class LicenseService {
  /**
   * Genera una clave de licencia criptográfica a partir de los datos del cliente
   */
  public static generateLicenseKey(data: {
    clientName: string;
    clientEmail: string;
    domain: string; // ej. "cleanmail.unio.my" o "*" para cualquier dominio
    plan: LicensePlan;
    daysValid: number; // 0 = vitalicia (lifetime)
    maxCredits?: number; // -1 = ilimitados
    maxUsers?: number; // -1 = ilimitados
    features?: string[];
  }): { rawKey: string; payload: AppLicensePayload } {
    const issuedAt = new Date().toISOString();
    let expiresAt = 'never';

    if (data.daysValid > 0) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + data.daysValid);
      expiresAt = expDate.toISOString();
    }

    const payload: AppLicensePayload = {
      licenseId: 'LIC-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      clientName: data.clientName.trim(),
      clientEmail: data.clientEmail.trim(),
      domain: (data.domain || '*').trim().toLowerCase(),
      plan: data.plan,
      issuedAt,
      expiresAt,
      maxCredits: data.maxCredits ?? -1,
      maxUsers: data.maxUsers ?? -1,
      features: data.features || [
        'validation',
        'campaigns',
        'api',
        'rbac',
        'landing_cms',
        'dns_mx',
      ],
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', MASTER_LICENSE_SECRET)
      .update(payloadBase64)
      .digest('hex');

    const rawKey = `CLM-1.${payloadBase64}.${signature}`;

    return { rawKey, payload };
  }

  /**
   * Verifica la integridad, autenticidad y vigencia de una clave de licencia
   */
  public static verifyLicenseKey(
    rawKey: string,
    currentHost?: string
  ): LicenseVerificationResult {
    if (!rawKey || typeof rawKey !== 'string') {
      return {
        valid: false,
        status: 'NO_LICENSE',
        message: 'No se ha configurado ninguna licencia activa para este servidor.',
      };
    }

    const parts = rawKey.trim().split('.');
    if (parts.length !== 3 || !parts[0].startsWith('CLM-')) {
      return {
        valid: false,
        status: 'INVALID_SIGNATURE',
        message: 'El formato de la clave de licencia es inválido. Debe comenzar con CLM-1.',
      };
    }

    const [, payloadBase64, providedSignature] = parts;

    // 1. Verificar firma HMAC-SHA256 con la clave maestra
    const expectedSignature = crypto
      .createHmac('sha256', MASTER_LICENSE_SECRET)
      .update(payloadBase64)
      .digest('hex');

    if (providedSignature !== expectedSignature) {
      return {
        valid: false,
        status: 'INVALID_SIGNATURE',
        message: 'Firma de licencia inválida o adulterada. La clave no fue emitida por el creador del software.',
      };
    }

    // 2. Decodificar payload
    let payload: AppLicensePayload;
    try {
      const decodedJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
      payload = JSON.parse(decodedJson);
    } catch {
      return {
        valid: false,
        status: 'INVALID_SIGNATURE',
        message: 'Error al interpretar los datos cifrados de la licencia.',
      };
    }

    // 3. Verificar fecha de expiración
    let daysRemaining = 9999;
    if (payload.expiresAt && payload.expiresAt !== 'never') {
      const expTime = new Date(payload.expiresAt).getTime();
      const now = Date.now();
      if (isNaN(expTime)) {
        return {
          valid: false,
          status: 'EXPIRED',
          message: 'Fecha de vencimiento de licencia inválida.',
        };
      }

      if (now > expTime) {
        return {
          valid: false,
          status: 'EXPIRED',
          message: `La licencia expiró el ${new Date(expTime).toLocaleDateString()}. Por favor renueva tu suscripción.`,
          daysRemaining: 0,
          license: payload,
          rawKey,
        };
      }

      daysRemaining = Math.max(0, Math.ceil((expTime - now) / (1000 * 60 * 60 * 24)));
    }

    // 4. Verificar restricción de dominio (si no es comodín '*')
    if (payload.domain && payload.domain !== '*' && currentHost) {
      const hostClean = currentHost.split(':')[0].toLowerCase();
      const allowedDomains = payload.domain
        .toLowerCase()
        .split(',')
        .map((d) => d.trim());

      // Permitir pruebas locales en localhost o IP privada
      const isLocal =
        hostClean === 'localhost' ||
        hostClean === '127.0.0.1' ||
        hostClean.startsWith('192.168.') ||
        hostClean.startsWith('10.');

      const isDomainAllowed =
        isLocal ||
        allowedDomains.some(
          (allowed) =>
            hostClean === allowed ||
            hostClean.endsWith('.' + allowed) ||
            allowed.endsWith('.' + hostClean)
        );

      if (!isDomainAllowed) {
        return {
          valid: false,
          status: 'DOMAIN_MISMATCH',
          message: `Esta licencia está autorizada exclusivamente para el dominio: ${payload.domain}. Tu servidor actual es: ${hostClean}`,
          daysRemaining,
          license: payload,
          rawKey,
        };
      }
    }

    return {
      valid: true,
      status: 'ACTIVE',
      message: 'Licencia activa y verificada correctamente.',
      daysRemaining,
      license: payload,
      rawKey,
    };
  }

  /**
   * Activa y almacena una licencia en la base de datos
   */
  public static activateLicense(
    rawKey: string,
    currentHost?: string
  ): LicenseVerificationResult {
    const result = this.verifyLicenseKey(rawKey, currentHost);
    if (!result.valid || !result.license) {
      return result;
    }

    const appLicense: AppLicense = {
      rawKey: rawKey.trim(),
      payload: result.license,
      signature: rawKey.split('.')[2] || '',
      activatedAt: new Date().toISOString(),
    };

    db.saveLicense(appLicense);

    // Si la licencia tiene créditos específicos asignados, ajustar configuración
    if (result.license.maxCredits && result.license.maxCredits > 0) {
      const config = db.getSystemConfig();
      db.updateSystemConfig({
        ...config,
        planName: `Licencia ${result.license.plan.toUpperCase()} (${result.license.clientName})`,
        creditosDisponibles: Math.max(config.creditosDisponibles, result.license.maxCredits),
      });
    }

    return result;
  }

  /**
   * Obtiene el estado actual de la licencia instalada en el sistema
   */
  public static getActiveLicenseStatus(currentHost?: string): LicenseVerificationResult {
    const stored = db.getLicense();
    if (!stored || !stored.rawKey) {
      // Auto-generar una licencia inicial de prueba (Trial 365 días) vinculada a los dominios autorizados
      const autoTrial = this.generateLicenseKey({
        clientName: 'Cliente CleanMail Oficial',
        clientEmail: 'admin@unio.my',
        domain: 'cleanmail.unio.my,unio.my,localhost',
        plan: 'enterprise',
        daysValid: 365,
        maxCredits: 500000,
        maxUsers: 10,
      });

      const trialLicense: AppLicense = {
        rawKey: autoTrial.rawKey,
        payload: autoTrial.payload,
        signature: autoTrial.rawKey.split('.')[2],
        activatedAt: new Date().toISOString(),
      };

      db.saveLicense(trialLicense);
      return this.verifyLicenseKey(trialLicense.rawKey, currentHost);
    }

    return this.verifyLicenseKey(stored.rawKey, currentHost);
  }
}
