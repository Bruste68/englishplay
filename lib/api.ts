// lib/api.ts
import axios from 'axios';

// ✅ 여기에 ngrok 주소만 바꾸면 전체 반영됨
export const API_BASE_URL = 'https://95c3-222-112-15-140.ngrok-free.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export default api;
