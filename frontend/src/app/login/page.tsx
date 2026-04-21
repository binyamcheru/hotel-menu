'use client';

import { LoginForm } from '@/features/auth/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Left Side: Branding & Value Prop */}
            <div className="hidden lg:flex flex-col justify-between p-16 bg-indigo-600 relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 text-white">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tight">Digital Menu</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-6xl font-black text-white leading-tight mb-8 tracking-tighter">
                        Empowering the <br />
                        Future of Dining.
                    </h2>
                    <p className="text-indigo-100 text-xl leading-relaxed opacity-90 font-medium">
                        Join the world's leading hospitality groups leveraging our platform to
                        drive efficiency and exceed guest expectations.
                    </p>
                </div>

                {/* Refined Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px] -mr-32 -mt-32 opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] -ml-24 -mb-24 opacity-20"></div>

                <div className="relative z-10 text-indigo-200/60 text-sm font-semibold tracking-wide uppercase">
                    © 2024 Digital Menu Platform
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-3">Welcome Back</h1>
                        <p className="text-lg text-gray-500">Sign in to manage your digital experience.</p>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-gray-100">
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
