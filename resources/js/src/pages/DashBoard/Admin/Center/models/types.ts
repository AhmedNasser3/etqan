export interface Center {
    id: number;
    circleName: string;
    managerName: string;
    managerEmail: string;
    managerPhone: string;
    circleLink: string;
    domain: string;
    logo: string;
    countryCode: string;
    is_active: boolean;
    students_count: number;
    address?: string;
    created_at?: string;
    hosting_provider?: string;
}
