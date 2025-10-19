// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    search: '',
  },
  writable: true,
})

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
})

// Mock alert
global.alert = jest.fn()

// Mock Request for API tests
global.Request = class Request {
  constructor(input, init) {
    Object.defineProperty(this, 'url', {
      value: input,
      writable: false,
      enumerable: true,
      configurable: false
    })
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.body = init?.body
  }
  
  async json() {
    if (this.body) {
      return JSON.parse(this.body)
    }
    return {}
  }
}

// Mock Headers for API tests
global.Headers = class Headers {
  constructor(init) {
    this._headers = new Map()
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this._headers.set(key.toLowerCase(), value))
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => this._headers.set(key.toLowerCase(), value))
      }
    }
  }
  
  get(name) {
    return this._headers.get(name.toLowerCase())
  }
  
  set(name, value) {
    this._headers.set(name.toLowerCase(), value)
  }
  
  has(name) {
    return this._headers.has(name.toLowerCase())
  }
  
  entries() {
    return this._headers.entries()
  }
  
  keys() {
    return this._headers.keys()
  }
  
  values() {
    return this._headers.values()
  }
  
  forEach(callback) {
    this._headers.forEach(callback)
  }
}

// Mock Response for API tests
global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
    this.ok = this.status >= 200 && this.status < 300
  }
  
  async json() {
    if (this.body) {
      return JSON.parse(this.body)
    }
    return {}
  }
  
  static json(data, init) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      }
    })
  }
  
  static error() {
    return new Response(null, { status: 500, statusText: 'Internal Server Error' })
  }
}
