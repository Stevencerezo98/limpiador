import nodemailer from 'nodemailer';
import { db } from '../db/database.ts';
import { Campaign, CampaignLog } from '../db/schema.ts';

interface SendJobState {
  campaignId: string;
  isCancelled: boolean;
  active: boolean;
}

class CampaignService {
  private activeJobs = new Map<string, SendJobState>();

  /**
   * Verifica si el usuario tiene un servidor SMTP configurado y activo
   */
  public isSmtpConfigured(): boolean {
    const sysConfig = db.getSystemConfig();
    return Boolean(
      (sysConfig?.smtp?.enabled && sysConfig.smtp.user && sysConfig.smtp.pass) ||
      (process.env.SMTP_HOST && process.env.SMTP_USER)
    );
  }

  /**
   * Obtiene el transportador de correo real (o verifica con credenciales personalizadas).
   */
  public getTransporter(customCredentials?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  }) {
    if (customCredentials && customCredentials.user && customCredentials.pass) {
      const cleanPass = customCredentials.pass.trim().replace(/\s+/g, '');
      const userEmail = customCredentials.user.trim();
      const host = (customCredentials.host || '').trim().toLowerCase();
      const port = Number(customCredentials.port) || 587;
      const isGoogle = host.includes('gmail') || userEmail.endsWith('@gmail.com') || host === 'smtp.gmail.com';

      if (isGoogle) {
        return nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: userEmail,
            pass: cleanPass,
          },
        });
      }

      return nodemailer.createTransport({
        host: customCredentials.host.trim(),
        port,
        secure: port === 465 ? true : Boolean(customCredentials.secure),
        auth: {
          user: userEmail,
          pass: cleanPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    const sysConfig = db.getSystemConfig();

    if (sysConfig?.smtp?.enabled && sysConfig.smtp.user && sysConfig.smtp.pass) {
      const cleanPass = sysConfig.smtp.pass.trim().replace(/\s+/g, '');
      const userEmail = sysConfig.smtp.user.trim();
      const host = (sysConfig.smtp.host || '').trim().toLowerCase();
      const port = Number(sysConfig.smtp.port) || 587;
      const isGoogle = host.includes('gmail') || userEmail.endsWith('@gmail.com') || host === 'smtp.gmail.com';

      if (isGoogle) {
        return nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: userEmail,
            pass: cleanPass,
          },
        });
      }

      return nodemailer.createTransport({
        host: sysConfig.smtp.host.trim(),
        port,
        secure: port === 465 ? true : Boolean(sysConfig.smtp.secure),
        auth: {
          user: userEmail,
          pass: cleanPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    throw new Error(
      '⚠️ No has configurado tu Servidor SMTP de Google ni credenciales de envío. Ve a "Servidor SMTP" en el menú e ingresa tu correo de Google y tu Contraseña de Aplicación de 16 letras de Google para poder realizar envíos reales.'
    );
  }

  /**
   * Verifica la conexión y credenciales directamente contra el servidor SMTP
   */
  public async verifySmtpConnection(customCredentials?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = this.getTransporter(customCredentials);
      await transporter.verify();
      return {
        success: true,
        message: '¡Conexión y autenticación SMTP exitosa con el servidor!',
      };
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Error de conexión con el servidor SMTP';
      if (
        errMsg.includes('535') ||
        errMsg.includes('BadCredentials') ||
        errMsg.includes('Username and Password not accepted')
      ) {
        return {
          success: false,
          message:
            'Google rechazó la contraseña. Para cuentas de Google debes generar una "Contraseña de Aplicación" de 16 letras desde myaccount.google.com/apppasswords con verificación en dos pasos activa (no uses tu contraseña normal de inicio de sesión).',
        };
      }
      return {
        success: false,
        message: errMsg,
      };
    }
  }

  /**
   * Prepara el contenido HTML inyectando variables dinámicas,
   * el píxel de tracking invisible y el pie con enlace de desuscripción.
   */
  public compileEmailHtml(options: {
    htmlTemplate: string;
    email: string;
    campaignId: string;
    logId: string;
    hostUrl?: string;
  }): string {
    const { htmlTemplate, email, campaignId, logId, hostUrl = '' } = options;
    const domain = email.includes('@') ? email.split('@')[1] : '';
    const now = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const unsubscribeUrl = `${hostUrl}/api/track/unsubscribe/${campaignId}/${encodeURIComponent(email)}`;
    const trackingPixelUrl = `${hostUrl}/api/track/open/${campaignId}/${logId}`;

    let rendered = htmlTemplate
      .replace(/\{\{\s*email\s*\}\}/gi, email)
      .replace(/\{\{\s*dominio\s*\}\}/gi, domain)
      .replace(/\{\{\s*fecha\s*\}\}/gi, now)
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, unsubscribeUrl);

    // Inyectar el píxel de apertura (invisible)
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;opacity:0;" />`;

    // Inyectar pie de desuscripción si no está ya presente
    let footerHtml = '';
    if (!rendered.includes(unsubscribeUrl) && !rendered.toLowerCase().includes('desuscribir')) {
      footerHtml = `
<div style="margin-top: 35px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; font-family: system-ui, -apple-system, sans-serif;">
  <p style="margin: 0 0 6px 0;">Este mensaje fue enviado a <strong>${email}</strong> desde una lista estrictamente depurada.</p>
  <p style="margin: 0;">¿No deseas recibir estos correos? <a href="${unsubscribeUrl}" style="color: #00a2c7; text-decoration: underline; font-weight: 500;">Haz clic aquí para darte de baja (Unsubscribe)</a></p>
</div>`;
    }

    if (rendered.includes('</body>')) {
      rendered = rendered.replace('</body>', `${footerHtml}${trackingPixel}</body>`);
    } else {
      rendered = `${rendered}${footerHtml}${trackingPixel}`;
    }

    return rendered;
  }

  /**
   * Enviar un correo de prueba individual (Test Email) para previsualizar renderizado
   */
  public async sendTestEmail(options: {
    recipientEmail: string;
    subject: string;
    senderName: string;
    senderEmail: string;
    htmlContent: string;
    hostUrl?: string;
    smtpCredentials?: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
    };
  }): Promise<{ success: boolean; message: string }> {
    try {
      if (!options.smtpCredentials && !this.isSmtpConfigured()) {
        return {
          success: false,
          message:
            '⚠️ No has configurado tu Servidor SMTP de Google. Ve a "Servidor SMTP" en el menú superior e ingresa tu correo de Google y tu Contraseña de Aplicación de 16 caracteres para enviar pruebas reales a tu bandeja.',
        };
      }

      const transporter = this.getTransporter(options.smtpCredentials);
      const compiledHtml = this.compileEmailHtml({
        htmlTemplate: options.htmlContent,
        email: options.recipientEmail,
        campaignId: 'test-preview',
        logId: 'test-log',
        hostUrl: options.hostUrl,
      });

      const senderFrom = options.smtpCredentials?.user || db.getSystemConfig()?.smtp?.user || options.senderEmail;

      await transporter.sendMail({
        from: `"${options.senderName}" <${senderFrom}>`,
        replyTo: options.senderEmail,
        to: options.recipientEmail,
        subject: `[PRUEBA] ${options.subject}`,
        html: compiledHtml,
      });

      return {
        success: true,
        message: `¡Correo de prueba enviado con éxito a ${options.recipientEmail}! Revisa tu bandeja de entrada o spam.`,
      };
    } catch (err: unknown) {
      console.error('Error enviando correo de prueba:', err);
      const errMsg = (err as Error).message || 'Error al enviar prueba de correo';
      let friendlyMsg = errMsg;
      if (
        errMsg.includes('535') ||
        errMsg.includes('BadCredentials') ||
        errMsg.includes('Username and Password not accepted')
      ) {
        friendlyMsg =
          'Google rechazó la contraseña. Recuerda que debes usar una Contraseña de Aplicación de 16 letras generada desde myaccount.google.com/apppasswords con verificación en 2 pasos activa, no tu contraseña habitual de Google.';
      }
      return {
        success: false,
        message: friendlyMsg,
      };
    }
  }

  /**
   * Inicia el procesamiento asíncrono y envío en lotes de una campaña.
   */
  public async startCampaignDispatch(campaignId: string, hostUrl?: string): Promise<{
    success: boolean;
    totalRecipients: number;
    message: string;
  }> {
    if (!this.isSmtpConfigured()) {
      throw new Error(
        '⚠️ No tienes configurado el Servidor SMTP de Google. Para realizar envíos masivos reales debes ir a "Servidor SMTP" y configurar tu correo de Gmail/Google Workspace y tu Contraseña de Aplicación de 16 caracteres.'
      );
    }

    const campaign = db.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error(`Campaña con ID ${campaignId} no encontrada`);
    }

    if (campaign.status === 'SENDING') {
      throw new Error('La campaña ya se encuentra en proceso de envío');
    }

    // 1. Obtener destinatarios estrictamente VÁLIDOS de las listas asociadas
    let validRecipients = db.getValidRecipientsForLists(campaign.listIds);

    // Respetar el límite de cantidad elegido por el usuario (ej: enviar solo 50 o 100 correos)
    if (campaign.batchLimit && campaign.batchLimit > 0) {
      validRecipients = validRecipients.slice(0, campaign.batchLimit);
    }

    if (validRecipients.length === 0) {
      throw new Error(
        'No hay destinatarios VÁLIDOS disponibles en las listas seleccionadas o todos están desuscritos.'
      );
    }

    // 2. Crear los registros de cola (CampaignLog) con estado 'QUEUED'
    const newLogs: Omit<CampaignLog, 'id'>[] = validRecipients.map((r) => ({
      campaignId,
      email: r.email,
      status: 'QUEUED',
    }));

    const insertedLogs = db.createCampaignLogsBatch(newLogs);

    // 3. Actualizar estado de campaña a 'SENDING'
    db.updateCampaign(campaignId, {
      status: 'SENDING',
      sentAt: new Date().toISOString(),
      stats: {
        totalRecipients: insertedLogs.length,
        sentCount: 0,
        openedCount: 0,
        failedCount: 0,
      },
    });

    // 4. Iniciar cola asíncrona con pacing regulado (no bloquea el response HTTP)
    const jobState: SendJobState = {
      campaignId,
      isCancelled: false,
      active: true,
    };
    this.activeJobs.set(campaignId, jobState);

    // Disparar en segundo plano
    this.processCampaignQueue(campaign, insertedLogs, jobState, hostUrl).catch((err) => {
      console.error(`Error en worker de envío para campaña ${campaignId}:`, err);
    });

    return {
      success: true,
      totalRecipients: insertedLogs.length,
      message: `Campaña puesta en cola para ${insertedLogs.length} destinatarios válidos`,
    };
  }

  /**
   * Worker asíncrono que procesa la cola con velocidad controlada y pausas entre correos
   */
  private async processCampaignQueue(
    campaign: Campaign,
    logs: CampaignLog[],
    jobState: SendJobState,
    hostUrl?: string
  ): Promise<void> {
    const transporter = this.getTransporter();
    
    // Si el usuario especificó pausa en segundos (ej: 3 seg entre cada correo para no enviar de golpe)
    const delayPerEmailMs =
      campaign.delaySecondsBetweenEmails !== undefined && campaign.delaySecondsBetweenEmails > 0
        ? Math.round(campaign.delaySecondsBetweenEmails * 1000)
        : Math.max(100, Math.floor(1000 / (campaign.pacingPerSecond || 2)));

    let sentCount = 0;
    let failedCount = 0;

    for (const log of logs) {
      if (jobState.isCancelled) {
        db.updateCampaign(campaign.id, {
          status: 'PAUSED',
        });
        break;
      }

      try {
        const compiledHtml = this.compileEmailHtml({
          htmlTemplate: campaign.htmlContent,
          email: log.email,
          campaignId: campaign.id,
          logId: log.id,
          hostUrl,
        });

        const sysConfig = db.getSystemConfig();
        const smtpUser = sysConfig?.smtp?.user || process.env.SMTP_USER;
        const senderFrom = smtpUser || campaign.senderEmail;

        // Intentar envío
        await transporter.sendMail({
          from: `"${campaign.senderName}" <${senderFrom}>`,
          replyTo: campaign.senderEmail,
          to: log.email,
          subject: campaign.subject,
          html: compiledHtml,
        });

        // Actualizar log a 'SENT'
        db.updateCampaignLog(log.id, {
          status: 'SENT',
          sentAt: new Date().toISOString(),
        });
        sentCount++;
      } catch (sendErr: unknown) {
        console.error(`Fallo enviando a ${log.email}:`, sendErr);
        db.updateCampaignLog(log.id, {
          status: 'FAILED',
          error: (sendErr as Error).message || 'Error de entrega SMTP',
        });
        failedCount++;
      }

      // Actualizar stats de la campaña periódicamente
      db.updateCampaign(campaign.id, {
        stats: {
          totalRecipients: logs.length,
          sentCount,
          openedCount: db.getCampaignById(campaign.id)?.stats.openedCount || 0,
          failedCount,
        },
      });

      // Pacing regulado para proteger la reputación del remitente y evitar spam
      await new Promise((resolve) => setTimeout(resolve, delayPerEmailMs));
    }

    // Al finalizar la cola
    if (!jobState.isCancelled) {
      db.updateCampaign(campaign.id, {
        status: failedCount === logs.length ? 'FAILED' : 'SENT',
        completedAt: new Date().toISOString(),
      });
    }

    this.activeJobs.delete(campaign.id);
  }

  /**
   * Cancelar o pausar un envío en curso
   */
  public cancelDispatch(campaignId: string): boolean {
    const job = this.activeJobs.get(campaignId);
    if (job) {
      job.isCancelled = true;
      db.updateCampaign(campaignId, { status: 'PAUSED' });
      this.activeJobs.delete(campaignId);
      return true;
    }
    return false;
  }
}

export const campaignService = new CampaignService();
