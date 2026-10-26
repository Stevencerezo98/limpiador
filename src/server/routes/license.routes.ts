import { Router } from 'express';
import { LicenseController } from '../controllers/license.controller.ts';
import { AuthController } from '../controllers/auth.controller.ts';

const router = Router();

// Consultar estado de la licencia (público / UI)
router.get('/status', LicenseController.getStatus);

// Activar licencia con clave
router.post('/activate', AuthController.requireAdmin, LicenseController.activate);

// Registro Maestro de Licencias Emitidas (exclusivo Super Administrador)
router.get('/generated', AuthController.requireAdmin, LicenseController.getAllGenerated);
router.post('/revoke/:id', AuthController.requireAdmin, LicenseController.revoke);
router.post('/reactivate/:id', AuthController.requireAdmin, LicenseController.reactivate);
router.delete('/generated/:id', AuthController.requireAdmin, LicenseController.deleteGenerated);

// Generar licencia (exclusivo Super Administrador)
router.post('/generate', AuthController.requireAdmin, LicenseController.generate);

// Eliminar licencia activa instalada
router.delete('/', AuthController.requireAdmin, LicenseController.remove);

export default router;
