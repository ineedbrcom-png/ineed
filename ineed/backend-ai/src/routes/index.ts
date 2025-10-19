import { Router } from 'express';
import usersRoutes from './users.routes';
import requestsRoutes from './requests.routes';

const router = Router();

router.use('/users', usersRoutes);
router.use('/requests', requestsRoutes);

router.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

export default router;
