import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MosquesManagement from "../mosque/MosquesManagement";
import CirclesManagement from "../../Center/Circles/CirclesManagement";
import StudentAffairs from "../../Supervisors/Students/StudentsAffairs";

import { ToastProvider } from "../../../../../contexts/ToastContext";
type Tab = "circles" | "students";

interface PortalData {
    mosque_id: number;
    mosque_name: string;
    center_id: number;
    center_name: string;
}

const TABS = [
    { key: "circles" as Tab, label: "الحلقات", icon: "📚" },
    { key: "students" as Tab, label: "الطلاب", icon: "👤" },
];

const PortalDashboardInner: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [activeTab, setActiveTab] = useState<Tab>("circles");
    const [portalData, setPortalData] = useState<PortalData | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">(
        "loading",
    );
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMsg("رابط غير صحيح");
            return;
        }
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const res = await fetch(`/api/v1/portal/validate/${token}`, {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                setStatus("error");
                setErrorMsg(json.message ?? "رابط غير صحيح");
                return;
            }

            const data: PortalData = json.data;
            setPortalData(data);

            // ── حقن الـ center_id في window عشان كل الـ hooks تلاقيه ──
            (window as any).__PORTAL_CENTER_ID__ = data.center_id;
            (window as any).__PORTAL_MOSQUE_ID__ = data.mosque_id;

            setStatus("ready");
        } catch {
            setStatus("error");
            setErrorMsg("حدث خطأ في الاتصال");
        }
    };

    if (status === "loading")
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        border: "3px solid var(--color-border-tertiary)",
                        borderTop: "3px solid var(--color-text-info)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                >
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            </div>
        );

    if (status === "error")
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    direction: "rtl",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                    <h2 style={{ fontWeight: 500, marginBottom: 8 }}>
                        {errorMsg}
                    </h2>
                    <p style={{ color: "var(--color-text-secondary)" }}>
                        تواصل مع المسؤول للحصول على رابط صحيح
                    </p>
                </div>
            </div>
        );

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--color-background-tertiary)",
                direction: "rtl",
            }}
        >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <header
                style={{
                    background: "var(--color-background-primary)",
                    borderBottom: "1px solid var(--color-border-tertiary)",
                    padding: "0 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 60,
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>🕌</span>
                    <div>
                        <div style={{ fontWeight: 500, fontSize: 15 }}>
                            {portalData?.mosque_name}
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {portalData?.center_name}
                        </div>
                    </div>
                </div>

                <nav style={{ display: "flex", gap: 4 }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: "6px 16px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                fontSize: 14,
                                fontWeight: activeTab === tab.key ? 500 : 400,
                                background:
                                    activeTab === tab.key
                                        ? "var(--color-background-info)"
                                        : "transparent",
                                color:
                                    activeTab === tab.key
                                        ? "var(--color-text-info)"
                                        : "var(--color-text-secondary)",
                                transition: "all 0.15s",
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>

                <div style={{ width: 60 }} />
            </header>

            {/* ── Content ──────────────────────────────────────────────────── */}
            <main style={{ padding: "24px" }}>
                {activeTab === "circles" && <CirclesManagement />}
                {activeTab === "students" && <StudentAffairs />}
            </main>
        </div>
    );
};

const PortalDashboard: React.FC = () => (
    <ToastProvider>
        <PortalDashboardInner />
    </ToastProvider>
);

export default PortalDashboard;
