import { useState, useEffect, useRef } from "react";

type Page = "dashboard"|"plan"|"progress"|"centers"|"recitation"|"attendance"|"certificates"|"session";

interface Badge{id:number;name:string;icon:string;desc:string;earned:boolean;color:string;earnedDate?:string;}
interface Session{teacherName:string;teacherTitle:string;subject:string;date:string;time:string;duration:string;roomUrl:string;}
interface Plan{id:number;name:string;duration:string;sessions:number;studyDays:number;center:string;}
interface RecLog{id:number;date:string;surah:string;from:string;to:string;grade:string;note:string;teacher:string;}
interface AttRec{id:number;date:string;status:"حاضر"|"غائب"|"متأخر";session:string;}

const STUDENT={name:"منصور ترك التميمي",email:"student_2035205235@gmail.com",pts:120,totalPts:500,progress:98,quranProgress:24};
const BADGES:Badge[]=[
  {id:1,name:"أول تسميع",icon:"🌱",desc:"أتممت أول جلسة تسميع",earned:true,color:"#d1fae5",earnedDate:"2026-03-01"},
  {id:2,name:"المواظب",icon:"🔥",desc:"حضرت 7 أيام متتالية",earned:true,color:"#fef3c7",earnedDate:"2026-03-10"},
  {id:3,name:"حافظ الجزء",icon:"📖",desc:"أتممت حفظ جزء كامل",earned:true,color:"#dbeafe",earnedDate:"2026-03-15"},
  {id:4,name:"النجم الذهبي",icon:"⭐",desc:"حصلت على تقييم ممتاز 5 مرات",earned:false,color:"#fefce8"},
  {id:5,name:"المتميز",icon:"🏆",desc:"الأول في نسبة التقدم",earned:false,color:"#ede9fe"},
  {id:6,name:"ختمة الشهر",icon:"🌙",desc:"أكملت خطة الشهر كاملة",earned:false,color:"#fce7f3"},
  {id:7,name:"نصف القرآن",icon:"💎",desc:"حفظت 15 جزءاً",earned:false,color:"#ecfdf5"},
  {id:8,name:"الإجازة",icon:"🎓",desc:"حصلت على الإجازة بالسند",earned:false,color:"#fff7ed"},
];
const NEXT_SESSION:Session={
  teacherName:"الشيخ أحمد ناصر مصطفي",
  teacherTitle:"معلم القرآن الكريم — مجمع الجامع",
  subject:"مراجعة سورة البقرة (الآيات ١-٢٠)",
  date:"السبت ٢٨ مارس ٢٠٢٦",
  time:"٣:٣٠ م",duration:"٦٠ دقيقة",
  roomUrl:"https://meet.itqan.sa/room/mansour-2026",
};
const PLANS:Plan[]=[{id:1,name:"خطة 12 شهر — ختم القرآن",duration:"12 شهر",sessions:1,studyDays:360,center:"مجمع الجامع"}];
const RECS:RecLog[]=[
  {id:1,date:"2026-03-20",surah:"البقرة",from:"١",to:"١٠",grade:"ممتاز",note:"راجع آية ٤٨ مرة تانية",teacher:"أحمد ناصر"},
  {id:2,date:"2026-03-18",surah:"آل عمران",from:"٥",to:"١٥",grade:"جيد جداً",note:"",teacher:"أحمد ناصر"},
  {id:3,date:"2026-03-15",surah:"النساء",from:"١",to:"٨",grade:"جيد",note:"التجويد يحتاج مراجعة",teacher:"أحمد ناصر"},
];
const ATT:AttRec[]=[
  {id:1,date:"2026-03-20",status:"حاضر",session:"حلقة الرحمن"},
  {id:2,date:"2026-03-18",status:"حاضر",session:"حلقة الرحمن"},
  {id:3,date:"2026-03-15",status:"متأخر",session:"حلقة الرحمن"},
  {id:4,date:"2026-03-12",status:"غائب",session:"حلقة الرحمن"},
  {id:5,date:"2026-03-10",status:"حاضر",session:"حلقة الرحمن"},
];
const CENTER={name:"مجمع الجامع",desc:"مجمع قرآني يُعنى بخدمة القرآن وعلومه، يضم برامج تعليمية وإجازات بالسند المتصل.",students:2,teachers:1,circles:2,plans:1,mosques:1};
const PAGE_LABELS:Record<Page,string>={dashboard:"لوحة التحكم",plan:"الخطة",progress:"مستوى التقدم",centers:"المجمعات",recitation:"سجل التسميع",attendance:"الحضور والغياب",certificates:"الشهادات والملاحظات",session:"غرفة الحصة"};

// ─── ICONS ───────────────────────────────────
const Ic={
  grid:<svg width={15}height={15}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><rect x="3"y="3"width="7"height="7"/><rect x="14"y="3"width="7"height="7"/><rect x="14"y="14"width="7"height="7"/><rect x="3"y="14"width="7"height="7"/></svg>,
  book:<svg width={15}height={15}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  trend:<svg width={15}height={15}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  mosque:<svg width={15}height={15}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  mic:<svg width={15}height={15}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12"y1="19"x2="12"y2="23"/><line x1="8"y1="23"x2="16"y2="23"/></svg>,
  cal:<svg width={15}height={15}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><rect x="3"y="4"width="18"height="18"rx="2"/><line x1="16"y1="2"x2="16"y2="6"/><line x1="8"y1="2"x2="8"y2="6"/><line x1="3"y1="10"x2="21"y2="10"/></svg>,
  star:<svg width={15}height={15}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  user:<svg width={14}height={14}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12"cy="7"r="4"/></svg>,
  settings:<svg width={14}height={14}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><circle cx="12"cy="12"r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  logout:<svg width={14}height={14}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21"y1="12"x2="9"y2="12"/></svg>,
  check:<svg width={11}height={11}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>,
  menu:<svg width={18}height={18}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><line x1="3"y1="8"x2="21"y2="8"/><line x1="3"y1="16"x2="21"y2="16"/></svg>,
  copy:<svg width={14}height={14}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><rect x="9"y="9"width="13"height="13"rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  video:<svg width={16}height={16}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1"y="5"width="15"height="14"rx="2"/></svg>,
  record:<svg width={16}height={16}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><circle cx="12"cy="12"r="10"/><circle cx="12"cy="12"r="3"fill="currentColor"/></svg>,
  stop:<svg width={14}height={14}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><rect x="3"y="3"width="18"height="18"rx="2"/></svg>,
  screen:<svg width={16}height={16}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><rect x="2"y="3"width="20"height="14"rx="2"/><polyline points="8 21 12 17 16 21"/><line x1="12"y1="17"x2="12"y2="21"/></svg>,
  clock:<svg width={13}height={13}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><circle cx="12"cy="12"r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  schedule:<svg width={14}height={14}viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}><rect x="3"y="4"width="18"height="18"rx="2"/><line x1="16"y1="2"x2="16"y2="6"/><line x1="8"y1="2"x2="8"y2="6"/><line x1="3"y1="10"x2="21"y2="10"/></svg>,
};

// ─── HELPERS ─────────────────────────────────
function PBar({pct,h=6,color="var(--g500)"}:{pct:number;h?:number;color?:string}){
  return<div style={{height:h,background:"var(--n100)",borderRadius:100,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:color,borderRadius:100,transition:"width .6s ease"}}/></div>;
}
function WG({children}:{children:React.ReactNode}){return<div className="widget">{children}</div>;}
function WH({t,right}:{t:string;right?:React.ReactNode}){return<div className="wh"><span className="wh-t">{t}</span>{right}</div>;}
function Empty({icon,title,sub}:{icon:string;title:string;sub?:string}){
  return<div className="empty-state"><div style={{fontSize:34,marginBottom:6}}>{icon}</div><div style={{fontSize:13,fontWeight:700,color:"var(--n600)"}}>{title}</div>{sub&&<div style={{fontSize:11.5,color:"var(--n400)"}}>{sub}</div>}</div>;
}
function AttB({s}:{s:AttRec["status"]}){
  const m={"حاضر":"badge-g","متأخر":"badge-a","غائب":"badge-r"};
  return<span className={`badge ${m[s]}`}>{s}</span>;
}
function Chip({children,bg="var(--n100)",col="var(--n600)"}:{children:React.ReactNode;bg?:string;col?:string}){
  return<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:100,fontSize:11,fontWeight:700,background:bg,color:col,whiteSpace:"nowrap"}}>{children}</span>;
}

// ════════════════════════════════════════════
// SESSION ROOM
// ════════════════════════════════════════════
function SessionRoom({s,onBack}:{s:Session;onBack:()=>void}){
  const[rec,setRec]=useState(false);
  const[attended,setAttended]=useState(false);
  const[recT,setRecT]=useState(0);
  const[copied,setCopied]=useState(false);
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(rec){ref.current=setInterval(()=>setRecT(t=>t+1),1000);}
    else{if(ref.current)clearInterval(ref.current);}
    return()=>{if(ref.current)clearInterval(ref.current);};
  },[rec]);
  const fmt=(t:number)=>`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;
  const copy=()=>{navigator.clipboard.writeText(s.roomUrl).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);};

  return(
    <div className="page-body">
      <button className="back-btn" onClick={onBack}>← العودة للوحة التحكم</button>

      {/* VIDEO ROOM */}
      <div className="video-room">
        <div className="vr-header">
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 0 3px rgba(74,222,128,.25)"}}/>
            <span style={{color:"#fff",fontSize:13,fontWeight:700}}>{s.subject}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,color:"rgba(255,255,255,.45)",fontSize:12}}>
            {Ic.clock}<span>{s.time} · {s.duration}</span>
          </div>
        </div>

        <div className="vr-main">
          {/* Teacher cam */}
          <div className="teacher-cam">
            <div className="teacher-cam-ring">
              <div className="teacher-cam-av">
                <span style={{fontSize:48,fontWeight:900,color:"#fff"}}>أ</span>
              </div>
            </div>
            <div className="teacher-cam-name">{s.teacherName}</div>
            <div className="cam-live"><div className="live-dot"/>بث مباشر</div>
          </div>
          {/* Student pip */}
          <div className="student-pip">
            <span style={{fontSize:18,fontWeight:900,color:"#fff"}}>م</span>
            <span style={{fontSize:9,color:"rgba(255,255,255,.5)"}}>أنت</span>
          </div>
        </div>

        <div className="vr-controls">
          {!attended
            ?<button className="vr-attend-btn" onClick={()=>setAttended(true)}>{Ic.check} تسجيل الحضور</button>
            :<div className="vr-attended">{Ic.check} تم تسجيل حضورك</div>}
          <button className={`vr-rec-btn${rec?" active":""}`} onClick={()=>setRec(r=>!r)}>
            {rec?<>{Ic.stop} إيقاف <span className="rec-timer">{fmt(recT)}</span></>:<>{Ic.record} تسجيل الشاشة</>}
          </button>
          <button className="vr-copy-btn" onClick={copy} style={{marginRight:"auto"}}>
            {copied?<>{Ic.check} تم النسخ!</>:<>{Ic.copy} نسخ الرابط</>}
          </button>
        </div>
      </div>

      {/* INFO + REC */}
      <div className="session-info-grid">
        <WG>
          <WH t="معلومات الحصة"/>
          <div className="wb">
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,paddingBottom:14,borderBottom:"1px solid var(--n100)"}}>
              <div className="st-av-big">أ</div>
              <div><div style={{fontSize:14,fontWeight:800,color:"var(--n900)"}}>{s.teacherName}</div><div style={{fontSize:11.5,color:"var(--n400)",marginTop:2}}>{s.teacherTitle}</div></div>
            </div>
            {[{l:"الموضوع",v:s.subject},{l:"التاريخ",v:s.date},{l:"الوقت",v:s.time},{l:"المدة",v:s.duration}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--n100)"}}>
                <span style={{fontSize:12,color:"var(--n400)",fontWeight:600}}>{r.l}</span>
                <span style={{fontSize:12,fontWeight:700,color:"var(--n800)"}}>{r.v}</span>
              </div>
            ))}
            <div className="url-row">
              <span style={{flex:1,fontSize:11,color:"var(--n400)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}dir="ltr">{s.roomUrl}</span>
              <button className="url-copy-btn" onClick={copy}>{copied?"✓":Ic.copy}</button>
            </div>
          </div>
        </WG>
        <WG>
          <WH t="تسجيل الشاشة"/>
          <div className="wb">
            <div className={`rec-status-box${rec?" rec-active":""}`}>
              {rec
                ?<><div className="rec-red-dot"/><div><div style={{fontWeight:800,color:"var(--red)",fontSize:14}}>جارٍ التسجيل</div><div style={{fontSize:12,color:"var(--n500)",marginTop:2}}>المدة: {fmt(recT)}</div></div><button className="stop-btn" onClick={()=>setRec(false)}>{Ic.stop} إيقاف</button></>
                :<><div className="rec-idle-ico">{Ic.screen}</div><div><div style={{fontWeight:700,color:"var(--n700)",fontSize:13}}>تسجيل الشاشة</div><div style={{fontSize:12,color:"var(--n400)",marginTop:2}}>اضغط لتسجيل الحصة وحفظها</div></div><button className="start-btn" onClick={()=>setRec(true)}>{Ic.record} ابدأ</button></>}
            </div>
            <div style={{marginTop:14,padding:"10px 12px",background:"var(--n50)",borderRadius:10,fontSize:11.5,color:"var(--n400)",lineHeight:1.7}}>
              سيتم حفظ التسجيل على جهازك. تأكد من وجود مساحة كافية قبل البدء.
            </div>
          </div>
        </WG>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════
function DashPage({onEnterSession,onBadges}:{onEnterSession:()=>void;onBadges:()=>void}){
  const[copied,setCopied]=useState(false);
  const[attended,setAttended]=useState(false);
  const earned=BADGES.filter(b=>b.earned);
  const pres=ATT.filter(a=>a.status==="حاضر").length;
  const attRate=Math.round((pres/ATT.length)*100);
  const copy=()=>{navigator.clipboard.writeText(NEXT_SESSION.roomUrl).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);};

  return(
    <div className="page-body">
      {/* WELCOME */}
      <div className="welcome-card">
        <div className="wc-left">
          <div className="wc-av">{STUDENT.name[0]}</div>
          <div><div className="wc-name">{STUDENT.name}</div><div className="wc-email"dir="ltr">{STUDENT.email}</div></div>
        </div>
        <div className="wc-stats">
          {[{l:"التقدم",v:STUDENT.progress+"%"},{l:"النقاط",v:STUDENT.pts},{l:"الحضور",v:attRate+"%"}].map((s,i)=>(
            <div key={i} className="wc-stat"><div className="wc-snum">{s.v}</div><div className="wc-slbl">{s.l}</div></div>
          ))}
        </div>
      </div>

      {/* NEXT SESSION CARD */}
      <div className="sc">
        <div className="sc-strip">
          <div className="sc-live-badge"><div className="sc-live-dot"/>الحصة القادمة</div>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11.5,color:"rgba(255,255,255,.4)",fontWeight:600}}>{Ic.clock}<span>{NEXT_SESSION.date} · {NEXT_SESSION.time}</span></div>
        </div>
        <div className="sc-body">
          {/* Teacher */}
          <div className="sc-teacher">
            <div className="sc-tav"><span className="sc-tinit">أ</span><div className="sc-online"/></div>
            <div><div className="sc-tname">{NEXT_SESSION.teacherName}</div><div className="sc-ttitle">{NEXT_SESSION.teacherTitle}</div></div>
          </div>
          {/* Subject */}
          <div className="sc-subject">
            <div className="sc-slbl">موضوع الحصة</div>
            <div className="sc-sval">{NEXT_SESSION.subject}</div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11.5,color:"var(--n400)",marginTop:4}}>{Ic.clock}<span>{NEXT_SESSION.duration}</span></div>
          </div>
          {/* Actions */}
          <div className="sc-acts">
            {!attended
              ?<button className="attend-now" onClick={()=>setAttended(true)}>{Ic.check} تسجيل الحضور</button>
              :<div className="attended-ok">{Ic.check} تم تسجيل الحضور</div>}
            <button className="enter-btn" onClick={onEnterSession}>{Ic.video} دخول الحصة</button>
            <button className="copy-btn" onClick={copy}>{copied?<>{Ic.check} تم!</>:<>{Ic.copy} نسخ الرابط</>}</button>
          </div>
        </div>
      </div>

      {/* BADGES PREVIEW */}
      <WG>
        <WH t="أوسمتي" right={<button className="pill-btn" onClick={onBadges}>عرض الكل ({earned.length}/{BADGES.length})</button>}/>
        <div className="wb">
          <div className="badges-row">
            {BADGES.map(b=>(
              <div key={b.id} className={`badge-item${b.earned?" earned":" locked"}`} title={b.desc}>
                <div className="badge-ico" style={{background:b.earned?b.color:"var(--n100)"}}>
                  <span style={{fontSize:22,filter:b.earned?"none":"grayscale(1) opacity(.3)"}}>{b.icon}</span>
                  {b.earned&&<div className="badge-ck">{Ic.check}</div>}
                </div>
                <div className="badge-lbl">{b.name}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
            <span style={{fontSize:12,color:"var(--n500)",fontWeight:600,flexShrink:0}}>{earned.length}/{BADGES.length} وسام</span>
            <PBar pct={(earned.length/BADGES.length)*100} h={5} color="linear-gradient(90deg,var(--g300),var(--g500))"/>
          </div>
        </div>
      </WG>

      {/* MINI STATS */}
      <div className="grid3">
        {[{t:"تقدم القرآن",v:STUDENT.quranProgress+"%",sub:"من المصحف الشريف",c:"var(--g600)",bar:STUDENT.quranProgress,barColor:"linear-gradient(90deg,var(--g300),var(--g500))"},{t:"نقاطي",v:STUDENT.pts+"",sub:`من أصل ${STUDENT.totalPts}`,c:"#7c3aed",bar:(STUDENT.pts/STUDENT.totalPts)*100,barColor:"linear-gradient(90deg,#a78bfa,#7c3aed)"},{t:"الحضور",v:attRate+"%",sub:`${pres} من ${ATT.length} جلسة`,c:"var(--blue)",bar:attRate,barColor:"linear-gradient(90deg,#93c5fd,#3b82f6)"}].map((s,i)=>(
          <WG key={i}>
            <WH t={s.t}/>
            <div className="wb">
              <div style={{fontSize:34,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:11,color:"var(--n400)",margin:"5px 0 10px"}}>{s.sub}</div>
              <PBar pct={s.bar} h={8} color={s.barColor}/>
            </div>
          </WG>
        ))}
      </div>

      {/* LATEST REC */}
      <WG>
        <WH t="آخر جلسات التسميع" right={<Chip bg="var(--g100)" col="var(--g700)">{RECS.length} جلسة</Chip>}/>
        <div style={{overflowX:"auto"}}>
          <table className="dt">
            <thead><tr><th>التاريخ</th><th>السورة</th><th>من</th><th>إلى</th><th>التقييم</th><th>ملاحظة</th></tr></thead>
            <tbody>{RECS.map(r=>(
              <tr key={r.id}>
                <td style={{fontSize:11.5,color:"var(--n400)"}}>{r.date}</td>
                <td style={{fontWeight:700}}>{r.surah}</td><td>{r.from}</td><td>{r.to}</td>
                <td><Chip bg={r.grade==="ممتاز"?"var(--g100)":r.grade==="جيد جداً"?"#dbeafe":"#fef3c7"} col={r.grade==="ممتاز"?"var(--g700)":r.grade==="جيد جداً"?"#1d4ed8":"#92400e"}>{r.grade}</Chip></td>
                <td style={{fontSize:12,color:"var(--n500)"}}>{r.note||"—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </WG>
    </div>
  );
}

// ─── PLAN PAGE ────────────────────────────────
function PlanPage(){
  return(
    <div className="page-body">
      <WG>
        <WH t="حلقات متاحة للحجز" right={<Chip bg="var(--g100)"col="var(--g700)">{PLANS.length} خطة</Chip>}/>
        <div className="wb">
          {PLANS.map(p=>(
            <div className="plan-card" key={p.id}>
              <div style={{fontSize:24,flexShrink:0}}>📋</div>
              <div style={{flex:1}}><div className="pc-name">{p.name}</div><div className="pc-meta">{[p.duration,`${p.sessions} موعد`,`${p.studyDays} يوم دراسي`,p.center].join(" · ")}</div></div>
              <button className="book-btn">احجز الآن</button>
            </div>
          ))}
        </div>
        <div className="pager"><button className="pgr-btn"disabled>السابق</button><span style={{fontSize:12,color:"var(--n400)"}}>صفحة 1 من 1 ({PLANS.length} خطة)</span><button className="pgr-btn"disabled>التالي</button></div>
      </WG>
      <WG>
        <WH t="خطتك اليومية" right={<button className="pill-btn">راجع الدرس اليومي</button>}/>
        <div className="wb"><Empty icon="📚" title="لا توجد خطط دراسية" sub="قم بالحجز في حلقة لتبدأ خطتك الدراسية"/></div>
        <div className="wb"style={{paddingTop:0}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{l:"هدف اليوم",v:"لا يوجد"},{l:"نقاطك",v:`${STUDENT.pts}/${STUDENT.totalPts}`},{l:"التقدم",v:`${STUDENT.progress}%`},{l:"القرآن كامل",v:`${STUDENT.quranProgress}%`}].map((s,i)=>(
              <div key={i} style={{background:"var(--n50)",border:"1px solid var(--n100)",borderRadius:10,padding:"10px 12px"}}><div style={{fontSize:10.5,color:"var(--n400)",fontWeight:600,marginBottom:3}}>{s.l}</div><div style={{fontSize:16,fontWeight:900,color:"var(--n900)"}}>{s.v}</div></div>
            ))}
          </div>
        </div>
      </WG>
    </div>
  );
}

// ─── PROGRESS PAGE ────────────────────────────
function ProgressPage(){
  const notes=RECS.filter(r=>r.note);
  return(
    <div className="page-body">
      <div style={{background:"linear-gradient(135deg,#fefce8,#fef9c3)",border:"1px solid #fcd34d",borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:28}}>🏅</span>
        <div><div style={{fontWeight:800,fontSize:13,color:"#92400e"}}>أكمل أول حصة لتحصل على وسام!</div><div style={{fontSize:11,color:"#b45309",marginTop:2}}>تقدّمك يُسعدنا — استمر!</div></div>
      </div>
      <div className="grid2">
        <WG>
          <WH t="مستوى تقدم الطالب"/>
          <div className="wb">
            <div style={{fontSize:44,fontWeight:900,color:"var(--g600)",lineHeight:1,marginBottom:10}}>{STUDENT.progress}%</div>
            <PBar pct={STUDENT.progress} h={12} color="linear-gradient(90deg,var(--g300),var(--g500))"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
              {[{l:"نقاط مكتسبة",v:`${STUDENT.pts}`},{l:"القرآن",v:`${STUDENT.quranProgress}%`}].map((s,i)=>(
                <div key={i} style={{background:"var(--n50)",border:"1px solid var(--n200)",borderRadius:10,padding:"10px 12px"}}><div style={{fontSize:10.5,color:"var(--n400)",fontWeight:600,marginBottom:3}}>{s.l}</div><div style={{fontSize:16,fontWeight:900,color:"var(--n900)"}}>{s.v}</div></div>
              ))}
            </div>
          </div>
        </WG>
        <WG>
          <WH t="ملاحظات المعلمين"/>
          <div className="wb">
            {notes.length>0?notes.map(r=>(
              <div key={r.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid var(--n100)"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"var(--g400)",flexShrink:0,marginTop:5}}/>
                <div><div style={{fontSize:13,fontWeight:600,color:"var(--n800)"}}>{r.note}</div><div style={{fontSize:11,color:"var(--n400)",marginTop:2}}>{r.teacher} · {r.date}</div></div>
              </div>
            )):<Empty icon="📝" title="لا توجد ملاحظات بعد"/>}
          </div>
        </WG>
      </div>
      <WG>
        <WH t="تقدم الأجزاء"/>
        <div className="wb">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(86px,1fr))",gap:8}}>
            {Array.from({length:30},(_,i)=>{
              const done=i<Math.floor(STUDENT.quranProgress/(100/30));
              return<div key={i} style={{background:done?"var(--g100)":"var(--n100)",border:`1px solid ${done?"var(--g200)":"var(--n200)"}`,borderRadius:8,padding:"7px 4px",textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:800,color:done?"var(--g700)":"var(--n400)"}}>جزء {i+1}</div>
                {done&&<div style={{fontSize:9,color:"var(--g600)",marginTop:2}}>✓ مكتمل</div>}
              </div>;
            })}
          </div>
        </div>
      </WG>
    </div>
  );
}

// ─── BADGES FULL PAGE ─────────────────────────
function BadgesFullPage(){
  const earned=BADGES.filter(b=>b.earned);
  return(
    <div className="page-body">
      <WG>
        <WH t="أوسمتي" right={<Chip bg="var(--g100)"col="var(--g700)">{earned.length}/{BADGES.length}</Chip>}/>
        <div className="wb">
          <PBar pct={(earned.length/BADGES.length)*100} h={8} color="linear-gradient(90deg,var(--g300),var(--g500))"/>
          <div style={{fontSize:12,color:"var(--n400)",marginTop:6,marginBottom:16}}>{earned.length} من {BADGES.length} وسام مكتسب</div>
          <div className="badges-full-grid">
            {BADGES.map(b=>(
              <div key={b.id} className={`bfc${b.earned?" earned":""}`}>
                <div className="bfc-ico" style={{background:b.earned?b.color:"var(--n100)"}}>
                  <span style={{fontSize:36,filter:b.earned?"none":"grayscale(1) opacity(.3)"}}>{b.icon}</span>
                  {b.earned&&<div className="bfc-ck">{Ic.check}</div>}
                  {!b.earned&&<div className="bfc-lock">🔒</div>}
                </div>
                <div style={{fontSize:12,fontWeight:800,color:b.earned?"var(--n900)":"var(--n400)"}}>{b.name}</div>
                <div style={{fontSize:11,color:"var(--n400)",lineHeight:1.5,textAlign:"center"}}>{b.desc}</div>
                {b.earned&&b.earnedDate&&<div style={{fontSize:10,color:"var(--g600)",fontWeight:700}}>✓ {b.earnedDate}</div>}
              </div>
            ))}
          </div>
        </div>
      </WG>
    </div>
  );
}

// ─── CENTERS PAGE ─────────────────────────────
function CentersPage(){
  return(
    <div className="page-body">
      <WG>
        <WH t="المجمع الخاص بك"/>
        <div className="wb">
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:18}}>
            <div style={{width:48,height:48,borderRadius:12,background:"var(--g100)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🕌</div>
            <div><div style={{fontSize:16,fontWeight:800,color:"var(--n900)",marginBottom:4}}>{CENTER.name}</div><div style={{fontSize:12.5,color:"var(--n500)",lineHeight:1.65}}>{CENTER.desc}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            {[{l:"الطلاب",v:CENTER.students,e:"👤"},{l:"المعلمين",v:CENTER.teachers,e:"🎓"},{l:"الحلقات",v:CENTER.circles,e:"🔵"},{l:"الخطط",v:CENTER.plans,e:"📋"},{l:"المساجد",v:CENTER.mosques,e:"🕌"}].map((s,i)=>(
              <div key={i} style={{background:"var(--n50)",border:"1px solid var(--n200)",borderRadius:10,padding:"12px 8px",textAlign:"center"}}><div style={{fontSize:22,marginBottom:5}}>{s.e}</div><div style={{fontSize:20,fontWeight:900,color:"var(--n900)"}}>{s.v}</div><div style={{fontSize:11,color:"var(--n400)",fontWeight:600}}>{s.l}</div></div>
            ))}
          </div>
        </div>
      </WG>
    </div>
  );
}

// ─── ATTENDANCE PAGE ──────────────────────────
function AttPage(){
  const pres=ATT.filter(a=>a.status==="حاضر").length;
  const abs=ATT.filter(a=>a.status==="غائب").length;
  const late=ATT.filter(a=>a.status==="متأخر").length;
  const rate=Math.round((pres/ATT.length)*100);
  return(
    <div className="page-body">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[{l:"حاضر",v:pres,c:"var(--g600)"},{l:"غائب",v:abs,c:"var(--red)"},{l:"متأخر",v:late,c:"var(--amber)"},{l:"نسبة الحضور",v:rate+"%",c:"var(--n900)"}].map((s,i)=>(
          <div key={i} style={{background:"var(--n0)",border:"1px solid var(--n200)",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontSize:26,fontWeight:900,color:s.c,lineHeight:1,marginBottom:4}}>{s.v}</div><div style={{fontSize:11,color:"var(--n400)",fontWeight:600}}>{s.l}</div></div>
        ))}
      </div>
      <WG>
        <WH t="سجل الحضور والغياب"/>
        <div style={{overflowX:"auto"}}><table className="dt"><thead><tr><th>التاريخ</th><th>الحلقة</th><th>الحالة</th></tr></thead><tbody>{ATT.map(a=><tr key={a.id}><td style={{fontSize:12,color:"var(--n400)"}}>{a.date}</td><td style={{fontSize:12}}>{a.session}</td><td><AttB s={a.status}/></td></tr>)}</tbody></table></div>
      </WG>
    </div>
  );
}

// ─── RECITATION PAGE ──────────────────────────
function RecPage(){
  return(
    <div className="page-body">
      <WG>
        <WH t="سجل التسميع" right={<Chip bg="var(--g100)"col="var(--g700)">{RECS.length} جلسة</Chip>}/>
        {RECS.length>0?<div style={{overflowX:"auto"}}><table className="dt"><thead><tr><th>التاريخ</th><th>السورة</th><th>من</th><th>إلى</th><th>التقييم</th><th>ملاحظات المعلم</th></tr></thead><tbody>{RECS.map(r=><tr key={r.id}><td style={{fontSize:11.5,color:"var(--n400)"}}>{r.date}</td><td style={{fontWeight:700}}>{r.surah}</td><td>{r.from}</td><td>{r.to}</td><td><Chip bg={r.grade==="ممتاز"?"var(--g100)":r.grade==="جيد جداً"?"#dbeafe":"#fef3c7"} col={r.grade==="ممتاز"?"var(--g700)":r.grade==="جيد جداً"?"#1d4ed8":"#92400e"}>{r.grade}</Chip></td><td style={{fontSize:12,color:"var(--n500)"}}>{r.note||"—"}</td></tr>)}</tbody></table></div>:<div className="wb"><Empty icon="🎙️" title="لا توجد جلسات بعد" sub="ستظهر هنا بعد بدء الحلقة"/></div>}
      </WG>
    </div>
  );
}

// ─── CERTIFICATES PAGE ────────────────────────
function CertPage(){
  const notes=RECS.filter(r=>r.note);
  return(
    <div className="page-body">
      <WG><WH t="شهاداتي"/><div className="wb"><Empty icon="🎓" title="لا توجد شهادات بعد" sub="أكمل خطتك الدراسية للحصول على شهادة"/></div></WG>
      <WG><WH t="ملاحظات المعلمين"/>
        <div className="wb">
          {notes.length>0?notes.map(r=><div key={r.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid var(--n100)"}}><div style={{width:7,height:7,borderRadius:"50%",background:"var(--g400)",flexShrink:0,marginTop:5}}/><div><div style={{fontSize:13,fontWeight:600,color:"var(--n800)"}}>{r.note}</div><div style={{fontSize:11,color:"var(--n400)",marginTop:2}}>{r.teacher} · {r.date}</div></div></div>):<Empty icon="📝" title="لا توجد ملاحظات"/>}
        </div>
      </WG>
    </div>
  );
}

// ════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════
export default function StudentDashboard(){
  const[page,setPage]=useState<Page>("dashboard");
  const[mobileOpen,setMobileOpen]=useState(false);
  const[userMenu,setUserMenu]=useState(false);
  const[badgesPage,setBadgesPage]=useState(false);
  const[toast,setToast]=useState<string|null>(null);

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(null),3000);};
  const navTo=(p:Page)=>{setPage(p);setMobileOpen(false);setBadgesPage(false);};

  const NAV=[
    {id:"dashboard"as Page,l:"لوحة التحكم",ic:Ic.grid},
    {id:"plan"as Page,l:"الخطة",ic:Ic.book},
    {id:"progress"as Page,l:"مستوى التقدم",ic:Ic.trend},
    {id:"centers"as Page,l:"المجمعات",ic:Ic.mosque},
    {id:"recitation"as Page,l:"سجل التسميع",ic:Ic.mic},
    {id:"attendance"as Page,l:"الحضور والغياب",ic:Ic.cal},
    {id:"certificates"as Page,l:"الشهادات والملاحظات",ic:Ic.star},
  ];
  const UM=[{l:"حسابي",ic:Ic.user},{l:"إعدادات",ic:Ic.settings},{l:"جدول",ic:Ic.schedule},{l:"تسجيل الخروج",ic:Ic.logout,d:true}];

  const earned=BADGES.filter(b=>b.earned);
  const title=badgesPage?"أوسمتي":PAGE_LABELS[page];

  return(
    <>
      <style>{CSS}</style>
      <div className="app" dir="rtl">
        {mobileOpen&&<div className="sb-overlay" onClick={()=>setMobileOpen(false)}/>}

        {/* SIDEBAR */}
        <aside className={`sidebar${mobileOpen?" open":""}`}>
          <div className="sb-brand">
            <div className="sb-logo"><svg width={17}height={17}viewBox="0 0 24 24"fill="currentColor"><path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></div>
            <span className="sb-name">إتقان<span>.</span></span>
          </div>
          <div className="sb-user">
            <div className="sb-av">{STUDENT.name[0]}</div>
            <div className="sb-uinfo"><div className="sb-uname">{STUDENT.name}</div><div className="sb-urole">طالب · مجمع الجامع</div></div>
            <span className="sb-prog">{STUDENT.progress}%</span>
          </div>
          <div className="sb-um">{UM.map((i,idx)=><button key={idx} className={`sb-um-btn${i.d?" danger":""}`}>{i.ic}{i.l}</button>)}</div>
          <div className="sb-sep"/>
          <nav className="sb-nav">
            {NAV.map(n=><button key={n.id} className={`sb-item${page===n.id&&!badgesPage&&page!=="session"?" on":""}`} onClick={()=>navTo(n.id)}><span className="sb-ico">{n.ic}</span><span>{n.l}</span></button>)}
          </nav>
          <div style={{padding:"6px 8px 12px"}}>
            <button className={`badges-sc${badgesPage?" on":""}`} onClick={()=>{setBadgesPage(true);setMobileOpen(false);}}>
              <span>🏅</span><span>أوسمتي</span><span className="bs-badge">{earned.length}/{BADGES.length}</span>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <button className="ham" onClick={()=>setMobileOpen(p=>!p)}>{Ic.menu}</button>
            <div className="tb-title">{title}</div>
            <div style={{position:"relative"}}>
              <button className="uc" onClick={()=>setUserMenu(p=>!p)}>
                <div className="uc-av">{STUDENT.name[0]}</div>
                <span className="uc-name">{STUDENT.name.split(" ").slice(0,2).join(" ")}</span>
              </button>
              {userMenu&&<div className="dd" onClick={()=>setUserMenu(false)}>{UM.map((i,idx)=><button key={idx} className={`dd-item${i.d?" danger":""}`}>{i.ic}{i.l}</button>)}</div>}
            </div>
          </div>

          <div className="content" key={page+(badgesPage?"-b":"")}>
            {page==="session"&&<SessionRoom s={NEXT_SESSION} onBack={()=>setPage("dashboard")}/>}
            {page!=="session"&&badgesPage&&<BadgesFullPage/>}
            {page!=="session"&&!badgesPage&&<>
              {page==="dashboard"&&<DashPage onEnterSession={()=>setPage("session")} onBadges={()=>setBadgesPage(true)}/>}
              {page==="plan"&&<PlanPage/>}
              {page==="progress"&&<ProgressPage/>}
              {page==="centers"&&<CentersPage/>}
              {page==="recitation"&&<RecPage/>}
              {page==="attendance"&&<AttPage/>}
              {page==="certificates"&&<CertPage/>}
            </>}
          </div>
        </div>

        {toast&&<div className="toast">{Ic.check}{toast}</div>}
      </div>
    </>
  );
}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
:root{
  --g50:#f0faf5;--g100:#d6f0e3;--g200:#a8dfc5;--g300:#6cc49f;
  --g400:#38a879;--g500:#1e8f61;--g600:#15724e;--g700:#0f5439;
  --n0:#fff;--n50:#f8fafc;--n100:#f1f5f9;--n200:#e2e8f0;
  --n300:#cbd5e1;--n400:#94a3b8;--n500:#64748b;--n600:#475569;
  --n700:#334155;--n800:#1e293b;--n900:#0f172a;--n950:#060f1e;
  --red:#ef4444;--amber:#f59e0b;--blue:#3b82f6;--sw:232px;
}
body,#root{font-family:'Tajawal',sans-serif;background:var(--n50);height:100vh;overflow:hidden;}
.app{display:flex;height:100vh;}
.sidebar{width:var(--sw);flex-shrink:0;background:var(--n950);display:flex;flex-direction:column;height:100vh;overflow-y:auto;overflow-x:hidden;z-index:100;transition:transform .28s ease;scrollbar-width:none;}
.sidebar::-webkit-scrollbar{display:none;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.sb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:90;}
.sb-brand{display:flex;align-items:center;gap:9px;padding:14px 12px;border-bottom:1px solid rgba(255,255,255,.07);}
.sb-logo{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--g400),var(--g700));display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.sb-name{font-size:17px;font-weight:900;color:#fff;}.sb-name span{color:var(--g400);}
.sb-user{display:flex;align-items:center;gap:9px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.07);}
.sb-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--g400),var(--g600));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0;}
.sb-uinfo{flex:1;min-width:0;}.sb-uname{font-size:11.5px;font-weight:700;color:rgba(255,255,255,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.sb-urole{font-size:9.5px;color:rgba(255,255,255,.32);}
.sb-prog{font-size:11px;font-weight:800;color:var(--g300);flex-shrink:0;}
.sb-um{padding:5px 6px 2px;display:flex;flex-direction:column;gap:1px;}
.sb-um-btn{display:flex;align-items:center;gap:8px;padding:6px 9px;border-radius:7px;border:none;background:transparent;cursor:pointer;color:rgba(255,255,255,.35);font-size:11px;font-weight:600;font-family:'Tajawal',sans-serif;width:100%;text-align:right;transition:.13s;}
.sb-um-btn:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.65);}.sb-um-btn.danger:hover{color:#fca5a5;}
.sb-sep{height:1px;background:rgba(255,255,255,.07);margin:3px 0;flex-shrink:0;}
.sb-nav{padding:4px 6px;display:flex;flex-direction:column;gap:1px;}
.sb-item{display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:8px;border:none;background:transparent;cursor:pointer;color:rgba(255,255,255,.42);font-size:12px;font-weight:600;font-family:'Tajawal',sans-serif;width:100%;text-align:right;transition:.14s;position:relative;}
.sb-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.78);}
.sb-item.on{background:rgba(30,143,97,.22);color:var(--g300);}
.sb-item.on::before{content:'';position:absolute;right:0;top:24%;bottom:24%;width:3px;background:var(--g400);border-radius:3px 0 0 3px;}
.sb-ico{width:15px;height:15px;display:flex;align-items:center;flex-shrink:0;}
.badges-sc{display:flex;align-items:center;gap:7px;width:100%;padding:8px 9px;border-radius:8px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);cursor:pointer;font-size:11.5px;font-weight:700;color:rgba(255,255,255,.55);font-family:'Tajawal',sans-serif;transition:.14s;}
.badges-sc:hover{background:rgba(255,255,255,.07);color:#fff;}.badges-sc.on{border-color:var(--g600);background:rgba(30,143,97,.18);color:var(--g300);}
.bs-badge{margin-right:auto;font-size:10px;background:rgba(255,255,255,.08);padding:1px 7px;border-radius:100px;color:rgba(255,255,255,.4);}
.topbar{height:54px;background:var(--n0);border-bottom:1px solid var(--n200);display:flex;align-items:center;gap:10px;padding:0 16px;flex-shrink:0;}
.ham{display:none;background:none;border:none;cursor:pointer;color:var(--n600);padding:6px;border-radius:8px;}.ham:hover{background:var(--n100);}
.tb-title{flex:1;font-size:15px;font-weight:800;color:var(--n900);}
.uc{display:flex;align-items:center;gap:8px;background:var(--n50);border:1.5px solid var(--n200);border-radius:100px;padding:4px 13px 4px 5px;cursor:pointer;transition:.15s;}.uc:hover{border-color:var(--g300);background:var(--g50);}
.uc-av{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--g400),var(--g600));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;}
.uc-name{font-size:12px;font-weight:700;color:var(--n700);}
.dd{position:absolute;top:calc(100% + 6px);left:0;background:var(--n0);border:1px solid var(--n200);border-radius:12px;padding:5px;min-width:155px;box-shadow:0 8px 24px rgba(0,0,0,.1);z-index:200;animation:dIn .18s ease;}
@keyframes dIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.dd-item{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;color:var(--n700);font-family:'Tajawal',sans-serif;border-radius:7px;text-align:right;transition:.12s;}.dd-item:hover{background:var(--n50);}.dd-item.danger{color:var(--red);}.dd-item.danger:hover{background:#fef2f2;}
.content{flex:1;overflow-y:auto;padding:16px;animation:pgIn .22s ease;}
@keyframes pgIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.page-body{display:flex;flex-direction:column;gap:14px;}
.widget{background:var(--n0);border:1px solid var(--n200);border-radius:14px;overflow:hidden;}
.wh{padding:11px 15px;border-bottom:1px solid var(--n100);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.wh-t{font-size:13px;font-weight:800;color:var(--n900);}
.wb{padding:14px 15px;}
.pill-btn{background:var(--g100);color:var(--g700);border:1px solid var(--g200);cursor:pointer;border-radius:100px;padding:4px 12px;font-size:11px;font-weight:700;font-family:'Tajawal',sans-serif;transition:.14s;white-space:nowrap;}.pill-btn:hover{background:var(--g200);}
/* WELCOME */
.welcome-card{background:linear-gradient(135deg,var(--n950),#0a2818);border-radius:16px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;}
.wc-left{display:flex;align-items:center;gap:12px;}
.wc-av{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--g400),var(--g600));display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;flex-shrink:0;}
.wc-name{font-size:14px;font-weight:800;color:#fff;}.wc-email{font-size:10px;color:rgba(255,255,255,.32);margin-top:2px;}
.wc-stats{display:flex;gap:18px;}.wc-stat{text-align:center;}.wc-snum{font-size:18px;font-weight:900;color:var(--g300);line-height:1;}.wc-slbl{font-size:10px;color:rgba(255,255,255,.4);margin-top:2px;font-weight:600;}
/* SESSION CARD */
.sc{background:var(--n0);border:1px solid var(--n200);border-radius:16px;overflow:hidden;}
.sc-strip{background:linear-gradient(135deg,var(--n900),#0a2818);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;}
.sc-live-badge{display:flex;align-items:center;gap:7px;color:var(--g300);font-size:12px;font-weight:700;}
.sc-live-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.25);animation:pulse-dot 2s infinite;}
@keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.4)}50%{box-shadow:0 0 0 5px transparent}}
.sc-body{padding:16px;}
.sc-teacher{display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--n100);}
.sc-tav{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--g400),var(--g700));display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;box-shadow:0 4px 16px rgba(30,143,97,.3);}
.sc-tinit{font-size:22px;font-weight:900;color:#fff;}
.sc-online{position:absolute;bottom:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#4ade80;border:2px solid var(--n0);}
.sc-tname{font-size:14px;font-weight:800;color:var(--n900);}.sc-ttitle{font-size:11px;color:var(--n400);margin-top:2px;}
.sc-subject{margin-bottom:16px;}.sc-slbl{font-size:10.5px;font-weight:700;color:var(--n400);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;}.sc-sval{font-size:14px;font-weight:800;color:var(--n900);margin-bottom:4px;}
.sc-acts{display:flex;align-items:center;gap:9px;flex-wrap:wrap;}
.attend-now{display:flex;align-items:center;gap:7px;padding:9px 18px;background:var(--g500);color:#fff;border:none;cursor:pointer;border-radius:9px;font-size:12.5px;font-weight:800;font-family:'Tajawal',sans-serif;transition:.18s;box-shadow:0 3px 10px rgba(30,143,97,.25);}.attend-now:hover{background:var(--g600);transform:translateY(-1px);}
.attended-ok{display:flex;align-items:center;gap:7px;padding:9px 16px;background:var(--g50);color:var(--g700);border:1.5px solid var(--g200);border-radius:9px;font-size:12.5px;font-weight:800;}
.enter-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;background:var(--n900);color:#fff;border:none;cursor:pointer;border-radius:9px;font-size:12.5px;font-weight:800;font-family:'Tajawal',sans-serif;transition:.18s;}.enter-btn:hover{background:#000;transform:translateY(-1px);}
.copy-btn{display:flex;align-items:center;gap:6px;padding:9px 14px;background:var(--n100);color:var(--n600);border:1px solid var(--n200);cursor:pointer;border-radius:9px;font-size:12px;font-weight:700;font-family:'Tajawal',sans-serif;transition:.15s;margin-right:auto;}.copy-btn:hover{background:var(--n200);}
/* BADGES */
.badges-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;}
.badge-item{display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;transition:.15s;}.badge-item:hover{transform:translateY(-2px);}
.badge-ico{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;position:relative;border:1.5px solid rgba(0,0,0,.06);}
.badge-item.locked .badge-ico{border-color:var(--n200);}
.badge-ck{position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:var(--g500);display:flex;align-items:center;justify-content:center;color:#fff;border:2px solid var(--n0);}
.badge-lbl{font-size:10px;font-weight:700;color:var(--n600);white-space:nowrap;max-width:58px;overflow:hidden;text-overflow:ellipsis;text-align:center;}.badge-item.locked .badge-lbl{color:var(--n300);}
/* BADGES FULL */
.badges-full-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;}
.bfc{border:1.5px solid var(--n200);border-radius:14px;padding:16px 12px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;transition:.18s;cursor:pointer;}
.bfc.earned{border-color:transparent;box-shadow:0 2px 12px rgba(0,0,0,.07);}.bfc:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(0,0,0,.09);}
.bfc-ico{width:72px;height:72px;border-radius:18px;display:flex;align-items:center;justify-content:center;position:relative;}
.bfc-ck{position:absolute;top:-5px;right:-5px;width:20px;height:20px;border-radius:50%;background:var(--g500);display:flex;align-items:center;justify-content:center;color:#fff;border:2px solid var(--n0);}
.bfc-lock{position:absolute;bottom:-4px;right:-4px;font-size:14px;}
/* GRID */
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
/* PLAN */
.plan-card{display:flex;align-items:center;gap:12px;border:1.5px solid var(--n200);border-radius:12px;padding:13px;margin-bottom:10px;transition:.15s;}.plan-card:last-child{margin-bottom:0;}.plan-card:hover{border-color:var(--g300);background:var(--g50);}
.pc-name{font-size:13px;font-weight:800;color:var(--n900);margin-bottom:3px;}.pc-meta{font-size:11.5px;color:var(--n400);}
.book-btn{background:linear-gradient(135deg,var(--g500),var(--g600));color:#fff;border:none;cursor:pointer;border-radius:8px;padding:7px 16px;font-size:12px;font-weight:700;font-family:'Tajawal',sans-serif;transition:.15s;white-space:nowrap;flex-shrink:0;}.book-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(30,143,97,.3);}
.pager{padding:10px 15px;border-top:1px solid var(--n100);display:flex;align-items:center;justify-content:space-between;background:var(--n50);}
.pgr-btn{padding:5px 11px;border:1px solid var(--n200);border-radius:7px;background:var(--n0);cursor:pointer;font-size:12px;font-weight:700;color:var(--n600);font-family:'Tajawal',sans-serif;transition:.14px;}.pgr-btn:disabled{opacity:.4;cursor:not-allowed;}
/* TABLE */
.dt{width:100%;border-collapse:collapse;}.dt thead{background:var(--n50);}.dt th{text-align:right;padding:8px 14px;font-size:10px;font-weight:700;color:var(--n400);border-bottom:1.5px solid var(--n200);white-space:nowrap;text-transform:uppercase;letter-spacing:.4px;}.dt td{padding:10px 14px;border-bottom:1px solid var(--n100);font-size:12.5px;color:var(--n700);vertical-align:middle;}.dt tr:last-child td{border-bottom:none;}.dt tr:hover td{background:rgba(56,168,121,.03);}
/* BADGE TABLE */
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:700;white-space:nowrap;}
.badge-g{background:var(--g100);color:var(--g700);}.badge-r{background:#fee2e2;color:#991b1b;}.badge-a{background:#fef3c7;color:#92400e;}
/* EMPTY */
.empty-state{text-align:center;padding:28px 12px;display:flex;flex-direction:column;align-items:center;gap:8px;}
/* SESSION ROOM */
.back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid var(--n200);cursor:pointer;border-radius:8px;padding:7px 13px;font-size:12px;font-weight:700;color:var(--n600);font-family:'Tajawal',sans-serif;transition:.14s;align-self:flex-start;}.back-btn:hover{background:var(--n100);}
.video-room{background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;}
.vr-header{padding:12px 16px;background:#0a0f1e;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1e293b;}
.vr-main{position:relative;height:350px;background:#060d1a;display:flex;align-items:center;justify-content:center;}
.teacher-cam{display:flex;flex-direction:column;align-items:center;gap:12px;}
.teacher-cam-ring{width:130px;height:130px;border-radius:50%;background:linear-gradient(135deg,rgba(56,168,121,.3),rgba(15,84,57,.3));padding:4px;display:flex;align-items:center;justify-content:center;}
.teacher-cam-av{width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,var(--g500),var(--g700));display:flex;align-items:center;justify-content:center;overflow:hidden;}
.teacher-cam-name{font-size:13px;font-weight:700;color:rgba(255,255,255,.8);}
.cam-live{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.07);padding:4px 12px;border-radius:100px;font-size:11px;color:rgba(255,255,255,.6);}
.live-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulse-dot 2s infinite;}
.student-pip{position:absolute;bottom:12px;left:12px;width:80px;height:80px;background:#1e293b;border-radius:12px;border:1.5px solid rgba(255,255,255,.1);display:flex;flex-direction:column;align-items:center;justify-content:center;}
.vr-controls{padding:12px 16px;background:#0a0f1e;display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid #1e293b;}
.vr-attend-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;background:var(--g500);color:#fff;border:none;cursor:pointer;border-radius:8px;font-size:12px;font-weight:700;font-family:'Tajawal',sans-serif;transition:.15s;}.vr-attend-btn:hover{background:var(--g600);}
.vr-attended{display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(30,143,97,.2);color:var(--g300);border-radius:8px;font-size:12px;font-weight:700;}
.vr-rec-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.1);cursor:pointer;border-radius:8px;font-size:12px;font-weight:700;font-family:'Tajawal',sans-serif;transition:.15px;}.vr-rec-btn:hover{background:rgba(255,255,255,.12);}.vr-rec-btn.active{background:rgba(239,68,68,.15);color:#fca5a5;border-color:rgba(239,68,68,.3);}
.rec-timer{font-size:10px;font-weight:900;background:rgba(239,68,68,.25);padding:1px 7px;border-radius:100px;margin-right:3px;}
.vr-copy-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.08);cursor:pointer;border-radius:8px;font-size:12px;font-weight:700;font-family:'Tajawal',sans-serif;transition:.15s;}.vr-copy-btn:hover{background:rgba(255,255,255,.1);}
.session-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.st-av-big{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--g400),var(--g700));display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;flex-shrink:0;}
.url-row{display:flex;align-items:center;gap:8px;margin-top:12px;background:var(--n50);border:1px solid var(--n200);border-radius:9px;padding:8px 12px;}
.url-copy-btn{background:none;border:none;cursor:pointer;color:var(--n400);display:flex;padding:2px;transition:.14s;flex-shrink:0;}.url-copy-btn:hover{color:var(--g600);}
.rec-status-box{display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;border:1.5px solid var(--n200);background:var(--n50);}.rec-status-box.rec-active{border-color:rgba(239,68,68,.3);background:#fef2f2;}
.rec-red-dot{width:10px;height:10px;border-radius:50%;background:var(--red);flex-shrink:0;animation:rpulse 1s infinite;}
@keyframes rpulse{0%,100%{opacity:1}50%{opacity:.5}}
.rec-idle-ico{color:var(--n400);display:flex;}
.stop-btn,.start-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:7px;border:none;cursor:pointer;font-size:11.5px;font-weight:700;font-family:'Tajawal',sans-serif;margin-right:auto;white-space:nowrap;transition:.15s;}
.stop-btn{background:#fee2e2;color:var(--red);}.stop-btn:hover{background:#fecaca;}.start-btn{background:var(--n900);color:#fff;}.start-btn:hover{background:#000;}
/* TOAST */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--g700);color:#fff;padding:10px 18px;border-radius:14px;font-size:12.5px;font-weight:700;display:flex;align-items:center;gap:8px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:5000;animation:tIn .25s ease;font-family:'Tajawal',sans-serif;white-space:nowrap;}
@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
/* RESPONSIVE */
@media(max-width:960px){
  .sidebar{position:fixed;right:0;top:0;height:100vh;transform:translateX(100%);z-index:100;}.sidebar.open{transform:translateX(0);}
  .ham{display:flex;align-items:center;justify-content:center;}
  .grid3{grid-template-columns:1fr 1fr;}.grid2{grid-template-columns:1fr;}
  .session-info-grid{grid-template-columns:1fr;}
}
@media(max-width:600px){
  .welcome-card{flex-direction:column;align-items:flex-start;}.wc-stats{width:100%;justify-content:space-between;}
  .grid3{grid-template-columns:1fr;}.sc-acts{flex-direction:column;align-items:stretch;}.copy-btn{margin-right:0;}
  .content{padding:10px;}.vr-main{height:250px;}
}
`;
