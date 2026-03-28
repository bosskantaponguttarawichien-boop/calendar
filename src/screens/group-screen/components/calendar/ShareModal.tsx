import React from "react";
import { Share2, X, Loader2, ArrowRight, Check, Copy } from "lucide-react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: () => void;
    onCopyLink: () => void;
    isSharing: boolean;
    isLinkCopied: boolean;
    inviteError: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    onInvite,
    onCopyLink,
    isSharing,
    isLinkCopied,
    inviteError
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
                onClick={onClose} 
            />
            
            <div className="relative w-full max-w-[280px] bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-2xl border border-white/20 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={14} />
                </button>

                <div className="flex flex-col items-center space-y-4 pt-1">
                    {/* Share Icon */}
                    <div className="relative px-2">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
                        <div className="relative w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Share2 size={24} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="w-full space-y-2">
                        <button
                            onClick={onInvite}
                            disabled={isSharing}
                            className="w-full bg-[#00B900] hover:bg-[#00A000] text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            {isSharing ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    ชวนเพื่อนผ่าน LINE
                                    <ArrowRight size={18} strokeWidth={3} />
                                </>
                            )}
                        </button>

                        <button
                            onClick={onCopyLink}
                            className={`w-full py-3 rounded-2xl font-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[12px] border-2 ${
                                isLinkCopied
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 shadow-none"
                                : "bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 shadow-sm"
                            }`}
                        >
                            {isLinkCopied ? (
                                <>
                                    <Check size={16} strokeWidth={3} />
                                    คัดลอกลิงก์แล้ว!
                                </>
                            ) : (
                                <>
                                    <Copy size={16} strokeWidth={2.5} />
                                    คัดลอกลิงก์กิจกรรม
                                </>
                            )}
                        </button>
                    </div>

                    {inviteError && (
                        <p className="text-[9px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-500/10 py-1.5 px-4 rounded-full text-center">
                            {inviteError}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
