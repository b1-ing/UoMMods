import { Course } from './types';

// If process.env.APP_HOME_URL is undefined on the client, fall back to ""
const BASE = process.env.NEXT_PUBLIC_APP_HOME_URL || process.env.APP_HOME_URL || "";

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new ApiError(res.status, text);
    }
    return res.json() as Promise<T>;
}

export async function fetchCoursesByProgram(
    programCode: string,
): Promise<Record<string, Course>> {
    const data = await apiFetch<Course[]>(
        `/api/courses?programCode=${encodeURIComponent(programCode)}`,
    );
    const map: Record<string, Course> = {};
    for (const course of data) {
        if (course?.code) map[course.code] = course;
    }
    return map;
}

export async function fetchCourseByCode(code: string): Promise<Course> {
    return apiFetch<Course>(`/api/courses?courseCode=${encodeURIComponent(code)}`);
}

export interface SessionUser {
    username: string;
    fullname: string;
}

export interface SessionResponse {
    auth: boolean;
    user: SessionUser | null;
}

export async function fetchSession(): Promise<SessionResponse> {
    return apiFetch<SessionResponse>('/api/session');
}
