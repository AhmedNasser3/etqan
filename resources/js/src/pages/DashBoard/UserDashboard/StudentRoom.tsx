// StudentRoom.tsx - مصحح نهائي بدون ريفريش + تسجيل كامل
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTeacherRoom } from "../teacherDashboard/widgets/TeahcerRoom/hooks/useTeacherRoom";
import { useSearchParams } from "react-router-dom";
import TeacherSessionsTable from "../teacherDashboard/widgets/TeahcerRoom/models/TeacherSessionsTable";

const StudentRoom: React.FC = () => {
    const [searchParams] = useSearchParams();
    const scheduleId =
        Number(searchParams.get("schedule")) || Number(searchParams.get("id"));

    const [showRecorder, setShowRecorder] = useState(false);
    const [showQuran, setShowQuran] = useState(false);
    const [rec, setRec] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);

    // ✅ العداد في ref بدل state لتجنب إعادة الرندر
    const recTRef = useRef(0);
    const timerDisplayRef = useRef<HTMLSpanElement | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { roomUrl, loadingRoom, error, isReady } = useTeacherRoom(scheduleId);

    const fmt = (t: number) => {
        const m = Math.floor(t / 60);
        const s = t % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const copy = useCallback(() => {
        navigator.clipboard.writeText(roomUrl || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [roomUrl]);

    // ✅ تشغيل العداد مباشرة بدون useEffect يعتمد على rec
    const startTimer = useCallback(() => {
        if (timerRef.current) return;
        recTRef.current = 0;
        timerRef.current = setInterval(() => {
            recTRef.current += 1;
            const t = recTRef.current;
            // ✅ تحديث DOM مباشرة بدون setState
            if (timerDisplayRef.current) {
                timerDisplayRef.current.textContent = fmt(t);
            }
            // تحديث زر الإيقاف أيضاً
            const stopBtnTimer = document.getElementById("stop-btn-timer");
            if (stopBtnTimer) {
                stopBtnTimer.textContent = `إيقاف التسجيل (${fmt(t)})`;
            }
            const recStatusTimer = document.getElementById("rec-status-timer");
            if (recStatusTimer) {
                recStatusTimer.textContent = `جاري التسجيل ${fmt(t)}`;
            }
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        recTRef.current = 0;
        if (timerDisplayRef.current) {
            timerDisplayRef.current.textContent = "0:00";
        }
    }, []);

    const handleStartRecording = useCallback(async () => {
        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 },
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            setStream(displayStream);
            chunksRef.current = [];

            const mediaRecorder = new MediaRecorder(displayStream, {
                mimeType: "video/webm;codecs=vp9,opus",
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: "video/webm",
                });
                const url = URL.createObjectURL(blob);
                setMediaBlobUrl(url);
                setRec(false);
                stopTimer();
                displayStream.getTracks().forEach((track) => track.stop());
                setStream(null);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(100);
            setRec(true);
            setShowRecorder(true);
            startTimer(); // ✅ تشغيل العداد مباشرة
        } catch (err: any) {
            console.error("خطأ في التسجيل:", err);
            if (err.name === "NotAllowedError") {
                alert("يرجى السماح بمشاركة الشاشة والصوت");
            } else if (err.name === "NotFoundError") {
                alert("لا توجد شاشة لمشاركتها");
            } else {
                alert("فشل في التسجيل\nاستخدم Chrome/Edge لأفضل أداء");
            }
        }
    }, [startTimer, stopTimer]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const clearRecording = useCallback(() => {
        if (mediaBlobUrl) {
            URL.revokeObjectURL(mediaBlobUrl);
            setMediaBlobUrl(null);
        }
    }, [mediaBlobUrl]);

    // ✅ cleanup عند unmount فقط
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (mediaBlobUrl) {
                URL.revokeObjectURL(mediaBlobUrl);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    function WG({ children }: { children: React.ReactNode }) {
        return <div className="widget">{children}</div>;
    }

    function WH({ t, right }: { t: string; right?: React.ReactNode }) {
        return (
            <div className="wh">
                <div className="wh-l">{t}</div>
                {right}
            </div>
        );
    }

    return (
        <div className="content">
            <div className="page-body">
                <button
                    className="back-btn"
                    onClick={() => window.history.back()}
                >
                    ← العودة للوحة التحكم
                </button>

                <div className="video-room">
                    <div className="vr-header">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 9,
                            }}
                        >
                            <div
                                style={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: "50%",
                                    background: "#4ade80",
                                    boxShadow: "0 0 0 3px rgba(74,222,128,.25)",
                                }}
                            />
                            <span
                                style={{
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 700,
                                }}
                            >
                                حضور الحصة
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                color: "rgba(255,255,255,.45)",
                                fontSize: 12,
                            }}
                        >
                            <span
                                style={{ fontSize: "16px", marginRight: "4px" }}
                            >
                                🕒
                            </span>
                            <span>الآن · مباشر</span>
                        </div>
                    </div>

                    <div className="vr-main" style={{ height: "1000px" }}>
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 1,
                                borderRadius: "inherit",
                            }}
                        >
                            {isReady && (
                                <iframe
                                    src={roomUrl}
                                    frameBorder="0"
                                    width="100%"
                                    height="100%"
                                    allow="camera; microphone; speaker; display-capture; fullscreen"
                                    allowFullScreen
                                    style={{
                                        borderRadius: "inherit",
                                        border: "none",
                                    }}
                                    title={`غرفة حصة ${scheduleId}`}
                                    onLoad={() =>
                                        console.log(
                                            "Jitsi iframe loaded:",
                                            roomUrl,
                                        )
                                    }
                                />
                            )}
                        </div>

                        <div className="teacher-cam">
                            <div className="teacher-cam-ring">
                                <div className="teacher-cam-av">
                                    <span
                                        style={{
                                            fontSize: 48,
                                            fontWeight: 900,
                                            color: "#fff",
                                        }}
                                    >
                                        م
                                    </span>
                                </div>
                            </div>
                            <div className="teacher-cam-name">المعلم</div>
                            <div className="cam-live">
                                <div className="live-dot" />
                                بث مباشر
                            </div>
                        </div>

                        <div className="student-pip">
                            <span
                                style={{
                                    fontSize: 18,
                                    fontWeight: 900,
                                    color: "#fff",
                                }}
                            >
                                أ
                            </span>
                            <span
                                style={{
                                    fontSize: 9,
                                    color: "rgba(255,255,255,.5)",
                                }}
                            >
                                أنت
                            </span>
                        </div>
                    </div>

                    <div className="vr-controls">
                        <button
                            className="vr-copy-btn"
                            onClick={copy}
                            style={{ marginRight: "auto" }}
                        >
                            {copied ? "تم النسخ!" : "نسخ الرابط"}
                        </button>

                        <button
                            className={`vr-rec-btn${rec ? " active" : ""}`}
                            onClick={() => {
                                if (rec) {
                                    handleStopRecording();
                                } else {
                                    handleStartRecording();
                                }
                            }}
                        >
                            {rec ? (
                                <>
                                    إيقاف التسجيل{" "}
                                    {/* ✅ span بـ ref يتحدث مباشرة بدون setState */}
                                    <span
                                        className="rec-timer"
                                        ref={timerDisplayRef}
                                    >
                                        0:00
                                    </span>
                                </>
                            ) : (
                                "تسجيل الشاشة"
                            )}
                        </button>
                        <button
                            className="vr-attend-btn"
                            onClick={() => setShowQuran(true)}
                        >
                            المصحف
                        </button>
                    </div>
                </div>

                <div
                    className="session-info-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(400px, 1fr)",
                        gap: "24px",
                        marginTop: "24px",
                    }}
                >
                    <WG>
                        <WH t="معلومات الحصة" />
                        <div className="wb">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    marginBottom: 14,
                                    paddingBottom: 14,
                                    borderBottom: "1px solid var(--n100)",
                                }}
                            >
                                <div
                                    className="st-av-big"
                                    style={{ fontSize: 32, fontWeight: 900 }}
                                >
                                    م
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 800,
                                            color: "var(--n900)",
                                        }}
                                    >
                                        حصة الطالب
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11.5,
                                            color: "var(--n400)",
                                            marginTop: 2,
                                        }}
                                    >
                                        حضور مباشر
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "7px 0",
                                    borderBottom: "1px solid var(--n100)",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: "var(--n400)",
                                        fontWeight: 600,
                                    }}
                                >
                                    الرابط
                                </span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "var(--n800)",
                                    }}
                                    dir="ltr"
                                >
                                    {roomUrl}
                                </span>
                            </div>
                            <div
                                className="url-row"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginTop: 12,
                                    padding: "12px",
                                    background: "var(--n50)",
                                    borderRadius: 8,
                                }}
                            >
                                <span
                                    style={{
                                        flex: 1,
                                        fontSize: 11,
                                        color: "var(--n400)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                    dir="ltr"
                                >
                                    {roomUrl}
                                </span>
                                <button
                                    className="url-copy-btn"
                                    onClick={copy}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        background: "var(--bp)",
                                        color: "white",
                                        border: "none",
                                    }}
                                >
                                    {copied ? "✓" : "نسخ"}
                                </button>
                            </div>
                        </div>
                    </WG>

                    {showRecorder && isReady && (
                        <WG>
                            <WH t="تسجيل الشاشة" />
                            <div className="wb">
                                <div
                                    className={`rec-status-box${rec ? " rec-active" : ""}`}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "16px",
                                        borderRadius: 12,
                                        background: rec
                                            ? "#fef2f2"
                                            : "var(--n50)",
                                        border: rec
                                            ? "2px solid var(--red)"
                                            : "1px solid var(--n200)",
                                    }}
                                >
                                    <div className="rec-status">
                                        <strong>الحالة:</strong>{" "}
                                        <span
                                            id="rec-status-timer"
                                            style={{
                                                color: rec
                                                    ? "var(--red)"
                                                    : "var(--n600)",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {rec
                                                ? "جاري التسجيل 0:00"
                                                : "جاهز للتسجيل"}
                                        </span>
                                    </div>
                                    {rec ? (
                                        <button
                                            className="stop-btn"
                                            onClick={handleStopRecording}
                                            id="stop-btn-timer"
                                            style={{
                                                marginLeft: "auto",
                                                padding: "8px 16px",
                                                background: "var(--red)",
                                                color: "white",
                                                borderRadius: 6,
                                                border: "none",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            إيقاف التسجيل (0:00)
                                        </button>
                                    ) : (
                                        <button
                                            className="start-btn"
                                            onClick={handleStartRecording}
                                            style={{
                                                marginLeft: "auto",
                                                padding: "8px 16px",
                                                background: "var(--bp)",
                                                color: "white",
                                                borderRadius: 6,
                                                border: "none",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            ابدأ التسجيل
                                        </button>
                                    )}
                                </div>

                                {mediaBlobUrl && (
                                    <div
                                        style={{
                                            marginTop: "16px",
                                            padding: "12px",
                                            background: "var(--g50)",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                        }}
                                    >
                                        <a
                                            href={mediaBlobUrl}
                                            download={`student-record-${scheduleId}-${Date.now()}.webm`}
                                            className="btn bp bsm"
                                            style={{
                                                display: "inline-block",
                                                padding: "10px 20px",
                                                margin: "4px",
                                                textDecoration: "none",
                                            }}
                                        >
                                            تحميل التسجيل
                                        </a>
                                        <button
                                            onClick={clearRecording}
                                            className="btn bd bsm"
                                            style={{
                                                padding: "10px 20px",
                                                margin: "4px",
                                            }}
                                        >
                                            مسح
                                        </button>
                                    </div>
                                )}

                                <div
                                    style={{
                                        marginTop: 14,
                                        padding: "12px 16px",
                                        background: "var(--n50)",
                                        borderRadius: 10,
                                        fontSize: 11.5,
                                        color: "var(--n400)",
                                        lineHeight: 1.7,
                                        textAlign: "center",
                                    }}
                                >
                                    يعمل على Chrome/Edge بجودة HD. يسجل الصوت
                                    والفيديو معاً.
                                </div>
                            </div>
                        </WG>
                    )}

                    {showQuran && isReady && (
                        <WG>
                            <WH t="المصحف الشريف" />
                            <div className="wb">
                                <div
                                    style={{
                                        padding: "16px",
                                        background: "#fff8e1",
                                        borderRadius: 12,
                                        border: "2px solid #ffc107",
                                        marginBottom: 16,
                                        textAlign: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            color: "#d97706",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        رواية حفص عن عاصم • المدني
                                    </div>
                                </div>
                                <div
                                    style={{
                                        height: "500px",
                                        background: "#f8f9fa",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        position: "relative",
                                        fontFamily: "'Amiri Quran', serif",
                                        direction: "rtl",
                                        border: "1px solid var(--n200)",
                                    }}
                                    dir="rtl"
                                >
                                    <iframe
                                        src="https://quran.com/1?translations=false"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            border: "none",
                                        }}
                                        title="المصحف الكامل"
                                    />
                                </div>
                            </div>
                        </WG>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentRoom;
