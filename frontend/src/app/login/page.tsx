'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MedScanLogo } from '@/components/MedScanLogo';
import { fetchApi } from '@/lib/api';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Patient');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const data = await fetchApi('/auth/login', {
                method: 'POST',
                body: params,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem('medscan-token', data.access_token);

            const userRole = data?.user?.role || 'patient';
            if (userRole === 'admin') router.push('/admin');
            else if (userRole === 'doctor') router.push('/doctor');
            else if (userRole === 'hospital') router.push('/admin');
            else router.push('/patient');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Panel - Hero */}
            <div className="hidden lg:flex w-1/2 items-center justify-center gradient-hero relative overflow-hidden">
                <div className="absolute inset-0 z-0 bg-primary-foreground/20 opacity-10">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.5 }}
                            className="absolute rounded-full border border-primary-foreground/30"
                            style={{
                                width: `${200 + i * 150}px`,
                                height: `${200 + i * 150}px`,
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        />
                    ))}
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="z-10 max-w-lg px-12 text-center"
                >
                    <h1 className="text-4xl font-bold text-primary-foreground mb-4">
                        Simplify Your Medical Journey
                    </h1>
                    <p className="text-lg text-primary-foreground/80">
                        Upload your pathology reports and get instant, easy-to-understand insights powered by AI.
                    </p>
                </motion.div>
            </div>

            {/* Right Panel - Login Form */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12"
            >
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <MedScanLogo size="lg" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                        <p className="text-muted-foreground mt-2">Please sign in to your account</p>
                    </div>


                    {/* Role Selector Tabs */}
                    <div className="grid w-full grid-cols-4 rounded-md bg-muted p-1">
                        {['Patient', 'Doctor', 'Admin', 'Dev'].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${role === r
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                        {error && (
                            <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 w-full rounded-md border border-input bg-background pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-12 w-full items-center justify-center rounded-md bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70"
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="h-5 w-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                                />
                            ) : (
                                `Sign In as ${role}`
                            )}
                        </button>
                    </form>

                    {role !== 'Dev' && (
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Don't have an account? </span>
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsLoading(true);
                                    setError(null);
                                    try {
                                        const bodyData: any = {
                                            email,
                                            password,
                                            role: role === 'Admin' ? 'hospital' : role.toLowerCase()
                                        };
                                        await fetchApi('/auth/register', {
                                            method: 'POST',
                                            body: JSON.stringify(bodyData)
                                        });
                                        await handleSubmit(new Event('submit') as unknown as React.FormEvent);
                                    } catch (err: any) {
                                        setError(err.message || 'Sign up failed.');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                className="font-semibold text-primary hover:underline"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
