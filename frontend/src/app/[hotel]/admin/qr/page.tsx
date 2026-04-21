"use client"

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Scan, FileText, Palette, Type, Share2, RefreshCw, Loader2, Plus, Download } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { getHotelById, getHotelQRCode } from '@/lib/managerApi';
import { fetchSafe } from '@/lib/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function QRCodePage() {
    const { hotel } = useParams() as { hotel: string };
    const [hotelData, setHotelData] = useState<any>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);

    const menuUrl = typeof window !== 'undefined' ? `${window.location.origin}/menu/${hotel}` : `/menu/${hotel}`;

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                // Fetch hotel data normally
                const hotelRes = await fetchSafe<any>(() => getHotelById(hotel));
                if (isMounted) setHotelData(hotelRes.data);

                // Fetch QR code as blob since it returns an image directly
                const apiInstance = (await import('@/lib/api')).default;
                const qrRes = await apiInstance.get(`/menu/hotels/${hotel}/qrcode`, {
                    responseType: 'blob'
                });

                if (isMounted) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setQrCode(reader.result as string);
                    };
                    reader.readAsDataURL(qrRes.data);
                }
            } catch (err) {
                if (isMounted) console.error('Failed to fetch data:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        if (hotel) fetchData();
        return () => { isMounted = false; };
    }, [hotel]);

    const handleDownloadPDF = async () => {
        if (!qrRef.current) return;
        setDownloading(true);
        try {
            // Ensure images are loaded before capture
            const images = qrRef.current.getElementsByTagName('img');
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                })
            );

            const canvas = await html2canvas(qrRef.current, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    // ULTRA-AGGRESSIVE FIX: 
                    // To prevent html2canvas from choking on modern CSS (oklch, lab, etc.)
                    // we remove ALL external and internal stylesheets from the cloned document.
                    // This works because we are using inline styles for everything inside qrRef.
                    const styleTags = clonedDoc.getElementsByTagName('style');
                    const linkTags = clonedDoc.getElementsByTagName('link');

                    Array.from(styleTags).forEach(el => el.remove());
                    Array.from(linkTags).forEach(el => {
                        if (el.rel === 'stylesheet') el.remove();
                    });

                    // Also scrub any remaining inline styles just in case any library injected them
                    clonedDoc.querySelectorAll('[style]').forEach((el: any) => {
                        const style = el.getAttribute('style') || '';
                        if (style.includes('oklch') || style.includes('lab')) {
                            el.setAttribute('style', style
                                .replace(/oklch\([^)]+\)/g, '#4f46e5')
                                .replace(/lab\([^)]+\)/g, '#4f46e5')
                            );
                        }
                    });
                }
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = 160;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`${hotelData?.name || 'hotel'}-menu-qr.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    const hotelName = hotelData?.name || hotel.replace('-', ' ');

    return (
        <ProtectedRoute allowedRoles={['admin']} requireHotelMatch={true}>
            <div className="max-w-6xl mx-auto p-8 space-y-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {hotelName} <span className="text-indigo-600 opacity-20">/</span> QR Code
                        </h1>
                        <p className="text-gray-500 font-medium">Download your digital menu QR code for printing.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Information & Actions Side */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-8 rounded-[38px] border border-gray-100 shadow-sm space-y-8">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight text-center">Print Settings</h3>

                            <div className="space-y-6">
                                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 space-y-2">
                                    <p className="text-amber-900 font-black text-sm">Instructions</p>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Download the high-quality PDF to print your menu QR code. You can place these on table tents or at your host stand.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Type className="w-4 h-4" />
                                        Linked URL
                                    </label>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-xs text-gray-500 break-all">
                                        {menuUrl}
                                    </div>
                                </div>

                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={downloading}
                                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Download className="w-5 h-5" />
                                    )}
                                    Download QR PDF
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[38px] text-white space-y-4">
                            <div className="flex items-center gap-3">
                                <Share2 className="w-5 h-5 text-indigo-400" />
                                <p className="font-black text-sm uppercase tracking-widest text-indigo-100">Quick Share</p>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">Copy the direct link to share your digital menu on social media or your website.</p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(menuUrl);
                                    alert('Link copied to clipboard!');
                                }}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black transition-colors"
                            >
                                Copy Menu Link
                            </button>
                        </div>
                    </div>

                    {/* PDF Preview Side */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Print Preview</h3>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Standard A4 Format</span>
                        </div>

                        <div className="bg-gray-100 p-10 rounded-[56px] border-4 border-dashed border-gray-200 flex justify-center items-center min-h-[600px]">
                            {/* This is what gets captured for the PDF */}
                            <div
                                ref={qrRef}
                                className="p-16 rounded-[48px] flex flex-col items-center gap-12 relative overflow-hidden"
                                style={{
                                    backgroundColor: '#ffffff',
                                    width: '450px',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                                    padding: '64px',
                                    borderRadius: '48px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '48px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    className="absolute top-0 left-0 w-full h-3"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '12px',
                                        backgroundColor: '#4f46e5'
                                    }}
                                ></div>

                                <div className="text-center space-y-4" style={{ textAlign: 'center' }}>
                                    <h3 className="text-4xl font-black capitalize leading-tight" style={{
                                        color: '#111827',
                                        fontSize: '36px',
                                        fontWeight: 900,
                                        textTransform: 'capitalize',
                                        lineHeight: 1.2,
                                        margin: '0 0 16px 0'
                                    }}>
                                        {hotelName}
                                    </h3>
                                    <p className="text-sm font-black uppercase tracking-[0.3em]" style={{
                                        color: '#9ca3af',
                                        fontSize: '14px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.3em',
                                        margin: 0
                                    }}>Digital Menu</p>
                                </div>

                                <div className="w-80 h-80 rounded-[48px] border-[12px] p-10 flex items-center justify-center relative bg-white" style={{
                                    borderColor: '#111827',
                                    width: '320px',
                                    height: '320px',
                                    borderRadius: '48px',
                                    borderStyle: 'solid',
                                    borderWidth: '12px',
                                    padding: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    backgroundColor: '#ffffff'
                                }}>
                                    {qrCode ? (
                                        <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Loader2 className="w-10 h-10 animate-spin text-gray-200" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        pointerEvents: 'none'
                                    }}>
                                        <div
                                            className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center font-black italic text-3xl border-4"
                                            style={{
                                                color: '#4f46e5',
                                                borderColor: '#111827',
                                                backgroundColor: '#ffffff',
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 900,
                                                fontStyle: 'italic',
                                                fontSize: '30px',
                                                borderStyle: 'solid',
                                                borderWidth: '4px'
                                            }}
                                        >
                                            {hotelName.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center space-y-6" style={{ textAlign: 'center' }}>
                                    <div className="space-y-2" style={{ marginBottom: '24px' }}>
                                        <p className="font-black text-2xl" style={{
                                            color: '#111827',
                                            fontWeight: 900,
                                            fontSize: '24px',
                                            margin: '0 0 8px 0'
                                        }}>Scan & Order</p>
                                        <p className="text-xs font-bold uppercase tracking-widest" style={{
                                            color: '#9ca3af',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            margin: 0
                                        }}>Secure Digital Experience</p>
                                    </div>
                                    <div className="flex items-center gap-3 justify-center py-3 px-6 rounded-2xl" style={{
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #f3f4f6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        padding: '12px 24px',
                                        borderRadius: '16px'
                                    }}>
                                        <Scan className="w-5 h-5" style={{ color: '#4f46e5', width: '20px', height: '20px' }} />
                                        <p className="text-xs font-black underline truncate max-w-[200px]" style={{
                                            color: '#4f46e5',
                                            fontSize: '12px',
                                            fontWeight: 900,
                                            textDecoration: 'underline',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '200px',
                                            margin: 0
                                        }}>{menuUrl}</p>
                                    </div>
                                </div>

                                <div className="pt-10 w-full text-center" style={{
                                    borderTop: '1px solid #f9fafb',
                                    paddingTop: '40px',
                                    width: '100%',
                                    textAlign: 'center'
                                }}>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{
                                        color: '#e5e7eb',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.4em',
                                        margin: 0
                                    }}>Powered by Digital Menu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
