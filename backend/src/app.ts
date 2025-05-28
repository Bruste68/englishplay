import express from 'express';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes';
import oauthRoutes from './routes/oauth.routes';
import kakaoRoute from './routes/kakao';
import googleRoute from './routes/google';
import naverRoute from './routes/naver';
import yahooRoute from './routes/yahoo';
import lineRoute from './routes/line';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin';
import contentRoutes from './routes/content';
import publicRoutes from './routes/public';

import { verifyToken } from './middlewares/auth.middleware';
import adminOnly from './middlewares/adminOnly';
import { verifyAndroidPurchase } from './utils/verifyGooglePurchase';

const app = express();

// ✅ 요청 로그 출력
app.use((req, res, next) => {
  console.log(`📡 요청 수신: [${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ 미들웨어
app.use(cors({
  origin: [
    'https://samspeakgo.com',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://accounts.google.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  optionsSuccessStatus: 200
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// ✅ 정적 파일 경로 설정
const publicPath = path.resolve(__dirname, '../../public');
console.log('📁 Static path used:', publicPath);
app.use(express.static(publicPath, {
  setHeaders: (res, filePath) => {
    console.log(`📦 정적 파일 응답: ${filePath}`);
  }
}));

// ✅ API 라우터 등록
app.use('/api', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/', kakaoRoute);
app.use('/', googleRoute);
app.use('/', naverRoute);
app.use('/', yahooRoute);
app.use('/', lineRoute);
app.use('/api', userRoutes);
app.use('/api/admin', verifyToken, adminOnly, adminRoutes);
app.use('/api/admin', contentRoutes);
app.use('/api', publicRoutes);

// ✅ HTML 직접 요청 처리
app.get('*', (req, res, next) => {
  if (req.originalUrl.endsWith('.html')) {
    const filePath = path.join(publicPath, req.originalUrl);
    console.log(`📃 HTML 직접 요청 확인: ${filePath}`);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  next();
});

// ✅ 상태 확인 API
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ✅ SPA fallback 처리 (path-to-regexp 에러 방지 버전)
app.get('*', (req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.originalUrl.startsWith('/api') &&
    !req.originalUrl.includes('.') // 정적 파일 요청 아님
  ) {
    console.log(`🌐 SPA fallback index.html 반환: ${req.originalUrl}`);
    return res.sendFile(path.join(publicPath, 'index.html'));
  }
  next();
});

// ✅ 404 처리 로그
app.use((req, res) => {
  console.warn(`❌ 404 Not Found: ${req.originalUrl}`);
  res.status(404).json({ error: 'Not found' });
});

// ✅ 전역 에러 핸들러
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 전역 에러 발생:', err.message);
  console.error('📛 상세 오류:', err);
  res.status(500).json({ error: 'Internal server error', detail: err?.message });
});

// ✅ index.html 첫 줄 출력
const indexFilePath = path.join(publicPath, 'index.html');
fs.readFile(indexFilePath, 'utf-8', (err, content) => {
  if (err) {
    console.error('❌ index.html 확인 실패:', err.message);
  } else {
    const firstLine = content.split('\n')[0];
    console.log(`📄 index.html 첫 줄: ${firstLine}`);
  }
});

// ✅ 구글 인앱 결제 검증 API
app.post('/verify-receipt', async (req, res) => {
  const { productId, purchaseToken } = req.body;

  try {
    const result = await verifyAndroidPurchase(productId, purchaseToken);
    res.json(result);
  } catch (error: any) {
    console.error('🔴 검증 실패:', error);
    res.status(500).json({ error: '영수증 검증 실패', detail: error.message });
  }
});

export default app;
