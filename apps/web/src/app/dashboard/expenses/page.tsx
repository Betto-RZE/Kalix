'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useCommunity } from '@/context/community-context';
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    Expense,
    CreateExpenseInput,
} from '@/lib/expenses';
import { getPayments, PaymentStatus } from '@/lib/payments';
import {
    TrendingDown,
    Plus,
    Search,
    DollarSign,
    ExternalLink,
    Filter,
    Trash2,
    Edit3,
    AlertCircle,
    TrendingUp,
    Receipt,
    Wallet,
} from 'lucide-react';

const CATEGORIES = [
    'Mantenimiento',
    'Servicios',
    'Seguridad',
    'Jardinería',
    'Limpieza',
    'Administración',
    'Reparaciones',
    'Otro',
];

export default function ExpensesPage() {
    const { token } = useAuth();
    const { activeMembership } = useCommunity();
    const activeCommunityId = activeMembership?.communityId;

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [formData, setFormData] = useState<CreateExpenseInput>({
        category: CATEGORIES[0],
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        receiptUrl: '',
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        if (!token || !activeCommunityId) return;
        setIsLoading(true);
        try {
            const [expensesData, paymentsData] = await Promise.all([
                getExpenses(token, activeCommunityId, {
                    search: search || undefined,
                    category: categoryFilter || undefined,
                }),
                getPayments(token, activeCommunityId, { status: PaymentStatus.COMPLETED }),
            ]);

            setExpenses(expensesData);

            // Calcular ingresos por pagos completados
            const incomeSum = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);
            setTotalIncome(incomeSum);
        } catch (err: any) {
            console.error('Error al cargar gastos o balance:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token, activeCommunityId, categoryFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const handleOpenCreateModal = () => {
        setErrorMsg('');
        setEditingExpense(null);
        setFormData({
            category: CATEGORIES[0],
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            supplier: '',
            receiptUrl: '',
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (expense: Expense) => {
        setErrorMsg('');
        setEditingExpense(expense);
        setFormData({
            category: expense.category,
            description: expense.description,
            amount: Number(expense.amount),
            date: new Date(expense.date).toISOString().split('T')[0],
            supplier: expense.supplier || '',
            receiptUrl: expense.receiptUrl || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !activeCommunityId) return;

        if (!formData.description.trim()) {
            setErrorMsg('La descripción es obligatoria');
            return;
        }

        if (!formData.amount || formData.amount <= 0) {
            setErrorMsg('El monto debe ser un número positivo');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');
        try {
            if (editingExpense) {
                await updateExpense(token, activeCommunityId, editingExpense.id, formData);
            } else {
                await createExpense(token, activeCommunityId, formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) {
            setErrorMsg(err.message || 'Error al guardar el gasto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (expenseId: string) => {
        if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
        if (!token || !activeCommunityId) return;
        try {
            await deleteExpense(token, activeCommunityId, expenseId);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar el gasto');
        }
    };

    // Statistical calculations
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netBalance = totalIncome - totalExpenses;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
                        Control de Gastos y Egresos
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Registra los egresos de la comunidad y supervisa el balance financiero en tiempo real.
                    </p>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all transform active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Registrar Gasto
                </button>
            </div>

            {/* Financial Balance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                        <TrendingUp className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ingresos Totales (Cobros)</span>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                        ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">Pagos de cuotas registrados</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-rose-500/10 group-hover:text-rose-500/20 transition-colors">
                        <TrendingDown className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Egresos Totales (Gastos)</span>
                    <div className="text-3xl font-extrabold text-rose-400 mt-2">
                        ${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">{expenses.length} gastos contabilizados</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-sky-500/10 group-hover:text-sky-500/20 transition-colors">
                        <Wallet className="w-16 h-16" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Balance Neto en Caja</span>
                    <div className={`text-3xl font-extrabold mt-2 ${netBalance >= 0 ? 'text-sky-400' : 'text-rose-500'}`}>
                        ${netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">Diferencia disponible (Ingresos - Gastos)</span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por descripción o proveedor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                </form>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                        <span>Categoría:</span>
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                    >
                        <option value="">Todas las Categorías</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 overflow-hidden backdrop-blur-xl">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-400"></div>
                        <span>Cargando registro de gastos...</span>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 space-y-3">
                        <Receipt className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
                        <p className="text-base font-medium text-slate-400">No hay gastos registrados</p>
                        <p className="text-xs">Comienza registrando las compras o mantenimientos de la comunidad.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Fecha</th>
                                    <th className="px-6 py-4 font-semibold">Categoría</th>
                                    <th className="px-6 py-4 font-semibold">Descripción</th>
                                    <th className="px-6 py-4 font-semibold">Proveedor</th>
                                    <th className="px-6 py-4 font-semibold">Monto</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                            {new Date(expense.date).toLocaleDateString('es-MX', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                {expense.category}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-slate-100 font-medium">
                                            {expense.description}
                                        </td>

                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {expense.supplier || <span className="text-slate-600 italic">No especificado</span>}
                                            {expense.receiptUrl && (
                                                <a
                                                    href={expense.receiptUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 ml-2"
                                                    title="Ver factura/comprobante"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 font-bold text-rose-400">
                                            ${Number(expense.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEditModal(expense)}
                                                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                                                    title="Editar gasto"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Eliminar gasto"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Crear / Editar Gasto */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-rose-400" />
                                {editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Categoría *
                                    </label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Fecha *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Descripción del Gasto *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Reparación de bomba de agua"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Monto ($) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.amount || ''}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Proveedor / Contratista
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Servicios Plomería S.A."
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    URL Factura / Comprobante (Opcional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.receiptUrl}
                                    onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Guardando...' : editingExpense ? 'Actualizar Gasto' : 'Guardar Gasto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
