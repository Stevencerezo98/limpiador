import type { Request, Response } from 'express';
import { db } from '../db/database.ts';

// 1x1 GIF transparente estándar en Base64 (43 bytes)
const TRANSPARENT_1PX_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export class TrackController {
  /**
   * Píxel de seguimiento de apertura de correo electrónico (Invisible Tracking Pixel)
   * GET /api/track/open/:campaignId/:logId
   */
  public static trackOpen(req: Request, res: Response): void {
    const { campaignId, logId } = req.params;

    if (campaignId && logId) {
      try {
        db.markEmailOpened(campaignId, logId);
      } catch (e) {
        console.error('Error registrando apertura:', e);
      }
    }

    // Retornar siempre el GIF transparente de 1x1 pixel sin caché
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': TRANSPARENT_1PX_GIF.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(TRANSPARENT_1PX_GIF);
  }

  /**
   * Procesamiento de Desuscripción con confirmación en pantalla
   * GET /api/track/unsubscribe/:campaignId/:email
   */
  public static handleUnsubscribe(req: Request, res: Response): void {
    const { campaignId, email } = req.params;
    const decodedEmail = decodeURIComponent(email || '').trim().toLowerCase();

    if (!decodedEmail || !decodedEmail.includes('@')) {
      res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>Enlace de desuscripción inválido</h2>
            <p>El correo proporcionado no es válido.</p>
          </body>
        </html>
      `);
      return;
    }

    // Registrar en la lista negra / desuscritos
    db.addUnsubscribe(decodedEmail, campaignId, 'Solicitud voluntaria desde pie de correo');

    // Renderizar página de confirmación visual elegante
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Desuscripción Confirmada | CleanMail</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .icon-badge {
            width: 64px;
            height: 64px;
            background-color: #ecfdf5;
            color: #059669;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            font-size: 32px;
          }
          h1 {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 12px 0;
            color: #0f172a;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #64748b;
            margin: 0 0 20px 0;
          }
          .email-highlight {
            font-weight: 600;
            color: #0284c7;
            background: #f0f9ff;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-block;
          }
          .footer-note {
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
            margin-top: 25px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-badge">✓</div>
          <h1>Te has desuscrito exitosamente</h1>
          <p>La dirección <span class="email-highlight">${decodedEmail}</span> ha sido removida de nuestros envíos masivos.</p>
          <p>No volverás a recibir mensajes ni campañas promocionales vinculadas a esta lista en CleanMail.</p>
          <div class="footer-note">
            CleanMail Anti-Spam Compliance &bull; Tu privacidad es respetada en conformidad con regulaciones internacionales (CAN-SPAM / RGPD).
          </div>
        </div>
      </body>
      </html>
    `);
  }

  /**
   * Obtener lista de correos desuscritos
   * GET /api/track/unsubscribed
   */
  public static getUnsubscribedList(_req: Request, res: Response): void {
    const list = db.getAllUnsubscribed();
    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  }
}
