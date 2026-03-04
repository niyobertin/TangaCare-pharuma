import { Link } from '@tanstack/react-router';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-40 bg-slate-50 dark:bg-zinc-950">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero-bg.png"
                    alt="Medical Background"
                    className="w-full h-full object-cover opacity-15 dark:opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white dark:from-black/80 dark:via-black/40 dark:to-black"></div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 text-center lg:text-left pt-10"
                    >
                        <div className="inline-flex items-center rounded-full border border-teal-600/20 bg-teal-50/50 dark:bg-teal-900/10 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-teal-700 dark:text-teal-400 mb-10 shadow-sm">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-teal-600 mr-2.5 animate-pulse"></span>
                            Live: Multi-Location Management System
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-8 leading-[1.15]">
                            Smart Inventory for <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">
                                Professional Healthcare
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            TangaCare empowers pharmacies and hospitals with AI-driven tracking,
                            automated reordering, and multi-location control to eliminate waste and
                            maximize efficiency.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <Link to={"/auth/register" as any} search={{} as any}>
                                <Button
                                    size="lg"
                                    className="h-14 px-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg shadow-xl shadow-teal-600/25 transition-all hover:scale-105 active:scale-95 group"
                                >
                                    Start Your Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <a href="#contact">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-10 rounded-full font-bold text-lg border-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm"
                                >
                                    Book a Demo
                                </Button>
                            </a>
                        </div>

                        <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-slate-500 dark:text-zinc-500">
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-5 w-5 text-teal-600 transition-colors" />
                                <span>No Credit Card</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="h-5 w-5 text-teal-600 transition-colors" />
                                <span>Immediate Setup</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="flex-1 relative w-full max-w-xl"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800 p-2 overflow-hidden ring-1 ring-slate-900/5">
                                <div className="rounded-xl overflow-hidden aspect-[16/10] relative shadow-inner bg-slate-100 dark:bg-zinc-800">
                                    <img
                                        src="/dashboard-main.png"
                                        alt="TangaCare Dashboard Preview"
                                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                                    />

                                    {/* Glass Overlay on Bottom */}
                                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Float Card 1: Live Status */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                                className="absolute -top-10 -right-6 lg:-right-10 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-zinc-700 flex items-center gap-3 ring-1 ring-slate-900/5"
                            >
                                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 transition-colors">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        System Healthy
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">
                                        24 Nodes active across regions
                                    </p>
                                </div>
                            </motion.div>

                            {/* Float Card 2: Low Stock */}
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 4,
                                    ease: 'easeInOut',
                                    delay: 1,
                                }}
                                className="absolute -bottom-10 -left-6 lg:-left-10 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-zinc-700 flex items-center gap-4 ring-1 ring-slate-900/5"
                            >
                                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 transition-colors">
                                    <span className="font-bold text-xs uppercase tracking-tight">
                                        Low
                                    </span>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        Stock Alert
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">
                                        Aspirin 75mg: 4 units left
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 cursor-pointer opacity-30 hover:opacity-100 transition-all"
            >
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 select-none">
                    Scroll
                </span>
                <div className="w-1 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden relative">
                    <motion.div
                        animate={{ y: [-32, 32] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="absolute inset-0 bg-teal-600"
                    />
                </div>
            </motion.div>
        </section>
    );
}
