// types.ts
export interface Mosque {
    id: number;
    name: string;
    circle: string;
    circleId: number;
    supervisor: string;
    supervisorId: number | null;
    logo: string | null;
    is_active: boolean;
    created_at: string;
}

export interface UserOption {
    id: number;
    name: string;
    email: string;
}

export interface CenterOption {
    id: number;
    name: string;
    subdomain?: string;
}
