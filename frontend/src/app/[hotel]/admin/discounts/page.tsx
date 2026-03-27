'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getDiscountsByHotel, createDiscount, updateDiscount, deleteDiscount, getMenuItemsByHotel, getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { Discount, CreateDiscountRequest, MenuItem } from '@/types';
import { Plus, Tag, Edit, Trash2, Calendar, Loader2, X, Percent, AlertCircle, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { ErrorState } from '@/components/ErrorState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDiscountSchema, updateDiscountSchema } from '@/lib/schemas';

export default function DiscountsPage() {
    const { hotel } = useParams() as { hotel: string };
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [hotelData, setHotelData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; status: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateDiscountRequest>({
        resolver: zodResolver(editingDiscount ? updateDiscountSchema : createDiscountSchema) as any,
    });

    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            setLoading(true);
            try {
                const [discountsRes, menuItemsRes, hotelRes] = await Promise.all([
                    fetchSafe<Discount[]>(() => getDiscountsByHotel(hotel)),
                    fetchSafe<MenuItem[]>(() => getMenuItemsByHotel(hotel)),
                    fetchSafe(() => getHotelById(hotel))
                ]);

                if (discountsRes.error && !discountsRes.data) {
                    setError({ message: discountsRes.error, status: discountsRes.status });
                } else {
                    setDiscounts(discountsRes.data || []);
                    setMenuItems(menuItemsRes.data || []);
                    setHotelData(hotelRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch discounts or menu items:', err);
                setError({ message: "Unable to load active promotions.", status: 500 });
            } finally {
                setLoading(false);
            }
        };
        if (hotel) fetchData();
    }, [hotel, retryCount]);

    const handleRetry = () => setRetryCount(prev => prev + 1);

    const onSubmit = async (data: any) => {
        try {
            if (editingDiscount) {
                await updateDiscount(editingDiscount.discount_id, data);
            } else {
                await createDiscount({ ...data, hotel_id: hotel });
            }
            const response = await getDiscountsByHotel(hotel);
            setDiscounts(response.data.data);
            closeModal();
        } catch (error) {
            console.error('Failed to save discount:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this discount?')) {
            try {
                await deleteDiscount(id);
                setDiscounts(discounts.filter(d => d.discount_id !== id));
            } catch (error) {
                console.error('Failed to delete discount:', error);
            }
        }
    };

    const openModal = (discount?: Discount) => {
        if (discount) {
            setEditingDiscount(discount);
            reset({
                menu_item_id: discount.menu_item_id,
                percentage: discount.percentage,
                start_date: discount.start_date.split('T')[0],
                end_date: discount.end_date.split('T')[0],
                is_active: discount.is_active,
            });
        } else {
            setEditingDiscount(null);
            reset({
                hotel_id: hotel,
                menu_item_id: '',
                percentage: 10,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                is_active: true,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDiscount(null);
        reset();
    };

    const getMenuItemName = (id: string) => {
        return menuItems.find(m => m.menu_item_id === id)?.name_en || 'Unknown Item';
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
                            {hotelData?.name || 'Menu'} <span className="text-indigo-600 opacity-20">/</span> Discounts
                        </h1>
                        <p className="text-gray-500 font-medium">Boost your sales with limited-time promotions.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Create Discount
                    </button>
                </div>

                {error ? (
                    <div className="flex justify-center items-center py-20">
                        <ErrorState error={error.message} status={error.status} onRetry={handleRetry} />
                    </div>
                ) : discounts.length === 0 ? (
                    <div className="py-24 bg-white rounded-[48px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center px-10 space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-28 h-28 bg-indigo-50 rounded-[36px] flex items-center justify-center text-indigo-600 shadow-sm transition-transform hover:scale-110 duration-500">
                            <Tag className="w-14 h-14" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Boost Your Sales</h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">Run a promotion to attract more customers to specific menu items.</p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-indigo-600 text-white px-12 py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100 text-lg"
                        >
                            Create First Offer
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {discounts.map((discount) => (
                            <div key={discount.discount_id} className="bg-white rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-16 h-16 ${discount.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-300'} rounded-[24px] flex items-center justify-center transition-colors group-hover:bg-indigo-600 group-hover:text-white`}>
                                        <Percent className="w-8 h-8" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => openModal(discount)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-50 transition-all">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(discount.discount_id)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-50 transition-all">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 line-clamp-1">{getMenuItemName(discount.menu_item_id)}</h3>
                                        <p className="text-4xl font-black text-indigo-600 mt-1">{discount.percentage}% OFF</p>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            Valid Thru
                                        </div>
                                        <p className="text-gray-600 font-bold">
                                            {new Date(discount.start_date).toLocaleDateString()} - {new Date(discount.end_date).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="pt-2">
                                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${discount.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {discount.is_active ? 'Active' : 'Expired'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {editingDiscount ? 'Edit Discount' : 'New Discount'}
                                    </h2>
                                    <p className="text-sm text-gray-400 font-medium">Configure your offer details.</p>
                                </div>
                                <button onClick={closeModal} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Menu Item</label>
                                    <select
                                        {...register('menu_item_id')}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                                    >
                                        <option value="">Select an item...</option>
                                        {menuItems.map(item => (
                                            <option key={item.menu_item_id} value={item.menu_item_id}>
                                                {item.name_en}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.menu_item_id && <p className="text-red-500 text-xs font-bold ml-1">{errors.menu_item_id.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Discount Percentage (%)</label>
                                    <input
                                        type="number"
                                        {...register('percentage', { valueAsNumber: true })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                    {errors.percentage && <p className="text-red-500 text-xs font-bold ml-1">{errors.percentage.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Start Date</label>
                                        <input
                                            type="date"
                                            {...register('start_date')}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">End Date</label>
                                        <input
                                            type="date"
                                            {...register('end_date')}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                    <input
                                        type="checkbox"
                                        {...register('is_active')}
                                        id="is_active"
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_active" className="font-bold text-gray-700">Set as Active</label>
                                </div>

                                <div className="pt-4">
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black tracking-tight hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>{editingDiscount ? 'Saving Changes...' : 'Creating Offer...'}</span>
                                            </>
                                        ) : (
                                            <span>{editingDiscount ? 'Save Changes' : 'Create Offer'}</span>
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
