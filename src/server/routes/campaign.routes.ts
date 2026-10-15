import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller.ts';

const campaignRouter = Router();

// Consultar todas las campañas
campaignRouter.get('/', CampaignController.getAllCampaigns);

// Contador y desglose en tiempo real de correos válidos para listas seleccionadas
campaignRouter.get('/preview-recipients', CampaignController.previewRecipients);

// Obtener y actualizar configuración de servidor SMTP
campaignRouter.get('/smtp', CampaignController.getSmtpConfig);
campaignRouter.post('/smtp', CampaignController.updateSmtpConfig);
campaignRouter.post('/smtp/test', CampaignController.testSmtpDirect);

// Enviar correo individual 1 a 1 para probar entrega real y plantilla
campaignRouter.post('/single-send', CampaignController.singleSend);

// Enviar correo de prueba previo (sin crear la campaña)
campaignRouter.post('/preview-test', CampaignController.previewTest);

// Crear nueva campaña
campaignRouter.post('/', CampaignController.createCampaign);

// Consultar detalle de una campaña
campaignRouter.get('/:id', CampaignController.getCampaignById);

// Consultar logs de entrega y aperturas de una campaña
campaignRouter.get('/:id/logs', CampaignController.getCampaignLogs);

// Actualizar campaña (en borrador)
campaignRouter.put('/:id', CampaignController.updateCampaign);

// Reiniciar campaña a borrador
campaignRouter.post('/:id/reset', CampaignController.resetCampaign);

// Eliminar campaña
campaignRouter.delete('/:id', CampaignController.deleteCampaign);

// Iniciar procesamiento y envío masivo a correos válidos
campaignRouter.post('/:id/send', CampaignController.sendCampaign);

// Pausar o cancelar envío activo
campaignRouter.post('/:id/cancel', CampaignController.cancelCampaign);

// Enviar correo de prueba para campaña existente
campaignRouter.post('/:id/test', CampaignController.sendTest);

export default campaignRouter;
