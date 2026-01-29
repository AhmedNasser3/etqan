import { useState, useEffect } from "react";
import { Fragment } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import UpdateCenterPage from "./models/UpdateCenterPage";
import CreateCenterPage from "./models/CreateCenterPage";
import { Center } from "./models/types";

interface Center {
    id: number;
    circleName: string;
    managerName: string;
    managerEmail: string;
    managerPhone: string;
    circleLink: string;
    domain: string;
    logo: string;
    countryCode: string;
    is_active: boolean;
    students_count: number;
    address?: string;
    created_at?: string;
    hosting_provider?: string;
}

const CentersMangement: React.FC = () => {
    const [centers, setCenters] = useState<Center[]>([]);
    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
    const [selectedCenterId, setSelectedCenterId] = useState<number | null>(
        null,
    );

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        try {
            const response = await fetch("/api/super/centers", {
                headers: { Accept: "application/json" },
            });

            if (!response.ok) throw new Error("خطأ في جلب البيانات");

            const result = await response.json();
            if (result.success) {
                setCenters(result.data || []);
            }
        } catch (error) {
            console.error("فشل في جلب المجمعات");
        }
    };

    const filteredCenters = centers.filter(
        (center) =>
            center.circleName.toLowerCase().includes(search.toLowerCase()) ||
            center.managerName.toLowerCase().includes(search.toLowerCase()) ||
            center.managerEmail.toLowerCase().includes(search.toLowerCase()) ||
            center.domain.toLowerCase().includes(search.toLowerCase()),
    );

    const handleEdit = (center: Center) => {
        setSelectedCenter(center);
        setSelectedCenterId(center.id);
        setShowUpdateModal(true);
    };

    const handleDelete = async (center: Center) => {
        try {
            const response = await fetch(`/api/super/centers/${center.id}`, {
                method: "DELETE",
                headers: { Accept: "application/json" },
            });

            const result = await response.json();
            if (result.success) {
                toast.success("تم حذف المجمع بنجاح");
                fetchCenters();
            } else {
                toast.error(result.message || "فشل في الحذف");
            }
        } catch {
            toast.error("حدث خطأ في الحذف");
        }
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedCenter(null);
        setSelectedCenterId(null);
    };

    const handleUpdateSuccess = () => {
        toast.success("تم تحديث بيانات المجمع بنجاح!");
        fetchCenters();
        handleCloseUpdateModal();
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateSuccess = () => {
        toast.success("تم إضافة المجمع بنجاح!");
        fetchCenters();
        handleCloseCreateModal();
    };

    const stats = {
        total: centers.length,
        active: centers.filter((c) => c.is_active).length,
        students: centers.reduce((sum, c) => sum + c.students_count, 0),
    };

    return (
        <>
            {showUpdateModal && selectedCenter && (
                <UpdateCenterPage
                    initialCenter={selectedCenter}
                    centerId={selectedCenterId!}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreateCenterPage
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
                            <h3>إجمالي المجمعات</h3>
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
                            <h3>عدد الطلاب</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.students}
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
                            إدارة بيانات المجمعات المعتمدة
                        </div>
                        <div className="plan__current">
                            <h2>قائمة المجمعات</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالمجمع أو المدير أو الإيميل أو الدومين..."
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

                    <div className="plan__daily-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>شعار</th>
                                    <th>اسم المجمع</th>
                                    <th>اسم المدير</th>
                                    <th>بريد المدير</th>
                                    <th>رقم الجوال</th>
                                    <th>رابط المجمع</th>
                                    <th>الدومين</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCenters.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row active"
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                <img
                                                    src={
                                                        item.logo?.startsWith(
                                                            "http",
                                                        )
                                                            ? item.logo
                                                            : item.logo?.startsWith(
                                                                    "centers/",
                                                                )
                                                              ? `/storage/${item.logo}`
                                                              : `/storage/centers/${item.logo}`
                                                    }
                                                    alt={item.circleName}
                                                    className="w-full h-12 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "/images/default-logo.png";
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td>{item.circleName}</td>
                                        <td>{item.managerName}</td>
                                        <td>{item.managerEmail}</td>
                                        <td>
                                            <span className="font-mono text-sm">
                                                {item.countryCode}{" "}
                                                {item.managerPhone}
                                            </span>
                                        </td>
                                        <td>
                                            <a
                                                href={item.circleLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                🔗 رابط
                                            </a>
                                        </td>
                                        <td>
                                            <span className="font-mono text-sm">
                                                {item.domain}
                                            </span>
                                        </td>
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
                                                    className="teacherStudent__status-btn edit-btn p-2"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                    title="تعديل بيانات المجمع"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2"
                                                    onClick={() =>
                                                        handleDelete(item)
                                                    }
                                                    title="حذف المجمع"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCenters.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد مجمعات مطابقة للبحث
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
                            <p>95%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "95%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>عدد المجمعات</h1>
                            </div>
                            <p>{centers.length}</p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${Math.min((centers.length / 50) * 100, 100)}%`,
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

export default CentersMangement;
