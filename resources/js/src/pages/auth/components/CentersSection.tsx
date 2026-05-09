import React, { useEffect, useState } from "react";
import axios from "axios";

interface Center {
    id: number;
    name: string;
    subdomain: string;
    logo: string | null;
}

interface Props {
    currentSlug?: string | null;
}

const CentersSection: React.FC<Props> = ({ currentSlug }) => {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios
            .get("/api/public/centers")
            .then((r) => setCenters(r.data.data ?? []))
            .catch(() => setCenters([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = centers.filter(
        (c) =>
            c.subdomain !== currentSlug &&
            c.name.toLowerCase().includes(search.toLowerCase()),
    );

    const goToCenter = (subdomain: string) => {
        window.location.href = `/${subdomain}/login`;
    };

    return (
        <>
            <style>{`
                .cs-wrap {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(15,110,86,.12);
                }
                .cs-heading {
                    font-size: .72rem; font-weight: 700;
                    color: #0F6E56; letter-spacing: .06em; text-transform: uppercase;
                    display: flex; align-items: center; gap: 8px;
                    margin-bottom: 1rem;
                }
                .cs-heading::after { content: ''; flex: 1; height: .5px; background: rgba(15,110,86,.15); }
                .cs-desc {
                    font-size: .8rem; color: #6b7280;
                    margin-bottom: .85rem; line-height: 1.55;
                }
                .cs-search-wrap { position: relative; margin-bottom: .9rem; }
                .cs-search-icon {
                    position: absolute; right: 11px; top: 50%;
                    transform: translateY(-50%); color: #9ca3af;
                }
                .cs-search {
                    width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
                    padding: 9px 36px 9px 12px; font-size: .82rem;
                    font-family: 'Tajawal', sans-serif; outline: none;
                    transition: all .2s; background: #fafbfa; color: #0a1a14;
                    box-sizing: border-box;
                }
                .cs-search:focus { border-color: #0F6E56; box-shadow: 0 0 0 3px rgba(15,110,86,.09); background: #fff; }
                .cs-search::placeholder { color: #c4c8c5; }
                .cs-grid {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 8px; max-height: 260px; overflow-y: auto;
                    padding-right: 2px;
                }
                .cs-grid::-webkit-scrollbar { width: 4px; }
                .cs-grid::-webkit-scrollbar-track { background: #f0f0ef; border-radius: 4px; }
                .cs-grid::-webkit-scrollbar-thumb { background: rgba(15,110,86,.3); border-radius: 4px; }
                .cs-card {
                    display: flex; align-items: center; gap: 9px;
                    padding: 10px 11px; border-radius: 12px;
                    border: 1.5px solid #e5e7eb; background: #fafbfa;
                    cursor: pointer; transition: all .2s cubic-bezier(.34,1.56,.64,1);
                    text-align: right; font-family: 'Tajawal', sans-serif;
                    width: 100%;
                }
                .cs-card:hover {
                    border-color: rgba(15,110,86,.45);
                    background: linear-gradient(135deg, #e8f5ef, #f5fbf8);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 14px rgba(15,110,86,.1);
                }
                .cs-logo {
                    width: 34px; height: 34px; border-radius: 9px;
                    background: linear-gradient(135deg, #0F6E56, #1a9e7a);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; overflow: hidden;
                    font-size: .75rem; font-weight: 800; color: #fff;
                }
                .cs-logo img { width: 100%; height: 100%; object-fit: cover; }
                .cs-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
                .cs-name { font-size: .78rem; font-weight: 800; color: #0a1a14; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .cs-slug { font-size: .68rem; color: #9ca3af; direction: ltr; text-align: right; }
                .cs-empty { text-align: center; color: #9ca3af; font-size: .8rem; padding: 1.5rem 0; }
                .cs-skeleton {
                    height: 56px; border-radius: 12px;
                    background: linear-gradient(90deg, #f0f0ef 25%, #e8e8e7 50%, #f0f0ef 75%);
                    background-size: 200% 100%;
                    animation: cs-shimmer 1.4s infinite;
                }
                @keyframes cs-shimmer { to { background-position: -200% 0; } }
            `}</style>
            <div className="cs-wrap">
                <div className="cs-heading">
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    المجمعات المتاحة على المنصة
                </div>
                <p className="cs-desc">اختر مجمعك للتسجيل فيه مباشرةً</p>
                {!loading && centers.length > 4 && (
                    <div className="cs-search-wrap">
                        <span className="cs-search-icon">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            className="cs-search"
                            type="text"
                            placeholder="ابحث عن مجمع..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
                {loading ? (
                    <div className="cs-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="cs-skeleton" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="cs-empty">لا توجد مجمعات متاحة حالياً</div>
                ) : (
                    <div className="cs-grid">
                        {filtered.map((c) => (
                            <button
                                key={c.id}
                                className="cs-card"
                                onClick={() => goToCenter(c.subdomain)}
                                title={`الذهاب إلى ${c.name}`}
                            >
                                <div className="cs-logo">
                                    {c.logo ? (
                                        <img src={c.logo} alt={c.name} />
                                    ) : (
                                        c.name.charAt(0)
                                    )}
                                </div>
                                <div className="cs-info">
                                    <span className="cs-name">{c.name}</span>
                                    <span className="cs-slug">
                                        /{c.subdomain}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default CentersSection;
