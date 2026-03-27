import { Hotel } from '../services/hotel.service';
import { Calendar, Mail, MapPin, User, ArrowRight } from 'lucide-react';

export function HotelCard({ hotel }: { hotel: Hotel }) {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform text-2xl font-black text-indigo-600 italic">
                    {hotel.logo ? (
                        <img src={hotel.logo} alt={hotel.name} className="w-10 h-10 object-contain" />
                    ) : (
                        hotel.name.charAt(0)
                    )}
                </div>
                <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">
                    ACTIVE
                </span>
            </div>

            <div className="flex-1 space-y-4">
                <div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {hotel.name}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium">@{hotel.hotel_id.substring(0, 8)}</p>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium whitespace-nowrap overflow-hidden">
                        <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{hotel.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium whitespace-nowrap overflow-hidden">
                        <span className="truncate">{hotel.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>Joined {new Date(hotel.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <button className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors flex items-center gap-2">
                    View Menu
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
