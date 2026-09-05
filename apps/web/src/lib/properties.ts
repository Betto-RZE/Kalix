import { fetchApi } from './api';

export enum PropertyStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    MAINTENANCE = 'MAINTENANCE',
}

export enum PropertyMemberType {
    OWNER = 'OWNER',
    RESIDENT = 'RESIDENT',
}

export enum VehicleType {
    CAR = 'CAR',
    MOTORCYCLE = 'MOTORCYCLE',
    TRUCK = 'TRUCK',
    OTHER = 'OTHER',
}

export interface PropertyUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
}

export interface PropertyMember {
    id: string;
    propertyId: string;
    userId: string;
    type: PropertyMemberType;
    isPrimary: boolean;
    user: PropertyUser;
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
    user?: PropertyUser;
}

export interface Property {
    id: string;
    communityId: string;
    sectionId: string;
    number: string;
    address?: string;
    status: PropertyStatus;
    createdAt: string;
    updatedAt: string;
    section: {
        id: string;
        name: string;
    };
    members?: PropertyMember[];
    vehicles?: Vehicle[];
    _count?: {
        vehicles: number;
        members: number;
    };
}

export interface CreatePropertyInput {
    sectionId: string;
    number: string;
    address?: string;
    status?: PropertyStatus;
}

export interface AssignMemberInput {
    userId: string;
    type: PropertyMemberType;
    isPrimary?: boolean;
}

export interface CreateVehicleInput {
    propertyId: string;
    userId: string;
    brand: string;
    model: string;
    color: string;
    licensePlate: string;
    type?: VehicleType;
}

export async function getProperties(
    token: string,
    communityId: string,
    sectionId?: string,
): Promise<Property[]> {
    const query = sectionId ? `?sectionId=${sectionId}` : '';
    return fetchApi<Property[]>(`/communities/${communityId}/properties${query}`, {}, token, communityId);
}

export async function createProperty(
    token: string,
    communityId: string,
    data: CreatePropertyInput,
): Promise<Property> {
    return fetchApi<Property>(
        `/communities/${communityId}/properties`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function updateProperty(
    token: string,
    communityId: string,
    propertyId: string,
    data: Partial<CreatePropertyInput>,
): Promise<Property> {
    return fetchApi<Property>(
        `/communities/${communityId}/properties/${propertyId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function deleteProperty(
    token: string,
    communityId: string,
    propertyId: string,
): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(
        `/communities/${communityId}/properties/${propertyId}`,
        {
            method: 'DELETE',
        },
        token,
        communityId,
    );
}

export async function assignPropertyMember(
    token: string,
    communityId: string,
    propertyId: string,
    data: AssignMemberInput,
): Promise<PropertyMember> {
    return fetchApi<PropertyMember>(
        `/communities/${communityId}/properties/${propertyId}/members`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function removePropertyMember(
    token: string,
    communityId: string,
    propertyId: string,
    memberId: string,
): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(
        `/communities/${communityId}/properties/${propertyId}/members/${memberId}`,
        {
            method: 'DELETE',
        },
        token,
        communityId,
    );
}

export async function getVehicles(
    token: string,
    communityId: string,
    propertyId?: string,
): Promise<Vehicle[]> {
    const query = propertyId ? `?propertyId=${propertyId}` : '';
    return fetchApi<Vehicle[]>(`/communities/${communityId}/vehicles${query}`, {}, token, communityId);
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
