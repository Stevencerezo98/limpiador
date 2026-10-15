import { Router } from 'express';
import { TrackController } from '../controllers/track.controller.ts';

const trackRouter = Router();

// Tracking Pixel para registro invisible de aperturas
trackRouter.get('/open/:campaignId/:logId', TrackController.trackOpen);

// Enlace de baja voluntaria (Unsubscribe)
trackRouter.get('/unsubscribe/:campaignId/:email', TrackController.handleUnsubscribe);

// Consulta de contactos desuscritos
trackRouter.get('/unsubscribed', TrackController.getUnsubscribedList);

export default trackRouter;
