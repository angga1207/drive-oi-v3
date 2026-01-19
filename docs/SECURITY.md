# Security Architecture

Dokumentasi tentang arsitektur keamanan Drive OI.

## 🔒 Overview

Drive OI menggunakan arsitektur multi-layer security untuk memastikan data dan API endpoints tetap aman dari potential attacks.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│                  (No direct API access)                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS only
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js Frontend                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Client Components (Browser)             │  │
│  │  - Hanya memanggil Server Actions                 │  │
│  │  - Tidak punya akses ke API credentials           │  │
│  │  - Tidak tahu Laravel API URL                     │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Server Actions & Components               │  │
│  │  - Validasi input dari client                     │  │
│  │  - Memanggil service layer                        │  │
│  │  - Manage session cookies                         │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Service Layer                          │  │
│  │  - Business logic                                 │  │
│  │  - Memanggil API Client                          │  │
│  │  - Error handling                                 │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │            API Client                             │  │
│  │  - Inject Bearer token dari session               │  │
│  │  - Make requests ke Laravel                       │  │
│  │  - Timeout & error handling                       │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS + Bearer Token
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Laravel Backend API                     │
│  - Sanctum authentication                               │
│  - Input validation                                     │
│  - Rate limiting                                        │
│  - Database access                                      │
└─────────────────────────────────────────────────────────┘
```

## 🛡️ Security Features

### 1. Token Management

**httpOnly Cookies**
- Token disimpan di httpOnly cookie
- Tidak accessible via JavaScript
- Protected dari XSS attacks
- Automatically sent dengan setiap request

**Session Encryption**
```typescript
// Token dan user data di-encrypt sebelum disimpan
const sessionData = {
  token: "Bearer token dari Laravel",
  user: { /* user data */ },
  expiresAt: timestamp
};

// Encrypted dan stored di httpOnly cookie
```

**Token Rotation**
- Token di-refresh secara periodic
- Old token di-revoke setelah refresh
- Minimizes token exposure window

### 2. API Protection

**Never Exposed to Client**
```typescript
// ❌ NEVER do this (client-side)
fetch('https://api.backend.com/data', {
  headers: { 'Authorization': 'Bearer token' }
});

// ✅ ALWAYS do this (server-side)
'use server';
export async function getData() {
  const token = await getToken();
  return apiClient.get('/data', { token });
}
```

**Environment Variables**
- `API_BASE_URL` tidak pernah di-expose ke client
- Hanya digunakan di server-side code
- Tidak ada di bundle JavaScript client

**Request Validation**
- Semua input di-validate di server side
- Type checking dengan TypeScript
- Sanitization sebelum dikirim ke backend

### 3. Middleware Protection

**Route Protection**
```typescript
// middleware.ts
const protectedRoutes = ['/dashboard', '/files'];
const authRoutes = ['/login', '/register'];

// Auto redirect jika:
// - Akses protected route tanpa auth → redirect ke login
// - Akses auth route saat sudah login → redirect ke dashboard
```

**Session Validation**
- Check session existence
- Check session expiration
- Check token validity

### 4. CSRF Protection

**Same-Site Cookies**
```typescript
cookies.set('session', data, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',  // CSRF protection
});
```

**Server Actions**
Next.js Server Actions automatically protected dari CSRF attacks.

### 5. XSS Prevention

**React Auto-Escaping**
- React automatically escapes output
- Prevents injection attacks

**Content Security Policy** (Recommended untuk production)
```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

## 🚨 Attack Vectors & Mitigations

### 1. Token Theft

**Attack**: Attacker tries to steal authentication token

**Mitigations**:
- ✅ httpOnly cookies (tidak accessible via JS)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite attribute (CSRF protection)
- ✅ Short token expiration
- ✅ Token rotation

### 2. Man-in-the-Middle (MITM)

**Attack**: Attacker intercepts network traffic

**Mitigations**:
- ✅ HTTPS enforcement (production)
- ✅ HSTS headers
- ✅ Certificate pinning (optional)

### 3. API Endpoint Discovery

**Attack**: Attacker tries to find backend API endpoints

**Mitigations**:
- ✅ API URL never in client code
- ✅ API URL dalam environment variables
- ✅ No API calls dari client side
- ✅ All requests proxied through Next.js server

### 4. Session Hijacking

**Attack**: Attacker steals session cookie

**Mitigations**:
- ✅ httpOnly cookies
- ✅ Secure flag
- ✅ Session expiration
- ✅ IP binding (optional)
- ✅ User agent validation (optional)

### 5. Brute Force

**Attack**: Attacker tries multiple login attempts

**Mitigations**:
- ✅ Rate limiting di Laravel
- ✅ Account lockout after failed attempts
- ✅ CAPTCHA (optional)
- ✅ 2FA (future implementation)

### 6. SQL Injection

**Attack**: Attacker injects SQL via input

**Mitigations**:
- ✅ Laravel Eloquent ORM
- ✅ Prepared statements
- ✅ Input validation
- ✅ Type checking

### 7. XSS (Cross-Site Scripting)

**Attack**: Attacker injects malicious scripts

**Mitigations**:
- ✅ React auto-escaping
- ✅ CSP headers
- ✅ Input sanitization
- ✅ Output encoding

## 📋 Security Checklist

### Development
- [ ] Never log sensitive data
- [ ] Use environment variables untuk secrets
- [ ] Validate all user input
- [ ] Use TypeScript untuk type safety
- [ ] Keep dependencies updated

### Production
- [ ] Enable HTTPS
- [ ] Set secure cookies
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set CSP headers
- [ ] Enable HSTS
- [ ] Use strong SESSION_SECRET
- [ ] Disable debug mode
- [ ] Monitor error logs
- [ ] Setup security alerts

## 🔐 Best Practices

### 1. Principle of Least Privilege
- Server Actions hanya expose data yang diperlukan
- User hanya bisa akses data mereka sendiri
- Role-based access control (future)

### 2. Defense in Depth
- Multiple layers of security
- Tidak bergantung pada single security measure
- Validation di client dan server

### 3. Secure by Default
- Default settings sudah secure
- HTTPS enforcement
- Secure cookies
- Auto CSRF protection

### 4. Regular Security Audits
- Review dependencies untuk vulnerabilities
- Update packages regularly
- Monitor security advisories
- Penetration testing (recommended)

### 5. Logging & Monitoring
```typescript
// Log security events
logger.warn('Failed login attempt', {
  email: attempt.email,
  ip: request.ip,
  timestamp: new Date(),
});
```

## 🚀 Production Hardening

### Environment Variables
```env
# NEVER commit these to git
SESSION_SECRET=use-crypto-random-string-min-32-chars
API_BASE_URL=https://api.production.com
```

### HTTPS Configuration
```typescript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Security Headers
```typescript
// next.config.ts
headers: async () => [
  {
    source: '/(.*)',
    headers: [
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
    ],
  },
],
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [Laravel Security](https://laravel.com/docs/security)
- [Web Security Academy](https://portswigger.net/web-security)

## 🤝 Reporting Security Issues

Jika menemukan security vulnerability, segera laporkan ke security team:
- Email: security@company.com
- DO NOT create public GitHub issues untuk security bugs
