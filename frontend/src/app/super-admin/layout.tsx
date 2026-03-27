'use client';

import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { LayoutDashboard, Hotel as HotelIcon, Users, Activity, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/super-admin' },
        { label: 'Hotels', icon: HotelIcon, href: '/super-admin/hotels' },
        { label: 'Managers', icon: Users, href: '/super-admin/managers' },
        { label: 'Activity', icon: Activity, href: '/super-admin/activity' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <ProtectedRoute allowedRoles={['superadmin']}>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed h-full transition-all">
                    <div className="p-8">
                        <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100">
                            <HotelIcon className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Super Admin</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Management Console</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${isActive
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-72 p-10 min-h-screen">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
