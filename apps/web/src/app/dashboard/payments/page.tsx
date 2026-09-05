'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useCommunity } from '@/context/community-context';
import {
    getPayments,
    createPayment,
    updatePaymentStatus,
    deletePayment,
    Payment,
    PaymentMethod,
    PaymentStatus,
    CreatePaymentInput,
} from '@/lib/payments';
import { getFees, Fee } from '@/lib/fees';
import {
    CreditCard,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    XCircle,
    Trash2,
    DollarSign,
    ExternalLink,
    Filter,
    ArrowUpRight,
    AlertCircle,
} from 'lucide-react';

export default function PaymentsPage() {
    const { token } = useAuth();
    const { activeMembership } = useCommunity();
    const activeCommunityId = activeMembership?.communityId;

    const [payments, setPayments] = useState<Payment[]>([]);
    const [fees, setFees] = useState<Fee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [methodFilter, setMethodFilter] = useState<string>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

    // Form fields for registration
    const [formData, setFormData] = useState<CreatePaymentInput>({
        feeId: '',
        amount: 0,
        method: PaymentMethod.TRANSFER,
        reference: '',
        status: PaymentStatus.COMPLETED,
        receiptUrl: '',
        paymentDate: new Date().toISOString().split('T')[0],
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        if (!token || !activeCommunityId) return;
        setIsLoading(true);
        try {
            const [paymentsData, feesData] = await Promise.all([
                getPayments(token, activeCommunityId, {
                    search: search || undefined,
                    status: (statusFilter as PaymentStatus) || undefined,
                    method: (methodFilter as PaymentMethod) || undefined,
                }),
                getFees(token, activeCommunityId),
            ]);
            setPayments(paymentsData);
            setFees(feesData);
        } catch (err: any) {
            console.error('Error al cargar pagos o cuotas:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token, activeCommunityId, statusFilter, methodFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const handleOpenCreateModal = (fee?: Fee) => {
        setErrorMsg('');
        if (fee) {
            setSelectedFee(fee);
            setFormData({
                feeId: fee.id,
                amount: Number(fee.amount),
                method: PaymentMethod.TRANSFER,
                reference: '',
                status: PaymentStatus.COMPLETED,
                receiptUrl: '',
                paymentDate: new Date().toISOString().split('T')[0],
            });
        } else {
            setSelectedFee(null);
            const firstPendingFee = fees.find((f) => f.status !== 'PAID') || fees[0];
            setFormData({
                feeId: firstPendingFee?.id || '',
                amount: firstPendingFee ? Number(firstPendingFee.amount) : 0,
                method: PaymentMethod.TRANSFER,
                reference: '',
                status: PaymentStatus.COMPLETED,
                receiptUrl: '',
                paymentDate: new Date().toISOString().split('T')[0],
            });
        }
        setIsCreateModalOpen(true);
    };

    const handleSelectFeeChange = (feeId: string) => {
        const fee = fees.find((f) => f.id === feeId);
        setSelectedFee(fee || null);
        setFormData((prev) => ({
            ...prev,
            feeId,
            amount: fee ? Number(fee.amount) : prev.amount,
        }));
    };

    const handleCreatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !activeCommunityId) return;

        if (!formData.feeId) {
            setErrorMsg('Debes seleccionar una cuota');
            return;
        }

        if (!formData.amount || formData.amount <= 0) {
            setErrorMsg('El monto debe ser positivo');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');
        try {
            await createPayment(token, activeCommunityId, formData);
            setIsCreateModalOpen(false);
            loadData();
        } catch (err: any) {
            setErrorMsg(err.message || 'Error al registrar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (paymentId: string, newStatus: PaymentStatus) => {
        if (!token || !activeCommunityId) return;
        try {
            await updatePaymentStatus(token, activeCommunityId, paymentId, { status: newStatus });
            loadData();
        } catch (err: any) {
            alert(err.message || 'Error al actualizar el estado del pago');
        }
    };

    const handleDelete = async (paymentId: string) => {
        if (!confirm('¿Estás seguro de eliminar este pago registrado?')) return;
        if (!token || !activeCommunityId) return;
        try {
            await deletePayment(token, activeCommunityId, paymentId);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar el pago');
        }
    };

    // Calculate Summary Stats
    const totalCollected = payments
        .filter((p) => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const completedCount = payments.filter((p) => p.status === PaymentStatus.COMPLETED).length;
    const pendingCount = payments.filter((p) => p.status === PaymentStatus.PENDING).length;

    const getStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.COMPLETED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completado
                    </span>
                );
            case PaymentStatus.PENDING:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        En Revisión
                    </span>
                );
            case PaymentStatus.CANCELLED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        Rechazado
                    </span>
                );
        }
    };

    const getMethodBadge = (method: PaymentMethod) => {
        switch (method) {
            case PaymentMethod.TRANSFER:
                return <span className="px-2 py-0.5 rounded text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/20">Transferencia</span>;
            case PaymentMethod.CASH:
                return <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Efectivo</span>;
            case PaymentMethod.CARD:
                return <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Tarjeta</span>;
            case PaymentMethod.OTHER:
                return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-500/10 text-slate-400 border border-slate-500/20">Otro</span>;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
                        Registro de Pagos
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Gestiona los abonos, comprobantes de pago y conciliación de cuotas.
                    </p>
                </div>

                <button
                    onClick={() => handleOpenCreateModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-sky-500/25 transition-all transform active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Registrar Pago
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                        <DollarSign className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Recaudado</span>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                        ${totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">Pagos verificados y completados</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-sky-500/10 group-hover:text-sky-500/20 transition-colors">
                        <CheckCircle2 className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pagos Aprobados</span>
                    <div className="text-3xl font-extrabold text-slate-100 mt-2">{completedCount}</div>
                    <span className="text-xs text-slate-500 mt-1 block">Transacciones aplicadas a cuotas</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                        <Clock className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pendientes de Revisión</span>
                    <div className="text-3xl font-extrabold text-amber-400 mt-2">{pendingCount}</div>
                    <span className="text-xs text-slate-500 mt-1 block">Requieren validación de comprobante</span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por concepto, casa o referencia..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                </form>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                        <span>Filtros:</span>
                    </div>

                    <select
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                    >
                        <option value="">Todos los Métodos</option>
                        <option value={PaymentMethod.TRANSFER}>Transferencia</option>
                        <option value={PaymentMethod.CASH}>Efectivo</option>
                        <option value={PaymentMethod.CARD}>Tarjeta</option>
                        <option value={PaymentMethod.OTHER}>Otro</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                    >
                        <option value="">Todos los Estados</option>
                        <option value={PaymentStatus.COMPLETED}>Completados</option>
                        <option value={PaymentStatus.PENDING}>En Revisión</option>
                        <option value={PaymentStatus.CANCELLED}>Rechazados</option>
                    </select>
                </div>
            </div>

            {/* Payments Table */}
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 overflow-hidden backdrop-blur-xl">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-400"></div>
                        <span>Cargando lista de pagos...</span>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 space-y-3">
                        <CreditCard className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
                        <p className="text-base font-medium text-slate-400">No se encontraron pagos registrados</p>
                        <p className="text-xs">Registra un pago para comenzar a administrar la cobranza.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Fecha</th>
                                    <th className="px-6 py-4 font-semibold">Propiedad / Residente</th>
                                    <th className="px-6 py-4 font-semibold">Concepto de Cuota</th>
                                    <th className="px-6 py-4 font-semibold">Monto / Método</th>
                                    <th className="px-6 py-4 font-semibold">Referencia</th>
                                    <th className="px-6 py-4 font-semibold">Estado</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {payments.map((payment) => {
                                    const primaryUser = payment.fee?.property?.members?.[0]?.user;
                                    return (
                                        <tr key={payment.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                                {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('es-MX', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-100">
                                                    {payment.fee?.property?.section?.name ? `${payment.fee.property.section.name} - ` : ''}
                                                    Propiedad {payment.fee?.property?.number}
                                                </div>
                                                {primaryUser && (
                                                    <div className="text-xs text-slate-400">
                                                        {primaryUser.firstName} {primaryUser.lastName}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-slate-200">
                                                {payment.fee?.concept}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-bold text-emerald-400">
                                                    ${Number(payment.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="mt-0.5">{getMethodBadge(payment.method)}</div>
                                            </td>

                                            <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                                {payment.reference || <span className="text-slate-600 italic">Sin ref.</span>}
                                                {payment.receiptUrl && (
                                                    <a
                                                        href={payment.receiptUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 ml-2"
                                                        title="Ver comprobante"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {getStatusBadge(payment.status)}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {payment.status === PaymentStatus.PENDING && (
                                                        <button
                                                            onClick={() => handleStatusChange(payment.id, PaymentStatus.COMPLETED)}
                                                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors border border-emerald-500/30"
                                                            title="Aprobar pago"
                                                        >
                                                            Aprobar
                                                        </button>
                                                    )}

                                                    {payment.status === PaymentStatus.COMPLETED && (
                                                        <button
                                                            onClick={() => handleStatusChange(payment.id, PaymentStatus.CANCELLED)}
                                                            className="px-2.5 py-1 text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
                                                            title="Rechazar o cancelar pago"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDelete(payment.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                        title="Eliminar registro"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Registrar Pago */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-sky-400" />
                                Registrar Pago
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-200 text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreatePayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Cuota Afectada *
                                </label>
                                <select
                                    required
                                    value={formData.feeId}
                                    onChange={(e) => handleSelectFeeChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                >
                                    <option value="" disabled>Selecciona una cuota...</option>
                                    {fees.map((fee) => (
                                        <option key={fee.id} value={fee.id}>
                                            Prop. {fee.property?.number} - {fee.concept} (${Number(fee.amount).toFixed(2)}) [{fee.status}]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Monto Abonado ($) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.amount || ''}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Método de Pago *
                                    </label>
                                    <select
                                        value={formData.method}
                                        onChange={(e) => setFormData({ ...formData, method: e.target.value as PaymentMethod })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                    >
                                        <option value={PaymentMethod.TRANSFER}>Transferencia</option>
                                        <option value={PaymentMethod.CASH}>Efectivo</option>
                                        <option value={PaymentMethod.CARD}>Tarjeta</option>
                                        <option value={PaymentMethod.OTHER}>Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Fecha de Pago *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.paymentDate}
                                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Estado Inicial
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                    >
                                        <option value={PaymentStatus.COMPLETED}>Completado (Aprobado)</option>
                                        <option value={PaymentStatus.PENDING}>En Revisión</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Referencia / Folio de Transacción
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej. TR-9876543210"
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    URL del Comprobante (Opcional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.receiptUrl}
                                    onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-sky-500/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Registrar Pago'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
