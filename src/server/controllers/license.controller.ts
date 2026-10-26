import type { Request, Response } from 'express';
import { LicenseService } from '../services/license.service.ts';
import { db } from '../db/database.ts';

export class LicenseController {
  /**
   * Obtiene el estado actual de la licencia instalada
   * GET /api/license/status (Público/Autenticado)
   */
  public static getStatus(req: Request, res: Response) {
    try {
      const host = (req.headers.host || '').toString();
      const status = LicenseService.getActiveLicenseStatus(host);
      return res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: (err as Error).message || 'Error al consultar estado de la licencia.',
      });
    }
  }

  /**
   * Activa o actualiza una clave de licencia
   * POST /api/license/activate (Requiere Admin)
   */
  public static activate(req: Request, res: Response) {
    try {
      const { licenseKey } = req.body;
      if (!licenseKey || typeof licenseKey !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar una clave de licencia válida (formato CLM-1...).',
        });
      }

      const host = (req.headers.host || '').toString();
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '').toString();
      const result = LicenseService.activateLicense(licenseKey.trim(), host, ip);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
          data: result,
        });
      }

      return res.status(200).json({
        success: true,
        message: `¡Licencia ${result.license?.plan.toUpperCase()} activada con éxito para ${result.license?.clientName}!`,
        data: result,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: (err as Error).message || 'Error al procesar la activación de la licencia.',
      });
    }
  }

  /**
   * Obtiene la lista completa de todas las licencias emitidas (Registro Maestro)
   * GET /api/license/generated
   */
  public static getAllGenerated(_req: Request, res: Response) {
    try {
      const list = db.getGeneratedLicenses();
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Revoca / Invalida una licencia en el acto
   * POST /api/license/revoke/:id
   */
  public static revoke(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};
      const success = db.revokeLicense(id, reason);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró la licencia en el registro maestro.',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Licencia ${id} INVALIDADA. Ningún servidor ni cliente podrá utilizarla a partir de este momento.`,
        data: { licenseId: id, status: 'REVOKED' },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Reactiva una licencia previamente revocada
   * POST /api/license/reactivate/:id
   */
  public static reactivate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = db.reactivateLicense(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró la licencia en el registro.',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Licencia ${id} reactivada correctamente. El cliente vuelve a tener acceso total.`,
        data: { licenseId: id, status: 'ACTIVE' },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Elimina permanentemente una licencia del registro maestro
   * DELETE /api/license/generated/:id
   */
  public static deleteGenerated(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = db.deleteGeneratedLicense(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Licencia no encontrada en el registro.',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Registro de licencia ${id} eliminado.`,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Generador de licencias exclusivo para el Super Administrador / Creador
   * POST /api/admin/license/generate
   */
  public static generate(req: Request, res: Response) {
    try {
      const {
        clientName,
        clientEmail,
        domain,
        plan,
        daysValid,
        maxCredits,
        maxUsers,
      } = req.body;

      if (!clientName || !clientEmail) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y correo del cliente son requeridos.',
        });
      }

      const generated = LicenseService.generateLicenseKey({
        clientName: String(clientName),
        clientEmail: String(clientEmail),
        domain: domain ? String(domain) : '*',
        plan: plan || 'enterprise',
        daysValid: typeof daysValid === 'number' ? daysValid : 365,
        maxCredits: typeof maxCredits === 'number' ? maxCredits : -1,
        maxUsers: typeof maxUsers === 'number' ? maxUsers : -1,
      });

      return res.status(201).json({
        success: true,
        message: '¡Clave de licencia generada y registrada exitosamente!',
        data: generated,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: (err as Error).message || 'Error al generar clave de licencia.',
      });
    }
  }

  /**
   * Elimina la licencia actual instalada localmente
   * DELETE /api/license
   */
  public static remove(_req: Request, res: Response) {
    try {
      db.deleteLicense();
      return res.status(200).json({
        success: true,
        message: 'Licencia eliminada. El sistema volverá al modo de activación requerido.',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }
}
