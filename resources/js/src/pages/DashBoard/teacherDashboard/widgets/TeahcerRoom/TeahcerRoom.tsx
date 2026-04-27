import React, { useState, useEffect } from "react";
import { useTeacherRoom } from "./hooks/useTeacherRoom";
import { useSearchParams } from "react-router-dom";
import TeacherSessionsTable from "./models/TeacherSessionsTable";
import { ReactMediaRecorder } from "react-media-recorder";

const TeacherRoom: React.FC = () => {
    const [searchParams] = useSearchParams();
    const scheduleId =
        Number(searchParams.get("schedule")) || Number(searchParams.get("id"));
    const [showRecorder, setShowRecorder] = useState(false);
    const [showQuran, setShowQuran] = useState(false);
    const [rec, setRec] = useState(false);
    const [recT, setRecT] = useState(0);
    const [copied, setCopied] = useState(false);
    const [savedBlobUrl, setSavedBlobUrl] = useState<string | null>(null);

    const { roomUrl, loadingRoom, error, isReady } = useTeacherRoom(scheduleId);

    const fmt = (t: number) => {
        const m = Math.floor(t / 60);
        const s = t % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const copy = () => {
        navigator.clipboard.writeText(roomUrl || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        let iv: NodeJS.Timeout;
        if (rec) iv = setInterval(() => setRecT((p) => p + 1), 1000);
        else setRecT(0);
        return () => clearInterval(iv);
    }, [rec]);

    return (
        <div className="tr-page">
            {/* ───── زر الرجوع ───── */}
            <button
                className="tr-back-btn"
                onClick={() => window.history.back()}
            >
                ← العودة للوحة التحكم
            </button>

            {/* ───── بطاقة الفيديو ───── */}
            <div className="tr-vr-card">
                <div className="tr-bismillah">﷽</div>

                <div className="tr-vr-header">
                    <div className="tr-vr-live">
                        <span className="tr-live-dot" />
                        <span className="tr-vr-title">غرفة المعلم · مباشر</span>
                    </div>
                    <div className="tr-vr-time">🕒 الآن</div>
                </div>

                <div className="tr-vr-body">
                    {isReady ? (
                        <iframe
                            src={roomUrl}
                            frameBorder="0"
                            width="100%"
                            height="100%"
                            allow="camera; microphone; speaker; display-capture; fullscreen"
                            allowFullScreen
                            className="tr-iframe"
                            title={`غرفة حصة ${scheduleId}`}
                        />
                    ) : loadingRoom ? (
                        <div className="tr-vr-placeholder">
                            <div className="tr-vr-placeholder-icon">🕌</div>
                            <p>جارٍ تحضير الغرفة...</p>
                        </div>
                    ) : error ? (
                        <div className="tr-vr-placeholder tr-vr-error">
                            <div className="tr-vr-placeholder-icon">⚠️</div>
                            <p>{error}</p>
                        </div>
                    ) : null}
                </div>

                <div className="tr-vr-controls">
                    <button className="tr-vr-btn tr-btn-copy" onClick={copy}>
                        {copied ? "✅ تم النسخ!" : "📋 نسخ الرابط"}
                    </button>
                    <button
                        className={`tr-vr-btn tr-btn-rec${rec ? " tr-btn-rec--active" : ""}`}
                        onClick={() => {
                            setRec((r) => !r);
                            setShowRecorder(true);
                        }}
                    >
                        {rec ? (
                            <>
                                ⏹️ إيقاف{" "}
                                <span className="tr-rec-timer">
                                    {fmt(recT)}
                                </span>
                            </>
                        ) : (
                            "⏺️ تسجيل الشاشة"
                        )}
                    </button>
                    <button
                        className="tr-vr-btn tr-btn-quran"
                        onClick={() => setShowQuran((v) => !v)}
                    >
                        📖 المصحف
                    </button>
                    <button
                        className="tr-vr-btn tr-btn-plain"
                        onClick={() => setShowRecorder((v) => !v)}
                    >
                        📹 التسجيلات
                    </button>
                </div>
            </div>

            {/* ───── الشبكة السفلية ───── */}
            <div className="tr-grid">
                {/* المصحف */}
                {showQuran && (
                    <div className="tr-wg tr-wg--animate">
                        <div className="tr-wg-header">
                            <span className="tr-wg-title">المصحف الشريف</span>
                        </div>
                        <div className="tr-wg-body">
                            <div className="tr-quran-badge">
                                رواية حفص عن عاصم · المدني
                            </div>
                            <div className="tr-quran-frame">
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
                    </div>
                )}

                {/* تسجيل الشاشة */}
                {showRecorder && (
                    <div className="tr-wg tr-wg--animate">
                        <div className="tr-wg-header">
                            <span className="tr-wg-title">تسجيل الشاشة</span>
                        </div>
                        <div className="tr-wg-body">
                            <ReactMediaRecorder
                                screen
                                video
                                blobOptions={{ type: "video/webm" }}
                                onStop={(url) => setSavedBlobUrl(url)}
                                render={({ startRecording, stopRecording }) => (
                                    <>
                                        <div
                                            className={`tr-rec-box${rec ? " tr-rec-box--active" : ""}`}
                                        >
                                            {rec ? (
                                                <>
                                                    <span className="tr-rec-dot" />
                                                    <div>
                                                        <div className="tr-rec-label">
                                                            جارٍ التسجيل
                                                        </div>
                                                        <div className="tr-rec-dur">
                                                            المدة: {fmt(recT)}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="tr-action-btn tr-action-btn--red"
                                                        style={{
                                                            marginRight: "auto",
                                                        }}
                                                        onClick={() => {
                                                            stopRecording();
                                                            setRec(false);
                                                        }}
                                                    >
                                                        ⏹️ إيقاف
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span
                                                        style={{ fontSize: 22 }}
                                                    >
                                                        📹
                                                    </span>
                                                    <div>
                                                        <div className="tr-rec-label tr-rec-label--idle">
                                                            تسجيل الشاشة
                                                        </div>
                                                        <div className="tr-rec-dur">
                                                            اضغط لتسجيل الحصة
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="tr-action-btn tr-action-btn--green"
                                                        style={{
                                                            marginRight: "auto",
                                                        }}
                                                        onClick={() => {
                                                            startRecording();
                                                            setRec(true);
                                                            setSavedBlobUrl(
                                                                null,
                                                            );
                                                        }}
                                                    >
                                                        ⏺️ ابدأ
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {savedBlobUrl && !rec && (
                                            <a
                                                href={savedBlobUrl}
                                                download={`session-${scheduleId}-${Date.now()}.webm`}
                                                className="tr-download-btn"
                                            >
                                                💾 تحميل التسجيل
                                            </a>
                                        )}
                                        <p className="tr-rec-note">
                                            سيتم حفظ التسجيل على جهازك محلياً.
                                            تأكد من وجود مساحة كافية.
                                        </p>
                                    </>
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>

            <TeacherSessionsTable />
            <div className="tr-grid">
                {/* معلومات الحصة */}
                <div className="tr-wg">
                    <div className="tr-wg-header">
                        <span className="tr-wg-title">معلومات الحصة</span>
                    </div>
                    <div className="tr-wg-body">
                        <div className="tr-info-row">
                            <span className="tr-info-label">الغرفة</span>
                            <span className="tr-info-val">حصة مباشرة</span>
                        </div>
                        <div className="tr-info-row">
                            <span className="tr-info-label">الحالة</span>
                            <span className="tr-badge tr-badge--green">
                                نشط
                            </span>
                        </div>
                        <div className="tr-url-box">
                            <span className="tr-url-text" dir="ltr">
                                {roomUrl}
                            </span>
                            <button className="tr-url-copy" onClick={copy}>
                                {copied ? "✓" : "📋"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherRoom;
