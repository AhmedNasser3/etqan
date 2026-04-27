import { useImpersonate } from "../../pages/DashBoard/Admin/Center/hooks/useImpersonate";

// ✅ عدّل الـ path حسب مكان الملف عندك

const ImpersonateBanner: React.FC = () => {
    const { getStatus, leaveCenter } = useImpersonate();
    const status = getStatus();

    if (!status.impersonating) return null;

    return (
        <div
            style={{
                background: "#FAEEDA",
                borderBottom: "1px solid #EF9F27",
                padding: "8px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                direction: "rtl",
                fontSize: 13,
                zIndex: 1000,
            }}
        >
            <span style={{ color: "#633806" }}>
                أنت تتصفح الآن كأدمن داخل مجمع:{" "}
                <strong>{status.center_name}</strong>{" "}
                <span style={{ opacity: 0.6, fontSize: 11 }}>
                    ({status.subdomain})
                </span>
            </span>
            <button
                onClick={leaveCenter}
                style={{
                    background: "#BA7517",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "5px 16px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 500,
                }}
            >
                خروج والرجوع للأدمن
            </button>
        </div>
    );
};

export default ImpersonateBanner;
