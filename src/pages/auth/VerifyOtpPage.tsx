import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ShieldCheck, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import authBg from '../../assets/auth-bg.png';

export function VerifyOtpPage() {
    const navigate = useNavigate();
    const search = useSearch({ from: '/auth/verify-otp' }) as any;
    const email = search.email;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            toast.error('Session expired. Please try again.');
            navigate({ to: '/auth/forgot-password' });
        }
    }, [email, navigate]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length < 6) {
            toast.error('Please enter the full 6-digit code.');
            return;
        }

        setLoading(true);
        try {
            await authService.verifyOtp(email, otpValue);
            toast.success('OTP verified successfully!');
            navigate({ to: '/auth/reset-password', search: { email, otp: otpValue } as any });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Invalid OTP. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-cover bg-center relative"
            style={{ backgroundImage: `url(${authBg})` }}
        >
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"></div>
            <div className="max-w-md w-full animate-in zoom-in duration-500 relative z-10">
                <form onSubmit={handleSubmit} className="glass-card shadow-2xl p-10 space-y-8 bg-white/95 dark:bg-slate-900/95 border border-white/20 rounded-2xl">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-teal-50 text-healthcare-primary rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-healthcare-dark tracking-tight">Verify OTP</h2>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest px-4">
                            We've sent a 6-digit code to <br />
                            <span className="text-healthcare-primary lowercase font-black text-xs">{email}</span>
                        </p>
                    </div>

                    <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-10 h-14 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-center text-xl font-black text-healthcare-dark focus:border-healthcare-primary focus:outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-healthcare-primary text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Verify & Proceed'}
                    </button>

                    <div className="text-center">
                        <button type="button" onClick={() => navigate({ to: '/auth/forgot-password' })} className="text-xs font-bold text-healthcare-primary hover:underline flex items-center justify-center mx-auto gap-1">
                            <ChevronLeft size={16} /> Back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
