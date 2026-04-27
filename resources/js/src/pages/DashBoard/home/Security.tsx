const Security: React.FC = () => {
    const items = [
        {
            title: "أمان وحماية البيانات",
            desc: "تشفير كامل AES-256 لجميع البيانات مع نسخ احتياطية تلقائية يومية.",
        },
        {
            title: "دعم فني على مدار الساعة",
            desc: "فريق دعم متخصص متاح 8 صباحاً حتى 10 مساءً كل يوم.",
        },
        {
            title: "توافق مع جميع الأجهزة",
            desc: "يعمل على الكمبيوتر واللوحي والجوال مع دعم وضع الأوفلاين.",
        },
    ];

    return (
        <section
            style={{
                padding: "clamp(50px,6vw,80px) 15%",
                background: "var(--n50)",
                borderTop: "1px solid var(--n200)",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 20,
                }}
                className="trust-grid"
            >
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="reveal"
                        style={{
                            background: "var(--n0)",
                            border: "1px solid var(--n200)",
                            borderRadius: "var(--radius-l)",
                            padding: 28,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 16,
                            transition: ".2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--g200)";
                            e.currentTarget.style.boxShadow = "var(--shadow-s)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--n200)";
                            e.currentTarget.style.boxShadow = "";
                        }}
                    >
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: "var(--radius-m)",
                                background: "var(--g100)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <svg
                                width={22}
                                height={22}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--g600)"
                                strokeWidth={2}
                            >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: 14,
                                    fontWeight: 800,
                                    color: "var(--n800)",
                                    marginBottom: 4,
                                }}
                            >
                                {item.title}
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: "var(--n500)",
                                    lineHeight: 1.7,
                                }}
                            >
                                {item.desc}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
        @media(max-width:768px){.trust-grid{grid-template-columns:1fr!important;}}
        @media(min-width:480px) and (max-width:768px){.trust-grid{grid-template-columns:repeat(2,1fr)!important;}}
      `}</style>
        </section>
    );
};

export default Security;
