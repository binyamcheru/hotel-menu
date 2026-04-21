import { FoodItem } from '../services/food.service';
import { Plus, Info } from 'lucide-react';

export function MenuItemCard({ item, onClick }: { item: FoodItem; onClick?: () => void }) {
    const name = typeof item.name === 'string' ? item.name : item.name.en;
    const description = typeof item.description === 'string' ? item.description : item.description.en;

    return (
        <div
            onClick={onClick}
            className={`py-6 border-b border-gray-100 flex gap-6 active:opacity-70 transition-all cursor-pointer group ${!item.is_available ? 'opacity-40 grayscale' : ''}`}
        >
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-baseline gap-4">
                    <h3 className="font-serif text-xl font-bold text-gray-900 leading-tight group-hover:text-indigo-900 transition-colors">
                        {name}
                    </h3>
                    <div className="flex-1 border-b border-dotted border-gray-200 mb-1.5 hidden sm:block"></div>
                    <span className="font-sans font-bold text-gray-900 whitespace-nowrap">
                        ${item.price.toFixed(2)}
                    </span>
                </div>

                <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed italic">
                    {description}
                </p>

                <div className="flex items-center gap-2 pt-1">
                    {item.is_special && (
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Chef's Selection</span>
                    )}
                    {item.average_rating && item.average_rating > 0 && (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                            <span className="mb-0.5">★</span> {item.average_rating.toFixed(1)}
                        </span>
                    )}
                </div>
            </div>

            {item.image_url && (
                <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100/50">
                    <img src={item.image_url} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
            )}
        </div>
    );
}
