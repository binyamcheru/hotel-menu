import { ProtectedRoute } from '@/features/auth/components/protected-route';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <div className="min-h-screen bg-gray-100">
                <header className="bg-white shadow-sm px-6 py-4">
                    <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
