import { useState } from "react";
import {
    FiX,
    FiCamera,
    FiTrash2,
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiLock,
    FiChevronDown,
    FiChevronUp,
} from "react-icons/fi";
import { useAccountEdit } from "./hooks/useAccountEdit";

// ─── CSS مضمّن (مأخوذ من نظام itqan-clean) ─────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');

:root {
  --g50:#f0faf5;--g100:#d6f0e3;--g200:#a8dfc5;--g300:#6cc49f;
  --g400:#38a879;--g500:#1e8f61;--g600:#15724e;--g700:#0f5439;
  --n0:#fff;--n50:#f8fafc;--n100:#f1f5f9;--n200:#e2e8f0;
  --n300:#cbd5e1;--n400:#94a3b8;--n500:#64748b;--n600:#475569;
  --n700:#334155;--n800:#1e293b;--n900:#0f172a;--n950:#060f1e;
  --red:#ef4444;--amber:#f59e0b;--purple:#8b5cf6;
  --ease:cubic-bezier(.4,0,.2,1);--spring:cubic-bezier(.34,1.56,.64,1);
}

/* ── reset ── */
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
::-webkit-scrollbar { width:4px; height:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:var(--n200); border-radius:4px; }

/* ── animations ── */
@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes scaleIn { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes tIn     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes bounceIn { 0%{opacity:0;transform:scale(.6)} 60%{transform:scale(1.07)} 100%{opacity:1;transform:scale(1)} }

/* ── OVERLAY ── */
.eap-overlay {
  position:fixed; inset:0;
  background:rgba(15,23,42,.65);
  backdrop-filter:blur(7px);
  z-index:2000;
  display:flex; align-items:center; justify-content:center;
  padding:16px;
  animation:fadeIn .22s var(--ease);
  font-family:'Tajawal',sans-serif;
  direction:rtl;
}

/* ── MODAL BOX ── */
.eap-box {
  background:var(--n0);
  border-radius:18px;
  width:100%; max-width:520px;
  max-height:90vh;
  overflow:hidden;
  display:flex; flex-direction:column;
  box-shadow:0 24px 80px rgba(0,0,0,.22);
  animation:scaleIn .28s var(--spring);
}

/* ── HEADER ── */
.eap-header {
  background:linear-gradient(135deg,var(--n950) 0%,#0a2218 100%);
  padding:20px 20px 24px;
  position:relative;
  flex-shrink:0;
}
.eap-header::before {
  content:'';
  position:absolute; inset:0;
  background:radial-gradient(ellipse at 30% -10%,rgba(30,143,97,.28) 0%,transparent 60%);
  pointer-events:none;
}
.eap-header-top {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:14px;
  position:relative; z-index:1;
}
.eap-header-badge {
  font-size:10px; font-weight:700;
  color:var(--g300);
  background:rgba(30,143,97,.18);
  border:1px solid rgba(30,143,97,.28);
  padding:3px 10px; border-radius:100px;
  letter-spacing:.4px;
}
.eap-close {
  width:30px; height:30px; border-radius:8px;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.1);
  color:rgba(255,255,255,.6);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:.15s;
}
.eap-close:hover { background:rgba(255,255,255,.14); color:#fff; }
.eap-header-title {
  position:relative; z-index:1;
}
.eap-header-title h2 {
  font-size:18px; font-weight:900; color:#fff; margin-bottom:3px;
}
.eap-header-title p {
  font-size:11px; color:rgba(255,255,255,.4);
}

/* ── AVATAR ROW (داخل الهيدر) ── */
.eap-avatar-row {
  position:relative; z-index:1;
  display:flex; align-items:center; gap:14px;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1);
  border-radius:12px; padding:12px 14px;
  margin-top:14px;
}
.eap-av-wrap {
  width:56px; height:56px; border-radius:50%;
  background:linear-gradient(135deg,var(--g400),var(--g600));
  border:2px solid rgba(255,255,255,.15);
  overflow:hidden; flex-shrink:0; position:relative;
  display:flex; align-items:center; justify-content:center;
}
.eap-av-wrap img { width:100%; height:100%; object-fit:cover; }
.eap-av-wrap svg { width:24px; height:24px; color:rgba(255,255,255,.7); }
.eap-av-spin {
  position:absolute; inset:0;
  background:rgba(0,0,0,.55);
  display:flex; align-items:center; justify-content:center;
  border-radius:50%;
}
.eap-av-info { flex:1; min-width:0; }
.eap-av-info span {
  display:block; font-size:11.5px; font-weight:700;
  color:rgba(255,255,255,.75); margin-bottom:6px;
}
.eap-av-btns { display:flex; gap:6px; }
.eap-av-btn {
  display:inline-flex; align-items:center; gap:5px;
  padding:5px 12px; border-radius:7px;
  font-size:10.5px; font-weight:700;
  cursor:pointer; transition:.15s;
  border:none; font-family:'Tajawal',sans-serif;
}
.eap-av-btn.upload {
  background:var(--g500); color:#fff;
}
.eap-av-btn.upload:hover { background:var(--g600); }
.eap-av-btn.remove {
  background:rgba(239,68,68,.18);
  color:#fca5a5;
  border:1px solid rgba(239,68,68,.25);
}
.eap-av-btn.remove:hover { background:rgba(239,68,68,.28); }

/* ── SCROLLABLE BODY ── */
.eap-body {
  flex:1; overflow-y:auto; padding:18px 20px 6px;
}

/* ── SECTION LABEL ── */
.eap-section-label {
  font-size:9.5px; font-weight:700;
  color:var(--n400); text-transform:uppercase; letter-spacing:.7px;
  margin-bottom:10px; margin-top:4px;
  display:flex; align-items:center; gap:7px;
}
.eap-section-label::after {
  content:''; flex:1; height:1px; background:var(--n200);
}

/* ── FIELD GROUP ── */
.eap-fg { margin-bottom:13px; }
.eap-fg label {
  display:block; font-size:10.5px; font-weight:700;
  color:var(--n700); margin-bottom:5px;
}

/* ── INPUT WRAPPER ── */
.eap-inp-wrap { position:relative; }
.eap-inp-wrap .eap-ico {
  position:absolute; right:11px; top:50%; transform:translateY(-50%);
  color:var(--n400); width:15px; height:15px;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
}
.eap-inp-wrap .eap-ico svg { width:15px; height:15px; }

/* ── INPUTS ── */
.eap-input {
  width:100%;
  padding:9px 34px 9px 12px;
  border:1.5px solid var(--n200);
  border-radius:9px;
  font-size:12.5px;
  font-family:'Tajawal',sans-serif;
  color:var(--n800);
  background:var(--n50);
  direction:rtl;
  transition:.18s;
  outline:none;
}
.eap-input:focus {
  border-color:var(--g400);
  background:var(--n0);
  box-shadow:0 0 0 3px rgba(30,143,97,.1);
}
.eap-input.err {
  border-color:var(--red);
  background:#fff5f5;
}
.eap-input:disabled { opacity:.55; cursor:not-allowed; }
.eap-select {
  width:100%;
  padding:9px 34px 9px 12px;
  border:1.5px solid var(--n200);
  border-radius:9px;
  font-size:12.5px;
  font-family:'Tajawal',sans-serif;
  color:var(--n800);
  background:var(--n50);
  direction:rtl;
  transition:.18s;
  outline:none;
  appearance:none;
  cursor:pointer;
}
.eap-select:focus {
  border-color:var(--g400);
  background:var(--n0);
  box-shadow:0 0 0 3px rgba(30,143,97,.1);
}
.eap-err-msg {
  font-size:10.5px; color:var(--red);
  margin-top:4px; font-weight:600;
}

/* ── 2-COLUMN GRID ── */
.eap-row2 {
  display:grid; grid-template-columns:1fr 1fr; gap:10px;
}

/* ── PASSWORD TOGGLE BTN ── */
.eap-pw-toggle {
  width:100%; padding:9px 14px;
  border:1.5px solid var(--n200);
  border-radius:9px;
  background:var(--n50);
  color:var(--n600);
  font-size:12px; font-weight:700;
  font-family:'Tajawal',sans-serif;
  display:flex; align-items:center; justify-content:space-between;
  cursor:pointer; transition:.18s;
  margin-bottom:13px;
}
.eap-pw-toggle:hover { background:var(--n100); border-color:var(--n300); }
.eap-pw-toggle.open {
  border-color:var(--g400);
  color:var(--g600);
  background:var(--g50);
}

/* ── PASSWORD FIELDS PANEL ── */
.eap-pw-panel {
  background:var(--n50);
  border:1.5px solid var(--n200);
  border-radius:11px;
  padding:14px;
  margin-bottom:13px;
  animation:tIn .22s var(--ease);
}

/* ── FOOTER ── */
.eap-footer {
  padding:14px 20px;
  border-top:1px solid var(--n100);
  display:flex; gap:8px;
  flex-shrink:0; background:var(--n0);
}
.eap-btn {
  display:inline-flex; align-items:center; justify-content:center;
  gap:6px; padding:9px 18px;
  border-radius:9px; border:none;
  font-size:12.5px; font-weight:700;
  font-family:'Tajawal',sans-serif;
  cursor:pointer; transition:all .15s var(--ease);
}
.eap-btn:active { transform:scale(.96); }
.eap-btn:disabled { opacity:.5; cursor:not-allowed; }
.eap-btn.primary {
  flex:1;
  background:var(--g500); color:#fff;
}
.eap-btn.primary:hover:not(:disabled) { background:var(--g600); }
.eap-btn.danger {
  background:#fee2e2; color:var(--red);
}
.eap-btn.danger:hover:not(:disabled) { background:#fecaca; }
.eap-btn.cancel {
  background:var(--n100); color:var(--n700);
  border:1px solid var(--n200);
}
.eap-btn.cancel:hover:not(:disabled) { background:var(--n200); }

/* ── SPINNER ── */
.eap-spinner {
  width:15px; height:15px;
  border:2.5px solid rgba(255,255,255,.35);
  border-top-color:#fff;
  border-radius:50%;
  animation:spin .7s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }

/* ── LOADING STATE ── */
.eap-loading {
  display:flex; align-items:center; justify-content:center;
  min-height:360px;
}
.eap-loading-spin {
  width:40px; height:40px;
  border:3px solid var(--n200);
  border-top-color:var(--g500);
  border-radius:50%;
  animation:spin .8s linear infinite;
}

/* ── RESPONSIVE ── */
@media(max-width:540px) {
  .eap-box { max-height:100vh; border-radius:0; }
  .eap-row2 { grid-template-columns:1fr; }
  .eap-footer { flex-direction:column; }
  .eap-btn.primary { flex:unset; }
}
`;

// ─── مساعدات صغيرة ───────────────────────────────────────────────────────────
function FG({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="eap-fg">
            <label>{label}</label>
            {children}
            {error && <p className="eap-err-msg">{error}</p>}
        </div>
    );
}

function InputWrap({
    icon,
    children,
}: {
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="eap-inp-wrap">
            <span className="eap-ico">{icon}</span>
            {children}
        </div>
    );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
interface EditAccountPageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const EditAccountPage: React.FC<EditAccountPageProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        userData,
        loadingUser,
        avatarPreview,
        removingAvatar,
        handleInputChange,
        handleAvatarChange,
        handleRemoveAvatar,
        submitForm,
        deleteAccount,
    } = useAccountEdit();

    const [showPasswordFields, setShowPasswordFields] = useState(false);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loadingUser) {
        return (
            <>
                <style>{CSS}</style>
                <div className="eap-overlay">
                    <div className="eap-box">
                        <div className="eap-loading">
                            <div className="eap-loading-spin" />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const hasAvatar = !!(avatarPreview || userData?.avatar);

    return (
        <>
            <style>{CSS}</style>

            <div
                className="eap-overlay"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div className="eap-box" onClick={(e) => e.stopPropagation()}>
                    {/* ══ HEADER ══════════════════════════════════════════ */}
                    <div className="eap-header">
                        {/* شريط أعلى الهيدر */}
                        <div className="eap-header-top">
                            <span className="eap-header-badge">
                                إعدادات الحساب
                            </span>
                            <button
                                className="eap-close"
                                onClick={onClose}
                                disabled={isSubmitting}
                                title="إغلاق"
                            >
                                <FiX size={14} />
                            </button>
                        </div>

                        {/* العنوان */}
                        <div className="eap-header-title">
                            <h2>تعديل بيانات الحساب</h2>
                            <p>قم بتحديث بياناتك الشخصية والصورة الشخصية</p>
                        </div>

                        {/* صف الصورة الشخصية */}
                        <div className="eap-avatar-row">
                            <div className="eap-av-wrap">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="avatar" />
                                ) : userData?.avatar ? (
                                    <img src={userData.avatar} alt="avatar" />
                                ) : (
                                    <FiUser />
                                )}
                                {removingAvatar && (
                                    <div className="eap-av-spin">
                                        <div
                                            style={{
                                                width: 18,
                                                height: 18,
                                                border: "2.5px solid rgba(255,255,255,.3)",
                                                borderTopColor: "#fff",
                                                borderRadius: "50%",
                                                animation:
                                                    "spin .7s linear infinite",
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="eap-av-info">
                                <span>الصورة الشخصية</span>
                                <div className="eap-av-btns">
                                    {/* زر رفع صورة */}
                                    <label className="eap-av-btn upload">
                                        <FiCamera size={12} />
                                        اختر صورة
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif"
                                            onChange={handleAvatarChange}
                                            style={{ display: "none" }}
                                            disabled={isSubmitting}
                                        />
                                    </label>

                                    {/* زر حذف الصورة */}
                                    {hasAvatar && (
                                        <button
                                            type="button"
                                            className="eap-av-btn remove"
                                            onClick={handleRemoveAvatar}
                                            disabled={
                                                isSubmitting || removingAvatar
                                            }
                                        >
                                            <FiTrash2 size={12} />
                                            إزالة
                                        </button>
                                    )}
                                </div>
                                <p
                                    style={{
                                        fontSize: 9,
                                        color: "rgba(255,255,255,.28)",
                                        marginTop: 5,
                                    }}
                                >
                                    JPG · PNG · GIF — الحجم الأقصى 2MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ══ BODY ════════════════════════════════════════════ */}
                    <div className="eap-body">
                        {/* ── المعلومات الشخصية ── */}
                        <div className="eap-section-label">
                            المعلومات الشخصية
                        </div>

                        {/* الاسم الكامل */}
                        <FG label="الاسم الكامل *" error={errors.name}>
                            <InputWrap icon={<FiUser />}>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`eap-input${errors.name ? " err" : ""}`}
                                    placeholder="أدخل اسمك الكامل"
                                    disabled={isSubmitting}
                                />
                            </InputWrap>
                        </FG>

                        {/* البريد + الهاتف */}
                        <div className="eap-row2">
                            <FG
                                label="البريد الإلكتروني *"
                                error={errors.email}
                            >
                                <InputWrap icon={<FiMail />}>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`eap-input${errors.email ? " err" : ""}`}
                                        placeholder="example@email.com"
                                        disabled={isSubmitting}
                                    />
                                </InputWrap>
                            </FG>

                            <FG label="رقم الهاتف">
                                <InputWrap icon={<FiPhone />}>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="eap-input"
                                        placeholder="01xxxxxxxxx"
                                        disabled={isSubmitting}
                                    />
                                </InputWrap>
                            </FG>
                        </div>

                        {/* تاريخ الميلاد + الجنس */}
                        <div className="eap-row2">
                            <FG label="تاريخ الميلاد">
                                <InputWrap icon={<FiCalendar />}>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={formData.birth_date}
                                        onChange={handleInputChange}
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        className="eap-input"
                                        disabled={isSubmitting}
                                    />
                                </InputWrap>
                            </FG>

                            <FG label="الجنس">
                                <div className="eap-inp-wrap">
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="eap-select"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">-- اختر --</option>
                                        <option value="male">ذكر</option>
                                        <option value="female">أنثى</option>
                                    </select>
                                </div>
                            </FG>
                        </div>

                        {/* ── الأمان ── */}
                        <div
                            className="eap-section-label"
                            style={{ marginTop: 6 }}
                        >
                            الأمان
                        </div>

                        {/* زر تبديل حقول كلمة المرور */}
                        <button
                            type="button"
                            className={`eap-pw-toggle${showPasswordFields ? " open" : ""}`}
                            onClick={() => setShowPasswordFields((p) => !p)}
                            disabled={isSubmitting}
                        >
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <FiLock size={13} />
                                تغيير كلمة المرور
                            </span>
                            {showPasswordFields ? (
                                <FiChevronUp size={14} />
                            ) : (
                                <FiChevronDown size={14} />
                            )}
                        </button>

                        {/* حقول كلمة المرور (مطوية/مفتوحة) */}
                        {showPasswordFields && (
                            <div className="eap-pw-panel">
                                <FG label="كلمة المرور الحالية">
                                    <InputWrap icon={<FiLock />}>
                                        <input
                                            type="password"
                                            name="current_password"
                                            value={formData.current_password}
                                            onChange={handleInputChange}
                                            className="eap-input"
                                            placeholder="••••••••"
                                            disabled={isSubmitting}
                                        />
                                    </InputWrap>
                                </FG>

                                <div className="eap-row2">
                                    <FG
                                        label="كلمة المرور الجديدة"
                                        error={errors.password}
                                    >
                                        <InputWrap icon={<FiLock />}>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`eap-input${errors.password ? " err" : ""}`}
                                                placeholder="كلمة مرور جديدة"
                                                disabled={isSubmitting}
                                            />
                                        </InputWrap>
                                    </FG>

                                    <FG
                                        label="تأكيد كلمة المرور"
                                        error={errors.password_confirmation}
                                    >
                                        <InputWrap icon={<FiLock />}>
                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                value={
                                                    formData.password_confirmation
                                                }
                                                onChange={handleInputChange}
                                                className={`eap-input${errors.password_confirmation ? " err" : ""}`}
                                                placeholder="تأكيد كلمة المرور"
                                                disabled={isSubmitting}
                                            />
                                        </InputWrap>
                                    </FG>
                                </div>
                            </div>
                        )}

                        {/* مسافة قبل الـ footer */}
                        <div style={{ height: 8 }} />
                    </div>

                    {/* ══ FOOTER ══════════════════════════════════════════ */}
                    <div className="eap-footer">
                        {/* إلغاء */}
                        <button
                            type="button"
                            className="eap-btn cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </button>

                        {/* حذف الحساب */}
                        <button
                            type="button"
                            className="eap-btn danger"
                            onClick={deleteAccount}
                            disabled={isSubmitting}
                        >
                            <FiTrash2 size={13} />
                            حذف الحساب
                        </button>

                        {/* حفظ */}
                        <button
                            type="button"
                            className="eap-btn primary"
                            onClick={submitForm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="eap-spinner" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                "حفظ التغييرات"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditAccountPage;
