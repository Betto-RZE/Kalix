'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useCommunity } from '@/context/community-context';
import { getSections, Section } from '@/lib/sections';
import {
    getProperties,
    createProperty,
    deleteProperty,
    assignPropertyMember,
    removePropertyMember,
    createVehicle,
    deleteVehicle,
    Property,
    PropertyStatus,
    PropertyMemberType,
    VehicleType,
} from '@/lib/properties';
import {
    Home,
    Plus,
    Trash2,
    Users,
    Car,
    Layers,
    Search,
    AlertCircle,
    X,
    Loader2,
    UserPlus,
    ShieldCheck,
    Building2,
    Tag,
} from 'lucide-react';

export default function PropertiesPage() {
    const { token, user } = useAuth();
    const { activeMembership } = useCommunity();

    const [properties, setProperties] = useState<Property[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        sectionId: '',
        number: '',
        address: '',
        status: PropertyStatus.ACTIVE,
    });

    // Assign Member Modal
    const [assigningProperty, setAssigningProperty] = useState<Property | null>(null);
    const [assignForm, setAssignForm] = useState({
        userId: '',
        type: PropertyMemberType.RESIDENT,
        isPrimary: false,
    });

    // Create Vehicle Modal
    const [vehicleProperty, setVehicleProperty] = useState<Property | null>(null);
    const [vehicleForm, setVehicleForm] = useState({
        brand: '',
        model: '',
        color: '',
        licensePlate: '',
        type: VehicleType.CAR,
    });

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);

    const fetchData = useCallback(async () => {
        if (!token || !activeMembership?.communityId) return;
        try {
            setLoading(true);
            setError(null);
            const [propsData, secsData] = await Promise.all([
                getProperties(token, activeMembership.communityId, selectedSection || undefined),
                getSections(token, activeMembership.communityId),
            ]);
            setProperties(propsData);
            setSections(secsData);
        } catch (err: any) {
            setError(err.message || 'Error al cargar propiedades');
        } finally {
            setLoading(false);
        }
    }, [token, activeMembership?.communityId, selectedSection]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle Create Property
    const handleCreateProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !activeMembership?.communityId) return;

        try {
            setSubmitting(true);
            setFormError(null);
            await createProperty(token, activeMembership.communityId, createForm);
            setIsCreateModalOpen(false);
            setCreateForm({ sectionId: '', number: '', address: '', status: PropertyStatus.ACTIVE });
            fetchData();
        } catch (err: any) {
            setFormError(err.message || 'Error al crear la propiedad');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Assign Member
    const handleAssignMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !activeMembership?.communityId || !assigningProperty) return;

        try {
            setSubmitting(true);
            setFormError(null);
            // Asignar el usuario especificado o al usuario actual por defecto
            const targetUserId = assignForm.userId || user?.id;
            if (!targetUserId) {
                setFormError('Debe especificar o seleccionar un ID de usuario');
                return;
            }

            await assignPropertyMember(token, activeMembership.communityId, assigningProperty.id, {
                userId: targetUserId,
                type: assignForm.type,
                isPrimary: assignForm.isPrimary,
            });

            setAssigningProperty(null);
            fetchData();
        } catch (err: any) {
            setFormError(err.message || 'Error al asignar miembro');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Remove Member
    const handleRemoveMember = async (propertyId: string, memberId: string) => {
        if (!token || !activeMembership?.communityId) return;
        try {
            await removePropertyMember(token, activeMembership.communityId, propertyId, memberId);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar miembro');
        }
    };

    // Handle Create Vehicle
    const handleCreateVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !activeMembership?.communityId || !vehicleProperty || !user) return;

        try {
            setSubmitting(true);
            setFormError(null);
            await createVehicle(token, activeMembership.communityId, {
                propertyId: vehicleProperty.id,
                userId: user.id,
                ...vehicleForm,
            });

            setVehicleProperty(null);
            setVehicleForm({ brand: '', model: '', color: '', licensePlate: '', type: VehicleType.CAR });
            fetchData();
        } catch (err: any) {
            setFormError(err.message || 'Error al registrar vehículo');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Delete Vehicle
    const handleDeleteVehicle = async (vehicleId: string) => {
        if (!token || !activeMembership?.communityId) return;
        try {
            await deleteVehicle(token, activeMembership.communityId, vehicleId);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar vehículo');
        }
    };

    // Handle Delete Property
    const handleDeleteProperty = async () => {
        if (!token || !activeMembership?.communityId || !deletingProperty) return;

        try {
            setSubmitting(true);
            await deleteProperty(token, activeMembership.communityId, deletingProperty.id);
            setDeletingProperty(null);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar la propiedad');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProperties = properties.filter((prop) => {
        const search = searchTerm.toLowerCase();
        return (
            prop.number.toLowerCase().includes(search) ||
            (prop.address && prop.address.toLowerCase().includes(search)) ||
            prop.section.name.toLowerCase().includes(search)
        );
    });

    if (!activeMembership) {
        return (
            <div className="glass-card p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12 border border-slate-800">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                <h2 className="text-xl font-bold text-slate-200">No hay comunidad seleccionada</h2>
                <p className="text-sm text-slate-400">
                    Por favor selecciona una comunidad activa en el encabezado.
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
                        <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                            <Home className="w-5 h-5" />
                        </span>
                        <h1 className="text-2xl font-bold text-slate-100">Propiedades Residenciales</h1>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Gestión de viviendas, asignación de residentes y vehículos en{' '}
                        <strong className="text-indigo-400">{activeMembership.community.name}</strong>.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setFormError(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-400 hover:to-sky-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Propiedad</span>
                </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Search */}
                <div className="glass-card px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por número o dirección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none w-full"
                    />
                </div>

                {/* Filter Section */}
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

                {/* Counter */}
                <div className="glass-card px-4 py-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Total Mostrado</span>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                        {filteredProperties.length} Inmuebles
                    </span>
                </div>
            </div>

            {/* Property Cards Grid */}
            {loading ? (
                <div className="glass-card p-12 rounded-2xl text-center border border-slate-800 space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-sm text-slate-400">Cargando propiedades...</p>
                </div>
            ) : error ? (
                <div className="glass-card p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            ) : filteredProperties.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl text-center border border-slate-800 space-y-4">
                    <Home className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-slate-300">No hay propiedades registradas</h3>
                        <p className="text-xs text-slate-500">Crea la primera propiedad para esta comunidad.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                        <div
                            key={property.id}
                            className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/30 transition-all space-y-4 flex flex-col justify-between"
                        >
                            {/* Header Card */}
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 border border-slate-700">
                                            {property.section.name}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-100">{property.number}</h3>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${property.status === PropertyStatus.ACTIVE
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}
                                        >
                                            {property.status}
                                        </span>
                                        <button
                                            onClick={() => setDeletingProperty(property)}
                                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                                            title="Eliminar propiedad"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {property.address && (
                                    <p className="text-xs text-slate-400 line-clamp-1">{property.address}</p>
                                )}
                            </div>

                            {/* Members Section */}
                            <div className="border-t border-slate-800/80 pt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
                                        <Users className="w-3.5 h-3.5 text-sky-400" />
                                        Residentes & Propietarios ({property.members?.length || 0})
                                    </span>
                                    <button
                                        onClick={() => {
                                            setFormError(null);
                                            setAssignForm({ userId: user?.id || '', type: PropertyMemberType.RESIDENT, isPrimary: false });
                                            setAssigningProperty(property);
                                        }}
                                        className="p-1 text-sky-400 hover:bg-sky-500/10 rounded-md transition-colors flex items-center gap-1 text-[11px] font-medium"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        <span>Asignar</span>
                                    </button>
                                </div>

                                {property.members && property.members.length > 0 ? (
                                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                        {property.members.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                                                        {member.user.firstName[0]}
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="font-semibold text-slate-200 truncate">
                                                            {member.user.firstName} {member.user.lastName}
                                                        </p>
                                                        <span className="text-[9px] text-slate-400 uppercase font-semibold">
                                                            {member.type} {member.isPrimary && '⭐ Principal'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveMember(property.id, member.id)}
                                                    className="text-slate-500 hover:text-rose-400 p-1"
                                                    title="Desvincular"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-600 italic">Sin miembros asignados</p>
                                )}
                            </div>

                            {/* Vehicles Section */}
                            <div className="border-t border-slate-800/80 pt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
                                        <Car className="w-3.5 h-3.5 text-purple-400" />
                                        Vehículos ({property.vehicles?.length || 0})
                                    </span>
                                    <button
                                        onClick={() => {
                                            setFormError(null);
                                            setVehicleProperty(property);
                                        }}
                                        className="p-1 text-purple-400 hover:bg-purple-500/10 rounded-md transition-colors flex items-center gap-1 text-[11px] font-medium"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Registrar</span>
                                    </button>
                                </div>

                                {property.vehicles && property.vehicles.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {property.vehicles.map((v) => (
                                            <span
                                                key={v.id}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 text-[11px] border border-slate-800 text-slate-300"
                                            >
                                                <strong className="text-purple-300 font-mono">{v.licensePlate}</strong> - {v.brand} {v.model}
                                                <button
                                                    onClick={() => handleDeleteVehicle(v.id)}
                                                    className="text-slate-500 hover:text-rose-400 ml-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-600 italic">Sin vehículos registrados</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear Propiedad */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-slate-100">Nueva Propiedad</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateProperty} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Sección *</label>
                                <select
                                    value={createForm.sectionId}
                                    onChange={(e) => setCreateForm({ ...createForm, sectionId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                    required
                                >
                                    <option value="">Selecciona una sección...</option>
                                    {sections.map((sec) => (
                                        <option key={sec.id} value={sec.id}>
                                            {sec.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Número / Identificador *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Casa 101, Depto 4B"
                                    value={createForm.number}
                                    onChange={(e) => setCreateForm({ ...createForm, number: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Dirección (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Calle o especificación adicional"
                                    value={createForm.address}
                                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm text-slate-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Guardando...' : 'Crear Propiedad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Asignar Miembro */}
            {assigningProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-slate-100">
                                Asignar a {assigningProperty.number}
                            </h3>
                            <button onClick={() => setAssigningProperty(null)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleAssignMember} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">ID de Usuario</label>
                                <input
                                    type="text"
                                    placeholder="ID de usuario (por defecto: tú mismo)"
                                    value={assignForm.userId}
                                    onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tipo de Miembro</label>
                                <select
                                    value={assignForm.type}
                                    onChange={(e) => setAssignForm({ ...assignForm, type: e.target.value as PropertyMemberType })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                >
                                    <option value={PropertyMemberType.RESIDENT}>Residente</option>
                                    <option value={PropertyMemberType.OWNER}>Propietario</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPrimary"
                                    checked={assignForm.isPrimary}
                                    onChange={(e) => setAssignForm({ ...assignForm, isPrimary: e.target.checked })}
                                    className="rounded border-slate-800 bg-slate-900 text-indigo-500 focus:ring-0"
                                />
                                <label htmlFor="isPrimary" className="text-xs text-slate-300 cursor-pointer">
                                    Marcar como contacto/residente principal
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAssigningProperty(null)}
                                    className="px-4 py-2 rounded-xl text-sm text-slate-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Asignando...' : 'Asignar Miembro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Registrar Vehículo */}
            {vehicleProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-slate-100">
                                Registrar Vehículo en {vehicleProperty.number}
                            </h3>
                            <button onClick={() => setVehicleProperty(null)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateVehicle} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Marca *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Toyota"
                                        value={vehicleForm.brand}
                                        onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Modelo *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Yaris"
                                        value={vehicleForm.model}
                                        onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Color *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Blanco"
                                        value={vehicleForm.color}
                                        onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Placa *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: XYZ-9988"
                                        value={vehicleForm.licensePlate}
                                        onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono uppercase"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setVehicleProperty(null)}
                                    className="px-4 py-2 rounded-xl text-sm text-slate-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Registrando...' : 'Registrar Vehículo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminar Propiedad */}
            {deletingProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-100">¿Eliminar Propiedad?</h3>
                            <p className="text-xs text-slate-400">
                                Se eliminará la propiedad <strong className="text-slate-200">"{deletingProperty.number}"</strong>.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeletingProperty(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteProperty}
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
