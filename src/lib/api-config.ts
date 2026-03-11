/**
 * Centralized API Configuration
 * Validates and provides typed access to all environment variables
 */

// Server-only configuration (never expose to client)
export const serverConfig = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  hyperliquid: {
    privateKey: process.env.HL_PRIVATE_KEY || '',
  },
  privy: {
    appSecret: process.env.PRIVY_APP_SECRET || '',
  },
  database: {
    apiUrl: process.env.DATABASE_API_URL || 'https://zynapse.zkagi.ai/daily-cumulative',
    getApiUrl: process.env.DATABASE_GET_API_URL || 'https://zynapse.zkagi.ai/daily-cumulative/get',
    apiKey: process.env.DATABASE_API_KEY || '',
  },
  cron: {
    secret: process.env.CRON_SECRET || '',
  },
  api: {
    key: process.env.API_KEY || 'zk-123321',
    botBase: process.env.BOT_API_BASE || 'http://34.67.134.209:8080',
    kbBase: process.env.KB_API_BASE || 'http://45.251.34.28:8009',
    privacyAi: process.env.PRIVACY_AI_URL || 'http://45.251.34.28:8009/kb/ask',
    agentsBase: process.env.AGENTS_API_BASE || 'http://45.251.34.28:8002',
    reviewsUrl: process.env.REVIEWS_API_URL || 'http://45.251.34.28:8002/reviews',
  },
};

// Client-safe configuration (can be exposed to browser)
export const clientConfig = {
  ai: {
    deepseek: {
      baseUrl: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || '',
      model: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL || '',
    },
    mistral: {
      baseUrl: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || '',
      model: process.env.NEXT_PUBLIC_MISTRAL_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3',
    },
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || '',
  },
  solana: {
    usdcMint: process.env.NEXT_PUBLIC_SOLANA_USDC_MINT_ADDRESS || '',
    merchantAddress: process.env.NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS || '',
  },
  hyperliquid: {
    userWallet: process.env.NEXT_PUBLIC_HL_USER_WALLET || '',
    mainWallet: process.env.NEXT_PUBLIC_HL_MAIN_WALLET || '',
  },
  media: {
    videoGenEndpoint: process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT || '',
    landwolf: process.env.NEXT_PUBLIC_LANDWOLF || '',
    landwolfHigh: process.env.NEXT_PUBLIC_LANDWOLF_HIGH || '',
    voiceClone: process.env.NEXT_PUBLIC_VOICE_CLONE || '',
    videoLipsync: process.env.NEXT_PUBLIC_VIDEO_LIPSYNC || '',
    imgToVideo: process.env.NEXT_PUBLIC_IMG_TO_VIDEO || '',
    wanImgToVideo: process.env.NEXT_PUBLIC_WAN_IMG_TO_VIDEO || '',
  },
  prediction: {
    todayApi: process.env.NEXT_PUBLIC_PREDICTION_API || '',
    pastApi: process.env.NEXT_PUBLIC_PAST_PREDICTION_API || '',
  },
  services: {
    privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
    civicClientId: process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || '',
    chainGptApiKey: process.env.NEXT_PUBLIC_CHAINGPT_API_KEY || '',
    magicPublishableKey: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '',
    apifyToken: process.env.NEXT_PUBLIC_APIFY_TOKEN || '',
    aarcApiKey: process.env.NEXT_PUBLIC_AARC_API_KEY || '',
  },
};

// Validation helper
export function validateServerConfig(): { valid: boolean; missing: string[] } {
  const required = [
    { key: 'STRIPE_SECRET_KEY', value: serverConfig.stripe.secretKey },
    { key: 'HL_PRIVATE_KEY', value: serverConfig.hyperliquid.privateKey },
    { key: 'API_KEY', value: serverConfig.api.key },
  ];

  const missing = required.filter(r => !r.value).map(r => r.key);
  return { valid: missing.length === 0, missing };
}

// API response helpers
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(error: string, code?: string): ApiResponse {
  return { success: false, error, code };
}

// Standard HTTP error responses
export const HttpErrors = {
  BAD_REQUEST: { status: 400, message: 'Bad Request' },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
  FORBIDDEN: { status: 403, message: 'Forbidden' },
  NOT_FOUND: { status: 404, message: 'Not Found' },
  INTERNAL_ERROR: { status: 500, message: 'Internal Server Error' },
  BAD_GATEWAY: { status: 502, message: 'Bad Gateway' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service Unavailable' },
};

// Fetch with timeout helper
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// Safe JSON parse
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}
