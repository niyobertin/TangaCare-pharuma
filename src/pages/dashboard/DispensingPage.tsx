import { useState, useEffect } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    Receipt,
    Pill,
    CheckCircle2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Medicine } from '../../types/pharmacy';
import { useDebounce } from '../../hooks/useDebounce';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CartItem extends Medicine {
    quantity: number;
}

export function DispensingPage() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');
    const [processing, setProcessing] = useState(false);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getMedicines({
                page,
                limit: 12,
                search: debouncedSearch
            });
            setMedicines(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, [debouncedSearch, page]);

    const addToCart = (med: Medicine) => {
        if ((med.stock_quantity || 0) <= 0) {
            toast.error('Out of stock');
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === med.id);
            if (existing) {
                if (existing.quantity >= (med.stock_quantity || 0)) {
                    toast.error('Cannot exceed available stock');
                    return prev;
                }
                return prev.map(item =>
                    item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...med, quantity: 1 }];
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                if (newQty > (item.stock_quantity || 0)) {
                    toast.error('Cannot exceed available stock');
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.selling_price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% VAT
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setProcessing(true);
        try {
            // Since the API handles one item at a time, we process each cart item
            for (const item of cart) {
                await pharmacyService.dispenseMedicine({
                    facility_id: 1, // Default facility
                    medicine_id: item.id,
                    batch_id: 1, // Should be selected by user
                    quantity: item.quantity,
                    dispense_type: 'sale',
                    unit_price: item.selling_price
                });
            }
            setShowSuccess(true);
            toast.success('Dispensing completed successfully');
            setTimeout(() => {
                setShowSuccess(false);
                setCart([]);
                fetchMedicines(); // Refresh stock
            }, 3000);
        } catch (error) {
            console.error('Checkout failed:', error);
            toast.error('Checkout failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Pharmacist', 'Super Admin', 'ADMIN', 'PHARMACIST', 'SUPER_ADMIN']}>
            <div className="flex h-full flex-col lg:flex-row p-5 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700 overflow-hidden">
                {/* Left Side: Search & Selection */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-healthcare-dark tracking-tight">Dispense Medicine</h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Point of Sale & Search</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, generic name or scan barcode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-healthcare-primary transition-all text-sm font-bold shadow-sm"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <TableSkeleton rows={6} columns={1} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {medicines.map(med => (
                                    <button
                                        key={med.id}
                                        onClick={() => addToCart(med)}
                                        disabled={med.stock_quantity === 0}
                                        className={cn(
                                            "group p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-left transition-all hover:border-healthcare-primary/30 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden",
                                            med.stock_quantity === 0 && "opacity-50 cursor-not-allowed grayscale"
                                        )}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 flex items-center justify-center text-healthcare-primary border border-teal-100 dark:border-slate-700 group-hover:bg-healthcare-primary group-hover:text-white transition-colors">
                                                    <Pill size={20} />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase px-2 py-1 rounded-md",
                                                    (med.stock_quantity || 0) <= 20 ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-healthcare-primary"
                                                )}>
                                                    {med.stock_quantity || 0} Left
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-healthcare-dark text-sm leading-tight">{med.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{med.code} • {med.strength}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50 dark:border-slate-800">
                                                <span className="text-sm font-black text-healthcare-dark">RWF {med.selling_price.toLocaleString()}</span>
                                                <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-healthcare-primary transition-colors">
                                                    <Plus size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-[10px] font-black uppercase text-slate-400">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border-2 border-slate-100 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-500 hover:text-healthcare-primary transition-all shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border-2 border-slate-100 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-500 hover:text-healthcare-primary transition-all shadow-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Cart & Checkout */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative min-h-[500px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-healthcare-primary/10 flex items-center justify-center text-healthcare-primary border border-healthcare-primary/20">
                                <ShoppingCart size={18} />
                            </div>
                            <h3 className="font-black text-healthcare-dark">Current Cart</h3>
                        </div>
                        <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 uppercase">
                            {cart.length} Items
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-4">
                        {cart.length > 0 ? (
                            cart.map(item => (
                                <div key={item.id} className="flex gap-4 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 group animate-in slide-in-from-right-2 duration-300">
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h5 className="text-xs font-black text-healthcare-dark">{item.name}</h5>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">RWF {item.selling_price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-healthcare-primary"><Minus size={12} /></button>
                                            <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-healthcare-primary"><Plus size={12} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-200">
                                    <ShoppingCart size={32} />
                                </div>
                                <div className="p-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cart is empty</p>
                                    <p className="text-[10px] text-slate-300 mt-1">Search and select items to start dispensing</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPaymentMethod('Cash')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-xs",
                                    paymentMethod === 'Cash' ? "bg-healthcare-primary border-healthcare-primary text-white shadow-lg shadow-teal-500/20" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-teal-100"
                                )}
                            >
                                <Banknote size={14} /> Cash
                            </button>
                            <button
                                onClick={() => setPaymentMethod('Card')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-xs",
                                    paymentMethod === 'Card' ? "bg-healthcare-primary border-healthcare-primary text-white shadow-lg shadow-teal-500/20" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-teal-100"
                                )}
                            >
                                <CreditCard size={14} /> Card
                            </button>
                        </div>

                        <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                <span>Subtotal</span>
                                <span>RWF {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                <span>VAT Tax (18%)</span>
                                <span>RWF {tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-sm font-black text-healthcare-dark">Total Amount</span>
                                <span className="text-sm font-black text-healthcare-primary">RWF {total.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || processing}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-healthcare-secondary text-white rounded-xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                        >
                            {processing ? "Processing..." : <><Receipt size={18} /> Complete Dispensing</>}
                        </button>
                    </div>

                    {/* Success Overlay */}
                    {showSuccess && (
                        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 rounded-2xl">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-xl font-black text-healthcare-dark tracking-tight">Sale Completed!</h3>
                            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Generating receipt & updating stock</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
