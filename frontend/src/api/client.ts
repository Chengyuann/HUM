import axios from 'axios';
// @ts-ignore
import { withPaymentInterceptor } from 'x402-axios';
import { createWalletClient, custom } from 'viem';
import { baseSepolia, sepolia, polygonAmoy, arbitrumSepolia } from 'viem/chains';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const X402_NETWORK = import.meta.env.VITE_X402_NETWORK || 'base-sepolia';

// Map network names to viem chain objects
const CHAIN_MAP: Record<string, any> = {
  'base-sepolia': baseSepolia,
  'sepolia': sepolia,
  'polygon-amoy': polygonAmoy,
  'arbitrum-sepolia': arbitrumSepolia,
};

const targetChain = CHAIN_MAP[X402_NETWORK] || baseSepolia;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup X402 Payment Interceptor
if (typeof window !== 'undefined' && (window as any).ethereum) {
  try {
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom((window as any).ethereum)
    });

    // Add X402 interceptor
    withPaymentInterceptor(apiClient, walletClient);
    console.log('X402 Payment Interceptor configured');
  } catch (err) {
    console.warn('Failed to setup X402 interceptor:', err);
  }
}

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    // 网络错误重试（指数退避）
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      // 可以在这里实现重试逻辑
    }

    // StepFun API错误映射
    if (error.response?.data?.error?.code === 'invalid_api_key') {
      return Promise.reject(new Error('API密钥无效，请检查配置'));
    }

    // 统一错误格式
    const errorMessage = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;



