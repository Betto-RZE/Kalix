'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useCommunity } from '@/context/community-context';
import { getSections, Section } from '@/lib/sections';
import { getProperties, Property } from '@/lib/properties';
import {
    getFees,
    createFee,
    createBulkFees,
    deleteFee,
    Fee,
    FeeStatus,
} from '@/lib/fees';
import {
    DollarSign,
    Plus,
    Trash2,
    Layers,
    Search,
    AlertCircle,
    X,
    Loader2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Zap,
    TrendingUp,
} from 'lucide-react';

export default function FeesPage() {
    const { token } = useAuth();
    const { activeMembership } = useCommunity();

    const [fees, setFees] = useState<Fee[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Bulk Modal
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkForm, setBulkForm] = useState({
        sectionId: '',
        concept: '',
        amount: '',
        dueDate: '',
    });

    // Single Modal
    const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
    const [singleForm, setSingleForm] = useState({
        propertyId: '',
        concept: '',
        amount: '',
        dueDate: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingFee, setDeletingFee] = useState<Fee | null>(null);

    const fetchData = useCallback(async () => {
        if (!token || !activeMembership?.communityId) return;
        try {
            setLoading(true);
            setError(null);
            const [feesData, secsData, propsData] = await Promise.all([
                getFees(token, activeMembership.communityId, {
                    sectionId: selectedSection || undefined,
                    status: (selectedStatus as FeeStatus) || undefined,
                    search: searchTerm || undefined,
                }),
                getSections(token, activeMembership.communityId),
                getProperties(token, activeMembership.communityId),
            ]);
            setFees(feesData);
            setSections(secsData);
            setProperties(propsData);
        } catch (err: any) {
            setError(err.message || 'Error al cargar las cuotas');
        } finally {
            setLoading(false);
        }
    }, [token, activeMembership?.communityId, selectedSection, selectedStatus, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle Bulk Creation
    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !activeMembership?.communityId) return;

        if (!bulkForm.concept || !bulkForm.amount || !bulkForm.dueDate) {
            setFormError('Todos los campos marcados son obligatorios');
            return;
        }

        try {
            setSubmitting(true);
            setFormError(null);
            await createBulkFees(token, activeMembership.communityId, {
                sectionId: bulkForm.sectionId || undefined,
                concept: bulkForm.concept,
                amount: parseFloat(bulkForm.amount),
                dueDate: new Date(bulkForm.dueDate).toISOString(),
            });

            setIsBulkModalOpen(false);
            setBulkForm({ sectionId: '', concept: '', amount: '', dueDate: '' });
            fetchData();
        } catch (err: any) {
            setFormError(err.message || 'Error al realizar emisión masiva');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Single Creation
    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !activeMembership?.communityId) return;

        if (!singleForm.propertyId || !singleForm.concept || !singleForm.amount || !singleForm.dueDate) {
            setFormError('Todos los campos marcados son obligatorios');
            return;
        }

        try {
            setSubmitting(true);
            setFormError(null);
            await createFee(token, activeMembership.communityId, {
                propertyId: singleForm.propertyId,
                concept: singleForm.concept,
                amount: parseFloat(singleForm.amount),
                dueDate: new Date(singleForm.dueDate).toISOString(),
            });

            setIsSingleModalOpen(false);
            setSingleForm({ propertyId: '', concept: '', amount: '', dueDate: '' });
            fetchData();
        } catch (err: any) {
            setFormError(err.message || 'Error al crear la cuota');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Delete
    const handleDelete = async () => {
        if (!token || !activeMembership?.communityId || !deletingFee) return;

        try {
            setSubmitting(true);
            await deleteFee(token, activeMembership.communityId, deletingFee.id);
            setDeletingFee(null);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar la cuota');
        } finally {
            setSubmitting(false);
        }
    };

    // Stats Calculations
    const totalAmount = fees.reduce((acc, fee) => acc + Number(fee.amount), 0);
    const paidAmount = fees
        .filter((f) => f.status === FeeStatus.PAID)
        .reduce((acc, fee) => acc + Number(fee.amount), 0);
    const pendingAmount = fees
        .filter((f) => f.status === FeeStatus.PENDING)
        .reduce((acc, fee) => acc + Number(fee.amount), 0);
    const overdueAmount = fees
        .filter((f) => f.status === FeeStatus.OVERDUE)
        .reduce((acc, fee) => acc + Number(fee.amount), 0);

    if (!activeMembership) {
        return (
            <div className="glass-card p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12 border border-slate-800">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                <h2 className="text-xl font-bold text-slate-200">No hay comunidad seleccionada</h2>
                <p className="text-sm text-slate-400">
                    Selecciona una comunidad activa en la barra superior.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                            <DollarSign className="w-5 h-5" />
                        </span>
                        <h1 className="text-2xl font-bold text-slate-100">Cuotas Residenciales</h1>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Cobros, emisión masiva de mantenimientos y estatus financiero de{' '}
                        <strong className="text-emerald-400">{activeMembership.community.name}</strong>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setFormError(null);
                            setIsBulkModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Emisión Masiva</span>
                    </button>

                    <button
                        onClick={() => {
                            setFormError(null);
                            setIsSingleModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-card hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Cuota Individual</span>
                    </button>
                </div>
            </div>

            {/* Financial Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-semibold">Total Emitido</span>
                        <TrendingUp className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-100">${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <span className="text-[10px] text-slate-500">{fees.length} cuotas registradas</span>
                </div>

                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-emerald-400">
                        <span className="text-xs font-semibold">Total Recaudado</span>
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-400">${paidAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <span className="text-[10px] text-emerald-500/80">Cuotas liquidadas</span>
                </div>

                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-amber-400">
                        <span className="text-xs font-semibold">Pendiente por Cobrar</span>
                        <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-extrabold text-amber-400">${pendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <span className="text-[10px] text-amber-500/80">Dentro de la fecha límite</span>
                </div>

                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-rose-400">
                        <span className="text-xs font-semibold">Monto en Morosidad</span>
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-extrabold text-rose-400">${overdueAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <span className="text-[10px] text-rose-500/80">Cuotas vencidas</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por concepto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none w-full"
                    />
                </div>

                <div className="glass-card px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="bg-transparent text-sm text-slate-200 focus:outline-none w-full cursor-pointer"
                    >
                        <option value="" className="bg-slate-900 text-slate-300">Todas las Secciones</option>
                        {sections.map((sec) => (
                            <option key={sec.id} value={sec.id} className="bg-slate-900 text-slate-300">
                                {sec.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="glass-card px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-transparent text-sm text-slate-200 focus:outline-none w-full cursor-pointer"
                    >
                        <option value="" className="bg-slate-900 text-slate-300">Todos los Estatus</option>
                        <option value={FeeStatus.PENDING} className="bg-slate-900 text-amber-400">PENDIENTE</option>
                        <option value={FeeStatus.PAID} className="bg-slate-900 text-emerald-400">PAGADO</option>
                        <option value={FeeStatus.OVERDUE} className="bg-slate-900 text-rose-400">VENCIDO</option>
                        <option value={FeeStatus.CANCELLED} className="bg-slate-900 text-slate-400">CANCELADO</option>
                    </select>
                </div>
            </div>

            {/* Fees Table */}
            {loading ? (
                <div className="glass-card p-12 rounded-xl text-center border border-slate-800 space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                    <p className="text-sm text-slate-400">Cargando cuotas...</p>
                </div>
            ) : error ? (
                <div className="glass-card p-6 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            ) : fees.length === 0 ? (
                <div className="glass-card p-12 rounded-xl text-center border border-slate-800 space-y-4">
                    <DollarSign className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-slate-300">No se encontraron cuotas</h3>
                        <p className="text-xs text-slate-500">Realiza una emisión masiva o individual de mantenimientos.</p>
                    </div>
                </div>
            ) : (
                <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/60 border-b border-slate-800 text-xs text-slate-400 uppercase">
                                <tr>
                                    <th className="px-6 py-3.5 font-semibold">Propiedad</th>
                                    <th className="px-6 py-3.5 font-semibold">Concepto</th>
                                    <th className="px-6 py-3.5 font-semibold">Monto</th>
                                    <th className="px-6 py-3.5 font-semibold">Fecha Límite</th>
                                    <th className="px-6 py-3.5 font-semibold text-center">Estatus</th>
                                    <th className="px-6 py-3.5 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {fees.map((fee) => (
                                    <tr key={fee.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-200">
                                            <div className="flex flex-col">
                                                <span className="text-slate-100 font-bold">{fee.property.number}</span>
                                                <span className="text-[10px] text-slate-400 uppercase font-semibold">{fee.property.section.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 font-medium">{fee.concept}</td>
                                        <td className="px-6 py-4 font-extrabold text-slate-100">
                                            ${Number(fee.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(fee.dueDate).toLocaleDateString('es-MX', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${fee.status === FeeStatus.PAID
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : fee.status === FeeStatus.OVERDUE
                                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                        : fee.status === FeeStatus.CANCELLED
                                                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    }`}
                                            >
                                                {fee.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setDeletingFee(fee)}
                                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                title="Eliminar cuota"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Emisión Masiva */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-bold text-slate-100">Emisión Masiva de Cuotas</h3>
                            </div>
                            <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleBulkSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Sección Destino (Opcional)</label>
                                <select
                                    value={bulkForm.sectionId}
                                    onChange={(e) => setBulkForm({ ...bulkForm, sectionId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                >
                                    <option value="">Toda la Comunidad (Todas las Secciones)</option>
                                    {sections.map((sec) => (
                                        <option key={sec.id} value={sec.id}>
                                            {sec.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Concepto *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Cuota de Mantenimiento Mensual"
                                    value={bulkForm.concept}
                                    onChange={(e) => setBulkForm({ ...bulkForm, concept: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Monto ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="1500.00"
                                        value={bulkForm.amount}
                                        onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Fecha Límite *</label>
                                    <input
                                        type="date"
                                        value={bulkForm.dueDate}
                                        onChange={(e) => setBulkForm({ ...bulkForm, dueDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsBulkModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm text-slate-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Generando...' : 'Emitir Cuotas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Cuota Individual */}
            {isSingleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-slate-100">Nueva Cuota Individual</h3>
                            <button onClick={() => setIsSingleModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSingleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Propiedad *</label>
                                <select
                                    value={singleForm.propertyId}
                                    onChange={(e) => setSingleForm({ ...singleForm, propertyId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                    required
                                >
                                    <option value="">Selecciona una propiedad...</option>
                                    {properties.map((prop) => (
                                        <option key={prop.id} value={prop.id}>
                                            {prop.number} ({prop.section.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Concepto *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Cuota Extraordinaria Pintura"
                                    value={singleForm.concept}
                                    onChange={(e) => setSingleForm({ ...singleForm, concept: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Monto ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="1500.00"
                                        value={singleForm.amount}
                                        onChange={(e) => setSingleForm({ ...singleForm, amount: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Fecha Límite *</label>
                                    <input
                                        type="date"
                                        value={singleForm.dueDate}
                                        onChange={(e) => setSingleForm({ ...singleForm, dueDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSingleModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm text-slate-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Creando...' : 'Crear Cuota'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminar Cuota */}
            {deletingFee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-100">¿Eliminar Cuota?</h3>
                            <p className="text-xs text-slate-400">
                                Se eliminará la cuota <strong className="text-slate-200">"{deletingFee.concept}"</strong> por valor de ${Number(deletingFee.amount)}.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeletingFee(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold disabled:opacity-50"
                            >
                                Confirmar Eliminación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
