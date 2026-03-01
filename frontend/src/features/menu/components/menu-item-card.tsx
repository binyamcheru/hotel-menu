import { MenuItem } from '../services/menu-api';

export function MenuItemCard({ item }: { item: MenuItem }) {
    return (
        <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between gap-4 ${!item.available ? 'opacity-60' : ''}`}>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {!item.available && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">
                            Sold Out
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                <p className="text-xs text-indigo-500 font-medium mt-1">{item.category}</p>
            </div>
            <div className="text-indigo-600 font-bold">
                ${item.price.toFixed(2)}
            </div>
        </div>
    );
}
