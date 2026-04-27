// TopBar.tsx
import React, { useState, useEffect } from "react";

interface TopBarProps {
    mobileSB: boolean;
    setMobileSB: React.Dispatch<React.SetStateAction<boolean>>;
}

const PAGE_TITLES: Record<string, string> = {
    home: "الصفحة الرئيسية",
    mosques: "لوحة الطالب",
    centers: "المجمعات",
    users: "المستخدمون",
    tasks: "المهام",
    stats: "الإحصائيات",
};

const ICO = {
    menu: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
        >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    ),
    search: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    ),
    bell: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
        >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
};

export default function UserTopBar({ mobileSB, setMobileSB }: TopBarProps) {
    const [page, setPage] = useState<string>("mosques");
    const [searchQ, setSearchQ] = useState<string>("");
    const [clock, setClock] = useState({
        t: "00:00",
        d: "YYYY-MM-DD",
    });
    const [unreadCount, setUnreadCount] = useState<number>(3);
    const [notifOpen, setNotifOpen] = useState<boolean>(false);

    const handleHamburgerClick = () => {
        setMobileSB((prev) => !prev);
    };

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, "0");
            const m = String(now.getMinutes()).padStart(2, "0");
            const d = now.toLocaleDateString("ar-EG", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            setClock({
                t: `${h}:${m}`,
                d: d,
            });
        };
        update();
        const it = setInterval(update, 1000);
        return () => clearInterval(it);
    }, []);

    return (
        <div className="topbar">
            {/* زر القائمة في الموبايل */}
            <button
                className="topbar-hamburger"
                onClick={handleHamburgerClick}
                style={{ display: "flex", position: "relative" }}
                title="Toggle Sidebar (Ctrl+H)"
            >
                <span
                    style={{
                        width: 16,
                        height: 16,
                        display: "inline-flex",
                    }}
                >
                    {ICO.menu}
                </span>
            </button>

            {/* عنوان الصفحة */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <div className="tb-title">{PAGE_TITLES[page] || page}</div>
            </div>

            {/* بحث سريع */}
            <div className="tb-search">
                <span
                    style={{
                        width: 13,
                        height: 13,
                        display: "inline-flex",
                        color: "var(--n400)",
                        flexShrink: 0,
                    }}
                >
                    {ICO.search}
                </span>
                <input
                    id="gSearch"
                    placeholder="بحث سريع... (Alt+K)"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: 12,
                        color: "var(--n800)",
                        width: "100%",
                    }}
                />
            </div>

            {/* الساعة */}
            <div className="clk">
                <div className="clk-t">{clock.t}</div>
                <div className="clk-d">{clock.d}</div>
            </div>

            {/* زر الإشعارات */}
            <button
                className="tb-icon"
                onClick={() => setNotifOpen((p) => !p)}
                title="الإشعارات"
                style={{ position: "relative" }}
            >
                <span
                    style={{
                        width: 15,
                        height: 15,
                        display: "inline-flex",
                    }}
                >
                    {ICO.bell}
                </span>
                {unreadCount > 0 && <div className="tb-dot">{unreadCount}</div>}
            </button>
        </div>
    );
}
