import { Router } from 'express';
import categoryRoutes from './category.routes.ts';
import emailRoutes from './email.routes.ts';
import authRoutes from './auth.routes.ts';
import adminRoutes from './admin.routes.ts';
import campaignRoutes from './campaign.routes.ts';
import trackRoutes from './track.routes.ts';
import licenseRoutes from './license.routes.ts';
import { AdminController } from '../controllers/admin.controller.ts';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/emails', emailRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/track', trackRoutes);
apiRouter.use('/license', licenseRoutes);

// Endpoint público para obtener los planes de depuración activos en la landing
apiRouter.get('/plans', AdminController.getPublicPlans);

// Endpoint público para obtener el contenido CMS de la landing (unio.my)
apiRouter.get('/landing', AdminController.getPublicLandingConfig);

// Endpoint para actualizar plan y recargar créditos
apiRouter.post('/plans/upgrade', AdminController.upgradePlan);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CleanMail API Engine',
    timestamp: new Date().toISOString(),
  });
});

// Capturar CUALQUIER ruta /api no encontrada y responder SIEMPRE con JSON (nunca HTML)
apiRouter.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

export default apiRouter;
