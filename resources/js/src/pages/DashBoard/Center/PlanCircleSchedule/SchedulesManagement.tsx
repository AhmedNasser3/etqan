// SchedulesManagement.tsx - التصميم الجديد مع cards بدل table
import React, { useState, useEffect, useCallback } from "react";
import UpdateSchedulePage from "./models/UpdateSchedulePage";
import CreateSchedulePage from "./models/CreateSchedulePage";
import { usePlanSchedules, ScheduleType } from "./hooks/usePlanSchedules";
import { ICO } from "../../icons";
import { useToast } from "../../../../../contexts/ToastContext";

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

const SchedulesManagement: React.FC = () => {
    const {
        schedules: schedulesFromHook,
        loading,
        refetch,
    } = usePlanSchedules();
    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] =
        useState<ScheduleType | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
        null,
    );
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);

    // نخلي المواعيد في الـ state هنا عشان نقدر نحذف فوري
    const [schedules, setSchedules] = useState<ScheduleType[]>([]);

    // أول ما يجي schedules من hook نخليهم في الـ state
    useEffect(() => {
        setSchedules(schedulesFromHook);
    }, [schedulesFromHook]);

    // دايمًا نفس الـ schedules لكن مفلترة عند الـ search
    const filteredSchedules = schedules.filter(
        (schedule) =>
            schedule.plan.plan_name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (schedule.circle?.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (schedule.teacher?.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    const { notifySuccess, notifyError } = useToast();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleEdit = (schedule: ScheduleType) => {
        setSelectedSchedule(schedule);
        setSelectedScheduleId(schedule.id);
        setShowUpdateModal(true);
    };

    const handleDelete = async (id: number) => {
        setConfirm({
            title: "حذف الموعد",
            desc: "هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع.",
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
                        `/api/v1/plans/schedules/${id}`,
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
                        notifySuccess("تم حذف الموعد بنجاح");
                        // حذف فوري من الواجهة
                        setSchedules((prev) => prev.filter((s) => s.id !== id));
                    } else {
                        notifyError(result.message || "فشل في حذف الموعد");
                    }
                } catch (error: any) {
                    notifyError("حدث خطأ في الحذف");
                } finally {
                    setConfirm(null);
                }
            },
        });
    };

    const handleCopyJitsiUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        notifySuccess("تم نسخ رابط الغرفة!");
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedSchedule(null);
        setSelectedScheduleId(null);
    };

    const handleUpdateSuccess = () => {
        notifySuccess("تم تحديث الموعد بنجاح");
        refetch();
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateSuccess = () => {
        notifySuccess("تم إضافة الموعد بنجاح");
        refetch();
    };

    const handleAddNew = () => {
        setShowCreateModal(true);
    };

    const getTeacherName = (schedule: ScheduleType) => {
        return schedule.teacher?.name || "غير محدد";
    };

    const getCircleName = (schedule: ScheduleType) => {
        return schedule.circle?.name || "غير محدد";
    };

    const getAvailabilityStatus = (schedule: ScheduleType) => {
        if (!schedule.is_available) return "غير متاح";
        if (schedule.max_students === null) return "مفتوح";
        const remaining =
            (schedule.max_students || 0) - schedule.booked_students;
        return `${remaining}/${schedule.max_students}`;
    };

    function Badge({ txt, cls }: { txt: string; cls: string }) {
        const map: Record<string, React.CSSProperties> = {
            "bg-g": { background: "var(--g100)", color: "var(--g700)" },
            "bg-r": { background: "#fee2e2", color: "#ef4444" },
        };
        return (
            <span
                className="badge px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                style={
                    map[cls] || {
                        background: "var(--n100)",
                        color: "var(--n500)",
                    }
                }
            >
                {txt}
            </span>
        );
    }

    return (
        <>
            {/* المودالز */}
            {showUpdateModal && selectedSchedule && selectedScheduleId && (
                <UpdateSchedulePage
                    scheduleId={selectedScheduleId}
                    initialSchedule={selectedSchedule}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreateSchedulePage
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
                        <div className="wh-l">مواعيد الحلقات</div>
                        <button className="btn bp bsm" onClick={handleAddNew}>
                            + موعد جديد
                        </button>
                    </div>

                    {filteredSchedules.length > 0 ? (
                        filteredSchedules.map((s: ScheduleType) => (
                            <div
                                key={s.id}
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "center",
                                    padding: "10px 14px",
                                    borderBottom: "1px solid var(--n100)",
                                }}
                            >
                                {/* وقت البداية والنهاية */}
                                <div
                                    style={{
                                        minWidth: 55,
                                        background: "var(--g50)",
                                        border: "1px solid var(--g100)",
                                        borderRadius: 9,
                                        padding: 7,
                                        textAlign: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 900,
                                            color: "var(--g700)",
                                        }}
                                    >
                                        {s.start_time?.slice(0, 5)}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 9,
                                            color: "var(--n400)",
                                        }}
                                    >
                                        → {s.end_time?.slice(0, 5)}
                                    </div>
                                </div>

                                {/* اسم الحلقة والتفاصيل */}
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {getCircleName(s)}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "10.5px",
                                            color: "var(--n400)",
                                        }}
                                    >
                                        {s.plan.plan_name} · سعة:{" "}
                                        {getAvailabilityStatus(s)}
                                    </div>
                                </div>

                                {/* حالة التوفر */}
                                <Badge
                                    txt={getAvailabilityStatus(s)}
                                    cls="bg-g"
                                />

                                {/* الأكشنز */}
                                <div className="td-actions">
                                    <button
                                        className="btn bs bxs"
                                        onClick={() => handleEdit(s)}
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        className="btn bd bxs"
                                        onClick={() => handleDelete(s.id)}
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div
                            style={{
                                padding: "40px 20px",
                                textAlign: "center",
                                color: "var(--n400)",
                            }}
                        >
                            <p style={{ marginBottom: 16 }}>
                                {search
                                    ? "لا توجد نتائج للبحث"
                                    : "لا يوجد مواعيد"}
                            </p>
                            <button
                                className="btn bp bsm"
                                onClick={handleAddNew}
                            >
                                + إضافة موعد
                            </button>
                        </div>
                    )}

                    {/* زر إضافة في الأسفل */}
                    <div style={{ padding: "12px 14px" }}>
                        <button className="btn bp bsm" onClick={handleAddNew}>
                            + إضافة موعد
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SchedulesManagement;
