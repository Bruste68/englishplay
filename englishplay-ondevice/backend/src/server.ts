import dotenv from 'dotenv';
import path from 'path';
import sequelize from './db';
import app from './app';

// ✅ 환경 변수 로딩
console.log('📦 [환경설정] 환경변수 로딩 중...');
const envPath = path.resolve(__dirname, '../../backend/.env');
dotenv.config({ path: envPath });
console.log(`📄 [환경설정] .env 경로: ${envPath}`);

const PORT = process.env.PORT || 5000;

console.log('🔧 [서버준비] 서버 시작 준비 중...');
console.log('🛠️  [서버준비] PORT:', PORT);
console.log('🔐 [서버준비] JWT_SECRET:', process.env.JWT_SECRET ? '[OK]' : '[❌ 누락]');
console.log('🛢️  [서버준비] DB_NAME:', process.env.DB_NAME || '[❌ 누락]');

// ✅ DB 연결 및 서버 시작
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ [DB] 데이터베이스 연결 성공');
    return sequelize.sync();
  })
  .then(() => {
    console.log('✅ [DB] 모델 동기화 완료');

    app.listen(PORT, () => {
      console.log(`🚀 [서버실행] 서버가 http://localhost:${PORT} 에서 실행 중`);
    });
  })
  .catch((err) => {
    console.error('❌ [DB] 연결 또는 모델 동기화 실패');
    console.error(err);
    process.exit(1); // 실패 시 종료
  });
