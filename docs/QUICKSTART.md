# Quick Start Guide - Drive OI

Panduan cepat untuk menjalankan project Drive OI.

## ⚡ Quick Setup (5 menit)

### 1. Prerequisites Check

```bash
# Check Node.js version (harus >= 20.9.0)
node --version

# Jika belum, install Node.js 20 dengan nvm
nvm install 20
nvm use 20
```

### 2. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd drive-oi-v3

# Install dependencies
npm install
```

### 3. Configure Environment

```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local
# Ganti API_BASE_URL dengan Laravel API URL Anda
```

Minimal configuration:
```env
API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Drive OI
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=change-this-to-random-string
```

### 4. Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000 🎉

## 🔧 Laravel Backend Setup

### Quick Laravel Setup

```bash
# Install Sanctum
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate

# Create AuthController
php artisan make:controller Api/AuthController
```

Copy code dari [LARAVEL_BACKEND.md](./LARAVEL_BACKEND.md) dan tambahkan routes.

### Test Backend

```bash
# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 📱 Testing the App

### 1. Create Test User di Laravel

```bash
php artisan tinker
```

```php
User::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => Hash::make('password')
]);
```

### 2. Login di Frontend

1. Buka http://localhost:3000
2. Akan auto-redirect ke `/login`
3. Login dengan:
   - Email: `test@example.com`
   - Password: `password`
4. Setelah login, redirect ke `/dashboard`

### 3. Test Protected Routes

- ✅ `/dashboard` - Harus bisa diakses
- ✅ `/files` - Harus bisa diakses
- ✅ `/shared` - Harus bisa diakses
- ✅ `/settings` - Harus bisa diakses
- ❌ `/login` - Auto redirect ke dashboard jika sudah login

## 🎯 Project Structure Quick Reference

```
drive-oi-v3/
├── app/
│   ├── (public)/          # Public pages (login, register)
│   ├── (protected)/       # Protected pages (dashboard, files)
│   └── actions/           # Server Actions (API calls)
├── components/
│   └── ui/                # Reusable components
├── lib/
│   ├── api-client.ts      # API client
│   ├── session.ts         # Session management
│   ├── types.ts           # TypeScript types
│   └── services/          # Backend services
├── middleware.ts          # Route protection
└── .env.local            # Environment variables
```

## 🔑 Key Files

### Environment Variables
- `.env.local` - Local development config
- `.env.example` - Template untuk environment variables

### Authentication
- `lib/session.ts` - Session management
- `app/actions/auth.actions.ts` - Login/logout actions
- `middleware.ts` - Route protection

### API Communication
- `lib/api-client.ts` - Base API client
- `lib/services/auth.service.ts` - Auth service

### UI Components
- `components/ui/Button.tsx` - Button component
- `components/ui/Input.tsx` - Input component
- `components/ui/Card.tsx` - Card component
- `components/ui/Alert.tsx` - Alert component

## 🐛 Common Issues & Solutions

### Issue: "Node.js version not supported"

**Solution:**
```bash
nvm install 20
nvm use 20
```

### Issue: "Cannot connect to Laravel API"

**Solution:**
1. Check Laravel is running: `php artisan serve`
2. Check `API_BASE_URL` di `.env.local`
3. Check CORS configuration di Laravel

### Issue: "Login failed"

**Solution:**
1. Check user exists di database
2. Check password correct
3. Check Laravel logs: `tail -f storage/logs/laravel.log`
4. Check browser console untuk errors

### Issue: "Unauthorized" after login

**Solution:**
1. Clear browser cookies
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server

### Issue: "CORS error"

**Solution:**
1. Check `config/cors.php` di Laravel
2. Add frontend URL ke `allowed_origins`
3. Clear Laravel config: `php artisan config:clear`

## 📚 Next Steps

### 1. Customize UI
- Edit colors di `app/globals.css`
- Modify components di `components/ui/`
- Update logo dan branding

### 2. Add Features
- Implement file upload
- Add folder management
- Create sharing functionality
- Add user profile page

### 3. Deploy

**Frontend (Vercel):**
```bash
vercel deploy
```

**Backend (Laravel Forge, DigitalOcean, etc.):**
- Follow Laravel deployment guide
- Set environment variables
- Enable HTTPS
- Configure CORS

## 🎓 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)

### Laravel
- [Laravel Documentation](https://laravel.com/docs)
- [Sanctum Documentation](https://laravel.com/docs/sanctum)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 💡 Tips

1. **Development**
   - Use `npm run dev` dengan hot reload
   - Check browser console untuk errors
   - Check terminal untuk server errors

2. **Debugging**
   - Use `console.log()` di Server Actions
   - Check Network tab di browser DevTools
   - Use React DevTools untuk component inspection

3. **Performance**
   - Next.js automatically optimizes images
   - Use Server Components when possible
   - Minimize client-side JavaScript

4. **Security**
   - Never commit `.env.local`
   - Use strong SESSION_SECRET
   - Enable HTTPS in production
   - Regular security audits

## 🤝 Getting Help

1. **Documentation**
   - [README.md](./README.md) - Complete documentation
   - [SECURITY.md](./SECURITY.md) - Security architecture
   - [LARAVEL_BACKEND.md](./LARAVEL_BACKEND.md) - Backend setup

2. **Issues**
   - Check existing issues
   - Create detailed bug reports
   - Include error messages and logs

3. **Community**
   - Next.js Discord
   - Laravel Discord
   - Stack Overflow

## ✅ Checklist

Before starting development:
- [ ] Node.js >= 20.9.0 installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured
- [ ] Laravel backend running
- [ ] Test user created
- [ ] Can login successfully
- [ ] Protected routes working

## 🚀 Ready to Build!

Sekarang Anda siap untuk develop aplikasi Cloud Drive! 

Start dengan:
1. Customize UI sesuai brand Anda
2. Implement file management features
3. Add advanced functionality
4. Deploy to production

Happy coding! 🎉
