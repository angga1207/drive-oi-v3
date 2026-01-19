# Laravel Backend Setup Guide

Panduan untuk setup Laravel backend yang kompatibel dengan Drive OI frontend.

## Requirements

- PHP >= 8.1
- Composer
- Laravel >= 10.x
- MySQL/PostgreSQL

## Installation

### 1. Install Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 2. Configure CORS

Edit `config/cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',
        env('FRONTEND_URL', 'http://localhost:3000')
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 3. Configure Sanctum

Edit `config/sanctum.php`:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

### 4. Environment Variables

Add to `.env`:

```env
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

## API Endpoints

### Authentication Controller

Create `app/Http/Controllers/Api/AuthController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Register
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        
        // Delete current token
        $request->user()->currentAccessToken()->delete();
        
        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
}
```

### Routes

Add to `routes/api.php`:

```php
use App\Http\Controllers\Api\AuthController;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    
    // Add your other protected routes here
    // Route::apiResource('drive', DriveController::class);
});
```

### Middleware

Create `app/Http/Middleware/ApiResponse.php` for consistent API responses:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiResponse
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if ($response->exception) {
            return response()->json([
                'success' => false,
                'message' => $response->exception->getMessage(),
            ], $response->status());
        }

        return $response;
    }
}
```

Register in `app/Http/Kernel.php`:

```php
protected $middlewareGroups = [
    'api' => [
        // ... existing middleware
        \App\Http\Middleware\ApiResponse::class,
    ],
];
```

## Database Schema

### Users Table

Laravel default users table sudah cukup, tapi bisa ditambahkan:

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->bigInteger('storage_quota')->default(50 * 1024 * 1024 * 1024); // 50GB
    $table->bigInteger('storage_used')->default(0);
    $table->rememberToken();
    $table->timestamps();
});
```

### Drive Items Table (Optional - untuk future implementation)

```php
Schema::create('drive_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('parent_id')->nullable()->constrained('drive_items')->onDelete('cascade');
    $table->string('name');
    $table->enum('type', ['file', 'folder']);
    $table->string('path')->nullable();
    $table->string('mime_type')->nullable();
    $table->bigInteger('size')->default(0);
    $table->boolean('is_shared')->default(false);
    $table->timestamps();
    $table->softDeletes();
    
    $table->index(['user_id', 'parent_id']);
});
```

## Testing

### Test Authentication

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get User
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Best Practices

1. **Rate Limiting**: Add rate limiting to login endpoint
```php
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
});
```

2. **Token Expiration**: Configure token expiration in `sanctum.php`
```php
'expiration' => 60 * 24, // 24 hours
```

3. **HTTPS Only**: Enforce HTTPS in production
```php
// app/Providers/AppServiceProvider.php
if ($this->app->environment('production')) {
    URL::forceScheme('https');
}
```

4. **Input Validation**: Always validate and sanitize input

5. **Error Handling**: Use proper HTTP status codes

## Deployment

### Production Checklist

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure proper `APP_URL`
- [ ] Set strong `APP_KEY`
- [ ] Configure database credentials
- [ ] Set `FRONTEND_URL` to production URL
- [ ] Enable HTTPS
- [ ] Configure file storage (S3, etc.)
- [ ] Setup queue workers
- [ ] Enable caching
- [ ] Setup monitoring

## Troubleshooting

### CORS Issues

1. Clear config cache:
```bash
php artisan config:clear
php artisan cache:clear
```

2. Verify CORS headers in response

### Token Issues

1. Check Sanctum configuration
2. Verify token is being sent in Authorization header
3. Check token expiration

### Database Issues

1. Run migrations:
```bash
php artisan migrate:fresh
```

2. Check database connection in `.env`

## Additional Resources

- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [API Resource Documentation](https://laravel.com/docs/eloquent-resources)
- [Laravel API Best Practices](https://laravel.com/docs/api-authentication)
