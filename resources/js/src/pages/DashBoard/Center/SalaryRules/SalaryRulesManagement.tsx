// SalaryRulesManagement.tsx
import React, { useState, useEffect, useCallback } from "react";
import CreateSalaryRuleModal from "./models/CreateSalaryRuleModal";
import UpdateSalaryRuleModal from "./models/UpdateSalaryRuleModal";
import { useSalaryRules, SalaryRuleType } from "./hooks/useSalaryRules";
import { ICO } from "../../icons";
import { useToast } from "../../../../../contexts/ToastContext";

export type CurrencyCode = "SAR" | "EGP" | "USD";

export const CURRENCIES: Record<
    CurrencyCode,
    { label: string; locale: string; symbol: string }
> = {
    SAR: { label: "ريال سعودي (ر.س)", locale: "ar-SA", symbol: "ر.س" },
    EGP: { label: "جنيه مصري (ج.م)", locale: "ar-EG", symbol: "ج.م" },
    USD: { label: "دولار أمريكي ($)", locale: "en-US", symbol: "$" },
};

export function formatCurrency(
    amount: number,
    currency: CurrencyCode = "SAR",
): string {
    const { locale } = CURRENCIES[currency];
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

interface SalaryRuleType {
    id: number;
    role: string;
    role_ar?: string;
    base_salary: number;
    working_days: number;
    daily_rate: number;
    mosque_id?: number | null;
    notes?: string | null;
    currency?: CurrencyCode;
}

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

const SalaryRulesManagement: React.FC = () => {
    const { salaries, loading, refetch, isEmpty, stats } = useSalaryRules();
    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<SalaryRuleType | null>(
        null,
    );
    const [selectedSalaryId, setSelectedSalaryId] = useState<number | null>(
        null,
    );
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);
    const [filteredSalaries, setFilteredSalaries] = useState<SalaryRuleType[]>(
        [],
    );

    const { notifySuccess, notifyError } = useToast();

    useEffect(() => {
        setFilteredSalaries(salaries);
    }, [salaries]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        const filtered = salaries.filter(
            (salary) =>
                (salary.role_ar || salary.role || "")
                    .toLowerCase()
                    .includes(value.toLowerCase()) ||
                (salary.mosque_id?.toString() || "").includes(
                    value.toLowerCase(),
                ),
        );
        setFilteredSalaries(filtered);
    };

    const handleEdit = (salary: SalaryRuleType) => {
        setSelectedSalary(salary);
        setSelectedSalaryId(salary.id);
        setShowUpdateModal(true);
    };

    const handleDelete = async (id: number) => {
        setConfirm({
            title: "حذف قاعدة الراتب",
            desc: "هل أنت متأكد من حذف قاعدة هذا الراتب؟ لا يمكن التراجع.",
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
                        `/api/v1/teacher-salaries/${id}`,
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
                        notifySuccess("تم حذف قاعدة الراتب بنجاح");
                        setFilteredSalaries((prev) =>
                            prev.filter((s) => s.id !== id),
                        );
                        refetch();
                    } else {
                        notifyError(
                            result.message || "فشل في حذف قاعدة الراتب",
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

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedSalary(null);
        setSelectedSalaryId(null);
    };

    const handleUpdateSuccess = () => {
        notifySuccess("تم تحديث قاعدة الراتب بنجاح");
        refetch();
    };

    const handleCloseCreateModal = () => setShowCreateModal(false);

    const handleCreateSuccess = () => {
        notifySuccess("تم إضافة قاعدة راتب جديدة بنجاح");
        refetch();
    };

    const handleAddNew = () => setShowCreateModal(true);

    return (
        <>
            {showUpdateModal && selectedSalary && (
                <UpdateSalaryRuleModal
                    salaryRuleId={selectedSalaryId!}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreateSalaryRuleModal
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
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
                        <div className="wh-l">إدارة قوانين الرواتب</div>
                        <div className="flx">
                            <input
                                className="fi"
                                style={{ margin: "0 6px" }}
                                placeholder="البحث بالدور أو المسجد..."
                                value={search}
                                onChange={handleSearch}
                            />
                            <button
                                className="btn bp bsm"
                                onClick={handleAddNew}
                            >
                                + قاعدة راتب جديدة
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>الدور</th>
                                    <th>الراتب الأساسي</th>
                                    <th>العملة</th>
                                    <th>أيام العمل</th>
                                    <th>اليومي</th>
                                    <th>المسجد</th>
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
                                                    {salary.role_ar ||
                                                        salary.role ||
                                                        "غير محدد"}
                                                </td>
                                                <td className="font-semibold text-green-600">
                                                    {formatCurrency(
                                                        salary.base_salary || 0,
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
                                                    {salary.working_days || 0}
                                                </td>
                                                <td>
                                                    {formatCurrency(
                                                        salary.daily_rate || 0,
                                                        currency,
                                                    )}
                                                </td>
                                                <td>
                                                    {salary.mosque_id ||
                                                        "جميع المساجد"}
                                                </td>
                                                <td
                                                    className="max-w-xs truncate"
                                                    title={salary.notes || ""}
                                                >
                                                    {salary.notes || "-"}
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
                                                                    salary,
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
                                ) : (
                                    <tr>
                                        <td colSpan={8}>
                                            <div className="empty">
                                                <p>
                                                    {search
                                                        ? "لا توجد نتائج للبحث"
                                                        : "لا توجد قوانين رواتب"}
                                                </p>
                                                <button
                                                    className="btn bp bsm"
                                                    onClick={handleAddNew}
                                                >
                                                    إضافة قاعدة راتب
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SalaryRulesManagement;
