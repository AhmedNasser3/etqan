import { useState, useEffect, useRef } from "react";

// ─── الألوان والمتغيرات ───────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap');

  :root {
    --g50:#f0faf4; --g100:#d2eee1; --g200:#9fd9bc; --g300:#5cbf94;
    --g400:#28a46a; --g500:#178a54; --g600:#0f6e42; --g700:#0a5232; --g800:#063620;
    --w:#fff; --n50:#f7f9fb; --n100:#eef2f5; --n200:#dde5eb; --n300:#bfcdd8;
    --n400:#8ba3b3; --n500:#5b7a8d; --n600:#3a5c6e; --n700:#1e3a48; --n800:#0f2330; --n900:#06131a;
    --r8:8px; --r12:12px; --r16:16px; --r20:20px; --r24:24px; --r32:32px; --r999:999px;
    --s1:0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04);
    --s2:0 4px 14px rgba(0,0,0,.08),0 10px 28px rgba(0,0,0,.06);
    --s3:0 10px 32px rgba(0,0,0,.10),0 22px 52px rgba(0,0,0,.08);
    --sg:0 6px 22px rgba(23,138,84,.30);
    --ff:'Tajawal',sans-serif; --fa:'Amiri',serif;
    --nav:68px;
  }
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { font-family:var(--ff); background:var(--w); color:var(--n800); overflow-x:hidden; direction:rtl; -webkit-font-smoothing:antialiased; }
  a { text-decoration:none; color:inherit; }
  ul { list-style:none; }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes fa { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
  @keyframes fb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)} }
  @keyframes blink2 { from{transform:scale(1)} to{transform:scale(1.18)} }
  @keyframes td { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

  .geo-bg {
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg fill='none' stroke='%23178a54' stroke-width='0.55' stroke-opacity='0.11'%3E%3Cpolygon points='40,4 47,18 62,16 54,28 65,38 52,40 62,52 48,50 46,65 38,55 28,64 28,50 14,52 24,40 12,28 26,30 20,16 34,20'/%3E%3C/g%3E%3C/svg%3E");
    background-size:80px 80px;
  }
`;

// ─── مكونات صغيرة مشتركة ──────────────────────────────────────────────────────
const BookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const StarIcons = ({ count = 5 }: { count?: number }) => (
  <div style={{ display:"flex", gap:2, justifyContent:"center", marginTop:10 }}>
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} viewBox="0 0 24 24" width="13" height="13" fill="var(--g400)">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

function Tag({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:11.5, fontWeight:800, letterSpacing:".7px", textTransform:"uppercase", color:"var(--g500)", padding:"5px 14px", borderRadius:"var(--r999)", background:"var(--g50)", border:"1px solid var(--g200)" }}>
      {icon} {text}
    </span>
  );
}

function SecHead({ tag, tagIcon, title, desc }: { tag: string; tagIcon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ textAlign:"center", marginBottom:56 }}>
      <div style={{ marginBottom:16 }}><Tag icon={tagIcon} text={tag} /></div>
      <h2 style={{ fontFamily:"var(--fa)", fontSize:"clamp(1.8rem,3vw,2.7rem)", fontWeight:700, color:"var(--n900)", lineHeight:1.3, marginBottom:14 }}>{title}</h2>
      <p style={{ fontSize:15, color:"var(--n500)", lineHeight:1.85, maxWidth:560, margin:"0 auto" }}>{desc}</p>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { href:"#about", label:"عن المجمع" },
    { href:"#programs", label:"الحلقات" },
    { href:"#teachers", label:"المعلمون" },
    { href:"#schedule", label:"الجدول" },
    { href:"#contact", label:"تواصل معنا" },
  ];

  const navStyle: React.CSSProperties = {
    position:"fixed", inset:"0 0 auto 0", zIndex:999, height:"var(--nav)",
    background:"rgba(255,255,255,.97)", backdropFilter:"blur(18px) saturate(180%)",
    borderBottom: scrolled ? "1px solid transparent" : "1px solid var(--n200)",
    boxShadow: scrolled ? "var(--s2)" : "none",
    transition:"box-shadow .25s",
  };

  return (
    <>
      <nav style={navStyle}>
        <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px", height:"100%", display:"flex", alignItems:"center", gap:16 }}>
          {/* Logo */}
          <a href="#" style={{ display:"flex", alignItems:"center", gap:11, flexShrink:0 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:"linear-gradient(140deg,var(--g400),var(--g700))", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 12px rgba(23,138,84,.28)" }}>
              <BookIcon />
            </div>
            <div>
              <span style={{ display:"block", fontFamily:"var(--fa)", fontSize:15.5, fontWeight:700, color:"var(--n900)", lineHeight:1.15 }}>مجمع الإمام البخاري</span>
              <span style={{ display:"block", fontSize:10.5, color:"var(--n400)", fontWeight:500, marginTop:1 }}>لتحفيظ القرآن الكريم — الرياض</span>
            </div>
          </a>

          {/* Desktop links */}
          <ul style={{ flex:1, display:"flex", justifyContent:"center", gap:2 }} className="hide-mobile">
            {links.map(l => (
              <li key={l.href}>
                <a href={l.href} style={{ padding:"7px 15px", borderRadius:"var(--r8)", fontSize:13.5, fontWeight:600, color:"var(--n600)", display:"block" }}>{l.label}</a>
              </li>
            ))}
          </ul>

          {/* CTA buttons */}
          <div style={{ display:"flex", alignItems:"center", gap:9, flexShrink:0 }} className="hide-mobile">
            <a href="#contact" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"9px 20px", fontSize:12.5, fontWeight:700, borderRadius:"var(--r12)", border:"1.5px solid var(--g300)", background:"var(--w)", color:"var(--g600)", cursor:"pointer" }}>تسجيل الدخول</a>
            <a href="#contact" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 20px", fontSize:12.5, fontWeight:700, borderRadius:"var(--r12)", background:"var(--g500)", color:"#fff", boxShadow:"var(--sg)", cursor:"pointer" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              سجّل الآن
            </a>
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} style={{ display:"none", width:38, height:38, borderRadius:"var(--r8)", background:"var(--n100)", border:"none", cursor:"pointer", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:4.5, flexShrink:0 }} className="show-mobile-flex">
            {[0,1,2].map(i => (
              <span key={i} style={{ display:"block", width:16, height:1.8, borderRadius:2, background:"var(--n700)", transition:".28s",
                transform: open ? (i===0?"translateY(6.3px) rotate(45deg)":i===2?"translateY(-6.3px) rotate(-45deg)":"none") : "none",
                opacity: open && i===1 ? 0 : 1 }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div style={{ position:"fixed", inset:"var(--nav) 0 0 0", zIndex:998, background:"var(--w)", overflowY:"auto", padding:20 }}>
          <ul style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:20 }}>
            {links.map(l => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} style={{ display:"block", fontSize:16, padding:"13px 16px", borderBottom:"1px solid var(--n100)", fontWeight:600, color:"var(--n600)" }}>{l.label}</a>
              </li>
            ))}
          </ul>
          <a href="#contact" onClick={() => setOpen(false)} style={{ display:"flex", justifyContent:"center", padding:"12px 26px", fontSize:13.5, fontWeight:700, borderRadius:"var(--r12)", background:"var(--g500)", color:"#fff", boxShadow:"var(--sg)" }}>سجّل الآن</a>
        </div>
      )}
    </>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ minHeight:"100svh", paddingTop:"var(--nav)", display:"flex", alignItems:"center", position:"relative", overflow:"hidden", background:"linear-gradient(170deg,var(--g50) 0%,#fff 55%)" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 65% 60% at 65% -5%,rgba(23,138,84,.11) 0%,transparent 65%),radial-gradient(ellipse 45% 45% at -5% 85%,rgba(23,138,84,.08) 0%,transparent 55%)", zIndex:0 }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"radial-gradient(circle,var(--g200) 1px,transparent 1px)", backgroundSize:"32px 32px", opacity:.32, maskImage:"radial-gradient(ellipse 70% 70% at 50% 40%,black 0%,transparent 80%)", WebkitMaskImage:"radial-gradient(ellipse 70% 70% at 50% 40%,black 0%,transparent 80%)", zIndex:0 }} />

      <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px", position:"relative", zIndex:1, width:"100%" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 460px", alignItems:"center", gap:56, padding:"80px 0" }} className="hero-grid">
          {/* Text side */}
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:9, background:"var(--w)", border:"1px solid var(--g200)", borderRadius:"var(--r999)", padding:"7px 16px", fontSize:12.5, fontWeight:700, color:"var(--g600)", boxShadow:"var(--s1)", marginBottom:24 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--g400)", boxShadow:"0 0 0 3px rgba(40,164,106,.22)", animation:"pulse 2s infinite", display:"inline-block" }} />
              التسجيل مفتوح للفصل القادم
            </div>

            <h1 style={{ fontFamily:"var(--fa)", fontSize:"clamp(2rem,4vw,3.3rem)", fontWeight:700, color:"var(--n900)", lineHeight:1.3, marginBottom:20 }}>
              احفظ كتاب الله في<br/>
              <em style={{ fontStyle:"normal", color:"var(--g500)" }}>بيئة علمية متكاملة</em>
            </h1>

            <div style={{ padding:"16px 20px", marginBottom:20, background:"rgba(23,138,84,.05)", border:"1px solid var(--g200)", borderRadius:"var(--r12)", borderRight:"3px solid var(--g400)" }}>
              <b style={{ display:"block", fontFamily:"var(--fa)", fontSize:"1.2rem", color:"var(--g700)", lineHeight:2 }}>﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾</b>
              <small style={{ fontSize:11.5, color:"var(--n400)", fontWeight:600, marginTop:5, display:"block" }}>سورة الحجر — الآية ٩</small>
            </div>

            <p style={{ fontSize:14.5, color:"var(--n500)", lineHeight:1.9, marginBottom:32, maxWidth:470 }}>
              مجمع الإمام البخاري يقدم برامج متكاملة لحفظ القرآن الكريم وتجويده وتفسيره، بإشراف نخبة من المعلمين المجازين بأسانيد متصلة.
            </p>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:44 }}>
              <a href="#contact" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 34px", fontSize:14.5, fontWeight:700, borderRadius:"var(--r16)", background:"var(--g500)", color:"#fff", boxShadow:"var(--sg)", cursor:"pointer" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                سجّل طلبك الآن
              </a>
              <a href="#programs" style={{ display:"inline-flex", alignItems:"center", padding:"14px 34px", fontSize:14.5, fontWeight:700, borderRadius:"var(--r16)", background:"var(--w)", color:"var(--g600)", border:"1.5px solid var(--g300)", cursor:"pointer" }}>تعرف على الحلقات</a>
            </div>

            {/* Stats */}
            <div style={{ display:"flex", background:"var(--w)", border:"1px solid var(--n200)", borderRadius:"var(--r16)", boxShadow:"var(--s1)", overflow:"hidden", width:"fit-content" }}>
              {[
                { num:"٤٢٠+", label:"طالب وطالبة" },
                { num:"١٨", label:"معلم ومعلمة" },
                { num:"١٢", label:"سنة خبرة" },
                { num:"٢٣٠+", label:"خاتم للقرآن" },
              ].map((s, i, arr) => (
                <div key={i} style={{ padding:"15px 24px", textAlign:"center", borderLeft: i < arr.length-1 ? "1px solid var(--n100)" : "none" }}>
                  <b style={{ display:"block", fontFamily:"var(--fa)", fontSize:"1.55rem", fontWeight:700, color:"var(--g600)", lineHeight:1.1 }}>{s.num}</b>
                  <span style={{ display:"block", fontSize:11, color:"var(--n400)", fontWeight:600, marginTop:3 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card side */}
          <div style={{ position:"relative" }} className="hero-card-side">
            <div style={{ background:"var(--w)", borderRadius:"var(--r24)", border:"1px solid var(--n200)", boxShadow:"var(--s3)", padding:26 }}>
              <div style={{ display:"flex", alignItems:"center", gap:13, paddingBottom:18, marginBottom:18, borderBottom:"1px solid var(--n100)" }}>
                <div style={{ width:44, height:44, borderRadius:11, background:"linear-gradient(140deg,var(--g400),var(--g700))", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <BookIcon />
                </div>
                <div>
                  <h4 style={{ fontSize:14, fontWeight:800, color:"var(--n900)", marginBottom:2 }}>لوحة تقدم الطالب</h4>
                  <span style={{ fontSize:11.5, color:"var(--n400)" }}>أحمد بن محمد الغامدي</span>
                </div>
                <div style={{ marginRight:"auto", background:"var(--g50)", color:"var(--g600)", border:"1px solid var(--g200)", borderRadius:"var(--r999)", padding:"3px 10px", fontSize:11, fontWeight:800 }}>الفصل الثاني</div>
              </div>

              {[
                { label:"الحفظ الكلي", pct:"٧٢٪", w:72 },
                { label:"أحكام التجويد", pct:"٨٨٪", w:88 },
                { label:"المراجعة والتثبيت", pct:"٦٥٪", w:65 },
                { label:"حفظ الأحاديث", pct:"٩١٪", w:91 },
              ].map((b, i) => (
                <ProgressBar key={i} label={b.label} pct={b.pct} w={b.w} />
              ))}
            </div>

            {/* Floating chips */}
            <div style={{ position:"absolute", bottom:-14, left:-28, background:"var(--w)", border:"1px solid var(--n200)", borderRadius:"var(--r16)", boxShadow:"var(--s2)", padding:"11px 15px", display:"flex", alignItems:"center", gap:11, animation:"fa 5s ease-in-out infinite" }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"var(--g50)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <div>
                <b style={{ display:"block", fontSize:12.5, fontWeight:800, color:"var(--n900)" }}>٢٣ خاتماً</b>
                <small style={{ fontSize:10.5, color:"var(--n400)" }}>هذا الشهر</small>
              </div>
            </div>

            <div style={{ position:"absolute", top:-14, left:-34, background:"var(--w)", border:"1px solid var(--n200)", borderRadius:"var(--r16)", boxShadow:"var(--s2)", padding:"11px 15px", display:"flex", alignItems:"center", gap:11, animation:"fb 6.5s ease-in-out infinite 1s" }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"var(--n100)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--n600)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <b style={{ display:"block", fontSize:12.5, fontWeight:800, color:"var(--n900)" }}>حضور ٩٨٪</b>
                <small style={{ fontSize:10.5, color:"var(--n400)" }}>هذا الأسبوع</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ label, pct, w }: { label: string; pct: string; w: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setFilled(true); obs.disconnect(); } }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div style={{ marginBottom:15 }} ref={ref}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:12.5, fontWeight:700, color:"var(--n700)" }}>{label}</span>
        <span style={{ fontSize:11.5, fontWeight:800, color:"var(--g500)" }}>{pct}</span>
      </div>
      <div style={{ height:6, background:"var(--n100)", borderRadius:"var(--r999)", overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:"var(--r999)", width: filled ? `${w}%` : "0", background:"linear-gradient(90deg,var(--g300),var(--g500))", transition:"width 1.3s cubic-bezier(.23,1,.32,1)" }} />
      </div>
    </div>
  );
}

// ─── TRUST BAR ────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--g300)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label:"إسناد متصل للقراءات السبع" },
    { icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--g300)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>, label:"حلقات للرجال والنساء والأطفال" },
    { icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--g300)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, label:"تقارير دورية لأولياء الأمور" },
    { icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--g300)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label:"جداول مرنة صباحية ومسائية" },
    { icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--g300)" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, label:"شهادات معتمدة عند الإتمام" },
  ];
  return (
    <div style={{ background:"var(--g700)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", maxWidth:1220, margin:"0 auto" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"20px 30px", fontSize:13, fontWeight:600, color:"rgba(255,255,255,.82)", borderLeft: i > 0 ? "1px solid rgba(255,255,255,.09)" : "none" }}>
            {item.icon} {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ABOUT ───────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" style={{ background:"var(--n50)", padding:"88px 0" }} className="geo-bg">
      <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:68, alignItems:"center" }} className="about-grid">
          {/* Visual */}
          <div style={{ borderRadius:"var(--r32)", overflow:"hidden", aspectRatio:"4/3", background:"linear-gradient(145deg,var(--g600),var(--g800))", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <div style={{ padding:44, textAlign:"center", color:"#fff" }}>
              <div style={{ width:72, height:72, borderRadius:20, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3 style={{ fontFamily:"var(--fa)", fontSize:"1.45rem", fontWeight:700, marginBottom:8 }}>مجمع الإمام البخاري</h3>
              <p style={{ fontSize:13.5, opacity:.65, lineHeight:1.75 }}>منذ عام ١٤٣٢هـ — الرياض، حي العليا</p>
            </div>
            <div style={{ position:"absolute", bottom:22, right:22, background:"var(--w)", borderRadius:"var(--r20)", padding:"14px 18px", boxShadow:"var(--s2)", display:"flex", alignItems:"center", gap:13 }}>
              <span style={{ fontFamily:"var(--fa)", fontSize:"2rem", fontWeight:700, color:"var(--g500)", lineHeight:1 }}>١٢</span>
              <span style={{ fontSize:11.5, color:"var(--n500)", fontWeight:600, lineHeight:1.5 }}>عاماً من<br/>الخدمة القرآنية</span>
            </div>
          </div>

          {/* Text */}
          <div>
            <Tag icon={<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} text="عن مجمعنا" />
            <h2 style={{ fontFamily:"var(--fa)", fontSize:"clamp(1.7rem,2.8vw,2.5rem)", fontWeight:700, color:"var(--n900)", lineHeight:1.35, margin:"16px 0" }}>
              بيتٌ يجمعك بكتاب الله<br/>على يد أهل الإتقان
            </h2>
            <p style={{ fontSize:14.5, color:"var(--n500)", lineHeight:1.9, marginBottom:28 }}>
              تأسس مجمع الإمام البخاري بهدف توفير بيئة تعليمية راقية تجمع بين الأصالة في التلقي والتقنية في الإدارة، لخدمة كتاب الله وطلابه الكرام.
            </p>

            {[
              { icon:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, title:"أسانيد عالية متصلة", desc:"جميع معلمينا مجازون بأسانيد متصلة للقراءات السبع والعشر، مما يضمن صحة التلقي وعلو الإسناد." },
              { icon:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title:"منهج تعليمي محكم", desc:"نعتمد منهجاً تربوياً متكاملاً يربط بين الحفظ والتجويد والفهم والعمل، بخطط فردية لكل طالب." },
              { icon:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title:"إدارة رقمية متطورة", desc:"نستخدم منصة إتقان الرقمية لتتبع التقدم وإصدار التقارير وإشراك أولياء الأمور بفاعلية." },
            ].map((pt, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"16px 18px", background:"var(--w)", border:"1px solid var(--n200)", borderRadius:"var(--r16)", boxShadow:"var(--s1)", marginBottom:13 }}>
                <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:"var(--g50)", display:"flex", alignItems:"center", justifyContent:"center" }}>{pt.icon}</div>
                <div>
                  <b style={{ display:"block", fontSize:13.5, fontWeight:800, color:"var(--n800)", marginBottom:3 }}>{pt.title}</b>
                  <p style={{ fontSize:12.5, color:"var(--n500)", lineHeight:1.7 }}>{pt.desc}</p>
                </div>
              </div>
            ))}

            <a href="#contact" style={{ display:"inline-flex", alignItems:"center", padding:"14px 34px", fontSize:14.5, fontWeight:700, borderRadius:"var(--r16)", background:"var(--g500)", color:"#fff", boxShadow:"var(--sg)", marginTop:4, cursor:"pointer" }}>تعرف على المجمع أكثر</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PROGRAMS ─────────────────────────────────────────────────────────────────
const programs = [
  { num:"١", title:"حلقة البراعم — للأطفال", desc:"للأعمار ٦–١٢ سنة. منهج ممتع يجمع بين الحفظ والأنشطة التربوية.", features:["حفظ الأجزاء الأخيرة","قصص القرآن والسيرة","أنشطة تعليمية تفاعلية","تقارير أسبوعية للوالدين"], seats:"٨ مقاعد متبقية" },
  { num:"٢", title:"حلقة الإتقان — للشباب", desc:"للأعمار ١٣–٢٥. مسار مكثف لحفظ القرآن كاملاً مع التجويد والتفسير.", features:["حفظ القرآن كاملاً","دراسة علم التجويد","التفسير الإجمالي","شهادة إتمام الحفظ"], seats:"٥ مقاعد متبقية" },
  { num:"٣", title:"حلقة المتقدمين — للكبار", desc:"للراغبين في إتقان القراءات أو الحصول على إجازة بسند متصل.", features:["القراءات السبع والعشر","الإجازة بسند متصل","علوم القرآن الكريم","جلسات فردية متخصصة"], seats:"بحسب الطاقة" },
  { num:"٤", title:"الدور النسائي — للنساء", desc:"قسم خاص بالنساء والبنات بإشراف معلمات مؤهلات في بيئة آمنة.", features:["برامج للنساء والبنات","معلمات مجازات","جلسات صباحية ومسائية","دروس التجويد والفقه"], seats:"١٢ مقعداً" },
  { num:"٥", title:"حلقة أونلاين — عن بُعد", desc:"جلسات فيديو مباشرة مع معلمين متخصصين لأي مكان في العالم.", features:["جلسات فيديو مباشرة","تطبيق تتبع يومي","مناسبة لخارج المملكة","مرونة تامة في المواعيد"], seats:"مفتوح للتسجيل" },
  { num:"٦", title:"برنامج الختم — المكثف", desc:"برنامج رمضاني وصيفي مكثف لختم القرآن حفظاً ومراجعةً.", features:["مدة ٣ أشهر مكثفة","إشراف يومي مستمر","حفلة تكريم الخاتمين","شهادة معتمدة"], seats:"رمضان ١٤٤٧هـ" },
];

function Programs() {
  return (
    <section id="programs" style={{ padding:"88px 0", background:"var(--w)" }}>
      <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px" }}>
        <SecHead
          tag="برامجنا التعليمية"
          tagIcon={<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
          title="حلقات تناسب كل مرحلة وهدف"
          desc="نقدم برامج متخصصة مصممة للأطفال والشباب والكبار، مع مسارات منفصلة للرجال والنساء."
        />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }} className="programs-grid">
          {programs.map((p, i) => (
            <div key={i} style={{ borderRadius:"var(--r24)", border:"1px solid var(--n200)", background:"var(--w)", boxShadow:"var(--s1)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"26px 26px 22px", background:"linear-gradient(135deg,var(--g50) 0%,#fff 100%)", borderBottom:"1px solid var(--n100)", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:10, left:14, fontFamily:"var(--fa)", fontSize:"3.2rem", fontWeight:700, color:"var(--g100)", lineHeight:1, zIndex:0 }}>{p.num}</div>
                <h3 style={{ fontSize:15, fontWeight:800, color:"var(--n900)", marginBottom:6, position:"relative", zIndex:1 }}>{p.title}</h3>
                <p style={{ fontSize:12.5, color:"var(--n500)", lineHeight:1.7, position:"relative", zIndex:1 }}>{p.desc}</p>
              </div>
              <div style={{ padding:"20px 26px 26px", flex:1, display:"flex", flexDirection:"column" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18, flex:1 }}>
                  {p.features.map((f, fi) => (
                    <div key={fi} style={{ display:"flex", alignItems:"center", gap:9, fontSize:12.5, color:"var(--n700)", fontWeight:500 }}>
                      <div style={{ width:17, height:17, borderRadius:"50%", flexShrink:0, background:"var(--g50)", border:"1px solid var(--g200)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="var(--g500)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", background:"var(--n50)", borderRadius:"var(--r12)" }}>
                  <span style={{ fontSize:10.5, color:"var(--n400)", fontWeight:700, textTransform:"uppercase", letterSpacing:.4 }}>مقاعد متاحة</span>
                  <span style={{ fontSize:12, fontWeight:800, color:"var(--g600)" }}>{p.seats}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TEACHERS ─────────────────────────────────────────────────────────────────
const teachers = [
  { name:"الشيخ عبدالرحمن المطيري", role:"مدير المجمع — قسم الرجال", cert:"إجازة القراءات العشر" },
  { name:"الأستاذة فاطمة الزهراني", role:"مديرة القسم النسائي", cert:"إجازة برواية حفص" },
  { name:"الأستاذ محمد السيد", role:"معلم حلقة الشباب", cert:"إجازة السبعة برواياتهم" },
  { name:"الأستاذة أميرة الحربي", role:"معلمة حلقة البراعم", cert:"دبلوم التربية وعلوم القرآن" },
];

function Teachers() {
  return (
    <section id="teachers" style={{ padding:"88px 0", background:"var(--n50)" }} className="geo-bg">
      <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px" }}>
        <SecHead
          tag="كوادرنا التعليمية"
          tagIcon={<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>}
          title="معلمون متخصصون يحملون الإسناد العالي"
          desc="فريقنا من خيرة المعلمين المجازين الذين يجمعون بين العلم الشرعي والكفاءة التربوية."
        />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }} className="teachers-grid">
          {teachers.map((t, i) => (
            <div key={i} style={{ padding:"26px 22px 22px", textAlign:"center", background:"var(--w)", borderRadius:"var(--r24)", border:"1px solid var(--n200)", boxShadow:"var(--s1)" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", margin:"0 auto 14px", background:"linear-gradient(140deg,var(--g300),var(--g600))", display:"flex", alignItems:"center", justifyContent:"center", border:"3px solid var(--w)", boxShadow:"0 0 0 2px var(--g200)" }}>
                <UserIcon />
              </div>
              <div style={{ fontSize:13.5, fontWeight:800, color:"var(--n900)", marginBottom:4 }}>{t.name}</div>
              <div style={{ fontSize:11.5, color:"var(--g500)", fontWeight:700, marginBottom:11 }}>{t.role}</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"var(--g50)", border:"1px solid var(--g200)", borderRadius:"var(--r999)", padding:"3px 10px", fontSize:10.5, color:"var(--g700)", fontWeight:700 }}>
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--g500)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                {t.cert}
              </div>
              <StarIcons />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SCHEDULE ─────────────────────────────────────────────────────────────────
function Schedule() {
  const headers = ["الوقت", "الأحد — الاثنين", "الثلاثاء — الأربعاء", "الخميس", "السبت", "الجمعة"];
  const rows = [
    { time:"٨–١٠ ص", cells:[{t:"البراعم — أطفال",g:true},{t:"البراعم — أطفال",g:true},{t:"حلقة الإتقان"},{t:"البراعم — أطفال",g:true},{t:"إجازة",e:true}] },
    { time:"١٠–١٢ ص", cells:[{t:"القسم النسائي"},{t:"القسم النسائي"},{t:"القسم النسائي"},{t:"القسم النسائي"},{t:"إجازة",e:true}] },
    { time:"٥–٧ م", cells:[{t:"حلقة الإتقان",g:true},{t:"حلقة الإتقان",g:true},{t:"المتقدمون"},{t:"حلقة الإتقان",g:true},{t:"إجازة",e:true}] },
    { time:"٨–١٠ م", cells:[{t:"المتقدمون"},{t:"المتقدمون"},{t:"—",e:true},{t:"أونلاين"},{t:"ختم أسبوعي",g:true}] },
  ];

  return (
    <section id="schedule" style={{ padding:"88px 0", background:"linear-gradient(160deg,var(--g800) 0%,var(--g600) 100%)", position:"relative", overflow:"hidden" }}>
      <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:11.5, fontWeight:800, letterSpacing:".7px", textTransform:"uppercase", color:"rgba(255,255,255,.9)", padding:"5px 14px", borderRadius:"var(--r999)", background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.18)", marginBottom:16 }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            الجدول الأسبوعي
          </span>
          <h2 style={{ fontFamily:"var(--fa)", fontSize:"clamp(1.8rem,3vw,2.7rem)", fontWeight:700, color:"#fff", lineHeight:1.3, marginBottom:14 }}>مواعيد تناسب يومك</h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.6)", lineHeight:1.85 }}>جداول مرنة صباحية ومسائية طوال أيام الأسبوع لتناسب مختلف الاحتياجات.</p>
        </div>

        <div style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"var(--r24)", overflow:"hidden", backdropFilter:"blur(6px)" }}>
          {/* Header row */}
          <div style={{ display:"grid", gridTemplateColumns:"105px repeat(5,1fr)", borderBottom:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.10)" }}>
            {headers.map((h, i) => (
              <div key={i} style={{ padding:"13px 15px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,.06)" : "none", fontSize:10.5, fontWeight:800, color:"rgba(255,255,255,.45)", letterSpacing:.5, textTransform:"uppercase", display:"flex", alignItems:"center" }}>{h}</div>
            ))}
          </div>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display:"grid", gridTemplateColumns:"105px repeat(5,1fr)", borderBottom: ri < rows.length-1 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
              <div style={{ padding:"13px 15px", fontSize:11.5, fontWeight:800, color:"var(--g200)", display:"flex", alignItems:"center" }}>{row.time}</div>
              {row.cells.map((c, ci) => (
                <div key={ci} style={{ padding:"13px 15px", borderLeft:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center" }}>
                  <div style={{ padding:"6px 9px", borderRadius:"var(--r8)", fontSize:11.5, fontWeight:700, width:"100%", textAlign:"center",
                    background: (c as any).g ? "rgba(95,191,148,.16)" : (c as any).e ? "transparent" : "rgba(255,255,255,.10)",
                    color: (c as any).g ? "var(--g200)" : (c as any).e ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.78)"
                  }}>{c.t}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
const testimonials = [
  { text:"الحمد لله، أتم ابني حفظ القرآن كاملاً في سنتين فقط. الشيخ صبور ومتقن، والمنهج محكم جداً. شعرنا بالاطمئنان من أول يوم.", name:"أبو يزيد الغامدي", role:"والد طالب — حلقة الإتقان" },
  { text:"التقارير الأسبوعية التي تصلنا من المنصة تعطينا صورة واضحة عن تقدم بنتي. شيء رائع أن تعرفي كل يوم كم حفظت وراجعت.", name:"أم ريناد العتيبي", role:"والدة طالبة — القسم النسائي" },
  { text:"حصلت على إجازتي بسند متصل بعد سنة ونصف. ما توقعت أن الإجازة تكون ميسّرة إلى هذا الحد مع صحة التلقي وعلو الإسناد.", name:"سارة المالكي", role:"طالبة — حلقة المتقدمين" },
];

function Testimonials() {
  return (
    <section id="testimonials" style={{ padding:"88px 0", background:"var(--w)" }}>
      <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px" }}>
        <SecHead
          tag="شهادات الطلاب"
          tagIcon={<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          title="ماذا يقول أهلنا وطلابنا الكرام"
          desc="نفخر بثقة مئات الأسر التي أودعتنا أبناءها وبناتها لحفظ كتاب الله العزيز."
        />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }} className="testi-grid">
          {testimonials.map((t, i) => (
            <div key={i} style={{ padding:28, background:"var(--n50)", border:"1px solid var(--n200)", borderRadius:"var(--r24)", position:"relative", overflow:"hidden" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:"var(--g50)", border:"1px solid var(--g200)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--g400)"><path d="M10 11a4 4 0 0 1-8 0V7a4 4 0 0 1 8 0v4zm12 0a4 4 0 0 1-8 0V7a4 4 0 0 1 8 0v4z"/></svg>
              </div>
              <p style={{ fontSize:13.5, color:"var(--n600)", lineHeight:1.9, marginBottom:20 }}>{t.text}</p>
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,var(--g300),var(--g600))", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <UserIcon />
                </div>
                <div>
                  <b style={{ display:"block", fontSize:13, fontWeight:800, color:"var(--n900)" }}>{t.name}</b>
                  <small style={{ fontSize:11, color:"var(--n400)" }}>{t.role}</small>
                </div>
                <StarIcons count={5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA SECTION ──────────────────────────────────────────────────────────────
function CTASection() {
  const [submitted, setSubmitted] = useState(false);

  function handleCta() {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  }

  return (
    <section id="enroll" style={{ padding:"88px 0", background:"var(--n50)" }}>
      <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px" }}>
        <div style={{ background:"linear-gradient(135deg,var(--g700),var(--g500))", borderRadius:"var(--r32)", padding:"76px 60px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:11.5, fontWeight:800, letterSpacing:".7px", textTransform:"uppercase", color:"#fff", padding:"5px 14px", borderRadius:"var(--r999)", background:"rgba(255,255,255,.14)", border:"1px solid rgba(255,255,255,.22)", marginBottom:22, position:"relative", zIndex:1 }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            انضم إلى أسرتنا
          </span>
          <h2 style={{ fontFamily:"var(--fa)", fontSize:"clamp(1.7rem,3vw,2.55rem)", fontWeight:700, color:"#fff", marginBottom:14, position:"relative", zIndex:1 }}>ابدأ رحلتك مع القرآن الكريم اليوم</h2>
          <p style={{ fontSize:14.5, color:"rgba(255,255,255,.68)", lineHeight:1.85, marginBottom:38, maxWidth:500, margin:"0 auto 38px", position:"relative", zIndex:1 }}>
            سجّل اهتمامك الآن وسيتواصل معك فريقنا خلال ٢٤ ساعة لاختيار الحلقة والموعد المناسب.
          </p>
          <div style={{ display:"flex", gap:11, maxWidth:480, margin:"0 auto 14px", flexWrap:"wrap", justifyContent:"center", position:"relative", zIndex:1 }}>
            <input type="tel" placeholder="رقم الجوال أو واتساب" dir="rtl" style={{ flex:1, minWidth:190, padding:"13px 18px", borderRadius:"var(--r12)", border:"1.5px solid rgba(255,255,255,.18)", background:"rgba(255,255,255,.10)", fontFamily:"var(--ff)", fontSize:13.5, color:"#fff", outline:"none" }} />
            <button onClick={handleCta} style={{ background:"var(--w)", color:"var(--g600)", fontWeight:800, padding:"13px 30px", borderRadius:"var(--r12)", fontSize:13.5, boxShadow:"0 4px 14px rgba(0,0,0,.14)", display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer", border:"none", whiteSpace:"nowrap", fontFamily:"var(--ff)" }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--g500)" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {submitted ? "سنتواصل معك قريباً ✓" : "أريد التسجيل"}
            </button>
          </div>
          <p style={{ fontSize:11.5, color:"rgba(255,255,255,.38)", position:"relative", zIndex:1 }}>لا رسوم تسجيل — الدرس الأول مجاني للتجربة</p>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  const contactInfo = [
    { icon:<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label:"العنوان", value:"الرياض — حي العليا، شارع العروبة" },
    { icon:<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 16.5v.42z"/></svg>, label:"الهاتف والواتساب", value:"+966 50 123 4567" },
    { icon:<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label:"البريد الإلكتروني", value:"info@albukhari.com" },
    { icon:<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label:"ساعات الاستقبال", value:"السبت–الخميس: ٨ ص – ١٠ م" },
  ];

  return (
    <section id="contact" style={{ padding:"88px 0", background:"var(--w)" }}>
      <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr", gap:56, alignItems:"start" }} className="contact-grid">
          {/* Info */}
          <div>
            <Tag icon={<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--g500)" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 16.5v.42z"/></svg>} text="تواصل معنا" />
            <h2 style={{ fontFamily:"var(--fa)", fontSize:"clamp(1.6rem,2.6vw,2.3rem)", fontWeight:700, color:"var(--n900)", lineHeight:1.4, margin:"16px 0 14px" }}>
              يسعدنا الإجابة<br/>على جميع استفساراتكم
            </h2>
            <p style={{ fontSize:14, color:"var(--n500)", lineHeight:1.9, marginBottom:32 }}>
              فريقنا متاح لمساعدتك في اختيار البرنامج المناسب والإجابة على كل أسئلتك.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {contactInfo.map((ci, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"var(--n50)", border:"1px solid var(--n200)", borderRadius:"var(--r16)" }}>
                  <div style={{ width:40, height:40, borderRadius:11, flexShrink:0, background:"var(--g50)", border:"1px solid var(--g100)", display:"flex", alignItems:"center", justifyContent:"center" }}>{ci.icon}</div>
                  <div>
                    <div style={{ fontSize:10.5, color:"var(--n400)", fontWeight:700, letterSpacing:.4, textTransform:"uppercase" }}>{ci.label}</div>
                    <div style={{ fontSize:13.5, fontWeight:700, color:"var(--n800)" }}>{ci.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background:"var(--n50)", border:"1px solid var(--n200)", borderRadius:"var(--r24)", padding:36 }}>
            <h3 style={{ fontFamily:"var(--fa)", fontSize:"1.35rem", fontWeight:700, color:"var(--n900)", marginBottom:5 }}>سجّل اهتمامك بالانضمام</h3>
            <p style={{ fontSize:12.5, color:"var(--n400)", marginBottom:26 }}>سنتواصل معك خلال ٢٤ ساعة لتحديد الحلقة والموعد المناسب</p>
            <form onSubmit={handleSubmit}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13, marginBottom:13 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  <label style={{ fontSize:12.5, fontWeight:700, color:"var(--n700)" }}>الاسم الكامل *</label>
                  <input type="text" placeholder="اسمك الكريم" required style={{ padding:"11px 14px", border:"1.5px solid var(--n200)", borderRadius:"var(--r12)", background:"var(--w)", fontFamily:"var(--ff)", fontSize:13.5, color:"var(--n800)", outline:"none", direction:"rtl", width:"100%" }} />
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  <label style={{ fontSize:12.5, fontWeight:700, color:"var(--n700)" }}>رقم الجوال *</label>
                  <input type="tel" placeholder="+966 5X XXX XXXX" required style={{ padding:"11px 14px", border:"1.5px solid var(--n200)", borderRadius:"var(--r12)", background:"var(--w)", fontFamily:"var(--ff)", fontSize:13.5, color:"var(--n800)", outline:"none", direction:"rtl", width:"100%" }} />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13, marginBottom:13 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  <label style={{ fontSize:12.5, fontWeight:700, color:"var(--n700)" }}>الفئة العمرية</label>
                  <select style={{ padding:"11px 14px", border:"1.5px solid var(--n200)", borderRadius:"var(--r12)", background:"var(--w)", fontFamily:"var(--ff)", fontSize:13.5, color:"var(--n800)", outline:"none", direction:"rtl", width:"100%", appearance:"none" }}>
                    <option value="">اختر الفئة</option>
                    <option>طفل (٦–١٢)</option>
                    <option>شاب/شابة (١٣–٢٥)</option>
                    <option>كبار (٢٦+)</option>
                  </select>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  <label style={{ fontSize:12.5, fontWeight:700, color:"var(--n700)" }}>البرنامج المطلوب</label>
                  <select style={{ padding:"11px 14px", border:"1.5px solid var(--n200)", borderRadius:"var(--r12)", background:"var(--w)", fontFamily:"var(--ff)", fontSize:13.5, color:"var(--n800)", outline:"none", direction:"rtl", width:"100%", appearance:"none" }}>
                    <option value="">اختر البرنامج</option>
                    <option>حلقة البراعم</option>
                    <option>حلقة الإتقان</option>
                    <option>حلقة المتقدمين</option>
                    <option>القسم النسائي</option>
                    <option>أونلاين</option>
                  </select>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:13 }}>
                <label style={{ fontSize:12.5, fontWeight:700, color:"var(--n700)" }}>ملاحظات</label>
                <textarea placeholder="أي تفاصيل إضافية عن مستواك أو احتياجاتك..." style={{ padding:"11px 14px", border:"1.5px solid var(--n200)", borderRadius:"var(--r12)", background:"var(--w)", fontFamily:"var(--ff)", fontSize:13.5, color:"var(--n800)", outline:"none", direction:"rtl", width:"100%", resize:"vertical", minHeight:96 }} />
              </div>
              <button type="submit" style={{ width:"100%", padding:13, fontSize:14.5, fontWeight:800, borderRadius:"var(--r12)", border:"none", background: submitted ? "var(--g700)" : "var(--g500)", color:"#fff", fontFamily:"var(--ff)", cursor:"pointer", boxShadow:"var(--sg)", display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {submitted ? "تم الإرسال — سنتواصل معك قريباً ✓" : "إرسال طلب التسجيل"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background:"var(--n900)", color:"rgba(255,255,255,.7)", padding:"60px 0 0", position:"relative" }}>
      <div style={{ maxWidth:1220, margin:"0 auto", padding:"0 20px", position:"relative", zIndex:1 }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:44, paddingBottom:44, borderBottom:"1px solid rgba(255,255,255,.07)" }} className="footer-grid">
          <div>
            <a href="#" style={{ display:"flex", alignItems:"center", gap:11, marginBottom:18 }}>
              <div style={{ width:40, height:40, borderRadius:11, background:"linear-gradient(140deg,var(--g400),var(--g700))", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <BookIcon />
              </div>
              <div>
                <span style={{ display:"block", fontFamily:"var(--fa)", fontSize:15.5, fontWeight:700, color:"#fff" }}>مجمع الإمام البخاري</span>
                <span style={{ display:"block", fontSize:10.5, color:"var(--n400)", fontWeight:500 }}>لتحفيظ القرآن الكريم</span>
              </div>
            </a>
            <p style={{ fontSize:13.5, color:"rgba(255,255,255,.4)", lineHeight:1.85, marginBottom:22, maxWidth:260 }}>منذ عام ١٤٣٢هـ، نخدم كتاب الله بإتقان وإخلاص. الرياض — حي العليا.</p>
            <div style={{ display:"flex", gap:9 }}>
              {["twitter","instagram","whatsapp","youtube"].map((s) => (
                <div key={s} style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,.07)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeLinecap="round">
                    {s==="twitter" && <><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9 9 0 0 1-2.85 1.09A4.5 4.5 0 0 0 16.22 0c-2.5 0-4.5 2-4.5 4.5 0 .36.04.7.11 1.03A12.74 12.74 0 0 1 1.64.89a4.5 4.5 0 0 0 1.39 6 4.44 4.44 0 0 1-2-.55v.06a4.5 4.5 0 0 0 3.6 4.41 4.5 4.5 0 0 1-2 .08 4.5 4.5 0 0 0 4.2 3.12A9.05 9.05 0 0 1 0 19.54a12.74 12.74 0 0 0 6.92 2"/></>}
                    {s==="instagram" && <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>}
                    {s==="whatsapp" && <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>}
                    {s==="youtube" && <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 1.96C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></>}
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {[
            { title:"المجمع", links:[{href:"#about",label:"عن المجمع"},{href:"#teachers",label:"المعلمون"},{href:"#programs",label:"الحلقات"},{href:"#schedule",label:"الجدول"},{href:"#testimonials",label:"آراء الطلاب"}] },
            { title:"البرامج", links:[{href:"#programs",label:"حلقة البراعم"},{href:"#programs",label:"حلقة الإتقان"},{href:"#programs",label:"حلقة المتقدمين"},{href:"#programs",label:"القسم النسائي"},{href:"#programs",label:"أونلاين"}] },
            { title:"التواصل", links:[{href:"#contact",label:"سجّل الآن"},{href:"#contact",label:"تواصل معنا"},{href:"tel:+966501234567",label:"+966 50 123 4567"},{href:"#contact",label:"سياسة الخصوصية"}] },
          ].map((col, i) => (
            <div key={i}>
              <h5 style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,.88)", letterSpacing:.55, textTransform:"uppercase", marginBottom:16 }}>{col.title}</h5>
              {col.links.map((l, li) => (
                <a key={li} href={l.href} style={{ display:"block", fontSize:13, color:"rgba(255,255,255,.42)", marginBottom:10 }}>{l.label}</a>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 0", flexWrap:"wrap", gap:10 }}>
          <span style={{ fontSize:11.5, color:"rgba(255,255,255,.22)" }}>© ١٤٤٧هـ / ٢٠٢٦م — مجمع الإمام البخاري. جميع الحقوق محفوظة.</span>
          <span style={{ fontFamily:"var(--fa)", fontSize:13.5, color:"rgba(255,255,255,.36)" }}>﴿ خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ ﴾</span>
          <span style={{ fontSize:11, color:"rgba(255,255,255,.22)" }}>مُدار بواسطة <a href="#" style={{ color:"var(--g400)" }}>منصة إتقان</a></span>
        </div>
      </div>
    </footer>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
const chatReplies: Record<string, string> = {
  "أريد التسجيل في المجمع": "يسعدنا تسجيلكم! يمكنكم ملء نموذج التسجيل أسفل الصفحة أو التواصل على واتساب +966501234567",
  "ما هي المواعيد المتاحة؟": "لدينا جلسات صباحية ٨–١٢ ومسائية ٥–١٠. راجع الجدول الأسبوعي للتفاصيل الكاملة.",
  "ما رسوم الاشتراك؟": "الدرس الأول مجاني! للاطلاع على الرسوم يرجى التواصل معنا مباشرة على الواتساب.",
  "هل يوجد قسم للأطفال؟": "نعم! حلقة البراعم مخصصة للأطفال من ٦–١٢ سنة بمنهج تربوي ممتع ومميز.",
};
const defReply = "شكراً لتواصلكم! سيتواصل معكم أحد مسؤولي المجمع قريباً. يمكنكم أيضاً الاتصال على +966501234567";

interface Msg { text: string; type: "sent" | "recv"; }

function Chat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ text:"السلام عليكم! أهلاً بكم في مجمع الإمام البخاري. كيف يمكنني مساعدتكم؟", type:"recv" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showOpts, setShowOpts] = useState(true);
  const [notif, setNotif] = useState(true);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [msgs, typing]);

  function sendMsg(text: string) {
    setMsgs(m => [...m, { text, type:"sent" }]);
    setShowOpts(false);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { text: chatReplies[text] || defReply, type:"recv" }]);
    }, 1600);
  }

  function handleSend() {
    if (!input.trim()) return;
    sendMsg(input.trim());
    setInput("");
  }

  function now() {
    const d = new Date();
    return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  }

  return (
    <div style={{ position:"fixed", bottom:26, left:26, zIndex:1100 }}>
      {/* Chat window */}
      <div style={{ position:"absolute", bottom:66, left:0, width:320, background:"var(--w)", borderRadius:"var(--r24)", boxShadow:"0 20px 56px rgba(0,0,0,.16),0 6px 20px rgba(0,0,0,.09)", border:"1px solid var(--n200)", overflow:"hidden",
        transform: open ? "scale(1) translateY(0)" : "scale(.88) translateY(16px)",
        transformOrigin:"bottom left", opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none",
        transition:"all .26s cubic-bezier(.34,1.5,.64,1)" }}>
        {/* Header */}
        <div style={{ padding:"16px 18px", background:"linear-gradient(135deg,var(--g600),var(--g500))", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h4 style={{ fontSize:13.5, fontWeight:800, color:"#fff", marginBottom:1 }}>دعم المجمع</h4>
            <span style={{ fontSize:11, color:"rgba(255,255,255,.68)", display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
              متاحون الآن
            </span>
          </div>
          <button onClick={() => setOpen(false)} style={{ marginRight:"auto", width:26, height:26, borderRadius:"50%", background:"rgba(255,255,255,.15)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={msgsRef} style={{ height:220, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:11, background:"var(--n50)" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ maxWidth:"86%", display:"flex", flexDirection:"column", alignSelf: m.type==="sent" ? "flex-end" : "flex-start" }}>
              <div style={{ padding:"9px 13px", borderRadius: m.type==="sent" ? "13px 13px 3px 13px" : "13px 13px 13px 3px", fontSize:12.5, lineHeight:1.6, color: m.type==="sent" ? "#fff" : "var(--n800)", background: m.type==="sent" ? "var(--g500)" : "var(--w)", border: m.type==="recv" ? "1px solid var(--n200)" : "none" }}>
                {m.text}
              </div>
              <span style={{ fontSize:10, color:"var(--n400)", marginTop:3, padding:"0 3px", textAlign: m.type==="sent" ? "left" : "right" }}>{now()}</span>
            </div>
          ))}
          {typing && (
            <div style={{ maxWidth:"86%", alignSelf:"flex-start" }}>
              <div style={{ background:"var(--w)", border:"1px solid var(--n200)", borderRadius:"13px 13px 13px 3px", padding:"9px 13px", display:"flex", alignItems:"center", gap:4 }}>
                {[0,1,2].map(i => <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:"var(--n300)", display:"inline-block", animation:`td 1.3s ease-in-out ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
        </div>

        {/* Quick options */}
        {showOpts && (
          <div style={{ padding:"11px 14px", borderTop:"1px solid var(--n100)", display:"flex", gap:7, flexWrap:"wrap" }}>
            {["أريد التسجيل في المجمع","ما هي المواعيد المتاحة؟","ما رسوم الاشتراك؟","هل يوجد قسم للأطفال؟"].map((opt, i) => (
              <button key={i} onClick={() => sendMsg(opt)} style={{ padding:"6px 13px", borderRadius:"var(--r999)", border:"1.5px solid var(--g200)", background:"var(--g50)", fontSize:11.5, fontWeight:700, color:"var(--g600)", cursor:"pointer", fontFamily:"var(--ff)" }}>
                {["التسجيل","المواعيد","الرسوم","الأطفال"][i]}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"12px 14px", borderTop:"1px solid var(--n100)" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && handleSend()} type="text" placeholder="اكتب رسالتك..." dir="rtl" style={{ flex:1, padding:"9px 13px", border:"1.5px solid var(--n200)", borderRadius:"var(--r12)", fontFamily:"var(--ff)", fontSize:12.5, color:"var(--n800)", outline:"none" }} />
          <button onClick={handleSend} style={{ width:34, height:34, borderRadius:"50%", background:"var(--g500)", display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer" }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

      {/* FAB button */}
      <button onClick={() => { setOpen(!open); setNotif(false); }} style={{ width:54, height:54, borderRadius:"50%", background:"var(--g500)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(23,138,84,.42),0 2px 8px rgba(0,0,0,.14)", border:"none", cursor:"pointer", position:"relative" }}>
        {notif && <span style={{ position:"absolute", top:-3, left:-3, width:17, height:17, borderRadius:"50%", background:"#ef4444", color:"#fff", fontSize:9.5, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid var(--w)", animation:"blink2 .9s ease-in-out infinite alternate" }}>١</span>}
        {open
          ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>
    </div>
  );
}

// ─── RESPONSIVE STYLES ────────────────────────────────────────────────────────
const responsiveCss = `
  .hide-mobile { display: flex; }
  .show-mobile-flex { display: none; }
  .hero-card-side { display: block; }

  @media (max-width: 900px) {
    .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; padding: 52px 0 !important; }
    .hero-card-side { display: none; }
    .about-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
    .contact-grid { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
    .programs-grid { grid-template-columns: repeat(2,1fr) !important; }
    .teachers-grid { grid-template-columns: repeat(2,1fr) !important; }
  }
  @media (max-width: 768px) {
    :root { --nav: 60px; }
    .hide-mobile { display: none !important; }
    .show-mobile-flex { display: flex !important; }
    .testi-grid { grid-template-columns: 1fr !important; }
    .programs-grid { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .teachers-grid { grid-template-columns: 1fr !important; }
  }
`;

// ─── الصفحة الكاملة ───────────────────────────────────────────────────────────
export default function QuranComplexPage() {
  return (
    <>
      <style>{css + responsiveCss}</style>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <About />
        <Programs />
        <Teachers />
        <Schedule />
        <Testimonials />
        <CTASection />
        <Contact />
      </main>
      <Footer />
      <Chat />
    </>
  );
}

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  كيفية الاستخدام:                                           ║
  ║                                                              ║
  ║  // استدعاء الصفحة كاملة                                    ║
  ║  import QuranComplexPage from "./QuranComplexPage";          ║
  ║  <QuranComplexPage />                                        ║
  ║                                                              ║
  ║  // استدعاء أي قسم بشكل منفصل                              ║
  ║  import { Hero, About, Programs, Teachers,                  ║
  ║           Schedule, Testimonials, Contact,                   ║
  ║           Footer, Chat } from "./QuranComplexPage";          ║
  ╚══════════════════════════════════════════════════════════════╝
*/

export { Hero, TrustBar, About, Programs, Teachers, Schedule, Testimonials, CTASection, Contact, Footer, Chat };
