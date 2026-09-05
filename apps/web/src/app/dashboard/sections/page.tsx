'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useCommunity } from '@/context/community-context';
import {
    getSections,
    createSection,
    updateSection,
    deleteSection,
    Section,
} from '@/lib/sections';
import {
    Layers,
    Plus,
    Edit2,
    Trash2,
    Building2,
    Search,
    AlertCircle,
    X,
    Loader2,
    CheckCircle2,
} from 'lucide-react';

export default function SectionsPage() {
    const { token } = useAuth();
    const { activeMembership } = useCommunity();

    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete Confirm Modal State
    const [deletingSection, setDeletingSection] = useState<Section | null>(null);

    const fetchSectionsList = useCallback(async () => {
        if (!token || !activeMembership?.communityId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getSections(token, activeMembership.communityId);
            setSections(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar las secciones');
        } finally {
            setLoading(false);
        }
    }, [token, activeMembership?.communityId]);

    useEffect(() => {
        fetchSectionsList();
    }, [fetchSectionsList]);

    const handleOpenCreateModal = () => {
        setEditingSection(null);
        setFormData({ name: '', description: '' });
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (section: Section) => {
        setEditingSection(section);
        setFormData({ name: section.name, description: section.description || '' });
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !activeMembership?.communityId) return;

        if (!formData.name.trim()) {
            setFormError('El nombre de la sección es obligatorio');
            return;
        }

        try {
            setSubmitting(true);
            setFormError(null);

            if (editingSection) {
                await updateSection(token, activeMembership.communityId, editingSection.id, formData);
            } else {
                await createSection(token, activeMembership.communityId, formData);
            }

            setIsModalOpen(false);
            fetchSectionsList();
        } catch (err: any) {
            setFormError(err.message || 'Error al guardar la sección');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !activeMembership?.communityId || !deletingSection) return;

        try {
            setSubmitting(true);
            await deleteSection(token, activeMembership.communityId, deletingSection.id);
            setDeletingSection(null);
            fetchSectionsList();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar la sección');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSections = sections.filter(
        (sec) =>
            sec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sec.description && sec.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    if (!activeMembership) {
        return (
            <div className="glass-card p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12 border border-slate-800">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                <h2 className="text-xl font-bold text-slate-200">No hay comunidad seleccionada</h2>
                <p className="text-sm text-slate-400">
                    Por favor selecciona o únete a una comunidad activa en la barra superior para gestionar sus secciones.
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
                        <span className="p-2 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
                            <Layers className="w-5 h-5" />
                        </span>
                        <h1 className="text-2xl font-bold text-slate-100">Secciones Residenciales</h1>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Administra las manzanas, torres o sectores pertenecientes a{' '}
                        <strong className="text-sky-400">{activeMembership.community.name}</strong>.
                    </p>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Sección</span>
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400">Total Secciones</p>
                        <p className="text-xl font-bold text-slate-100">{sections.length}</p>
                    </div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400">Propiedades Totales</p>
                        <p className="text-xl font-bold text-slate-100">
                            {sections.reduce((acc, sec) => acc + (sec._count?.properties || 0), 0)}
                        </p>
                    </div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400">Comunidad Activa</p>
                        <p className="text-sm font-bold text-slate-200 truncate">{activeMembership.community.name}</p>
                    </div>
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none w-full"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-200">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Table / Loading / Empty State */}
            {loading ? (
                <div className="glass-card p-12 rounded-xl text-center border border-slate-800 space-y-3">
                    <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
                    <p className="text-sm text-slate-400">Cargando secciones...</p>
                </div>
            ) : error ? (
                <div className="glass-card p-6 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            ) : filteredSections.length === 0 ? (
                <div className="glass-card p-12 rounded-xl text-center border border-slate-800 space-y-4">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-slate-300">No se encontraron secciones</h3>
                        <p className="text-xs text-slate-500">
                            {searchTerm
                                ? 'No hay resultados para tu búsqueda.'
                                : 'Aún no se han registrado secciones en esta comunidad.'}
                        </p>
                    </div>
                    {!searchTerm && (
                        <button
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Crear primera sección</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/60 border-b border-slate-800 text-xs text-slate-400 uppercase">
                                <tr>
                                    <th className="px-6 py-3.5 font-semibold">Nombre de Sección</th>
                                    <th className="px-6 py-3.5 font-semibold">Descripción</th>
                                    <th className="px-6 py-3.5 font-semibold text-center">Propiedades</th>
                                    <th className="px-6 py-3.5 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {filteredSections.map((section) => (
                                    <tr key={section.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-200 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                            {section.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 max-w-md truncate">
                                            {section.description || <span className="text-slate-600 italic">Sin descripción</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-sky-400 border border-slate-700">
                                                {section._count?.properties || 0} inmuebles
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEditModal(section)}
                                                    title="Editar"
                                                    className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingSection(section)}
                                                    title="Eliminar"
                                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
                </div>
            )}

            {/* Modal Crear / Editar Sección */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-slate-100">
                                {editingSection ? 'Editar Sección' : 'Nueva Sección'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                                    Nombre de la Sección <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Manzana A, Torre 1, Sector Norte"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Detalles sobre esta área o sector..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 transition-all"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>{editingSection ? 'Guardar Cambios' : 'Crear Sección'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminar */}
            {deletingSection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-100">¿Eliminar Sección?</h3>
                            <p className="text-xs text-slate-400">
                                Se eliminará la sección <strong className="text-slate-200">"{deletingSection.name}"</strong>. Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeletingSection(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 disabled:opacity-50 transition-all"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Confirmar Eliminación</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
