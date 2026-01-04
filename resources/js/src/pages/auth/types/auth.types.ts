export type AuthRole = "student" | "parent" | "admin";

export interface LoginFormData {
    email?: string;
    phone?: string;
    role: AuthRole;
}

export interface OtpFormData {
    otp: string;
}
