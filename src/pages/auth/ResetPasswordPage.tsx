import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Lock, Eye, EyeOff, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import authBg from '../../assets/auth-bg.png';

const resetPasswordSchema = yup.object({
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
}).required();

type ResetPasswordForm = yup.InferType<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const search = useSearch({ from: '/auth/reset-password' }) as any;
    const email = search.email;
    const otp = search.otp;
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email || !otp) {
            toast.error('Session expired. Please try again.');
            navigate({ to: '/auth/forgot-password' });
        }
    }, [email, otp, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
        resolver: yupResolver(resetPasswordSchema) as any
    });

    const onSubmit = async (data: ResetPasswordForm) => {
        setLoading(true);
        try {
            await authService.resetPassword({
                email,
                otp,
                password: data.password
            });
            toast.success('Password reset successful! Please login.');
            navigate({ to: '/auth/login' });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to reset password. Please try again.';
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
                <form onSubmit={handleSubmit(onSubmit)} className="glass-card shadow-2xl p-10 space-y-8 bg-white/95 dark:bg-slate-900/95 border border-white/20 rounded-2xl">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-healthcare-dark tracking-tight">New Password</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Please enter a strong new password.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5 text-left">
                            <label className="text-sm font-bold text-slate-500 ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    {...register('password')}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-800 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-healthcare-primary/20 transition-all text-sm font-medium ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-healthcare-primary'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-healthcare-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] font-normal text-red-500 ml-1">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-sm font-bold text-slate-500 ml-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    {...register('confirmPassword')}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-800 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-healthcare-primary/20 transition-all text-sm font-medium ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-healthcare-primary'}`}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-[10px] font-normal text-red-500 ml-1">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-healthcare-primary text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Reset Password'}
                    </button>

                    <div className="text-center">
                        <button type="button" onClick={() => navigate({ to: '/auth/verify-otp', search: { email, otp } as any })} className="text-xs font-bold text-healthcare-primary hover:underline flex items-center justify-center mx-auto gap-1">
                            <ChevronLeft size={16} /> Back to OTP
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
