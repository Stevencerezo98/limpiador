import type { Request, Response } from 'express';
import { db } from '../db/database.ts';

export class AdminController {
  public static getConfig(_req: Request, res: Response) {
    try {
      const config = db.getSystemConfig();
      return res.status(200).json({ success: true, data: config });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public static updateConfig(req: Request, res: Response) {
    try {
      const {
        planName,
        planType,
        creditosDisponibles,
        limiteMensual,
        autoCleanDuplicates,
        strictMxChecking,
        alertaCreditosBajos,
        umbralAlerta,
      } = req.body;

      const updated = db.updateSystemConfig({
        planName: planName !== undefined ? String(planName).trim() : undefined,
        planType,
        creditosDisponibles:
          creditosDisponibles !== undefined ? parseInt(String(creditosDisponibles), 10) : undefined,
        limiteMensual: limiteMensual !== undefined ? parseInt(String(limiteMensual), 10) : undefined,
        autoCleanDuplicates: autoCleanDuplicates !== undefined ? Boolean(autoCleanDuplicates) : undefined,
        strictMxChecking: strictMxChecking !== undefined ? Boolean(strictMxChecking) : undefined,
        alertaCreditosBajos: alertaCreditosBajos !== undefined ? Boolean(alertaCreditosBajos) : undefined,
        umbralAlerta: umbralAlerta !== undefined ? parseInt(String(umbralAlerta), 10) : undefined,
      });

      return res.status(200).json({
        success: true,
        message: 'Configuración de plan y créditos actualizada correctamente.',
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // Métodos de Planes de Depuración (Landing)
  public static getPlans(_req: Request, res: Response) {
    try {
      const plans = db.getLandingPlans();
      return res.status(200).json({ success: true, data: plans });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public static getPublicPlans(_req: Request, res: Response) {
    try {
      const plans = db.getLandingPlans().filter((p) => p.active);
      return res.status(200).json({ success: true, data: plans });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public static updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = db.updateLandingPlan(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Plan no encontrado.' });
      }
      return res.status(200).json({
        success: true,
        message: 'Plan de depuración actualizado exitosamente.',
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public static createPlan(req: Request, res: Response) {
    try {
      const { name, credits, price, currency, period, description, features, badge, popular, active } = req.body;
      if (!name || price === undefined || !credits) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, créditos y precio son obligatorios para crear el plan.',
        });
      }

      const newPlan = db.createLandingPlan({
        name: String(name).trim(),
        credits: Number(credits),
        price: Number(price),
        currency: currency || 'USD',
        period: period || 'pago único',
        description: description || '',
        features: Array.isArray(features) ? features : [],
        badge: badge || undefined,
        popular: Boolean(popular),
        active: active !== undefined ? Boolean(active) : true,
      });

      return res.status(201).json({
        success: true,
        message: 'Nuevo plan creado exitosamente.',
        data: newPlan,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public static deletePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = db.deleteLandingPlan(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Plan no encontrado.' });
      }
      return res.status(200).json({ success: true, message: 'Plan eliminado.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public static resetPlans(_req: Request, res: Response) {
    try {
      const plans = db.resetLandingPlans();
      return res.status(200).json({
        success: true,
        message: 'Planes restaurados a los valores por defecto.',
        data: plans,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  /**
   * Actualizar plan de cuenta y recargar créditos de depuración
   */
  public static upgradePlan(req: Request, res: Response) {
    try {
      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar el ID del plan a contratar o actualizar.',
        });
      }

      const plans = db.getLandingPlans();
      const selectedPlan =
        plans.find((p) => p.id === planId) ||
        plans.find((p) => p.id === `plan-${planId}`) ||
        plans.find((p) => p.name.toLowerCase().includes(String(planId).toLowerCase()));

      if (!selectedPlan) {
        return res.status(404).json({
          success: false,
          message: `El plan "${planId}" no existe en el catálogo.`,
        });
      }

      const currentConfig = db.getSystemConfig();
      const isUnlimited = selectedPlan.id === 'plan-unlimited' || selectedPlan.credits >= 1000000;
      const newPlanType = isUnlimited
        ? 'unlimited'
        : selectedPlan.credits >= 200000
        ? 'enterprise'
        : selectedPlan.credits >= 40000
        ? 'pro'
        : 'starter';

      const newCredits = isUnlimited
        ? 1000000
        : Math.max(selectedPlan.credits, currentConfig.creditosDisponibles + selectedPlan.credits);

      const updated = db.updateSystemConfig({
        planName: selectedPlan.name,
        planType: newPlanType as any,
        creditosDisponibles: newCredits,
        limiteMensual: isUnlimited ? 1000000 : Math.max(selectedPlan.credits, currentConfig.limiteMensual),
      });

      return res.status(200).json({
        success: true,
        message: `¡Plan actualizado con éxito a ${selectedPlan.name}! Tu cuenta ahora dispone de ${newCredits.toLocaleString()} créditos de depuración.`,
        data: {
          config: updated,
          plan: selectedPlan,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // Descargar Copia de Seguridad completa del sistema (db.json)
  public static downloadBackup(_req: Request, res: Response) {
    try {
      const data = db.getRawData();
      const filename = `cleanmail_backup_${new Date().toISOString().split('T')[0]}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(data, null, 2));
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // Restaurar Copia de Seguridad desde archivo JSON
  public static restoreBackup(req: Request, res: Response) {
    try {
      const backupData = req.body;
      if (!backupData || typeof backupData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Estructura de copia de seguridad no válida.',
        });
      }

      const result = db.restoreRawData(backupData);
      return res.status(200).json({
        success: true,
        message: `Base de datos restaurada correctamente: ${result.categoriasCount} listas, ${result.correosCount.toLocaleString()} correos y ${result.campaignsCount} campañas recuperadas.`,
        data: result,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // --- GESTIÓN DE USUARIOS Y CONTROL DE ACCESOS (RBAC) ---

  public static getUsers(_req: Request, res: Response) {
    try {
      const users = db.getUsers().map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        status: u.status,
        permissions: u.permissions,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
      }));
      return res.status(200).json({ success: true, data: users });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public static createUser(req: Request, res: Response) {
    try {
      const { username, name, password, role, status, permissions } = req.body;
      if (!username || !name) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de usuario y nombre completo son obligatorios.',
        });
      }

      const newUser = db.createUser({
        username,
        name,
        password,
        role,
        status,
        permissions,
      });

      return res.status(201).json({
        success: true,
        message: `Usuario "${newUser.name}" creado con éxito.`,
        data: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
          status: newUser.status,
          permissions: newUser.permissions,
          createdAt: newUser.createdAt,
        },
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  public static updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { username, name, password, role, status, permissions } = req.body;

      const updated = db.updateUser(id, {
        username,
        name,
        password,
        role,
        status,
        permissions,
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      }

      return res.status(200).json({
        success: true,
        message: `Usuario "${updated.name}" actualizado con éxito.`,
        data: {
          id: updated.id,
          username: updated.username,
          name: updated.name,
          role: updated.role,
          status: updated.status,
          permissions: updated.permissions,
          createdAt: updated.createdAt,
        },
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  public static deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = db.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      }
      return res.status(200).json({ success: true, message: 'Usuario eliminado correctamente.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  // ==========================================
  // CMS: GESTIÓN DE PÁGINA LANDING (unio.my)
  // ==========================================

  public static getPublicLandingConfig(_req: Request, res: Response) {
    try {
      const config = db.getLandingConfig();
      return res.status(200).json({ success: true, data: config });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public static updateLandingConfig(req: Request, res: Response) {
    try {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ success: false, message: 'Datos de configuración inválidos.' });
      }
      const updated = db.updateLandingConfig(updates);
      return res.status(200).json({
        success: true,
        message: '¡Página Landing actualizada con éxito!',
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public static resetLandingConfig(_req: Request, res: Response) {
    try {
      const reset = db.resetLandingConfig();
      return res.status(200).json({
        success: true,
        message: '¡Landing restablecida a los valores recomendados!',
        data: reset,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error).message });
    }
  }
}


