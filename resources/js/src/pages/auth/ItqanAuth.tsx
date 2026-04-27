import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════
// TYPES
// ══════════════════════════════════════
type View = "login" | "register";
type Gender = "male" | "female" | "";

interface RegisterData {
    lastName: string;
    firstName: string;
    idNumber: string;
    birthDate: string;
    grade: string;
    quranLevel: string;
    circleTime: string;
    healthStatus: string;
    parentEmail: string;
    parentPhone: string;
    studentEmail: string;
    notes: string;
    gender: Gender;
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
const generateCode = () => String(Math.floor(1000 + Math.random() * 9000));
function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

// ══════════════════════════════════════
// SPINNER
// ══════════════════════════════════════
function Spinner() {
    return <div className="spinner" />;
}

// ══════════════════════════════════════
// OTP INPUT
// ══════════════════════════════════════
function OtpInput({
    code,
    setCode,
    refs,
    error,
    loading,
    onComplete,
}: {
    code: string[];
    setCode: (v: string[]) => void;
    refs: React.RefObject<HTMLInputElement>[];
    error: boolean;
    loading: boolean;
    onComplete: (v: string) => void;
}) {
    return (
        <div className="otp-wrap">
            {code.map((d, i) => (
                <input
                    key={i}
                    ref={refs[i]}
                    className={`otp-digit${error ? " otp-error" : ""}${d ? " otp-filled" : ""}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    disabled={loading}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const nc = [...code];
                        nc[i] = val.slice(-1);
                        setCode(nc);
                        if (val && i < 3) refs[i + 1].current?.focus();
                        if (nc.every((x) => x !== ""))
                            setTimeout(() => onComplete(nc.join("")), 150);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace" && !code[i] && i > 0) {
                            refs[i - 1].current?.focus();
                            const nc = [...code];
                            nc[i - 1] = "";
                            setCode(nc);
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                />
            ))}
        </div>
    );
}

// ══════════════════════════════════════
// FIELD COMPONENTS
// ══════════════════════════════════════
function FG({
    label,
    req,
    opt,
    hint,
    error,
    children,
}: {
    label: string;
    req?: boolean;
    opt?: boolean;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="field-wrap">
            <label className="field-label">
                {label}
                {req && <span className="req"> *</span>}
                {opt && <span className="opt-tag">اختياري</span>}
            </label>
            {children}
            {hint && <div className="field-hint">{hint}</div>}
            {error && <div className="field-err-msg">{error}</div>}
        </div>
    );
}

// ══════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════
export default function ItqanAuth() {
    const [view, setView] = useState<View>("login");

    // ── LOGIN STATE ──
    const [loginEmail, setLoginEmail] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginStep, setLoginStep] = useState<"email" | "otp" | "success">(
        "email",
    );
    const [loginCode, setLoginCode] = useState(["", "", "", ""]);
    const [sentCode, setSentCode] = useState("");
    const [codeError, setCodeError] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [loginErrors, setLoginErrors] = useState<{ email?: string }>({});
    const [loginSuccessAnim, setLoginSuccessAnim] = useState(false);
    const lRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    // ── REGISTER STATE ──
    const [regStep, setRegStep] = useState<"form" | "otp" | "success">("form");
    const [regLoading, setRegLoading] = useState(false);
    const [regCode, setRegCode] = useState(["", "", "", ""]);
    const [regSentCode, setRegSentCode] = useState("");
    const [regCodeError, setRegCodeError] = useState(false);
    const [regResendTimer, setRegResendTimer] = useState(0);
    const [regSuccessAnim, setRegSuccessAnim] = useState(false);
    const [errors, setErrors] = useState<
        Partial<Record<keyof RegisterData, string>>
    >({});
    const rRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];
    const [form, setForm] = useState<RegisterData>({
        lastName: "",
        firstName: "",
        idNumber: "",
        birthDate: "",
        grade: "",
        quranLevel: "",
        circleTime: "",
        healthStatus: "",
        parentEmail: "",
        parentPhone: "",
        studentEmail: "",
        notes: "",
        gender: "",
    });

    // Resend timers
    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
        return () => clearInterval(t);
    }, [resendTimer]);
    useEffect(() => {
        if (regResendTimer <= 0) return;
        const t = setInterval(() => setRegResendTimer((p) => p - 1), 1000);
        return () => clearInterval(t);
    }, [regResendTimer]);

    const upd = (k: keyof RegisterData, v: string) => {
        setForm((p) => ({ ...p, [k]: v }));
        if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
    };

    // ── LOGIN ──
    const doSendLoginCode = async () => {
        if (!loginEmail || !loginEmail.includes("@")) {
            setLoginErrors({ email: "الرجاء إدخال بريد إلكتروني صحيح" });
            return;
        }
        setLoginErrors({});
        setLoginLoading(true);
        await sleep(1300);
        const code = generateCode();
        setSentCode(code);
        console.log("🔐 Login OTP:", code);
        setLoginLoading(false);
        setLoginStep("otp");
        setResendTimer(60);
    };
    const doVerifyLoginCode = async (entered: string) => {
        setLoginLoading(true);
        await sleep(900);
        if (entered === sentCode) {
            setCodeError(false);
            setLoginStep("success");
            setTimeout(() => setLoginSuccessAnim(true), 80);
        } else {
            setCodeError(true);
            setLoginCode(["", "", "", ""]);
            lRefs[0].current?.focus();
        }
        setLoginLoading(false);
    };
    const doResendLogin = () => {
        if (resendTimer > 0) return;
        const c = generateCode();
        setSentCode(c);
        console.log("🔐 Resent login OTP:", c);
        setResendTimer(60);
        setLoginCode(["", "", "", ""]);
        setCodeError(false);
        lRefs[0].current?.focus();
    };

    // ── REGISTER ──
    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.gender) e.gender = "الرجاء اختيار الجنس";
        if (!form.lastName.trim()) e.lastName = "اللقب مطلوب";
        if (!form.firstName.trim()) e.firstName = "الاسم الأول مطلوب";
        if (!form.idNumber.trim()) e.idNumber = "رقم الهوية مطلوب";
        else if (!/^\d{10}$/.test(form.idNumber))
            e.idNumber = "يجب أن يكون 10 أرقام";
        if (!form.birthDate) e.birthDate = "تاريخ الميلاد مطلوب";
        if (!form.grade) e.grade = "المرحلة الدراسية مطلوبة";
        if (!form.healthStatus) e.healthStatus = "الحالة الصحية مطلوبة";
        if (!form.parentEmail.trim()) e.parentEmail = "بريد ولي الأمر مطلوب";
        else if (!form.parentEmail.includes("@"))
            e.parentEmail = "بريد إلكتروني غير صحيح";
        if (!form.parentPhone.trim()) e.parentPhone = "جوال ولي الأمر مطلوب";
        setErrors(e);
        if (Object.keys(e).length > 0) {
            // Scroll to first error
            setTimeout(
                () =>
                    document
                        .querySelector(".err, .field-error")
                        ?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        }),
                100,
            );
        }
        return Object.keys(e).length === 0;
    };
    const doRegSubmit = async () => {
        if (!validate()) return;
        setRegLoading(true);
        await sleep(1500);
        const code = generateCode();
        setRegSentCode(code);
        console.log("🔐 Register OTP:", code);
        setRegLoading(false);
        setRegStep("otp");
        setRegResendTimer(60);
    };
    const doVerifyRegCode = async (entered: string) => {
        setRegLoading(true);
        await sleep(900);
        if (entered === regSentCode) {
            setRegCodeError(false);
            setRegStep("success");
            setTimeout(() => setRegSuccessAnim(true), 80);
        } else {
            setRegCodeError(true);
            setRegCode(["", "", "", ""]);
            rRefs[0].current?.focus();
        }
        setRegLoading(false);
    };
    const doResendReg = () => {
        if (regResendTimer > 0) return;
        const c = generateCode();
        setRegSentCode(c);
        console.log("🔐 Resent reg OTP:", c);
        setRegResendTimer(60);
        setRegCode(["", "", "", ""]);
        setRegCodeError(false);
        rRefs[0].current?.focus();
    };

    const switchView = (v: View) => {
        setView(v);
        setErrors({});
        setLoginErrors({});
    };

    // ══════════════════════
    // RENDER
    // ══════════════════════
    return (
        <>
            <style>{CSS}</style>
            <div className="auth-root" dir="rtl">
                <div className="auth-bg-deco" />

                {/* ─── LOGIN VIEW ─── */}
                {view === "login" && (
                    <div className="auth-card" key="login">
                        {/* BRAND */}
                        <div className="brand-row">
                            <div className="brand-logo-mark" />
                            <div>
                                <div className="brand-name">
                                    إتقان<span>.</span>
                                </div>
                                <div className="brand-tagline">
                                    بالقرآن نحيا
                                </div>
                            </div>
                        </div>

                        {loginStep === "email" && (
                            <>
                                <div className="auth-heading">
                                    <h1>مرحباً بك</h1>
                                    <p>أدخل بريدك الإلكتروني لتسجيل الدخول</p>
                                </div>
                                <div className="form-stack">
                                    <FG
                                        label="البريد الإلكتروني"
                                        req
                                        error={loginErrors.email}
                                    >
                                        <div
                                            className={`input-box${loginErrors.email ? " err" : ""}`}
                                        >
                                            <EmailIcon />
                                            <input
                                                type="email"
                                                placeholder="parent@example.com"
                                                value={loginEmail}
                                                onChange={(e) => {
                                                    setLoginEmail(
                                                        e.target.value,
                                                    );
                                                    setLoginErrors({});
                                                }}
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    doSendLoginCode()
                                                }
                                                className="bare-input"
                                                dir="ltr"
                                            />
                                        </div>
                                    </FG>
                                    <button
                                        className="btn-primary"
                                        onClick={doSendLoginCode}
                                        disabled={loginLoading}
                                    >
                                        {loginLoading ? (
                                            <Spinner />
                                        ) : (
                                            "إرسال رمز التحقق"
                                        )}
                                    </button>
                                </div>
                                <div className="switch-row">
                                    <span>ليس لديك حساب؟</span>
                                    <button
                                        className="link-btn"
                                        onClick={() => switchView("register")}
                                    >
                                        إنشاء حساب جديد
                                    </button>
                                </div>
                            </>
                        )}

                        {loginStep === "otp" && (
                            <>
                                <div className="auth-heading">
                                    <div className="otp-shield">
                                        <ShieldIcon />
                                    </div>
                                    <h1>رمز التحقق</h1>
                                    <p>
                                        أرسلنا رمزاً من 4 أرقام إلى
                                        <br />
                                        <strong dir="ltr">{loginEmail}</strong>
                                    </p>
                                </div>
                                <div className="form-stack">
                                    <OtpInput
                                        code={loginCode}
                                        setCode={setLoginCode}
                                        refs={lRefs}
                                        error={codeError}
                                        loading={loginLoading}
                                        onComplete={doVerifyLoginCode}
                                    />
                                    {codeError && (
                                        <div className="otp-err-msg">
                                            الرمز غير صحيح، حاول مرة أخرى
                                        </div>
                                    )}
                                    <button
                                        className="btn-primary"
                                        onClick={() =>
                                            doVerifyLoginCode(
                                                loginCode.join(""),
                                            )
                                        }
                                        disabled={
                                            loginLoading ||
                                            loginCode.join("").length < 4
                                        }
                                    >
                                        {loginLoading ? (
                                            <Spinner />
                                        ) : (
                                            "تسجيل الدخول"
                                        )}
                                    </button>
                                    <div className="resend-row">
                                        <span>لم يصلك الرمز؟</span>
                                        <button
                                            className={`resend-btn${resendTimer > 0 ? " disabled" : ""}`}
                                            onClick={doResendLogin}
                                            disabled={resendTimer > 0}
                                        >
                                            {resendTimer > 0
                                                ? `إرسال مرة أخرى (${resendTimer}ث)`
                                                : "إرسال مرة أخرى"}
                                        </button>
                                    </div>
                                    <button
                                        className="ghost-btn"
                                        onClick={() => {
                                            setLoginStep("email");
                                            setLoginCode(["", "", "", ""]);
                                            setCodeError(false);
                                        }}
                                    >
                                        ← تغيير البريد الإلكتروني
                                    </button>
                                </div>
                            </>
                        )}

                        {loginStep === "success" && (
                            <div className="success-view">
                                <div
                                    className={`success-ring-wrap${loginSuccessAnim ? " go" : ""}`}
                                >
                                    <svg
                                        width={80}
                                        height={80}
                                        viewBox="0 0 80 80"
                                    >
                                        <circle
                                            cx={40}
                                            cy={40}
                                            r={36}
                                            stroke="var(--g400)"
                                            strokeWidth={3}
                                            fill="none"
                                            strokeDasharray={226}
                                            strokeDashoffset={
                                                loginSuccessAnim ? 0 : 226
                                            }
                                            style={{
                                                transition:
                                                    "stroke-dashoffset .7s .1s ease",
                                            }}
                                        />
                                        <polyline
                                            points="24,41 35,52 56,30"
                                            stroke="var(--g500)"
                                            strokeWidth={4}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                            strokeDasharray={50}
                                            strokeDashoffset={
                                                loginSuccessAnim ? 0 : 50
                                            }
                                            style={{
                                                transition:
                                                    "stroke-dashoffset .4s .6s ease",
                                            }}
                                        />
                                    </svg>
                                </div>
                                <h2>تم تسجيل الدخول</h2>
                                <p>مرحباً بك في منصة إتقان 👋</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── REGISTER VIEW ─── */}
                {view === "register" && (
                    <div className="auth-card reg-wide" key="register">
                        {/* BRAND */}
                        <div className="brand-row">
                            <div className="brand-logo-mark" />
                            <div>
                                <div className="brand-name">
                                    إتقان<span>.</span>
                                </div>
                                <div className="brand-tagline">
                                    بالقرآن نحيا
                                </div>
                            </div>
                        </div>

                        {regStep === "form" && (
                            <>
                                <div className="auth-heading">
                                    <h1>طلب تسجيل طالب</h1>
                                    <p>
                                        أكمل البيانات التالية وسيتم مراجعة طلبك
                                        من قِبل المشرف
                                    </p>
                                </div>
                                <div className="form-stack">
                                    {/* GENDER */}
                                    <FG
                                        label="الجنس"
                                        req
                                        error={errors.gender as string}
                                    >
                                        <div className="gender-row">
                                            {[
                                                {
                                                    v: "male" as Gender,
                                                    l: "ذكر",
                                                    svg: <MaleIcon />,
                                                },
                                                {
                                                    v: "female" as Gender,
                                                    l: "أنثى",
                                                    svg: <FemaleIcon />,
                                                },
                                            ].map((g) => (
                                                <button
                                                    key={g.v}
                                                    className={`gender-btn${form.gender === g.v ? " active" : ""}`}
                                                    onClick={() =>
                                                        upd("gender", g.v)
                                                    }
                                                >
                                                    <span className="g-svg">
                                                        {g.svg}
                                                    </span>
                                                    {g.l}
                                                    {form.gender === g.v && (
                                                        <span className="g-check">
                                                            <CheckIcon />
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </FG>

                                    {/* NAME */}
                                    <div className="row-2">
                                        <FG
                                            label="اللقب / الاسم الثاني"
                                            req
                                            error={errors.lastName as string}
                                        >
                                            <input
                                                className={`bare-field${errors.lastName ? " err" : ""}`}
                                                placeholder="... التميمي"
                                                value={form.lastName}
                                                onChange={(e) =>
                                                    upd(
                                                        "lastName",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </FG>
                                        <FG
                                            label="الاسم الأول"
                                            req
                                            error={errors.firstName as string}
                                        >
                                            <input
                                                className={`bare-field${errors.firstName ? " err" : ""}`}
                                                placeholder="... أحمد"
                                                value={form.firstName}
                                                onChange={(e) =>
                                                    upd(
                                                        "firstName",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </FG>
                                    </div>

                                    {/* ID & BIRTH */}
                                    <div className="row-2">
                                        <FG
                                            label="رقم الهوية"
                                            req
                                            error={errors.idNumber as string}
                                        >
                                            <input
                                                className={`bare-field${errors.idNumber ? " err" : ""}`}
                                                placeholder="1234567890"
                                                value={form.idNumber}
                                                onChange={(e) =>
                                                    upd(
                                                        "idNumber",
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            "",
                                                        ),
                                                    )
                                                }
                                                maxLength={10}
                                                dir="ltr"
                                            />
                                        </FG>
                                        <FG
                                            label="تاريخ الميلاد"
                                            req
                                            error={errors.birthDate as string}
                                        >
                                            <input
                                                type="date"
                                                className={`bare-field${errors.birthDate ? " err" : ""}`}
                                                value={form.birthDate}
                                                onChange={(e) =>
                                                    upd(
                                                        "birthDate",
                                                        e.target.value,
                                                    )
                                                }
                                                dir="ltr"
                                            />
                                        </FG>
                                    </div>

                                    {/* GRADE & HEALTH */}
                                    <div className="row-2">
                                        <FG
                                            label="المرحلة الدراسية"
                                            req
                                            error={errors.grade as string}
                                        >
                                            <select
                                                className={`bare-field${errors.grade ? " err" : ""}`}
                                                value={form.grade}
                                                onChange={(e) =>
                                                    upd("grade", e.target.value)
                                                }
                                            >
                                                <option value="">
                                                    اختر المرحلة
                                                </option>
                                                {[
                                                    "الابتدائية (1-3)",
                                                    "الابتدائية (4-6)",
                                                    "المتوسطة",
                                                    "الثانوية",
                                                    "الجامعة",
                                                    "أخرى",
                                                ].map((o) => (
                                                    <option key={o}>{o}</option>
                                                ))}
                                            </select>
                                        </FG>
                                        <FG
                                            label="الحالة الصحية"
                                            req
                                            error={
                                                errors.healthStatus as string
                                            }
                                        >
                                            <select
                                                className={`bare-field${errors.healthStatus ? " err" : ""}`}
                                                value={form.healthStatus}
                                                onChange={(e) =>
                                                    upd(
                                                        "healthStatus",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    اختر الحالة
                                                </option>
                                                {[
                                                    "سليم (لا توجد أمراض)",
                                                    "صعوبات تعلم",
                                                    "مشكلة نطق",
                                                    "إعاقة حركية",
                                                    "أمراض مزمنة",
                                                    "أخرى",
                                                ].map((o) => (
                                                    <option key={o}>{o}</option>
                                                ))}
                                            </select>
                                        </FG>
                                    </div>

                                    {/* QURAN LEVEL */}
                                    <FG label="مستوى القراءة / الحفظ" opt>
                                        <input
                                            className="bare-field"
                                            placeholder="مثال: جُزء عم + 5 أجزاء حفظ"
                                            value={form.quranLevel}
                                            onChange={(e) =>
                                                upd(
                                                    "quranLevel",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </FG>

                                    {/* CIRCLE TIME */}
                                    <FG label="وقت الحلقة المفضّل" opt>
                                        <select
                                            className="bare-field"
                                            value={form.circleTime}
                                            onChange={(e) =>
                                                upd(
                                                    "circleTime",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">اختر الوقت</option>
                                            {[
                                                "صباحاً (8ص - 12م)",
                                                "ظهراً (12م - 3م)",
                                                "عصراً (3م - 6م)",
                                                "مساءً (6م - 9م)",
                                                "مرن",
                                            ].map((o) => (
                                                <option key={o}>{o}</option>
                                            ))}
                                        </select>
                                    </FG>

                                    {/* DIVIDER */}
                                    <div className="section-div">
                                        <span>بيانات التواصل</span>
                                    </div>

                                    {/* PARENT EMAIL */}
                                    <FG
                                        label="بريد ولي الأمر الإلكتروني"
                                        req
                                        hint="سيُرسل رمز التحقق على هذا البريد"
                                        error={errors.parentEmail as string}
                                    >
                                        <div
                                            className={`input-box${errors.parentEmail ? " err" : ""}`}
                                        >
                                            <EmailIcon />
                                            <input
                                                type="email"
                                                placeholder="parent@example.com"
                                                value={form.parentEmail}
                                                onChange={(e) =>
                                                    upd(
                                                        "parentEmail",
                                                        e.target.value,
                                                    )
                                                }
                                                className="bare-input"
                                                dir="ltr"
                                            />
                                        </div>
                                    </FG>

                                    {/* PARENT PHONE */}
                                    <FG
                                        label="جوال ولي الأمر"
                                        req
                                        error={errors.parentPhone as string}
                                    >
                                        <div
                                            className={`input-box${errors.parentPhone ? " err" : ""}`}
                                            dir="ltr"
                                        >
                                            <span className="phone-flag">
                                                🇸🇦
                                            </span>
                                            <span className="phone-code">
                                                +966
                                            </span>
                                            <div className="phone-sep" />
                                            <input
                                                type="tel"
                                                placeholder="50 123 4567"
                                                value={form.parentPhone}
                                                onChange={(e) =>
                                                    upd(
                                                        "parentPhone",
                                                        e.target.value,
                                                    )
                                                }
                                                className="bare-input"
                                            />
                                        </div>
                                    </FG>

                                    {/* STUDENT EMAIL */}
                                    <FG label="بريد الطالب الإلكتروني" opt>
                                        <div className="input-box">
                                            <EmailIcon />
                                            <input
                                                type="email"
                                                placeholder="ahmed@example.com"
                                                value={form.studentEmail}
                                                onChange={(e) =>
                                                    upd(
                                                        "studentEmail",
                                                        e.target.value,
                                                    )
                                                }
                                                className="bare-input"
                                                dir="ltr"
                                            />
                                        </div>
                                    </FG>

                                    {/* NOTES */}
                                    <FG label="ملاحظات" opt>
                                        <textarea
                                            className="bare-field textarea-field"
                                            placeholder="ملاحظات إضافية..."
                                            value={form.notes}
                                            onChange={(e) =>
                                                upd("notes", e.target.value)
                                            }
                                            rows={3}
                                        />
                                    </FG>

                                    {/* SUBMIT */}
                                    <button
                                        className="btn-primary submit-big"
                                        onClick={doRegSubmit}
                                        disabled={regLoading}
                                    >
                                        {regLoading ? (
                                            <Spinner />
                                        ) : (
                                            <>
                                                <SendIcon /> إرسال طلب التسجيل
                                            </>
                                        )}
                                    </button>

                                    <div className="switch-row">
                                        <span>لديك حساب بالفعل؟</span>
                                        <button
                                            className="link-btn"
                                            onClick={() => switchView("login")}
                                        >
                                            تسجيل دخول
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {regStep === "otp" && (
                            <>
                                <div className="auth-heading">
                                    <div className="otp-shield">
                                        <ShieldIcon />
                                    </div>
                                    <h1>تأكيد البريد الإلكتروني</h1>
                                    <p>
                                        أرسلنا رمزاً من 4 أرقام إلى بريد ولي
                                        الأمر
                                        <br />
                                        <strong dir="ltr">
                                            {form.parentEmail}
                                        </strong>
                                    </p>
                                </div>
                                <div className="form-stack">
                                    <OtpInput
                                        code={regCode}
                                        setCode={setRegCode}
                                        refs={rRefs}
                                        error={regCodeError}
                                        loading={regLoading}
                                        onComplete={doVerifyRegCode}
                                    />
                                    {regCodeError && (
                                        <div className="otp-err-msg">
                                            الرمز غير صحيح، حاول مرة أخرى
                                        </div>
                                    )}
                                    <button
                                        className="btn-primary"
                                        onClick={() =>
                                            doVerifyRegCode(regCode.join(""))
                                        }
                                        disabled={
                                            regLoading ||
                                            regCode.join("").length < 4
                                        }
                                    >
                                        {regLoading ? (
                                            <Spinner />
                                        ) : (
                                            "تأكيد وإرسال الطلب"
                                        )}
                                    </button>
                                    <div className="resend-row">
                                        <span>لم يصلك الرمز؟</span>
                                        <button
                                            className={`resend-btn${regResendTimer > 0 ? " disabled" : ""}`}
                                            onClick={doResendReg}
                                            disabled={regResendTimer > 0}
                                        >
                                            {regResendTimer > 0
                                                ? `إرسال مرة أخرى (${regResendTimer}ث)`
                                                : "إرسال مرة أخرى"}
                                        </button>
                                    </div>
                                    <button
                                        className="ghost-btn"
                                        onClick={() => {
                                            setRegStep("form");
                                            setRegCode(["", "", "", ""]);
                                            setRegCodeError(false);
                                        }}
                                    >
                                        ← تعديل البيانات
                                    </button>
                                </div>
                            </>
                        )}

                        {regStep === "success" && (
                            <div className="success-view">
                                <div
                                    className={`success-ring-wrap${regSuccessAnim ? " go" : ""}`}
                                >
                                    <svg
                                        width={80}
                                        height={80}
                                        viewBox="0 0 80 80"
                                    >
                                        <circle
                                            cx={40}
                                            cy={40}
                                            r={36}
                                            stroke="var(--g400)"
                                            strokeWidth={3}
                                            fill="none"
                                            strokeDasharray={226}
                                            strokeDashoffset={
                                                regSuccessAnim ? 0 : 226
                                            }
                                            style={{
                                                transition:
                                                    "stroke-dashoffset .7s .1s ease",
                                            }}
                                        />
                                        <polyline
                                            points="24,41 35,52 56,30"
                                            stroke="var(--g500)"
                                            strokeWidth={4}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                            strokeDasharray={50}
                                            strokeDashoffset={
                                                regSuccessAnim ? 0 : 50
                                            }
                                            style={{
                                                transition:
                                                    "stroke-dashoffset .4s .6s ease",
                                            }}
                                        />
                                    </svg>
                                </div>
                                <h2>تم استلام طلبك</h2>
                                <p>
                                    سيتم مراجعة الطلب من قِبل المشرف
                                    <br />
                                    وسيتم التواصل معك عبر البريد الإلكتروني
                                </p>
                            </div>
                        )}

                        <div className="auth-footer-strip">
                            <span>منصة إتقان لتسهيل حفظ القرآن</span>
                            <span className="dot" />
                            <span>بالقرآن نحيا</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// ══ ICON COMPONENTS ══
const EmailIcon = () => (
    <svg
        width={15}
        height={15}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        style={{ color: "var(--n400)", flexShrink: 0 }}
    >
        <rect x={2} y={4} width={20} height={16} rx={2} />
        <polyline points="2,4 12,13 22,4" />
    </svg>
);
const ShieldIcon = () => (
    <svg
        width={26}
        height={26}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const CheckIcon = () => (
    <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const SendIcon = () => (
    <svg
        width={15}
        height={15}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
    >
        <line x1={22} y1={2} x2={11} y2={13} />
        <polygon
            points="22,2 15,22 11,13 2,9 22,2"
            fill="currentColor"
            stroke="none"
        />
    </svg>
);
const MaleIcon = () => (
    <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
    >
        <circle cx={10} cy={14} r={5} />
        <path d="M19 5l-5.5 5.5M19 5h-5M19 5v5" />
    </svg>
);
const FemaleIcon = () => (
    <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
    >
        <circle cx={12} cy={9} r={5} />
        <line x1={12} y1={14} x2={12} y2={22} />
        <line x1={9} y1={19} x2={15} y2={19} />
    </svg>
);

// ══════════════════════════════════════
// CSS
// ══════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
:root{
  --g50:#f0faf5;--g100:#d6f0e3;--g200:#a8dfc5;--g300:#6cc49f;
  --g400:#38a879;--g500:#1e8f61;--g600:#15724e;--g700:#0f5439;
  --n0:#fff;--n50:#f8fafc;--n100:#f1f5f9;--n200:#e2e8f0;
  --n300:#cbd5e1;--n400:#94a3b8;--n500:#64748b;--n600:#475569;
  --n700:#334155;--n800:#1e293b;--n900:#0f172a;
  --red:#ef4444;--red-bg:#fef2f2;
  --ease:cubic-bezier(.4,0,.2,1);
  --spring:cubic-bezier(.34,1.56,.64,1);
}
body,#root{font-family:'Tajawal',sans-serif;min-height:100vh;}

.auth-root{
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  padding:24px 16px;position:relative;
  background:linear-gradient(145deg,#edfaf4 0%,#f5f8ff 50%,#f5f0ff 100%);
  overflow-x:hidden;
}
.auth-bg-deco{
  position:fixed;inset:0;pointer-events:none;
  background:
    radial-gradient(ellipse 60% 40% at 15% 15%,rgba(30,143,97,.09) 0%,transparent 60%),
    radial-gradient(ellipse 50% 40% at 85% 85%,rgba(99,102,241,.07) 0%,transparent 60%),
    linear-gradient(rgba(30,143,97,.025) 1px,transparent 1px),
    linear-gradient(90deg,rgba(30,143,97,.025) 1px,transparent 1px);
  background-size:100%,100%,30px 30px,30px 30px;
}

.auth-card{
  background:rgba(255,255,255,.97);
  border-radius:24px;
  border:1px solid rgba(255,255,255,.9);
  box-shadow:0 2px 4px rgba(0,0,0,.03),0 12px 40px rgba(0,0,0,.08),0 0 0 1px rgba(30,143,97,.05);
  width:100%;max-width:430px;
  padding:32px 32px 24px;
  animation:cardIn .45s var(--spring);
  position:relative;z-index:1;
}
.reg-wide{max-width:560px;}
@keyframes cardIn{from{opacity:0;transform:translateY(18px) scale(.96);}to{opacity:1;transform:none;}}

/* BRAND */
.brand-row{display:flex;align-items:center;gap:12px;margin-bottom:24px;}
.brand-logo-mark{
  width:42px;height:42px;border-radius:13px;flex-shrink:0;
  background:linear-gradient(135deg,var(--g400),var(--g700));
  position:relative;box-shadow:0 4px 14px rgba(30,143,97,.28);
}
.brand-logo-mark::after{content:'';position:absolute;inset:9px;background:#fff;border-radius:50%;}
.brand-name{font-size:22px;font-weight:900;color:var(--n900);line-height:1.1;}
.brand-name span{color:var(--g400);}
.brand-tagline{font-size:11px;color:var(--n400);margin-top:1px;font-weight:600;}

/* HEADING */
.auth-heading{margin-bottom:24px;}
.auth-heading h1{font-size:20px;font-weight:800;color:var(--n900);margin-bottom:5px;}
.auth-heading p{font-size:13px;color:var(--n400);line-height:1.7;}
.auth-heading strong{color:var(--n700);font-weight:700;}

/* FORM */
.form-stack{display:flex;flex-direction:column;gap:16px;}
.field-wrap{display:flex;flex-direction:column;gap:5px;}
.field-label{font-size:12px;font-weight:700;color:var(--n700);}
.req{color:var(--red);}
.opt-tag{font-size:10px;font-weight:600;color:var(--n400);background:var(--n100);padding:1px 7px;border-radius:100px;margin-right:5px;}
.field-hint{font-size:11px;color:var(--n400);}
.field-err-msg{font-size:11px;color:var(--red);font-weight:700;display:flex;align-items:center;gap:5px;}
.field-err-msg::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--red);flex-shrink:0;}

.input-box{
  display:flex;align-items:center;gap:9px;
  background:var(--n50);border:1.5px solid var(--n200);
  border-radius:10px;padding:0 13px;height:46px;
  transition:all .18s var(--ease);
}
.input-box:focus-within{border-color:var(--g400);background:var(--n0);box-shadow:0 0 0 3px rgba(56,168,121,.12);}
.input-box.err{border-color:var(--red);}
.input-box.err:focus-within{box-shadow:0 0 0 3px rgba(239,68,68,.1);}
.bare-input{flex:1;border:none;background:transparent;font-family:'Tajawal',sans-serif;font-size:13px;color:var(--n800);outline:none;}
.bare-input::placeholder{color:var(--n400);}

.bare-field{
  width:100%;height:46px;padding:0 13px;
  background:var(--n50);border:1.5px solid var(--n200);
  border-radius:10px;font-family:'Tajawal',sans-serif;
  font-size:13px;color:var(--n800);outline:none;
  transition:all .18s var(--ease);
  appearance:auto;
}
.bare-field:focus{border-color:var(--g400);background:var(--n0);box-shadow:0 0 0 3px rgba(56,168,121,.12);}
.bare-field.err{border-color:var(--red);}
.bare-field::placeholder{color:var(--n400);}
.textarea-field{height:auto;padding:10px 13px;resize:vertical;line-height:1.6;}

.phone-flag{font-size:16px;flex-shrink:0;}
.phone-code{font-size:13px;font-weight:700;color:var(--n600);flex-shrink:0;}
.phone-sep{width:1px;height:20px;background:var(--n200);flex-shrink:0;}

.row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

/* GENDER */
.gender-row{display:flex;gap:10px;}
.gender-btn{
  flex:1;height:50px;border-radius:10px;
  border:1.5px solid var(--n200);background:var(--n50);
  display:flex;align-items:center;justify-content:center;gap:8px;
  font-size:13.5px;font-weight:700;color:var(--n600);cursor:pointer;
  font-family:'Tajawal',sans-serif;transition:all .2s var(--ease);
  position:relative;
}
.gender-btn:hover{border-color:var(--g300);background:var(--g50);color:var(--g600);}
.gender-btn.active{border-color:var(--g400);background:var(--g50);color:var(--g600);box-shadow:0 0 0 3px rgba(56,168,121,.12);}
.g-svg{display:flex;align-items:center;color:inherit;}
.g-check{position:absolute;top:6px;left:8px;color:var(--g500);}

/* SECTION DIV */
.section-div{
  display:flex;align-items:center;gap:10px;
  color:var(--n400);font-size:11.5px;font-weight:700;
  text-transform:uppercase;letter-spacing:.5px;
  padding:4px 0;
}
.section-div::before,.section-div::after{content:'';flex:1;height:1px;background:var(--n200);}

/* BUTTONS */
.btn-primary{
  width:100%;height:48px;border-radius:10px;
  background:linear-gradient(135deg,var(--g500),var(--g600));
  color:#fff;border:none;cursor:pointer;
  font-size:14px;font-weight:800;font-family:'Tajawal',sans-serif;
  display:flex;align-items:center;justify-content:center;gap:8px;
  box-shadow:0 4px 14px rgba(30,143,97,.28);
  transition:all .2s var(--ease);
}
.btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 22px rgba(30,143,97,.38);}
.btn-primary:active:not(:disabled){transform:scale(.97);}
.btn-primary:disabled{opacity:.6;cursor:not-allowed;}
.submit-big{height:54px;font-size:15px;border-radius:12px;}

.ghost-btn{
  background:none;border:none;color:var(--n400);cursor:pointer;
  font-size:12px;font-family:'Tajawal',sans-serif;font-weight:600;
  text-align:center;padding:2px 0;transition:color .15s;
}
.ghost-btn:hover{color:var(--g600);}

/* SWITCH / LINK */
.switch-row{
  display:flex;align-items:center;justify-content:center;
  gap:8px;font-size:12.5px;color:var(--n500);flex-wrap:wrap;
}
.link-btn{background:none;border:none;cursor:pointer;font-size:12.5px;font-weight:800;color:var(--g600);font-family:'Tajawal',sans-serif;text-decoration:underline;text-underline-offset:2px;}
.link-btn:hover{color:var(--g700);}

/* OTP */
.otp-shield{
  width:60px;height:60px;border-radius:50%;
  background:linear-gradient(135deg,var(--g50),var(--g100));
  border:1.5px solid var(--g200);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 14px;color:var(--g600);
}
.otp-wrap{display:flex;gap:12px;justify-content:center;direction:ltr;margin:2px 0;}
.otp-digit{
  width:66px;height:72px;
  border:2px solid var(--n200);border-radius:12px;
  background:var(--n50);font-size:28px;font-weight:900;
  color:var(--n900);text-align:center;outline:none;
  transition:all .18s var(--ease);font-family:'Tajawal',sans-serif;
  caret-color:var(--g500);
}
.otp-digit:focus{border-color:var(--g400);background:var(--n0);box-shadow:0 0 0 3px rgba(56,168,121,.15);transform:scale(1.06);}
.otp-digit.otp-filled{border-color:var(--g400);background:linear-gradient(135deg,var(--g50),rgba(56,168,121,.06));color:var(--g700);}
.otp-digit.otp-error{border-color:var(--red);background:var(--red-bg);animation:shake .4s;}
@keyframes shake{0%,100%{transform:translateX(0);}25%,75%{transform:translateX(-6px);}50%{transform:translateX(6px);}}
.otp-err-msg{text-align:center;font-size:12px;color:var(--red);font-weight:700;}

.resend-row{display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px;color:var(--n400);}
.resend-btn{background:none;border:none;cursor:pointer;font-size:12px;font-weight:700;color:var(--g600);font-family:'Tajawal',sans-serif;transition:.15s;}
.resend-btn.disabled{color:var(--n400);cursor:not-allowed;}
.resend-btn:not(.disabled):hover{color:var(--g700);text-decoration:underline;}

/* SUCCESS */
.success-view{text-align:center;padding:20px 0 10px;}
.success-ring-wrap{display:inline-block;margin-bottom:20px;}
.success-view h2{font-size:21px;font-weight:800;color:var(--g600);margin-bottom:8px;}
.success-view p{font-size:13px;color:var(--n400);line-height:1.7;}

/* FOOTER */
.auth-footer-strip{
  margin-top:22px;padding-top:16px;border-top:1px solid var(--n100);
  display:flex;align-items:center;justify-content:center;
  gap:10px;font-size:11px;color:var(--n400);flex-wrap:wrap;
}
.dot{width:3px;height:3px;border-radius:50%;background:var(--n300);}

/* SPINNER */
.spinner{width:20px;height:20px;border-radius:50%;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

/* RESPONSIVE */
@media(max-width:600px){
  .auth-card{padding:24px 18px 18px;border-radius:20px;}
  .row-2{grid-template-columns:1fr;}
  .otp-digit{width:58px;height:64px;font-size:24px;}
  .otp-wrap{gap:8px;}
}
@media(max-width:380px){
  .otp-digit{width:50px;height:56px;font-size:22px;}
}
`;
