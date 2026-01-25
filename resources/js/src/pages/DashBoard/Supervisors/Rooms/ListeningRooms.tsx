import { useState } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill, RiVolumeUpFill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiStudent, PiClock, PiMicrophoneStage } from "react-icons/pi";
import { FiEdit2, FiPlay, FiPause, FiVolume2, FiVolumeX } from "react-icons/fi";
import { IoCheckmarkCircleOutline, IoMicOutline } from "react-icons/io5";

interface ListeningRoom {
    id: number;
    roomName: string;
    teacher: string;
    studentsCount: number;
    status: "متاح" | "مشغول" | "جلسة نشطة" | "مغلق";
    currentStudent: string;
    recitationLevel: string;
    duration: string;
    audioQuality: string;
    capacity: number;
    img: string;
}

const ListeningRooms: React.FC = () => {
    const [rooms, setRooms] = useState<ListeningRoom[]>([
        {
            id: 1,
            roomName: "غرفة 1 - الجزء 30",
            teacher: "أحمد العتيبي",
            studentsCount: 12,
            status: "جلسة نشطة",
            currentStudent: "محمد أحمد",
            recitationLevel: "ممتاز",
            duration: "00:12:45",
            audioQuality: "عالية",
            capacity: 15,
            img: "https://images.unsplash.com/photo-1516979187457-637a1ec31f91?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 2,
            roomName: "غرفة 2 - الجزء 15",
            teacher: "فاطمة الزهراني",
            studentsCount: 8,
            status: "متاح",
            currentStudent: "لا يوجد",
            recitationLevel: "—",
            duration: "00:00:00",
            audioQuality: "جيدة",
            capacity: 12,
            img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 3,
            roomName: "غرفة 3 - المراجعة",
            teacher: "عبدالرحمن القحطاني",
            studentsCount: 10,
            status: "مشغول",
            currentStudent: "عبدالله صالح",
            recitationLevel: "جيد جداً",
            duration: "00:08:23",
            audioQuality: "متوسطة",
            capacity: 14,
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("الكل");

    const filteredRooms = rooms.filter(
        (room) =>
            (room.roomName.includes(search) ||
                room.teacher.includes(search) ||
                room.currentStudent.includes(search)) &&
            (filterStatus === "الكل" || room.status === filterStatus),
    );

    const activeSessions = rooms.filter((r) => r.status === "جلسة نشطة").length;
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const occupancyRate = Math.round(
        (rooms.reduce((sum, r) => sum + r.studentsCount, 0) / totalCapacity) *
            100,
    );

    const handleJoinRoom = (roomId: number) => {
        toast.success("تم الانضمام للغرفة بنجاح!");
    };

    const handleMuteRoom = (roomId: number) => {
        toast("تم كتم الصوت مؤقتاً");
    };

    const handleStartSession = (roomId: number) => {
        setRooms((prev) =>
            prev.map((r) =>
                r.id === roomId ? { ...r, status: "جلسة نشطة" as const } : r,
            ),
        );
        toast.success("بدء جلسة تسميع جديدة!");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "جلسة نشطة":
                return "text-emerald-600 bg-emerald-100";
            case "متاح":
                return "text-green-600 bg-green-100";
            case "مشغول":
                return "text-blue-600 bg-blue-100";
            case "مغلق":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case "عالية":
                return "text-green-600";
            case "جيدة":
                return "text-blue-600";
            case "متوسطة":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="teacherMotivate" style={{ padding: "0 15%" }}>
            <div className="teacherMotivate__inner">
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            غرف التسميع المتقدمة{" "}
                            <span>{filteredRooms.length} غرفة</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            تحكم كامل بالصوت + جدولة جلسات + جودة عالية + مراقبة
                            فورية
                        </div>
                        <div className="plan__current">
                            <h2>لوحة تحكم غرف التسميع</h2>
                            <div
                                className="plan__date-range"
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                }}
                            >
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>جلسة نشطة</option>
                                    <option>متاح</option>
                                    <option>مشغول</option>
                                    <option>مغلق</option>
                                </select>
                                <input
                                    type="search"
                                    placeholder="البحث بالغرفة أو المعلم أو الطالب..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="p-2 border rounded flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="plan__daily-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>الغرفة</th>
                                    <th>المعلم</th>
                                    <th>الطلاب</th>
                                    <th>الحالة</th>
                                    <th>الطالب الحالي</th>
                                    <th>المستوى</th>
                                    <th>المدة</th>
                                    <th>جودة الصوت</th>
                                    <th>السعة</th>
                                    <th>التحكم</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.map((room) => (
                                    <tr
                                        key={room.id}
                                        className={`plan__row ${room.status}`}
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                                <img
                                                    src={room.img}
                                                    alt={room.roomName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-bold">
                                                    {room.roomName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {room.id}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{room.teacher}</td>
                                        <td>
                                            <span className="font-bold text-lg">
                                                {room.studentsCount}/
                                                {room.capacity}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(room.status)}`}
                                            >
                                                {room.status}
                                            </span>
                                        </td>
                                        <td className="font-medium">
                                            {room.currentStudent}
                                        </td>
                                        <td>
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                {room.recitationLevel}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                <GrStatusCritical className="inline mr-1" />
                                                {room.duration}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`font-bold ${getQualityColor(room.audioQuality)}`}
                                            >
                                                <RiVolumeUpFill className="inline mr-1" />
                                                {room.audioQuality}
                                            </span>
                                        </td>
                                        <td>{room.capacity}</td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn join-btn p-2 rounded-full border-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50 w-12 h-12 mr-1"
                                                    onClick={() =>
                                                        handleJoinRoom(room.id)
                                                    }
                                                    title="الانضمام للغرفة"
                                                >
                                                    <FiPlay />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn mute-btn p-2 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 w-12 h-12 mr-1"
                                                    onClick={() =>
                                                        handleMuteRoom(room.id)
                                                    }
                                                    title="كتم الصوت"
                                                >
                                                    <FiVolumeX />
                                                </button>
                                                {room.status === "متاح" && (
                                                    <button
                                                        className="teacherStudent__status-btn start-btn p-2 rounded-full border-2 border-green-300 text-green-600 hover:bg-green-50 w-12 h-12"
                                                        onClick={() =>
                                                            handleStartSession(
                                                                room.id,
                                                            )
                                                        }
                                                        title="بدء جلسة"
                                                    >
                                                        <IoMicOutline />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRooms.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد غرف تسميع لهذا الفلتر
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="plan__stats">
                        <div className="stat-card">
                            <div className="stat-icon greenColor">
                                <i>
                                    <PiMicrophoneStage />
                                </i>
                            </div>
                            <div>
                                <h3>جلسات نشطة</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {activeSessions}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blueColor">
                                <i>
                                    <PiStudent />
                                </i>
                            </div>
                            <div>
                                <h3>الإشغال</h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {occupancyRate}%
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon purpleColor">
                                <i>
                                    <PiClock />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي السعة</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {totalCapacity}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="inputs__verifyOTPBirth">
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل الإشغال</h1>
                            </div>
                            <p>{occupancyRate}%</p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{ width: `${occupancyRate}%` }}
                                ></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>جودة الصوت المتوسطة</h1>
                            </div>
                            <p>عالية</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "92%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeningRooms;
