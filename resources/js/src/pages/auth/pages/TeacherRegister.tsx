// TeacherRegister.tsx
import React, { useState } from "react";
import { useTeacherRegister } from "../hooks/useTeacherRegister";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";
import logo from "../../../assets/images/logo.png";

const TeacherRegister: React.FC = () => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        "male",
    );

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
        centerSlug,
        formatCircleWithTime,
    } = useTeacherRegister();

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
                /* ── Auth page shell ── */
                .tr-page {
                    min-height: 100vh;
                    background: #E1F5EE;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding: 2rem 1rem 3rem;
                    direction: rtl;
                }

                /* ── Card ── */
                .tr-card {
                    background: #fff;
                    border-radius: 20px;
                    border: 0.5px solid rgba(15,110,86,.15);
                    width: 100%;
                    max-width: 520px;
                    overflow: hidden;
                    margin-top: 128px;
                }

                /* ── Progress bar ── */
                .tr-prog { height: 3px; background: #E1F5EE; }
                .tr-prog-fill {
                    height: 100%;
                    background: #0F6E56;
                    border-radius: 0 2px 2px 0;
                    transition: width .4s ease;
                }

                /* ── Top banner ── */
                .tr-top {
                    background: #0F6E56;
                    padding: 1.75rem 2rem 2.25rem;
                    position: relative;
                    text-align: center;
                }
                .tr-top::after {
                    content: "";
                    position: absolute;
                    bottom: -1px; left: 0; right: 0;
                    height: 28px;
                    background: #fff;
                    border-radius: 20px 20px 0 0;
                }
                .tr-logo {
                    width: 54px; height: 54px;
                    border-radius: 14px;
                    background: rgb(255 255 255 / 58%);
                    border: 1.5px solid rgba(255,255,255,.25);
                    display: inline-flex;
                    align-items: center; justify-content: center;
                    margin-bottom: .75rem;
                }
                .tr-logo img { width: 34px; }
                .tr-card-title {
                    color: #fff;
                    font-size: 1.1rem; font-weight: 600;
                    margin-bottom: .25rem;
                }
                .tr-card-sub {
                    color: rgba(255,255,255,.72);
                    font-size: .78rem; line-height: 1.5;
                }

                /* ── Steps ── */
                .tr-steps {
                    display: flex; align-items: center;
                    gap: 8px; margin-bottom: 1.5rem;
                }
                .tr-step {
                    width: 28px; height: 28px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: .72rem; font-weight: 600; flex-shrink: 0;
                    transition: all .3s;
                }
                .tr-step.done    { background: #0F6E56; color: #fff; }
                .tr-step.current { background: #0F6E56; color: #fff; outline: 3px solid rgba(15,110,86,.2); }
                .tr-step.idle    { background: rgba(0,0,0,.07); color: #9CA3AF; }
                .tr-step-line    { flex: 1; height: 1.5px; background: rgba(0,0,0,.08); }
                .tr-step-line.done { background: #0F6E56; }

                /* ── Body ── */
                .tr-body { padding: 1.5rem 2rem 2rem; }

                /* ── Section label ── */
                .tr-section {
                    font-size: .7rem; font-weight: 600;
                    color: #0F6E56; letter-spacing: .05em;
                    text-transform: uppercase;
                    margin-bottom: .75rem;
                    display: flex; align-items: center; gap: 8px;
                }
                .tr-section::after {
                    content: ""; flex: 1;
                    height: 0.5px; background: rgba(15,110,86,.18);
                }

                /* ── Gender buttons ── */
                .tr-gender-row {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 10px; margin-bottom: 1.25rem;
                }
                .tr-gender-btn {
                    border: 1.5px solid rgba(0,0,0,.1);
                    border-radius: 12px; padding: 12px;
                    cursor: pointer;
                    background: #f9f9f8;
                    display: flex; flex-direction: column;
                    align-items: center; gap: 6px;
                    transition: all .15s;
                    font-size: .82rem; color: #9CA3AF;
                    position: relative;
                }
                .tr-gender-btn.active {
                    border-color: #0F6E56;
                    background: #E1F5EE;
                    color: #085041;
                }
                .tr-gender-btn .g-av {
                    width: 48px; height: 48px;
                    border-radius: 50%; overflow: hidden;
                    background: rgba(0,0,0,.05);
                    display: flex; align-items: center; justify-content: center;
                }
                .tr-gender-btn.active .g-av { background: rgba(15,110,86,.1); }
                .tr-gender-btn .g-av img { width: 38px; }
                .tr-g-check {
                    position: absolute; top: 8px; left: 8px;
                    width: 18px; height: 18px; border-radius: 50%;
                    background: #0F6E56; color: #fff;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; font-weight: 700;
                }

                /* ── Fields ── */
                .tr-field { margin-bottom: 1rem; }
                .tr-field label {
                    display: block; font-size: .78rem;
                    font-weight: 500; color: #6B7280;
                    margin-bottom: 5px;
                }
                .tr-field label .req { color: #E24B4A; margin-right: 2px; }
                .tr-field label .opt {
                    font-size: .68rem; font-weight: 400;
                    color: #9CA3AF; background: rgba(0,0,0,.06);
                    border-radius: 4px; padding: 1px 7px; margin-right: 6px;
                }
                .tr-input {
                    width: 100%;
                    border: 1px solid rgba(0,0,0,.12);
                    border-radius: 10px;
                    padding: 10px 13px;
                    font-size: .84rem;
                    color: #1a1a1a;
                    background: #fff;
                    outline: none;
                    transition: border .15s, box-shadow .15s;
                    font-family: inherit;
                    appearance: none;
                }
                .tr-input:focus {
                    border-color: #0F6E56;
                    box-shadow: 0 0 0 3px rgba(15,110,86,.1);
                }
                .tr-input::placeholder { color: #B4B2A9; }
                textarea.tr-input { resize: vertical; min-height: 86px; line-height: 1.55; }

                /* select arrow */
                .tr-select-wrap { position: relative; }
                .tr-select-wrap::after {
                    content: "";
                    position: absolute; left: 13px; top: 50%;
                    transform: translateY(-50%);
                    width: 0; height: 0;
                    border-left: 4px solid transparent;
                    border-right: 4px solid transparent;
                    border-top: 5px solid #9CA3AF;
                    pointer-events: none;
                }
                .tr-select-wrap select.tr-input { padding-left: 34px; cursor: pointer; }

                /* nested schedule box */
                .tr-nested {
                    margin-top: .75rem;
                    padding: .85rem 1rem;
                    background: #E1F5EE;
                    border-radius: 10px;
                    border: 0.5px solid rgba(15,110,86,.2);
                }
                .tr-nested label { color: #085041 !important; }

                /* hints */
                .tr-hint {
                    font-size: .77rem; line-height: 1.55;
                    border-radius: 9px; padding: 9px 13px; margin-top: 8px;
                    border: 0.5px solid;
                }
                .tr-hint.info  { background: #f5f5f3; color: #6B7280; border-color: rgba(0,0,0,.09); }
                .tr-hint.err   { background: #FCEBEB; color: #791F1F; border-color: #F7C1C1; }
                .tr-hint.ok    { background: #E1F5EE; color: #085041; border-color: rgba(15,110,86,.25); }

                /* ── Submit ── */
                .tr-submit {
                    width: 100%; padding: 13px;
                    border-radius: 12px;
                    background: #0F6E56; color: #fff;
                    border: none; font-size: .92rem; font-weight: 600;
                    cursor: pointer; margin-top: .5rem;
                    transition: background .15s, opacity .15s;
                    font-family: inherit;
                    display: flex; align-items: center;
                    justify-content: center; gap: 8px;
                }
                .tr-submit:hover:not(:disabled) { background: #085041; }
                .tr-submit:disabled { opacity: .5; cursor: not-allowed; }

                /* ── Login link ── */
                .tr-divider {
                    display: flex; align-items: center;
                    gap: 10px; margin: 1.25rem 0 .75rem;
                }
                .tr-divider::before,.tr-divider::after {
                    content: ""; flex: 1; height: .5px; background: rgba(0,0,0,.1);
                }
                .tr-divider span { font-size: .73rem; color: #9CA3AF; white-space: nowrap; }
                .tr-login-row {
                    display: flex; align-items: center;
                    justify-content: center; gap: 6px;
                    font-size: .8rem; color: #9CA3AF;
                }
                .tr-login-row a { color: #0F6E56; font-weight: 600; text-decoration: none; }

                /* ── Footer ── */
                .tr-footer {
                    background: #f9f9f7;
                    border-top: .5px solid rgba(0,0,0,.07);
                    padding: .75rem 2rem;
                    display: flex; align-items: center;
                    justify-content: center; gap: .5rem;
                    font-size: .72rem; color: #B4B2A9;
                }
                .tr-footer .dot {
                    width: 3px; height: 3px; border-radius: 50%;
                    background: #B4B2A9; display: inline-block;
                }

                @media (max-width: 540px) {
                    .tr-body { padding: 1.25rem 1.25rem 1.75rem; }
                    .tr-top  { padding: 1.5rem 1.25rem 2rem; }
                }
            `}</style>

            <div className="tr-page">
                <div className="tr-card">
                    {/* Progress bar */}
                    <div className="tr-prog">
                        <div
                            className="tr-prog-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Top banner */}
                    <div className="tr-top">
                        <div className="tr-logo">
                            <img src={logo} alt="إتقان" />
                        </div>
                        <div className="tr-card-title">
                            طلب تسجيل معلم / مشرف
                        </div>
                        <div className="tr-card-sub">
                            أكمل البيانات التالية وسيتم مراجعة طلبك من قِبل
                            المشرف
                        </div>
                    </div>

                    {/* Body */}
                    <div className="tr-body">
                        {/* Steps indicator */}
                        <div className="tr-steps">
                            <div className="tr-step done">1</div>
                            <div
                                className={`tr-step-line ${data.full_name ? "done" : ""}`}
                            />
                            <div
                                className={`tr-step ${data.full_name ? "done" : "current"}`}
                            >
                                2
                            </div>
                            <div
                                className={`tr-step-line ${data.email && data.role ? "done" : ""}`}
                            />
                            <div
                                className={`tr-step ${data.email && data.role ? "current" : "idle"}`}
                            >
                                3
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Gender */}
                            <div className="tr-section">الجنس</div>
                            <div className="tr-gender-row">
                                {(
                                    [
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
                                    ] as const
                                ).map((g) => (
                                    <button
                                        key={g.v}
                                        type="button"
                                        className={`tr-gender-btn${selectedGender === g.v ? " active" : ""}`}
                                        onClick={() => setSelectedGender(g.v)}
                                    >
                                        <div className="g-av">
                                            <img src={g.img} alt={g.l} />
                                        </div>
                                        <span>{g.l}</span>
                                        {selectedGender === g.v && (
                                            <span className="tr-g-check">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Basic info */}
                            <div className="tr-section">البيانات الأساسية</div>

                            <div className="tr-field">
                                <label>
                                    الاسم رباعي <span className="req">*</span>
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
                                    الدور المطلوب <span className="req">*</span>
                                </label>
                                <div className="tr-select-wrap">
                                    <select
                                        className="tr-input"
                                        value={data.role}
                                        onChange={handleRoleChange}
                                    >
                                        <option value="">اختر الدور</option>
                                        <option value="teacher">معلم</option>
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

                            {/* Circles — teacher only */}
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
                                                        selectedCircleId || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleCircleChange(
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        اختيار حلقة (اختياري)
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
                                                        ⏳ جاري تحميل
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
                                                                المواعيد المتاحة
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
                                                        حالياً لهذه الحلقة
                                                        <br />
                                                        <small>
                                                            يمكنك التسجيل بدون
                                                            موعد وسيتم التواصل
                                                            معك لاحقاً
                                                        </small>
                                                    </div>
                                                )}
                                        </>
                                    ) : (
                                        <div className="tr-hint info">
                                            لا توجد حلقات متاحة في هذا المجمع
                                            حالياً
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Contact */}
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
                                    ملاحظات / خبرات
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
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                                animation:
                                                    "spin 1s linear infinite",
                                            }}
                                        >
                                            <polyline points="23 4 23 10 17 10" />
                                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                        </svg>
                                        جاري الإرسال...
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
                            <a href="/login">تسجيل الدخول من هنا</a>
                        </div>
                    </div>

                    <div className="tr-footer">
                        <span>منصة إتقان لتسهيل حفظ القرآن</span>
                        <span className="dot" />
                        <span>بالقرآن نحيا</span>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </>
    );
};

export default TeacherRegister;
