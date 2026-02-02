import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import UpdateMosquePage from "./models/UpdateMosquePage";
import CreateMosquePage from "./models/CreateMosquePage";
import { useMosques } from "./hooks/useMosques";

interface MosqueType {
    id: number;
    name: string;
    circle: string;
    circleId: number;
    supervisor: string;
    supervisorId: number | null;
    logo: string | null;
    is_active: boolean;
    created_at: string;
}

const MosquesManagement: React.FC = () => {
    const { mosques, loading, refetch } = useMosques();
    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMosque, setSelectedMosque] = useState<MosqueType | null>(
        null,
    );
    const [selectedMosqueId, setSelectedMosqueId] = useState<number | null>(
        null,
    );

    const filteredMosques = mosques.filter(
        (mosque) =>
            mosque.name.includes(search) ||
            mosque.circle.includes(search) ||
            mosque.supervisor.includes(search),
    );

    const handleEdit = (mosque: MosqueType) => {
        setSelectedMosque(mosque);
        setSelectedMosqueId(mosque.id);
        setShowUpdateModal(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/v1/super/mosques/${id}`, {
                method: "DELETE",
                headers: { Accept: "application/json" },
            });

            const result = await response.json();
            if (result.success) {
                toast.success("تم حذف المسجد بنجاح");
                refetch();
            } else {
                toast.error(result.message || "فشل في الحذف");
            }
        } catch {
            toast.error("حدث خطأ في الحذف");
        }
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedMosque(null);
        setSelectedMosqueId(null);
    };

    const handleUpdateSuccess = () => {
        toast.success("تم تحديث بيانات المسجد بنجاح!");
        refetch();
        handleCloseUpdateModal();
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateSuccess = () => {
        toast.success("تم إضافة المسجد بنجاح!");
        refetch();
        handleCloseCreateModal();
    };

    const handleAddNew = () => {
        setShowCreateModal(true);
    };

    const stats = {
        total: mosques.length,
        active: mosques.filter((m) => m.is_active).length,
    };

    const renderLogo = (logo: string | null, name: string) => {
        if (logo) {
            return (
                <img
                    src={logo.startsWith("http") ? logo : `/storage/${logo}`}
                    alt="شعار"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src =
                            "https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=م";
                    }}
                />
            );
        }
        const initials = name
            .split(" ")
            .slice(-2)
            .map((n) => n[0])
            .join("")
            .slice(0, 2);
        return (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                {initials}
            </div>
        );
    };

    return (
        <>
            {showUpdateModal && selectedMosque && (
                <UpdateMosquePage
                    initialMosque={selectedMosque}
                    mosqueId={selectedMosqueId!}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreateMosquePage
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي المساجد</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon yellowColor">
                            <i>
                                <GrStatusCritical />
                            </i>
                        </div>
                        <div>
                            <h3>نشطة</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {stats.active}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>
                                <PiWhatsappLogoDuotone />
                            </i>
                        </div>
                        <div>
                            <h3>مساجد معتمدة</h3>
                            <p className="text-2xl font-bold text-green-600">
                                28
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            المساجد الجديدة تخضع لفحص ميداني قبل الاعتماد الرسمي
                        </div>
                        <div className="plan__current">
                            <h2>قائمة المساجد</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالمسجد أو المجمع أو المشرف..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium ml-3"
                                    onClick={handleAddNew}
                                    disabled={loading}
                                >
                                    <IoMdAdd
                                        size={20}
                                        className="inline mr-2"
                                    />
                                    مسجد جديد
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="plan__daily-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>الشعار</th>
                                    <th>اسم المسجد</th>
                                    <th>المجمع التابع له</th>
                                    <th>المشرف الخاص به</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMosques.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row active"
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                {renderLogo(
                                                    item.logo,
                                                    item.name,
                                                )}
                                            </div>
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.circle}</td>
                                        <td>{item.supervisor}</td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {item.is_active
                                                    ? "نشط"
                                                    : "غير نشط"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                    disabled={loading}
                                                    title="تعديل بيانات المسجد"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    disabled={loading}
                                                    title="حذف المسجد"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredMosques.length === 0 && !loading && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا يوجد مساجد حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل النشاط</h1>
                            </div>
                            <p>94%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "94%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>عدد المساجد</h1>
                            </div>
                            <p>{mosques.length}</p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${Math.min((mosques.length / 50) * 100, 100)}%`,
                                    }}
                                ></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MosquesManagement;
