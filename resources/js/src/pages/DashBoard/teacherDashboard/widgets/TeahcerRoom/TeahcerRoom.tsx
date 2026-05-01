import React, { useState, useEffect, useRef } from "react";
import { useTeacherRoom } from "./hooks/useTeacherRoom";
import { useSearchParams } from "react-router-dom";
import TeacherSessionsTable from "./models/TeacherSessionsTable";
import { ReactMediaRecorder } from "react-media-recorder";

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

function parseJitsiUrl(
    url: string,
): { domain: string; roomName: string } | null {
    try {
        const parsed = new URL(url);
        const domain = parsed.hostname;
        const roomName = parsed.pathname.replace(/^\//, "");
        if (!domain || !roomName) return null;
        return { domain, roomName };
    } catch {
        return null;
    }
}

function loadJitsiScript(domain: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const existingScript = document.getElementById("jitsi-external-api");
        if (existingScript) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.id = "jitsi-external-api";
        script.src = `https://${domain}/external_api.js`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("فشل تحميل Jitsi API"));
        document.head.appendChild(script);
    });
}

// ── أنواع الـ log ──
type LogLevel = "info" | "success" | "error" | "warn";
interface LogEntry {
    time: string;
    level: LogLevel;
    msg: string;
}

// ────────────────────────────────────────────────────────────────
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

    // ── Debug State ──
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [sessionTimer, setSessionTimer] = useState(0); // ثواني
    const [logId, setLogId] = useState<number | null>(null);
    const [sessionStatus, setSessionStatus] = useState<
        "idle" | "joined" | "left" | "error"
    >("idle");

    const { roomUrl, loadingRoom, error, isReady } = useTeacherRoom(scheduleId);

    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);
    const sessionLogIdRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // ── دالة إضافة log ──
    const addLog = (level: LogLevel, msg: string) => {
        const time = new Date().toLocaleTimeString("ar-EG");
        console[level === "success" ? "log" : level](`[${time}] ${msg}`);
        setLogs((prev) => [{ time, level, msg }, ...prev].slice(0, 50));
    };

    // ── Token helper ──
    const getToken = (): string => {
        const keys = ["token", "auth_token", "access_token", "sanctum_token"];
        for (const k of keys) {
            const v = localStorage.getItem(k) || sessionStorage.getItem(k);
            if (v) {
                addLog("info", `✅ وجدنا التوكن في key: "${k}"`);
                return v;
            }
        }
        // جرب كل keys في localStorage
        addLog(
            "warn",
            `⚠️ localStorage keys: ${Object.keys(localStorage).join(", ") || "فاضل"}`,
        );
        addLog(
            "warn",
            `⚠️ sessionStorage keys: ${Object.keys(sessionStorage).join(", ") || "فاضل"}`,
        );
        return "";
    };

    // ── بدء تايمر الجلسة ──
    const startSessionTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(
            () => setSessionTimer((p) => p + 1),
            1000,
        );
    };

    // ── وقف التايمر ──
    const stopSessionTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // ── تنسيق الوقت ──
    const fmtTimer = (t: number) => {
        const h = Math.floor(t / 3600);
        const m = Math.floor((t % 3600) / 60);
        const s = t % 60;
        return h > 0
            ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
            : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // ── دالة مساعدة تجيب الـ CSRF token من الـ meta tag ──
    const getCsrf = (): string =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ?? "";

    const apiHeaders = (): Record<string, string> => ({
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": getCsrf(),
        "X-Requested-With": "XMLHttpRequest",
    });

    // ────────────────────────────────────────────────────────────────
    // تسجيل الدخول لما الغرفة تبقى جاهزة
    // ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isReady || !scheduleId) {
            addLog(
                "info",
                `isReady=${isReady} | scheduleId=${scheduleId} → انتظار...`,
            );
            return;
        }

        addLog(
            "info",
            `🚀 الغرفة جاهزة! scheduleId=${scheduleId} → بنبعت join...`,
        );
        addLog("info", `🔑 CSRF Token: ${getCsrf() || "❌ مش موجود!"}`);

        // ── JOIN ──
        fetch("/api/session-logs/join", {
            method: "POST",
            credentials: "include",
            headers: apiHeaders(),
            body: JSON.stringify({
                schedule_id: scheduleId,
                circle_name: "حلقة المعلم",
            }),
        })
            .then(async (res) => {
                const text = await res.text();
                addLog("info", `📡 join status: ${res.status}`);
                addLog("info", `📡 join body: ${text.slice(0, 200)}`);
                try {
                    const d = JSON.parse(text);
                    if (d.success) {
                        sessionLogIdRef.current = d.log_id;
                        setLogId(d.log_id);
                        setSessionStatus("joined");
                        startSessionTimer();
                        addLog("success", `✅ JOIN OK — log_id=${d.log_id}`);
                    } else {
                        setSessionStatus("error");
                        addLog("error", `❌ JOIN failed: ${JSON.stringify(d)}`);
                    }
                } catch {
                    setSessionStatus("error");
                    addLog(
                        "error",
                        `❌ مش JSON — الـ route مش شغال أو في redirect`,
                    );
                }
            })
            .catch((err) => {
                setSessionStatus("error");
                addLog("error", `❌ fetch error: ${err.message}`);
            });

        // ── FORCE-LEAVE عند إغلاق التاب ──
        const handleUnload = () => {
            fetch("/api/session-logs/force-leave", {
                method: "POST",
                credentials: "include",
                headers: apiHeaders(),
                body: JSON.stringify({ schedule_id: scheduleId }),
                keepalive: true,
            });
        };
        window.addEventListener("beforeunload", handleUnload);

        // ── LEAVE عند unmount (رجع للوحة التحكم) ──
        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            stopSessionTimer();

            if (sessionLogIdRef.current !== null) {
                addLog(
                    "info",
                    `👋 unmount → leave log_id=${sessionLogIdRef.current}`,
                );
                fetch("/api/session-logs/leave", {
                    method: "POST",
                    credentials: "include",
                    headers: apiHeaders(),
                    body: JSON.stringify({ log_id: sessionLogIdRef.current }),
                })
                    .then(async (res) => {
                        const text = await res.text();
                        addLog(
                            "success",
                            `✅ LEAVE: ${res.status} — ${text.slice(0, 100)}`,
                        );
                    })
                    .catch((err) =>
                        addLog("error", `❌ leave error: ${err.message}`),
                    );
                sessionLogIdRef.current = null;
                setSessionStatus("left");
            }
        };
    }, [isReady, scheduleId]);

    // ────────────────────────────────────────────────────────────
    // تهيئة Jitsi
    // ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isReady || !roomUrl) return;
        const parsed = parseJitsiUrl(roomUrl);
        if (!parsed) return;
        const { domain, roomName } = parsed;
        let destroyed = false;

        loadJitsiScript(domain)
            .then(() => {
                if (
                    destroyed ||
                    !jitsiContainerRef.current ||
                    !window.JitsiMeetExternalAPI
                )
                    return;
                if (jitsiApiRef.current) {
                    jitsiApiRef.current.dispose();
                    jitsiApiRef.current = null;
                }
                jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, {
                    roomName,
                    parentNode: jitsiContainerRef.current,
                    width: "100%",
                    height: "100%",
                    configOverwrite: {
                        prejoinPageEnabled: false,
                        disableDeepLinking: true,
                        disableMobileDock: true,
                        hideConferenceTimer: false,
                        enableWelcomePage: false,
                        disableInviteFunctions: false,
                        requireDisplayName: false,
                        enableClosePage: false,
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        disableRemoteMute: false,
                        doNotStoreRoom: true,
                    },
                    interfaceConfigOverwrite: {
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        SHOW_BRAND_WATERMARK: false,
                        MOBILE_APP_PROMO: false,
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                        HIDE_INVITE_MORE_HEADER: true,
                        TOOLBAR_BUTTONS: [
                            "microphone",
                            "camera",
                            "desktop",
                            "fullscreen",
                            "fodeviceselection",
                            "hangup",
                            "chat",
                            "raisehand",
                            "tileview",
                            "participants-pane",
                        ],
                    },
                    userInfo: { displayName: "المعلم" },
                });
            })
            .catch((err) => addLog("error", `❌ Jitsi: ${err.message}`));

        return () => {
            destroyed = true;
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
        };
    }, [isReady, roomUrl]);

    // ── مؤقت تسجيل الشاشة ──
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

    // ── ألوان الـ status ──
    const statusColor: Record<string, string> = {
        idle: "#888",
        joined: "#22c55e",
        left: "#f59e0b",
        error: "#ef4444",
    };
    const logColor: Record<LogLevel, string> = {
        info: "#94a3b8",
        success: "#22c55e",
        error: "#ef4444",
        warn: "#f59e0b",
    };

    // ────────────────────────────────────────────────────────────
    return (
        <div className="tr-page">
            {/* ── زر الرجوع ── */}
            <button
                className="tr-back-btn"
                onClick={() => window.history.back()}
            >
                ← العودة للوحة التحكم
            </button>

            {/* ════════════════════════════════════════════════
                DEBUG PANEL
            ════════════════════════════════════════════════ */}

            {/* ── بطاقة الفيديو ── */}
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
                    {loadingRoom && (
                        <div className="tr-vr-placeholder">
                            <div className="tr-vr-placeholder-icon">🕌</div>
                            <p>جارٍ تحضير الغرفة...</p>
                        </div>
                    )}
                    {error && (
                        <div className="tr-vr-placeholder tr-vr-error">
                            <div className="tr-vr-placeholder-icon">⚠️</div>
                            <p>{error}</p>
                        </div>
                    )}
                    <div
                        ref={jitsiContainerRef}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: isReady ? "block" : "none",
                        }}
                    />
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

            {/* ── الشبكة السفلية ── */}
            <div className="tr-grid">
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
