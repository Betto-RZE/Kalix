import { fetchApi } from './api';

export interface Expense {
    id: string;
    communityId: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    supplier?: string;
    receiptUrl?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExpenseInput {
    category: string;
    description: string;
    amount: number;
    date: string;
    supplier?: string;
    receiptUrl?: string;
}

export interface QueryExpenseInput {
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export async function getExpenses(
    token: string,
    communityId: string,
    query?: QueryExpenseInput,
): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (query?.category) params.append('category', query.category);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.search) params.append('search', query.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Expense[]>(`/communities/${communityId}/expenses${queryString}`, {}, token, communityId);
}

export async function createExpense(
    token: string,
    communityId: string,
    data: CreateExpenseInput,
): Promise<Expense> {
    return fetchApi<Expense>(
        `/communities/${communityId}/expenses`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function updateExpense(
    token: string,
    communityId: string,
    expenseId: string,
    data: Partial<CreateExpenseInput>,
): Promise<Expense> {
    return fetchApi<Expense>(
        `/communities/${communityId}/expenses/${expenseId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function deleteExpense(
    token: string,
    communityId: string,
    expenseId: string,
): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(
        `/communities/${communityId}/expenses/${expenseId}`,
        {
            method: 'DELETE',
        },
        token,
        communityId,
    );
}
