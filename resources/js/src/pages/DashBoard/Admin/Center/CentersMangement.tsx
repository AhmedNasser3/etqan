import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import UpdateCenterPage from "./models/UpdateCenterPage";
import CreateCenterPage from "./models/CreateCenterPage";
import { useCenters } from "./hooks/useCenters"; //  الـ Hook الجديد

//  Interface جديد - مجمعات مباشرة (مش nested)
interface Center {
    id: number;
    name: string;
    subdomain: string;
    domain: string;
    center_url: string;
    email: string;
    phone: string;
    logo: string | null;
    is_active: boolean;
    address: string;
    created_at: string;
    students_count: number;
}

const CentersManagement: React.FC = () => {
    const {
        centers, //  من الـ Hook الجديد
        loading, //  من الـ Hook
        error, //  من الـ Hook
        confirmCenter,
        rejectCenter,
        deleteCenter,
        refetch,
    } = useCenters();

    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
    const [selectedCenterId, setSelectedCenterId] = useState<number | null>(
        null,
    );

    //  البحث المحسن - مجمعات مباشرة
    const filteredCenters = centers.filter(
        (center) =>
            center.name.toLowerCase().includes(search.toLowerCase()) ||
            center.email.toLowerCase().includes(search.toLowerCase()) ||
            center.subdomain.toLowerCase().includes(search.toLowerCase()) ||
            center.phone.toLowerCase().includes(search.toLowerCase()),
    );

    //  Delete مع الـ Hook الجديد
    const handleDelete = async (centerId: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا المجمع؟")) {
            return;
        }

        const result = await deleteCenter(centerId);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    //  تفعيل مجمع
    const handleActivate = async (centerId: number) => {
        const result = await confirmCenter(centerId);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    //  تعطيل مجمع
    const handleDeactivate = async (centerId: number) => {
        const result = await rejectCenter(centerId);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    //  Edit handler
    const handleEdit = (center: Center) => {
        setSelectedCenter(center);
        setSelectedCenterId(center.id);
        setShowUpdateModal(true);
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedCenter(null);
        setSelectedCenterId(null);
    };

    const handleUpdateSuccess = () => {
        toast.success("تم تحديث بيانات المجمع بنجاح!");
        refetch();
        handleCloseUpdateModal();
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateSuccess = () => {
        toast.success("تم إضافة المجمع بنجاح!");
        refetch();
        handleCloseCreateModal();
    };

    //  Stats محسن - مجمعات مباشرة
    const stats = {
        total: centers.length,
        active: centers.filter((c) => c.is_active).length,
        inactive: centers.filter((c) => !c.is_active).length,
    };

    //  Error handling
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    return (
        <>
            {/* Update Modal */}
            {showUpdateModal && selectedCenter && (
                <UpdateCenterPage
                    initialCenter={selectedCenter}
                    centerId={selectedCenterId!}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateCenterPage
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* Stats Cards */}
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي المجمعات</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>نشطة</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.active}
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
                            <h3>غير نشطة</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {stats.inactive}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header & Search */}
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            إدارة بيانات المجمعات المعتمدة
                        </div>
                        <div className="plan__current">
                            <h2>قائمة المجمعات</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالمجمع أو الإيميل أو الدومين أو التليفون..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="teacherStudent__status-btn add-btn p-3"
                                        onClick={() => setShowCreateModal(true)}
                                    >
                                        <IoMdAdd
                                            size={20}
                                            className="inline mr-2"
                                        />
                                        مجمع جديد
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>شعار</th>
                                <th>اسم المجمع</th>
                                <th>الإيميل</th>
                                <th>رقم الجوال</th>
                                <th>العنوان</th>
                                <th>رابط المجمع</th>
                                <th>الدومين</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="text-center py-8"
                                    >
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <div className="navbar">
                                            <div className="navbar__inner">
                                                <div className="navbar__loading">
                                                    <div className="loading-spinner">
                                                        <div className="spinner-circle"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>{" "}
                                    </td>
                                </tr>
                            ) : filteredCenters.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {error
                                            ? "حدث خطأ في تحميل المجمعات"
                                            : "لا توجد مجمعات"}
                                    </td>
                                </tr>
                            ) : (
                                filteredCenters.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row active"
                                    >
                                        {/* Logo */}
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                <img
                                                    src={
                                                        item.logo
                                                            ? item.logo.startsWith(
                                                                  "http",
                                                              )
                                                                ? item.logo
                                                                : `/storage/${item.logo}`
                                                            : "/images/default-logo.png"
                                                    }
                                                    alt={item.name}
                                                    className="w-full h-12 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "/images/default-logo.png";
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        {/* Center Name */}
                                        <td>{item.name}</td>

                                        {/* Email */}
                                        <td>{item.email}</td>

                                        {/* Phone */}
                                        <td>
                                            <span className="font-mono text-sm">
                                                {item.phone}
                                            </span>
                                        </td>

                                        {/* Address */}
                                        <td>{item.address}</td>

                                        {/* Center Link */}
                                        <td>
                                            <a
                                                href={item.center_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                🔗 رابط
                                            </a>
                                        </td>

                                        {/* Domain */}
                                        <td>
                                            <span className="font-mono text-sm">
                                                {item.subdomain}
                                            </span>
                                        </td>

                                        {/* Status */}
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

                                        {/* Actions */}
                                        <td>
                                            <div className="teacherStudent__btns">
                                                {/* Edit */}
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                    title="تعديل بيانات المجمع"
                                                >
                                                    <FiEdit3 />
                                                </button>

                                                {/* Activate/Deactivate */}
                                                <button
                                                    className={`p-2 rounded ${
                                                        item.is_active
                                                            ? "bg-red-100 hover:bg-red-200 text-red-600"
                                                            : "bg-green-100 hover:bg-green-200 text-green-600"
                                                    }`}
                                                    onClick={() =>
                                                        item.is_active
                                                            ? handleDeactivate(
                                                                  item.id,
                                                              )
                                                            : handleActivate(
                                                                  item.id,
                                                              )
                                                    }
                                                    title={
                                                        item.is_active
                                                            ? "تعطيل"
                                                            : "تفعيل"
                                                    }
                                                >
                                                    {item.is_active ? "⛔" : ""}
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 ml-1"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    title="حذف المجمع"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Progress Bars */}
                <div
                    className="inputs__verifyOTPBirth"
                    id="userProfile__verifyOTPBirth"
                    style={{ width: "100%" }}
                >
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>معدل النشاط</h1>
                        </div>
                        <p>
                            {Math.round(
                                (stats.active / Math.max(stats.total, 1)) * 100,
                            )}
                            %
                        </p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{
                                    width: `${Math.min((stats.active / Math.max(stats.total, 1)) * 100, 100)}%`,
                                }}
                            ></span>
                        </div>
                    </div>
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>عدد المجمعات</h1>
                        </div>
                        <p>{stats.total}</p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{
                                    width: `${Math.min((stats.total / 50) * 100, 100)}%`,
                                }}
                            ></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CentersManagement;
