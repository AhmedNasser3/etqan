// RewardsManagement.tsx
import React, { useState } from "react";
import { useRewards, Reward } from "./hooks/useRewards";
import { useToast } from "../../../../../contexts/ToastContext";

interface RewardForm {
    name: string;
    description: string;
    points_cost: number;
    is_active: boolean;
}

const defaultForm: RewardForm = {
    name: "",
    description: "",
    points_cost: 50,
    is_active: true,
};

const RewardsManagement: React.FC = () => {
    const { rewards, loading, createReward, updateReward, deleteReward } =
        useRewards();
    const { notifySuccess, notifyError } = useToast();

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<RewardForm>(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const openCreate = () => {
        setForm(defaultForm);
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (reward: Reward) => {
        setForm({
            name: reward.name,
            description: reward.description ?? "",
            points_cost: reward.points_cost,
            is_active: reward.is_active,
        });
        setEditingId(reward.id);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            notifyError("أدخل اسم الجائزة");
            return;
        }
        if (form.points_cost < 1) {
            notifyError("السعر يجب أن يكون أكبر من صفر");
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await updateReward(editingId, form);
                notifySuccess("تم تحديث الجائزة ");
            } else {
                await createReward(form);
                notifySuccess("تمت إضافة الجائزة 🎁");
            }
            setShowModal(false);
        } catch {
            notifyError("فشل في حفظ الجائزة");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteReward(id);
            notifySuccess("تم حذف الجائزة");
        } catch {
            notifyError("فشل في الحذف");
        } finally {
            setConfirmDelete(null);
        }
    };

    return (
        <>
            {/* مودال الجائزة */}
            {showModal && (
                <div
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
                    <div className="conf-box" style={{ minWidth: 360 }}>
                        <div className="conf-t">
                            {editingId ? "تعديل الجائزة" : "إضافة جائزة جديدة"}
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label
                                style={{
                                    fontSize: 13,
                                    display: "block",
                                    marginBottom: 4,
                                }}
                            >
                                اسم الجائزة *
                            </label>
                            <input
                                className="fi"
                                placeholder="مثال: مصحف، شهادة تقدير..."
                                value={form.name}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label
                                style={{
                                    fontSize: 13,
                                    display: "block",
                                    marginBottom: 4,
                                }}
                            >
                                الوصف (اختياري)
                            </label>
                            <input
                                className="fi"
                                placeholder="وصف الجائزة..."
                                value={form.description}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        description: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label
                                style={{
                                    fontSize: 13,
                                    display: "block",
                                    marginBottom: 4,
                                }}
                            >
                                سعرها بالنقاط *
                            </label>
                            <input
                                className="fi"
                                type="number"
                                min={1}
                                value={form.points_cost}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        points_cost: Math.max(
                                            1,
                                            Number(e.target.value),
                                        ),
                                    }))
                                }
                            />
                        </div>

                        <div
                            style={{
                                marginBottom: 16,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        is_active: e.target.checked,
                                    }))
                                }
                            />
                            <label htmlFor="isActive" style={{ fontSize: 13 }}>
                                متاحة للطلاب
                            </label>
                        </div>

                        <div className="conf-acts">
                            <button
                                className="btn bp"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting
                                    ? "جاري..."
                                    : editingId
                                      ? "حفظ التعديل"
                                      : "إضافة"}
                            </button>
                            <button
                                className="btn bs"
                                onClick={() => setShowModal(false)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* مودال تأكيد الحذف */}
            {confirmDelete !== null && (
                <div
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
                        <div className="conf-t">حذف الجائزة</div>
                        <div className="conf-d">
                            هل أنت متأكد؟ لا يمكن التراجع.
                        </div>
                        <div className="conf-acts">
                            <button
                                className="btn bd"
                                onClick={() => handleDelete(confirmDelete)}
                            >
                                حذف
                            </button>
                            <button
                                className="btn bs"
                                onClick={() => setConfirmDelete(null)}
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
                        <div className="wh-l">
                            إدارة الجوائز ({rewards.length})
                        </div>
                        <button className="btn bp bsm" onClick={openCreate}>
                            + جائزة جديدة
                        </button>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>اسم الجائزة</th>
                                    <th>الوصف</th>
                                    <th>السعر (نقاط)</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rewards.length > 0 ? (
                                    rewards.map((reward) => (
                                        <tr key={reward.id}>
                                            <td style={{ fontWeight: 700 }}>
                                                {reward.name}
                                            </td>
                                            <td
                                                style={{
                                                    color: "var(--n500)",
                                                    fontSize: 13,
                                                }}
                                            >
                                                {reward.description || "—"}
                                            </td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: "#f3e8ff",
                                                        color: "#7c3aed",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {reward.points_cost} نقطة
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={
                                                        reward.is_active
                                                            ? {
                                                                  background:
                                                                      "#dcfce7",
                                                                  color: "#166534",
                                                              }
                                                            : {
                                                                  background:
                                                                      "#fee2e2",
                                                                  color: "#991b1b",
                                                              }
                                                    }
                                                >
                                                    {reward.is_active
                                                        ? "متاحة "
                                                        : "مخفية"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            setConfirmDelete(
                                                                reward.id,
                                                            )
                                                        }
                                                    >
                                                        حذف
                                                    </button>
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() =>
                                                            openEdit(reward)
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
                                                <p>لا توجد جوائز بعد</p>
                                                <button
                                                    className="btn bp bsm"
                                                    onClick={openCreate}
                                                >
                                                    إضافة جائزة
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

export default RewardsManagement;
