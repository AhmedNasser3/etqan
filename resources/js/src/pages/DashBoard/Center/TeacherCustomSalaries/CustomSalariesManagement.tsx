import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    useTeacherCustomSalaries,
    CustomSalaryItem,
    CustomSalaryStats,
} from "./hooks/useTeacherCustomSalaries";
import CreateCustomSalaryModal from "./models/CreateCustomSalaryModal";
import UpdateCustomSalaryModal from "./models/UpdateCustomSalaryModal";
import { ICO } from "../../icons";
import { useToast } from "../../../../../contexts/ToastContext";
import {
    CURRENCIES,
    CurrencyCode,
    formatCurrency,
} from "../SalaryRules/SalaryRulesManagement";

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

const CustomSalariesManagement: React.FC = () => {
    const {
        salaries: salariesFromHook,
        stats,
        loading,
        pagination,
        currentPage,
        goToPage,
        refetch,
        isEmpty,
    } = useTeacherCustomSalaries();

    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedSalaryId, setSelectedSalaryId] = useState<number | null>(
        null,
    );
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);
    const [salaries, setSalaries] = useState<CustomSalaryItem[]>([]);

    useEffect(() => {
        setSalaries(salariesFromHook);
    }, [salariesFromHook]);

    const filteredSalaries = salaries.filter(
        (salary) =>
            (
                salary.teacher?.user?.name ||
                salary.teacher?.name ||
                salary.user?.name ||
                ""
            )
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (salary.notes || "").toLowerCase().includes(search.toLowerCase()),
    );

    const { notifySuccess, notifyError } = useToast();

    const translateRole = (role: string | undefined): string => {
        if (!role) return "غير محدد";
        const roleTranslations: { [key: string]: string } = {
            teacher: "معلم",
            supervisor: "مشرف",
            motivator: "محفز",
            student_affairs: "شؤون الطلاب",
            financial: "مالي",
            admin: "مدير النظام",
            center_manager: "مدير المركز",
        };
        return roleTranslations[role.toLowerCase()] || role;
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleDelete = async (id: number) => {
        setConfirm({
            title: "حذف الراتب المخصص",
            desc: "هل أنت متأكد من حذف هذا الراتب المخصص؟ لا يمكن التراجع.",
            cb: async () => {
                try {
                    const csrfToken = document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content");

                    if (!csrfToken) {
                        notifyError("فشل في جلب رمز الحماية");
                        setConfirm(null);
                        return;
                    }

                    const response = await fetch(
                        `/api/v1/teacher/custom-salaries/${id}`,
                        {
                            method: "DELETE",
                            credentials: "include",
                            headers: {
                                Accept: "application/json",
                                "X-Requested-With": "XMLHttpRequest",
                                "X-CSRF-TOKEN": csrfToken,
                            },
                        },
                    );

                    const result = await response.json();

                    if (response.ok && result.success) {
                        notifySuccess("تم حذف الراتب المخصص بنجاح");
                        setSalaries((prev) => prev.filter((s) => s.id !== id));
                    } else {
                        notifyError(
                            result.message || "فشل في حذف الراتب المخصص",
                        );
                    }
                } catch (error: any) {
                    notifyError("حدث خطأ في الحذف");
                } finally {
                    setConfirm(null);
                }
            },
        });
    };

    const handleEdit = (salaryId: number) => {
        setSelectedSalaryId(salaryId);
        setShowUpdateModal(true);
    };

    const handleCloseCreateModal = () => setShowCreateModal(false);
    const handleCreateSuccess = () => {
        notifySuccess("تم إضافة الراتب المخصص بنجاح");
        refetch();
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedSalaryId(null);
    };
    const handleUpdateSuccess = () => {
        notifySuccess("تم تحديث الراتب المخصص بنجاح");
        refetch();
    };

    const handleAddNew = () => setShowCreateModal(true);

    if (loading) {
        return (
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="empty">
                        <p>جاري تحميل المرتبات المخصصة...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {showCreateModal && (
                <CreateCustomSalaryModal
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {showUpdateModal && selectedSalaryId && (
                <UpdateCustomSalaryModal
                    salaryId={selectedSalaryId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {confirm && (
                <div
                    className="conf-ov on"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="conf-box">
                        <div className="conf-ico">
                            <span
                                style={{
                                    width: 22,
                                    height: 22,
                                    display: "inline-flex",
                                    color: "var(--red)",
                                }}
                            >
                                {ICO.trash}
                            </span>
                        </div>
                        <div className="conf-t">{confirm.title}</div>
                        <div className="conf-d">
                            {confirm.desc ||
                                "هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع."}
                        </div>
                        <div className="conf-acts">
                            <button className="btn bd" onClick={confirm.cb}>
                                تأكيد
                            </button>
                            <button
                                className="btn bs"
                                onClick={() => setConfirm(null)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">المرتبات المخصصة</div>
                        <div className="flx">
                            <input
                                className="fi"
                                style={{ margin: "0 6px" }}
                                placeholder="البحث بالمعلم أو الملاحظات..."
                                value={search}
                                onChange={handleSearch}
                            />
                            <button
                                className="btn bp bsm"
                                onClick={handleAddNew}
                            >
                                + راتب مخصص جديد
                            </button>
                        </div>
                    </div>

                    {/* الإحصائيات */}
                    <div className="wh" style={{ marginBottom: "20px" }}>
                        <div
                            style={{
                                display: "flex",
                                gap: "15px",
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    padding: "15px 20px",
                                    background: "var(--g50)",
                                    borderRadius: "8px",
                                    border: "1px solid var(--g200)",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "var(--g600)",
                                        marginBottom: "5px",
                                    }}
                                >
                                    إجمالي المرتبات المخصصة
                                </div>
                                <div
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: "bold",
                                        color: "var(--purple)",
                                    }}
                                >
                                    {stats.total_custom || 0}
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: "15px 20px",
                                    background: "#f0fdf4",
                                    borderRadius: "8px",
                                    border: "1px solid #bbf7d0",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#166534",
                                        marginBottom: "5px",
                                    }}
                                >
                                    المرتبات النشطة
                                </div>
                                <div
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: "bold",
                                        color: "#15803d",
                                    }}
                                >
                                    {stats.active_custom || 0}
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: "15px 20px",
                                    background: "#eff6ff",
                                    borderRadius: "8px",
                                    border: "1px solid #bfdbfe",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#1e40af",
                                        marginBottom: "5px",
                                    }}
                                >
                                    عدد المعلمين في المركز
                                </div>
                                <div
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: "bold",
                                        color: "#1d4ed8",
                                    }}
                                >
                                    {stats.your_center_teachers_count || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>المعلم</th>
                                    <th>الراتب المخصص</th>
                                    <th>العملة</th>
                                    <th>الدور</th>
                                    <th>الحالة</th>
                                    <th>الملاحظات</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalaries.length > 0 ? (
                                    filteredSalaries.map((salary) => {
                                        const currency =
                                            (salary.currency as CurrencyCode) ||
                                            "SAR";
                                        return (
                                            <tr key={salary.id}>
                                                <td style={{ fontWeight: 700 }}>
                                                    {salary.teacher?.user
                                                        ?.name ||
                                                        salary.teacher?.name ||
                                                        salary.user?.name ||
                                                        "غير محدد"}
                                                </td>
                                                <td
                                                    style={{
                                                        fontWeight: 600,
                                                        color: "var(--green)",
                                                    }}
                                                >
                                                    {formatCurrency(
                                                        Number(
                                                            salary.custom_base_salary,
                                                        ),
                                                        currency,
                                                    )}
                                                </td>
                                                <td>
                                                    <span
                                                        className="badge px-2 py-1 rounded-full text-xs font-medium"
                                                        style={{
                                                            background:
                                                                "var(--n100)",
                                                            color: "var(--n700)",
                                                        }}
                                                    >
                                                        {CURRENCIES[currency]
                                                            ?.symbol ||
                                                            currency}
                                                    </span>
                                                </td>
                                                <td>
                                                    {translateRole(
                                                        salary.teacher?.role,
                                                    )}
                                                </td>
                                                <td>
                                                    <span
                                                        className="badge px-2 py-1 rounded-full text-xs font-medium"
                                                        style={
                                                            salary.is_active
                                                                ? {
                                                                      background:
                                                                          "var(--g100)",
                                                                      color: "var(--g700)",
                                                                  }
                                                                : {
                                                                      background:
                                                                          "var(--n100)",
                                                                      color: "var(--n500)",
                                                                  }
                                                        }
                                                    >
                                                        {salary.is_active
                                                            ? "نشط"
                                                            : "غير نشط"}
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        maxWidth: "150px",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {salary.notes || "لا يوجد"}
                                                </td>
                                                <td>
                                                    <div className="td-actions">
                                                        <button
                                                            className="btn bd bxs"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    salary.id,
                                                                )
                                                            }
                                                        >
                                                            حذف
                                                        </button>
                                                        <button
                                                            className="btn bs bxs"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    salary.id,
                                                                )
                                                            }
                                                        >
                                                            تعديل
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : !loading ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="empty">
                                                <p>
                                                    {search
                                                        ? "لا توجد نتائج للبحث"
                                                        : "لا توجد مرتبات مخصصة"}
                                                </p>
                                                <button
                                                    className="btn bp bsm"
                                                    onClick={handleAddNew}
                                                >
                                                    إضافة راتب مخصص
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.last_page > 1 && (
                        <div
                            className="wh"
                            style={{ marginTop: "20px", padding: "15px" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "14px",
                                        color: "var(--n500)",
                                    }}
                                >
                                    عرض {filteredSalaries.length} من{" "}
                                    {pagination.total || 0} راتب مخصص • الصفحة{" "}
                                    <strong>{currentPage}</strong> من{" "}
                                    <strong>{pagination.last_page}</strong>
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        className="btn bd"
                                        onClick={() =>
                                            goToPage(currentPage - 1)
                                        }
                                        disabled={currentPage <= 1}
                                        style={{
                                            opacity: currentPage <= 1 ? 0.5 : 1,
                                            cursor:
                                                currentPage <= 1
                                                    ? "not-allowed"
                                                    : "pointer",
                                        }}
                                    >
                                        السابق
                                    </button>
                                    <span
                                        style={{
                                            padding: "8px 12px",
                                            background: "var(--purple)",
                                            color: "white",
                                            borderRadius: "6px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {currentPage}
                                    </span>
                                    <button
                                        className="btn bd"
                                        onClick={() =>
                                            goToPage(currentPage + 1)
                                        }
                                        disabled={
                                            currentPage >= pagination.last_page
                                        }
                                        style={{
                                            opacity:
                                                currentPage >=
                                                pagination.last_page
                                                    ? 0.5
                                                    : 1,
                                            cursor:
                                                currentPage >=
                                                pagination.last_page
                                                    ? "not-allowed"
                                                    : "pointer",
                                        }}
                                    >
                                        التالي
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CustomSalariesManagement;
