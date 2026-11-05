/**
 * Telegram WebApp authentication and HMAC-SHA256 initData validation.
 * Complies with Telegram Bot API specifications.
 */

import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramAuthResult {
  authenticated: boolean;
  user?: TelegramUser;
  isAdmin: boolean;
  error?: string;
}

/**
 * Validate Telegram initData string using HMAC-SHA256
 * @param initData Raw initData string from window.Telegram.WebApp.initData
 * @param botToken Bot token from environment
 * @param adminIds Comma-separated list or single ID of clinic administrators
 */
export function validateTelegramInitData(
  initData: string,
  botToken?: string,
  adminIds?: string
): TelegramAuthResult {
  // If in demo mode without initData, allow demo fallback
  const isDemo = process.env.DEMO_MODE === 'true' || !botToken;

  if (!initData) {
    if (isDemo) {
      return {
        authenticated: true,
        user: { id: 7777777, first_name: 'Демо', username: 'demo_user' },
        isAdmin: true, // In demo mode, user can view admin panel
      };
    }
    return { authenticated: false, isAdmin: false, error: 'Missing initData' };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      return { authenticated: false, isAdmin: false, error: 'Missing hash in initData' };
    }

    // Extract auth_date and verify freshness (e.g. 24 hours max)
    const authDateStr = params.get('auth_date');
    if (authDateStr) {
      const authDate = parseInt(authDateStr, 10);
      const now = Math.floor(Date.now() / 1000);
      const maxAgeSeconds = 86400; // 24 hours
      if (now - authDate > maxAgeSeconds) {
        return { authenticated: false, isAdmin: false, error: 'initData expired (>24h)' };
      }
    }

    // Prepare data-check-string (all key=value pairs sorted alphabetically, except hash)
    const dataCheckArr: string[] = [];
    params.forEach((val, key) => {
      if (key !== 'hash') {
        dataCheckArr.push(`${key}=${val}`);
      }
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    if (botToken) {
      // secret_key = HMAC-SHA256("WebAppData", botToken)
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      // calculated_hash = HMAC-SHA256(secret_key, dataCheckString)
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      if (calculatedHash !== hash) {
        if (!isDemo) {
          return { authenticated: false, isAdmin: false, error: 'Invalid HMAC signature' };
        }
      }
    }

    // Parse user object
    const userJson = params.get('user');
    let user: TelegramUser | undefined = undefined;
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch {
        // ignore parse error
      }
    }

    // Check admin privilege
    const allowedAdmins = (adminIds || process.env.ADMIN_ID || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    const isAdmin =
      isDemo ||
      Boolean(user && allowedAdmins.includes(String(user.id)));

    return {
      authenticated: true,
      user,
      isAdmin,
    };
  } catch (err: any) {
    return { authenticated: false, isAdmin: false, error: err?.message || 'Auth failure' };
  }
}

export const TG_INIT_DATA_HEADER = 'x-telegram-init-data';

export type AdminGate =
  | { ok: true; user: TelegramUser }
  | { ok: false; status: 401 | 403 | 503; error: string };

/**
 * Strict gate for admin-only API routes. Fails closed:
 * - no BOT_TOKEN on the server -> refuse (503), never open the admin data;
 * - no valid, fresh, signed initData -> 401;
 * - signed by Telegram but the user is not in ADMIN_ID -> 403.
 * DEMO_MODE=true is the only way to open it without Telegram (local demos).
 */
export function authorizeAdminRequest(request: Request): AdminGate {
  return authorizeAdminInitData(request.headers.get(TG_INIT_DATA_HEADER) || '');
}

export function authorizeAdminInitData(initData: string): AdminGate {
  if (process.env.DEMO_MODE === 'true') {
    return { ok: true, user: { id: 0, first_name: 'Демо' } };
  }

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    return { ok: false, status: 503, error: 'Сервер не настроен: BOT_TOKEN не задан' };
  }

  const result = validateTelegramInitData(initData, botToken, process.env.ADMIN_ID);

  if (!result.authenticated || !result.user) {
    return { ok: false, status: 401, error: result.error || 'Нужен вход через Telegram' };
  }
  if (!result.isAdmin) {
    return { ok: false, status: 403, error: 'Доступ только для администраторов клиники' };
  }
  return { ok: true, user: result.user };
}
