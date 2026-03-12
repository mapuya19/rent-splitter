import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

// Mock alert
global.alert = vi.fn() as unknown as typeof alert

// Mock Request for API tests
global.Request = class MockRequest {
  url: string
  method: string
  headers: Headers
  body: string | undefined

  constructor(input: string, init?: RequestInit & { body?: string }) {
    this.url = input
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.body = init?.body
  }

  async json(): Promise<unknown> {
    if (this.body) {
      return JSON.parse(this.body)
    }
    return {}
  }
} as unknown as typeof Request

// Mock Headers for API tests
global.Headers = class MockHeaders {
  private _headers: Map<string, string>

  constructor(init?: HeadersInit) {
    this._headers = new Map()
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]: [string, string]) => this._headers.set(key.toLowerCase(), value))
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => this._headers.set(key.toLowerCase(), value as string))
      }
    }
  }

  get(name: string): string | null {
    return this._headers.get(name.toLowerCase()) ?? null
  }

  set(name: string, value: string): void {
    this._headers.set(name.toLowerCase(), value)
  }

  has(name: string): boolean {
    return this._headers.has(name.toLowerCase())
  }

  entries(): IterableIterator<[string, string]> {
    return this._headers.entries()
  }

  keys(): IterableIterator<string> {
    return this._headers.keys()
  }

  values(): IterableIterator<string> {
    return this._headers.values()
  }

  forEach(callback: (value: string, key: string) => void): void {
    this._headers.forEach(callback)
  }
} as unknown as typeof Headers

// Mock Response for API tests
global.Response = class MockResponse {
  body: string | null
  status: number
  statusText: string
  headers: Headers
  ok: boolean

  constructor(body: string | null, init?: ResponseInit) {
    this.body = body
    this.status = init?.status ?? 200
    this.statusText = init?.statusText ?? 'OK'
    this.headers = new Headers(init?.headers)
    this.ok = this.status >= 200 && this.status < 300
  }

  async json(): Promise<unknown> {
    if (this.body) {
      return JSON.parse(this.body)
    }
    return {}
  }

  static json(data: unknown, init?: ResponseInit): MockResponse {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string>),
      },
    })
  }

  static error(): MockResponse {
    return new MockResponse(null, { status: 500, statusText: 'Internal Server Error' })
  }
} as unknown as typeof Response
