import { useState } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { IoMdLink } from "react-icons/io";
import SettingModel from "@/src/layouts/models/SettingModel";
import CircleManagementModel from "./models/CircleMangementModel";

const CircleManagement: React.FC = () => {
    const [circles, setCircles] = useState([
        {
            id: 1,
            circleName: "مجمع الإمام الشافعي",
            managerName: "محمد أحمد محمد علي",
            managerEmail: "manager@shaafi.com",
            managerPhone: "50 123 4567",
            circleLink: "https://shaafi-circle.com",
            domain: "shaafi-circle.com",
            logo: "https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=ش",
            countryCode: "966+",
        },
        {
            id: 2,
            circleName: "مجمع النور",
            managerName: "عبدالله صالح عبدالرحمن",
            managerEmail: "admin@alnour.sa",
            managerPhone: "59 876 5432",
            circleLink: "https://alnour-circle.net",
            domain: "alnour-circle.net",
            logo: "https://via.placeholder.com/80x80/10B981/FFFFFF?text=ن",
            countryCode: "966+",
        },
        {
            id: 3,
            circleName: "مجمع التقوى",
            managerName: "فاطمة محمد أحمد السيد",
            managerEmail: "director@taqwa.org",
            managerPhone: "55 111 2223",
            circleLink: "https://taqwa-circle.org",
            domain: "taqwa-circle.org",
            logo: "https://via.placeholder.com/80x80/F59E0B/FFFFFF?text=ت",
            countryCode: "20+",
        },
    ]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [ShowCircleManagementModel, setShowCircleManagementModel] =
        useState(false);

    const filteredCircles = circles.filter(
        (circle) =>
            circle.circleName.includes(search) ||
            circle.managerName.includes(search) ||
            circle.managerEmail.includes(search) ||
            circle.domain.includes(search),
    );

    const handleEdit = (circle: any) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowCircleManagementModel(true);
        }, 300);
    };

    const handleDelete = (id: number) => {
        setLoading(true);
        setTimeout(() => {
            setCircles((prev) => prev.filter((c) => c.id !== id));
            setLoading(false);
            toast.success("تم حذف المجمع بنجاح");
        }, 500);
    };

    const handleAddNew = () => {
        setShowCircleManagementModel(true);
    };

    const handleSettingSubmit = (formData: FormData) => {
        console.log("Circle data submitted:", Object.fromEntries(formData));
        toast.success("تم حفظ بيانات المجمع بنجاح!");
        setShowCircleManagementModel(false);
    };

    const handleCloseSettingModal = () => {
        setShowCircleManagementModel(false);
    };

    return (
        <>
            <CircleManagementModel
                isOpen={ShowCircleManagementModel}
                onClose={handleCloseSettingModal}
                onSubmit={handleSettingSubmit}
            />
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
                                {circles.length}
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
                                {filteredCircles.length}
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
                            <h3>مجمعات معتمدة</h3>
                            <p className="text-2xl font-bold text-green-600">
                                18
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
                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium ml-3"
                                    onClick={handleAddNew}
                                    disabled={loading}
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
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCircles.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row active"
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                <img
                                                    src={item.logo}
                                                    alt={item.circleName}
                                                    className="w-full h-full object-cover"
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
                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                🔗 رابط
                                            </a>
                                        </td>
                                        <td>
                                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {item.domain}
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
                                                    title="تعديل بيانات المجمع"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    disabled={loading}
                                                    title="حذف المجمع"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCircles.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد مجمعات حالياً
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
                            <p>{circles.length}</p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${(circles.length / 50) * 100}%`,
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

export default CircleManagement;
