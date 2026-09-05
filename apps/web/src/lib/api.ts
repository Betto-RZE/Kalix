const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null,
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
    }

    return data as T;
}
