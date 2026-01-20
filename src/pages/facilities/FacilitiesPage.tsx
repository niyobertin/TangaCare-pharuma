import { useState, useEffect } from 'react';
import { Grid, List, Plus } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacy.service';
import type { Facility } from '../../types/pharmacy';
import toast from 'react-hot-toast';
import { CreateFacilityModal } from '../../components/facility/CreateFacilityModal';

export function FacilitiesPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadFacilities = async () => {
        setIsLoading(true);
        try {
            const response = await pharmacyService.getFacilities();
            setFacilities(response.data);
        } catch (error) {
            console.error('Failed to load facilities:', error);
            toast.error('Failed to load facilities');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFacilities();
    }, []);

    const handleCreateSuccess = () => {
        loadFacilities();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-healthcare-primary/20 border-t-healthcare-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 bg-slate-50/50 dark:bg-slate-900/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-healthcare-dark">My Facilities</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your pharmacies and clinics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                                    ? 'bg-healthcare-primary text-white'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table'
                                    ? 'bg-healthcare-primary text-white'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-healthcare-primary text-white rounded-lg font-bold text-sm hover:bg-teal-700 transition-all shadow-lg"
                    >
                        <Plus size={18} />
                        <span>Add Facility</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            {facilities.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-slate-500 mb-4">No facilities found</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-healthcare-primary text-white rounded-lg font-bold hover:bg-teal-700 transition-all"
                        >
                            Create Your First Facility
                        </button>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {facilities.map((facility) => (
                        <div
                            key={facility.id}
                            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-healthcare-primary/10 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">🏥</span>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${facility.status === 'Active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                >
                                    {facility.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-healthcare-dark mb-1">
                                {facility.name}
                            </h3>
                            <p className="text-xs text-slate-500 uppercase font-bold mb-4">
                                {facility.type.replace('_', ' ')}
                            </p>
                            <div className="space-y-2 text-sm">
                                <p className="text-slate-600 dark:text-slate-400">
                                    📍 {facility.address}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    📞 {facility.phone}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    ✉️ {facility.email}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Address
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {facilities.map((facility) => (
                                <tr
                                    key={facility.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-healthcare-dark">
                                            {facility.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 uppercase">
                                            {facility.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {facility.address}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            <div>{facility.phone}</div>
                                            <div className="text-xs">{facility.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${facility.status === 'Active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-700'
                                                }`}
                                        >
                                            {facility.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateFacilityModal
                    onClose={() => {
                        setShowCreateModal(false);
                        handleCreateSuccess();
                    }}
                />
            )}
        </div>
    );
}
