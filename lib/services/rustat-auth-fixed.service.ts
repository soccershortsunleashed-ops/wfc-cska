/**
 * RuStat Auth Service - Fixed Version
 * 
 * Использует прямую авторизацию через форму входа
 * вместо OAuth 2.0 flow
 */

const RUSTAT_AUTH_URL = 'https://auth.rustatsport.ru'
const RUSTAT_API_URL = 'https://api-football.rustatsport.ru'

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Кэш токенов в памяти
let cachedTokens: AuthTokens | null = null

class RustatAuthService {
  private email: string
  private password: string

  constructor() {
    this.email = process.env.RUSTAT_EMAIL || ''
    this.password = process.env.RUSTAT_PASSWORD || ''

    if (!this.email || !this.password) {
      console.warn('RuStat credentials not configured')
    }
  }

  /**
   * Получить токен через прямую авторизацию
   * Этот метод эмулирует поведение браузера
   */
  async getAccessToken(): Promise<string> {
    // Проверяем кэш
    if (cachedTokens && cachedTokens.expiresAt > Date.now()) {
      return cachedTokens.accessToken
    }

    // Если есть refresh token, пробуем обновить
    if (cachedTokens?.refreshToken) {
      try {
        return await this.refreshAccessToken(cachedTokens.refreshToken)
      } catch (error) {
        console.log('Refresh token expired, re-authenticating...')
      }
    }

    // Полная авторизация
    return await this.authenticate()
  }

  /**
   * Полная авторизация через форму
   */
  private async authenticate(): Promise<string> {
    try {
      // Шаг 1: Получаем страницу авторизации для получения параметров
      const authPageResponse = await fetch(
        `${RUSTAT_AUTH_URL}/authorize?` +
          `response_type=code&` +
          `client_id=rustat_football&` +
          `redirect_uri=https://football.rustatsport.ru/redirect&` +
          `scope=openid&` +
          `state=test_state&` +
          `nonce=test_nonce&` +
          `code_challenge=test_challenge&` +
          `code_challenge_method=plain&` +
          `response_mode=query&` +
          `lang=ru`,
        {
          redirect: 'manual', // Не следуем редиректам автоматически
        }
      )

      // Шаг 2: Отправляем форму входа
      const loginFormData = new URLSearchParams({
        email: this.email,
        password: this.password,
        response_type: 'code',
        client_id: 'rustat_football',
        redirect_uri: 'https://football.rustatsport.ru/redirect',
        scope: 'openid',
        state: 'test_state',
        nonce: 'test_nonce',
        code_challenge: 'test_challenge',
        code_challenge_method: 'plain',
        response_mode: 'query',
        lang: 'ru',
      })

      const loginResponse = await fetch(`${RUSTAT_AUTH_URL}/authorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginFormData.toString(),
        redirect: 'manual',
      })

      // Получаем authorization code из Location header
      const location = loginResponse.headers.get('location')
      if (!location) {
        throw new Error('No redirect location in auth response')
      }

      const url = new URL(location, 'https://football.rustatsport.ru')
      const code = url.searchParams.get('code')
      
      if (!code) {
        throw new Error('No authorization code in redirect')
      }

      // Шаг 3: Обмениваем code на токены
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'rustat_football',
        code: code,
        redirect_uri: 'https://football.rustatsport.ru/redirect',
        code_verifier: 'test_challenge',
      })

      const tokenResponse = await fetch(`${RUSTAT_AUTH_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`)
      }

      const tokens = await tokenResponse.json()

      // Кэшируем токены
      cachedTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in - 60) * 1000,
      }

      return tokens.access_token
    } catch (error) {
      console.error('RuStat authentication error:', error)
      throw new Error('Failed to authenticate with RuStat')
    }
  }

  /**
   * Обновить access token используя refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: 'rustat_football',
        refresh_token: refreshToken,
        response_type: 'id_token token',
        scope: 'openid',
      })

      const response = await fetch(`${RUSTAT_AUTH_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`)
      }

      const tokens = await response.json()

      // Обновляем кэш
      cachedTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken,
        expiresAt: Date.now() + (tokens.expires_in - 60) * 1000,
      }

      return tokens.access_token
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  /**
   * Очистить кэш токенов
   */
  clearCache(): void {
    cachedTokens = null
  }
}

// Экспортируем singleton
export const rustatAuthService = new RustatAuthService()
