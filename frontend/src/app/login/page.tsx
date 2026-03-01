'use client';

import { LoginForm } from '@/features/auth/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Left Side: Illustration / Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-600 relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 text-white">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center italic font-black">A</div>
                        <span className="text-xl font-bold tracking-tight">Antigravity</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="text-5xl font-black text-white leading-tight mb-6">
                        The next generation of <br />
                        hospitality is here.
                    </h2>
                    <p className="text-indigo-100 text-lg leading-relaxed">
                        Join thousands of hotels worldwide leveraging our platform to
                        increase efficiency and improve guest satisfaction.
                    </p>
                </div>

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px] -ml-24 -mb-24 opacity-30"></div>

                <div className="relative z-10 text-indigo-200 text-sm font-medium">
                    © 2024 Antigravity SaaS Platform
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50/50">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Welcome back</h1>
                        <p className="text-gray-500">Please enter your details to sign in.</p>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-indigo-100 border border-indigo-50/50">
                        <LoginForm />
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        Don&apos;t have an account? {' '}
                        <a href="#" className="font-bold text-indigo-600 hover:text-indigo-500">Contact Sales</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
