import type { Request, Response, NextFunction } from 'express';
import { LicenseService } from '../services/license.service.ts';

export function requireValidLicense(req: Request, res: Response, next: NextFunction) {
  try {
    const host = (req.headers.host || '').toString();
    const result = LicenseService.getActiveLicenseStatus(host);

    if (!result.valid) {
      return res.status(402).json({
        success: false,
        licenseRequired: true,
        status: result.status,
        message:
          result.message ||
          'Acceso bloqueado: CleanMail requiere una licencia activa y válida para ejecutar esta operación.',
        data: result,
      });
    }

    // Licencia válida, continuar
    return next();
  } catch (err) {
    console.error('Error al verificar licencia en middleware:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al comprobar validación de licencia.',
    });
  }
}
