import express from 'express';
import { signup, login, me, checkId } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/signup', (req, res, next) => {
  console.log('[ROUTE] POST /signup 호출됨');
  signup(req, res).catch(next);
});

router.post('/login', (req, res, next) => {
  console.log('[ROUTE] POST /login 호출됨');
  login(req, res).catch(next);
});

router.get('/me', verifyToken, (req, res, next) => {
  console.log('[ROUTE] GET /me 호출됨');
  me(req, res).catch(next);
});

router.post('/check-email', (req, res, next) => {
  console.log('[ROUTE] POST /check-email 호출됨');
  checkId(req, res).catch(next);
});

export default router;
