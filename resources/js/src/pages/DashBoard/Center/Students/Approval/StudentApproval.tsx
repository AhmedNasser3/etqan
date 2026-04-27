// StudentApproval.tsx - مصحح مع نفس ديزاين StaffApproval + PlansManagement classes
import React, { useState, useEffect } from "react";
import ParentModel from "./modals/ParentModel";
import { usePendingStudents } from "./hooks/usePendingStudents";
import {
    useConfirmStudent,
    useRejectStudent,
} from "./hooks/usePendingStudents";
import { ICO } from "../../../icons";
import { useToast } from "../../../../../../contexts/ToastContext";

interface StudentType {
    id: number;
    name: string;
    id_number: string;
    grade_level: string;
    circle: string;
    center?: { name: string };
    created_at: string;
    guardian?: { name: string };
    user?: { name: string; status: string; avatar?: string };
    avatar?: string;
}

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

const StudentApproval: React.FC = () => {
    const {
        students: studentsFromHook = [],
        loading: studentsLoading,
        refetch,
    } = usePendingStudents();

    const { confirmStudent } = useConfirmStudent();
    const { rejectStudent } = useRejectStudent();

    const { notifySuccess, notifyError } = useToast();
    const [search, setSearch] = useState("");
    const [showParentModal, setShowParentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(
        null,
    );
    const [confirmLoadingIds, setConfirmLoadingIds] = useState<Set<number>>(
        new Set(),
    );
    const [rejectLoadingIds, setRejectLoadingIds] = useState<Set<number>>(
        new Set(),
    );
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);

    // Local state للحذف الفوري
    const [students, setStudents] = useState<StudentType[]>([]);

    useEffect(() => {
        setStudents(studentsFromHook);
    }, [studentsFromHook]);

    // فلترة فورية آمنة
    const filteredStudents = students.filter(
        (student) =>
            (student.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (student.id_number || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (student.grade_level || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (student.circle || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (student.user?.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (student.guardian?.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    // Confirm بـ per-student loading
    const handleApprove = async (id: number) => {
        setConfirmLoadingIds((prev) => new Set([...prev, id]));
        try {
            await confirmStudent(id);
            notifySuccess("تم اعتماد الطالب بنجاح!");
            // حذف فوري من الواجهة
            setStudents((prev) => prev.filter((s) => s.id !== id));
        } catch (error: any) {
            notifyError(error.message || "خطأ في اعتماد الطالب");
        } finally {
            setConfirmLoadingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    // Reject مع مودال تأكيد
    const handleReject = (id: number) => {
        setConfirm({
            title: "رفض طلب الطالب",
            desc: "هل أنت متأكد من رفض طلب هذا الطالب؟ لا يمكن التراجع.",
            cb: async () => {
                setRejectLoadingIds((prev) => new Set([...prev, id]));
                try {
                    await rejectStudent(id);
                    notifySuccess("تم رفض طلب الطالب بنجاح!");
                    // حذف فوري من الواجهة
                    setStudents((prev) => prev.filter((s) => s.id !== id));
                } catch (error: any) {
                    notifyError(error.message || "خطأ في رفض الطالب");
                } finally {
                    setRejectLoadingIds((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(id);
                        return newSet;
                    });
                    setConfirm(null);
                }
            },
        });
    };

    const handleSendOTP = (name: string) => {
        notifySuccess(`تم إرسال OTP إلى ${name}`);
    };

    const handleOpenParentModal = (student: StudentType) => {
        setSelectedStudent(student);
        setShowParentModal(true);
    };

    const handleCloseParentModal = () => {
        setShowParentModal(false);
        setSelectedStudent(null);
    };

    if (studentsLoading && students.length === 0) {
        return (
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>جاري تحميل الطلاب...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* مودال التأكيد */}
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
                        <div className="wh-l">
                            اعتماد الطلاب الجدد ({filteredStudents.length} طالب)
                        </div>
                        <div className="flx">
                            <input
                                className="fi"
                                style={{ margin: "0 6px" }}
                                placeholder="البحث بالاسم أو رقم الهوية أو الحلقة..."
                                value={search}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>الاسم الرباعي</th>
                                    <th>رقم الهوية</th>
                                    <th>الصف</th>
                                    <th>الحلقة</th>
                                    <th>المجمع</th>
                                    <th>تاريخ التقديم</th>
                                    <th>حالة الولي أمر</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {(
                                                            item.name ||
                                                            item.user?.name ||
                                                            "?"
                                                        ).charAt(0)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>
                                                {item.name ||
                                                    item.user?.name ||
                                                    "غير محدد"}
                                            </td>
                                            <td>{item.id_number || "-"}</td>
                                            <td>{item.grade_level || "-"}</td>
                                            <td>{item.circle || "-"}</td>
                                            <td>{item.center?.name || "-"}</td>
                                            <td>
                                                {
                                                    (
                                                        item.created_at || ""
                                                    ).split("T")[0]
                                                }
                                            </td>
                                            <td>
                                                <span className="font-medium text-green-600">
                                                    {item.guardian?.name ||
                                                        "غير محدد"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() =>
                                                            handleOpenParentModal(
                                                                item,
                                                            )
                                                        }
                                                        title="بيانات ولي الأمر"
                                                    >
                                                        بيانات ولي
                                                    </button>
                                                    <button
                                                        className={`btn bp bxs ${
                                                            confirmLoadingIds.has(
                                                                item.id,
                                                            )
                                                                ? "loading"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            handleApprove(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={confirmLoadingIds.has(
                                                            item.id,
                                                        )}
                                                    >
                                                        {confirmLoadingIds.has(
                                                            item.id,
                                                        )
                                                            ? "جاري..."
                                                            : "اعتماد"}
                                                    </button>
                                                    <button
                                                        className={`btn bd bxs red ${
                                                            rejectLoadingIds.has(
                                                                item.id,
                                                            )
                                                                ? "loading"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            handleReject(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={rejectLoadingIds.has(
                                                            item.id,
                                                        )}
                                                    >
                                                        {rejectLoadingIds.has(
                                                            item.id,
                                                        )
                                                            ? "جاري..."
                                                            : "رفض"}
                                                    </button>
                                                    <button
                                                        className="btn bs bxs blue"
                                                        onClick={() =>
                                                            handleSendOTP(
                                                                item.guardian
                                                                    ?.name ||
                                                                    item.name ||
                                                                    "الولي",
                                                            )
                                                        }
                                                    >
                                                        OTP
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : !studentsLoading ? (
                                    <tr>
                                        <td colSpan={9}>
                                            <div className="empty">
                                                <p>
                                                    {search
                                                        ? "لا توجد نتائج للبحث"
                                                        : "لا يوجد طلاب معلقين"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Parent Modal */}
            {showParentModal && selectedStudent && (
                <ParentModel
                    isOpen={showParentModal}
                    onClose={handleCloseParentModal}
                    student={selectedStudent}
                />
            )}
        </>
    );
};

// Badge للحالة
function BadgeStatus({ status }: { status: string }) {
    const map: Record<string, React.CSSProperties> = {
        active: { background: "var(--g100)", color: "var(--g700)" },
        pending: { background: "#fef3c7", color: "#92400e" },
    };
    return (
        <span
            className="badge px-2 py-1 rounded-full text-xs font-medium"
            style={
                map[status] || {
                    background: "var(--n100)",
                    color: "var(--n500)",
                }
            }
        >
            {status === "active" ? "معتمد" : "⏳ معلق"}
        </span>
    );
}

export default StudentApproval;
