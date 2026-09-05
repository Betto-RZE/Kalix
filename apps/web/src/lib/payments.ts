import { fetchApi } from './api';

export enum PaymentMethod {
    CASH = 'CASH',
    TRANSFER = 'TRANSFER',
    CARD = 'CARD',
    OTHER = 'OTHER',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface PaymentFee {
    id: string;
    concept: string;
    amount: number;
    dueDate: string;
    status: string;
    property: {
        id: string;
        number: string;
        section?: {
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
    };
}

export interface Payment {
    id: string;
    feeId: string;
    amount: number;
    paymentDate: string;
    method: PaymentMethod;
    reference?: string;
    status: PaymentStatus;
    receiptUrl?: string;
    registeredBy?: string;
    createdAt: string;
    fee: PaymentFee;
}

export interface CreatePaymentInput {
    feeId: string;
    amount: number;
    paymentDate?: string;
    method: PaymentMethod;
    reference?: string;
    status?: PaymentStatus;
    receiptUrl?: string;
}

export interface UpdatePaymentStatusInput {
    status: PaymentStatus;
}

export interface QueryPaymentInput {
    feeId?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    search?: string;
}

export async function getPayments(
    token: string,
    communityId: string,
    query?: QueryPaymentInput,
): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (query?.feeId) params.append('feeId', query.feeId);
    if (query?.status) params.append('status', query.status);
    if (query?.method) params.append('method', query.method);
    if (query?.search) params.append('search', query.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Payment[]>(`/communities/${communityId}/payments${queryString}`, {}, token, communityId);
}

export async function createPayment(
    token: string,
    communityId: string,
    data: CreatePaymentInput,
): Promise<Payment> {
    return fetchApi<Payment>(
        `/communities/${communityId}/payments`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function updatePaymentStatus(
    token: string,
    communityId: string,
    paymentId: string,
    data: UpdatePaymentStatusInput,
): Promise<Payment> {
    return fetchApi<Payment>(
        `/communities/${communityId}/payments/${paymentId}/status`,
        {
            method: 'PATCH',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function deletePayment(
    token: string,
    communityId: string,
    paymentId: string,
): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(
        `/communities/${communityId}/payments/${paymentId}`,
        {
            method: 'DELETE',
        },
        token,
        communityId,
    );
}
