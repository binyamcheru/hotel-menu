import { useAuth } from '@/providers/auth-provider';

export default function SuperAdminPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Manage Hotels</h2>
                <p className="text-gray-600">List of all hotels and their statuses will appear here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                    <h3 className="text-indigo-900 font-medium">Total Hotels</h3>
                    <p className="text-2xl font-bold text-indigo-700">12</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                    <h3 className="text-green-900 font-medium">Active Menus</h3>
                    <p className="text-2xl font-bold text-green-700">45</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="text-blue-900 font-medium">Monthly Scans</h3>
                    <p className="text-2xl font-bold text-blue-700">1,240</p>
                </div>
            </div>
        </div>
    );
}
