import { Skeleton } from '../ui/Skeleton';
import { SkeletonTable } from '../ui/SkeletonTable';

export function StatCardSkeleton() {
    return (
        <div className="glass-card p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 border-2 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
            </div>
            <Skeleton className="h-3 w-2/3 mb-1.5" />
            <Skeleton className="h-6 w-1/2" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="glass-card p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center">
            <div className="w-full flex justify-between mb-6">
                <Skeleton className="h-6 w-1/3" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
    );
}

export function TableSkeleton() {
    return <SkeletonTable rows={5} columns={5} />;
}
