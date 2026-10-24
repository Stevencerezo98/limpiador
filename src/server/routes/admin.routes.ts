import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.ts';
import { AuthController } from '../controllers/auth.controller.ts';

const router = Router();

// Todas las rutas de administración requieren autenticación y rol de Administrador
router.get('/config', AuthController.requireAdmin, AdminController.getConfig);
router.put('/config', AuthController.requireAdmin, AdminController.updateConfig);

// Gestión de Planes de Depuración (Exclusivo Administrador)
router.get('/plans', AuthController.requireAdmin, AdminController.getPlans);
router.put('/plans/:id', AuthController.requireAdmin, AdminController.updatePlan);
router.post('/plans', AuthController.requireAdmin, AdminController.createPlan);
router.delete('/plans/:id', AuthController.requireAdmin, AdminController.deletePlan);
router.post('/plans/reset', AuthController.requireAdmin, AdminController.resetPlans);

// Copias de Seguridad y Migración Completa del Sistema (db.json)
router.get('/backup', AuthController.requireAdmin, AdminController.downloadBackup);
router.post('/restore', AuthController.requireAdmin, AdminController.restoreBackup);

// Gestión de Usuarios y Permisos (RBAC - Exclusivo Administrador)
router.get('/users', AuthController.requireAdmin, AdminController.getUsers);
router.post('/users', AuthController.requireAdmin, AdminController.createUser);
router.put('/users/:id', AuthController.requireAdmin, AdminController.updateUser);
router.delete('/users/:id', AuthController.requireAdmin, AdminController.deleteUser);

// Editor CMS de la Página Landing (Exclusivo Administrador)
router.get('/landing', AuthController.requireAdmin, AdminController.getPublicLandingConfig);
router.put('/landing', AuthController.requireAdmin, AdminController.updateLandingConfig);
router.post('/landing/reset', AuthController.requireAdmin, AdminController.resetLandingConfig);

export default router;
