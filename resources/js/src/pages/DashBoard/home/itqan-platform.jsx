import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────── */
const globalStyle = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap');

:root {
  --g50:#f0faf5;--g100:#d6f0e3;--g200:#a8dfc5;--g300:#6cc49f;
  --g400:#38a879;--g500:#1e8f61;--g600:#15724e;--g700:#0f5439;--g800:#0a3a28;
  --br50:#fdf8f3;--br100:#f5e8d5;--br200:#e8cba8;--br300:#c9996a;--br400:#a8733f;--br500:#8a5a2d;
  --n0:#fff;--n50:#f8fafc;--n100:#f1f5f9;--n200:#e2e8f0;--n300:#cbd5e1;
  --n400:#94a3b8;--n500:#64748b;--n600:#475569;--n700:#334155;--n800:#1e293b;--n900:#0f172a;
  --radius-s:6px;--radius-m:12px;--radius-l:20px;--radius-xl:28px;
  --shadow-s:0 1px 4px rgba(0,0,0,.06);--shadow-m:0 4px 20px rgba(0,0,0,.08);
  --shadow-l:0 12px 48px rgba(0,0,0,.10);--shadow-xl:0 24px 64px rgba(0,0,0,.12);
  --nav-h:72px;--max-w:1280px;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;font-size:16px;}
body{font-family:'Tajawal',sans-serif;background:#fff;color:var(--n800);overflow-x:hidden;direction:rtl;-webkit-font-smoothing:antialiased;}
a{text-decoration:none;color:inherit;}
button{font-family:'Tajawal',sans-serif;cursor:pointer;border:none;outline:none;}
ul{list-style:none;}
img{max-width:100%;display:block;}

/* Scroll reveal */
.reveal{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease;}
.reveal.in{opacity:1;transform:none;}
.reveal-left{opacity:0;transform:translateX(32px);transition:opacity .65s ease,transform .65s ease;}
.reveal-left.in{opacity:1;transform:none;}
.reveal-right{opacity:0;transform:translateX(-32px);transition:opacity .65s ease,transform .65s ease;}
.reveal-right.in{opacity:1;transform:none;}

/* Pulse dot */
@keyframes pulse{0%,100%{box-shadow:0 0 0 3px var(--g100);}50%{box-shadow:0 0 0 6px rgba(56,168,121,.1);}}
@keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-9px);}}
@keyframes marqueeRtl{from{transform:translateX(0);}to{transform:translateX(-50%);}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}

/* Mobile menu */
.mobile-menu{
  position:fixed;top:var(--nav-h);right:0;left:0;z-index:800;
  background:#fff;border-bottom:1px solid var(--n200);
  padding:20px 24px;display:flex;flex-direction:column;gap:8px;
  box-shadow:var(--shadow-l);
  animation:fadeInUp .2s ease;
}
.mobile-menu a,.mobile-menu button{
  padding:12px 16px;border-radius:var(--radius-m);font-size:15px;font-weight:600;
  color:var(--n700);background:none;border:none;text-align:right;cursor:pointer;
  transition:.15s;
}
.mobile-menu a:hover{background:var(--g50);color:var(--g600);}
.mobile-menu .mm-cta{background:var(--g500);color:#fff;text-align:center;border-radius:var(--radius-m);}
.mobile-menu .mm-cta:hover{background:var(--g600);}
`;

/* ─────────────────────────────────────────
   HOOK: scroll reveal
───────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal,.reveal-left,.reveal-right");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ─────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────── */
const Pill = ({ children }) => (
  <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"var(--g50)",border:"1px solid var(--g200)",color:"var(--g600)",padding:"5px 14px",borderRadius:100,fontSize:12,fontWeight:700 }}>
    <span style={{ width:16,height:2,background:"var(--g400)",borderRadius:2,display:"block" }} />
    {children}
  </div>
);

const SectionHead = ({ label, title, desc }) => (
  <div className="reveal" style={{ textAlign:"center",marginBottom:"clamp(40px,5vw,64px)" }}>
    <div style={{ marginBottom:16 }}><Pill>{label}</Pill></div>
    <h2 style={{ fontFamily:"Tajawal,sans-serif",fontSize:"clamp(1.7rem,3.2vw,2.8rem)",fontWeight:900,color:"var(--n900)",lineHeight:1.2,marginBottom:14 }} dangerouslySetInnerHTML={{ __html: title }} />
    <p style={{ fontSize:16,color:"var(--n500)",lineHeight:1.9,maxWidth:580,margin:"0 auto" }}>{desc}</p>
  </div>
);

const Container = ({ children, style = {} }) => (
  <div style={{ maxWidth:"var(--max-w)",margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",...style }}>{children}</div>
);

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { href: "#features", label: "المميزات" },
    { href: "#circles", label: "الحلقات" },
    { href: "#how-it-works", label: "آلية العمل" },
    { href: "#faq", label: "الأسئلة الشائعة" },
    { href: "#contact", label: "تواصل معنا" },
  ];

  const nav = {
    position:"fixed",top:0,right:0,left:0,zIndex:900,
    height:"var(--nav-h)",
    background:"rgba(255,255,255,.92)",
    backdropFilter:"blur(24px) saturate(180%)",
    borderBottom:"1px solid rgba(0,0,0,.06)",
    transition:"box-shadow .3s",
    boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,.08)" : "none",
  };

  return (
    <>
      <header style={nav}>
        <Container>
          <div style={{ height:"var(--nav-h)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:24 }}>
            {/* Logo */}
            <a href="#" style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:"linear-gradient(145deg,var(--g400),var(--g700))",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(30,143,97,.28)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff"><path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/></svg>
              </div>
              <span style={{ fontFamily:"Tajawal,sans-serif",fontSize:22,fontWeight:900,color:"var(--n900)" }}>إتقان<span style={{ color:"var(--g500)" }}>.</span></span>
            </a>

            {/* Desktop links */}
            <nav style={{ display:"flex",alignItems:"center",gap:2, "@media(max-width:768px)":{display:"none"} }} className="desktop-nav">
              {links.map(l => (
                <a key={l.href} href={l.href} style={{ padding:"7px 15px",borderRadius:"var(--radius-s)",fontSize:14,fontWeight:600,color:"var(--n600)",transition:"all .18s" }}
                  onMouseEnter={e => { e.target.style.background="var(--g50)";e.target.style.color="var(--g600)"; }}
                  onMouseLeave={e => { e.target.style.background="";e.target.style.color="var(--n600)"; }}
                >{l.label}</a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div style={{ display:"flex",alignItems:"center",gap:10 }} className="desktop-cta">
              <button style={{ padding:"9px 20px",fontSize:13,fontWeight:700,background:"transparent",color:"var(--n600)",borderRadius:"var(--radius-m)",transition:".2s" }}
                onMouseEnter={e => { e.currentTarget.style.background="var(--n100)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
              >تسجيل الدخول</button>
              <a href="#contact" style={{ padding:"9px 20px",fontSize:13,fontWeight:700,background:"var(--g500)",color:"#fff",borderRadius:"var(--radius-m)",boxShadow:"0 4px 18px rgba(30,143,97,.30)",transition:"all .22s",display:"inline-flex",alignItems:"center" }}
                onMouseEnter={e => { e.currentTarget.style.background="var(--g600)";e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="var(--g500)";e.currentTarget.style.transform=""; }}
              >سجّل مجمعك الآن</a>
            </div>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ background:"none",border:"none",cursor:"pointer",padding:4,display:"none",flexDirection:"column",gap:5 }}
              className="hamburger-btn"
              aria-label="القائمة"
            >
              {[0,1,2].map(i => (
                <span key={i} style={{ display:"block",width:22,height:2,background:"var(--n600)",borderRadius:2,transition:".3s",
                  transform: menuOpen ? (i===0?"rotate(45deg) translate(5px,5px)":i===2?"rotate(-45deg) translate(5px,-5px)":"") : "",
                  opacity: menuOpen && i===1 ? 0 : 1
                }} />
              ))}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map(l => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>)}
          <a href="#contact" className="mm-cta" onClick={() => setMenuOpen(false)}>سجّل مجمعك الآن</a>
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .desktop-nav,.desktop-cta{display:none!important;}
          .hamburger-btn{display:flex!important;}
        }
        @media(min-width:769px){
          .hamburger-btn{display:none!important;}
        }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ position:"relative",overflow:"hidden",paddingTop:"calc(var(--nav-h) + clamp(60px,8vw,100px))",paddingBottom:"clamp(60px,8vw,100px)",background:"var(--n0)",minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center" }}>
      {/* BG */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden" }} aria-hidden="true">
        <div style={{ position:"absolute",width:"clamp(300px,55vw,700px)",height:"clamp(300px,55vw,700px)",top:"-15%",left:"-10%",borderRadius:"50%",background:"radial-gradient(circle,var(--g100) 0%,transparent 70%)",opacity:.7 }} />
        <div style={{ position:"absolute",width:"clamp(200px,40vw,500px)",height:"clamp(200px,40vw,500px)",bottom:"-10%",right:"-5%",borderRadius:"50%",background:"radial-gradient(circle,var(--br100) 0%,transparent 70%)",opacity:.5 }} />
        <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(30,143,97,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(30,143,97,.04) 1px,transparent 1px)",backgroundSize:"52px 52px" }} />
      </div>

      <Container>
        <div style={{ display:"grid",gridTemplateColumns:"1fr clamp(280px,38vw,480px)",gap:"clamp(40px,6vw,80px)",alignItems:"center",position:"relative",zIndex:1 }} className="hero-grid">
          {/* Text */}
          <div>
            <div style={{ marginBottom:24 }}>
              <div style={{ display:"inline-flex",alignItems:"center",gap:10,background:"var(--g50)",border:"1px solid var(--g200)",padding:"6px 16px",borderRadius:100,fontSize:12,fontWeight:700,color:"var(--g700)" }}>
                <span style={{ width:7,height:7,borderRadius:"50%",background:"var(--g400)",animation:"pulse 2.5s ease infinite" }} />
                الخيار المثالي للحلقات والدور النسائية
              </div>
            </div>
            <h1 style={{ fontFamily:"Tajawal,sans-serif",fontSize:"clamp(2.2rem,4.2vw,3.8rem)",fontWeight:900,lineHeight:1.15,color:"var(--n900)",marginBottom:24,letterSpacing:"-.5px" }}>
              نظام{" "}
              <span style={{ background:"linear-gradient(135deg,var(--g500),var(--g700))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>إتقان</span>
              <br />لخدمة الجهات<br />
              <span style={{ background:"linear-gradient(135deg,var(--br300),var(--br500))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>القرآنية</span>
            </h1>
            <p style={{ fontSize:"clamp(15px,1.5vw,17px)",color:"var(--n500)",lineHeight:1.9,marginBottom:36,maxWidth:540 }}>
              منصة إتقان تُعنى بتقديم حلول رقمية مبتكرة لإدارة شؤون الحلقات القرآنية والدور النسائية — من تسجيل الطلاب وتدوين إنجازاتهم إلى التقارير الدقيقة لولي الأمر والمشرف في مكان واحد.
            </p>
            <div style={{ display:"flex",gap:14,flexWrap:"wrap",marginBottom:52 }}>
              <a href="#contact" style={{ padding:"16px 36px",fontSize:"clamp(14px,1.5vw,16px)",fontWeight:700,background:"var(--g500)",color:"#fff",borderRadius:"var(--radius-l)",boxShadow:"0 4px 18px rgba(30,143,97,.30)",transition:"all .22s",display:"inline-flex",alignItems:"center",gap:8 }}
                onMouseEnter={e => { e.currentTarget.style.background="var(--g600)";e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="var(--g500)";e.currentTarget.style.transform=""; }}
              >أنشئ مجمعك الآن</a>
              <a href="#features" style={{ padding:"16px 36px",fontSize:"clamp(14px,1.5vw,16px)",fontWeight:700,background:"var(--n0)",color:"var(--n700)",border:"1.5px solid var(--n200)",borderRadius:"var(--radius-l)",boxShadow:"var(--shadow-s)",transition:"all .22s",display:"inline-flex",alignItems:"center" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="var(--g300)";e.currentTarget.style.color="var(--g600)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="var(--n200)";e.currentTarget.style.color="var(--n700)"; }}
              >استكشف المميزات</a>
            </div>
            {/* Stats */}
            <div style={{ display:"flex",alignItems:"center",gap:"clamp(16px,3vw,32px)",flexWrap:"wrap" }}>
              {[["15,623+","طالب مسجَّل"],["847+","مسجد وحلقة"],["97%","رضا الجهات المستفيدة"]].map(([num, label], i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:"clamp(16px,3vw,32px)" }}>
                  {i > 0 && <div style={{ width:1,height:36,background:"var(--n200)" }} />}
                  <div>
                    <div style={{ fontFamily:"Tajawal,sans-serif",fontSize:"clamp(18px,2.5vw,24px)",fontWeight:900,color:"var(--n900)",lineHeight:1 }}>{num}</div>
                    <div style={{ fontSize:12,color:"var(--n400)",fontWeight:500 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Card */}
          <div style={{ position:"relative" }} className="hero-visual">
            <div style={{ animation:"floatY 4s ease-in-out infinite",position:"absolute",top:-24,left:-52,background:"var(--n0)",border:"1px solid var(--n200)",borderRadius:"var(--radius-l)",padding:"12px 16px",boxShadow:"var(--shadow-l)",display:"flex",alignItems:"center",gap:10,whiteSpace:"nowrap",zIndex:2 }}>
              <div style={{ width:36,height:36,borderRadius:9,background:"var(--g100)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--g600)" strokeWidth={2}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div><strong style={{ display:"block",fontSize:13,fontWeight:800,color:"var(--n800)" }}>سارة أحمد</strong><span style={{ fontSize:10,color:"var(--n400)" }}>أتمّت الجزء الثالث</span></div>
            </div>

            <div style={{ background:"var(--n0)",borderRadius:"var(--radius-xl)",border:"1px solid var(--n200)",boxShadow:"var(--shadow-xl)",overflow:"hidden" }}>
              <div style={{ background:"linear-gradient(135deg,var(--g600),var(--g800))",padding:"20px 24px",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:36,height:36,background:"rgba(255,255,255,.15)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="#fff"><path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9z"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:800,color:"#fff" }}>حلقة الإمام البخاري</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.6)" }}>لوحة الإشراف</div>
                </div>
                <div style={{ background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",padding:"4px 12px",borderRadius:100,fontSize:11,fontWeight:700 }}>مباشر</div>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18 }}>
                  {[["247","طالب"],["12","معلّم"],["189","حافظ"]].map(([n,l]) => (
                    <div key={l} style={{ background:"var(--g50)",border:"1px solid var(--g100)",borderRadius:"var(--radius-m)",padding:"14px 10px",textAlign:"center" }}>
                      <div style={{ fontFamily:"Tajawal,sans-serif",fontSize:20,fontWeight:900,color:"var(--g600)" }}>{n}</div>
                      <div style={{ fontSize:10,color:"var(--n400)",marginTop:2 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:11,fontWeight:700,color:"var(--n400)",textTransform:"uppercase",letterSpacing:.5,marginBottom:10 }}>جلسات اليوم</div>
                {[
                  { name:"المجموعة الأولى — تحفيظ",time:"08:00",chip:"جارية",dotColor:"var(--g400)",chipStyle:{background:"rgba(30,143,97,.12)",color:"var(--g600)"} },
                  { name:"المجموعة الثانية — مراجعة",time:"10:30",chip:"قادمة",dotColor:"var(--br300)",chipStyle:{background:"rgba(168,115,63,.12)",color:"var(--br400)"} },
                  { name:"الدور النسائي — عصراً",time:"16:00",chip:"مجدولة",dotColor:"var(--n300)",chipStyle:{background:"var(--n100)",color:"var(--n500)"} },
                ].map((s,i) => (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:"var(--radius-m)",border:"1px solid var(--n100)",background:"var(--n50)",marginBottom:8,transition:".2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor="var(--g200)";e.currentTarget.style.background="var(--g50)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="var(--n100)";e.currentTarget.style.background="var(--n50)"; }}
                  >
                    <span style={{ width:8,height:8,borderRadius:"50%",background:s.dotColor,flexShrink:0 }} />
                    <span style={{ fontSize:12,fontWeight:700,color:"var(--n700)",flex:1 }}>{s.name}</span>
                    <span style={{ fontSize:11,color:"var(--n400)" }}>{s.time}</span>
                    <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,...s.chipStyle }}>{s.chip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ animation:"floatY 4s ease-in-out -2.2s infinite",position:"absolute",bottom:40,left:-56,background:"var(--n0)",border:"1px solid var(--n200)",borderRadius:"var(--radius-l)",padding:"12px 16px",boxShadow:"var(--shadow-l)",display:"flex",alignItems:"center",gap:10,whiteSpace:"nowrap",zIndex:2 }}>
              <div style={{ width:36,height:36,borderRadius:9,background:"var(--g100)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--g600)" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <div><strong style={{ display:"block",fontSize:13,fontWeight:800,color:"var(--n800)" }}>نسبة الحضور</strong><span style={{ fontSize:10,color:"var(--n400)" }}>ارتفعت 94% هذا الأسبوع</span></div>
            </div>
          </div>
        </div>
      </Container>

      <style>{`
        @media(max-width:900px){ .hero-grid{ grid-template-columns:1fr!important; } .hero-visual{display:none!important;} }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   MARQUEE
───────────────────────────────────────── */
function MarqueeBand() {
  const items = [
    "حضور ذكي بالبصمة وQR","تقارير PDF و Excel تلقائية","إدارة مجمعات متعددة",
    "غرف تسميع ذكية","مساعد ذكاء اصطناعي","بوابة أولياء الأمور",
  ];
  return (
    <div style={{ background:"var(--g700)",padding:"16px 0",overflow:"hidden",borderTop:"1px solid var(--g600)",borderBottom:"1px solid var(--g800)" }}>
      <div style={{ display:"flex",gap:48,animation:"marqueeRtl 30s linear infinite",width:"max-content" }}>
        {[...items,...items].map((item,i) => (
          <span key={i} style={{ display:"flex",alignItems:"center",gap:10,fontSize:13,fontWeight:700,color:"rgba(255,255,255,.8)",whiteSpace:"nowrap" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--g400)" }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PROBLEM / SOLUTION
───────────────────────────────────────── */
function ProblemSolution() {
  const pains = [
    { title:"ضياع بيانات الطلاب", desc:"السجلات الورقية عرضة للضياع والتلف مما يفقد تاريخ الطالب الكامل." },
    { title:"صعوبة متابعة ولي الأمر", desc:"لا توجد وسيلة واضحة لتوصيل تقدم الطالب لوليّ أمره بصفة منتظمة." },
    { title:"تعقيد الرواتب والمصروفات", desc:"حساب رواتب المعلمين ومصروفات المجمع يدوياً مرهق ومعرَّض للأخطاء." },
  ];
  const solutions = [
    { title:"بيانات محمية ومنظّمة", desc:"سجلات رقمية آمنة لكل طالب يمكن الوصول إليها في أي وقت من أي جهاز." },
    { title:"تقارير فورية", desc:"تقارير الحضور والحفظ تُولَّد تلقائياً يومياً وأسبوعياً وشهرياً." },
    { title:"بوابة الأولياء", desc:"رابط خاص لكل طالب بدون كلمة مرور لمتابعة الإنجاز اليومي." },
    { title:"رواتب تلقائية", desc:"حساب وصرف الرواتب للمعلمين والموظفين دون أي حسابات يدوية." },
  ];
  return (
    <section style={{ padding:"clamp(60px,8vw,100px) 0",background:"var(--n900)",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)",backgroundSize:"60px 60px" }} />
      <Container>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(40px,6vw,80px)",alignItems:"center" }} className="problem-grid">
          <div className="reveal-right">
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"var(--g300)",padding:"5px 14px",borderRadius:100,fontSize:12,fontWeight:700,marginBottom:20 }}>
              التحدي الذي تواجهه مجمعاتنا
            </div>
            <h2 style={{ fontFamily:"Tajawal,sans-serif",fontSize:"clamp(1.6rem,2.8vw,2.5rem)",fontWeight:900,color:"#fff",lineHeight:1.25,marginBottom:20 }}>
              إدارة الحلقات بالطريقة التقليدية <span style={{ color:"var(--g300)" }}>تُكلّفك الكثير</span>
            </h2>
            <p style={{ fontSize:15,color:"rgba(255,255,255,.5)",lineHeight:1.9,marginBottom:36 }}>كثير من مجمعات التحفيظ لا تزال تعتمد على السجلات الورقية وجداول يدوية تستنزف وقت المشرفين وتُضيّع بيانات الطلاب.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {pains.map((p,i) => (
                <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:14,padding:"16px 20px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"var(--radius-m)",transition:".2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.07)";e.currentTarget.style.borderColor="rgba(30,143,97,.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.borderColor="rgba(255,255,255,.07)"; }}
                >
                  <div style={{ width:40,height:40,borderRadius:9,background:"rgba(30,143,97,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={15} y1={9} x2={9} y2={15}/><line x1={9} y1={9} x2={15} y2={15}/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:700,color:"#fff",marginBottom:4 }}>{p.title}</div>
                    <div style={{ fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.7 }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-left">
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"var(--g300)",padding:"5px 14px",borderRadius:100,fontSize:12,fontWeight:700,marginBottom:20 }}>الحل مع إتقان</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              {solutions.map((s,i) => (
                <div key={i} style={{ background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"var(--radius-l)",padding:24,transition:".25s",gridColumn:i===0?"span 2":"auto" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(30,143,97,.08)";e.currentTarget.style.borderColor="rgba(30,143,97,.25)";e.currentTarget.style.transform="translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.borderColor="rgba(255,255,255,.08)";e.currentTarget.style.transform=""; }}
                >
                  <div style={{ width:44,height:44,borderRadius:10,background:"rgba(30,143,97,.15)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14 }}>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--g300)" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div style={{ fontSize:14,fontWeight:800,color:"#fff",marginBottom:6 }}>{s.title}</div>
                  <div style={{ fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.7 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
      <style>{`@media(max-width:768px){.problem-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   FEATURES GRID
───────────────────────────────────────── */
function Features() {
  const cards = [
    { title:"حضور ذكي بالبصمة والرمز", desc:"تتبّع حضور الطلاب والمعلمين باستخدام بصمة الأصابع أو رمز QR مع إرسال تنبيهات فورية لولي الأمر عند الغياب.", list:["تنبيهات غياب فورية","تقارير حضور أسبوعية وشهرية","يعمل بدون إنترنت (PWA)"], color:"green", span:false },
    { title:"غرف التسميع الذكية", desc:"غرف تسميع مخصصة لكل معلم وطالب مع تسجيل الشاشة وتسجيل الجلسات، وإمكانية مراجعة السماع لاحقاً.", color:"green", span:false },
    { title:"مساعد الذكاء الاصطناعي", desc:"مساعد ذكي يساعد المعلم في بناء الخطط التعليمية ويقترح أساليب تدريس مخصصة لكل طالب.", color:"brown", span:false },
    { title:"تقارير PDF و Excel شاملة", desc:"تقارير مفصّلة لكل مجمع وطالب — إحصائيات الحفظ والغياب والتقدم — قابلة للتنزيل والطباعة في أي وقت.", color:"green", span:false },
    { title:"إدارة المصروفات والرواتب", desc:"متابعة شاملة لمصروفات المجمع وعملية صرف الرواتب الشهرية لكل معلم وموظف تلقائياً.", color:"green", span:false },
    { title:"نظام التحفيز والجوائز", desc:"جوائز وشهادات تُمنح تلقائياً للمتفوقين مع إضافة مكافآت مباشرة من المنصة وصفحة إنجاز خاصة.", color:"brown", span:false },
    { title:"التقويم الدراسي الفوري", desc:"بمجرد تحديد بداية ونهاية الدورة الدراسية وأيام العمل، يخرج تقويم دراسي كامل فوراً.", color:"green", span:false },
    { title:"الخطة التعليمية للطالب", desc:"بناء خطة مخصصة لكل طالب بسهولة — حدّد الهدف اليومي للحفظ بالأسطر وللمراجعة بالأوجه.", color:"green", span:false },
    { title:"متوافق مع جميع الأجهزة", desc:"إمكانية استعراض بوابة المعلم والطالب من جميع أنواع الشاشات — كمبيوتر، لوحي، وجوال.", color:"brown", span:false },
  ];
  return (
    <section id="features" style={{ padding:"clamp(60px,8vw,100px) 0",background:"var(--n0)" }}>
      <Container>
        <SectionHead label="مميزات المنصة" title='كل ما يحتاجه <span style="color:var(--g500)">مجمعك القرآني</span>' desc="أدوات متكاملة صُمِّمت بفهم عميق لاحتياجات الحلقات القرآنية والدور النسائية." />
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24 }} className="features-grid">
          {cards.map((c,i) => (
            <article key={i} className="reveal feat-card" style={{ padding:32,borderRadius:"var(--radius-l)",border:"1px solid var(--n200)",background:i===0?"linear-gradient(160deg,var(--g50) 0%,var(--n0) 100%)":"var(--n0)",transition:".25s",position:"relative",overflow:"hidden" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow="var(--shadow-l)";e.currentTarget.style.borderColor="var(--g200)";e.currentTarget.style.transform="translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor="var(--n200)";e.currentTarget.style.transform=""; }}
            >
              <div style={{ marginBottom:22 }}>
                <div style={{ width:52,height:52,borderRadius:"var(--radius-m)",background:c.color==="green"?"var(--g100)":"var(--br100)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c.color==="green"?"var(--g600)":"var(--br400)"} strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
              </div>
              <h3 style={{ fontSize:17,fontWeight:800,color:"var(--n900)",marginBottom:10 }}>{c.title}</h3>
              <p style={{ fontSize:14,color:"var(--n500)",lineHeight:1.85 }}>{c.desc}</p>
              {c.list && (
                <ul style={{ marginTop:16,display:"flex",flexDirection:"column",gap:8 }}>
                  {c.list.map((l,j) => (
                    <li key={j} style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--n600)" }}>
                      <div style={{ width:18,height:18,borderRadius:"50%",background:"var(--g100)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="var(--g600)" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      {l}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </Container>
      <style>{`
        @media(max-width:900px){ .features-grid{grid-template-columns:repeat(2,1fr)!important;} }
        @media(max-width:560px){ .features-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   SHOWCASE: REPORTS
───────────────────────────────────────── */
function ShowcaseReports() {
  return (
    <section id="reports" style={{ padding:"clamp(60px,8vw,100px) 0",background:"var(--g50)" }}>
      <Container>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(40px,6vw,80px)",alignItems:"center" }} className="showcase-grid">
          <div className="reveal-right">
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"var(--g100)",border:"1px solid var(--g200)",color:"var(--g700)",padding:"5px 14px",borderRadius:100,fontSize:12,fontWeight:700,marginBottom:20 }}>نظام التقارير الذكية</div>
            <h2 style={{ fontFamily:"Tajawal,sans-serif",fontSize:"clamp(1.6rem,2.8vw,2.5rem)",fontWeight:900,color:"var(--n900)",lineHeight:1.25,marginBottom:16 }}>
              تقارير تُنجز<br /><span style={{ color:"var(--g500)" }}>ما كان يستغرق ساعات</span><br />في ثوانٍ
            </h2>
            <p style={{ fontSize:15,color:"var(--n500)",lineHeight:1.9,marginBottom:28 }}>حساب تلقائي للرواتب والحضور وإنجازات الحلقات كلها في شاشة واحدة. شاهد تقاريرك في أي وقت أو حمّلها بصيغة PDF و Excel.</p>
            {[
              { title:"تقارير الطالب الفردية", desc:"تقرير مفصّل لكل طالب يشمل المحفوظات، الغياب، المراجعات، والتقدم الشهري." },
              { title:"تقارير المعلمين والهيئة", desc:"أداء كل معلم، ساعات العمل، الرواتب المستحقة، والمكافآت المضافة." },
              { title:"تقرير المجمع الكامل", desc:"نظرة شاملة على المجمع بأكمله: الحلقات، المصروفات، معدلات الحفظ." },
            ].map((f,i) => (
              <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:14,padding:"14px 18px",background:"var(--n0)",border:"1px solid var(--n200)",borderRadius:"var(--radius-m)",marginBottom:14,transition:".2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="var(--g300)";e.currentTarget.style.boxShadow="var(--shadow-s)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="var(--n200)";e.currentTarget.style.boxShadow=""; }}
              >
                <div style={{ width:38,height:38,borderRadius:9,background:"var(--g100)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--g600)" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:"var(--n800)",marginBottom:3 }}>{f.title}</div>
                  <div style={{ fontSize:13,color:"var(--n500)",lineHeight:1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
            <a href="#contact" style={{ padding:"13px 28px",fontSize:14,fontWeight:700,background:"var(--g500)",color:"#fff",borderRadius:"var(--radius-m)",boxShadow:"0 4px 18px rgba(30,143,97,.30)",transition:"all .22s",display:"inline-flex",alignItems:"center" }}
              onMouseEnter={e => { e.currentTarget.style.background="var(--g600)";e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="var(--g500)";e.currentTarget.style.transform=""; }}
            >سجّل مجمعك وجرّب التقارير</a>
          </div>

          <div className="reveal-left">
            <div style={{ background:"var(--n0)",borderRadius:"var(--radius-xl)",border:"1px solid var(--n200)",boxShadow:"var(--shadow-xl)",overflow:"hidden" }}>
              <div style={{ background:"linear-gradient(135deg,var(--n800),var(--n900))",padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <span style={{ fontSize:14,fontWeight:700,color:"#fff" }}>تقرير الحلقة — مارس 2025</span>
                <div style={{ display:"flex",gap:6 }}>
                  {["#ef4444","#f59e0b","#22c55e"].map(c => <span key={c} style={{ width:10,height:10,borderRadius:"50%",background:c }} />)}
                </div>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20 }}>
                  {[["94%","معدل الحضور","var(--g50)","var(--g100)","var(--g600)"],["23","أجزاء محفوظة","var(--br50)","var(--br100)","var(--br400)"],["7","حفّاظ جدد","var(--g50)","var(--g100)","var(--g600)"]].map(([n,l,bg,border,color]) => (
                    <div key={l} style={{ background:bg,border:`1px solid ${border}`,borderRadius:"var(--radius-m)",padding:14,textAlign:"center" }}>
                      <div style={{ fontFamily:"Tajawal,sans-serif",fontSize:22,fontWeight:900,color }}>{n}</div>
                      <div style={{ fontSize:10,color:"var(--n400)",marginTop:2 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:11,fontWeight:700,color:"var(--n400)",textTransform:"uppercase",letterSpacing:.5,marginBottom:12 }}>أعلى الطلاب تقدماً</div>
                {[
                  { name:"سارة أحمد",detail:"الجزء 18 · البقرة",pct:87,grad:"linear-gradient(135deg,var(--g400),var(--g700))",letter:"س" },
                  { name:"عبدالرحمن خالد",detail:"الجزء 15 · آل عمران",pct:74,grad:"linear-gradient(135deg,var(--br300),var(--br500))",letter:"ع" },
                  { name:"نور الهدى",detail:"الجزء 12 · النساء",pct:61,grad:"linear-gradient(135deg,var(--g300),var(--g600))",letter:"ن" },
                ].map((r,i) => (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:"var(--radius-m)",border:"1px solid var(--n100)",marginBottom:8,transition:".2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor="var(--g200)";e.currentTarget.style.background="var(--g50)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="var(--n100)";e.currentTarget.style.background=""; }}
                  >
                    <div style={{ width:36,height:36,borderRadius:"50%",background:r.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0 }}>{r.letter}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:700,color:"var(--n800)" }}>{r.name}</div>
                      <div style={{ fontSize:11,color:"var(--n400)",marginTop:2 }}>{r.detail}</div>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ width:80,height:5,background:"var(--n100)",borderRadius:100,overflow:"hidden" }}>
                        <div style={{ width:`${r.pct}%`,height:"100%",borderRadius:100,background:"linear-gradient(90deg,var(--g300),var(--g500))" }} />
                      </div>
                      <span style={{ fontSize:11,fontWeight:700,color:"var(--n600)" }}>{r.pct}%</span>
                    </div>
                  </div>
                ))}
                <div style={{ display:"flex",gap:10,marginTop:16 }}>
                  {[["تنزيل PDF","var(--g500)","#fff"],["تنزيل Excel","var(--n0)","var(--n700)"]].map(([label,bg,color]) => (
                    <button key={label} style={{ flex:1,padding:"9px 0",fontSize:13,fontWeight:700,background:bg,color,border:bg==="var(--n0)"?"1.5px solid var(--n200)":"none",borderRadius:"var(--radius-m)",cursor:"pointer",transition:".2s" }}
                      onMouseEnter={e => { e.currentTarget.style.opacity=".85"; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity="1"; }}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <style>{`@media(max-width:768px){.showcase-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   CIRCLES
───────────────────────────────────────── */
function Circles() {
  const circles = [
    { name:"حلقة الإمام البخاري", desc:"حلقة تحفيظ متميزة للقرآن الكريم مع أفضل المدرسين وأحدث المناهج", stats:[["247","طالب"],["12","معلّم"],["189","حافظ"],["7","قراءات"]] },
    { name:"دار تحفيظ نور الهدى", desc:"دار نسائية متخصصة في تحفيظ القرآن الكريم بأسلوب تعليمي حديث", stats:[["183","طالبة"],["9","معلمة"],["142","حافظة"],["5","قراءات"]] },
    { name:"مجمع الفرقان القرآني", desc:"مجمع شامل للتحفيظ وعلوم القرآن للأطفال والكبار في بيئة مثالية", stats:[["312","طالب"],["16","معلّم"],["231","حافظ"],["8","قراءات"]] },
    { name:"حلقات منصة إتقان المتقدمة", desc:"حلقات إلكترونية عبر الإنترنت مع نخبة من المعلمين المتخصصين في التجويد", stats:[["524","طالب"],["22","معلّم"],["388","حافظ"],["10","قراءات"]] },
  ];
  return (
    <section id="circles" style={{ padding:"clamp(60px,8vw,100px) 0",background:"var(--n0)" }}>
      <Container>
        <SectionHead label="جميع حلقات التحفيظ" title='حلقات تحفيظ القرآن<br><span style="color:var(--g500)">المُدارة بإتقان</span>' desc="أنشئ مجمعك وأضف حلقاتك بنقرة واحدة. كل حلقة لها لوحة تحكم مستقلة مع إمكانية الإشراف الكامل من مكان واحد." />
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:24 }} className="circles-grid">
          {circles.map((c,i) => (
            <article key={i} className="reveal" style={{ background:"var(--n0)",border:"1px solid var(--n200)",borderRadius:"var(--radius-xl)",overflow:"hidden",transition:".25s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow="var(--shadow-l)";e.currentTarget.style.borderColor="var(--g200)";e.currentTarget.style.transform="translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor="var(--n200)";e.currentTarget.style.transform=""; }}
            >
              <div style={{ background:"linear-gradient(135deg,var(--g50),var(--br50))",padding:28,borderBottom:"1px solid var(--n200)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:56,height:56,borderRadius:"var(--radius-m)",background:"linear-gradient(135deg,var(--g400),var(--g700))",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 18px rgba(30,143,97,.25)",flexShrink:0 }}>
                    <svg width={26} height={26} viewBox="0 0 24 24" fill="#fff"><path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize:17,fontWeight:800,color:"var(--n900)",marginBottom:4 }}>{c.name}</div>
                    <div style={{ fontSize:13,color:"var(--n500)",lineHeight:1.7 }}>{c.desc}</div>
                  </div>
                </div>
                <div style={{ background:"var(--g100)",border:"1px solid var(--g200)",color:"var(--g700)",padding:"4px 12px",borderRadius:100,fontSize:11,fontWeight:700,flexShrink:0 }}>نشطة</div>
              </div>
              <div style={{ padding:"20px 28px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
                {c.stats.map(([num,label]) => (
                  <div key={label} style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"Tajawal,sans-serif",fontSize:20,fontWeight:900,color:"var(--g600)" }}>{num}</div>
                    <div style={{ fontSize:11,color:"var(--n400)",marginTop:3 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"14px 28px",borderTop:"1px solid var(--n100)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <a href="#contact" style={{ fontSize:13,fontWeight:700,color:"var(--g600)",display:"flex",alignItems:"center",gap:6,transition:".2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color="var(--g700)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="var(--g600)"; }}
                >استعرض الحلقة
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ transform:"scaleX(-1)" }}><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </Container>
      <style>{`@media(max-width:640px){.circles-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:"01", title:"أنشئ مجمعك في دقيقتين", desc:"سجّل بياناتك الأساسية وخصّص اسم مجمعك وشعاره وألوانه ببضع نقرات." },
    { n:"02", title:"أضف حلقاتك ومعلميك", desc:"أضف الحلقات القرآنية وسجّل بيانات المعلمين والطلاب بسهولة تامة." },
    { n:"03", title:"تابع وأدر في الوقت الفعلي", desc:"تتبّع الحضور والتقدم وأصدر التقارير وادفع الرواتب كل شيء من مكان واحد." },
  ];
  return (
    <section id="how-it-works" style={{ padding:"clamp(60px,8vw,100px) 0",background:"var(--n900)",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)",backgroundSize:"60px 60px" }} />
      <Container>
        <div className="reveal" style={{ textAlign:"center",marginBottom:"clamp(40px,5vw,64px)" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",color:"var(--g300)",padding:"5px 14px",borderRadius:100,fontSize:12,fontWeight:700,marginBottom:16 }}>آلية العمل</div>
          <h2 style={{ fontFamily:"Tajawal,sans-serif",fontSize:"clamp(1.7rem,3.2vw,2.8rem)",fontWeight:900,color:"#fff",lineHeight:1.2,marginBottom:14 }}>ابدأ في ثلاث خطوات <span style={{ color:"var(--g300)" }}>بسيطة</span></h2>
          <p style={{ fontSize:16,color:"rgba(255,255,255,.5)",lineHeight:1.9,maxWidth:580,margin:"0 auto" }}>لا تحتاج إلى أي خبرة تقنية — منصة إتقان صُمِّمت لتكون سهلة الاستخدام من اليوم الأول.</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0,position:"relative" }} className="how-steps">
          <div style={{ position:"absolute",top:40,right:"16.66%",left:"16.66%",height:1,background:"linear-gradient(90deg,var(--g600),var(--br300),var(--g600))",opacity:.4 }} className="steps-line" />
          {steps.map((s,i) => (
            <div key={i} className="reveal" style={{ position:"relative",zIndex:1,textAlign:"center",padding:"0 clamp(12px,3vw,24px)" }}>
              <div style={{ width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Tajawal,sans-serif",fontSize:28,fontWeight:900,color:"var(--g400)",margin:"0 auto 24px",position:"relative" }}>
                <span>{s.n}</span>
              </div>
              <h3 style={{ fontSize:16,fontWeight:800,color:"#fff",marginBottom:10 }}>{s.title}</h3>
              <p style={{ fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.8 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
      <style>{`
        @media(max-width:640px){ .how-steps{grid-template-columns:1fr!important;} .steps-line{display:none!important;} }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   TRUST
───────────────────────────────────────── */
function TrustBadges() {
  const items = [
    { title:"أمان وحماية البيانات", desc:"تشفير كامل AES-256 لجميع البيانات مع نسخ احتياطية تلقائية يومية." },
    { title:"دعم فني على مدار الساعة", desc:"فريق دعم متخصص متاح 8 صباحاً حتى 10 مساءً كل يوم." },
    { title:"توافق مع جميع الأجهزة", desc:"يعمل على الكمبيوتر واللوحي والجوال مع دعم وضع الأوفلاين." },
  ];
  return (
    <section style={{ padding:"clamp(50px,6vw,80px) 0",background:"var(--n50)",borderTop:"1px solid var(--n200)" }}>
      <Container>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }} className="trust-grid">
          {items.map((item,i) => (
            <div key={i} className="reveal" style={{ background:"var(--n0)",border:"1px solid var(--n200)",borderRadius:"var(--radius-l)",padding:28,display:"flex",alignItems:"flex-start",gap:16,transition:".2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="var(--g200)";e.currentTarget.style.boxShadow="var(--shadow-s)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--n200)";e.currentTarget.style.boxShadow=""; }}
            >
              <div style={{ width:48,height:48,borderRadius:"var(--radius-m)",background:"var(--g100)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--g600)" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div style={{ fontSize:14,fontWeight:800,color:"var(--n800)",marginBottom:4 }}>{item.title}</div>
                <div style={{ fontSize:13,color:"var(--n500)",lineHeight:1.7 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
      <style>{`
        @media(max-width:768px){.trust-grid{grid-template-columns:1fr!important;}}
        @media(min-width:480px) and (max-width:768px){.trust-grid{grid-template-columns:repeat(2,1fr)!important;}}
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */
function Testimonials() {
  const reviews = [
    { name:"أ. محمد العمري", role:"مدير مجمع الفرقان القرآني", text:"منصة إتقان غيّرت طريقة إدارة مجمعنا بالكامل. أصبحنا نوفّر أكثر من 6 ساعات يومياً في تسجيل الحضور وإعداد التقارير.", grad:"linear-gradient(135deg,#1e8f61,#0f5439)", letter:"م" },
    { name:"أ. فاطمة السعدي", role:"مشرفة دار تحفيظ نور الهدى", text:"بوابة أولياء الأمور أحدثت فارقاً كبيراً. أصبح الأهالي يتابعون تقدم أبنائهم لحظة بلحظة وتوقفنا عن الرد على مئات الاتصالات اليومية.", grad:"linear-gradient(135deg,#a8733f,#8a5a2d)", letter:"ف" },
    { name:"أ. خالد المطيري", role:"معلم ومشرف حلقات تحفيظ", text:"غرف التسميع الذكية ومساعد الذكاء الاصطناعي جعلا تجربتي كمعلم أكثر احترافية. أستطيع الآن بناء خطة تعليمية لكل طالب في دقائق.", grad:"linear-gradient(135deg,#38a879,#15724e)", letter:"خ" },
  ];
  return (
    <section id="testimonials" style={{ padding:"clamp(60px,8vw,100px) 0",background:"var(--n0)" }}>
      <Container>
        <SectionHead label="آراء العملاء" title='ماذا يقول <span style="color:var(--g500)">مستخدمو إتقان</span>' desc="آلاف المجمعات القرآنية حول العالم تثق في منصة إتقان لإدارة حلقاتها." />
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24 }} className="testi-grid">
          {reviews.map((r,i) => (
            <div key={i} className="reveal" style={{ background:"var(--n0)",border:"1px solid var(--n200)",borderRadius:"var(--radius-xl)",padding:32,transition:".25s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow="var(--shadow-l)";e.currentTarget.style.borderColor="var(--g200)";e.currentTarget.style.transform="translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor="var(--n200)";e.currentTarget.style.transform=""; }}
            >
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
                <div style={{ width:48,height:48,borderRadius:"50%",background:r.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:"#fff",flexShrink:0 }}>{r.letter}</div>
                <div>
                  <div style={{ fontSize:14,fontWeight:800,color:"var(--n900)" }}>{r.name}</div>
                  <div style={{ fontSize:12,color:"var(--n400)",marginTop:2 }}>{r.role}</div>
                </div>
              </div>
              <div style={{ color:"#f59e0b",fontSize:13,letterSpacing:1,marginBottom:14 }}>★★★★★</div>
              <div style={{ fontFamily:"Amiri,serif",fontSize:36,color:"var(--g200)",lineHeight:1,marginBottom:8 }}>"</div>
              <p style={{ fontSize:14,color:"var(--n600)",lineHeight:1.9 }}>{r.text}</p>
            </div>
          ))}
        </div>
      </Container>
      <style>{`
        @media(max-width:900px){.testi-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:560px){.testi-grid{grid-template-columns:1fr!important;}}
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   FAQ
───────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:"هل يمكنني إدارة أكثر من مجمع على نفس الحساب؟", a:"نعم، تتيح منصة إتقان إدارة عدد غير محدود من المجمعات والحلقات ضمن حساب واحد مع عزل تام لبيانات كل مجمع وصلاحيات مخصصة لكل مشرف." },
    { q:"كيف تعمل غرف التسميع الذكية؟", a:"تتيح غرف التسميع إجراء جلسات مسموعة مباشرة بين المعلم والطالب عبر الإنترنت مع تسجيل الجلسة تلقائياً لإمكانية المراجعة لاحقاً ومتابعة التقدم." },
    { q:"هل المنصة تدعم الدور النسائية؟", a:"بالتأكيد، تم تصميم منصة إتقان مع مراعاة احتياجات الدور النسائية بشكل كامل مع صلاحيات منفصلة وبوابات مخصصة للمعلمات وأولياء أمور الطالبات." },
    { q:"ما مدى أمان بيانات المجمع والطلاب؟", a:"نستخدم تشفير AES-256 لجميع البيانات مع نسخ احتياطية تلقائية يومية وحماية من الاختراق وعزل تام لبيانات كل مجمع." },
    { q:"هل يمكن تخصيص تقارير الرواتب؟", a:"نعم، يمكن تخصيص نظام الرواتب بالكامل — أضف بدلات، حسومات، مكافآت ومكافآت إضافية — مع إمكانية تصدير كشوف الرواتب بصيغة PDF و Excel." },
  ];
  return (
    <section id="faq" style={{ padding:"clamp(60px,8vw,100px) 0",background:"var(--g50)" }}>
      <Container>
        <SectionHead label="الأسئلة الشائعة" title="إجابات لأكثر <br><span style='color:var(--g500)'>الأسئلة شيوعاً</span>" desc="لم تجد إجابتك؟ تواصل معنا مباشرة وسيردّ عليك فريق الدعم خلال ساعات." />
        <div style={{ maxWidth:760,margin:"0 auto" }}>
          {faqs.map((f,i) => (
            <div key={i} style={{ background:"var(--n0)",border:`1px solid ${open===i?"var(--g300)":"var(--n200)"}`,borderRadius:"var(--radius-l)",marginBottom:12,overflow:"hidden",transition:".2s" }}>
              <button onClick={() => setOpen(open===i?null:i)} style={{ width:"100%",padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,fontSize:15,fontWeight:700,color:open===i?"var(--g600)":"var(--n800)",background:"none",border:"none",cursor:"pointer",textAlign:"right",direction:"rtl" }}>
                {f.q}
                <span style={{ width:28,height:28,borderRadius:"50%",background:open===i?"var(--g100)":"var(--n100)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:".3s",transform:open===i?"rotate(180deg)":"none" }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={open===i?"var(--g600)":"var(--n500)"} strokeWidth={2.5}><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>
              {open===i && (
                <div style={{ padding:"0 24px 20px",fontSize:14,color:"var(--n500)",lineHeight:1.9 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────
   CTA
───────────────────────────────────────── */
function CTA() {
  return (
    <section style={{ padding:"clamp(50px,6vw,80px) 0 clamp(60px,8vw,100px)" }}>
      <Container>
        <div style={{ background:"linear-gradient(145deg,var(--g700) 0%,var(--g800) 50%,var(--n900) 100%)",borderRadius:"var(--radius-xl)",padding:"clamp(36px,5vw,72px) clamp(28px,5vw,64px)",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"space-between",gap:48,flexWrap:"wrap" }}>
          <div style={{ position:"absolute",fontFamily:"Amiri,serif",fontSize:"clamp(80px,15vw,200px)",fontWeight:700,color:"rgba(255,255,255,.03)",bottom:-30,left:-20,lineHeight:1,pointerEvents:"none" }}>إتقان</div>
          <div style={{ position:"absolute",right:-120,top:-120,width:400,height:400,borderRadius:"50%",background:"rgba(255,255,255,.03)",pointerEvents:"none" }} />
          <div style={{ position:"relative",zIndex:1 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.14)",color:"var(--g200)",padding:"5px 14px",borderRadius:100,fontSize:12,fontWeight:700,marginBottom:18 }}>ابدأ رحلتك مع إتقان</div>
            <h2 style={{ fontFamily:"Tajawal,sans-serif",fontSize:"clamp(1.6rem,3vw,2.8rem)",fontWeight:900,color:"#fff",lineHeight:1.2,marginBottom:14 }}>جاهز لتحويل مجمعك<br />إلى منظومة رقمية متكاملة؟</h2>
            <p style={{ fontSize:15,color:"rgba(255,255,255,.6)",lineHeight:1.9,maxWidth:520 }}>سجّل الآن واحصل على استشارة مجانية مع فريق إتقان لفهم احتياجاتك وتخصيص المنصة لمجمعك.</p>
          </div>
          <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",gap:12,flexShrink:0 }}>
            <a href="#contact" style={{ padding:"16px 44px",fontSize:17,fontWeight:700,background:"#fff",color:"var(--g700)",borderRadius:"var(--radius-l)",boxShadow:"0 6px 24px rgba(0,0,0,.18)",transition:"all .22s",display:"inline-flex",alignItems:"center",justifyContent:"center" }}
              onMouseEnter={e => { e.currentTarget.style.background="var(--g50)";e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#fff";e.currentTarget.style.transform=""; }}
            >سجّل مجمعك الآن</a>
            <a href="#features" style={{ padding:"16px 44px",fontSize:17,fontWeight:700,background:"transparent",color:"rgba(255,255,255,.85)",border:"1.5px solid rgba(255,255,255,.25)",borderRadius:"var(--radius-l)",transition:"all .22s",display:"inline-flex",alignItems:"center",justifyContent:"center" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.08)";e.currentTarget.style.borderColor="rgba(255,255,255,.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(255,255,255,.25)"; }}
            >استكشف المميزات</a>
            <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(255,255,255,.4)" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              بدون بطاقة ائتمان — استشارة مجانية
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────
   CONTACT
───────────────────────────────────────── */
function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 4000); e.target.reset(); };
  return (
    <section id="contact" style={{ padding:"clamp(60px,8vw,100px) 0",background:"var(--n50)",borderTop:"1px solid var(--n200)" }}>
      <Container>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(40px,6vw,80px)",alignItems:"start" }} className="contact-grid">
          <div className="reveal-right">
            <Pill>تواصل معنا</Pill>
            <h2 style={{ fontFamily:"Tajawal,sans-serif",fontSize:"clamp(1.7rem,3vw,2.5rem)",fontWeight:900,color:"var(--n900)",lineHeight:1.2,marginBottom:14,marginTop:20 }}>هل أنت جاهز لبدء رحلتك مع <span style={{ color:"var(--g500)" }}>إتقان</span>؟</h2>
            <p style={{ fontSize:15,color:"var(--n500)",lineHeight:1.9,marginBottom:32 }}>سجّل مجمعك الآن واحصل على استشارة مجانية مع فريق إتقان. سنتواصل معك خلال 24 ساعة.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              {[
                { icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--g600)" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12 19.79 19.79 0 0 1 1.15 3.38 2 2 0 0 1 3.12 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg>, label:"للاتصال بنا", value:"+966 50 000 0000" },
                { icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--g600)" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label:"البريد الإلكتروني", value:"support@itqan.app" },
                { icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--g600)" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>, label:"ساعات الدعم", value:"8 صباحاً — 10 مساءً" },
              ].map((item,i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:14,padding:"16px 20px",background:"var(--n0)",border:"1px solid var(--n200)",borderRadius:"var(--radius-m)" }}>
                  <div style={{ width:42,height:42,borderRadius:10,background:"var(--g100)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize:11,fontWeight:700,color:"var(--n400)",textTransform:"uppercase",letterSpacing:.5 }}>{item.label}</div>
                    <div style={{ fontSize:14,fontWeight:700,color:"var(--n800)",marginTop:2 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-left">
            <div style={{ background:"var(--n0)",border:"1px solid var(--n200)",borderRadius:"var(--radius-xl)",padding:"clamp(24px,3vw,36px)",boxShadow:"var(--shadow-m)" }}>
              <h3 style={{ fontSize:18,fontWeight:800,color:"var(--n900)",marginBottom:24 }}>سجّل مجمعك الآن</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="form-row">
                  {[["الاسم الكامل","اسم مدير المجمع","name"],["اسم المجمع","مجمع الإمام البخاري","academy"]].map(([label,ph,name]) => (
                    <div key={name} style={{ marginBottom:18 }}>
                      <label style={{ display:"block",fontSize:13,fontWeight:700,color:"var(--n700)",marginBottom:7 }}>{label} <span style={{ color:"#ef4444" }}>*</span></label>
                      <input required placeholder={ph} style={{ width:"100%",padding:"12px 16px",background:"var(--n0)",border:"1.5px solid var(--n200)",borderRadius:"var(--radius-m)",fontFamily:"Tajawal,sans-serif",fontSize:14,color:"var(--n800)",outline:"none",direction:"rtl",transition:".2s" }}
                        onFocus={e => { e.target.style.borderColor="var(--g400)";e.target.style.boxShadow="0 0 0 3px rgba(56,168,121,.12)"; }}
                        onBlur={e => { e.target.style.borderColor="var(--n200)";e.target.style.boxShadow=""; }}
                      />
                    </div>
                  ))}
                </div>
                {[["البريد الإلكتروني","email","your@email.com"],["رقم الجوال","tel","+966 5X XXX XXXX"]].map(([label,type,ph]) => (
                  <div key={label} style={{ marginBottom:18 }}>
                    <label style={{ display:"block",fontSize:13,fontWeight:700,color:"var(--n700)",marginBottom:7 }}>{label} <span style={{ color:"#ef4444" }}>*</span></label>
                    <input required type={type} placeholder={ph} style={{ width:"100%",padding:"12px 16px",background:"var(--n0)",border:"1.5px solid var(--n200)",borderRadius:"var(--radius-m)",fontFamily:"Tajawal,sans-serif",fontSize:14,color:"var(--n800)",outline:"none",direction:"rtl",transition:".2s" }}
                      onFocus={e => { e.target.style.borderColor="var(--g400)";e.target.style.boxShadow="0 0 0 3px rgba(56,168,121,.12)"; }}
                      onBlur={e => { e.target.style.borderColor="var(--n200)";e.target.style.boxShadow=""; }}
                    />
                  </div>
                ))}
                <div style={{ marginBottom:18 }}>
                  <label style={{ display:"block",fontSize:13,fontWeight:700,color:"var(--n700)",marginBottom:7 }}>سؤالك أو احتياجك</label>
                  <textarea placeholder="أخبرنا عن مجمعك وعدد طلابك واحتياجاتك..." style={{ width:"100%",padding:"12px 16px",background:"var(--n0)",border:"1.5px solid var(--n200)",borderRadius:"var(--radius-m)",fontFamily:"Tajawal,sans-serif",fontSize:14,color:"var(--n800)",outline:"none",direction:"rtl",resize:"vertical",minHeight:110,transition:".2s" }}
                    onFocus={e => { e.target.style.borderColor="var(--g400)";e.target.style.boxShadow="0 0 0 3px rgba(56,168,121,.12)"; }}
                    onBlur={e => { e.target.style.borderColor="var(--n200)";e.target.style.boxShadow=""; }}
                  />
                </div>
                <button type="submit" style={{ width:"100%",padding:"13px 0",fontSize:14,fontWeight:700,background:submitted?"var(--g700)":"var(--g500)",color:"#fff",borderRadius:"var(--radius-m)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .22s",boxShadow:"0 4px 18px rgba(30,143,97,.30)" }}>
                  {submitted ? "✓ تم الإرسال — سنتواصل معك قريباً" : "إرسال وتسجيل المجمع"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Container>
      <style>{`
        @media(max-width:768px){.contact-grid{grid-template-columns:1fr!important;} .form-row{grid-template-columns:1fr!important;}}
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background:"var(--n900)",padding:"clamp(40px,5vw,64px) 0 28px" }}>
      <Container>
        <div style={{ display:"grid",gridTemplateColumns:"2.2fr 1fr 1fr 1fr",gap:"clamp(32px,5vw,64px)",marginBottom:52 }} className="footer-grid">
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:"linear-gradient(145deg,var(--g500),var(--g700))",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff"><path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9z"/></svg>
              </div>
              <span style={{ fontFamily:"Tajawal,sans-serif",fontSize:22,fontWeight:900,color:"#fff" }}>إتقان<span style={{ color:"var(--g500)" }}>.</span></span>
            </div>
            <p style={{ fontSize:13,color:"rgba(255,255,255,.4)",lineHeight:1.9,marginBottom:24,maxWidth:300 }}>منصة تعليمية متطورة لإدارة حلقات حفظ القرآن الكريم — نجمع بين التقنية الحديثة وخدمة كتاب الله.</p>
            <div style={{ display:"flex",gap:10 }}>
              {["تويتر","يوتيوب","واتساب","لينكدإن"].map(s => (
                <div key={s} style={{ width:36,height:36,borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:".2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="var(--g600)";e.currentTarget.style.borderColor="var(--g500)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.borderColor="rgba(255,255,255,.1)"; }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth={2}><circle cx={12} cy={12} r={5}/></svg>
                </div>
              ))}
            </div>
          </div>
          {[
            { title:"المنصة", links:["المميزات","الحلقات","آلية العمل","الأمان","آراء العملاء"] },
            { title:"الخدمات", links:["إنشاء مجمع","الدعم الفني","التدريب والتأهيل","استشارة مجانية","الأسئلة الشائعة"] },
            { title:"الروابط", links:["الرئيسية","الحلقات","المعلمون","المجامع","سياسة الخصوصية"] },
          ].map(col => (
            <div key={col.title}>
              <h5 style={{ fontSize:13,fontWeight:700,color:"rgba(255,255,255,.9)",marginBottom:18,textTransform:"uppercase",letterSpacing:.5 }}>{col.title}</h5>
              <ul style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {col.links.map(l => (
                  <li key={l}><a href="#" style={{ fontSize:13,color:"rgba(255,255,255,.4)",transition:".2s" }}
                    onMouseEnter={e => { e.target.style.color="var(--g300)"; }}
                    onMouseLeave={e => { e.target.style.color="rgba(255,255,255,.4)"; }}
                  >{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ paddingTop:24,borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap" }}>
          <div style={{ fontSize:13,color:"rgba(255,255,255,.3)" }}>© 2025 إتقان. جميع الحقوق محفوظة.</div>
          <div style={{ fontFamily:"Amiri,serif",fontSize:16,color:"var(--g400)",direction:"rtl" }}>﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾</div>
        </div>
      </Container>
      <style>{`
        @media(max-width:900px){ .footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important;} }
        @media(max-width:480px){ .footer-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </footer>
  );
}

/* ─────────────────────────────────────────
   APP
───────────────────────────────────────── */
export default function App() {
  useReveal();
  return (
    <>
      <style>{globalStyle}</style>
      <Navbar />
      <main>
        <Hero />
        <MarqueeBand />
        <ProblemSolution />
        <Features />
        <ShowcaseReports />
        <Circles />
        <HowItWorks />
        <TrustBadges />
        <Testimonials />
        <FAQ />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
