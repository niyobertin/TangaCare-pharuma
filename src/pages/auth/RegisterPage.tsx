import { useState } from 'react';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import authBg from '../../assets/auth-bg.png';

const registerSchema = yup
    .object({
        first_name: yup.string().required('First name is required'),
        last_name: yup.string().required('Last name is required'),
        email: yup
            .string()
            .matches(
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Please enter a valid email address',
            )
            .required('Email address is required'),
        phone_number: yup
            .string()
            .matches(/^(\+2507[8923]\d{7})$/, 'Phone must be in format +2507XXXXXXXX')
            .optional()
            .nullable()
            .transform((value) => (value === '' ? null : value)),
        password: yup
            .string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
    })
    .required();

type RegisterForm = yup.InferType<typeof registerSchema>;

export function RegisterPage() {
    const { register: registerUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: yupResolver(registerSchema) as any,
    });

    if (isAuthenticated) return <Navigate to="/app" />;

    const onSubmit = async (data: RegisterForm) => {
        setLoading(true);
        try {
            const { phone_number, ...rest } = data;
            await registerUser({
                ...rest,
                phone_number: phone_number || undefined,
            });
            toast.success('Registration successful! Please login.');
            navigate({ to: '/auth/login' });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
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
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="glass-card shadow-2xl p-10 space-y-6 bg-white/95 dark:bg-slate-900/95 border border-white/20 overflow-y-auto max-h-[90vh] rounded-2xl"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-healthcare-dark tracking-tight">
                            Join TangaCare
                        </h2>
                        <p className="text-slate-400 font-bold text-xs">
                            Create your pharmacy staff account
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-500 ml-1">
                                First name
                            </label>
                            <input
                                {...register('first_name')}
                                className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl text-sm font-medium focus:outline-none transition-all ${errors.first_name ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-healthcare-primary'}`}
                            />
                            {errors.first_name && (
                                <p className="text-[9px] font-normal text-red-500">
                                    {errors.first_name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-500 ml-1">
                                Last name
                            </label>
                            <input
                                {...register('last_name')}
                                className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl text-sm font-medium focus:outline-none transition-all ${errors.last_name ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-healthcare-primary'}`}
                            />
                            {errors.last_name && (
                                <p className="text-[9px] font-normal text-red-500">
                                    {errors.last_name.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-500 ml-1">
                                Email address
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl text-sm font-medium focus:outline-none transition-all ${errors.email ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-healthcare-primary'}`}
                            />
                            {errors.email && (
                                <p className="text-[9px] font-normal text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-bold text-slate-500">
                                    Phone number
                                </label>
                                <span className="text-[10px] font-bold text-slate-400">
                                    (Optional)
                                </span>
                            </div>
                            <input
                                {...register('phone_number')}
                                placeholder="+250 788 ..."
                                className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-healthcare-primary transition-all`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-500 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border-2 rounded-2xl text-sm font-medium focus:outline-none transition-all ${errors.password ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-healthcare-primary'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-healthcare-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[9px] font-normal text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-healthcare-primary text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Create account'
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate({ to: '/auth/login' })}
                            className="text-xs font-bold text-healthcare-primary hover:underline flex items-center justify-center mx-auto gap-1"
                        >
                            <ChevronLeft size={16} /> Back to login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
