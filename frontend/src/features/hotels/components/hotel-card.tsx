import { Hotel } from '../services/hotel-api';

export function HotelCard({ hotel }: { hotel: Hotel }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{hotel.name}</h3>
                    <p className="text-sm text-gray-500">{hotel.slug}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${hotel.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                    {hotel.status}
                </span>
            </div>

            <div className="text-sm space-y-1 text-gray-600">
                <p><span className="font-medium">Email:</span> {hotel.contactEmail}</p>
                <p><span className="font-medium">Address:</span> {hotel.address}</p>
            </div>

            <div className="flex gap-2 mt-2">
                <button className="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors">
                    Manage Menu
                </button>
                <button className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    Edit Hotel
                </button>
            </div>
        </div>
    );
}
