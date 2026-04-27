const WhyHome: React.FC = () => {
    const pains = [
        {
            title: "ضياع بيانات الطلاب",
            desc: "السجلات الورقية عرضة للضياع والتلف مما يفقد تاريخ الطالب الكامل.",
        },
        {
            title: "صعوبة متابعة ولي الأمر",
            desc: "لا توجد وسيلة واضحة لتوصيل تقدم الطالب لوليّ أمره بصفة منتظمة.",
        },
        {
            title: "تعقيد الرواتب والمصروفات",
            desc: "حساب رواتب المعلمين ومصروفات المجمع يدوياً مرهق ومعرَّض للأخطاء.",
        },
    ];
    const solutions = [
        {
            title: "بيانات محمية ومنظّمة",
            desc: "سجلات رقمية آمنة لكل طالب يمكن الوصول إليها في أي وقت من أي جهاز.",
        },
        {
            title: "تقارير فورية",
            desc: "تقارير الحضور والحفظ تُولَّد تلقائياً يومياً وأسبوعياً وشهرياً.",
        },
        {
            title: "بوابة الأولياء",
            desc: "رابط خاص لكل طالب بدون كلمة مرور لمتابعة الإنجاز اليومي.",
        },
        {
            title: "رواتب تلقائية",
            desc: "حساب وصرف الرواتب للمعلمين والموظفين دون أي حسابات يدوية.",
        },
    ];

    return (
        <section
            style={{
                padding: "clamp(60px,8vw,100px) 15%",
                background: "var(--n900)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "clamp(40px,6vw,80px)",
                    alignItems: "center",
                }}
                className="problem-grid"
            >
                <div className="reveal-right">
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "rgba(255,255,255,.06)",
                            border: "1px solid rgba(255,255,255,.1)",
                            color: "var(--g300)",
                            padding: "5px 14px",
                            borderRadius: 100,
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 20,
                        }}
                    >
                        التحدي الذي تواجهه مجمعاتنا
                    </div>
                    <h2
                        style={{
                            fontFamily: "Tajawal,sans-serif",
                            fontSize: "clamp(1.6rem,2.8vw,2.5rem)",
                            fontWeight: 900,
                            color: "#fff",
                            lineHeight: 1.25,
                            marginBottom: 20,
                        }}
                    >
                        إدارة الحلقات بالطريقة التقليدية{" "}
                        <span style={{ color: "var(--g300)" }}>
                            تُكلّفك الكثير
                        </span>
                    </h2>
                    <p
                        style={{
                            fontSize: 15,
                            color: "rgba(255,255,255,.5)",
                            lineHeight: 1.9,
                            marginBottom: 36,
                        }}
                    >
                        كثير من مجمعات التحفيظ لا تزال تعتمد على السجلات الورقية
                        وجداول يدوية تستنزف وقت المشرفين وتُضيّع بيانات الطلاب.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                        }}
                    >
                        {pains.map((p, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 14,
                                    padding: "16px 20px",
                                    background: "rgba(255,255,255,.04)",
                                    border: "1px solid rgba(255,255,255,.07)",
                                    borderRadius: "var(--radius-m)",
                                    transition: ".2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        "rgba(255,255,255,.07)";
                                    e.currentTarget.style.borderColor =
                                        "rgba(30,143,97,.25)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        "rgba(255,255,255,.04)";
                                    e.currentTarget.style.borderColor =
                                        "rgba(255,255,255,.07)";
                                }}
                            >
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 9,
                                        background: "rgba(30,143,97,.12)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="var(--g400)"
                                        strokeWidth={2}
                                    >
                                        <circle cx={12} cy={12} r={10} />
                                        <line x1={15} y1={9} x2={9} y2={15} />
                                        <line x1={9} y1={9} x2={15} y2={15} />
                                    </svg>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: "#fff",
                                            marginBottom: 4,
                                        }}
                                    >
                                        {p.title}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "rgba(255,255,255,.45)",
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {p.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="reveal-left">
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "rgba(255,255,255,.06)",
                            border: "1px solid rgba(255,255,255,.1)",
                            color: "var(--g300)",
                            padding: "5px 14px",
                            borderRadius: 100,
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 20,
                        }}
                    >
                        الحل مع إتقان
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 14,
                        }}
                    >
                        {solutions.map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "rgba(255,255,255,.05)",
                                    border: "1px solid rgba(255,255,255,.08)",
                                    borderRadius: "var(--radius-l)",
                                    padding: 24,
                                    transition: ".25s",
                                    gridColumn: i === 0 ? "span 2" : "auto",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        "rgba(30,143,97,.08)";
                                    e.currentTarget.style.borderColor =
                                        "rgba(30,143,97,.25)";
                                    e.currentTarget.style.transform =
                                        "translateY(-3px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        "rgba(255,255,255,.05)";
                                    e.currentTarget.style.borderColor =
                                        "rgba(255,255,255,.08)";
                                    e.currentTarget.style.transform = "";
                                }}
                            >
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        background: "rgba(30,143,97,.15)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 14,
                                    }}
                                >
                                    <svg
                                        width={22}
                                        height={22}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="var(--g300)"
                                        strokeWidth={2}
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 800,
                                        color: "#fff",
                                        marginBottom: 6,
                                    }}
                                >
                                    {s.title}
                                </div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: "rgba(255,255,255,.45)",
                                        lineHeight: 1.7,
                                    }}
                                >
                                    {s.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style>{`@media(max-width:768px){.problem-grid{grid-template-columns:1fr!important;}}`}</style>
        </section>
    );
};

export default WhyHome;
