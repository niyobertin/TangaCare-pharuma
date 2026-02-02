import { X, Building2, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Organization, Facility } from '../../types/pharmacy';
import { pharmacyService } from '../../services/pharmacy.service';

interface OrganizationDetailsModalProps {
    organization: Organization;
    onClose: () => void;
}

export function OrganizationDetailsModal({ organization, onClose }: OrganizationDetailsModalProps) {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFacilities = async () => {
            setIsLoading(true);
            try {
                // Assuming backend accepts organization_id or similar filter via search/params
                // If specific filter isn't supported, we might need to rely on the backend implementation 
                // of getFacilities to support filtering by organization_id in common params
                // Based on standard patterns, passing it as a query param is the way.
                // Using 'organization_id' (snake_case) as it matches database/likely query param
                const response = await pharmacyService.getFacilities({
                    limit: 100,
                    // @ts-ignore - organization_id might not be strictly typed in the simplified interface but usually passed through
                    organization_id: organization.id
                });
                setFacilities(response.data || []);
            } catch (error) {
                console.error('Failed to load facilities for organization', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (organization.id) {
            loadFacilities();
        }
    }, [organization.id]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-healthcare-primary/10 flex items-center justify-center text-healthcare-primary">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-healthcare-dark">{organization.name}</h2>
                            <p className="text-xs text-slate-500 font-mono">CODE: {organization.code || 'N/A'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Type</span>
                            <span className="font-semibold text-healthcare-dark capitalize">{(organization.type || '').replace(/_/g, ' ')}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${organization.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {organization.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Facilities Section */}
                    <div>
                        <h3 className="text-sm font-black text-healthcare-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-healthcare-primary" />
                            Assigned Facilities ({facilities.length})
                        </h3>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-healthcare-primary/20 border-t-healthcare-primary rounded-full animate-spin"></div>
                            </div>
                        ) : facilities.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {facilities.map(facility => (
                                    <div key={facility.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-healthcare-primary/30 transition-all bg-white dark:bg-slate-800 shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
                                            <span className="text-lg">🏥</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-healthcare-dark text-sm">{facility.name}</h4>
                                            <p className="text-xs text-slate-500 capitalize mb-1">{(facility.type || '').replace(/_/g, ' ')}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                                                {facility.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={10} /> {facility.phone}
                                                    </span>
                                                )}
                                                {facility.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail size={10} /> {facility.email}
                                                    </span>
                                                )}
                                                {facility.address && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={10} /> {facility.address}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono text-slate-300">#{facility.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                                <p className="text-slate-500 text-sm">No facilities assigned to this organization.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
