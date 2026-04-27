// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ToastItem {
    id: number;
    msg: string;
    type: "ok" | "err" | "warn";
}

interface ToastContextType {
    notifySuccess: (msg: string) => void;
    notifyError: (msg: string) => void;
    notifyWarning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = (msg: string, type: "ok" | "err" | "warn" = "ok") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    return (
        <ToastContext.Provider
            value={{
                notifySuccess: (msg: string) => addToast(msg, "ok"),
                notifyError: (msg: string) => addToast(msg, "err"),
                notifyWarning: (msg: string) => addToast(msg, "warn"),
            }}
        >
            {children}
            <div
                style={{
                    position: "fixed" as const,
                    bottom: 100,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: 8,
                    pointerEvents: "none" as const,
                    maxWidth: "90vw",
                }}
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        style={{
                            pointerEvents: "all" as const,
                            minWidth: "280px",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "white",
                            fontWeight: 500,
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            ...(t.type === "ok" && {
                                background:
                                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                            }),
                            ...(t.type === "err" && {
                                background:
                                    "linear-gradient(135deg, #621111bf 0%, #621111bf 100%)",
                            }),
                            ...(t.type === "warn" && {
                                background:
                                    "linear-gradient(135deg, #4B5563 0%, #374151 100%)",
                            }),
                        }}
                    >
                        <span
                            style={{
                                width: 16,
                                height: 16,
                                display: "inline-flex",
                                flexShrink: 0,
                                marginRight: "12px",
                                alignItems: "center",
                            }}
                        >
                            {t.type === "ok" ? (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                    width={16}
                                    height={16}
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : t.type === "err" ? (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    width={16}
                                    height={16}
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            ) : (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    width={16}
                                    height={16}
                                >
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            )}
                        </span>
                        <span>{t.msg}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
};
