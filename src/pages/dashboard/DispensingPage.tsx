import { useState, useEffect, useRef } from 'react';
import {
    Search,
    ShoppingCart,
    Trash2,
    CheckCircle2,
    User,
    ChevronDown,
} from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Medicine, Batch } from '../../types/pharmacy';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { SkeletonTable } from '../../components/ui/SkeletonTable';
import { CreatePatientModal } from '../../components/patients/CreatePatientModal';
import { MedicineCard } from '../../components/dispensing/MedicineCard';
import { DispensingCart } from '../../components/dispensing/DispensingCart';
import type { CartItem } from '../../types/pharmacy';
import { toast } from 'react-hot-toast';



const WALK_IN_PATIENT = {
    id: null,
    first_name: 'Walk-in',
    last_name: 'Customer',
    phone_number: 'N/A',
    email: null,
    is_walk_in: true,
};

export function DispensingPage() {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [hasMore, setHasMore] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [patientQuery, setPatientQuery] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any | null>(WALK_IN_PATIENT);
    const [showSuccess, setShowSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showCreatePatient, setShowCreatePatient] = useState(false);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
    }, [debouncedSearch]);

    const fetchMedicines = async () => {
        if (page === 1) setLoading(true);

        try {
            const response = await pharmacyService.getMedicines({
                page,
                limit: 20,
                search: debouncedSearch,
                ...(user?.facility_id ? { facility_id: user.facility_id } : {}),
                sort_by: 'expiry_date',
                min_stock: 1,
            });

            setMedicines((prev) => {
                if (page === 1) return response.data;
                const newIds = new Set(response.data.map((m) => m.id));
                return [...prev.filter((m) => !newIds.has(m.id)), ...response.data];
            });

            setHasMore(response.meta.page < response.meta.totalPages);
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            setPage((prev) => prev + 1);
        }
    };

    const [showPatientResults, setShowPatientResults] = useState(false);
    const patientSearchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                patientSearchRef.current &&
                !patientSearchRef.current.contains(event.target as Node)
            ) {
                setShowPatientResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchPatients = async () => {
            try {
                const params = patientQuery ? { search: patientQuery } : { limit: 10 };
                const results = await pharmacyService.getPatients(params);
                const fetchedPatients = results.data || [];

                // Always include Walk-in in results if query is empty or matches
                const showWalkIn = !patientQuery || 'walk-in'.includes(patientQuery.toLowerCase());
                setPatients(showWalkIn ? [WALK_IN_PATIENT, ...fetchedPatients] : fetchedPatients);
            } catch (err) {
                console.warn('Patient API not reachable, mocking results');
                setPatients([]);
            }
        };
        const timer = setTimeout(searchPatients, 300);
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

        let bestBatch: Batch | undefined;
        try {
            const batches = await pharmacyService.getBatches({ medicine_id: med.id });
            const now = new Date();
            const activeBatches = batches
                .filter((b) => (b.current_quantity || 0) > 0 && new Date(b.expiry_date) > now)
                .sort(
                    (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime(),
                );

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
            const existing = prev.find(
                (item) => item.id === med.id && item.selectedBatch?.id === bestBatch?.id,
            );
            if (existing) {
                if (existing.quantity >= bestBatch!.current_quantity) {
                    toast.error(`Batch ${bestBatch!.batch_number} stock limit reached`);
                    return prev;
                }
                return prev.map((item) =>
                    item.id === med.id && item.selectedBatch?.id === bestBatch?.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }
            const safeSellingPrice = Math.max(Number(med.selling_price || 0), Number(bestBatch.unit_cost || 0));
            return [
                ...prev,
                {
                    ...med,
                    selling_price: safeSellingPrice,
                    quantity: 1,
                    selectedBatch: bestBatch,
                },
            ];
        });
        toast.success(`Added ${med.name} (Batch: ${bestBatch.batch_number})`);
    };

    const updateQuantity = (id: number, batchId: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id && item.selectedBatch?.id === batchId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    if (newQty > (item.selectedBatch?.current_quantity || 0)) {
                        toast.error(
                            `Cannot exceed batch stock (${item.selectedBatch?.current_quantity})`,
                        );
                        return item;
                    }
                    return { ...item, quantity: newQty };
                }
                return item;
            }),
        );
    };

    const removeFromCart = (id: number, batchId: number) => {
        setCart((prev) =>
            prev.filter((item) => !(item.id === id && item.selectedBatch?.id === batchId)),
        );
    };

    const subtotal = cart.reduce((acc, item) => acc + item.selling_price * item.quantity, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (!user?.facility_id) {
            toast.error('No facility selected for your account');
            return;
        }
        if (!selectedPatient) {
            toast.error('Please select a patient first');
            return;
        }
        if (cart.length === 0) return;

        setProcessing(true);
        try {
            await pharmacyService.createSale({
                patient_id: selectedPatient.id,
                dispense_type: 'otc',
                vat_rate: 0.18,
                items: cart
                    .filter((i) => !!i.selectedBatch)
                    .map((i) => ({
                        medicine_id: i.id,
                        batch_id: i.selectedBatch!.id,
                        quantity: i.quantity,
                        unit_price: i.selling_price,
                    })),
                payments: [
                    {
                        method: 'cash',
                        amount: total,
                    },
                ],
            });

            setShowSuccess(true);
            toast.success('Dispensing completed successfully');
            setTimeout(() => {
                setShowSuccess(false);
                setCart([]);
                setSearchQuery('');
                setPatientQuery('');
                setSelectedPatient(WALK_IN_PATIENT);
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
        <ProtectedRoute
            allowedRoles={[
                'admin',
                'pharmacist',
                'super_admin',
                'facility_admin',
                'auditor',
                'owner',
            ]}
            requireFacility
        >
            <div className="flex h-full flex-row p-5 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700 overflow-hidden">
                {/* LEFT SIDE - Medicine Search and Cards */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-healthcare-dark dark:text-white tracking-tight">
                            Dispense Medicine
                        </h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                            Point of Sale & Search
                        </p>
                    </div>

                    <div className="relative">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search medicine by name, code, brand, or barcode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-healthcare-primary transition-all text-sm font-bold text-slate-900 dark:text-white shadow-sm"
                        />
                    </div>

                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2"
                    >
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <SkeletonTable
                                        key={i}
                                        rows={2}
                                        columns={1}
                                        headers={null}
                                        animate
                                        className="border-none shadow-none"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                                {medicines.map((med) => (
                                    <MedicineCard
                                        key={med.id}
                                        medicine={med}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE - Cart and Patient Details */}
                <div className="w-full lg:w-[450px] flex flex-col gap-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative min-h-0">
                    {/* Patient Details Section */}
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-healthcare-dark dark:text-white font-black text-sm">
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span>Patient Details</span>
                            </div>
                            {user?.role?.toString()?.toLowerCase() !== 'auditor' && (
                                <button
                                    onClick={() => setShowCreatePatient(true)}
                                    className="p-1 px-2 bg-healthcare-primary/10 hover:bg-healthcare-primary/20 text-healthcare-primary rounded text-xs transition-colors"
                                >
                                    + New
                                </button>
                            )}
                        </div>
                        {user?.role?.toString()?.toLowerCase() !== 'auditor' &&
                            (!selectedPatient || selectedPatient.is_walk_in) && (
                                <div className="relative" ref={patientSearchRef}>
                                    <input
                                        type="text"
                                        placeholder="Search or select patient..."
                                        value={patientQuery}
                                        onFocus={() => setShowPatientResults(true)}
                                        onClick={() => setShowPatientResults(true)}
                                        onChange={(e) => {
                                            setPatientQuery(e.target.value);
                                            setShowPatientResults(true);
                                        }}
                                        className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-healthcare-primary/20 outline-none pr-8 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                                    />
                                    <ChevronDown
                                        size={16}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    />
                                    {showPatientResults && (
                                        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto custom-scrollbar">
                                            {patients.length > 0 ? (
                                                patients.map((p, idx) => (
                                                    <div
                                                        key={p.id || `patient-${idx}`}
                                                        onClick={() => {
                                                            setSelectedPatient(p);
                                                            setPatientQuery('');
                                                            setShowPatientResults(false);
                                                        }}
                                                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-sm border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                                                    >
                                                        <div className="font-bold text-healthcare-dark dark:text-white">
                                                            {p.first_name ||
                                                                p.firstName ||
                                                                p.name ||
                                                                ''}{' '}
                                                            {p.last_name || p.lastName || ''}
                                                            {p.is_walk_in && (
                                                                <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-black uppercase">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-500 flex justify-between mt-0.5">
                                                            <span>
                                                                {p.phone_number ||
                                                                    p.phoneNumber ||
                                                                    p.phone ||
                                                                    '—'}
                                                            </span>
                                                            {p.email && (
                                                                <span className="text-slate-400">
                                                                    {p.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                    No patients found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        {(selectedPatient && !selectedPatient.is_walk_in) ||
                            user?.role?.toString()?.toLowerCase() === 'auditor' ? (
                            <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg border dark:border-slate-700 text-sm">
                                <div>
                                    <div className="font-bold text-healthcare-dark dark:text-white">
                                        {selectedPatient && !selectedPatient.is_walk_in ? (
                                            <>
                                                {selectedPatient.first_name ||
                                                    selectedPatient.firstName ||
                                                    selectedPatient.name ||
                                                    ''}{' '}
                                                {selectedPatient.last_name ||
                                                    selectedPatient.lastName ||
                                                    ''}
                                            </>
                                        ) : (
                                            'No Patient Selected'
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-0.5">
                                        {selectedPatient && !selectedPatient.is_walk_in ? (
                                            <>
                                                <span>
                                                    {selectedPatient.phone_number ||
                                                        selectedPatient.phoneNumber ||
                                                        selectedPatient.phone ||
                                                        '—'}
                                                </span>
                                            </>
                                        ) : (
                                            <span>Patient info is unavailable in browse mode</span>
                                        )}
                                    </div>
                                </div>
                                {selectedPatient &&
                                    !selectedPatient.is_walk_in &&
                                    user?.role?.toString()?.toLowerCase() !== 'auditor' && (
                                        <button
                                            onClick={() => setSelectedPatient(WALK_IN_PATIENT)}
                                            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                            </div>
                        ) : null}
                    </div>

                    {/* Cart Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-healthcare-primary/10 flex items-center justify-center text-healthcare-primary border border-healthcare-primary/20">
                                <ShoppingCart size={18} />
                            </div>
                            <h3 className="font-black text-healthcare-dark dark:text-white">
                                Current Cart
                            </h3>
                        </div>
                        <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 uppercase">
                            {cart.length} Items
                        </span>
                    </div>

                    {/* Cart Items - Scrollable */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <DispensingCart
                            cart={cart}
                            updateQuantity={(id, delta) => {
                                const item = cart.find(i => i.id === id);
                                if (item && item.selectedBatch) {
                                    updateQuantity(id, item.selectedBatch.id, delta);
                                }
                            }}
                            removeFromCart={(id) => {
                                const item = cart.find(i => i.id === id);
                                if (item && item.selectedBatch) {
                                    removeFromCart(id, item.selectedBatch.id);
                                }
                            }}
                            subtotal={subtotal}
                            tax={tax}
                            total={total}
                            onCheckout={handleCheckout}
                            isProcessing={processing}
                        />
                    </div>

                    {/* Success Overlay */}
                    {showSuccess && (
                        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 rounded-2xl">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-xl font-black text-healthcare-dark dark:text-white tracking-tight">
                                Sale Completed!
                            </h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Patient Modal */}
            {showCreatePatient && (
                <CreatePatientModal
                    onClose={() => setShowCreatePatient(false)}
                    onCreate={(patient) => {
                        setSelectedPatient(patient);
                        setShowCreatePatient(false);
                    }}
                />
            )}
        </ProtectedRoute>
    );
}
