import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface TokenData {
    mosque_id: number;
    mosque_name: string;
    center_id: number;
    center_name: string;
    is_used: boolean;
    expires_at: string;
}

type Status = "loading" | "valid" | "invalid" | "expired" | "error";

const PortalEntry: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>("loading");
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!token) {
            setStatus("invalid");
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
                if (res.status === 410) setStatus("expired");
                else setStatus("invalid");
                setError(json.message ?? "رابط غير صحيح");
                return;
            }

            setTokenData(json.data);
            setStatus("valid");

            // توجيه مباشر للـ dashboard مع الـ token
            setTimeout(() => {
                navigate(`/portal/dashboard/${token}`, { replace: true });
            }, 1000);
        } catch {
            setStatus("error");
            setError("حدث خطأ في الاتصال");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-background-tertiary)",
                direction: "rtl",
            }}
        >
            <div
                style={{
                    background: "var(--color-background-primary)",
                    borderRadius: 16,
                    padding: "48px 40px",
                    maxWidth: 440,
                    width: "90%",
                    textAlign: "center",
                    border: "1px solid var(--color-border-tertiary)",
                }}
            >
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "var(--color-background-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        fontSize: 28,
                    }}
                >
                    🕌
                </div>

                {status === "loading" && (
                    <>
                        <h2
                            style={{
                                fontWeight: 500,
                                fontSize: 20,
                                marginBottom: 16,
                            }}
                        >
                            جاري التحقق من الرابط...
                        </h2>
                        <Spinner />
                    </>
                )}

                {status === "valid" && tokenData && (
                    <>
                        <h2
                            style={{
                                fontWeight: 500,
                                fontSize: 20,
                                marginBottom: 8,
                            }}
                        >
                            أهلاً بك في بوابة
                        </h2>
                        <h3
                            style={{
                                fontWeight: 500,
                                fontSize: 24,
                                color: "var(--color-text-info)",
                                marginBottom: 16,
                            }}
                        >
                            {tokenData.mosque_name}
                        </h3>
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                fontSize: 14,
                                marginBottom: 16,
                            }}
                        >
                            جاري التوجيه...
                        </p>
                        <Spinner />
                    </>
                )}

                {status === "expired" && (
                    <>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>⏰</div>
                        <h2
                            style={{
                                fontWeight: 500,
                                fontSize: 20,
                                marginBottom: 8,
                                color: "var(--color-text-warning)",
                            }}
                        >
                            انتهت صلاحية الرابط
                        </h2>
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                fontSize: 14,
                            }}
                        >
                            تواصل مع المسؤول للحصول على رابط جديد
                        </p>
                    </>
                )}

                {status === "invalid" && (
                    <>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
                        <h2
                            style={{
                                fontWeight: 500,
                                fontSize: 20,
                                marginBottom: 8,
                                color: "var(--color-text-danger)",
                            }}
                        >
                            رابط غير صحيح
                        </h2>
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                fontSize: 14,
                            }}
                        >
                            {error || "تأكد من الرابط وحاول مرة أخرى"}
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
                        <h2
                            style={{
                                fontWeight: 500,
                                fontSize: 20,
                                marginBottom: 8,
                                color: "var(--color-text-danger)",
                            }}
                        >
                            حدث خطأ
                        </h2>
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                fontSize: 14,
                                marginBottom: 24,
                            }}
                        >
                            {error}
                        </p>
                        <button
                            onClick={validateToken}
                            style={{
                                background: "var(--color-background-info)",
                                color: "var(--color-text-info)",
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 24px",
                                fontSize: 14,
                                cursor: "pointer",
                            }}
                        >
                            إعادة المحاولة
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const Spinner: React.FC = () => (
    <div
        style={{
            width: 32,
            height: 32,
            border: "3px solid var(--color-border-tertiary)",
            borderTop: "3px solid var(--color-text-info)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "16px auto",
        }}
    >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

export default PortalEntry;
