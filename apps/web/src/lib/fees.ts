import { fetchApi } from './api';

export enum FeeStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export interface FeeProperty {
    id: string;
    number: string;
    section: {
        id: string;
        name: string;
    };
    members?: Array<{
        user: {
            firstName: string;
            lastName: string;
            email: string;
        };
    }>;
}

export interface Fee {
    id: string;
    propertyId: string;
    concept: string;
    amount: number;
    dueDate: string;
    status: FeeStatus;
    createdAt: string;
    updatedAt: string;
    property: FeeProperty;
    payments?: any[];
}

export interface CreateFeeInput {
    propertyId: string;
    concept: string;
    amount: number;
    dueDate: string;
    status?: FeeStatus;
}

export interface CreateBulkFeeInput {
    sectionId?: string;
    concept: string;
    amount: number;
    dueDate: string;
}

export interface QueryFeeInput {
    propertyId?: string;
    sectionId?: string;
    status?: FeeStatus;
    search?: string;
}

export async function getFees(
    token: string,
    communityId: string,
    query?: QueryFeeInput,
): Promise<Fee[]> {
    const params = new URLSearchParams();
    if (query?.propertyId) params.append('propertyId', query.propertyId);
    if (query?.sectionId) params.append('sectionId', query.sectionId);
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Fee[]>(`/communities/${communityId}/fees${queryString}`, {}, token, communityId);
}

export async function createFee(
    token: string,
    communityId: string,
    data: CreateFeeInput,
): Promise<Fee> {
    return fetchApi<Fee>(
        `/communities/${communityId}/fees`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function createBulkFees(
    token: string,
    communityId: string,
    data: CreateBulkFeeInput,
): Promise<{ message: string; count: number }> {
    return fetchApi<{ message: string; count: number }>(
        `/communities/${communityId}/fees/bulk`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function updateFee(
    token: string,
    communityId: string,
    feeId: string,
    data: Partial<CreateFeeInput>,
): Promise<Fee> {
    return fetchApi<Fee>(
        `/communities/${communityId}/fees/${feeId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function deleteFee(
    token: string,
    communityId: string,
    feeId: string,
): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(
        `/communities/${communityId}/fees/${feeId}`,
        {
            method: 'DELETE',
        },
        token,
        communityId,
    );
}
