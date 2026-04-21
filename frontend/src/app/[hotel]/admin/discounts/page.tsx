'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getDiscountsByHotel, createDiscount, updateDiscount, deleteDiscount, getMenuItemsByHotel, getHotelById } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import { Discount, CreateDiscountRequest, MenuItem } from '@/types';
import { Plus, Tag, Edit, Trash2, Calendar, Loader2, X, Percent, AlertCircle, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
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
    const [modalError, setModalError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);
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
        setModalError(null);
        try {
            const formattedData = {
                ...data,
                start_date: new Date(data.start_date).toISOString(),
                end_date: new Date(`${data.end_date}T23:59:59Z`).toISOString(),
                hotel_id: hotel
            };

            if (editingDiscount) {
                await updateDiscount(editingDiscount.discount_id, formattedData);
            } else {
                await createDiscount(formattedData);
            }
            const response = await getDiscountsByHotel(hotel);
            setDiscounts(response.data.data);
            closeModal();
        } catch (err: any) {
            console.error('Failed to save discount:', err);
            setModalError(err.response?.data?.message || err.message || 'Failed to save promotion');
        }
    };

    const handleDelete = async () => {
        if (!discountToDelete) return;
        try {
            await deleteDiscount(discountToDelete.discount_id);
            setDiscounts(discounts.filter(d => d.discount_id !== discountToDelete.discount_id));
            setDiscountToDelete(null);
        } catch (err) {
            console.error('Failed to delete discount:', err);
        }
    };

    const openModal = (discount?: Discount) => {
        setModalError(null);
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
        setModalError(null);
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
            <div className="space-y-12 max-w-7xl mx-auto p-4 sm:p-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-indigo-600 mb-2">
                            <Tag className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Promotional Hub</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
                            Active <span className="text-indigo-600">Discounts</span>
                        </h1>
                        <p className="text-lg text-gray-400 font-bold max-w-md leading-snug">Boost sales by offering time-limited rewards on your finest creations.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="group flex items-center gap-4 bg-gray-900 text-white px-10 py-5 rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-gray-200 active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-all duration-500" />
                        New Promotion
                    </button>
                </div>

                {error ? (
                    <div className="py-20">
                        <ErrorState error={error.message} status={error.status} onRetry={handleRetry} />
                    </div>
                ) : discounts.length === 0 ? (
                    <div className="py-32 bg-white rounded-[72px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="w-32 h-32 bg-indigo-50 rounded-[48px] flex items-center justify-center text-indigo-600 shadow-inner group transition-transform hover:scale-110 duration-500">
                            <Percent className="w-16 h-16 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-gray-900 tracking-tight">Expand Your Reach</h3>
                            <p className="text-xl text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">No active discounts found. Create a limited-time offer to attract more guests.</p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-indigo-600 text-white px-12 py-6 rounded-[32px] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest text-xs"
                        >
                            Create First Offer
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {discounts.map((discount) => (
                            <div key={discount.discount_id} className="bg-white rounded-[56px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col p-10 relative">
                                {/* Discount Badge */}
                                <div className="absolute top-10 right-10">
                                    <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex flex-col items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                        <span className="text-2xl font-black leading-none">{discount.percentage}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">% OFF</span>
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <div className={`w-14 h-14 ${discount.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'} rounded-3xl flex items-center justify-center mb-6`}>
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 line-clamp-1 pr-16">{getMenuItemName(discount.menu_item_id)}</h3>
                                    <div className="flex items-center gap-2">
                                        {discount.is_active ? (
                                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-500 tracking-widest bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                                                <CheckCircle className="w-3 h-3" /> Live Now
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-400 tracking-widest bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                                <Clock className="w-3 h-3" /> Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6 pt-10 border-t border-gray-50 mt-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> Start
                                            </p>
                                            <p className="font-bold text-gray-800">{new Date(discount.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> Until
                                            </p>
                                            <p className="font-bold text-gray-800">{new Date(discount.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
                                        <button onClick={() => openModal(discount)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-[28px] font-black text-[10px] tracking-widest uppercase transition-all">
                                            <Edit className="w-4 h-4" /> Edit logic
                                        </button>
                                        <button onClick={() => setDiscountToDelete(discount)} className="p-4 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-[28px] transition-all">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                            <div className="px-12 pt-12 pb-8 flex justify-between items-center bg-gray-50/30">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                                        {editingDiscount ? 'Configure Promotion' : 'New Strategic Offer'}
                                    </h2>
                                    <p className="text-gray-400 font-bold mt-1">Define your discount logic and timelines.</p>
                                </div>
                                <button onClick={closeModal} className="p-4 hover:bg-white rounded-[24px] text-gray-400 transition-all shadow-sm border border-transparent hover:border-gray-100">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {modalError && (
                                <div className="mx-12 mt-6 p-5 bg-red-50 border border-red-100 rounded-[28px] flex items-center gap-4 text-red-600 animate-in slide-in-from-top-4 duration-500">
                                    <AlertTriangle className="w-6 h-6 shrink-0" />
                                    <p className="text-sm font-bold leading-tight">{modalError}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="p-12 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Menu Creation Selection</label>
                                    <select
                                        {...register('menu_item_id')}
                                        className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-[32px] font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50/50 transition-all appearance-none"
                                    >
                                        <option value="">Select an artisan dish...</option>
                                        {menuItems.map(item => (
                                            <option key={item.menu_item_id} value={item.menu_item_id}>
                                                {item.name_en} — ${item.price.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.menu_item_id && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-4 mt-2">Required selection</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Percentage Off (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                {...register('percentage', { valueAsNumber: true })}
                                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-[32px] font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                                                placeholder="15"
                                            />
                                            <Percent className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        </div>
                                        {errors.percentage && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-4 mt-2">Invalid percentage</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Current Status</label>
                                        <div className="flex items-center h-[64px] gap-4 px-8 bg-gray-50 border-2 border-transparent rounded-[32px] transition-all">
                                            <input
                                                type="checkbox"
                                                {...register('is_active')}
                                                id="is_active"
                                                className="w-6 h-6 rounded-xl border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                            />
                                            <label htmlFor="is_active" className="font-bold text-gray-700 cursor-pointer">Activate Offer</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Start Timeline</label>
                                        <input
                                            type="date"
                                            {...register('start_date')}
                                            className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-[32px] font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Expiry Timeline</label>
                                        <input
                                            type="date"
                                            {...register('end_date')}
                                            className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-[32px] font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-4"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Deploying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>{editingDiscount ? 'Commit Changes' : 'Launch Promotion'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Deletion Modal */}
                {discountToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-lg rounded-[56px] shadow-2xl p-12 text-center animate-in zoom-in-95 duration-300">
                            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[42px] flex items-center justify-center mx-auto mb-8">
                                <Trash2 className="w-12 h-12" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-4 text-balance">Revoke Promotion?</h3>
                            <p className="text-gray-400 font-bold mb-10 leading-relaxed text-balance">
                                Are you sure you want to end <span className="text-gray-900 font-black">"{getMenuItemName(discountToDelete.menu_item_id)}"</span> discount? This action cannot be undone.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={() => setDiscountToDelete(null)} className="flex-1 py-5 rounded-[28px] font-black text-[10px] tracking-widest uppercase bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all">
                                    Keep active
                                </button>
                                <button onClick={handleDelete} className="flex-1 py-5 rounded-[28px] font-black text-[10px] tracking-widest uppercase bg-red-500 text-white hover:bg-red-600 transition-all shadow-xl shadow-red-100">
                                    Revoke now
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
