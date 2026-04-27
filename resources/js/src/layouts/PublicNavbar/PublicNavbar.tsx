import { useState, useCallback } from "react";
import { VscListFlat } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { HiLogin } from "react-icons/hi";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import { useAuthUser } from "../hooks/useAuthUser";
import { useLocation } from "react-router-dom";
import EditAccountPage from "../../pages/DashBoard/AccountEdit/EditAccountPage";
import Logo from "../../assets/images/logo.png";

// ── الستايل مكتوب جوه الكومبوننت عشان ميحتاجش ملف CSS منفصل ──────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800&family=Amiri:wght@400;700&display=swap');

  :root {
    --g50: #f0faf4;
    --g200: #9fd9bc;
    --g300: #5cbf94;
    --g400: #28a46a;
    --g500: #178a54;
    --g600: #0f6e42;
    --g700: #0a5232;
    --n50:  #f7f9fb;
    --n100: #eef2f5;
    --n200: #dde5eb;
    --n400: #8ba3b3;
    --n600: #3a5c6e;
    --n700: #1e3a48;
    --n800: #0f2330;
    --n900: #06131a;
    --w:    #fff;
    --nav-h: 68px;
    --ff: 'Tajawal', sans-serif;
    --fa: 'Amiri', serif;
    --s1: 0 1px 3px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04);
    --s2: 0 4px 14px rgba(0,0,0,.08), 0 10px 28px rgba(0,0,0,.06);
  }

  /* ── NAV WRAPPER ── */
  .qnav {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 999;
    height: var(--nav-h);
    background: rgba(255,255,255,.97);
    backdrop-filter: blur(18px) saturate(180%);
    border-bottom: 1px solid var(--n200);
    transition: box-shadow .25s, border-color .25s;
    font-family: var(--ff);
    direction: rtl;
  }
  .qnav.scrolled {
    box-shadow: var(--s2);
    border-color: transparent;
  }

  /* ── داخل الـ nav ── */
  .qnav__inner {
    max-width: 1220px;
    margin: 0 auto;
    padding: 0 20px;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* ── اللوجو ── */
  .qnav__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    text-decoration: none;
    color: inherit;
  }
  .qnav__logo-ico {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: linear-gradient(140deg, var(--g400), var(--g700));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 12px rgba(23,138,84,.28);
    flex-shrink: 0;
  }
  .qnav__logo-ico img {
    width: 24px;
    height: 24px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }
  .qnav__logo-name {
    display: block;
    font-family: var(--fa);
    font-size: 15px;
    font-weight: 700;
    color: var(--n900);
    line-height: 1.2;
  }
  .qnav__logo-sub {
    display: block;
    font-size: 10.5px;
    color: var(--n400);
    font-weight: 500;
    margin-top: 1px;
  }

  /* ── الروابط ── */
  .qnav__links {
    flex: 1;
    display: flex;
    justify-content: center;
    gap: 2px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .qnav__links a {
    display: block;
    padding: 7px 15px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--n600);
    text-decoration: none;
    transition: background .16s, color .16s;
  }
  .qnav__links a:hover {
    background: var(--g50);
    color: var(--g600);
  }

  /* ── الجانب الأيسر (يوزر / أزرار) ── */
  .qnav__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  /* ── زر تسجيل الدخول / انشاء حساب ── */
  .qnav__btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 20px;
    font-size: 13px;
    font-weight: 700;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    font-family: var(--ff);
    transition: all .2s;
    white-space: nowrap;
  }
  .qnav__btn--outline {
    background: var(--w);
    color: var(--g600);
    border: 1.5px solid var(--g300);
  }
  .qnav__btn--outline:hover {
    background: var(--g50);
    border-color: var(--g400);
  }
  .qnav__btn--solid {
    background: var(--g500);
    color: #fff;
    box-shadow: 0 6px 22px rgba(23,138,84,.30);
  }
  .qnav__btn--solid:hover {
    background: var(--g600);
    transform: translateY(-1px);
    box-shadow: 0 10px 32px rgba(23,138,84,.38);
  }

  /* ── البروفايل (لما يكون logged in) ── */
  .qnav__profile-wrap {
    position: relative;
  }
  .qnav__profile-trigger {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 6px 12px 6px 6px;
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid var(--n200);
    background: var(--w);
    transition: all .18s;
    font-family: var(--ff);
    user-select: none;
  }
  .qnav__profile-trigger:hover {
    border-color: var(--g300);
    background: var(--g50);
  }

  /* ── الدائرة اللي فيها أول حرف من الاسم ── */
  .qnav__avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(140deg, var(--g400), var(--g700));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }
  .qnav__profile-name {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--n800);
  }
  .qnav__arrow {
    font-size: 14px;
    color: var(--n400);
    transition: transform .25s;
  }
  .qnav__arrow.flipped {
    transform: rotate(180deg);
  }

  /* ── الدروبداون ── */
  .qnav__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 200px;
    background: var(--w);
    border: 1px solid var(--n200);
    border-radius: 14px;
    box-shadow: var(--s2);
    padding: 6px;
    list-style: none;
    margin: 0;
    z-index: 1000;

    /* الأنيميشن */
    opacity: 0;
    transform: translateY(8px) scale(.97);
    pointer-events: none;
    transition: opacity .2s, transform .2s;
  }
  .qnav__dropdown.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
  }
  .qnav__dropdown a {
    text-decoration: none;
    color: inherit;
    display: block;
  }
  .qnav__dropdown li {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--n700);
    cursor: pointer;
    transition: background .15s, color .15s;
    list-style: none;
  }
  .qnav__dropdown li:hover {
    background: var(--g50);
    color: var(--g600);
  }
  .qnav__dropdown li svg {
    color: var(--n400);
    flex-shrink: 0;
  }
  .qnav__dropdown li:hover svg {
    color: var(--g500);
  }

  /* ── فاصل ── */
  .qnav__divider {
    height: 1px;
    background: var(--n100);
    margin: 4px 0;
  }

  /* ── زر تسجيل الخروج ── */
  .qnav__logout-btn {
    background: none;
    border: none;
    font-family: var(--ff);
    font-size: 13px;
    font-weight: 600;
    color: #e53e3e;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
  }
  .qnav__logout-li {
    color: #e53e3e !important;
  }
  .qnav__logout-li svg {
    color: #e53e3e !important;
  }

  /* ── Hamburger ── */
  .qnav__ham {
    display: none;
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: var(--n100);
    border: none;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 4.5px;
    flex-shrink: 0;
  }
  .qnav__ham span {
    display: block;
    width: 16px;
    height: 1.8px;
    border-radius: 2px;
    background: var(--n700);
    transition: .28s;
  }
  .qnav__ham.open span:nth-child(1) { transform: translateY(6.3px) rotate(45deg); }
  .qnav__ham.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .qnav__ham.open span:nth-child(3) { transform: translateY(-6.3px) rotate(-45deg); }

  /* ── Drawer (موبايل) ── */
  .qnav__drawer {
    position: fixed;
    inset: var(--nav-h) 0 0 0;
    z-index: 998;
    background: var(--w);
    overflow-y: auto;
    padding: 20px;
    transform: translateX(110%);
    transition: transform .3s cubic-bezier(.4,0,.2,1);
    direction: rtl;
    font-family: var(--ff);
  }
  .qnav__drawer.open {
    transform: translateX(0);
  }
  .qnav__drawer ul {
    list-style: none;
    margin: 0 0 20px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .qnav__drawer ul a {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: var(--n600);
    padding: 13px 16px;
    border-bottom: 1px solid var(--n100);
    text-decoration: none;
  }

  /* ── Loading spinner ── */
  .qnav__spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--n200);
    border-top-color: var(--g500);
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    :root { --nav-h: 60px; }
    .qnav__links  { display: none; }
    .qnav__actions .qnav__btn--outline { display: none; }
    .qnav__ham    { display: flex; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
const PublicNavbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const { user, loading } = useAuthUser();
    const location = useLocation();

    // ── scroll listener ──
    useState(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    });

    // ── centerSlug من الـ URL ──
    const getCenterSlug = () => {
        const parts = location.pathname.split("/").filter(Boolean);
        return parts.length >= 1 ? parts[0] : null;
    };
    const centerSlug = getCenterSlug();

    const getRegisterLink = () =>
        centerSlug ? `/${centerSlug}/register` : "/register";

    // ── logout ──
    const handleLogout = async () => {
        try {
            await fetch("/logout", {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                    "Content-Type": "application/json",
                },
            });
            window.location.href = "/";
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    // ── nav links ──
    const navLinks = [
        { href: "#about", label: "عن المجمع" },
        { href: "#programs", label: "الحلقات" },
        { href: "#teachers", label: "المعلمون" },
        { href: "#schedule", label: "الجدول" },
        { href: "#contact", label: "تواصل معنا" },
    ];

    // ── loading state ──
    if (loading) {
        return (
            <nav className="qnav">
                <style>{styles}</style>
                <div className="qnav__inner">
                    <div className="qnav__spinner" />
                </div>
            </nav>
        );
    }

    return (
        <>
            <style>{styles}</style>

            {/* ── Settings Modal ── */}
            {showSettings && user && (
                <EditAccountPage
                    onClose={() => setShowSettings(false)}
                    onSuccess={() => setShowSettings(false)}
                />
            )}

            {/* ── NAV ── */}
            <nav
                className={`qnav ${scrolled ? "scrolled" : ""}`}
                onClick={() => setProfileOpen(false)}
            >
                <div className="qnav__inner">
                    {/* 1. اللوجو (يمين) */}
                    <a href="/" className="qnav__logo">
                        <div className="qnav__logo-ico">
                            <img src={Logo} alt="لوجو" />
                        </div>
                    </a>

                    {/* 2. روابط الوسط */}
                    <ul className="qnav__links">
                        {navLinks.map((l) => (
                            <li key={l.href}>
                                <a href={l.href}>{l.label}</a>
                            </li>
                        ))}
                    </ul>

                    {/* 3. الجانب الأيسر */}
                    <div className="qnav__actions">
                        {user ? (
                            /* ── مستخدم مسجّل ── */
                            <div
                                className="qnav__profile-wrap"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* زرار البروفايل */}
                                <div
                                    className="qnav__profile-trigger"
                                    onClick={() => setProfileOpen((p) => !p)}
                                >
                                    <div className="qnav__avatar">
                                        {user?.name?.charAt(0)?.toUpperCase() ||
                                            "A"}
                                    </div>
                                    <span className="qnav__profile-name">
                                        {user?.name || "المستخدم"}
                                    </span>
                                    <IoIosArrowDown
                                        className={`qnav__arrow ${profileOpen ? "flipped" : ""}`}
                                    />
                                </div>

                                {/* الدروبداون */}
                                <ul
                                    className={`qnav__dropdown ${profileOpen ? "open" : ""}`}
                                >
                                    {/* معلم */}
                                    {user?.teacher && (
                                        <>
                                            <a href="/teacher-dashboard">
                                                <li>
                                                    <FaUserAlt /> لوحة المعلم
                                                </li>
                                            </a>
                                            <a href="/teacher-dashboard/plans">
                                                <li>
                                                    <BsTable /> جدول
                                                </li>
                                            </a>
                                        </>
                                    )}

                                    {/* صاحب مجمع */}
                                    {(user?.center_owner ||
                                        user?.role?.name === "center_owner" ||
                                        user?.role_id === 1) && (
                                        <a href="/center-dashboard">
                                            <li>
                                                <FaUserAlt /> مجمعي
                                            </li>
                                        </a>
                                    )}

                                    {/* طالب */}
                                    {user?.role?.name === "student" && (
                                        <a href="/user-dashboard">
                                            <li>
                                                <FaUserAlt /> حسابي
                                            </li>
                                        </a>
                                    )}

                                    {/* مستخدم عادي */}
                                    {user &&
                                        !user.teacher &&
                                        !user.center_owner &&
                                        !user?.role?.name && (
                                            <a href="/user-dashboard">
                                                <li>
                                                    <FaUserAlt /> حسابي
                                                </li>
                                            </a>
                                        )}

                                    {/* الإعدادات */}
                                    <li
                                        onClick={() => {
                                            setShowSettings(true);
                                            setProfileOpen(false);
                                        }}
                                    >
                                        <IoSettings /> الإعدادات
                                    </li>

                                    <div className="qnav__divider" />

                                    {/* تسجيل الخروج */}
                                    <li className="qnav__logout-li">
                                        <button
                                            className="qnav__logout-btn"
                                            onClick={handleLogout}
                                        >
                                            <FaUserAlt /> تسجيل الخروج
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            /* ── غير مسجّل ── */
                            <>
                                <a
                                    href="/login"
                                    className="qnav__btn qnav__btn--outline"
                                >
                                    <HiLogin /> تسجيل الدخول
                                </a>
                                <a
                                    href={getRegisterLink()}
                                    className="qnav__btn qnav__btn--solid"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="15"
                                        height="15"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    >
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                    سجّل الآن
                                </a>
                            </>
                        )}

                        {/* Hamburger */}
                        <button
                            className={`qnav__ham ${drawerOpen ? "open" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setDrawerOpen((d) => !d);
                            }}
                            aria-label="القائمة"
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Mobile Drawer ── */}
            <div className={`qnav__drawer ${drawerOpen ? "open" : ""}`}>
                <ul>
                    {navLinks.map((l) => (
                        <li key={l.href}>
                            <a
                                href={l.href}
                                onClick={() => setDrawerOpen(false)}
                            >
                                {l.label}
                            </a>
                        </li>
                    ))}
                </ul>
                {!user && (
                    <a
                        href={getRegisterLink()}
                        className="qnav__btn qnav__btn--solid"
                        style={{ width: "100%", justifyContent: "center" }}
                    >
                        سجّل الآن
                    </a>
                )}
            </div>
        </>
    );
};

export default PublicNavbar;
