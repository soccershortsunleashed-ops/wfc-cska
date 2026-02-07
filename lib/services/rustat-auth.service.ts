/**
 * RuStat Authentication Service
 * Автоматическое получение токена через Playwright
 */

import { chromium, type Browser, type Page } from 'playwright'

const RUSTAT_URL = 'https://football.rustatsport.ru'
const AUTH_URL = 'https://api-auth.rustatsport.ru'

export interface RustatCredentials {
  email: string
  password: string
}

export interface RustatToken {
  token: string
  expiresAt: Date
  issuedAt: Date
}

export class RustatAuthService {
  private browser: Browser | null = null
  private page: Page | null = null
  private currentToken: RustatToken | null = null

  /**
   * Получить токен (автоматически обновляет если истек)
   */
  async getToken(credentials: RustatCredentials): Promise<string> {
    // Проверяем, не истек ли текущий токен
    if (this.currentToken && !this.isTokenExpired(this.currentToken)) {
      return this.currentToken.token
    }

    // Получаем новый токен
    console.log('🔐 Получение нового токена RuStat...')
    this.currentToken = await this.fetchNewToken(credentials)
    return this.currentToken.token
  }

  /**
   * Проверить, истек ли токен
   */
  private isTokenExpired(token: RustatToken): boolean {
    const now = new Date()
    const timeLeft = token.expiresAt.getTime() - now.getTime()
    // Обновляем за 30 секунд до истечения
    return timeLeft < 30000
  }

  /**
   * Получить новый токен через браузер
   */
  private async fetchNewToken(credentials: RustatCredentials): Promise<RustatToken> {
    try {
      // Запускаем браузер
      if (!this.browser) {
        this.browser = await chromium.launch({ headless: true })
      }

      const context = await this.browser.newContext()
      this.page = await context.newPage()

      // Перехватываем запросы к API
      let capturedToken: string | null = null

      this.page.on('request', (request) => {
        const url = request.url()
        if (url.includes('api-football.rustatsport.ru') || url.includes('api-auth.rustatsport.ru')) {
          const authHeader = request.headers()['authorization']
          if (authHeader && authHeader.startsWith('Bearer ')) {
            capturedToken = authHeader.replace('Bearer ', '')
          }
        }
      })

      // Переходим на сайт
      await this.page.goto(RUSTAT_URL, { waitUntil: 'networkidle' })

      // Ищем кнопку входа
      const loginButton = await this.page.locator('button:has-text("Войти"), a:has-text("Войти")').first()
      if (await loginButton.isVisible()) {
        await loginButton.click()
        await this.page.waitForTimeout(1000)
      }

      // Вводим email
      const emailInput = await this.page.locator('input[type="email"], input[name="email"]').first()
      await emailInput.fill(credentials.email)

      // Вводим пароль
      const passwordInput = await this.page.locator('input[type="password"], input[name="password"]').first()
      await passwordInput.fill(credentials.password)

      // Нажимаем кнопку входа
      const submitButton = await this.page.locator('button[type="submit"], button:has-text("Войти")').first()
      await submitButton.click()

      // Ждем успешной авторизации (появление токена в запросах)
      await this.page.waitForTimeout(3000)

      // Если токен не перехвачен, пробуем получить из localStorage
      if (!capturedToken) {
        capturedToken = await this.page.evaluate(() => {
          const token = localStorage.getItem('token') || 
                       localStorage.getItem('auth_token') ||
                       localStorage.getItem('access_token')
          return token
        })
      }

      // Если все еще нет токена, пробуем из cookies
      if (!capturedToken) {
        const cookies = await context.cookies()
        const tokenCookie = cookies.find(c => 
          c.name.includes('token') || c.name.includes('auth')
        )
        if (tokenCookie) {
          capturedToken = tokenCookie.value
        }
      }

      await context.close()

      if (!capturedToken) {
        throw new Error('Не удалось получить токен после авторизации')
      }

      // Парсим JWT чтобы получить время истечения
      const tokenData = this.parseJWT(capturedToken)
      const expiresAt = tokenData.exp 
        ? new Date(tokenData.exp * 1000) 
        : new Date(Date.now() + 5 * 60 * 1000) // По умолчанию 5 минут

      console.log(`✅ Токен получен, истекает: ${expiresAt.toLocaleString('ru-RU')}`)

      return {
        token: capturedToken,
        expiresAt,
        issuedAt: new Date(),
      }

    } catch (error) {
      console.error('❌ Ошибка получения токена:', error)
      throw error
    }
  }

  /**
   * Парсинг JWT токена
   */
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      return {}
    }
  }

  /**
   * Закрыть браузер
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }
}

// Singleton instance
export const rustatAuthService = new RustatAuthService()
