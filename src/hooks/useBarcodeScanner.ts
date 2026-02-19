import { useEffect, useRef, useCallback } from 'react';

/**
 * H-3: Barcode scanner hook.
 *
 * USB HID barcode scanners emit keydown events very rapidly and finish with Enter.
 * This hook accumulates characters typed within 50ms of each other (scanner speed)
 * and fires onScan when Enter is received and the buffer is at least minLength chars.
 *
 * Works with:
 *  - USB HID scanners (most common in Rwanda pharmacies)
 *  - Bluetooth scanners in HID mode
 *
 * Usage:
 *   const ref = useBarcodeScanner((barcode) => handleMedicineLookup(barcode));
 *   <div ref={ref} tabIndex={0}>...</div>  ← or attach to window (pass null)
 */
export const useBarcodeScanner = (
    onScan: (barcode: string) => void,
    options: { minLength?: number; scanTimeoutMs?: number; enabled?: boolean } = {},
): void => {
    const { minLength = 4, scanTimeoutMs = 50, enabled = true } = options;

    const bufferRef = useRef('');
    const lastKeyTimeRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flush = useCallback(() => {
        const barcode = bufferRef.current.trim();
        if (barcode.length >= minLength) {
            onScan(barcode);
        }
        bufferRef.current = '';
    }, [minLength, onScan]);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();
            const timeSinceLast = now - lastKeyTimeRef.current;
            lastKeyTimeRef.current = now;

            // If gap is too large, scanner is not typing — clear buffer
            if (timeSinceLast > 500 && bufferRef.current.length > 0) {
                bufferRef.current = '';
            }

            if (e.key === 'Enter') {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                flush();
                // Prevent form submission if inside a form
                if (bufferRef.current.length === 0) return;
                e.preventDefault();
                return;
            }

            // Only accumulate printable characters
            if (e.key.length === 1) {
                bufferRef.current += e.key;

                // Auto-flush if scan speed is within threshold
                if (timeSinceLast <= scanTimeoutMs) {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(flush, 100);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [enabled, scanTimeoutMs, flush]);
};
