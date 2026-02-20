// TeacherRoom.tsx - الكامل مع Screen Recorder باستخدام react-media-recorder
import React, { useState } from "react";
import { useTeacherRoom } from "./hooks/useTeacherRoom";
import { useSearchParams } from "react-router-dom";
import TeacherSessionsTable from "./models/TeacherSessionsTable";
import { ReactMediaRecorder } from "react-media-recorder";

const TeacherRoom: React.FC = () => {
    const [searchParams] = useSearchParams();
    const scheduleId =
        Number(searchParams.get("schedule")) || Number(searchParams.get("id"));
    const [showRecorder, setShowRecorder] = useState(false);

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
                        <>
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
                                    console.log(
                                        "✅ Jitsi iframe loaded:",
                                        roomUrl,
                                    )
                                }
                            />

                            {/* زر فتح Screen Recorder */}
                            <div
                                style={{
                                    position: "relative",
                                    marginTop: "-60px",
                                    display: "flex",
                                    justifyContent: "center",
                                    zIndex: 10,
                                }}
                            >
                                <button
                                    onClick={() =>
                                        setShowRecorder(!showRecorder)
                                    }
                                    className="btn btn-secondary"
                                    style={{
                                        padding: "8px 16px",
                                        fontSize: "14px",
                                        borderRadius: "20px",
                                        background: "#28a745",
                                        color: "white",
                                        border: "none",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    }}
                                >
                                    📹 {showRecorder ? "إخفاء" : "تسجيل الشاشة"}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Screen Recorder */}
                {isReady && showRecorder && (
                    <div
                        style={{
                            padding: "1rem",
                            background: "#f8f9fa",
                            borderRadius: "8px",
                            margin: "1rem 0",
                            textAlign: "center",
                        }}
                    >
                        <ReactMediaRecorder
                            screen
                            video
                            blobOptions={{ type: "video/webm" }}
                            render={({
                                status,
                                startRecording,
                                stopRecording,
                                mediaBlobUrl,
                            }) => (
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        justifyContent: "center",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            color: "#666",
                                            minHeight: "24px",
                                        }}
                                    >
                                        الحالة: <strong>{status}</strong>
                                    </div>

                                    <button
                                        onClick={startRecording}
                                        className="btn btn-success"
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: "6px",
                                            border: "none",
                                        }}
                                        disabled={status === "recording"}
                                    >
                                        ⏺️ ابدأ التسجيل
                                    </button>

                                    <button
                                        onClick={stopRecording}
                                        className="btn btn-danger"
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: "6px",
                                            border: "none",
                                        }}
                                        disabled={status !== "recording"}
                                    >
                                        ⏹️ إيقاف التسجيل
                                    </button>

                                    {mediaBlobUrl && (
                                        <>
                                            <a
                                                href={mediaBlobUrl}
                                                download={`screen-record-${scheduleId}-${Date.now()}.webm`}
                                                className="btn btn-primary"
                                                style={{
                                                    padding: "8px 16px",
                                                    borderRadius: "6px",
                                                    textDecoration: "none",
                                                }}
                                            >
                                                💾 تحميل الفيديو
                                            </a>
                                            <video
                                                src={mediaBlobUrl}
                                                controls
                                                style={{
                                                    maxWidth: "300px",
                                                    borderRadius: "6px",
                                                    marginTop: "10px",
                                                }}
                                                autoPlay
                                                muted
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                )}

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
