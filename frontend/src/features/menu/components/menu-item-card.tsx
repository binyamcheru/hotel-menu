import { FoodItem } from '../services/food.service';
import { Plus, Info } from 'lucide-react';

export function MenuItemCard({ item, onClick }: { item: FoodItem; onClick?: () => void }) {
    const name = typeof item.name === 'string' ? item.name : item.name.en;
    const description = typeof item.description === 'string' ? item.description : item.description.en;

    return (
        <div
            onClick={onClick}
            className={`bg-white p-4 rounded-[28px] shadow-sm border border-gray-100 flex gap-4 active:scale-[0.98] transition-all cursor-pointer group ${!item.is_available ? 'opacity-60 grayscale' : ''}`}
        >
            <div className="w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-50">
                {item.image_url ? (
                    <img src={item.image_url} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 font-black italic">
                        {name.charAt(0)}
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-gray-900 leading-tight line-clamp-1">{name}</h3>
                        <span className="font-black text-indigo-600 text-sm whitespace-nowrap">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium line-clamp-2 mt-1 leading-snug">
                        {description}
                    </p>
                </div>

                <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-2">
                        {item.is_special && (
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full">Special</span>
                        )}
                        {item.rating && (
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">★ {item.rating}</span>
                        )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:bg-indigo-600 transition-colors">
                        <Plus className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
