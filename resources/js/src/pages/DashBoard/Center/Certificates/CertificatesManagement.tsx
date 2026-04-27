// CertificatesManagement.tsx
import React, { useState, useCallback } from "react";
import { useToast } from "../../../../../contexts/ToastContext";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import CreateCertificatePage from "./models/CreateCertificatePage";
import UpdateCertificatePage from "./models/UpdateCertificatePage";
import { useCertificates } from "./hooks/useCertificates";

interface CertificateType {
    id: number;
    center_id: number;
    user_id: number;
    certificate_image: string;
    created_at: string;
    updated_at: string;
    user: { id: number; name: string };
    student: { id_number: string; grade_level: string; circle: string } | null;
}

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

const CertificatesManagement: React.FC = () => {
    const {
        certificates,
        students,
        loading,
        pagination,
        currentPage,
        goToPage,
        refetch,
    } = useCertificates();

    const { notifySuccess, notifyError } = useToast();

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCertificateId, setSelectedCertificateId] = useState<
        number | null
    >(null);
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);

    const getCsrfToken = useCallback((): string => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || ""
        );
    }, []);

    const handleDelete = async (id: number) => {
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch(`/api/certificates/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            const result = await response.json();
            if (response.ok) {
                notifySuccess("تم حذف الشهادة بنجاح");
                refetch();
            } else {
                notifyError(result.message || "فشل في الحذف");
            }
        } catch (error) {
            notifyError("حدث خطأ في الحذف");
        }
    };

    const handleDeleteClick = useCallback(
        (id: number) => {
            setConfirm({
                title: "حذف الشهادة",
                desc: "هل أنت متأكد من حذف هذه الشهادة؟ لا يمكن التراجع.",
                cb: async () => {
                    try {
                        const csrfToken = getCsrfToken();
                        const response = await fetch(
                            `/api/certificates/${id}`,
                            {
                                method: "DELETE",
                                credentials: "include",
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    "X-Requested-With": "XMLHttpRequest",
                                    "X-CSRF-TOKEN": csrfToken,
                                },
                            },
                        );

                        const result = await response.json();
                        if (response.ok) {
                            notifySuccess("تم حذف الشهادة بنجاح");
                            refetch();
                        } else {
                            notifyError(result.message || "فشل في الحذف");
                        }
                    } catch (error) {
                        notifyError("حدث خطأ في الحذف");
                    } finally {
                        setConfirm(null);
                    }
                },
            });
        },
        [getCsrfToken, notifySuccess, notifyError, refetch],
    );

    const handleEdit = useCallback((certificate: CertificateType) => {
        setSelectedCertificateId(certificate.id);
        setShowUpdateModal(true);
    }, []);

    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedCertificateId(null);
    }, []);

    const handleUpdateSuccess = useCallback(() => {
        refetch();
        handleCloseUpdateModal();
    }, [refetch, handleCloseUpdateModal]);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleCreateSuccess = useCallback(() => {
        notifySuccess("تم إضافة شهادة جديدة بنجاح! ✨");
        refetch();
        handleCloseCreateModal();
    }, [refetch, handleCloseCreateModal]);

    const handleAddNew = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const stats = {
        total: pagination?.total || certificates.length,
        students: students.length,
        currentPage,
        totalPages: pagination?.last_page || 1,
    };

    const renderCertificateImage = (imagePath: string) => {
        return (
            <div
                className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white rounded-lg"
                style={{ minWidth: 48, minHeight: 48 }}
            >
                شه
            </div>
        );
    };

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < (pagination?.last_page || 1);

    return (
        <>
            {showUpdateModal && selectedCertificateId && (
                <UpdateCertificatePage
                    certificateId={selectedCertificateId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreateCertificatePage
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {/* نافذة التأكيد (مطابقة تمامًا لـ PlansManagement) */}
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
                                {<FiTrash2 />}
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
                        <div className="wh-l">قائمة الشهادات</div>
                        <div
                            className="flx"
                            style={{
                                display: "flex",
                                alignContent: "center",
                            }}
                        >
                            <input
                                style={{
                                    margin: "0 6px",
                                }}
                                className="fi"
                                placeholder="البحث في الشهادات..."
                                disabled={loading}
                            />
                            <button
                                className="btn bp bsm"
                                onClick={handleAddNew}
                                disabled={loading}
                            >
                                <IoMdAdd
                                    size={18}
                                    style={{
                                        marginRight: 6,
                                        verticalAlign: -1,
                                    }}
                                />
                                شهادة جديدة
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>اسم الطالب</th>
                                    <th>الرقم القومي</th>
                                    <th>الصف</th>
                                    <th>الحلقة</th>
                                    <th>تاريخ الإضافة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certificates.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="empty text-center py-8 text-gray-500">
                                                لا يوجد شهادات حالياً
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    certificates.map((item) => (
                                        <tr key={item.id}>
                                            <td
                                                className="teacherStudent__img"
                                                style={{ width: 60 }}
                                            >
                                                <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                    {renderCertificateImage(
                                                        item.certificate_image,
                                                    )}
                                                </div>
                                            </td>
                                            <td>{item.user.name}</td>
                                            <td>
                                                {item.student?.id_number || "-"}
                                            </td>
                                            <td>
                                                {item.student?.grade_level ||
                                                    "-"}
                                            </td>
                                            <td>
                                                {item.student?.circle || "-"}
                                            </td>
                                            <td>
                                                {new Date(
                                                    item.created_at,
                                                ).toLocaleDateString("ar-EG")}
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bp bxs"
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                        disabled={loading}
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={loading}
                                                    >
                                                        حذف
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div
                            className="inputs__verifyOTPBirth"
                            style={{
                                marginTop: 12,
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                                fontSize: 12,
                            }}
                        >
                            <div className="text-gray-600">
                                عرض {certificates.length} من {pagination.total}{" "}
                                شهادة • الصفحة <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 6,
                                }}
                            >
                                <button
                                    className="btn bs bxs"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev || loading}
                                >
                                    السابق
                                </button>
                                <span
                                    className="btn bp bxs"
                                    style={{
                                        padding: "4px 12px",
                                        fontWeight: 700,
                                    }}
                                >
                                    {currentPage}
                                </span>
                                <button
                                    className="btn bp bxs"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext || loading}
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CertificatesManagement;
