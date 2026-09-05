import { fetchApi } from './api';

export interface Section {
    id: string;
    communityId: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        properties: number;
    };
}

export interface CreateSectionInput {
    name: string;
    description?: string;
}

export interface UpdateSectionInput {
    name?: string;
    description?: string;
}

export async function getSections(token: string, communityId: string): Promise<Section[]> {
    return fetchApi<Section[]>(`/communities/${communityId}/sections`, {}, token, communityId);
}

export async function createSection(
    token: string,
    communityId: string,
    data: CreateSectionInput,
): Promise<Section> {
    return fetchApi<Section>(
        `/communities/${communityId}/sections`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function updateSection(
    token: string,
    communityId: string,
    sectionId: string,
    data: UpdateSectionInput,
): Promise<Section> {
    return fetchApi<Section>(
        `/communities/${communityId}/sections/${sectionId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(data),
        },
        token,
        communityId,
    );
}

export async function deleteSection(
    token: string,
    communityId: string,
    sectionId: string,
): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(
        `/communities/${communityId}/sections/${sectionId}`,
        {
            method: 'DELETE',
        },
        token,
        communityId,
    );
}
