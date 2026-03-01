'use client';

import { useParams } from 'next/navigation';

const mockCategories = [
    { id: 1, name: 'Starters', items: [{ id: 101, name: 'Garlic Bread', price: 5.99, description: 'Freshly baked with herbs' }, { id: 102, name: 'Bruschetta', price: 7.50, description: 'Tomato, basil, and balsamic' }] },
    { id: 2, name: 'Main Course', items: [{ id: 201, name: 'Grilled Salmon', price: 18.99, description: 'With roasted vegetables' }, { id: 202, name: 'Pasta Carbonara', price: 14.50, description: 'Classic creamy sauce' }] },
];

export default function PublicMenuPage() {
    const params = useParams();
    const hotel = params?.hotel as string;

    return (
        <div className="p-4 space-y-8 pb-12">
            <header className="text-center py-6">
                <h1 className="text-3xl font-bold capitalize text-gray-900 mb-2">
                    {hotel.replace('-', ' ')}
                </h1>
                <p className="text-gray-500 italic">Welcome to our digital menu</p>
            </header>

            <div className="space-y-10">
                {mockCategories.map((category) => (
                    <section key={category.id} className="space-y-4">
                        <h2 className="text-xl font-bold border-b-2 border-indigo-500 pb-2 inline-block">
                            {category.name}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {category.items.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                    </div>
                                    <div className="text-indigo-600 font-bold">
                                        ${item.price.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-sm text-gray-500">
                    Powered by Hotel Menu SaaS
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium shadow-md">
                    Order Now
                </button>
            </footer>
        </div>
    );
}
