import React from 'react';

export default function HotelLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { hotel: string };
}) {
    const hotel = params.hotel;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Shared Hotel Header could go here */}
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}
