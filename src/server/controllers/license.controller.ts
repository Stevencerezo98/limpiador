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
      const result = LicenseService.activateLicense(licenseKey.trim(), host);

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
        message: '¡Clave de licencia generada exitosamente!',
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
   * Elimina la licencia actual para pruebas
   * DELETE /api/admin/license
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
