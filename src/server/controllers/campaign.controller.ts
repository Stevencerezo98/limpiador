import type { Request, Response } from 'express';
import { db } from '../db/database.ts';
import { campaignService } from '../services/campaign.service.ts';

export class CampaignController {
  /**
   * Obtener todas las campañas con listas asociadas y métricas agregadas
   * GET /api/campaigns
   */
  public static getAllCampaigns(_req: Request, res: Response): void {
    try {
      const campaigns = db.getAllCampaigns();
      res.json({
        success: true,
        count: campaigns.length,
        data: campaigns,
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar campañas',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Contador y desglose dinámico en tiempo real de correos válidos para listas seleccionadas
   * GET /api/campaigns/preview-recipients?listIds=id1,id2
   */
  public static previewRecipients(req: Request, res: Response): void {
    try {
      const rawListIds = req.query.listIds;
      let listIds: string[] = [];

      if (typeof rawListIds === 'string') {
        listIds = rawListIds.split(',').map((id) => id.trim()).filter(Boolean);
      } else if (Array.isArray(rawListIds)) {
        listIds = (rawListIds as string[]).map((id) => id.trim()).filter(Boolean);
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
            listsSummary: [],
          },
        });
        return;
      }

      const preview = db.getRecipientsPreview(listIds);

      res.json({
        success: true,
        data: preview,
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al previsualizar destinatarios',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Obtener detalle de una campaña específica
   * GET /api/campaigns/:id
   */
  public static getCampaignById(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const campaign = db.getCampaignById(id);

      if (!campaign) {
        res.status(404).json({
          success: false,
          message: 'Campaña no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: campaign,
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar campaña',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Obtener logs de destinatarios de una campaña con estado de envío/apertura
   * GET /api/campaigns/:id/logs
   */
  public static getCampaignLogs(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const status = req.query.status as string | undefined;

      const campaign = db.getCampaignById(id);
      if (!campaign) {
        res.status(404).json({
          success: false,
          message: 'Campaña no encontrada',
        });
        return;
      }

      const logs = db.getCampaignLogs(id, status);

      res.json({
        success: true,
        total: logs.length,
        data: logs,
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener logs de campaña',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Crear nueva campaña vinculada obligatoriamente a una o más listas depuradas
   * POST /api/campaigns
   */
  public static createCampaign(req: Request, res: Response): void {
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
        batchLimit,
      } = req.body;

      // Validaciones requeridas
      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'El nombre de la campaña es obligatorio' });
        return;
      }
      if (!subject || !subject.trim()) {
        res.status(400).json({ success: false, message: 'El asunto del correo es obligatorio' });
        return;
      }
      if (!senderName || !senderName.trim()) {
        res.status(400).json({ success: false, message: 'El nombre del remitente es obligatorio' });
        return;
      }
      if (!senderEmail || !senderEmail.trim() || !senderEmail.includes('@')) {
        res.status(400).json({ success: false, message: 'El correo electrónico del remitente es inválido' });
        return;
      }
      if (!htmlContent || !htmlContent.trim()) {
        res.status(400).json({ success: false, message: 'El contenido HTML de la plantilla es obligatorio' });
        return;
      }
      if (!listIds || !Array.isArray(listIds) || listIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Debes asociar obligatoriamente al menos una lista depurada (listIds) a la campaña',
        });
        return;
      }

      // Validar que las listas seleccionadas existan
      const allCategories = db.getAllCategories();
      const existingIds = new Set(allCategories.map((c) => c.id));
      const validSelectedIds = listIds.filter((lid) => existingIds.has(lid));

      if (validSelectedIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Ninguna de las listas seleccionadas existe en el sistema',
        });
        return;
      }

      // Calcular previsualización de destinatarios válidos
      const preview = db.getRecipientsPreview(validSelectedIds);

      const newCampaign = db.createCampaign({
        name,
        subject,
        senderName,
        senderEmail,
        htmlContent,
        listIds: validSelectedIds,
        pacingPerSecond: Number(pacingPerSecond) || 2,
        delaySecondsBetweenEmails:
          delaySecondsBetweenEmails !== undefined ? Number(delaySecondsBetweenEmails) : 2,
        batchLimit: batchLimit && Number(batchLimit) > 0 ? Number(batchLimit) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Campaña creada exitosamente en estado borrador',
        data: {
          ...newCampaign,
          recipientsPreview: preview,
        },
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error creando campaña',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Actualizar una campaña existente (mientras no esté en proceso de envío)
   * PUT /api/campaigns/:id
   */
  public static updateCampaign(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const current = db.getCampaignById(id);

      if (!current) {
        res.status(404).json({ success: false, message: 'Campaña no encontrada' });
        return;
      }

      if (current.status === 'SENDING') {
        res.status(400).json({
          success: false,
          message: 'No puedes modificar una campaña mientras está enviándose activamente',
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
        batchLimit,
      } = req.body;

      const updates: Record<string, unknown> = {};
      if (name) updates.name = name.trim();
      if (subject) updates.subject = subject.trim();
      if (senderName) updates.senderName = senderName.trim();
      if (senderEmail) updates.senderEmail = senderEmail.trim();
      if (htmlContent) updates.htmlContent = htmlContent;
      if (pacingPerSecond) updates.pacingPerSecond = Number(pacingPerSecond);
      if (delaySecondsBetweenEmails !== undefined) {
        updates.delaySecondsBetweenEmails = Number(delaySecondsBetweenEmails);
      }
      if (batchLimit !== undefined) {
        updates.batchLimit = Number(batchLimit) > 0 ? Number(batchLimit) : undefined;
      }
      if (listIds && Array.isArray(listIds) && listIds.length > 0) {
        updates.listIds = listIds;
      }

      const updated = db.updateCampaign(id, updates);

      res.json({
        success: true,
        message: 'Campaña actualizada',
        data: updated,
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error actualizando campaña',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Eliminar campaña y sus registros de envío
   * DELETE /api/campaigns/:id
   */
  public static deleteCampaign(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const success = db.deleteCampaign(id);

      if (!success) {
        res.status(404).json({ success: false, message: 'Campaña no encontrada' });
        return;
      }

      res.json({
        success: true,
        message: 'Campaña eliminada correctamente',
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error eliminando campaña',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Iniciar el envío masivo:
   * Consulta estrictamente los correos VÁLIDOS de las listas vinculadas e inicia la cola con pacing.
   * POST /api/campaigns/:id/send
   */
  public static async sendCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      const hostUrl = `${protocol}://${host}`;

      const result = await campaignService.startCampaignDispatch(id, hostUrl);

      res.json({
        success: true,
        message: result.message,
        data: {
          totalRecipients: result.totalRecipients,
          status: 'SENDING',
        },
      });
    } catch (err: unknown) {
      res.status(400).json({
        success: false,
        message: (err as Error).message || 'Error al iniciar envío de campaña',
      });
    }
  }

  /**
   * Pausar o cancelar envío activo
   * POST /api/campaigns/:id/cancel
   */
  public static cancelCampaign(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const cancelled = campaignService.cancelDispatch(id);

      if (!cancelled) {
        res.status(400).json({
          success: false,
          message: 'La campaña no estaba en proceso de envío o no pudo pausarse',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Envío de campaña pausado correctamente',
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al pausar campaña',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Enviar correo de prueba para verificar diseño y variables
   * POST /api/campaigns/:id/test
   */
  public static async sendTest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { testEmail } = req.body;

      if (!testEmail || !testEmail.includes('@')) {
        res.status(400).json({ success: false, message: 'Dirección de correo de prueba inválida' });
        return;
      }

      const campaign = db.getCampaignById(id);
      if (!campaign) {
        res.status(404).json({ success: false, message: 'Campaña no encontrada' });
        return;
      }

      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      const hostUrl = `${protocol}://${host}`;

      const result = await campaignService.sendTestEmail({
        recipientEmail: testEmail.trim(),
        subject: campaign.subject,
        senderName: campaign.senderName,
        senderEmail: campaign.senderEmail,
        htmlContent: campaign.htmlContent,
        hostUrl,
      });

      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al enviar correo de prueba',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Enviar prueba previa sin guardar la campaña
   * POST /api/campaigns/preview-test
   */
  public static async previewTest(req: Request, res: Response): Promise<void> {
    try {
      const { recipientEmail, subject, senderName, senderEmail, htmlContent } = req.body;

      if (!recipientEmail || !recipientEmail.includes('@')) {
        res.status(400).json({ success: false, message: 'Dirección de correo de prueba inválida' });
        return;
      }

      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      const hostUrl = `${protocol}://${host}`;

      const result = await campaignService.sendTestEmail({
        recipientEmail: recipientEmail.trim(),
        subject: subject || 'Prueba de Plantilla CleanMail',
        senderName: senderName || 'CleanMail Test',
        senderEmail: senderEmail || 'test@cleanmail.io',
        htmlContent: htmlContent || '<p>Prueba de correo</p>',
        hostUrl,
      });

      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al enviar prueba de diseño',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Enviar correo individual 1 a 1 para probar entrega real y plantilla
   * POST /api/campaigns/single-send
   */
  public static async singleSend(req: Request, res: Response): Promise<void> {
    try {
      const { recipientEmail, subject, senderName, senderEmail, htmlContent } = req.body;

      if (!recipientEmail || !recipientEmail.trim() || !recipientEmail.includes('@')) {
        res.status(400).json({
          success: false,
          message: 'Debes proporcionar un correo destinatario válido',
        });
        return;
      }

      if (!subject || !subject.trim()) {
        res.status(400).json({
          success: false,
          message: 'El asunto del mensaje no puede estar vacío',
        });
        return;
      }

      if (!htmlContent || !htmlContent.trim()) {
        res.status(400).json({
          success: false,
          message: 'El contenido HTML de la plantilla no puede estar vacío',
        });
        return;
      }

      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      const hostUrl = `${protocol}://${host}`;

      const result = await campaignService.sendTestEmail({
        recipientEmail: recipientEmail.trim(),
        subject: subject.trim(),
        senderName: senderName?.trim() || 'CleanMail Individual',
        senderEmail: senderEmail?.trim() || 'envios@cleanmail.io',
        htmlContent,
        hostUrl,
      });

      res.json({
        success: result.success,
        message: result.message,
        data: {
          recipientEmail: recipientEmail.trim(),
          sentAt: new Date().toISOString(),
          details: 'Correo individual 1 a 1 procesado con éxito',
        },
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al procesar el envío individual',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Obtener configuración SMTP
   * GET /api/campaigns/smtp
   */
  public static getSmtpConfig(_req: Request, res: Response): void {
    const config = db.getSystemConfig();
    const smtp = config.smtp || {
      enabled: false,
      host: '',
      port: 587,
      secure: false,
      user: '',
      pass: '',
      senderName: 'CleanMail Envíos',
      senderEmail: 'notificaciones@cleanmail.io',
    };

    res.json({
      success: true,
      data: {
        ...smtp,
        pass: smtp.pass ? '••••••••' : '',
        hasPassword: Boolean(smtp.pass),
        isConfigured: campaignService.isSmtpConfigured(),
      },
    });
  }

  /**
   * Guardar y verificar configuración SMTP
   * POST /api/campaigns/smtp
   */
  public static async updateSmtpConfig(req: Request, res: Response): Promise<void> {
    try {
      const { enabled, host, port, secure, user, pass, senderName, senderEmail } = req.body;
      const currentConfig = db.getSystemConfig();
      const existingPass = currentConfig.smtp?.pass || '';

      const updatedSmtp = {
        enabled: Boolean(enabled),
        host: (host || '').trim(),
        port: Number(port) || 587,
        secure: Boolean(secure),
        user: (user || '').trim(),
        pass: pass && pass !== '••••••••' ? pass : existingPass,
        senderName: (senderName || 'CleanMail Envíos').trim(),
        senderEmail: (senderEmail || 'notificaciones@cleanmail.io').trim(),
      };

      db.updateSystemConfig({
        smtp: updatedSmtp,
      });

      res.json({
        success: true,
        message: 'Configuración de servidor SMTP guardada exitosamente',
        data: {
          ...updatedSmtp,
          pass: updatedSmtp.pass ? '••••••••' : '',
        },
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuración SMTP',
        error: (err as Error).message,
      });
    }
  }

  /**
   * Probar directamente la conexión SMTP y enviar un correo real de prueba a la dirección especificada
   * POST /api/campaigns/smtp/test
   */
  public static async testSmtpDirect(req: Request, res: Response): Promise<void> {
    try {
      const { host, port, secure, user, pass, recipientEmail, senderName } = req.body;

      if (!recipientEmail || !recipientEmail.trim() || !recipientEmail.includes('@')) {
        res.status(400).json({
          success: false,
          message: 'Ingresa un correo destinatario válido para recibir la prueba.',
        });
        return;
      }

      const currentConfig = db.getSystemConfig();
      const existingPass = currentConfig.smtp?.pass || '';

      const testCreds =
        user && (pass || existingPass)
          ? {
              host: (host || 'smtp.gmail.com').trim(),
              port: Number(port) || 465,
              secure: Boolean(secure) || Number(port) === 465,
              user: user.trim(),
              pass: pass && pass !== '••••••••' ? pass : existingPass,
            }
          : undefined;

      const protocol = req.protocol || 'http';
      const reqHost = req.get('host') || 'localhost:3000';
      const hostUrl = `${protocol}://${reqHost}`;

      const testResult = await campaignService.sendTestEmail({
        recipientEmail: recipientEmail.trim(),
        subject: 'Prueba de Conexión Google / SMTP CleanMail',
        senderName: senderName?.trim() || 'CleanMail Conexión',
        senderEmail: testCreds?.user || currentConfig.smtp?.user || recipientEmail.trim(),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #00a2c7, #008ba8); padding: 25px 20px; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px;">¡Conexión Exitosa con Google / SMTP!</h2>
              <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">Tu servidor de correo está activo y entregando mensajes reales.</p>
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6; font-size: 14px;">
              <p>Hola,</p>
              <p>Si estás leyendo este mensaje en tu bandeja de entrada de <strong>${recipientEmail}</strong>, significa que tu autenticación con Google (o servidor SMTP) está configurada <strong>a la perfección</strong>.</p>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin: 18px 0; color: #166534; font-size: 13px;">
                ✔ Servidor remitente autenticado<br/>
                ✔ Entrega real confirmada en bandeja de entrada<br/>
                ✔ Listo para envíos masivos y pruebas de plantillas
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Enviado desde CleanMail Email Marketing Platform.</p>
            </div>
          </div>
        `,
        hostUrl,
        smtpCredentials: testCreds,
      });

      res.json(testResult);
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error en prueba SMTP: ' + ((err as Error).message || 'Error desconocido'),
      });
    }
  }

  /**
   * Reiniciar campaña a borrador para permitir reenvío
   * POST /api/campaigns/:id/reset
   */
  public static resetCampaign(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const updated = db.resetCampaign(id);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Campaña no encontrada' });
        return;
      }
      res.json({
        success: true,
        message: 'Campaña reiniciada a estado borrador. Ya puedes volver a enviarla.',
        data: updated,
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al reiniciar campaña',
        error: (err as Error).message,
      });
    }
  }
}
