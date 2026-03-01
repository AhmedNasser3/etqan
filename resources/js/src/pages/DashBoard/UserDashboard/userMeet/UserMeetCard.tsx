import React from "react";
import { useUserNextMeet } from "./hooks/useUserNextMeet";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { IoCopy } from "react-icons/io5";
import toast from "react-hot-toast";
import GuardianChildrenPage from "../GuardianChildren/GuardianChildrenPage";

const UserMeetCard: React.FC = () => {
    const { meetData, loading, error, refetch } = useUserNextMeet();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="userProfile__meet">
                <div className="userProfile__inner">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#666",
                        }}
                    >
                        <div className="navbar">
                            <div className="navbar__inner">
                                <div className="navbar__loading">
                                    <div className="loading-spinner">
                                        <div className="spinner-circle"></div>
                                    </div>
                                </div>
                            </div>
                        </div>{" "}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !meetData) {
        return (
            <div className="userProfile__meet">
                <div className="userProfile__inner">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#999",
                            background: "#f8f9fa",
                            borderRadius: "12px",
                        }}
                    >
                        لا توجد حصص قادمة حالياً
                    </div>
                </div>
            </div>
        );
    }

    const copyRoomLink = async () => {
        try {
            await navigator.clipboard.writeText(meetData.jitsi_url);
            toast.success("✅ تم نسخ رابط الحصة!");
        } catch (err) {
            console.error("فشل في نسخ الرابط:", err);
            toast.error("❌ فشل في نسخ الرابط");
        }
    };

    // 🔥 ✅ يفتح TeacherRoom مع نفس الـ schedule ID
    const joinMeeting = () => {
        if (meetData.id) {
            // ينقل لصفحة TeacherRoom مع نفس طريقة الـ URL parameters
            navigate(`/teacher-dashboard/room?schedule=${meetData.id}`);
        } else {
            toast.error("❌ لا يمكن الدخول - معرف الحصة مفقود");
        }
    };

    return (
        <div className="userProfile__meet">
            <div className="userProfile__inner">
                <div className="userProfile__meetContainer">
                    {/* معلومات المعلم */}
                    <div className="userProfile__meet">
                        <div className="userProfile__meetImg">
                            <img
                                src={
                                    meetData.teacher_image ||
                                    "https://png.pngtree.com/png-vector/20230705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp"
                                }
                                alt={meetData.teacher_name}
                                style={{
                                    objectFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                        </div>
                        <div className="userProfile__meetContent">
                            <div className="userProfile__meetName">
                                <h1>{meetData.teacher_name}</h1>
                                {meetData.circle_name && (
                                    <span
                                        style={{
                                            fontSize: "0.9em",
                                            color: "#666",
                                            marginTop: "0.25rem",
                                        }}
                                    >
                                        {meetData.circle_name}
                                    </span>
                                )}
                            </div>
                            <div className="userProfile__rating">
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                            </div>
                        </div>
                    </div>

                    {/* تفاصيل الحصة */}
                    <div className="userProfile__meetDetails">
                        <div
                            style={{
                                marginTop: "1rem",
                                fontSize: "0.9em",
                                color: "#666",
                            }}
                        >
                            <strong>التاريخ:</strong> {meetData.schedule_date} |
                            <strong>الوقت:</strong> {meetData.start_time}
                        </div>
                        <div className="userProfile__meetConatin"></div>
                    </div>

                    {/* أزرار الحصة */}
                    <div className="userProfile__meetBtn">
                        {/* 🔥 ✅ الرابط يفتح TeacherRoom بالضغط عليه */}
                        <div
                            className="userProfile__meetBtnUrl"
                            onClick={joinMeeting} // ✅ نفس منطق زر الدخول - يفتح TeacherRoom
                            style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "12px",
                                background: "#f8f9fa",
                                borderRadius: "8px",
                                marginBottom: "0.5rem",
                                transition: "all 0.2s ease",
                                border: "1px solid #e9ecef",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#e3f2fd";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#f8f9fa";
                            }}
                            title="انقر للدخول للحصة"
                        >
                            <i>
                                <IoCopy />
                            </i>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "1rem",
                                    color: "#333",
                                }}
                            >
                                {meetData.jitsi_room_name}
                            </h1>
                        </div>

                        {/* زر دخول الحصة - نفس الوظيفة */}
                        <button
                            onClick={joinMeeting}
                            className="userProfile__button"
                            style={{
                                background: "#007bff",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "16px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                width: "100%",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#0056b3";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#007bff";
                            }}
                        >
                            دخول الحصة
                            <i>
                                <SiGoogledisplayandvideo360 />
                            </i>
                        </button>

                        {/* ✅ خيار نسخ الرابط بشكل منفصل */}
                        <button
                            onClick={copyRoomLink}
                            style={{
                                background: "#28a745",
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                                marginTop: "0.5rem",
                                width: "100%",
                            }}
                        >
                            📋 نسخ رابط الحصة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserMeetCard;
