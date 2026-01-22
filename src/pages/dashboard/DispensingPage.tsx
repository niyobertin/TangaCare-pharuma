import { useState, useEffect } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Receipt,
    Pill,
    CheckCircle2,
    User
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Medicine, Batch } from '../../types/pharmacy';
import { useAuth } from '../../context/AuthContext';
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
    selectedBatch?: Batch;
}

export function DispensingPage() {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [page, _setPage] = useState(1);


    // Cart & Sale State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [patientQuery, setPatientQuery] = useState('');
    // const [debouncedPatientSearch] = useDebounce(patientQuery, 500);
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    // const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');
    const [processing, setProcessing] = useState(false);

    // Fetch Medicines
    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const response = await pharmacyService.getMedicines({
                page,
                limit: 12,
                search: debouncedSearch,
                ...(user?.facility_id ? { facility_id: user.facility_id } : {}),
            });
            setMedicines(response.data);

        } catch (error) {
            console.error('Failed to fetch medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    // Patient Search (Mockable)
    useEffect(() => {
        if (!patientQuery) {
            setPatients([]);
            return;
        }
        const searchPatients = async () => {
            try {
                // Real API call
                const results = await pharmacyService.getPatients(patientQuery);
                setPatients(results || []);
            } catch (err) {
                // Mock behavior if API fails or doesn't exist
                console.warn('Patient API not reachable, mocking results');
                setPatients([
                    { id: 1, name: 'John Doe', phone: '0780000001' },
                    { id: 2, name: 'Jane Smith', phone: '0780000002' }
                ].filter(p => p.name.toLowerCase().includes(patientQuery.toLowerCase())));
            }
        };
        const timer = setTimeout(searchPatients, 500);
        return () => clearTimeout(timer);
    }, [patientQuery]);

    useEffect(() => {
        fetchMedicines();
    }, [debouncedSearch, page]);

    const addToCart = async (med: Medicine) => {
        if ((med.stock_quantity || 0) <= 0) {
            toast.error('Out of stock');
            return;
        }

        // FEFO Logic: Fetch batches for this medicine
        let bestBatch: Batch | undefined;
        try {
            const batches = await pharmacyService.getBatches({ medicine_id: med.id });
            // Sort by expiry date ASC, filter out expired/depleted
            const activeBatches = batches.filter(b => b.current_quantity > 0 && b.status === 'active')
                .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

            if (activeBatches.length > 0) {
                bestBatch = activeBatches[0];
            }
        } catch (err) {
            console.error('Failed to fetch batches', err);
        }

        if (!bestBatch) {
            toast.error('No active batches found for this medicine');
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.id === med.id && item.selectedBatch?.id === bestBatch?.id);
            if (existing) {
                if (existing.quantity >= bestBatch!.current_quantity) {
                    toast.error(`Batch ${bestBatch!.batch_number} stock limit reached`);
                    return prev;
                }
                return prev.map((item) =>
                    item.id === med.id && item.selectedBatch?.id === bestBatch?.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...med, quantity: 1, selectedBatch: bestBatch }];
        });
        toast.success(`Added ${med.name} (Batch: ${bestBatch.batch_number})`);
    };

    const updateQuantity = (id: number, batchId: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id && item.selectedBatch?.id === batchId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    if (newQty > (item.selectedBatch?.current_quantity || 0)) {
                        toast.error(`Cannot exceed batch stock (${item.selectedBatch?.current_quantity})`);
                        return item;
                    }
                    return { ...item, quantity: newQty };
                }
                return item;
            }),
        );
    };

    const removeFromCart = (id: number, batchId: number) => {
        setCart((prev) => prev.filter((item) => !(item.id === id && item.selectedBatch?.id === batchId)));
    };

    const subtotal = cart.reduce((acc, item) => acc + item.selling_price * item.quantity, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (!selectedPatient) {
            toast.error('Please select a patient first');
            return;
        }
        if (cart.length === 0) return;

        setProcessing(true);
        try {
            for (const item of cart) {
                if (!item.selectedBatch) continue;
                await pharmacyService.dispenseMedicine({
                    facility_id: 1,
                    medicine_id: item.id,
                    batch_id: item.selectedBatch.id,
                    quantity: item.quantity,
                    dispense_type: 'sale',
                    unit_price: item.selling_price,
                    patient_id: selectedPatient.id
                });
            }
            setShowSuccess(true);
            toast.success('Dispensing completed successfully');
            setTimeout(() => {
                setShowSuccess(false);
                setCart([]);
                setSearchQuery('');
                setPatientQuery('');
                setSelectedPatient(null);
                fetchMedicines();
            }, 3000);
        } catch (error) {
            console.error('Checkout failed:', error);
            toast.error('Checkout failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'super_admin', 'store_manager', 'facility_admin']}>
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
                            placeholder="Search medicine by name or code..."
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {medicines.map((med) => (
                                    <button
                                        key={med.id}
                                        onClick={() => addToCart(med)}
                                        disabled={(med.stock_quantity || 0) === 0}
                                        className={cn(
                                            'group p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-left transition-all hover:border-healthcare-primary/30 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden',
                                            (med.stock_quantity || 0) === 0 && 'opacity-50 cursor-not-allowed grayscale',
                                        )}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 flex items-center justify-center text-healthcare-primary border border-teal-100 dark:border-slate-700 group-hover:bg-healthcare-primary group-hover:text-white transition-colors">
                                                    <Pill size={20} />
                                                </div>
                                                <span className={cn(
                                                    'text-[10px] font-black uppercase px-2 py-1 rounded-md',
                                                    (med.stock_quantity || 0) <= 20 ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-healthcare-primary',
                                                )}>
                                                    {med.stock_quantity || 0} Left
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-healthcare-dark text-sm leading-tight">{med.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">
                                                    {med.code} • {med.strength}
                                                </p>
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
                    {/* Pagination omitted for brevity matching previous style */}
                </div>

                {/* Right Side: Cart & Checkout */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative min-h-[500px]">
                    {/* Patient Selector */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 text-healthcare-dark font-black text-sm">
                            <User size={16} />
                            <span>Patient Details</span>
                        </div>
                        {!selectedPatient ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search patient..."
                                    value={patientQuery}
                                    onChange={(e) => setPatientQuery(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-healthcare-primary/20 outline-none"
                                />
                                {patients.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-10 max-h-40 overflow-y-auto">
                                        {patients.map(p => (
                                            <div key={p.id} onClick={() => { setSelectedPatient(p); setPatientQuery(''); setPatients([]); }} className="p-2 hover:bg-slate-50 cursor-pointer text-sm">
                                                <div className="font-bold">{p.name}</div>
                                                <div className="text-xs text-slate-500">{p.phone}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border text-sm">
                                <div>
                                    <div className="font-bold">{selectedPatient.name}</div>
                                    <div className="text-xs text-slate-500">{selectedPatient.phone}</div>
                                </div>
                                <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                        )}
                    </div>

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
                            cart.map((item) => (
                                <div key={`${item.id}-${item.selectedBatch?.id}`} className="flex gap-4 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 group animate-in slide-in-from-right-2 duration-300">
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h5 className="text-xs font-black text-healthcare-dark">{item.name}</h5>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700 border border-amber-100">
                                                BATCH: {item.selectedBatch?.batch_number}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 border border-blue-100">
                                                EXP: {item.selectedBatch?.expiry_date ? new Date(item.selectedBatch.expiry_date).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                            <button onClick={() => updateQuantity(item.id, item.selectedBatch!.id, -1)} className="p-1 px-2 hover:bg-slate-50 transition-colors text-slate-400 hover:text-healthcare-primary"><Minus size={12} /></button>
                                            <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.selectedBatch!.id, 1)} className="p-1 px-2 hover:bg-slate-50 transition-colors text-slate-400 hover:text-healthcare-primary"><Plus size={12} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id, item.selectedBatch!.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        {/* Summary & Checkout Button */}
                        <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-[11px] font-bold text-slate-500"><span>Subtotal</span><span>RWF {subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-500"><span>VAT (18%)</span><span>RWF {tax.toLocaleString()}</span></div>
                            <div className="flex justify-between py-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-sm font-black text-healthcare-dark">Total</span>
                                <span className="text-sm font-black text-healthcare-primary">RWF {total.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || processing || !selectedPatient}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-healthcare-secondary text-white rounded-xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                        >
                            {processing ? 'Processing...' : <><Receipt size={18} /> Complete Sale</>}
                        </button>
                    </div>

                    {showSuccess && (
                        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 rounded-2xl">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-xl font-black text-healthcare-dark tracking-tight">Sale Completed!</h3>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
