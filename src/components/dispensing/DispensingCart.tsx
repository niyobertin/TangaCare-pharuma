import React from 'react';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import type { CartItem } from '../../types/pharmacy';

interface DispensingCartProps {
    cart: CartItem[];
    updateQuantity: (id: number, delta: number) => void;
    removeFromCart: (id: number) => void;
    subtotal: number;
    tax: number;
    total: number;
    onCheckout: () => void;
    isProcessing: boolean;
}

export const DispensingCart: React.FC<DispensingCartProps> = ({
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    tax,
    total,
    onCheckout,
    isProcessing,
}) => {
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                <ShoppingCart size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3 p-1">
                {cart.map((item) => (
                    <div
                        key={item.id}
                        className="group flex flex-col gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {item.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">
                                    {item.strength} • {item.dosage_form}
                                </p>
                            </div>
                            <p className="text-sm font-black text-healthcare-primary">
                                RWF {(item.selling_price * item.quantity).toLocaleString()}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-1">
                                <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-400 hover:text-healthcare-primary disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus size={12} />
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-400 hover:text-healthcare-primary"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {/* Hidden Batch Info (Internal FEFO Logic applies, but user doesn't need to see specific batch unless necessary) */}
                        {/* We could add a tooltip here if needed */}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-tight">
                    <span>Subtotal</span>
                    <span>RWF {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-tight">
                    <span>Tax ({(tax / subtotal * 100).toFixed(0)}%)</span>
                    <span>RWF {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Total</span>
                    <span>RWF {total.toLocaleString()}</span>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={isProcessing}
                    className="w-full py-3 mt-4 bg-healthcare-primary text-white rounded-xl font-bold shadow-lg shadow-healthcare-primary/20 hover:shadow-healthcare-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                </button>
            </div>
        </div>
    );
};
