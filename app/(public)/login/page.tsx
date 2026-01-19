'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { loginAction } from '@/app/actions/auth.actions';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { FaGoogle } from 'react-icons/fa';
import { RiLoginCircleFill, RiRefreshLine } from 'react-icons/ri';
import { HiShieldCheck } from 'react-icons/hi2';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { getAppVersion } from '@/lib/version';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
  const errorParam = searchParams.get('error');

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState(errorParam || '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isAutoLoginProcessing, setIsAutoLoginProcessing] = useState(false);

  // Generate captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2, answer: num1 + num2 });
    setCaptchaAnswer('');
  };

  // Check auto-login params first
  useEffect(() => {
    const aoSemesta = searchParams.get('ao-semesta');
    const nip = searchParams.get('nip');
    const key = searchParams.get('key');
    const VALID_KEY = '049976129942';

    // Jika ada params auto-login yang valid, set flag
    if (aoSemesta === 'true' && nip && key === VALID_KEY) {
      setIsAutoLoginProcessing(true);
    }
  }, [searchParams]);

  // Auto-login logic
  useEffect(() => {
    const handleAutoLogin = async () => {
      const aoSemesta = searchParams.get('ao-semesta');
      const nip = searchParams.get('nip');
      const key = searchParams.get('key');

      // Validasi key untuk keamanan
      const VALID_KEY = '049976129942';

      // Check if all required params are present and key is valid
      if (aoSemesta === 'true' && nip && key === VALID_KEY) {
        setIsLoading(true);
        setError('');

        try {
          const result = await loginAction({ username: nip, password: '#OganIlirBangkit!!' });

          if (result.success) {
            // Reset failed attempts on success
            setFailedAttempts(0);
            setShowCaptcha(false);
            router.push(redirectTo);
            router.refresh();
          } else {
            // Increment failed attempts
            setFailedAttempts(prev => prev + 1);

            // Handle validation errors from backend
            if (result.errors) {
              const backendErrors: Record<string, string> = {};
              Object.entries(result.errors).forEach(([key, messages]) => {
                backendErrors[key] = Array.isArray(messages) ? messages[0] : messages;
              });
              setFieldErrors(backendErrors);
            }

            // Handle message object (validation errors)
            if (result.message && typeof result.message === 'object') {
              const backendErrors: Record<string, string> = {};
              Object.entries(result.message).forEach(([key, messages]) => {
                backendErrors[key] = Array.isArray(messages) ? messages[0] : messages;
              });
              setFieldErrors(backendErrors);
              setError('Terdapat kesalahan validasi');
            } else {
              // Handle string message
              setError(result.message || 'Login gagal');
            }

            // Regenerate captcha if shown
            if (showCaptcha) {
              generateCaptcha();
            }
          }
        } catch (err: any) {
          console.error('❌ Auto-login error:', err);
          setFailedAttempts(prev => prev + 1);
          setError(err?.message || 'Terjadi kesalahan yang tidak terduga');
          if (showCaptcha) {
            generateCaptcha();
          }
        } finally {
          setIsLoading(false);
          setIsAutoLoginProcessing(false);
        }
      } else if (aoSemesta === 'true' && key && key !== VALID_KEY) {
        // Key tidak valid
        console.error('❌ Invalid auto-login key');
        setError('Key tidak valid. Akses ditolak.');
        setIsAutoLoginProcessing(false);
      }
    };

    handleAutoLogin();
  }, [searchParams, router, redirectTo, showCaptcha]);

  useEffect(() => {
    if (failedAttempts >= 5) {
      setShowCaptcha(true);
      generateCaptcha();
    }
  }, [failedAttempts]);

  const handleLogin = async () => {
    const username = usernameRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    // Reset errors
    setError('');
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};

    if (!username || username.trim() === '') {
      errors.username = 'Username/NIP harus diisi';
    } else if (username.length < 3) {
      errors.username = 'Username/NIP minimal 3 karakter';
    }

    if (!password || password.trim() === '') {
      errors.password = 'Kata sandi harus diisi';
    } else if (password.length < 6) {
      errors.password = 'Kata sandi minimal 6 karakter';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Mohon perbaiki kesalahan pada form');
      return;
    }

    // Validate captcha if shown
    if (showCaptcha) {
      if (!captchaAnswer) {
        setError('Silakan jawab pertanyaan captcha');
        return;
      }
      if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
        setError('Jawaban captcha salah');
        generateCaptcha();
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await loginAction({ username, password });

      if (result.success) {
        // Reset failed attempts on success
        setFailedAttempts(0);
        setShowCaptcha(false);
        router.push(redirectTo);
        router.refresh();
      } else {
        // Increment failed attempts
        setFailedAttempts(prev => prev + 1);

        // Handle validation errors from backend
        if (result.errors) {
          const backendErrors: Record<string, string> = {};
          Object.entries(result.errors).forEach(([key, messages]) => {
            backendErrors[key] = Array.isArray(messages) ? messages[0] : messages;
          });
          setFieldErrors(backendErrors);
        }

        // Handle message object (validation errors)
        if (result.message && typeof result.message === 'object') {
          const backendErrors: Record<string, string> = {};
          Object.entries(result.message).forEach(([key, messages]) => {
            backendErrors[key] = Array.isArray(messages) ? messages[0] : messages;
          });
          setFieldErrors(backendErrors);
          setError('Terdapat kesalahan validasi');
        } else {
          // Handle string message
          setError(result.message || 'Login gagal');
        }

        // Regenerate captcha if shown
        if (showCaptcha) {
          generateCaptcha();
        }
      }
    } catch (err: any) {
      setFailedAttempts(prev => prev + 1);
      setError(err?.message || 'Terjadi kesalahan yang tidak terduga');
      if (showCaptcha) {
        generateCaptcha();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setIsGoogleLoading(true);
    console.log('🔐 Redirecting to Google OAuth...');
    // Redirect to custom Google OAuth endpoint
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/login-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#003a69]/90 via-[#003a69]/80 to-[#005a9c]/90 backdrop-blur-[2px]"></div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ebbd18] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#ebbd18] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#ebbd18] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Auto-login loading overlay */}
      {isAutoLoginProcessing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <RiRefreshLine className="w-16 h-16 text-[#003a69] dark:text-[#ebbd18] animate-spin mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Memproses Auto-Login
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Sedang login dengan akun baru...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6 gap-8">
            <img
              src="/logo-oi.webp"
              alt="Logo OI"
              className="h-24 w-auto drop-shadow-2xl"
            />
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="Logo Drive"
                className="h-20 w-auto drop-shadow-2xl"
              />
              <img
                src="/word.png"
                alt="Logo Drive"
                className="h-16 w-auto drop-shadow-2xl"
              />
            </div>
          </div>
          {/* <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Selamat Datang Kembali
          </h1> */}
          <p className="text-white/90 text-sm drop-shadow-md">
            Drive Ogan Ilir hadir sebagai solusi digital yang memudahkan dalam menyimpan dan berbagi file secara daring. Lebih praktis, aman, dan dapat diakses kapan saja.
          </p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 shadow-2xl shadow-black/30 border-2 border-[#ebbd18]/30">
          {/* <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18]">Masuk</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Masukkan Username/NIP dan Kata Sandi
            </CardDescription>
          </CardHeader> */}

          <CardContent className="space-y-4">
            {error && (
              <Alert
                variant="error"
                message={error}
                onClose={() => setError('')}
              />
            )}

            <Input
              ref={usernameRef}
              label="Username / NIP"
              type="text"
              placeholder="Username / NIP Anda"
              error={fieldErrors.username}
              required
              disabled={isLoading}
              autoComplete="username"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />

            <div className="relative">
              <Input
                ref={passwordRef}
                label="Kata Sandi"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={fieldErrors.password}
                required
                disabled={isLoading}
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={isLoading}
              >
                {showPassword ? (
                  <HiEyeOff className="w-5 h-5" />
                ) : (
                  <HiEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {showCaptcha && (
              <div className="p-5 bg-gradient-to-br from-[#003a69]/5 to-[#ebbd18]/5 dark:from-[#003a69]/10 dark:to-[#ebbd18]/10 rounded-xl border-2 border-[#ebbd18]/30 shadow-lg">
                <label className="text-sm font-semibold text-[#003a69] dark:text-[#ebbd18] mb-3 flex items-center gap-2">
                  <HiShieldCheck className="w-5 h-5" /> Verifikasi Keamanan
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-5 py-3 bg-white/90 dark:bg-gray-800/90 rounded-xl border-2 border-[#003a69]/20 font-mono text-xl font-bold text-[#003a69] dark:text-[#ebbd18] shadow-md">
                    {captchaQuestion.num1} + {captchaQuestion.num2} = ?
                  </div>
                  <input
                    type="text"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Jawaban"
                    className="flex-1 px-4 py-3 border-2 border-[#003a69]/20 rounded-xl focus:ring-2 focus:ring-[#ebbd18] focus:border-[#ebbd18] bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white font-semibold shadow-md"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <AiOutlineExclamationCircle className="w-4 h-4" /> Captcha muncul setelah 5 kali percobaan login gagal
                </p>
              </div>
            )}

            <div className="flex items-center text-sm mt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#003a69]/30 text-[#003a69] focus:ring-[#ebbd18] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-[#003a69] dark:group-hover:text-[#ebbd18] transition-colors">
                  Ingat saya
                </span>
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-[#003a69] to-[#005a9c] hover:from-[#002347] hover:to-[#003a69] text-white font-semibold shadow-lg shadow-[#003a69]/30 border-0 transition-all duration-300 hover:shadow-xl hover:shadow-[#003a69]/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              isLoading={isLoading}
              disabled={isLoading || isGoogleLoading}
              onClick={handleLogin}
            >
              {isLoading ? (
                <>
                  <RiRefreshLine className="w-5 h-5 animate-spin" /> Masuk...
                </>
              ) : (
                <>
                  <RiLoginCircleFill className="w-5 h-5" /> Masuk
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-[#003a69]/10 dark:border-[#ebbd18]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-semibold">
                <span className="bg-white/80 dark:bg-gray-900/80 px-3 py-1 text-gray-600 dark:text-gray-400 rounded-full">
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-3 border-2 border-[#003a69]/20 hover:border-[#ebbd18] hover:bg-[#ebbd18]/5 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#ebbd18]/20 hover:-translate-y-0.5"
              isLoading={isGoogleLoading}
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleLogin}
            >
              {!isGoogleLoading && (
                <FaGoogle className="w-5 h-5 text-[#4285F4]" />
              )}
              {isGoogleLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Google'}
            </Button>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-white/80 space-y-2">
          <p>
            Dengan melanjutkan, Anda menyetujui{' '}
            <Link href="/terms" className="text-[#ebbd18] hover:text-[#ffd54f] hover:underline font-medium transition-colors">
              Ketentuan Layanan
            </Link>{' '}
            dan{' '}
            <Link href="/privacy" className="text-[#ebbd18] hover:text-[#ffd54f] hover:underline font-medium transition-colors">
              Kebijakan Privasi
            </Link>
          </p>
          <p className="text-xs text-white/60">
            {getAppVersion().name} • Version {getAppVersion().version}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/90 via-primary/80 to-blue-600/90">
        <div className="text-white text-center">
          <RiRefreshLine className="w-16 h-16 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}