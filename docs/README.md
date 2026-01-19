# Drive OI - Cloud Storage Application

Modern cloud storage application built with Next.js 16 and Laravel backend integration.

## 🚀 Features

- **Secure Authentication**: Bearer token-based authentication with Laravel backend
- **Protected Routes**: Automatic route protection with middleware
- **Modern UI**: Responsive design with Tailwind CSS
- **Fast & Optimized**: Server-side rendering with Next.js App Router
- **Type-Safe**: Full TypeScript support
- **Dark Mode**: Automatic dark mode support

## 🏗️ Architecture

### Security Architecture
- **Backend API**: Laravel API tidak pernah di-expose ke client side
- **Server Actions**: Client hanya memanggil Next.js Server Actions
- **Session Management**: Token disimpan di httpOnly cookies
- **Middleware Protection**: Automatic redirect untuk unauthorized access

### Project Structure
```
├── app/
│   ├── (public)/          # Public routes (login, register)
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (protected)/       # Protected routes (dashboard, files)
│   │   ├── dashboard/
│   │   ├── files/
│   │   ├── shared/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── actions/           # Server Actions
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                # Reusable UI components
│       ├── Alert.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── lib/
│   ├── api-client.ts      # API client (server-side only)
│   ├── config.ts          # Configuration
│   ├── session.ts         # Session management
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # Utility functions
│   └── services/          # Backend services
│       └── auth.service.ts
└── middleware.ts          # Route protection
```

## 🛠️ Setup

### Prerequisites
- Node.js >= 20.9.0
- Laravel backend with API endpoints
- npm or yarn

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd drive-oi-v3
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Laravel Backend API Configuration
API_BASE_URL=http://localhost:8000/api
API_TIMEOUT=30000

# App Configuration
NEXT_PUBLIC_APP_NAME=Drive OI
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret (change in production!)
SESSION_SECRET=your-super-secret-key-change-this-in-production
```

4. **Run development server**
```bash
npm run dev
```

Visit http://localhost:3000

## 🔒 Laravel Backend API Requirements

### Authentication Endpoints

#### POST /api/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  },
  "token": "1|abcdefghijklmnopqrstuvwxyz..."
}
```

#### POST /api/auth/register
```json
Request:
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password",
  "password_confirmation": "password"
}

Response: (same as login)
```

#### POST /api/auth/logout
```
Headers:
Authorization: Bearer {token}

Response:
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
```
Headers:
Authorization: Bearer {token}

Response:
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    ...
  }
}
```

## 🎨 UI Components

### Button
```tsx
import Button from '@/components/ui/Button';

<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

Variants: `primary | secondary | outline | ghost | danger`
Sizes: `sm | md | lg`

### Input
```tsx
import Input from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  error="Invalid email"
  helperText="Enter your email address"
/>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Alert
```tsx
import Alert from '@/components/ui/Alert';

<Alert
  variant="success"
  title="Success!"
  message="Operation completed"
  autoClose={true}
/>
```

## 🔐 Authentication Flow

1. **Login**: User submits credentials → Server Action → Laravel API → Set session cookie
2. **Protected Route**: Middleware checks cookie → Redirect if not authenticated
3. **API Calls**: Server Component/Action gets token from session → Call Laravel API
4. **Logout**: Server Action → Call Laravel logout → Clear session cookie

## 📱 Responsive Design

- **Mobile First**: Optimized untuk mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Mobile Navigation**: Bottom tab bar untuk mobile
- **Desktop Navigation**: Sidebar untuk desktop

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Environment Variables for Production
- Set `SESSION_SECRET` ke random string yang kuat
- Set `API_BASE_URL` ke production Laravel API URL
- Set `NEXT_PUBLIC_APP_URL` ke production URL

## 🛡️ Security Best Practices

1. **Never expose Laravel API URL** di client-side code
2. **Always use Server Actions** untuk API calls
3. **Store tokens** di httpOnly cookies
4. **Validate user input** di server side
5. **Use HTTPS** di production
6. **Rotate SESSION_SECRET** regularly

## 📝 Development Guidelines

### Adding New Protected Page
1. Create page di `app/(protected)/[page-name]/page.tsx`
2. Add route ke middleware.ts `protectedRoutes` array
3. Add navigation item ke `app/(protected)/layout.tsx`

### Adding New API Service
1. Create service di `lib/services/[service-name].service.ts`
2. Create Server Action di `app/actions/[action-name].actions.ts`
3. Call Server Action dari Client Component

### Adding New UI Component
1. Create component di `components/ui/[ComponentName].tsx`
2. Use TypeScript untuk props
3. Support dark mode dengan Tailwind classes

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📚 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Laravel (external)
- **Authentication**: Bearer Token
- **State Management**: React Server Components

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- **Development Team** - Initial work

## 🙏 Acknowledgments

- Next.js team for amazing framework
- Tailwind CSS for utility-first CSS
- Laravel team for robust backend framework
