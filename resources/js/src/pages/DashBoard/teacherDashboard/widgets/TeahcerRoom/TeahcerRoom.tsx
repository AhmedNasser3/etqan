// TeacherRoom.tsx - الكامل مع الـ Hook
import React from "react";
import { useTeacherRoom } from "./hooks/useTeacherRoom";
import { useSearchParams } from "react-router-dom";
import TeacherSessionsTable from "./models/TeacherSessionsTable";

const TeacherRoom: React.FC = () => {
    const [searchParams] = useSearchParams();
    const scheduleId =
        Number(searchParams.get("schedule")) || Number(searchParams.get("id"));

    const { roomUrl, loadingRoom, error, isReady } = useTeacherRoom(scheduleId);

    if (loadingRoom) {
        return (
            <div className="teacherRoom">
                <div className="TeacherRoom__inner">
                    <div className="teacherRoom__view">
                        <div
                            className="loading-placeholder"
                            style={{
                                width: "100%",
                                height: "800px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f8f9fa",
                                borderRadius: "8px",
                                fontSize: "18px",
                                color: "#666",
                            }}
                        >
                            ⏳ جاري تحميل غرفة الحصة...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !roomUrl) {
        return (
            <div className="teacherRoom">
                <div className="TeacherRoom__inner">
                    <div className="teacherRoom__view">
                        <div
                            className="error-placeholder"
                            style={{
                                width: "100%",
                                height: "800px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f8d7da",
                                borderRadius: "8px",
                                padding: "2rem",
                                textAlign: "center",
                                color: "#721c24",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "24px",
                                    marginBottom: "1rem",
                                }}
                            >
                                ❌ خطأ في تحميل الغرفة
                            </div>
                            <div
                                style={{
                                    fontSize: "16px",
                                    marginBottom: "1rem",
                                }}
                            >
                                {error || "الرابط غير متوفر"}
                            </div>
                            {scheduleId && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn btn-primary"
                                    style={{
                                        padding: "10px 20px",
                                        fontSize: "16px",
                                        borderRadius: "6px",
                                    }}
                                >
                                    إعادة المحاولة
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="teacherRoom">
            <div className="TeacherRoom__inner">
                <div className="teacherRoom__view">
                    {isReady && (
                        <iframe
                            src={roomUrl}
                            frameBorder="0"
                            width="100%"
                            height="800"
                            allow="camera; microphone; speaker; display-capture; fullscreen"
                            allowFullScreen
                            style={{
                                borderRadius: "8px",
                                border: "none",
                            }}
                            title={`غرفة حصة ${scheduleId}`}
                            onLoad={() =>
                                console.log("✅ Jitsi iframe loaded:", roomUrl)
                            }
                        />
                    )}
                </div>

                {/* معلومات الغرفة */}
                {isReady && roomUrl && (
                    <div
                        className="room-info"
                        style={{
                            padding: "1rem",
                            background: "#e9ecef",
                            borderRadius: "6px",
                            marginTop: "1rem",
                            fontSize: "14px",
                            textAlign: "center",
                        }}
                    >
                        📱 شارك الرابط:{" "}
                        <a
                            href={roomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#007bff", fontWeight: "bold" }}
                        >
                            {roomUrl.split("/").pop()}
                        </a>
                    </div>
                )}
                <TeacherSessionsTable />
            </div>
        </div>
    );
};

export default TeacherRoom;
