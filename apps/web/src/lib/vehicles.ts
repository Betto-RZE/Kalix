import { fetchApi } from './api';

export enum VehicleType {
    CAR = 'CAR',
    MOTORCYCLE = 'MOTORCYCLE',
    TRUCK = 'TRUCK',
    OTHER = 'OTHER',
}

export enum VehicleStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export interface VehicleProperty {
    id: string;
    number: string;
    section?: {
        id: string;
        name: string;
    };
}

export interface VehicleUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Vehicle {
    id: string;
    propertyId: string;
    userId: string;
    brand: string;
    model: string;
    color: string;
    licensePlate: string;
    type: VehicleType;
    status: VehicleStatus;
    createdAt: string;
    updatedAt: string;
    property?: VehicleProperty;
    user?: VehicleUser;
}

export interface CreateVehicleInput {
    propertyId: string;
    userId: string;
    brand: string;
    model: string;
    color: string;
    licensePlate: string;
    type?: VehicleType;
    status?: VehicleStatus;
}

export interface QueryVehicleInput {
    propertyId?: string;
    search?: string;
    status?: VehicleStatus;
}

export async function getVehicles(
    token: string,
    communityId: string,
    query?: QueryVehicleInput,
): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    if (query?.propertyId) params.append('propertyId', query.propertyId);
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Vehicle[]>(`/communities/${communityId}/vehicles${queryString}`, {}, token, communityId);
}

export async function createVehicle(
    token: string,
    communityId: string,
    data: CreateVehicleInput,
): Promise<Vehicle> {
    return fetchApi<Vehicle>(
        `/communities/${communityId}/vehicles`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function updateVehicle(
    token: string,
    communityId: string,
    vehicleId: string,
    data: Partial<CreateVehicleInput>,
): Promise<Vehicle> {
    return fetchApi<Vehicle>(
        `/communities/${communityId}/vehicles/${vehicleId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function deleteVehicle(
    token: string,
    communityId: string,
    vehicleId: string,
): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(
        `/communities/${communityId}/vehicles/${vehicleId}`,
        {
            method: 'DELETE',
        },
        token,
        communityId,
    );
}
