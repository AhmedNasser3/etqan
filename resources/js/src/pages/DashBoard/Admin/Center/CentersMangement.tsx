import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useImpersonate } from "./hooks/useImpersonate";

interface Center {
    id: number;
    circleName: string;
    managerEmail: string;
    managerPhone: string;
    domain: string;
    circleLink: string;
    logo: string | null;
    is_active: boolean;
    created_at: string;
}

const CentersManagement: React.FC = () => {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<
        "all" | "active" | "inactive"
    >("all");
    const { enterCenter, loading: impersonateLoading } = useImpersonate();

    const fetchCenters = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/v1/centers/all");

            const mapped = (res.data.data || res.data).map((c: any) => ({
                id: c.id,
                circleName: c.circleName || c.name,
                managerEmail: c.managerEmail || c.email,
                managerPhone: c.managerPhone || c.phone || "",
                domain: c.domain || c.subdomain, // ✅ يقبل الاتنين
                circleLink: `/${c.domain || c.subdomain}/center-dashboard`,
                logo: c.logo || null,
                is_active: c.is_active,
                created_at: c.created_at,
            }));

            setCenters(mapped);
        } catch (e) {
            console.error(e);
            toast.error("فشل تحميل المجمعات");
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (center: Center) => {
        const endpoint = center.is_active
            ? `/api/v1/centers/${center.id}/deactivate`
            : `/api/v1/centers/${center.id}/activate`;
        try {
            await axios.post(endpoint);
            toast.success(
                center.is_active ? "تم إيقاف المجمع" : "تم تفعيل المجمع",
            );
            fetchCenters();
        } catch (e) {
            toast.error("فشلت العملية");
        }
    };

    const filtered = centers
        .filter((c) => {
            const q = search.toLowerCase();
            return (
                c.circleName?.toLowerCase().includes(q) ||
                c.domain?.toLowerCase().includes(q) ||
                c.managerEmail?.toLowerCase().includes(q)
            );
        })
        .filter((c) => {
            if (filterStatus === "active") return c.is_active;
            if (filterStatus === "inactive") return !c.is_active;
            return true;
        });

    const activeCount = centers.filter((c) => c.is_active).length;

    const initials = (name: string) =>
        name
            ?.split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("") ?? "?";

    useEffect(() => {
        fetchCenters();
    }, []);

    return (
        <div className="content" id="contentArea" style={{ direction: "rtl" }}>
            {/* إحصائيات */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
                    gap: 10,
                    marginBottom: 20,
                }}
            >
                {[
                    { label: "إجمالي المجمعات", val: centers.length },
                    { label: "النشطة", val: activeCount },
                    { label: "الموقوفة", val: centers.length - activeCount },
                ].map((s) => (
                    <div
                        key={s.label}
                        style={{
                            background:
                                "var(--color-background-secondary,#f5f5f5)",
                            borderRadius: 8,
                            padding: "12px 14px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                color: "#888",
                                marginBottom: 4,
                            }}
                        >
                            {s.label}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 500 }}>
                            {s.val}
                        </div>
                    </div>
                ))}
            </div>

            <div className="widget">
                <div className="wh">
                    <div className="wh-l">إدارة المجمعات</div>
                    <div className="flx" style={{ gap: 8, flexWrap: "wrap" }}>
                        <input
                            className="fi"
                            placeholder="بحث بالاسم أو الدومين..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) =>
                                setFilterStatus(e.target.value as any)
                            }
                            style={{
                                padding: "6px 10px",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                fontSize: 13,
                            }}
                        >
                            <option value="all">الكل</option>
                            <option value="active">النشطة</option>
                            <option value="inactive">الموقوفة</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 13,
                        }}
                    >
                        <thead>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                {[
                                    "المجمع",
                                    "الدومين",
                                    "البريد",
                                    "الجوال",
                                    "الحالة",
                                    "إجراءات",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: "10px 8px",
                                            textAlign: "right",
                                            fontWeight: 500,
                                            color: "#666",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{
                                            textAlign: "center",
                                            padding: 40,
                                            color: "#aaa",
                                        }}
                                    >
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{
                                            textAlign: "center",
                                            padding: 40,
                                            color: "#aaa",
                                        }}
                                    >
                                        لا توجد نتائج
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr
                                        key={c.id}
                                        style={{
                                            borderBottom: "0.5px solid #f0f0f0",
                                            opacity: c.is_active ? 1 : 0.6,
                                        }}
                                    >
                                        {/* المجمع */}
                                        <td style={{ padding: "10px 8px" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                {c.logo ? (
                                                    <img
                                                        src={c.logo}
                                                        alt=""
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: "50%",
                                                            background:
                                                                "#EEEDFE",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: 11,
                                                            fontWeight: 500,
                                                            color: "#534AB7",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {initials(c.circleName)}
                                                    </div>
                                                )}
                                                <span
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    {c.circleName}
                                                </span>
                                            </div>
                                        </td>

                                        {/* الدومين */}
                                        <td style={{ padding: "10px 8px" }}>
                                            <span
                                                style={{
                                                    fontFamily: "monospace",
                                                    fontSize: 12,
                                                    color: "#185FA5",
                                                }}
                                            >
                                                {c.domain}
                                            </span>
                                        </td>

                                        {/* البريد */}
                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                fontSize: 12,
                                                color: "#555",
                                            }}
                                        >
                                            {c.managerEmail}
                                        </td>

                                        {/* الجوال */}
                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                fontSize: 12,
                                            }}
                                        >
                                            {c.managerPhone}
                                        </td>

                                        {/* الحالة */}
                                        <td style={{ padding: "10px 8px" }}>
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    padding: "2px 8px",
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    background: c.is_active
                                                        ? "#EAF3DE"
                                                        : "#FCEBEB",
                                                    color: c.is_active
                                                        ? "#3B6D11"
                                                        : "#A32D2D",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background: c.is_active
                                                            ? "#639922"
                                                            : "#E24B4A",
                                                    }}
                                                />
                                                {c.is_active ? "نشط" : "موقوف"}
                                            </span>
                                        </td>

                                        {/* إجراءات */}
                                        <td style={{ padding: "10px 8px" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 5,
                                                }}
                                            >
                                                {/* ✅ زر الدخول - بيبعت الـ domain */}
                                                <button
                                                    onClick={() =>
                                                        enterCenter(
                                                            c.id,
                                                            c.circleName,
                                                            c.domain,
                                                        )
                                                    }
                                                    disabled={
                                                        impersonateLoading
                                                    }
                                                    style={{
                                                        padding: "5px 12px",
                                                        borderRadius: 6,
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                        border: "0.5px solid #185FA5",
                                                        background: "#E6F1FB",
                                                        color: "#0C447C",
                                                        cursor: "pointer",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {impersonateLoading
                                                        ? "..."
                                                        : "دخول ←"}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleActive(c)
                                                    }
                                                    style={{
                                                        padding: "5px 10px",
                                                        borderRadius: 6,
                                                        fontSize: 11,
                                                        border: "0.5px solid #ddd",
                                                        background: "#f9f9f9",
                                                        color: "#555",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {c.is_active
                                                        ? "إيقاف"
                                                        : "تفعيل"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CentersManagement;
