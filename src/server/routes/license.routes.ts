import { Router } from 'express';
import { LicenseController } from '../controllers/license.controller.ts';
import { AuthController } from '../controllers/auth.controller.ts';

const router = Router();

// Consultar estado de la licencia (público / UI)
router.get('/status', LicenseController.getStatus);

// Activar licencia con clave
router.post('/activate', AuthController.requireAdmin, LicenseController.activate);

// Generar licencia (exclusivo Super Administrador)
router.post('/generate', AuthController.requireAdmin, LicenseController.generate);

// Eliminar licencia activa
router.delete('/', AuthController.requireAdmin, LicenseController.remove);

export default router;
