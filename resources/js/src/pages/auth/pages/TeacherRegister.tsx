import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTeacherRegister } from "../hooks/useTeacherRegister";
import CentersSection from "../components/CentersSection";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";
import logo from "../../../assets/images/logo.png";

const TeacherRegister: React.FC = () => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        "male",
    );
    const { centerSlug: paramSlug } = useParams<{ centerSlug?: string }>();
    const location = useLocation();

    const getCenterSlug = (): string | null => {
        const pathParts = location.pathname.split("/").filter(Boolean);
        // /:slug/teacher-register
        const idx = pathParts.indexOf("teacher-register");
        if (idx > 0) return pathParts[idx - 1];
        return paramSlug || null;
    };
    const resolvedSlug = getCenterSlug();

    const {
        data,
        loading,
        success,
        error,
        circles,
        schedules,
        selectedCircleId,
        circlesLoading,
        schedulesLoading,
        handleInputChange,
        handleCircleChange,
        handleScheduleChange,
        setGender,
        submitRegister,
        formatCircleWithTime,
    } = useTeacherRegister();

    // لو الـ hook بيعتمد على centerSlug من useParams، ومش بيلتقطه صح، نمرره يدويًا
    const centerSlug = resolvedSlug;
    const loginLink = centerSlug ? `/${centerSlug}/login` : "/login";

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        handleInputChange("role", e.target.value);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setGender(selectedGender);
        submitRegister();
    };

    const isDisabled = loading || !data.full_name || !data.email || !data.role;

    const progress = (() => {
        let p = 10;
        if (data.full_name) p += 30;
        if (data.role) p += 30;
        if (data.email) p += 30;
        return Math.min(p, 100);
    })();

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap');
                .tr-page { min-height:100vh; background:#f0f9f5; display:flex; align-items:flex-start; justify-content:center; padding:2rem 1rem 3rem; direction:rtl; font-family:'Tajawal',sans-serif; position:relative; }
                .tr-bg-geo { position:fixed; inset:0; pointer-events:none; z-index:0; }
                .tr-bg-geo::before { content:''; position:absolute; top:-100px; right:-100px; width:450px; height:450px; background:radial-gradient(circle,rgba(15,110,86,.1) 0%,transparent 70%); border-radius:50%; }
                .tr-card { background:#fff; border-radius:24px; width:100%; max-width:520px; overflow:hidden; position:relative; z-index:1; margin-top:80px; box-shadow:0 0 0 1px rgba(15,110,86,.08),0 24px 48px rgba(15,110,86,.08); animation:tr-rise .5s cubic-bezier(.16,1,.3,1) forwards; opacity:0; transform:translateY(20px); }
                @keyframes tr-rise { to{opacity:1;transform:translateY(0)} }
                .tr-progress { height:4px; background:#e5e7eb; }
                .tr-progress-fill { height:100%; background:linear-gradient(90deg,#0F6E56,#4ade80); border-radius:0 2px 2px 0; transition:width .4s cubic-bezier(.4,0,.2,1); }
                .tr-header { background:linear-gradient(135deg,#0F6E56,#0d5c48); padding:1.75rem 2rem 2.25rem; text-align:center; position:relative; }
                .tr-header::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:28px; background:#fff; border-radius:20px 20px 0 0; }
                .tr-logo-wrap { display:inline-flex; align-items:center; justify-content:center; width:56px; height:56px; background:rgba(255,255,255,.15); border-radius:15px; border:1.5px solid rgba(255,255,255,.25); margin-bottom:.85rem; transition:transform .3s; }
                .tr-logo-wrap:hover { transform:rotate(-5deg) scale(1.05); }
                .tr-logo-wrap img { width:32px; filter:brightness(10); }
                .tr-header-title { color:#fff; font-size:1.1rem; font-weight:800; margin-bottom:3px; }
                .tr-header-sub { color:rgba(255,255,255,.7); font-size:.8rem; }
                .tr-steps-row { display:flex; align-items:center; gap:8px; margin-bottom:1.5rem; }
                .tr-step { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:700; flex-shrink:0; transition:all .3s; }
                .tr-step.done { background:#0F6E56; color:#fff; }
                .tr-step.current { background:#0F6E56; color:#fff; box-shadow:0 0 0 4px rgba(15,110,86,.2); }
                .tr-step.idle { background:#f0f0ef; color:#9ca3af; }
                .tr-step-line { flex:1; height:1.5px; background:#e5e7eb; transition:background .3s; }
                .tr-step-line.done { background:#0F6E56; }
                .tr-body { padding:1.5rem 2rem 2rem; }
                .tr-section { font-size:.7rem; font-weight:700; color:#0F6E56; letter-spacing:.06em; text-transform:uppercase; margin-bottom:.75rem; display:flex; align-items:center; gap:8px; }
                .tr-section::after { content:''; flex:1; height:.5px; background:rgba(15,110,86,.15); }
                .tr-gender-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:1.5rem; }
                .tr-gender-btn { border:1.5px solid rgba(0,0,0,.1); border-radius:14px; padding:14px 10px; cursor:pointer; background:#fafbfa; display:flex; flex-direction:column; align-items:center; gap:8px; transition:all .2s cubic-bezier(.34,1.56,.64,1); font-size:.84rem; color:#9ca3af; position:relative; overflow:hidden; font-family:'Tajawal',sans-serif; }
                .tr-gender-btn.active { border-color:#0F6E56; background:linear-gradient(135deg,#e8f5ef,#f5fbf8); color:#085041; box-shadow:0 4px 14px rgba(15,110,86,.15); transform:scale(1.02); }
                .tr-gender-avatar { width:52px; height:52px; border-radius:50%; overflow:hidden; background:rgba(0,0,0,.05); display:flex; align-items:center; justify-content:center; }
                .tr-gender-btn.active .tr-gender-avatar { background:rgba(15,110,86,.1); }
                .tr-gender-avatar img { width:40px; }
                .tr-gender-check { position:absolute; top:8px; left:8px; width:20px; height:20px; border-radius:50%; background:#0F6E56; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; animation:tr-pop .2s cubic-bezier(.34,1.56,.64,1); }
                @keyframes tr-pop { from{transform:scale(0)} to{transform:scale(1)} }
                .tr-field { margin-bottom:1rem; }
                .tr-field label { display:block; font-size:.78rem; font-weight:700; color:#374151; margin-bottom:.4rem; }
                .tr-field label .req { color:#ef4444; margin-right:2px; }
                .tr-field label .opt { font-size:.68rem; font-weight:400; color:#9ca3af; background:#f3f4f6; border-radius:5px; padding:1px 7px; margin-right:6px; }
                .tr-input { width:100%; border:1.5px solid #e5e7eb; border-radius:12px; padding:11px 13px; font-size:.9rem; color:#0a1a14; background:#fafbfa; outline:none; transition:all .2s; font-family:'Tajawal',sans-serif; appearance:none; box-sizing:border-box; }
                .tr-input:focus { border-color:#0F6E56; background:#fff; box-shadow:0 0 0 3px rgba(15,110,86,.1); }
                .tr-input::placeholder { color:#c4c8c5; }
                textarea.tr-input { resize:vertical; min-height:88px; line-height:1.55; }
                .tr-select-wrap { position:relative; }
                .tr-select-wrap::after { content:''; position:absolute; left:13px; top:50%; transform:translateY(-50%); width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-top:5px solid #9ca3af; pointer-events:none; }
                .tr-select-wrap select.tr-input { padding-left:34px; cursor:pointer; }
                .tr-nested { margin-top:.75rem; padding:.85rem 1rem; background:#f0faf6; border-radius:12px; border:1px solid rgba(15,110,86,.15); }
                .tr-hint { font-size:.77rem; line-height:1.55; border-radius:9px; padding:9px 13px; margin-top:8px; border:1px solid; }
                .tr-hint.info { background:#f9fafb; color:#6b7280; border-color:#e5e7eb; }
                .tr-hint.err { background:#fff5f5; color:#7f1d1d; border-color:#fecaca; }
                .tr-hint.ok { background:#f0faf6; color:#085041; border-color:rgba(15,110,86,.25); }
                .tr-submit { width:100%; padding:13px; border-radius:12px; background:linear-gradient(135deg,#0F6E56,#1a9e7a); color:#fff; border:none; font-size:.95rem; font-weight:700; cursor:pointer; margin-top:.5rem; transition:transform .15s,box-shadow .15s; font-family:'Tajawal',sans-serif; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 16px rgba(15,110,86,.3); position:relative; overflow:hidden; }
                .tr-submit::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.1)); }
                .tr-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(15,110,86,.35); }
                .tr-submit:disabled { opacity:.5; cursor:not-allowed; }
                .tr-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:tr-spin .7s linear infinite; }
                @keyframes tr-spin { to{transform:rotate(360deg)} }
                .tr-divider { display:flex; align-items:center; gap:10px; margin:1.25rem 0 .75rem; }
                .tr-divider::before,.tr-divider::after { content:''; flex:1; height:.5px; background:#f0f0ef; }
                .tr-divider span { font-size:.73rem; color:#9ca3af; white-space:nowrap; }
                .tr-login-row { display:flex; align-items:center; justify-content:center; gap:6px; font-size:.8rem; color:#9ca3af; }
                .tr-login-row a { color:#0F6E56; font-weight:700; text-decoration:none; }
                .tr-footer { padding:.85rem 2rem; background:#fafbfa; border-top:1px solid #f0f0ef; text-align:center; font-size:.72rem; color:#9ca3af; display:flex; align-items:center; justify-content:center; gap:8px; }
                .tr-footer-dot { width:3px; height:3px; border-radius:50%; background:#d1d5db; }
                /* no-center guard */
                .tr-no-center { margin:1rem 2rem 1.5rem; background:linear-gradient(135deg,#fff8e1,#fffdf5); border:1px solid rgba(186,117,23,.25); border-radius:12px; padding:13px 15px; font-size:.82rem; color:#7c4a0a; line-height:1.6; display:flex; gap:10px; align-items:flex-start; }
                .tr-no-center a { color:#ba7517; font-weight:700; text-decoration:none; }
            `}</style>

            <div className="tr-page">
                <div className="tr-bg-geo" />
                <div className="tr-card">
                    <div className="tr-progress">
                        <div
                            className="tr-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="tr-header">
                        <div className="tr-logo-wrap">
                            <img src={logo} alt="إتقان" />
                        </div>
                        <div className="tr-header-title">
                            طلب تسجيل معلم / مشرف
                        </div>
                        <div className="tr-header-sub">
                            {centerSlug
                                ? `التسجيل في مجمع /${centerSlug}`
                                : "أكمل البيانات التالية وسيتم مراجعة طلبك من قِبل المشرف"}
                        </div>
                    </div>

                    {/* ── guard: لو مفيش مجمع ── */}
                    {!centerSlug ? (
                        <div className="tr-no-center">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#ba7517"
                                strokeWidth="2"
                            >
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <span>
                                تسجيل المعلمين يتم داخل مجمع معين. اختر مجمعك من
                                القائمة أدناه أو{" "}
                                <a href="/center-register">سجّل مجمعك الجديد</a>
                                .
                            </span>
                        </div>
                    ) : (
                        <div className="tr-body">
                            <div className="tr-steps-row">
                                <div className="tr-step done">1</div>
                                <div
                                    className={`tr-step-line${data.full_name ? " done" : ""}`}
                                />
                                <div
                                    className={`tr-step${data.full_name ? " done" : " current"}`}
                                >
                                    2
                                </div>
                                <div
                                    className={`tr-step-line${data.email && data.role ? " done" : ""}`}
                                />
                                <div
                                    className={`tr-step${data.email && data.role ? " current" : " idle"}`}
                                >
                                    3
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="tr-section">الجنس</div>
                                <div className="tr-gender-row">
                                    {[
                                        {
                                            v: "male" as const,
                                            l: "ذكر",
                                            img: Men,
                                        },
                                        {
                                            v: "female" as const,
                                            l: "أنثى",
                                            img: Woman,
                                        },
                                    ].map((g) => (
                                        <button
                                            key={g.v}
                                            type="button"
                                            className={`tr-gender-btn${selectedGender === g.v ? " active" : ""}`}
                                            onClick={() =>
                                                setSelectedGender(g.v)
                                            }
                                        >
                                            <div className="tr-gender-avatar">
                                                <img src={g.img} alt={g.l} />
                                            </div>
                                            <span>{g.l}</span>
                                            {selectedGender === g.v && (
                                                <span className="tr-gender-check">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="tr-section">
                                    البيانات الأساسية
                                </div>

                                <div className="tr-field">
                                    <label>
                                        الاسم رباعي{" "}
                                        <span className="req">*</span>
                                    </label>
                                    <input
                                        required
                                        className="tr-input"
                                        type="text"
                                        value={data.full_name}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "full_name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder={
                                            selectedGender === "male"
                                                ? "أحمد محمد علي أحمد"
                                                : "فاطمة محمد علي فاطمة"
                                        }
                                    />
                                </div>

                                <div className="tr-field">
                                    <label>
                                        الدور المطلوب{" "}
                                        <span className="req">*</span>
                                    </label>
                                    <div className="tr-select-wrap">
                                        <select
                                            className="tr-input"
                                            value={data.role}
                                            onChange={handleRoleChange}
                                        >
                                            <option value="">اختر الدور</option>
                                            <option value="teacher">
                                                معلم
                                            </option>
                                            <option value="supervisor">
                                                مشرف تعليمي
                                            </option>
                                            <option value="motivator">
                                                مشرف تحفيز
                                            </option>
                                            <option value="student_affairs">
                                                شؤون الطلاب
                                            </option>
                                            <option value="financial">
                                                مشرف مالي
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {data.role === "teacher" && (
                                    <div className="tr-field">
                                        <label>
                                            الحلقات المتاحة في{" "}
                                            <strong>{centerSlug}</strong>
                                            <span className="opt">اختياري</span>
                                        </label>
                                        {circlesLoading ? (
                                            <div className="tr-hint info">
                                                جاري تحميل الحلقات...
                                            </div>
                                        ) : circles.length > 0 ? (
                                            <>
                                                <div className="tr-select-wrap">
                                                    <select
                                                        className="tr-input"
                                                        value={
                                                            selectedCircleId ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleCircleChange(
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            اختيار حلقة
                                                            (اختياري)
                                                        </option>
                                                        {circles.map((c) => (
                                                            <option
                                                                key={c.id}
                                                                value={c.id}
                                                            >
                                                                {formatCircleWithTime(
                                                                    c,
                                                                )}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {data.circle_id &&
                                                    schedulesLoading && (
                                                        <div className="tr-hint info">
                                                            جاري تحميل
                                                            المواعيد...
                                                        </div>
                                                    )}
                                                {data.circle_id &&
                                                    !schedulesLoading &&
                                                    schedules.length > 0 && (
                                                        <div className="tr-nested">
                                                            <div
                                                                className="tr-field"
                                                                style={{
                                                                    marginBottom: 0,
                                                                }}
                                                            >
                                                                <label>
                                                                    المواعيد
                                                                    المتاحة{" "}
                                                                    <span className="opt">
                                                                        اختياري
                                                                    </span>
                                                                </label>
                                                                <div
                                                                    className="tr-select-wrap"
                                                                    style={{
                                                                        marginTop: 5,
                                                                    }}
                                                                >
                                                                    <select
                                                                        className="tr-input"
                                                                        value={
                                                                            data.schedule_id ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleScheduleChange(
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    >
                                                                        <option value="">
                                                                            اختيار
                                                                            موعد
                                                                            (اختياري)
                                                                        </option>
                                                                        {schedules.map(
                                                                            (
                                                                                s: any,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        s.id
                                                                                    }
                                                                                    value={
                                                                                        s.id
                                                                                    }
                                                                                    disabled={
                                                                                        s.is_full
                                                                                    }
                                                                                >
                                                                                    من{" "}
                                                                                    {s.start_time_ar ||
                                                                                        s.start_time}{" "}
                                                                                    إلى{" "}
                                                                                    {s.end_time_ar ||
                                                                                        s.end_time}{" "}
                                                                                    (
                                                                                    {s.is_full
                                                                                        ? `مليان (${s.seats_available})`
                                                                                        : `${s.seats_available} متاح`}
                                                                                    )
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                {data.circle_id &&
                                                    !schedulesLoading &&
                                                    schedules.length === 0 && (
                                                        <div className="tr-hint info">
                                                            لا توجد مواعيد متاحة
                                                            لهذه الحلقة
                                                        </div>
                                                    )}
                                            </>
                                        ) : (
                                            <div className="tr-hint info">
                                                لا توجد حلقات متاحة في هذا
                                                المجمع
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div
                                    className="tr-section"
                                    style={{ marginTop: "1rem" }}
                                >
                                    معلومات التواصل
                                </div>

                                <div className="tr-field">
                                    <label>
                                        البريد الإلكتروني{" "}
                                        <span className="req">*</span>
                                    </label>
                                    <input
                                        required
                                        className="tr-input"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="teacher@example.com"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="tr-field">
                                    <label>
                                        ملاحظات / خبرات{" "}
                                        <span className="opt">اختياري</span>
                                    </label>
                                    <textarea
                                        className="tr-input"
                                        rows={3}
                                        value={data.notes}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "notes",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="خبرتك التعليمية، المؤهلات، أو أي ملاحظات..."
                                        maxLength={1000}
                                    />
                                </div>

                                {error && (
                                    <div className="tr-hint err">{error}</div>
                                )}
                                {success && (
                                    <div className="tr-hint ok">
                                        تم إرسال طلب التسجيل بنجاح! سيتم مراجعته
                                        قريباً
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="tr-submit"
                                    disabled={isDisabled}
                                >
                                    {loading ? (
                                        <>
                                            <span className="tr-spinner" /> جاري
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
                                                <line
                                                    x1="22"
                                                    y1="2"
                                                    x2="11"
                                                    y2="13"
                                                />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                            إرسال طلب التسجيل
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="tr-divider">
                                <span>لديك حساب بالفعل؟</span>
                            </div>
                            <div className="tr-login-row">
                                <span>يمكنك</span>
                                <a href={loginLink}>تسجيل الدخول من هنا</a>
                            </div>
                        </div>
                    )}

                    {/* المجمعات دايمًا */}
                    <div style={{ padding: "0 2rem 2rem" }}>
                        <CentersSection currentSlug={centerSlug} />
                    </div>

                    <div className="tr-footer">
                        <span>منصة إتقان لتسهيل حفظ القرآن</span>
                        <span className="tr-footer-dot" />
                        <span>بالقرآن نحيا</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherRegister;
