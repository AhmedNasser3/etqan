// PlansManagement.tsx - مصحح مع CSRF token و بحث فعّال + حذف فوري
import React, { useState, useEffect, useCallback } from "react";
import UpdatePlanPage from "./models/UpdatePlanPage";
import CreatePlanPage from "./models/CreatePlanPage";
import { usePlans } from "./hooks/usePlans";
import { ICO } from "../../icons";
import { useToast } from "../../../../../contexts/ToastContext";

interface PlanType {
    id: number;
    plan_name: string;
    total_months: number;
    center?: { id: number; name: string };
    center_id: number;
    details_count: number;
    current_day?: number;
    created_at: string;
}

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

const PlansManagement: React.FC = () => {
    const { plans: plansFromHook, loading, refetch } = usePlans();
    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);

    // نخلي الخطط في الـ state هنا عشان نقدر نحذف فوري
    const [plans, setPlans] = useState<PlanType[]>([]);

    // أول ما يجي plans من hook نخليهم في الـ state
    useEffect(() => {
        setPlans(plansFromHook);
    }, [plansFromHook]);

    // دايمًا نفس ال plans لكن مفلترة عند الـ search
    const filteredPlans = plans.filter(
        (plan) =>
            plan.plan_name.toLowerCase().includes(search.toLowerCase()) ||
            (plan.center?.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    const { notifySuccess, notifyError } = useToast();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleEdit = (plan: PlanType) => {
        setSelectedPlan(plan);
        setSelectedPlanId(plan.id);
        setShowUpdateModal(true);
    };

    const handleDelete = async (id: number) => {
        setConfirm({
            title: "حذف الخطة",
            desc: "هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع.",
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

                    const response = await fetch(`/api/v1/plans/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            "X-CSRF-TOKEN": csrfToken,
                        },
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        notifySuccess("تم حذف الخطة بنجاح");

                        // حذف فوري من الواجهة: نحذف من الـ state فوراً
                        setPlans((prev) => prev.filter((p) => p.id !== id));
                    } else {
                        notifyError(result.message || "فشل في حذف الخطة");
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
        setSelectedPlan(null);
        setSelectedPlanId(null);
    };

    const handleUpdateSuccess = () => {
        notifySuccess("تم تحديث بيانات الخطة بنجاح");
        refetch();
        // حفظًا على السلامة نعيد تحميل الخطط من الـ hook لو تغيروا
        // أو يمكن تتركها فقط لو كان hook يعكس التغيير في plansFromHook
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateSuccess = () => {
        notifySuccess("تم إضافة الخطة بنجاح");
        refetch();
    };

    const handleAddNew = () => {
        setShowCreateModal(true);
    };

    function BadgeStatus({ s }: { s: string }) {
        const map: Record<string, React.CSSProperties> = {
            "bg-g": { background: "var(--g100)", color: "var(--g700)" },
            "bg-r": { background: "#fee2e2", color: "#ef4444" },
            "bg-a": { background: "#fef3c7", color: "#92400e" },
            "bg-n": { background: "var(--n100)", color: "var(--n500)" },
        };
        return (
            <span
                className="badge px-2 py-1 rounded-full text-xs font-medium"
                style={
                    map[
                        s === "نشط" ? "bg-g" : s === "معلق" ? "bg-a" : "bg-r"
                    ] || map["bg-n"]
                }
            >
                {s}
            </span>
        );
    }

    const getCenterName = (plan: PlanType) => {
        return plan.center?.name || `مركز #${plan.center_id}` || "غير محدد";
    };

    return (
        <>
            {/* المودالز */}
            {showUpdateModal && selectedPlan && (
                <UpdatePlanPage
                    initialPlan={selectedPlan}
                    planId={selectedPlanId!}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreatePlanPage
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
                        <div className="wh-l">إدارة الخطط</div>
                        <div className="flx">
                            <input
                                className="fi"
                                style={{ margin: "0 6px" }}
                                placeholder="البحث بالخطة أو المجمع..."
                                value={search}
                                onChange={handleSearch}
                            />
                            <button
                                className="btn bp bsm"
                                onClick={handleAddNew}
                            >
                                + خطة جديدة
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>اسم الخطة</th>
                                    <th>المدة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlans.length > 0 ? (
                                    filteredPlans.map((p) => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 700 }}>
                                                {p.plan_name}
                                            </td>
                                            <td>{p.total_months} شهر</td>

                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            handleDelete(p.id)
                                                        }
                                                    >
                                                        حذف
                                                    </button>
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() =>
                                                            handleEdit(p)
                                                        }
                                                    >
                                                        تعديل
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : !loading ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="empty">
                                                <p>
                                                    {search
                                                        ? "لا توجد نتائج للبحث"
                                                        : "لا يوجد خطط"}
                                                </p>
                                                <button
                                                    className="btn bp bsm"
                                                    onClick={handleAddNew}
                                                >
                                                    إضافة خطة
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlansManagement;
