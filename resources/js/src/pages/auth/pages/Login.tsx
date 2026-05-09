import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useOtpTimer } from "../hooks/useOtpTimer";
import { useOtpInputs } from "../hooks/useOtpInputs";
import { useOtpVerification } from "../hooks/useOtpVerification";
import ModalNotification from "../../../../components/ModalNotification";
import CentersSection from "../components/CentersSection";
import logo from "../../../assets/images/logo.png";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [codeError, setCodeError] = useState(false);

    const { timer, resendCode, isTimerActive } = useOtpTimer();
    const { inputsRef, otpValue, otpFilled, handleInputChange, handleKeyDown } =
        useOtpInputs();
    const { loading, sendOtp, verifyOtp, modal, closeModal } =
        useOtpVerification();

    const { centerSlug: paramSlug } = useParams<{ centerSlug?: string }>();
    const location = useLocation();

    const getCenterSlug = (): string | null => {
        const pathParts = location.pathname.split("/").filter(Boolean);
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (pathParts[i + 1] === "login") return pathParts[i];
        }
        return paramSlug || null;
    };
    const centerSlug = getCenterSlug();

    const handleSendOtp = async () => {
        if (!email || email.trim().length < 5) {
            alert("البريد الإلكتروني غير صالح.");
            return;
        }
        await sendOtp(email, centerSlug);
        setShowOtp(true);
        setCodeError(false);
    };

    const handleVerifyCode = () => {
        const code = Array.isArray(otpValue)
            ? otpValue.join("")
            : String(otpValue);
        if (!code || code.length !== 4) {
            setCodeError(true);
            return;
        }
        verifyOtp(code, () => {
            // بعد الدخول روح للمجمع لو موجود، أو الرئيسية
            window.location.href = centerSlug ? `/${centerSlug}` : "/";
        });
    };

    // ── روابط التسجيل تحافظ على الـ slug دايمًا ──
    const getRegisterLink = () =>
        centerSlug ? `/register/${centerSlug}` : "/center-register";
    const getTeacherRegisterLink = () =>
        centerSlug ? `/${centerSlug}/teacher-register` : "/center-register";

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap');
                .lp-root { min-height:100vh; background:#f0f9f5; display:flex; align-items:center; justify-content:center; padding:2rem 1rem; direction:rtl; font-family:'Tajawal',sans-serif; position:relative; overflow:hidden; }
                .lp-bg-geo { position:fixed; inset:0; pointer-events:none; z-index:0; }
                .lp-bg-geo::before { content:''; position:absolute; top:-120px; right:-120px; width:500px; height:500px; background:radial-gradient(circle,rgba(15,110,86,.12) 0%,transparent 70%); border-radius:50%; }
                .lp-bg-geo::after { content:''; position:absolute; bottom:-80px; left:-80px; width:400px; height:400px; background:radial-gradient(circle,rgba(15,110,86,.08) 0%,transparent 70%); border-radius:50%; }
                .lp-card { background:#fff; border-radius:24px; width:100%; max-width:420px; overflow:hidden; position:relative; z-index:1; box-shadow:0 0 0 1px rgba(15,110,86,.08),0 4px 6px rgba(0,0,0,.04),0 24px 48px rgba(15,110,86,.08); animation:lp-rise .5s cubic-bezier(.16,1,.3,1) forwards; opacity:0; transform:translateY(20px); }
                @keyframes lp-rise { to { opacity:1; transform:translateY(0); } }
                .lp-top-bar { height:3px; background:linear-gradient(90deg,#0F6E56 0%,#4ade80 50%,#0F6E56 100%); background-size:200% 100%; animation:lp-bar 3s linear infinite; }
                @keyframes lp-bar { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                .lp-header { padding:2rem 2rem 0; text-align:center; }
                .lp-logo-wrap { display:inline-flex; align-items:center; justify-content:center; width:60px; height:60px; background:linear-gradient(135deg,#0F6E56,#1a9e7a); border-radius:16px; margin-bottom:1rem; box-shadow:0 8px 24px rgba(15,110,86,.25); transition:transform .3s; }
                .lp-logo-wrap:hover { transform:rotate(-5deg) scale(1.05); }
                .lp-logo-wrap img { width:36px; filter:brightness(10); }
                .lp-title { font-size:1.5rem; font-weight:900; color:#0a1a14; margin-bottom:.25rem; }
                .lp-sub { font-size:.85rem; color:#6b7280; margin-bottom:1.75rem; }
                .lp-body { padding:0 2rem 2rem; }
                .lp-field { margin-bottom:1.25rem; }
                .lp-field label { display:block; font-size:.78rem; font-weight:700; color:#374151; margin-bottom:.4rem; letter-spacing:.02em; }
                .lp-input-wrap { position:relative; }
                .lp-input-icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#9ca3af; display:flex; transition:color .2s; }
                .lp-input-wrap:focus-within .lp-input-icon { color:#0F6E56; }
                .lp-input { width:100%; border:1.5px solid #e5e7eb; border-radius:12px; padding:12px 42px 12px 14px; font-size:.9rem; font-family:'Tajawal',sans-serif; outline:none; transition:all .2s; background:#fafbfa; color:#0a1a14; box-sizing:border-box; }
                .lp-input:focus { border-color:#0F6E56; background:#fff; box-shadow:0 0 0 3px rgba(15,110,86,.1); }
                .lp-input::placeholder { color:#c4c8c5; }
                .lp-btn { width:100%; padding:13px; border-radius:12px; background:linear-gradient(135deg,#0F6E56 0%,#1a9e7a 100%); color:white; border:none; font-size:.95rem; font-weight:700; font-family:'Tajawal',sans-serif; cursor:pointer; position:relative; overflow:hidden; transition:transform .15s,box-shadow .15s; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 16px rgba(15,110,86,.3); }
                .lp-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.15)); }
                .lp-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(15,110,86,.35); }
                .lp-btn:active:not(:disabled) { transform:translateY(0); }
                .lp-btn:disabled { opacity:.5; cursor:not-allowed; }
                .lp-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:lp-spin .7s linear infinite; }
                @keyframes lp-spin { to { transform:rotate(360deg); } }
                .lp-divider { display:flex; align-items:center; gap:10px; margin:1.5rem 0 .9rem; }
                .lp-divider::before,.lp-divider::after { content:''; flex:1; height:1px; background:#f0f0ef; }
                .lp-divider span { font-size:.74rem; color:#9ca3af; white-space:nowrap; }
                .lp-reg-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
                .lp-reg-card { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:14px; border:1.5px solid transparent; text-decoration:none; cursor:pointer; transition:all .2s cubic-bezier(.34,1.56,.64,1); position:relative; overflow:hidden; }
                .lp-reg-card::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.3) 0%,transparent 100%); opacity:0; transition:opacity .2s; }
                .lp-reg-card:hover { transform:translateY(-3px); }
                .lp-reg-card:hover::after { opacity:1; }
                .lp-reg-card.teacher { background:linear-gradient(135deg,#e8f5ef 0%,#f5fbf8 100%); border-color:rgba(15,110,86,.2); }
                .lp-reg-card.teacher:hover { border-color:rgba(15,110,86,.45); box-shadow:0 6px 20px rgba(15,110,86,.12); }
                .lp-reg-card.student { background:linear-gradient(135deg,#fef3e2 0%,#fffdf8 100%); border-color:rgba(186,117,23,.2); }
                .lp-reg-card.student:hover { border-color:rgba(186,117,23,.45); box-shadow:0 6px 20px rgba(186,117,23,.12); }
                .lp-reg-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .teacher .lp-reg-icon { background:rgba(15,110,86,.12); }
                .student .lp-reg-icon { background:rgba(186,117,23,.12); }
                .lp-reg-text { display:flex; flex-direction:column; gap:2px; }
                .lp-reg-title { font-size:.82rem; font-weight:800; }
                .teacher .lp-reg-title { color:#085041; }
                .student .lp-reg-title { color:#7c4a0a; }
                .lp-reg-sub { font-size:.7rem; opacity:.7; }
                .teacher .lp-reg-sub { color:#0F6E56; }
                .student .lp-reg-sub { color:#ba7517; }
                /* ── no-center notice ── */
                .lp-platform-notice { background:linear-gradient(135deg,#f0faf6,#e8f5ef); border:1px solid rgba(15,110,86,.2); border-radius:12px; padding:12px 14px; font-size:.8rem; color:#085041; line-height:1.55; margin-bottom:1.25rem; display:flex; gap:10px; align-items:flex-start; }
                .lp-platform-notice svg { flex-shrink:0; margin-top:1px; }
                /* OTP overlay */
                .lp-otp-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem; animation:lp-fade-in .25s ease; }
                @keyframes lp-fade-in { from{opacity:0} to{opacity:1} }
                .lp-otp-modal { background:#fff; border-radius:24px; width:100%; max-width:380px; overflow:hidden; animation:lp-modal-in .35s cubic-bezier(.16,1,.3,1); box-shadow:0 24px 64px rgba(0,0,0,.18); }
                @keyframes lp-modal-in { from{opacity:0;transform:scale(.92) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
                .lp-otp-head { background:linear-gradient(135deg,#0F6E56,#1a9e7a); padding:2rem; text-align:center; }
                .lp-otp-shield { width:56px; height:56px; background:rgba(255,255,255,.15); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:2px solid rgba(255,255,255,.25); animation:lp-pulse 2s ease infinite; }
                @keyframes lp-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.3)} 50%{box-shadow:0 0 0 10px rgba(255,255,255,.0)} }
                .lp-otp-head h2 { color:#fff; font-size:1.15rem; font-weight:800; margin-bottom:4px; }
                .lp-otp-head p { color:rgba(255,255,255,.75); font-size:.82rem; }
                .lp-otp-head strong { color:#fff; display:block; font-size:.85rem; margin-top:4px; }
                .lp-otp-body { padding:1.75rem 1.75rem 1.5rem; }
                .lp-otp-grid { display:flex; gap:10px; justify-content:center; margin-bottom:1.25rem; direction:ltr; }
                .lp-otp-input { width:58px; height:62px; border:2px solid #e5e7eb; border-radius:14px; text-align:center; font-size:1.6rem; font-weight:800; font-family:'Tajawal',sans-serif; outline:none; transition:all .2s; background:#fafbfa; color:#0a1a14; caret-color:#0F6E56; }
                .lp-otp-input:focus { border-color:#0F6E56; background:#fff; box-shadow:0 0 0 3px rgba(15,110,86,.1); transform:scale(1.05); }
                .lp-otp-input.filled { border-color:#0F6E56; background:#f0faf6; color:#0F6E56; }
                .lp-otp-input.error { border-color:#ef4444; background:#fff5f5; animation:lp-shake .4s ease; }
                @keyframes lp-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
                .lp-otp-err { text-align:center; font-size:.8rem; color:#ef4444; margin-bottom:1rem; padding:8px 12px; background:#fff5f5; border-radius:8px; border:1px solid #fecaca; }
                .lp-resend-row { display:flex; align-items:center; justify-content:center; gap:6px; font-size:.8rem; color:#9ca3af; margin-top:1rem; }
                .lp-resend-btn { color:#0F6E56; font-weight:700; border:none; background:none; cursor:pointer; font-family:inherit; font-size:inherit; padding:0; transition:opacity .2s; }
                .lp-resend-btn:disabled { opacity:.4; cursor:not-allowed; color:#9ca3af; }
                .lp-ghost-btn { display:block; width:100%; text-align:center; padding:9px; border:1.5px solid #e5e7eb; border-radius:10px; background:transparent; color:#6b7280; font-size:.82rem; font-family:'Tajawal',sans-serif; cursor:pointer; margin-top:.75rem; transition:all .2s; }
                .lp-ghost-btn:hover { border-color:#0F6E56; color:#0F6E56; background:#f0faf6; }
                .lp-footer { padding:.85rem 2rem; background:#fafbfa; border-top:1px solid #f0f0ef; text-align:center; font-size:.72rem; color:#9ca3af; display:flex; align-items:center; justify-content:center; gap:8px; }
                .lp-footer-dot { width:3px; height:3px; border-radius:50%; background:#d1d5db; }
            `}</style>

            <div className="lp-root">
                <div className="lp-bg-geo" />
                <div className="lp-card">
                    <div className="lp-top-bar" />
                    <div className="lp-header">
                        <div className="lp-logo-wrap">
                            <img src={logo} alt="إتقان" />
                        </div>
                        <div className="lp-title">مرحباً بك</div>
                        <div className="lp-sub">
                            {centerSlug
                                ? `تسجيل الدخول في مجمع /${centerSlug}`
                                : "أدخل بريدك الإلكتروني لتسجيل الدخول"}
                        </div>
                    </div>

                    <div className="lp-body">
                        <div className="lp-field">
                            <label>البريد الإلكتروني</label>
                            <div className="lp-input-wrap">
                                <span className="lp-input-icon">
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
                                <input
                                    className="lp-input"
                                    type="email"
                                    placeholder="parent@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <button
                            className="lp-btn"
                            onClick={handleSendOtp}
                            disabled={!email || email.length === 0 || loading}
                        >
                            {loading ? (
                                <>
                                    <span className="lp-spinner" /> جاري
                                    الإرسال...
                                </>
                            ) : (
                                <>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                    إرسال رمز التحقق
                                </>
                            )}
                        </button>

                        {/* ── تسجيل: يظهر فقط لو في مجمع ── */}
                        {centerSlug ? (
                            <>
                                <div className="lp-divider">
                                    <span>ليس لديك حساب؟ سجّل كـ</span>
                                </div>
                                <div className="lp-reg-grid">
                                    <a
                                        href={getTeacherRegisterLink()}
                                        className="lp-reg-card teacher"
                                    >
                                        <div className="lp-reg-icon">
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="#0F6E56"
                                                strokeWidth="2"
                                            >
                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                            </svg>
                                        </div>
                                        <div className="lp-reg-text">
                                            <span className="lp-reg-title">
                                                توظيف
                                            </span>
                                            <span className="lp-reg-sub">
                                                انضم كموظف قرآن
                                            </span>
                                        </div>
                                    </a>
                                    <a
                                        href={getRegisterLink()}
                                        className="lp-reg-card student"
                                    >
                                        <div className="lp-reg-icon">
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="#ba7517"
                                                strokeWidth="2"
                                            >
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                            </svg>
                                        </div>
                                        <div className="lp-reg-text">
                                            <span className="lp-reg-title">
                                                طالب
                                            </span>
                                            <span className="lp-reg-sub">
                                                سجّل كطالب جديد
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </>
                        ) : (
                            /* لو مفيش مجمع → خليه يسجل مجمع */
                            <>
                                <div className="lp-divider">
                                    <span>جديد على المنصة؟</span>
                                </div>
                                <div className="lp-platform-notice">
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#0F6E56"
                                        strokeWidth="2"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line
                                            x1="12"
                                            y1="16"
                                            x2="12.01"
                                            y2="16"
                                        />
                                    </svg>
                                    <span>
                                        تسجيل الطلاب والمعلمين يتم داخل مجمع
                                        معين. اختر مجمعك من القائمة أدناه أو{" "}
                                        <a
                                            href="/center-register"
                                            style={{
                                                color: "#0F6E56",
                                                fontWeight: 700,
                                            }}
                                        >
                                            سجّل مجمعك الجديد
                                        </a>
                                        .
                                    </span>
                                </div>
                            </>
                        )}

                        {/* قائمة المجمعات دايمًا */}
                        <CentersSection currentSlug={centerSlug} />
                    </div>

                    <div className="lp-footer">
                        <span>منصة إتقان لتسهيل حفظ القرآن</span>
                        <span className="lp-footer-dot" />
                        <span>بالقرآن نحيا</span>
                    </div>
                </div>
            </div>

            {showOtp && (
                <div className="lp-otp-overlay">
                    <div className="lp-otp-modal">
                        <div className="lp-otp-head">
                            <div className="lp-otp-shield">
                                <svg
                                    width="26"
                                    height="26"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                >
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <polyline points="9 12 11 14 15 10" />
                                </svg>
                            </div>
                            <h2>رمز التحقق</h2>
                            <p>أرسلنا رمزاً من 4 أرقام إلى</p>
                            <strong dir="ltr">{email}</strong>
                        </div>
                        <div className="lp-otp-body">
                            <div className="lp-otp-grid">
                                {Array.from({ length: 4 }, (_, index) => (
                                    <input
                                        key={index}
                                        ref={(el) =>
                                            (inputsRef.current[index] = el)
                                        }
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={otpValue[index] || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                index,
                                                e.target.value.slice(-1),
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(index, e)
                                        }
                                        onPaste={(e) => e.preventDefault()}
                                        className={`lp-otp-input${codeError ? " error" : ""}${otpValue[index] ? " filled" : ""}`}
                                        autoComplete="one-time-code"
                                    />
                                ))}
                            </div>
                            {codeError && (
                                <div className="lp-otp-err">
                                    الرمز غير صحيح، حاول مرة أخرى
                                </div>
                            )}
                            <button
                                className="lp-btn"
                                onClick={handleVerifyCode}
                                disabled={loading || !otpFilled}
                            >
                                {loading ? (
                                    <>
                                        <span className="lp-spinner" /> جاري
                                        التحقق...
                                    </>
                                ) : (
                                    "تسجيل الدخول"
                                )}
                            </button>
                            <div className="lp-resend-row">
                                <span>لم يصلك الرمز؟</span>
                                <button
                                    className="lp-resend-btn"
                                    onClick={resendCode}
                                    disabled={isTimerActive}
                                >
                                    {isTimerActive
                                        ? `إرسال مرة أخرى (${timer}ث)`
                                        : "إرسال مرة أخرى"}
                                </button>
                            </div>
                            <button
                                className="lp-ghost-btn"
                                onClick={() => {
                                    setShowOtp(false);
                                    setCodeError(false);
                                }}
                            >
                                تغيير البريد الإلكتروني
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ModalNotification
                show={modal.show}
                title={modal.title}
                message={modal.message}
                onClose={closeModal}
            />
        </>
    );
};

export default Login;
