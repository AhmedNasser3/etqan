import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { HiLogin } from "react-icons/hi";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import EditAccountPage from "../pages/DashBoard/AccountEdit/EditAccountPage";
import { useAuthUser } from "./hooks/useAuthUser";
import Logo from "../assets/images/logo.png";

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&family=Amiri:wght@400;700&display=swap');

  :root {
    --g50:  #f0faf4;
    --g100: #d2eee1;
    --g200: #9fd9bc;
    --g300: #5cbf94;
    --g400: #28a46a;
    --g500: #178a54;
    --g600: #0f6e42;
    --g700: #0a5232;
    --n50:  #f7f9fb;
    --n100: #eef2f5;
    --n200: #dde5eb;
    --n300: #bfcdd8;
    --n400: #8ba3b3;
    --n500: #5b7a8d;
    --n600: #3a5c6e;
    --n700: #1e3a48;
    --n800: #0f2330;
    --n900: #06131a;
    --w:    #ffffff;
    --nav-h: 68px;
    --max-w: 1220px;
  }

  /* ════════════════════════════
     NAV SHELL
  ════════════════════════════ */
  .qn {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 999;
    height: var(--nav-h);
    background: rgba(255,255,255,.97);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid var(--n200);
    transition: box-shadow .25s, border-color .25s;
    font-family: 'Tajawal', sans-serif;
    direction: rtl;
  }
  .qn.qn--scrolled {
    box-shadow: 0 4px 24px rgba(0,0,0,.08);
    border-color: transparent;
  }

  /* ── inner ── */
  .qn__inner {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 8px;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content:space-between;
    direction:ltr;
  }

  /* ════════════════════════════
     LOGO
  ════════════════════════════ */
  .qn__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    text-decoration: none;
    color: inherit;
  }
  .qn__logo-box {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(140deg, var(--g400), var(--g700));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 12px rgba(23,138,84,.30);
    flex-shrink: 0;
  }
  .qn__logo-box img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }
  .qn__logo-name {
    display: block;
    font-family: 'Amiri', serif;
    font-size: 15.5px;
    font-weight: 700;
    color: var(--n900);
    line-height: 1.2;
  }
  .qn__logo-sub {
    display: block;
    font-size: 10.5px;
    color: var(--n400);
    font-weight: 500;
    margin-top: 1px;
  }

  /* ════════════════════════════
     CENTER NAV LINKS
  ════════════════════════════ */
  .qn__links {
    flex: 1;
    display: flex;
    justify-content: center;
    gap: 2px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .qn__links a {
    display: block;
    padding: 7px 15px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--n600);
    text-decoration: none;
    transition: background .16s, color .16s;
    white-space: nowrap;
  }
  .qn__links a:hover {
    background: var(--g50);
    color: var(--g600);
  }

  /* ════════════════════════════
     RIGHT SIDE ACTIONS
  ════════════════════════════ */
  .qn__actions {
  direction:rtl;
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;

  }

  /* ── buttons ── */
  .qn__btn {
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
    font-family: 'Tajawal', sans-serif;
    transition: all .2s;
    white-space: nowrap;
    line-height: 1;
  }
  .qn__btn--ghost {
    background: transparent;
    color: var(--n600);
    border:1px solid #e2e8f0;
  }
  .qn__btn--ghost:hover {
    background: var(--n100);
    color: var(--n800);
  }
  .qn__btn--outline {
    background: var(--w);
    color: var(--g600);
    border: 1.5px solid var(--g300);
  }
  .qn__btn--outline:hover {
    background: var(--g50);
    border-color: var(--g400);
  }
  .qn__btn--solid {
    background: var(--g500);
    color: #fff;
    box-shadow: 0 6px 22px rgba(23,138,84,.30);
  }
  .qn__btn--solid:hover {
    background: var(--g600);
    transform: translateY(-1px);
    box-shadow: 0 10px 32px rgba(23,138,84,.38);
  }

  /* ════════════════════════════
     PROFILE TRIGGER
  ════════════════════════════ */
  .qn__profile {
    position: relative;
  }
  .qn__profile-btn {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 5px 12px 5px 5px;
    border-radius: 10px;
    cursor: pointer;
    border: 1.5px solid var(--n200);
    background: var(--w);
    transition: border-color .18s, background .18s;
    font-family: 'Tajawal', sans-serif;
    user-select: none;
  }
  .qn__profile-btn:hover {
    border-color: var(--g300);
    background: var(--g50);
  }
  .qn__avatar {
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
  .qn__profile-name {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--n800);
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .qn__arrow {
    font-size: 15px;
    color: var(--n400);
    transition: transform .25s;
    flex-shrink: 0;
  }
  .qn__arrow--open {
    transform: rotate(180deg);
  }

  /* ════════════════════════════
     DROPDOWN
  ════════════════════════════ */
  .qn__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 210px;
    background: var(--w);
    border: 1px solid var(--n200);
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06);
    padding: 6px;
    list-style: none;
    margin: 0;
    z-index: 1000;
    opacity: 0;
    transform: translateY(8px) scale(.97);
    pointer-events: none;
    transition: opacity .2s, transform .2s;
  }
  .qn__dropdown--open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
  }
  .qn__dropdown a {
    text-decoration: none;
    color: inherit;
    display: block;
  }
  .qn__dd-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 13px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--n700);
    cursor: pointer;
    transition: background .15s, color .15s;
    list-style: none;
    border: none;
    background: none;
    font-family: 'Tajawal', sans-serif;
    width: 100%;
    text-align: right;
  }
  .qn__dd-item:hover {
    background: var(--g50);
    color: var(--g600);
  }
  .qn__dd-item svg {
    color: var(--n400);
    flex-shrink: 0;
    font-size: 14px;
  }
  .qn__dd-item:hover svg {
    color: var(--g500);
  }
  .qn__dd-item--danger {
    color: #dc2626;
  }
  .qn__dd-item--danger:hover {
    background: #fef2f2;
    color: #dc2626;
  }
  .qn__dd-item--danger svg {
    color: #dc2626;
  }
  .qn__divider {
    height: 1px;
    background: var(--n100);
    margin: 5px 0;
  }

  /* ════════════════════════════
     HAMBURGER
  ════════════════════════════ */
  .qn__ham {
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
    padding: 0;
  }
  .qn__ham span {
    display: block;
    width: 16px;
    height: 1.8px;
    border-radius: 2px;
    background: var(--n700);
    transition: .28s;
  }
  .qn__ham--open span:nth-child(1) { transform: translateY(6.3px) rotate(45deg); }
  .qn__ham--open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .qn__ham--open span:nth-child(3) { transform: translateY(-6.3px) rotate(-45deg); }

  /* ════════════════════════════
     MOBILE DRAWER
  ════════════════════════════ */
  .qn__drawer {
    position: fixed;
    inset: var(--nav-h) 0 0 0;
    z-index: 998;
    background: var(--w);
    overflow-y: auto;
    padding: 16px 20px 32px;
    transform: translateX(110%);
    transition: transform .3s cubic-bezier(.4,0,.2,1);
    direction: rtl;
    font-family: 'Tajawal', sans-serif;
  }
  .qn__drawer--open {
    transform: translateX(0);
  }
  .qn__drawer-links {
    list-style: none;
    margin: 0 0 16px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .qn__drawer-links a {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: var(--n600);
    padding: 13px 16px;
    border-bottom: 1px solid var(--n100);
    text-decoration: none;
    border-radius: 8px;
    transition: background .15s, color .15s;
  }
  .qn__drawer-links a:hover {
    background: var(--g50);
    color: var(--g600);
  }
  .qn__drawer-cta {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 16px;
  }
  .qn__drawer-cta .qn__btn {
    justify-content: center;
    width: 100%;
    padding: 13px 20px;
    font-size: 14px;
  }

  /* ════════════════════════════
     LOADING SPINNER
  ════════════════════════════ */
  .qn__spinner {
    width: 22px;
    height: 22px;
    border: 2px solid var(--n200);
    border-top-color: var(--g500);
    border-radius: 50%;
    animation: qn-spin .7s linear infinite;
  }
  @keyframes qn-spin { to { transform: rotate(360deg); } }

  /* ════════════════════════════
     RESPONSIVE
  ════════════════════════════ */
  @media (max-width: 1024px) {
    .qn__links { display: none; }
  }
  @media (max-width: 768px) {
    :root { --nav-h: 60px; }
    .qn__links  { display: none; }
    .qn__actions .qn__btn--outline,
    .qn__actions .qn__btn--ghost { display: none; }
    .qn__actions .qn__btn--solid { display: none; }
    .qn__ham { display: flex; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const { user } = useAuthUser();
    const location = useLocation();

    // ── scroll ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, []);

    // ── centerSlug من الـ URL ────────────────────────────────────────────────
    const centerSlug = (() => {
        const parts = location.pathname.split("/").filter(Boolean);
        return parts.length >= 1 ? parts[0] : null;
    })();

    // ── روابط الدروبداون حسب الـ role (نفس منطقك) ──────────────────────────
    const getRoleLinks = () => {
        if (!user) return [];

        if (user?.teacher?.role === "teacher") {
            return [
                {
                    href: "/teacher-dashboard",
                    label: "لوحة المعلم",
                    icon: <FaUserAlt />,
                },
                {
                    href: "/teacher-dashboard/plans",
                    label: "جدول الجلسات",
                    icon: <BsTable />,
                },
            ];
        }

        if (
            [
                "financial",
                "motivator",
                "supervisor",
                "student_affairs",
            ].includes(user?.teacher?.role)
        ) {
            return [
                {
                    href: "/center-dashboard",
                    label: "لوحة المشرف",
                    icon: <FaUserAlt />,
                },
            ];
        }

        if (
            user?.center_owner ||
            user?.role?.name === "center_owner" ||
            user?.role_id === 1
        ) {
            return [
                {
                    href: "/center-dashboard",
                    label: "مجمعي",
                    icon: <FaUserAlt />,
                },
            ];
        }

        if (user?.role?.name === "student") {
            return [
                {
                    href: "/user-dashboard",
                    label: "حسابي",
                    icon: <FaUserAlt />,
                },
            ];
        }

        if (user?.teacher?.role) {
            const map: Record<string, { title: string; link: string }> = {
                teacher: { title: "لوحة المعلم", link: "/teacher-dashboard" },
                supervisor: {
                    title: "لوحة المشرف",
                    link: "/supervisor-dashboard",
                },
                motivator: {
                    title: "لوحة الدافع",
                    link: "/motivator-dashboard",
                },
                student_affairs: {
                    title: "لوحة شؤون الطلاب",
                    link: "/student-affairs-dashboard",
                },
                financial: {
                    title: "لوحة المالية",
                    link: "/financial-dashboard",
                },
            };
            const cfg = map[user.teacher.role] ?? {
                title: "لوحة التحكم",
                link: "/center-dashboard",
            };
            return [
                { href: cfg.link, label: cfg.title, icon: <FaUserAlt /> },
                {
                    href: `${cfg.link}/plans`,
                    label: "جدول الجلسات",
                    icon: <BsTable />,
                },
            ];
        }

        return [
            { href: "/user-dashboard", label: "حسابي", icon: <FaUserAlt /> },
        ];
    };

    const roleLinks = getRoleLinks();

    // ── logout ───────────────────────────────────────────────────────────────
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

    // ── روابط الوسط ─────────────────────────────────────────────────────────
    const navLinks = [
        { href: "#features", label: "المميزات" },
        { href: "#circles", label: "الحلقات" },
        { href: "#how-it-works", label: "آلية العمل" },
        { href: "#faq", label: "الأسئلة الشائعة" },
        { href: "#contact", label: "تواصل معنا" },
    ];

    const loginLink = centerSlug ? `/${centerSlug}/login` : "/login";

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{navStyles}</style>

            {/* Settings Modal */}
            {showSettings && user && (
                <EditAccountPage
                    onClose={() => setShowSettings(false)}
                    onSuccess={() => setShowSettings(false)}
                />
            )}

            {/* ══ NAV ══════════════════════════════════════════════════════════ */}
            <header
                className={`qn ${scrolled ? "qn--scrolled" : ""}`}
                onClick={() => setProfileOpen(false)}
            >
                <div className="qn__inner">
                    {/* 1 ── اللوجو */}
                    <a href="/" className="qn__logo">
                        <div className="qn__logo-box">
                            <img src={Logo} alt="لوجو" />
                        </div>
                    </a>

                    {/* 2 ── روابط الوسط */}
                    <ul className="qn__links">
                        {navLinks.map((l) => (
                            <li key={l.href}>
                                <a href={l.href}>{l.label}</a>
                            </li>
                        ))}
                    </ul>

                    {/* 3 ── الجانب الأيسر */}
                    <div className="qn__actions">
                        {user ? (
                            /* ── مسجّل ── */
                            <div
                                className="qn__profile"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* زرار البروفايل */}
                                <div
                                    className="qn__profile-btn"
                                    onClick={() => setProfileOpen((p) => !p)}
                                >
                                    <div className="qn__avatar">
                                        {user?.name?.charAt(0)?.toUpperCase() ||
                                            "A"}
                                    </div>
                                    <span className="qn__profile-name">
                                        {user?.name || "المستخدم"}
                                    </span>
                                    <IoIosArrowDown
                                        className={`qn__arrow ${profileOpen ? "qn__arrow--open" : ""}`}
                                    />
                                </div>

                                {/* الدروبداون */}
                                <ul
                                    className={`qn__dropdown ${profileOpen ? "qn__dropdown--open" : ""}`}
                                >
                                    {/* روابط الـ role */}
                                    {roleLinks.map((link, i) => (
                                        <a key={i} href={link.href}>
                                            <li className="qn__dd-item">
                                                {link.icon}
                                                {link.label}
                                            </li>
                                        </a>
                                    ))}

                                    {/* الإعدادات */}
                                    <li
                                        className="qn__dd-item"
                                        onClick={() => {
                                            setShowSettings(true);
                                            setProfileOpen(false);
                                        }}
                                    >
                                        <IoSettings />
                                        الإعدادات
                                    </li>

                                    <div className="qn__divider" />

                                    {/* تسجيل الخروج */}
                                    <li
                                        className="qn__dd-item qn__dd-item--danger"
                                        onClick={handleLogout}
                                    >
                                        <IoSettings />
                                        تسجيل الخروج
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            /* ── غير مسجّل ── */
                            <>
                                <a
                                    href={loginLink}
                                    className="qn__btn qn__btn--ghost"
                                >
                                    <HiLogin />
                                    تسجيل الدخول
                                </a>

                                {!centerSlug && (
                                    <a
                                        href="/center-register"
                                        className="qn__btn qn__btn--solid"
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
                                        سجّل مجمعك الآن
                                    </a>
                                )}
                            </>
                        )}

                        {/* Hamburger */}
                        <button
                            className={`qn__ham ${drawerOpen ? "qn__ham--open" : ""}`}
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
            </header>

            {/* ══ MOBILE DRAWER ════════════════════════════════════════════════ */}
            <div
                className={`qn__drawer ${drawerOpen ? "qn__drawer--open" : ""}`}
            >
                <ul className="qn__drawer-links">
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

                <div className="qn__drawer-cta">
                    {user ? (
                        /* الحالة: مسجّل داخل الدراور */
                        <>
                            {roleLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.href}
                                    className="qn__btn qn__btn--outline"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    {link.icon}
                                    {link.label}
                                </a>
                            ))}
                            <button
                                className="qn__btn qn__btn--outline"
                                onClick={() => {
                                    setShowSettings(true);
                                    setDrawerOpen(false);
                                }}
                            >
                                <IoSettings />
                                الإعدادات
                            </button>
                            <button
                                className="qn__btn"
                                style={{
                                    background: "#fef2f2",
                                    color: "#dc2626",
                                    border: "1.5px solid #fecaca",
                                }}
                                onClick={handleLogout}
                            >
                                تسجيل الخروج
                            </button>
                        </>
                    ) : (
                        /* الحالة: غير مسجّل داخل الدراور */
                        <>
                            <a
                                href={loginLink}
                                className="qn__btn qn__btn--outline"
                                onClick={() => setDrawerOpen(false)}
                            >
                                <HiLogin />
                                تسجيل الدخول
                            </a>
                            {!centerSlug && (
                                <a
                                    href="/center-register"
                                    className="qn__btn qn__btn--solid"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    سجّل مجمعك الآن
                                </a>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;
