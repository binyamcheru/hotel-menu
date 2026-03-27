import React from 'react';

export default async function HotelLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ hotel: string }>;
}) {
    const { hotel } = await params;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Shared Hotel Header could go here */}
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}
