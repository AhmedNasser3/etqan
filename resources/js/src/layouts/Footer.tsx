import {
    FaWhatsapp,
    FaInstagram,
    FaTelegram,
    FaPhone,
    FaEnvelope,
    FaClock,
    FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
    return (
        <footer
            style={{
                background: "var(--n900)",
                padding: "clamp(40px,5vw,64px) 15% 28px",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2.2fr 1fr 1fr 1fr",
                    gap: "clamp(32px,5vw,64px)",
                    marginBottom: 52,
                }}
                className="footer-grid"
            >
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 14,
                        }}
                    >
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background:
                                    "linear-gradient(145deg,var(--g500),var(--g700))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <svg
                                width={20}
                                height={20}
                                viewBox="0 0 24 24"
                                fill="#fff"
                            >
                                <path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9z" />
                            </svg>
                        </div>
                        <span
                            style={{
                                fontFamily: "Tajawal,sans-serif",
                                fontSize: 22,
                                fontWeight: 900,
                                color: "#fff",
                            }}
                        >
                            إتقان
                            <span style={{ color: "var(--g500)" }}>.</span>
                        </span>
                    </div>
                    <p
                        style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,.4)",
                            lineHeight: 1.9,
                            marginBottom: 24,
                            maxWidth: 300,
                        }}
                    >
                        منصة تعليمية متطورة لإدارة حلقات حفظ القرآن الكريم —
                        نجمع بين التقنية الحديثة وخدمة كتاب الله.
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                        {["تويتر", "يوتيوب", "واتساب", "لينكدإن"].map((s) => (
                            <div
                                key={s}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 9,
                                    background: "rgba(255,255,255,.06)",
                                    border: "1px solid rgba(255,255,255,.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: ".2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        "var(--g600)";
                                    e.currentTarget.style.borderColor =
                                        "var(--g500)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        "rgba(255,255,255,.06)";
                                    e.currentTarget.style.borderColor =
                                        "rgba(255,255,255,.1)";
                                }}
                            >
                                <svg
                                    width={16}
                                    height={16}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="rgba(255,255,255,.6)"
                                    strokeWidth={2}
                                >
                                    <circle cx={12} cy={12} r={5} />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
                {[
                    {
                        title: "المنصة",
                        links: [
                            "المميزات",
                            "الحلقات",
                            "آلية العمل",
                            "الأمان",
                            "آراء العملاء",
                        ],
                    },
                    {
                        title: "الخدمات",
                        links: [
                            "إنشاء مجمع",
                            "الدعم الفني",
                            "التدريب والتأهيل",
                            "استشارة مجانية",
                            "الأسئلة الشائعة",
                        ],
                    },
                    {
                        title: "الروابط",
                        links: [
                            "الرئيسية",
                            "الحلقات",
                            "المعلمون",
                            "المجامع",
                            "سياسة الخصوصية",
                        ],
                    },
                ].map((col) => (
                    <div key={col.title}>
                        <h5
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "rgba(255,255,255,.9)",
                                marginBottom: 18,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}
                        >
                            {col.title}
                        </h5>
                        <ul
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            {col.links.map((l) => (
                                <li key={l}>
                                    <a
                                        href="#"
                                        style={{
                                            fontSize: 13,
                                            color: "rgba(255,255,255,.4)",
                                            transition: ".2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.color =
                                                "var(--g300)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.color =
                                                "rgba(255,255,255,.4)";
                                        }}
                                    >
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div
                style={{
                    paddingTop: 24,
                    borderTop: "1px solid rgba(255,255,255,.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>
                    © 2025 إتقان. جميع الحقوق محفوظة.
                </div>
                <div
                    style={{
                        fontFamily: "Amiri,serif",
                        fontSize: 16,
                        color: "var(--g400)",
                        direction: "rtl",
                    }}
                >
                    ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
                </div>
            </div>
            <style>{`
        @media(max-width:900px){ .footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important;} }
        @media(max-width:480px){ .footer-grid{grid-template-columns:1fr!important;} }
      `}</style>
        </footer>
    );
};

export default Footer;
