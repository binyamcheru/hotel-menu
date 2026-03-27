import React from 'react';
import { AlertCircle, Lock, RefreshCw, ServerCrash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    error: string | null;
    status?: number;
    onRetry?: () => void;
    title?: string;
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, status, onRetry, title, className }) => {
    const is403 = status === 403;

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-12 bg-white rounded-[48px] border border-gray-100 shadow-sm space-y-6 text-center animate-in fade-in zoom-in duration-300",
            className
        )}>
            <div className={cn(
                "p-6 rounded-[32px] transition-transform hover:scale-110 duration-500",
                is403 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            )}>
                {is403 ? <Lock className="size-12" /> : <ServerCrash className="size-12" />}
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {title || (is403 ? 'Permission Denied' : 'Sync Failure')}
                </h3>
                <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
                    {is403
                        ? "You don't have the required permissions to view this section. Please contact the hotel owner if you believe this is an error."
                        : error || "We're having trouble connecting to the server. Your data is safe, but we can't display it right now."}
                </p>
                {status && (
                    <div className="pt-2">
                        <span className="px-3 py-1 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] rounded-full border border-gray-100">
                            Error Code: {status}
                        </span>
                    </div>
                )}
            </div>
            {!is403 && onRetry && (
                <button
                    onClick={onRetry}
                    className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-[28px] font-black hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                >
                    <RefreshCw className="size-5 transition-transform group-hover:rotate-180 duration-700" />
                    Try Again
                </button>
            )}
        </div>
    );
};
