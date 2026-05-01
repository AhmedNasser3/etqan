import { useState } from "react";
import toast from "react-hot-toast";
import { useCenters, Center } from "./hooks/useCenters";

const CentersManagement = () => {
    const { centers, loading, error, refetch, stats, apiFetch } = useCenters();
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<
        "all" | "active" | "inactive"
    >("all");
    const [busyCenterId, setBusyCenterId] = useState<number | null>(null);
    const [enteringCenterId, setEnteringCenterId] = useState<number | null>(
        null,
    );

    const toggleActive = async (center: Center) => {
        const endpoint = center.is_active
            ? `/api/v1/centers/${center.id}/deactivate`
            : `/api/v1/centers/${center.id}/activate`;

        setBusyCenterId(center.id);

        try {
            await apiFetch(endpoint, { method: "POST" });
            toast.success(
                center.is_active ? "تم إيقاف المجمع" : "تم تفعيل المجمع",
            );
            refetch();
        } catch (err) {
            console.error(err);
            toast.error("فشلت العملية");
        } finally {
            setBusyCenterId(null);
        }
    };

    const enterCenter = async (center: Center) => {
        setEnteringCenterId(center.id);

        try {
            const result = await apiFetch(
                `/api/admin/centers/${center.id}/visit`,
                {
                    method: "POST",
                },
            );

            if (!result?.success) {
                throw new Error(result?.message || "فشل تحديث center_id");
            }

            toast.success("تم تحديد المجمع الحالي");

            const redirectUrl =
                result?.data?.redirect_url ||
                center.circleLink ||
                `/${center.domain}/center-dashboard`;

            window.location.assign(redirectUrl);
        } catch (err) {
            console.error(err);
            toast.error("تعذر الدخول إلى المجمع");
            setEnteringCenterId(null);
        }
    };

    const filtered = centers
        .filter((center) => {
            const normalizedQuery = search.trim().toLowerCase();

            if (!normalizedQuery) return true;

            return (
                center.circleName?.toLowerCase().includes(normalizedQuery) ||
                center.domain?.toLowerCase().includes(normalizedQuery) ||
                center.managerEmail?.toLowerCase().includes(normalizedQuery) ||
                center.managerPhone?.includes(normalizedQuery) ||
                center.manager_name?.toLowerCase().includes(normalizedQuery)
            );
        })
        .filter((center) => {
            if (filterStatus === "active") return center.is_active;
            if (filterStatus === "inactive") return !center.is_active;
            return true;
        });

    const initials = (name: string) =>
        name
            ?.split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("") ?? "?";

    return (
        <div className="content" id="contentArea" style={{ direction: "rtl" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                    gap: 10,
                    marginBottom: 20,
                }}
            >
                {[
                    { label: "إجمالي المجمعات", val: stats.total },
                    { label: "النشطة", val: stats.active },
                    { label: "الموقوفة", val: stats.inactive },
                ].map((item) => (
                    <div
                        key={item.label}
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
                            {item.label}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 500 }}>
                            {item.val}
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
                            placeholder="بحث بالاسم أو الدومين أو البريد..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />

                        <select
                            value={filterStatus}
                            onChange={(event) =>
                                setFilterStatus(
                                    event.target.value as
                                        | "all"
                                        | "active"
                                        | "inactive",
                                )
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

                        <button
                            onClick={refetch}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                background: "#fff",
                                cursor: "pointer",
                                fontSize: 12,
                            }}
                            type="button"
                        >
                            تحديث
                        </button>
                    </div>
                </div>

                {error && (
                    <div
                        style={{
                            margin: "0 0 12px",
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: "#FCEBEB",
                            color: "#A32D2D",
                            fontSize: 12,
                        }}
                    >
                        {error}
                    </div>
                )}

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
                                ].map((header) => (
                                    <th
                                        key={header}
                                        style={{
                                            padding: "10px 8px",
                                            textAlign: "right",
                                            fontWeight: 500,
                                            color: "#666",
                                        }}
                                    >
                                        {header}
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
                                        جاري تحميل المجمعات...
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
                                        لا توجد مجمعات مطابقة حالياً
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((center) => (
                                    <tr
                                        key={center.id}
                                        style={{
                                            borderBottom: "0.5px solid #f0f0f0",
                                            opacity: center.is_active ? 1 : 0.6,
                                        }}
                                    >
                                        <td style={{ padding: "10px 8px" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                {center.logo ? (
                                                    <img
                                                        src={center.logo}
                                                        alt={center.circleName}
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
                                                        {initials(
                                                            center.circleName,
                                                        )}
                                                    </div>
                                                )}

                                                <span
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    {center.circleName}
                                                </span>
                                            </div>
                                        </td>

                                        <td style={{ padding: "10px 8px" }}>
                                            <span
                                                style={{
                                                    fontFamily: "monospace",
                                                    fontSize: 12,
                                                    color: "#185FA5",
                                                }}
                                            >
                                                {center.domain}
                                            </span>
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                fontSize: 12,
                                                color: "#555",
                                            }}
                                        >
                                            {center.managerEmail}
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                fontSize: 12,
                                            }}
                                        >
                                            {center.managerPhone}
                                        </td>

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
                                                    background: center.is_active
                                                        ? "#EAF3DE"
                                                        : "#FCEBEB",
                                                    color: center.is_active
                                                        ? "#3B6D11"
                                                        : "#A32D2D",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background:
                                                            center.is_active
                                                                ? "#639922"
                                                                : "#E24B4A",
                                                    }}
                                                />
                                                {center.is_active
                                                    ? "نشط"
                                                    : "موقوف"}
                                            </span>
                                        </td>

                                        <td style={{ padding: "10px 8px" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 5,
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        enterCenter(center)
                                                    }
                                                    disabled={
                                                        enteringCenterId ===
                                                        center.id
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
                                                    type="button"
                                                >
                                                    {enteringCenterId ===
                                                    center.id
                                                        ? "..."
                                                        : "دخول ←"}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleActive(center)
                                                    }
                                                    disabled={
                                                        busyCenterId ===
                                                        center.id
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
                                                    type="button"
                                                >
                                                    {busyCenterId === center.id
                                                        ? "..."
                                                        : center.is_active
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
