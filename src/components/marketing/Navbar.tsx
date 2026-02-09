import { Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 w-full z-50 transition-all duration-500',
                isScrolled
                    ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 shadow-lg shadow-black/5 py-3'
                    : 'bg-transparent py-6',
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Link to="/" className="z-50 flex items-center gap-3 group">
                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <img
                            src="/logo.png"
                            alt="TangaCare"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white lg:text-2xl">
                        TangaCare
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-2">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-semibold px-4 py-2 rounded-full text-slate-600 hover:text-teal-600 hover:bg-teal-50/50 transition-all dark:text-zinc-400 dark:hover:text-teal-400 dark:hover:bg-teal-900/20"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/auth/login">
                        <Button
                            variant="ghost"
                            className="font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full px-6 transition-all"
                        >
                            Log in
                        </Button>
                    </Link>
                    <Link to="/auth/register">
                        <Button className="shadow-xl shadow-teal-600/20 bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 font-bold h-11 transition-all hover:scale-105 active:scale-95">
                            Get Started
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-slate-200 dark:border-zinc-800 mx-2"></div>
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-500 dark:text-zinc-400 transition-all active:scale-90"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden z-50 p-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 active:scale-90 transition-all"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="absolute top-0 left-0 w-full h-screen bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col pt-32 md:hidden"
                        >
                            <nav className="flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className="text-2xl font-bold text-slate-900 dark:text-white px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </nav>
                            <div className="mt-auto space-y-4 mb-10">
                                <Link
                                    to="/auth/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl text-lg font-bold"
                                    >
                                        Log in
                                    </Button>
                                </Link>
                                <Link
                                    to="/auth/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full"
                                >
                                    <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/20">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
