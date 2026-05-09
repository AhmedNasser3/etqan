import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import EmailForm from "../components/EmailForm";
import CentersSection from "../components/CentersSection";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";
import logo from "../../../assets/images/logo.png";

const Register: React.FC = () => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        "male",
    );

    const { centerSlug: paramSlug } = useParams<{ centerSlug?: string }>();
    const location = useLocation();

    // استخرج الـ slug من الـ URL بطريقة موثوقة
    const getCenterSlug = (): string | null => {
        const pathParts = location.pathname.split("/").filter(Boolean);
        // /register/:slug → index 0 = "register", index 1 = slug
        if (pathParts[0] === "register" && pathParts[1]) return pathParts[1];
        return paramSlug || null;
    };
    const centerSlug = getCenterSlug();

    // لو مفيش مجمع → center-register
    const loginLink = centerSlug ? `/${centerSlug}/login` : "/login";

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap');
                .rg-page { min-height:100vh; background:#f0f9f5; display:flex; align-items:flex-start; justify-content:center; padding:2rem 1rem 3rem; direction:rtl; font-family:'Tajawal',sans-serif; position:relative; }
                .rg-bg-geo { position:fixed; inset:0; pointer-events:none; z-index:0; }
                .rg-bg-geo::before { content:''; position:absolute; top:-100px; right:-100px; width:450px; height:450px; background:radial-gradient(circle,rgba(15,110,86,.1) 0%,transparent 70%); border-radius:50%; }
                .rg-card { background:#fff; border-radius:24px; width:100%; max-width:480px; overflow:hidden; position:relative; z-index:1; margin-top:80px; box-shadow:0 0 0 1px rgba(15,110,86,.08),0 24px 48px rgba(15,110,86,.08); animation:rg-rise .5s cubic-bezier(.16,1,.3,1) forwards; opacity:0; transform:translateY(20px); }
                @keyframes rg-rise { to{opacity:1;transform:translateY(0)} }
                .rg-top-bar { height:3px; background:linear-gradient(90deg,#0F6E56 0%,#4ade80 50%,#0F6E56 100%); background-size:200%; animation:rg-bar 3s linear infinite; }
                @keyframes rg-bar { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                .rg-header { background:linear-gradient(135deg,#0F6E56 0%,#0d5c48 100%); padding:1.75rem 2rem 2.25rem; text-align:center; position:relative; }
                .rg-header::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:28px; background:#fff; border-radius:20px 20px 0 0; }
                .rg-logo-wrap { display:inline-flex; align-items:center; justify-content:center; width:56px; height:56px; background:rgba(255,255,255,.15); border-radius:15px; border:1.5px solid rgba(255,255,255,.25); margin-bottom:.85rem; transition:transform .3s; }
                .rg-logo-wrap:hover { transform:rotate(-5deg) scale(1.05); }
                .rg-logo-wrap img { width:32px; filter:brightness(10); }
                .rg-header-title { color:#fff; font-size:1.1rem; font-weight:800; margin-bottom:3px; }
                .rg-header-sub { color:rgba(255,255,255,.7); font-size:.8rem; }
                .rg-body { padding:1.5rem 2rem 2rem; }
                .rg-section { font-size:.7rem; font-weight:700; color:#0F6E56; letter-spacing:.06em; text-transform:uppercase; margin-bottom:.75rem; display:flex; align-items:center; gap:8px; }
                .rg-section::after { content:''; flex:1; height:.5px; background:rgba(15,110,86,.15); }
                .rg-gender-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:1.5rem; }
                .rg-gender-btn { border:1.5px solid rgba(0,0,0,.1); border-radius:14px; padding:14px 10px; cursor:pointer; background:#fafbfa; display:flex; flex-direction:column; align-items:center; gap:8px; transition:all .2s cubic-bezier(.34,1.56,.64,1); font-size:.84rem; color:#9ca3af; position:relative; overflow:hidden; font-family:'Tajawal',sans-serif; }
                .rg-gender-btn.active { border-color:#0F6E56; background:linear-gradient(135deg,#e8f5ef,#f5fbf8); color:#085041; box-shadow:0 4px 14px rgba(15,110,86,.15); transform:scale(1.02); }
                .rg-gender-avatar { width:52px; height:52px; border-radius:50%; overflow:hidden; background:rgba(0,0,0,.05); display:flex; align-items:center; justify-content:center; transition:background .2s; }
                .rg-gender-btn.active .rg-gender-avatar { background:rgba(15,110,86,.1); }
                .rg-gender-avatar img { width:40px; }
                .rg-gender-check { position:absolute; top:8px; left:8px; width:20px; height:20px; border-radius:50%; background:#0F6E56; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; animation:rg-pop .2s cubic-bezier(.34,1.56,.64,1); }
                @keyframes rg-pop { from{transform:scale(0)} to{transform:scale(1)} }
                .rg-footer { padding:.85rem 2rem; background:#fafbfa; border-top:1px solid #f0f0ef; text-align:center; font-size:.72rem; color:#9ca3af; display:flex; align-items:center; justify-content:center; gap:8px; }
                .rg-footer-dot { width:3px; height:3px; border-radius:50%; background:#d1d5db; }
                /* no-center guard */
                .rg-no-center { margin:1rem 2rem 1.5rem; background:linear-gradient(135deg,#fff8e1,#fffdf5); border:1px solid rgba(186,117,23,.25); border-radius:12px; padding:13px 15px; font-size:.82rem; color:#7c4a0a; line-height:1.6; display:flex; gap:10px; align-items:flex-start; }
                .rg-no-center svg { flex-shrink:0; margin-top:1px; }
                .rg-no-center a { color:#ba7517; font-weight:700; text-decoration:none; }
            `}</style>

            <div className="rg-page">
                <div className="rg-bg-geo" />
                <div className="rg-card">
                    <div className="rg-top-bar" />
                    <div className="rg-header">
                        <div className="rg-logo-wrap">
                            <img src={logo} alt="إتقان" />
                        </div>
                        <div className="rg-header-title">طلب تسجيل طالب</div>
                        <div className="rg-header-sub">
                            {centerSlug
                                ? `التسجيل في مجمع /${centerSlug}`
                                : "أكمل البيانات وسيتم مراجعة طلبك من قِبل المشرف"}
                        </div>
                    </div>

                    {/* ── guard: لو مفيش مجمع ── */}
                    {!centerSlug ? (
                        <div className="rg-no-center">
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
                                تسجيل الطلاب يتم داخل مجمع معين. اختر مجمعك من
                                القائمة أدناه أو{" "}
                                <a href="/center-register">سجّل مجمعك الجديد</a>
                                .
                            </span>
                        </div>
                    ) : (
                        <div className="rg-body">
                            <div className="rg-section">الجنس</div>
                            <div className="rg-gender-row">
                                {[
                                    { v: "male" as const, l: "ذكر", img: Men },
                                    {
                                        v: "female" as const,
                                        l: "أنثى",
                                        img: Woman,
                                    },
                                ].map((g) => (
                                    <button
                                        key={g.v}
                                        className={`rg-gender-btn${selectedGender === g.v ? " active" : ""}`}
                                        onClick={() => setSelectedGender(g.v)}
                                        type="button"
                                    >
                                        <div className="rg-gender-avatar">
                                            <img src={g.img} alt={g.l} />
                                        </div>
                                        <span>{g.l}</span>
                                        {selectedGender === g.v && (
                                            <span className="rg-gender-check">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <EmailForm gender={selectedGender} />
                            <div
                                style={{
                                    marginTop: "1.25rem",
                                    textAlign: "center",
                                    fontSize: ".8rem",
                                    color: "#9ca3af",
                                }}
                            >
                                لديك حساب بالفعل؟{" "}
                                <a
                                    href={loginLink}
                                    style={{
                                        color: "#0F6E56",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                    }}
                                >
                                    تسجيل دخول
                                </a>
                            </div>
                        </div>
                    )}

                    {/* المجمعات دايمًا */}
                    <div
                        style={{
                            padding: centerSlug ? "0 2rem 2rem" : "0 2rem 2rem",
                        }}
                    >
                        <CentersSection currentSlug={centerSlug} />
                    </div>

                    <div className="rg-footer">
                        <span>منصة إتقان لتسهيل حفظ القرآن</span>
                        <span className="rg-footer-dot" />
                        <span>بالقرآن نحيا</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
