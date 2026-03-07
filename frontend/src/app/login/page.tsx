'use client';

import React, { useState } from 'react';
import { Activity, Clock, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { ThemeToggle } from '@/components/features/ThemeToggle';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [sex, setSex] = useState('male');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const router = useRouter();

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!email.includes('@')) newErrors.email = 'Valid email is required.';
        if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

        if (!isLogin) {
            if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
            if (!dob) newErrors.dob = 'Date of birth is required.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        if (validate()) {
            setIsLoading(true);
            try {
                if (isLogin) {
                    const params = new URLSearchParams();
                    params.append('username', email);
                    params.append('password', password);

                    const data = await fetchApi('/auth/login', {
                        method: 'POST',
                        body: params,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    });

                    localStorage.setItem('medscan-token', data.access_token);

                    if (data.user.role === 'admin' || data.user.role === 'hospital') router.push('/admin');
                    else if (data.user.role === 'doctor') router.push('/doctor');
                    else router.push('/patient');
                } else {
                    const payload = {
                        email,
                        password,
                        full_name: fullName,
                        dob,
                        sex,
                        role: 'patient'
                    };

                    await fetchApi('/auth/register', {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });

                    // Auto login after register
                    const params = new URLSearchParams();
                    params.append('username', email);
                    params.append('password', password);
                    const data = await fetchApi('/auth/login', {
                        method: 'POST',
                        body: params,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    });

                    localStorage.setItem('medscan-token', data.access_token);
                    router.push('/patient');
                }
            } catch (err: any) {
                setApiError(err.message || 'An error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // The custom input className as requested by the directive
    const inputClass = cn(
        'h-[44px] w-full rounded-[6px] border border-border bg-transparent px-[16px] text-[15px] font-sans text-text-primary transition-all duration-200 outline-none placeholder:text-text-muted',
        'focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,201,167,0.15)]'
    );

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-bg-base">
            <ThemeToggle className="fixed top-[16px] right-[16px] z-50" />

            {/* Left Panel: Context & Brand */}
            <div className="relative flex w-full lg:w-1/2 flex-col justify-center login-left-panel p-[48px] overflow-hidden">
                {/* Dot pattern background mix blend */}
                <div className="absolute inset-0 pointer-events-none login-left-dots" />

                <div className="relative z-10 mx-auto w-full max-w-md">
                    {/* Logo Mark */}
                    <div className="mb-[48px]">
                        <h1 className="font-sora text-[40px] font-bold text-text-primary leading-none">
                            MedScan
                        </h1>
                        <div className="h-[2px] w-[60px] bg-accent mt-2 relative overflow-hidden rounded-full">
                            <Activity className="absolute right-0 top-1/2 -translate-y-1/2 text-accent h-4 w-4" />
                        </div>
                    </div>

                    <h2 className="font-sora text-[32px] font-bold text-text-primary mb-[16px] leading-[1.2]">
                        Your pathology reports,<br />understood.
                    </h2>

                    <div className="flex flex-col gap-6 mt-[48px]">
                        <div className="flex items-center gap-4">
                            <div className="bg-bg-elevated p-3 rounded-[6px]">
                                <Clock className="text-accent h-[24px] w-[24px]" />
                            </div>
                            <span className="font-sans text-[16px] text-text-body font-medium">Quick AI Analysis</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-bg-elevated p-3 rounded-[6px]">
                                <TrendingUp className="text-accent h-[24px] w-[24px]" />
                            </div>
                            <span className="font-sans text-[16px] text-text-body font-medium">Biomarker Trend Tracking</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-bg-elevated p-3 rounded-[6px]">
                                <ShieldCheck className="text-accent h-[24px] w-[24px]" />
                            </div>
                            <span className="font-sans text-[16px] text-text-body font-medium">Secure Doctor Sharing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="flex w-full lg:w-1/2 flex-col justify-center px-[48px] py-[64px]">
                <div className="mx-auto w-full max-w-md">
                    <h2 className="font-sora text-[28px] font-bold text-text-primary mb-[8px]">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="font-sans text-[15px] text-text-muted mb-[32px]">
                        {isLogin
                            ? 'Enter your details to access your reports.'
                            : 'Sign up to start tracking your pathology reports.'}
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]" noValidate>
                        {apiError && (
                            <div className="bg-status-high/10 border border-status-high text-status-high text-[14px] p-3 rounded-[6px]">
                                {apiError}
                            </div>
                        )}

                        {!isLogin && (
                            <>
                                <div className="flex flex-col gap-[8px]">
                                    <label className="font-sans text-[12px] font-medium tracking-[0.08em] uppercase text-text-muted">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => { setFullName(e.target.value); if (errors.fullName) setErrors({ ...errors, fullName: '' }) }}
                                        className={cn(inputClass, errors.fullName && 'border-status-high focus:border-status-high focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]')}
                                        placeholder="Jane Doe"
                                    />
                                    {errors.fullName && <span className="text-[12px] text-status-high mt-1">{errors.fullName}</span>}
                                </div>

                                <div className="flex gap-4 w-full">
                                    <div className="flex flex-col gap-[8px] w-1/2">
                                        <label className="font-sans text-[12px] font-medium tracking-[0.08em] uppercase text-text-muted">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={dob}
                                            onChange={(e) => { setDob(e.target.value); if (errors.dob) setErrors({ ...errors, dob: '' }) }}
                                            className={cn(inputClass, 'w-full', errors.dob && 'border-status-high focus:border-status-high focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]')}
                                        />
                                        {errors.dob && <span className="text-[12px] text-status-high mt-1">{errors.dob}</span>}
                                    </div>

                                    <div className="flex flex-col gap-[8px] w-1/2">
                                        <label className="font-sans text-[12px] font-medium tracking-[0.08em] uppercase text-text-muted">
                                            Biological Sex
                                        </label>
                                        <select
                                            value={sex}
                                            onChange={(e) => setSex(e.target.value)}
                                            className={cn(inputClass, 'w-full')}
                                        >
                                            <option value="male" className="bg-bg-elevated">Male</option>
                                            <option value="female" className="bg-bg-elevated">Female</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col gap-[8px]">
                            <label className="font-sans text-[12px] font-medium tracking-[0.08em] uppercase text-text-muted">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }) }}
                                className={cn(inputClass, errors.email && 'border-status-high focus:border-status-high focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]')}
                                placeholder="you@example.com"
                            />
                            {errors.email && <span className="text-[12px] text-status-high mt-1">{errors.email}</span>}
                        </div>

                        <div className="flex flex-col gap-[8px]">
                            <label className="font-sans text-[12px] font-medium tracking-[0.08em] uppercase text-text-muted">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }) }}
                                className={cn(inputClass, errors.password && 'border-status-high focus:border-status-high focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]')}
                                placeholder="••••••••"
                            />
                            {errors.password && <span className="text-[12px] text-status-high mt-1">{errors.password}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-[16px] w-full h-[44px] rounded-[4px] bg-accent font-sans text-[15px] font-bold btn-primary-text hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <p className="mt-[32px] text-center text-[14px] text-text-muted">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                            className="font-medium text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded px-1"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>

        </div>
    );
}
