import { useState, useEffect, useCallback } from "react";

const FinalCTA: React.FC = () => {
    const Pill = ({ children }: { children: React.ReactNode }) => (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--g50)",
                border: "1px solid var(--g200)",
                color: "var(--g600)",
                padding: "5px 14px",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 700 as const,
            }}
        >
            <span
                style={{
                    width: 16,
                    height: 2,
                    background: "var(--g400)",
                    borderRadius: 2,
                    display: "block",
                }}
            />
            {children}
        </div>
    );

    const SectionHead = ({
        label,
        title,
        desc,
    }: {
        label: string;
        title: string;
        desc: string;
    }) => (
        <div
            className="section-head"
            style={{
                textAlign: "center",
                marginBottom: "clamp(40px,5vw,64px)",
                position: "relative",
                zIndex: 20,
                opacity: 1,
                transform: "none",
            }}
        >
            <div style={{ marginBottom: 16 }}>
                <Pill>{label}</Pill>
            </div>
            <h2
                style={{
                    fontFamily: "Tajawal,sans-serif",
                    fontSize: "clamp(1.7rem,3.2vw,2.8rem)",
                    fontWeight: 900 as const,
                    color: "var(--n900)",
                    lineHeight: 1.2,
                    marginBottom: 14,
                }}
                dangerouslySetInnerHTML={{ __html: title }}
            />
            <p
                style={{
                    fontSize: 16,
                    color: "var(--n500)",
                    lineHeight: 1.9,
                    maxWidth: 580,
                    margin: "0 auto",
                }}
            >
                {desc}
            </p>
        </div>
    );

    // أول سؤال مفتوح افتراضياً
    const [open, setOpen] = useState<number | null>(0);

    const faqs = [
        {
            q: "هل يمكنني إدارة أكثر من مجمع على نفس الحساب؟",
            a: "نعم، تتيح منصة إتقان إدارة عدد غير محدود من المجمعات والحلقات ضمن حساب واحد مع عزل تام لبيانات كل مجمع وصلاحيات مخصصة لكل مشرف.",
        },
        {
            q: "كيف تعمل غرف التسميع الذكية؟",
            a: "تتيح غرف التسميع إجراء جلسات مسموعة مباشرة بين المعلم والطالب عبر الإنترنت مع تسجيل الجلسة تلقائياً لإمكانية المراجعة لاحقاً ومتابعة التقدم.",
        },
        {
            q: "هل المنصة تدعم الدور النسائية؟",
            a: "بالتأكيد، تم تصميم منصة إتقان مع مراعاة احتياجات الدور النسائية بشكل كامل مع صلاحيات منفصلة وبوابات مخصصة للمعلمات وأولياء أمور الطالبات.",
        },
        {
            q: "ما مدى أمان بيانات المجمع والطلاب؟",
            a: "نستخدم تشفير AES-256 لجميع البيانات مع نسخ احتياطية تلقائية يومية وحماية من الاختراق وعزل تام لبيانات كل مجمع.",
        },
        {
            q: "هل يمكن تخصيص تقارير الرواتب؟",
            a: "نعم، يمكن تخصيص نظام الرواتب بالكامل — أضف بدلات، حسومات، مكافآت ومكافآت إضافية — مع إمكانية تصدير كشوف الرواتب بصيغة PDF و Excel.",
        },
    ];

    // Scroll reveal effect للـ FAQ items فقط
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in");
                    }
                });
            },
            { threshold: 0.1 },
        );

        // فقط الـ FAQ items وليس SectionHead
        const faqItems = document.querySelectorAll(".faq-item");
        faqItems.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    // Memoized toggle function لتجنب re-renders
    const toggleFAQ = useCallback(
        (index: number) => {
            setOpen(open === index ? null : index);
        },
        [open],
    );

    return (
        <section
            id="faq"
            style={{
                padding: "clamp(60px,8vw,100px) 0",
                background: "var(--g50)",
                position: "relative",
                overflow: "visible",
            }}
        >
            <div
                className="container"
                style={{ maxWidth: 760, margin: "0 auto" }}
            >
                {/* SectionHead منفصل تماماً بدون reveal */}
                <SectionHead
                    label="الأسئلة الشائعة"
                    title="إجابات لأكثر <br><span style='color:var(--g500)'>الأسئلة شيوعاً</span>"
                    desc="لم تجد إجابتك؟ تواصل معنا مباشرة وسيردّ عليك فريق الدعم خلال ساعات."
                />

                <div style={{ marginTop: "20px" }}>
                    {faqs.map((f, i) => (
                        <div
                            key={`faq-${i}`}
                            className="faq-item reveal"
                            style={{
                                background: "var(--n0)",
                                border: `1px solid ${open === i ? "var(--g300)" : "var(--n200)"}`,
                                borderRadius: "var(--radius-l)",
                                marginBottom: 12,
                                overflow: "hidden",
                                transition: ".2s ease",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => toggleFAQ(i)}
                                style={{
                                    width: "100%",
                                    padding: "20px 24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 16,
                                    fontSize: 15,
                                    fontWeight: 700 as const,
                                    color:
                                        open === i
                                            ? "var(--g600)"
                                            : "var(--n800)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "right" as const,
                                    direction: "rtl",
                                }}
                            >
                                {f.q}
                                <span
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        background:
                                            open === i
                                                ? "var(--g100)"
                                                : "var(--n100)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        transition: ".3s ease",
                                        transform:
                                            open === i
                                                ? "rotate(180deg)"
                                                : "none",
                                    }}
                                >
                                    <svg
                                        width={14}
                                        height={14}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={
                                            open === i
                                                ? "var(--g600)"
                                                : "var(--n500)"
                                        }
                                        strokeWidth={2.5}
                                        strokeLinecap="round"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </span>
                            </button>
                            {open === i && (
                                <div
                                    style={{
                                        padding: "0 24px 20px",
                                        fontSize: 14,
                                        color: "var(--n500)",
                                        lineHeight: 1.9,
                                    }}
                                >
                                    {f.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FinalCTA;
