import { useState } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiCopy, FiEdit2, FiDownload, FiEye, FiTrash2 } from "react-icons/fi";
import { IoQrCodeOutline } from "react-icons/io5";
import { AiTwotoneStop } from "react-icons/ai";
import { IoPlayCircleOutline } from "react-icons/io5";

const DomainLinks: React.FC = () => {
    const [links, setLinks] = useState([
        {
            id: 1,
            type: "تسجيل مجمع",
            url: "https://etqan.center/center1/register",
            qrCode: "qr-center1.png",
            status: "active",
            usage: "125",
            created: "2026-01-10",
            expires: "2027-01-10",
        },
        {
            id: 2,
            type: "تسجيل طلاب",
            url: "https://etqan.center/center1/register/students",
            qrCode: "qr-students.png",
            status: "active",
            usage: "89",
            created: "2026-01-10",
            expires: "2027-01-10",
        },
        {
            id: 3,
            type: "تسجيل موظفين",
            url: "https://etqan.center/center1/register/staff",
            qrCode: "qr-staff.png",
            status: "active",
            usage: "34",
            created: "2026-01-10",
            expires: "2027-01-10",
        },
        {
            id: 4,
            type: "تسجيل معلمين",
            url: "https://etqan.center/center1/register/teachers",
            qrCode: "qr-teachers.png",
            status: "inactive",
            usage: "0",
            created: "2026-01-15",
            expires: "2027-01-15",
        },
    ]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const filteredLinks = links.filter(
        (link) =>
            link.type.includes(search) ||
            link.url.includes(search) ||
            link.status.includes(search),
    );

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("تم نسخ الرابط بنجاح!");
    };

    const handleToggleStatus = (id: number) => {
        setLoading(true);
        setTimeout(() => {
            setLinks((prev) =>
                prev.map((link) =>
                    link.id === id
                        ? {
                              ...link,
                              status:
                                  link.status === "active"
                                      ? "inactive"
                                      : "active",
                          }
                        : link,
                ),
            );
            setLoading(false);
            toast.success("تم تحديث حالة الرابط بنجاح!");
        }, 800);
    };

    const handleDelete = (id: number) => {
        setLinks((prev) => prev.filter((link) => link.id !== id));
        toast.error("تم حذف الرابط بنجاح");
    };

    const getStatusColor = (status: string) => {
        return status === "active"
            ? "text-green-600 bg-green-100"
            : "text-red-600 bg-red-100";
    };

    return (
        <div className="teacherMotivate">
            <div className="teacherMotivate__inner">
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            إدارة روابط التسجيل{" "}
                            <span>{filteredLinks.length} رابط</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            يمكنك إنشاء رابط جديد لتسجيل المعلمين لحلقات محددة
                        </div>
                        <div className="plan__current">
                            <h2>روابط التسجيل الخاصة بالمجمع</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالنوع أو الحالة أو الرابط..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="plan__daily-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>النوع</th>
                                    <th>رابط التسجيل</th>
                                    <th>رمز QR</th>
                                    <th>الحالة</th>
                                    <th>عدد الاستخدامات</th>
                                    <th>تاريخ الإنشاء</th>
                                    <th>انتهاء الصلاحية</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLinks.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`plan__row ${item.status}`}
                                    >
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.type.includes("طلاب")
                                                        ? "bg-blue-100 text-blue-800"
                                                        : item.type.includes(
                                                                "موظفين",
                                                            )
                                                          ? "bg-purple-100 text-purple-800"
                                                          : item.type.includes(
                                                                  "معلمين",
                                                              )
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-indigo-100 text-indigo-800"
                                                }`}
                                            >
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="max-w-md">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono truncate block max-w-48">
                                                    {item.url}
                                                </code>
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            item.url,
                                                        )
                                                    }
                                                    className="p-1 rounded-full hover:bg-gray-200 transition-all"
                                                    title="نسخ الرابط"
                                                >
                                                    <FiCopy />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                    <IoQrCodeOutline className="text-gray-500 text-sm" />
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    متاح
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                                            >
                                                {item.status === "active"
                                                    ? "✅ نشط"
                                                    : "⭕ غير نشط"}
                                            </span>
                                        </td>
                                        <td className="font-medium">
                                            {item.usage}
                                        </td>
                                        <td className="text-sm">
                                            {item.created}
                                        </td>
                                        <td className="text-sm">
                                            {item.expires}
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn toggle-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100"
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            item.id,
                                                        )
                                                    }
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        "..."
                                                    ) : item.status ===
                                                      "active" ? (
                                                        <AiTwotoneStop />
                                                    ) : (
                                                        <IoPlayCircleOutline />
                                                    )}
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100"
                                                    title="تعديل"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn download-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-green-50 border-green-300 text-green-600 hover:bg-green-100"
                                                    title="تحميل QR"
                                                >
                                                    <FiDownload />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn view-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    title="عرض الإحصائيات"
                                                >
                                                    <FiEye />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    title="حذف"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLinks.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد روابط تسجيل حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="plan__stats">
                        <div className="stat-card">
                            <div className="stat-icon redColor">
                                <i>
                                    <GrStatusGood />
                                </i>
                            </div>
                            <div>
                                <h3>روابط نشطة</h3>
                                <p className="text-2xl font-bold text-red-600">
                                    3
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
                                <h3>إجمالي الاستخدامات</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    248
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
                                <h3>آخر تحديث</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    اليوم
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل الاستخدام</h1>
                            </div>
                            <p>78%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "78%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>نسبة الروابط النشطة</h1>
                            </div>
                            <p>75%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "75%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainLinks;
