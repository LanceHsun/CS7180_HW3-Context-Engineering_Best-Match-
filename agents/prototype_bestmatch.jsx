import { useState } from "react";

const skills = ["React", "TypeScript", "Node.js", "Python", "AWS", "PostgreSQL", "REST API", "Agile"];
const mockJobs = [
  { title: "Senior Frontend Engineer", company: "Stripe", score: 94 },
  { title: "Full Stack Developer", company: "Linear", score: 89 },
  { title: "Software Engineer II", company: "Notion", score: 85 },
  { title: "React Developer", company: "Vercel", score: 81 },
  { title: "Product Engineer", company: "Loom", score: 77 },
];

const C = {
  bg:       "#f8fafc",
  surface:  "#ffffff",
  border:   "#e2e8f0",
  borderMd: "#cbd5e1",
  text:     "#0f172a",
  textSub:  "#475569",
  textMuted:"#94a3b8",
  accent:   "#0ea5e9",
  green:    "#10b981",
  greenBg:  "rgba(16,185,129,0.08)",
  greenBdr: "rgba(16,185,129,0.25)",
  blueBg:   "rgba(14,165,233,0.08)",
  blueBdr:  "rgba(14,165,233,0.25)",
  amber:    "#f59e0b",
};

function ScanLine() {
  return (
    <div style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden", borderRadius:10 }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#e0f2fe,#f0fdf4)", borderRadius:10 }} />
      <div style={{
        position:"absolute", left:0, right:0, height:2,
        background:`linear-gradient(90deg,transparent,${C.accent},transparent)`,
        animation:"scan 1.8s ease-in-out infinite",
        boxShadow:`0 0 12px ${C.accent}88`,
      }} />
      {[...Array(6)].map((_,i) => (
        <div key={i} style={{ position:"absolute", left:0, right:0, height:1, top:`${(i+1)*14}%`, background:"rgba(14,165,233,0.12)" }} />
      ))}
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
        <div style={{ color:C.accent, fontSize:12, fontFamily:"'Space Mono',monospace", letterSpacing:2, fontWeight:700 }}>PARSING RESUME</div>
        <div style={{ display:"flex", gap:5 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.accent, animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score>=90 ? C.green : score>=80 ? C.accent : C.amber;
  const bg    = score>=90 ? "rgba(16,185,129,0.1)" : score>=80 ? "rgba(14,165,233,0.1)" : "rgba(245,158,11,0.1)";
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:bg, border:`1px solid ${color}44`, borderRadius:20, padding:"3px 10px" }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:color }} />
      <span style={{ fontSize:12, fontWeight:700, color, fontFamily:"'Space Mono',monospace" }}>{score}%</span>
    </div>
  );
}

function Logo({ size=28 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:8, background:`linear-gradient(135deg,${C.accent},${C.green})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontSize:size*0.5, fontWeight:800, color:"#fff" }}>B</span>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span style={{ padding:"3px 10px", borderRadius:6, background:C.blueBg, border:`1px solid ${C.blueBdr}`, fontSize:12, color:C.accent, fontWeight:500 }}>{children}</span>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", ...style }}>{children}</div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:C.textMuted, fontFamily:"'Space Mono',monospace", marginBottom:16 }}>{children}</div>;
}

export default function BestMatch() {
  const [page,             setPage]             = useState("onboarding");
  const [dragOver,         setDragOver]         = useState(false);
  const [scanning,         setScanning]         = useState(false);
  const [parsed,           setParsed]           = useState(false);
  const [email,            setEmail]            = useState("");
  const [signinEmail,      setSigninEmail]      = useState("");
  const [magicSent,        setMagicSent]        = useState(false);
  const [showToast,        setShowToast]        = useState(false);
  const [notifFreq,        setNotifFreq]        = useState("weekly");
  const [locations,        setLocations]        = useState(["San Jose","Remote"]);
  const [newLoc,           setNewLoc]           = useState("");
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  const simulateParse = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setParsed(true); }, 2800);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); simulateParse(); };

  const addLocation = (e) => {
    if (e.key==="Enter" && newLoc.trim()) { setLocations([...locations, newLoc.trim()]); setNewLoc(""); }
  };

  const inputStyle = {
    width:"100%", padding:"10px 14px",
    background:C.bg, border:`1px solid ${C.borderMd}`,
    borderRadius:8, color:C.text, fontSize:14, fontFamily:"'DM Sans',sans-serif",
  };

  const btnPrimary = {
    width:"100%", padding:"12px",
    background:`linear-gradient(135deg,${C.accent},${C.green})`,
    borderRadius:8, fontWeight:700, fontSize:15,
    color:"#fff", letterSpacing:-0.3, cursor:"pointer", border:"none",
  };

  const navTab = (label, target) => (
    <button
      key={target}
      onClick={() => setPage(target)}
      style={{
        padding:"6px 14px", borderRadius:6, fontSize:13, fontWeight:500,
        background: page===target ? C.blueBg : "transparent",
        border: page===target ? `1px solid ${C.blueBdr}` : "1px solid transparent",
        color: page===target ? C.accent : C.textMuted,
        cursor:"pointer",
      }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        @keyframes scan      { 0%,100%{top:8%}  50%{top:84%} }
        @keyframes pulse     { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        * { box-sizing:border-box; margin:0; padding:0; }
        input  { outline:none; }
        button { cursor:pointer; border:none; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:50,
        background:"rgba(248,250,252,0.92)", backdropFilter:"blur(12px)",
        borderBottom:`1px solid ${C.border}`,
        padding:"0 32px", height:58,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <Logo />
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:15, fontWeight:700, color:C.text, letterSpacing:-0.5 }}>BestMatch</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {navTab("Onboarding","onboarding")}
          {navTab("Sign In","signin")}
          {navTab("Dashboard","dashboard")}
        </div>
      </nav>

      {/* ══ ONBOARDING ══ */}
      {page==="onboarding" && (
        <div style={{ maxWidth:640, margin:"0 auto", padding:"72px 24px 96px" }}>
          {/* Hero */}
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, background:C.blueBg, border:`1px solid ${C.blueBdr}`, fontSize:11, fontFamily:"'Space Mono',monospace", color:C.accent, letterSpacing:2, marginBottom:22 }}>
              AI-POWERED JOB MATCHING
            </div>
            <h1 style={{ fontSize:44, fontWeight:700, lineHeight:1.13, letterSpacing:-1.5, color:C.text, marginBottom:16 }}>
              Upload your resume.<br />
              <span style={{ background:`linear-gradient(90deg,${C.accent},${C.green})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                We'll handle the rest.
              </span>
            </h1>
            <p style={{ fontSize:17, color:C.textSub, lineHeight:1.65, maxWidth:460, margin:"0 auto" }}>
              Our AI continuously scans thousands of job postings and delivers your best-matched roles straight to your inbox — daily or weekly.
            </p>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={handleDrop}
            onClick={()=>!scanning&&!parsed&&simulateParse()}
            style={{
              border:`2px dashed ${dragOver?C.accent:scanning||parsed?C.accent+"55":C.borderMd}`,
              borderRadius:14, height:190,
              background:dragOver?C.blueBg:C.surface,
              transition:"all 0.2s", cursor:scanning?"default":"pointer",
              position:"relative", overflow:"hidden",
              boxShadow:dragOver?`0 0 0 4px ${C.accent}18`:"none",
            }}>
            {!scanning&&!parsed&&(
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
                <div style={{ width:52, height:52, borderRadius:12, background:C.blueBg, border:`1px solid ${C.blueBdr}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📄</div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:15, color:C.textSub, fontWeight:500 }}>
                    Drag &amp; drop your PDF resume, or <span style={{ color:C.accent, fontWeight:600 }}>click to upload</span>
                  </div>
                  <div style={{ fontSize:12, color:C.textMuted, marginTop:5 }}>PDF only · Max 10 MB</div>
                </div>
              </div>
            )}
            {scanning && <ScanLine />}
            {!scanning&&parsed&&(
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
                <div style={{ fontSize:28 }}>✅</div>
                <div style={{ fontSize:14, color:C.green, fontWeight:600 }}>Parsed — resume_2025.pdf</div>
              </div>
            )}
          </div>

          {/* Parsed panel */}
          {parsed && (
            <div style={{ animation:"slideDown 0.4s ease", marginTop:22 }}>
              <Card>
                <SectionLabel>AI EXTRACTION RESULTS</SectionLabel>

                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:12, color:C.textSub, display:"block", marginBottom:6, fontWeight:500 }}>Target Role</label>
                  <input defaultValue="Senior Software Engineer" style={inputStyle} />
                </div>

                <div style={{ marginBottom:26 }}>
                  <label style={{ fontSize:12, color:C.textSub, display:"block", marginBottom:8, fontWeight:500 }}>Detected Skills</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {skills.map(s=><Pill key={s}>{s}</Pill>)}
                  </div>
                </div>

                <div style={{ height:1, background:C.border, marginBottom:24 }} />

                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, color:C.textSub, display:"block", marginBottom:6, fontWeight:500 }}>Email Address</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} />
                </div>
                <button style={btnPrimary} onClick={()=>{
                  setShowToast(true);
                  setTimeout(()=>{ setShowToast(false); setPage("dashboard"); }, 2200);
                }}>
                  Start Receiving Matches →
                </button>
                <p style={{ fontSize:12, color:C.textMuted, textAlign:"center", marginTop:12 }}>
                  Already have an account?{" "}
                  <span onClick={()=>setPage("signin")} style={{ color:C.accent, fontWeight:600, cursor:"pointer", textDecoration:"underline" }}>
                    Sign in here
                  </span>
                </p>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ══ SIGN IN (returning users) ══ */}
      {page==="signin" && (
        <div style={{ maxWidth:440, margin:"0 auto", padding:"96px 24px 80px" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <Logo size={48} />
            <h2 style={{ fontSize:28, fontWeight:700, letterSpacing:-1, marginTop:16, marginBottom:8 }}>Welcome back</h2>
            <p style={{ fontSize:15, color:C.textSub }}>
              Enter your email and we'll send you a Magic Link to sign in instantly.
            </p>
          </div>

          <Card>
            {!magicSent ? (
              <>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, color:C.textSub, display:"block", marginBottom:6, fontWeight:500 }}>Email Address</label>
                  <input type="email" placeholder="you@example.com" value={signinEmail} onChange={e=>setSigninEmail(e.target.value)} style={inputStyle} />
                </div>
                <button style={btnPrimary} onClick={()=>setMagicSent(true)}>Send Magic Link</button>

                <p style={{ fontSize:12, color:C.textMuted, textAlign:"center", marginTop:16 }}>
                  New to BestMatch?{" "}
                  <span onClick={()=>setPage("onboarding")} style={{ color:C.accent, fontWeight:600, cursor:"pointer", textDecoration:"underline" }}>
                    Upload your resume
                  </span>
                </p>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"12px 0" }}>
                <div style={{ fontSize:44, marginBottom:18 }}>📬</div>
                <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:10 }}>Check your inbox</div>
                <p style={{ fontSize:14, color:C.textSub, lineHeight:1.7 }}>
                  We just sent a sign-in link to<br/>
                  <strong style={{ color:C.text }}>{signinEmail||"your email"}</strong>.<br/><br/>
                  Open your inbox and click the link to log in.<br/>
                  <span style={{ fontSize:12, color:C.textMuted }}>The link expires in 15 minutes.</span>
                </p>
                <button onClick={()=>setMagicSent(false)} style={{ marginTop:24, padding:"9px 20px", borderRadius:8, fontSize:13, fontWeight:600, background:"transparent", border:`1px solid ${C.borderMd}`, color:C.textSub }}>
                  Use a different email
                </button>
              </div>
            )}
          </Card>


        </div>
      )}

      {/* ══ DASHBOARD ══ */}
      {page==="dashboard" && (
        <div style={{ maxWidth:1020, margin:"0 auto", padding:"44px 24px 96px" }}>

          {/* Two columns */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

            {/* My Profile */}
            <Card>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <SectionLabel>MY PROFILE</SectionLabel>
                <button onClick={()=>setShowResumeDialog(true)} style={{ padding:"5px 12px", borderRadius:6, fontSize:12, fontWeight:500, background:"transparent", border:`1px solid ${C.borderMd}`, color:C.textSub, cursor:"pointer", marginTop:-14 }}>
                  Update Resume
                </button>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:`linear-gradient(135deg,${C.blueBg},${C.greenBg})`, border:`1px solid ${C.blueBdr}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👤</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:C.text }}>Lance Lin</div>
                  <div style={{ fontSize:12, color:C.textMuted }}>lance@example.com</div>
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, color:C.textSub, fontWeight:500, marginBottom:6 }}>Target Role</div>
                <div style={{ padding:"9px 13px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, color:C.text }}>Senior Software Engineer</div>
              </div>
              <div>
                <div style={{ fontSize:12, color:C.textSub, fontWeight:500, marginBottom:8 }}>Skills on File</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {skills.slice(0,6).map(s=><Pill key={s}>{s}</Pill>)}
                </div>
              </div>
            </Card>

            {/* Preferences */}
            <Card>
              <SectionLabel>PREFERENCES</SectionLabel>
              <div style={{ marginBottom:22 }}>
                <div style={{ fontSize:12, color:C.textSub, fontWeight:500, marginBottom:10 }}>Digest Frequency</div>
                <div style={{ display:"flex", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:3 }}>
                  {["daily","weekly"].map(f=>(
                    <button key={f} onClick={()=>setNotifFreq(f)} style={{
                      flex:1, padding:"8px", borderRadius:6, fontSize:13, fontWeight:600,
                      background:notifFreq===f?C.surface:"transparent",
                      border:notifFreq===f?`1px solid ${C.border}`:"1px solid transparent",
                      color:notifFreq===f?C.accent:C.textMuted,
                      boxShadow:notifFreq===f?"0 1px 3px rgba(0,0,0,0.08)":"none",
                      transition:"all 0.15s",
                    }}>
                      {f==="daily"?"Daily":"Weekly"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:12, color:C.textSub, fontWeight:500, marginBottom:8 }}>Location Filters</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                  {locations.map((loc,i)=>(
                    <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:6, background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.22)", fontSize:12, color:"#6366f1", fontWeight:500 }}>
                      {loc}
                      <span onClick={()=>setLocations(locations.filter((_,idx)=>idx!==i))} style={{ cursor:"pointer", opacity:0.55, fontSize:14, lineHeight:1 }}>×</span>
                    </span>
                  ))}
                </div>
                <input placeholder="Add location, press Enter…" value={newLoc} onChange={e=>setNewLoc(e.target.value)} onKeyDown={addLocation} style={{ ...inputStyle, fontSize:13 }} />
              </div>
              <button style={{ ...btnPrimary, marginTop:20, fontSize:13 }}>Save Preferences</button>
            </Card>
          </div>

          {/* Match History */}
          <Card>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <SectionLabel>MATCH HISTORY</SectionLabel>
              <span style={{ fontSize:12, color:C.textMuted, marginTop:-14 }}>Last 5 delivered jobs</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 160px 100px", padding:"8px 14px", fontSize:11, color:C.textMuted, fontFamily:"'Space Mono',monospace", letterSpacing:1 }}>
                <span>ROLE</span><span>COMPANY</span><span style={{ textAlign:"right" }}>SCORE</span>
              </div>
              {mockJobs.map((job,i)=>(
                <div key={i}
                  style={{ display:"grid", gridTemplateColumns:"1fr 160px 100px", padding:"13px 14px", borderRadius:8, background:i%2===0?C.bg:"transparent", alignItems:"center", cursor:"pointer", transition:"background 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.blueBg}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.bg:"transparent"}>
                  <span style={{ fontSize:14, color:C.text, fontWeight:500 }}>{job.title}</span>
                  <span style={{ fontSize:13, color:C.textSub }}>{job.company}</span>
                  <div style={{ display:"flex", justifyContent:"flex-end" }}><ScoreBadge score={job.score} /></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div style={{
          position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)",
          zIndex:200, animation:"slideDown 0.3s ease",
          background:C.text, color:"#fff",
          padding:"14px 24px", borderRadius:12,
          display:"flex", alignItems:"center", gap:12,
          boxShadow:"0 8px 30px rgba(0,0,0,0.18)",
          whiteSpace:"nowrap",
        }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}`, animation:"pulse 1s ease-in-out infinite", flexShrink:0 }} />
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>You're all set! We're matching jobs for you.</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:2 }}>Taking you to your dashboard…</div>
          </div>
        </div>
      )}

      {/* Update Resume Dialog */}
      {showResumeDialog && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, animation:"fadeIn 0.2s ease" }} onClick={()=>setShowResumeDialog(false)}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:30, width:440, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", animation:"slideDown 0.2s ease" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:6 }}>Update Resume</div>
            <p style={{ fontSize:13, color:C.textSub, marginBottom:20, lineHeight:1.55 }}>
              Upload a new PDF and our AI will re-extract your skills and target role automatically.
            </p>
            <div style={{ border:`2px dashed ${C.borderMd}`, borderRadius:12, height:120, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", background:C.bg }}>
              <span style={{ fontSize:26 }}>📄</span>
              <span style={{ fontSize:13, color:C.textSub }}>Drop PDF here or <span style={{ color:C.accent, fontWeight:600 }}>browse</span></span>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={()=>setShowResumeDialog(false)} style={{ flex:1, padding:"10px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.textSub, fontSize:13 }}>Cancel</button>
              <button onClick={()=>setShowResumeDialog(false)} style={{ flex:1, padding:"10px", background:`linear-gradient(135deg,${C.accent},${C.green})`, border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:700 }}>Confirm Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
