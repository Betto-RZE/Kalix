'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useCommunity } from '@/context/community-context';
import {
    getVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    Vehicle,
    VehicleType,
    VehicleStatus,
    CreateVehicleInput,
} from '@/lib/vehicles';
import { getProperties, Property } from '@/lib/properties';
import {
    Car,
    Plus,
    Search,
    Edit3,
    Trash2,
    Filter,
    Shield,
    AlertCircle,
    User,
    Home,
} from 'lucide-react';

export default function VehiclesPage() {
    const { token, user } = useAuth();
    const { activeMembership } = useCommunity();
    const activeCommunityId = activeMembership?.communityId;

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState<CreateVehicleInput>({
        propertyId: '',
        userId: '',
        brand: '',
        model: '',
        color: '',
        licensePlate: '',
        type: VehicleType.CAR,
        status: VehicleStatus.ACTIVE,
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        if (!token || !activeCommunityId) return;
        setIsLoading(true);
        try {
            const [vehiclesData, propertiesData] = await Promise.all([
                getVehicles(token, activeCommunityId, {
                    search: search || undefined,
                }),
                getProperties(token, activeCommunityId),
            ]);

            let filtered = vehiclesData;
            if (typeFilter) {
                filtered = filtered.filter((v) => v.type === typeFilter);
            }

            setVehicles(filtered);
            setProperties(propertiesData);
        } catch (err: any) {
            console.error('Error al cargar vehículos o propiedades:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token, activeCommunityId, typeFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const handleOpenCreateModal = () => {
        setErrorMsg('');
        setEditingVehicle(null);
        const firstProp = properties[0];
        const primaryMemberUser = firstProp?.members?.[0]?.userId || user?.id || '';
        setFormData({
            propertyId: firstProp?.id || '',
            userId: primaryMemberUser,
            brand: '',
            model: '',
            color: '',
            licensePlate: '',
            type: VehicleType.CAR,
            status: VehicleStatus.ACTIVE,
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (vehicle: Vehicle) => {
        setErrorMsg('');
        setEditingVehicle(vehicle);
        setFormData({
            propertyId: vehicle.propertyId,
            userId: vehicle.userId,
            brand: vehicle.brand,
            model: vehicle.model,
            color: vehicle.color,
            licensePlate: vehicle.licensePlate,
            type: vehicle.type,
            status: vehicle.status,
        });
        setIsModalOpen(true);
    };

    const handlePropertySelectChange = (propertyId: string) => {
        const prop = properties.find((p) => p.id === propertyId);
        const firstMemberUserId = prop?.members?.[0]?.userId || user?.id || '';
        setFormData((prev) => ({
            ...prev,
            propertyId,
            userId: firstMemberUserId,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !activeCommunityId) return;

        if (!formData.propertyId) {
            setErrorMsg('Debes seleccionar una propiedad');
            return;
        }

        if (!formData.brand.trim() || !formData.model.trim() || !formData.licensePlate.trim()) {
            setErrorMsg('Marca, modelo y placa son obligatorios');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');
        try {
            if (editingVehicle) {
                await updateVehicle(token, activeCommunityId, editingVehicle.id, formData);
            } else {
                await createVehicle(token, activeCommunityId, formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) {
            setErrorMsg(err.message || 'Error al guardar el vehículo');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (vehicleId: string) => {
        if (!confirm('¿Estás seguro de eliminar este vehículo registrado?')) return;
        if (!token || !activeCommunityId) return;
        try {
            await deleteVehicle(token, activeCommunityId, vehicleId);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar el vehículo');
        }
    };

    const getTypeBadge = (type: VehicleType) => {
        switch (type) {
            case VehicleType.CAR:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Auto</span>;
            case VehicleType.MOTORCYCLE:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Motocicleta</span>;
            case VehicleType.TRUCK:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Camioneta / Camión</span>;
            case VehicleType.OTHER:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Otro</span>;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
                        Control de Vehículos
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Administra el parque vehicular, placas y accesos asociados a cada propiedad.
                    </p>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-sky-500/25 transition-all transform active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Registrar Vehículo
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por placa, marca, modelo o casa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                </form>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tipo de Vehículo:</span>
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                    >
                        <option value="">Todos los Tipos</option>
                        <option value={VehicleType.CAR}>Auto</option>
                        <option value={VehicleType.MOTORCYCLE}>Motocicleta</option>
                        <option value={VehicleType.TRUCK}>Camioneta</option>
                        <option value={VehicleType.OTHER}>Otro</option>
                    </select>
                </div>
            </div>

            {/* Vehicles Table */}
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 overflow-hidden backdrop-blur-xl">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-400"></div>
                        <span>Cargando vehículos registrados...</span>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 space-y-3">
                        <Car className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
                        <p className="text-base font-medium text-slate-400">No se encontraron vehículos registrados</p>
                        <p className="text-xs">Registra un vehículo asignándolo a una propiedad.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Placa</th>
                                    <th className="px-6 py-4 font-semibold">Vehículo</th>
                                    <th className="px-6 py-4 font-semibold">Color</th>
                                    <th className="px-6 py-4 font-semibold">Propiedad</th>
                                    <th className="px-6 py-4 font-semibold">Propietario / Conductor</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {vehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-950 border border-slate-700 font-mono font-bold text-slate-100 rounded-md tracking-wider text-xs shadow-inner">
                                                {vehicle.licensePlate}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-100">
                                                {vehicle.brand} {vehicle.model}
                                            </div>
                                            <div className="mt-0.5">{getTypeBadge(vehicle.type)}</div>
                                        </td>

                                        <td className="px-6 py-4 text-xs text-slate-300 capitalize">
                                            {vehicle.color}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-200">
                                                <Home className="w-3.5 h-3.5 text-sky-400" />
                                                <span>
                                                    {vehicle.property?.section?.name ? `${vehicle.property.section.name} - ` : ''}
                                                    Propiedad {vehicle.property?.number || vehicle.propertyId}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {vehicle.user ? (
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span>{vehicle.user.firstName} {vehicle.user.lastName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 italic">No asignado</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEditModal(vehicle)}
                                                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                                                    title="Editar vehículo"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vehicle.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Eliminar vehículo"
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

            {/* Modal: Crear / Editar Vehículo */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                <Car className="w-5 h-5 text-sky-400" />
                                {editingVehicle ? 'Editar Vehículo' : 'Registrar Vehículo'}
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
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Propiedad Asignada *
                                </label>
                                <select
                                    required
                                    value={formData.propertyId}
                                    onChange={(e) => handlePropertySelectChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                >
                                    <option value="" disabled>Selecciona una propiedad...</option>
                                    {properties.map((prop) => (
                                        <option key={prop.id} value={prop.id}>
                                            Propiedad {prop.number} {prop.section?.name ? `(${prop.section.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Placa / Matrícula *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. ABC-123-A"
                                        value={formData.licensePlate}
                                        onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Tipo de Vehículo
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                    >
                                        <option value={VehicleType.CAR}>Auto</option>
                                        <option value={VehicleType.MOTORCYCLE}>Motocicleta</option>
                                        <option value={VehicleType.TRUCK}>Camioneta</option>
                                        <option value={VehicleType.OTHER}>Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Marca *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Toyota"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Modelo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Corolla 2022"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Color *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Blanco"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                                    />
                                </div>
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
                                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-sky-500/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Guardando...' : editingVehicle ? 'Actualizar Vehículo' : 'Guardar Vehículo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
