'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUsersByHotel, createUser, updateUser, deleteUser, getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { User, CreateUserRequest } from '@/types';
import { Plus, Users, Edit, Trash2, Mail, Phone, Shield, Loader2, X, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { ErrorState } from '@/components/ErrorState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, updateUserSchema } from '@/lib/schemas';

export default function UsersPage() {
    const { hotel } = useParams() as { hotel: string };
    const [users, setUsers] = useState<User[]>([]);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; status: number } | null>(null);
    const [isIdMapped, setIsIdMapped] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateUserRequest | any>({
        resolver: zodResolver(editingUser ? updateUserSchema : createUserSchema),
    });

    useEffect(() => {
        const fetchUsers = async () => {
            setError(null);
            setLoading(true);

            try {
                const [userRes, hotelRes] = await Promise.all([
                    fetchSafe<User[]>(() => getUsersByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);

                if (userRes.error && !userRes.data) {
                    setError({ message: userRes.error, status: userRes.status });
                } else {
                    setUsers(userRes.data || []);
                    setHotelData(hotelRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch users:', err);
                setError({ message: "Unable to load team members.", status: 500 });
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchUsers();
    }, [hotel, retryCount]);

    const handleRetry = () => setRetryCount(prev => prev + 1);

    const onSubmit = async (data: any) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.user_id, data);
            } else {
                await createUser({ ...data, hotel_id: hotel });
            }
            const response = await getUsersByHotel(hotel);
            setUsers(response.data.data);
            closeModal();
        } catch (error) {
            console.error('Failed to save user:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                setUsers(users.filter(u => u.user_id !== id));
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const openModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            reset({
                phone_no: user.phone_no,
                email: user.email || '',
                role: user.role,
                is_active: user.is_active,
            });
        } else {
            setEditingUser(null);
            reset({
                hotel_id: hotel,
                phone_no: '',
                email: '',
                password: '',
                role: 'admin',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        reset();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin']} requireHotelMatch={true}>
            <div className="space-y-10 max-w-6xl mx-auto p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> Team
                        </h1>
                        <p className="text-gray-500 font-medium">Manage administrators and staff members for this hotel.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Add Team Member
                    </button>
                </div>

                <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                    {error ? (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <ErrorState error={error.message} status={error.status} onRetry={handleRetry} />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                            <div className="bg-indigo-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto">
                                <Users className="w-12 h-12 text-indigo-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">No team members yet</h3>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto">Invite your staff to help manage your digital menu.</p>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                            >
                                Add First Member
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-gray-400">User</th>
                                        <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Contact</th>
                                        <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Role</th>
                                        <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                                        <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black">
                                                        {user.phone_no.slice(-2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900">User #{user.user_id.slice(0, 5)}</p>
                                                        <p className="text-xs text-gray-400 font-bold">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                                                        <Phone className="w-3 h-3 text-gray-300" />
                                                        {user.phone_no}
                                                    </div>
                                                    {user.email && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                            <Mail className="w-3 h-3 text-gray-300" />
                                                            {user.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2">
                                                    <Shield className={`w-4 h-4 ${user.role === 'admin' ? 'text-indigo-600' : 'text-purple-600'}`} />
                                                    <span className="text-sm font-black text-gray-700 capitalize">{user.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                {user.is_active ? (
                                                    <span className="flex items-center gap-1.5 text-green-600 text-xs font-black uppercase tracking-tight">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-red-500 text-xs font-black uppercase tracking-tight">
                                                        <XCircle className="w-4 h-4" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openModal(user)} className="p-3 hover:bg-white rounded-xl text-gray-400 hover:text-indigo-600 shadow-sm border border-transparent hover:border-indigo-50 transition-all">
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(user.user_id)} className="p-3 hover:bg-white rounded-xl text-gray-400 hover:text-red-600 shadow-sm border border-transparent hover:border-red-50 transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {editingUser ? 'Edit Team Member' : 'New Team Member'}
                                    </h2>
                                    <p className="text-sm text-gray-400 font-medium">Set permissions and contact details.</p>
                                </div>
                                <button onClick={closeModal} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                                        <input
                                            {...register('phone_no')}
                                            placeholder="+251..."
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                        {errors.phone_no?.message && <p className="text-red-500 text-xs font-bold ml-1">{String(errors.phone_no.message)}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email (Optional)</label>
                                        <input
                                            {...register('email')}
                                            placeholder="staff@hotel.com"
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                    </div>
                                </div>

                                {!editingUser && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                                        <input
                                            type="password"
                                            {...register('password')}
                                            placeholder="••••••••"
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                        {errors.password?.message && <p className="text-red-500 text-xs font-bold ml-1">{String(errors.password.message)}</p>}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Assigned Role</label>
                                    <select
                                        {...register('role')}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                                    >
                                        <option value="admin">Admin (Full Access)</option>
                                        <option value="staff">Staff (Limited Access)</option>
                                    </select>
                                </div>

                                {editingUser && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                        <input
                                            type="checkbox"
                                            {...register('is_active')}
                                            id="is_active_user"
                                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="is_active_user" className="font-bold text-gray-700">Account Active</label>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black tracking-tight hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>{editingUser ? 'Saving Changes...' : 'Creating Account...'}</span>
                                            </>
                                        ) : (
                                            <span>{editingUser ? 'Save Changes' : 'Create Account'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
