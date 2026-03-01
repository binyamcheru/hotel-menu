'use client';

import { Activity, Clock, CheckCircle2, AlertCircle, User, Hotel as HotelIcon } from 'lucide-react';

const mockActivity = [
    { id: 1, type: 'HOTEL_ADDED', target: 'Grand Plaza Hotel', user: 'Super Admin', time: '2 hours ago', status: 'SUCCESS' },
    { id: 2, type: 'MANAGER_CREATED', target: 'Sarah Smith', user: 'Super Admin', time: '5 hours ago', status: 'SUCCESS' },
    { id: 3, type: 'STATUS_CHANGED', target: 'Mountain Retreat', user: 'Super Admin', time: '1 day ago', status: 'WARNING', detail: 'Deactivated' },
    { id: 4, type: 'MENU_UPDATED', target: 'Ocean Breeze Resort', user: 'Sarah Smith', time: '2 days ago', status: 'SUCCESS' },
    { id: 5, type: 'LOGIN_FAILURE', target: 'Unknown Device', user: 'john@grandplaza.com', time: '3 days ago', status: 'ERROR' },
];

export default function ActivityPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Activity</h1>
                <p className="text-gray-500">Track all major actions and changes across the platform.</p>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden p-8">
                <div className="space-y-8">
                    {mockActivity.map((item, i) => (
                        <div key={item.id} className="relative flex gap-6">
                            {/* Timeline Connector */}
                            {i !== mockActivity.length - 1 && (
                                <div className="absolute left-[27px] top-12 bottom-0 w-0.5 bg-gray-50"></div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 transition-transform hover:scale-110 ${item.status === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                                    item.status === 'WARNING' ? 'bg-amber-50 text-amber-600' :
                                        'bg-red-50 text-red-600'
                                }`}>
                                {item.type === 'HOTEL_ADDED' && <HotelIcon className="w-6 h-6" />}
                                {item.type === 'MANAGER_CREATED' && <User className="w-6 h-6" />}
                                {item.type === 'STATUS_CHANGED' && <Activity className="w-6 h-6" />}
                                {item.type === 'MENU_UPDATED' && <CheckCircle2 className="w-6 h-6" />}
                                {item.type === 'LOGIN_FAILURE' && <AlertCircle className="w-6 h-6" />}
                            </div>

                            <div className="flex-1 pt-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-gray-900 leading-none mb-2">
                                            {item.type.replace('_', ' ')}
                                        </p>
                                        <p className="text-gray-500 font-medium text-sm">
                                            {item.user} performed {item.type.toLowerCase().replace('_', ' ')} on <span className="text-indigo-600 font-bold">{item.target}</span>
                                            {item.detail && <span className="ml-1 text-gray-400">({item.detail})</span>}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">
                                            <Clock className="w-3 h-3" />
                                            {item.time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-12 py-4 bg-gray-50 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-all">
                    Load More Activity
                </button>
            </div>
        </div>
    );
}
