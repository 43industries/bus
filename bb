 <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BusBuddy — School Bus Tracker</title>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --bus-yellow: #FFD93D;
  --sky-blue: #4FC3F7;
  --sky-dark: #0288D1;
  --grass-green: #66BB6A;
  --grass-dark: #388E3C;
  --coral: #FF7043;
  --mint: #26C6DA;
  --mint-light: #E0F7FA;
  --bg: #FFF8E7;
  --card: #FFFFFF;
  --navy: #1A237E;
  --text: #2D3748;
  --text-soft: #718096;
  --border: #EDE7D0;
  --red: #EF5350;
  --red-light: #FFEBEE;
  --green-light: #E8F5E9;
  --shadow-card: 0 4px 20px rgba(0,0,0,0.07);
  --r: 20px;
  --r-sm: 12px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Quicksand', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }
body::before {
  content: '';
  position: fixed; top: 0; left: 0; right: 0; height: 260px;
  background: linear-gradient(180deg, #B3E5FC 0%, #E1F5FE 60%, transparent 100%);
  z-index: 0; pointer-events: none;
}

/* NAV */
nav {
  position: sticky; top: 0; z-index: 200;
  background: linear-gradient(135deg, var(--bus-yellow) 0%, #FFE066 100%);
  padding: 0 28px; height: 68px;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 4px 20px rgba(255,217,61,0.35);
}
.logo {
  display: flex; align-items: center; gap: 10px;
  font-family: 'Baloo 2', cursive;
  font-size: 1.6rem; font-weight: 800; color: var(--navy);
}
.logo-bus { font-size: 2rem; animation: bus-bounce 2s ease-in-out infinite; }
@keyframes bus-bounce {
  0%,100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-4px) rotate(2deg); }
}
.logo em { color: var(--sky-dark); font-style: normal; }
.nav-center {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.5); border-radius: 30px;
  padding: 6px 16px; font-weight: 700; font-size: 0.85rem; color: var(--navy);
}
.live-pulse { width: 10px; height: 10px; border-radius: 50%; background: var(--red); animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.4);} }
.nav-right { display: flex; align-items: center; gap: 12px; }
.nav-icon-btn {
  position: relative; background: rgba(255,255,255,0.6);
  border: none; border-radius: 50%; width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 1.1rem; transition: all 0.2s;
}
.nav-icon-btn:hover { background: white; transform: scale(1.1); }
.notif-badge {
  position: absolute; top: 2px; right: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--red); color: white; font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--bus-yellow);
}
.user-pill {
  background: var(--navy); color: var(--bus-yellow); border-radius: 30px;
  padding: 6px 14px; font-weight: 700; font-size: 0.82rem;
  display: flex; align-items: center; gap: 6px; cursor: pointer;
}

/* ROLE TABS */
.role-bar {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: center;
  gap: 8px; padding: 14px 28px;
  background: linear-gradient(180deg, #E1F5FE 0%, var(--bg) 100%);
}
.role-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 20px; border-radius: 30px; border: 2px solid transparent;
  font-weight: 700; font-size: 0.88rem; cursor: pointer;
  background: white; color: var(--text-soft); transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.role-tab:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
.role-tab.active-parent { background: var(--sky-blue); color: white; border-color: var(--sky-dark); }
.role-tab.active-teacher { background: var(--grass-green); color: white; border-color: var(--grass-dark); }
.role-tab.active-admin { background: #AB47BC; color: white; border-color: #7B1FA2; }

/* LAYOUT */
.page { position: relative; z-index: 1; padding: 0 24px 40px; max-width: 1400px; margin: 0 auto; }

/* HERO CARDS */
.hero-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.hcard {
  border-radius: var(--r); padding: 20px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: var(--shadow-card); animation: pop-in 0.4s ease backwards;
}
@keyframes pop-in {
  from { opacity:0; transform:scale(0.85) translateY(10px); }
  to { opacity:1; transform:scale(1) translateY(0); }
}
.hcard:nth-child(1){background:linear-gradient(135deg,#66BB6A,#43A047);color:white;animation-delay:0.05s;}
.hcard:nth-child(2){background:linear-gradient(135deg,#4FC3F7,#0288D1);color:white;animation-delay:0.10s;}
.hcard:nth-child(3){background:linear-gradient(135deg,#FFD93D,#F0C020);color:var(--navy);animation-delay:0.15s;}
.hcard:nth-child(4){background:linear-gradient(135deg,#FF7043,#E64A19);color:white;animation-delay:0.20s;}
.hcard-icon { font-size: 2.2rem; }
.hcard-val { font-family:'Baloo 2',cursive; font-size:1.9rem; font-weight:800; line-height:1; }
.hcard-label { font-size:0.75rem; font-weight:600; opacity:0.85; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }

/* MAIN GRID */
.main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }

/* CARDS */
.card { background: var(--card); border-radius: var(--r); box-shadow: var(--shadow-card); overflow: hidden; }
.card-header {
  padding: 18px 22px 14px; display: flex; align-items: center; gap: 10px;
  border-bottom: 2px dashed var(--border);
}
.card-title { font-family:'Baloo 2',cursive; font-size:1.05rem; font-weight:700; color:var(--navy); }
.card-badge { margin-left:auto; font-size:0.7rem; font-weight:700; border-radius:20px; padding:3px 10px; }
.live-tag { background:var(--red); color:white; animation:pulse-op 1.5s infinite; }
@keyframes pulse-op { 0%,100%{opacity:1;} 50%{opacity:0.6;} }

/* MAP */
.map-wrap { position:relative; height:360px; background:#C8E6C9; overflow:hidden; }
.map-svg { width:100%; height:100%; }
@keyframes bus-along { 0%{offset-distance:0%;} 100%{offset-distance:100%;} }
.bus-mover {
  offset-path: path("M 80 320 C 160 290 230 265 290 240 C 360 210 420 185 490 160 C 540 145 590 125 640 95");
  offset-rotate: auto;
  animation: bus-along 16s linear infinite;
}

/* ROUTE TIMELINE */
.route-timeline { padding: 16px 22px; }
.rt-item { display:flex; gap:14px; align-items:flex-start; padding:12px 0; position:relative; }
.rt-item:not(:last-child) .rt-line {
  position:absolute; left:19px; top:42px; width:2px; height:calc(100% - 10px);
  background: repeating-linear-gradient(180deg,var(--border) 0,var(--border) 6px,transparent 6px,transparent 12px);
}
.rt-dot {
  width:38px; height:38px; border-radius:50%; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-size:1rem; font-weight:800; z-index:1; transition:transform 0.2s;
}
.rt-dot:hover { transform: scale(1.15); }
.rt-done { background:var(--grass-green); color:white; box-shadow:0 4px 10px rgba(102,187,106,0.35); }
.rt-current { background:var(--bus-yellow); color:var(--navy); box-shadow:0 0 0 5px rgba(255,217,61,0.3),0 4px 10px rgba(255,217,61,0.4); }
.rt-upcoming { background:var(--border); color:var(--text-soft); }
.rt-school { background:var(--sky-blue); color:white; box-shadow:0 4px 10px rgba(79,195,247,0.35); }
.rt-content { flex:1; }
.rt-name { font-weight:700; font-size:0.93rem; color:var(--navy); }
.rt-sub { font-size:0.75rem; color:var(--text-soft); font-weight:600; margin-top:2px; }
.rt-chips { display:flex; flex-wrap:wrap; gap:5px; margin-top:8px; }
.chip { font-size:0.68rem; font-weight:700; border-radius:20px; padding:3px 9px; }
.chip-on { background:var(--green-light); color:var(--grass-dark); }
.chip-wait { background:#FFF8E1; color:#F57F17; }
.chip-off { background:var(--red-light); color:var(--red); }
.rt-time { font-size:0.78rem; font-weight:700; color:var(--text-soft); white-space:nowrap; padding-top:4px; }
.rt-time.eta { color:var(--coral); }
.rt-time.done-t { color:var(--grass-green); }

/* RIGHT COL */
.right-col { display:flex; flex-direction:column; gap:20px; }

/* STUDENTS */
.search-box {
  display:flex; align-items:center; gap:8px; background:var(--bg);
  border:2px solid var(--border); border-radius:30px; padding:8px 14px;
  margin:14px 14px 6px;
}
.search-box input { border:none; background:none; font-family:'Quicksand',sans-serif; font-weight:600; font-size:0.88rem; color:var(--text); outline:none; width:100%; }
.search-box input::placeholder { color:var(--text-soft); }
.student-list-wrap { padding:14px; display:flex; flex-direction:column; gap:6px; max-height:320px; overflow-y:auto; }
.student-row {
  display:flex; align-items:center; gap:10px; padding:10px 12px;
  border-radius:var(--r-sm); cursor:pointer; transition:all 0.15s; border:2px solid transparent;
}
.student-row:hover { background:var(--bg); border-color:var(--border); }
.s-avatar { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem; color:white; flex-shrink:0; }
.s-name { font-weight:700; font-size:0.88rem; color:var(--navy); }
.s-class { font-size:0.72rem; color:var(--text-soft); font-weight:600; }
.s-badge { margin-left:auto; font-size:0.68rem; font-weight:700; border-radius:20px; padding:4px 10px; white-space:nowrap; }
.sb-on { background:var(--green-light); color:var(--grass-dark); }
.sb-wait { background:#FFF8E1; color:#F57F17; }
.sb-abs { background:var(--red-light); color:var(--red); }
.sb-drop { background:var(--mint-light); color:var(--mint); }

/* NOTIFS */
.notif-list { padding:14px; display:flex; flex-direction:column; gap:8px; max-height:260px; overflow-y:auto; }
.notif-row {
  display:flex; gap:10px; align-items:flex-start; padding:12px 14px;
  border-radius:var(--r-sm); animation:slide-down 0.3s ease;
}
@keyframes slide-down { from{opacity:0;transform:translateY(-10px);} to{opacity:1;transform:translateY(0);} }
.notif-row.n-green { background:var(--green-light); border-left:4px solid var(--grass-green); }
.notif-row.n-orange { background:#FFF8E1; border-left:4px solid #FFC107; }
.notif-row.n-red { background:var(--red-light); border-left:4px solid var(--red); }
.notif-row.n-blue { background:var(--mint-light); border-left:4px solid var(--mint); }
.notif-icon { font-size:1.2rem; flex-shrink:0; }
.notif-msg { font-size:0.82rem; font-weight:700; color:var(--navy); line-height:1.4; }
.notif-ts { font-size:0.7rem; color:var(--text-soft); font-weight:600; margin-top:2px; }
.notif-actions { padding:0 14px 14px; }
.btn-full {
  width:100%; padding:10px; border-radius:var(--r-sm); border:none;
  font-family:'Quicksand',sans-serif; font-weight:700; font-size:0.88rem; cursor:pointer;
  background:var(--bus-yellow); color:var(--navy);
  box-shadow:0 4px 12px rgba(255,217,61,0.3); transition:all 0.2s;
}
.btn-full:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(255,217,61,0.5); }

/* DRIVER */
.driver-panel { padding:16px; }
.driver-big { background:linear-gradient(135deg,#1A237E 0%,#283593 100%); border-radius:var(--r-sm); padding:18px; color:white; margin-bottom:12px; }
.driver-top { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.driver-av {
  width:52px; height:52px; border-radius:50%; background:var(--bus-yellow); color:var(--navy);
  font-family:'Baloo 2',cursive; font-size:1.2rem; font-weight:800;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.driver-name { font-family:'Baloo 2',cursive; font-size:1rem; font-weight:700; }
.driver-plate { font-size:0.75rem; color:var(--bus-yellow); margin-top:2px; font-weight:600; letter-spacing:1px; }
.call-btn-big {
  margin-left:auto; background:var(--grass-green); border:none; border-radius:50%;
  width:44px; height:44px; font-size:1.2rem; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 14px rgba(102,187,106,0.4); transition:transform 0.15s;
}
.call-btn-big:hover { transform:scale(1.12); }
.driver-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
.d-mini { background:rgba(255,255,255,0.08); border-radius:10px; padding:10px; text-align:center; }
.d-mini-val { font-family:'Baloo 2',cursive; font-size:1.1rem; font-weight:800; color:var(--bus-yellow); }
.d-mini-lbl { font-size:0.62rem; color:rgba(255,255,255,0.5); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }
.qa-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.qa-btn {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:6px; padding:16px 10px; border-radius:var(--r-sm); border:2px solid var(--border);
  background:var(--bg); cursor:pointer; transition:all 0.2s;
  font-family:'Quicksand',sans-serif; font-weight:700; font-size:0.78rem; color:var(--navy);
}
.qa-btn:hover { transform:translateY(-3px); box-shadow:0 6px 16px rgba(0,0,0,0.1); border-color:var(--bus-yellow); background:white; }
.qa-btn .qa-icon { font-size:1.6rem; }

/* SCROLLBAR */
::-webkit-scrollbar { width:5px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:var(--border); border-radius:10px; }

/* RESPONSIVE */
@media (max-width:1000px) { .main-grid{grid-template-columns:1fr;} .hero-cards{grid-template-columns:repeat(2,1fr);} }
@media (max-width:600px) { .hero-cards{grid-template-columns:1fr 1fr;} nav{padding:0 16px;} .nav-center{display:none;} .page{padding:0 12px 32px;} }
</style>
</head>
<body>

<nav>
  <div class="logo">
    <span class="logo-bus">🚌</span>
    Bus<em>Buddy</em>
  </div>
  <div class="nav-center">
    <div class="live-pulse"></div>
    Bus 07 is LIVE · Route A · Morning Run
  </div>
  <div class="nav-right">
    <button class="nav-icon-btn" onclick="fireNotif()">
      🔔
      <span class="notif-badge" id="notif-count">3</span>
    </button>
    <div class="user-pill">👤 Mrs. Njeri ▾</div>
  </div>
</nav>

<div class="role-bar">
  <button class="role-tab active-parent" onclick="setRole(this,'parent')">👪 Parent View</button>
  <button class="role-tab" onclick="setRole(this,'teacher')">👩‍🏫 Teacher View</button>
  <button class="role-tab" onclick="setRole(this,'admin')">🏫 Admin View</button>
</div>

<div class="page">

  <!-- HERO STAT CARDS -->
  <div class="hero-cards">
    <div class="hcard">
      <div class="hcard-icon">🧒</div>
      <div>
        <div class="hcard-val">16</div>
        <div class="hcard-label">Students Aboard</div>
      </div>
    </div>
    <div class="hcard">
      <div class="hcard-icon">📍</div>
      <div>
        <div class="hcard-val" id="v-eta">4 min</div>
        <div class="hcard-label">Next Stop ETA</div>
      </div>
    </div>
    <div class="hcard">
      <div class="hcard-icon">✅</div>
      <div>
        <div class="hcard-val">8</div>
        <div class="hcard-label">Safely Dropped</div>
      </div>
    </div>
    <div class="hcard">
      <div class="hcard-icon">⚠️</div>
      <div>
        <div class="hcard-val">1</div>
        <div class="hcard-label">Absent Today</div>
      </div>
    </div>
  </div>

  <!-- MAIN GRID -->
  <div class="main-grid">

    <!-- LEFT -->
    <div style="display:flex;flex-direction:column;gap:20px;">

      <!-- MAP CARD -->
      <div class="card">
        <div class="card-header">
          <span style="font-size:1.3rem">🗺️</span>
          <span class="card-title">Live Bus Location</span>
          <span class="card-badge live-tag">● LIVE</span>
          <span style="margin-left:8px;font-size:0.78rem;color:var(--text-soft);font-weight:700" id="speed-lbl">38 km/h</span>
        </div>
        <div class="map-wrap">
          <svg class="map-svg" viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#B3E5FC"/>
                <stop offset="100%" stop-color="#E1F5FE"/>
              </linearGradient>
            </defs>
            <!-- Sky bg -->
            <rect width="700" height="200" fill="url(#sky)"/>
            <!-- Ground -->
            <rect y="200" width="700" height="160" fill="#C8E6C9"/>

            <!-- Clouds -->
            <ellipse cx="100" cy="50" rx="50" ry="25" fill="white" opacity="0.7"/>
            <ellipse cx="130" cy="40" rx="35" ry="20" fill="white" opacity="0.7"/>
            <ellipse cx="400" cy="70" rx="60" ry="28" fill="white" opacity="0.6"/>
            <ellipse cx="440" cy="58" rx="40" ry="22" fill="white" opacity="0.6"/>
            <ellipse cx="580" cy="45" rx="45" ry="20" fill="white" opacity="0.5"/>

            <!-- Ground detail -->
            <ellipse cx="160" cy="290" rx="100" ry="40" fill="#A5D6A7" opacity="0.5"/>
            <ellipse cx="500" cy="310" rx="130" ry="45" fill="#A5D6A7" opacity="0.5"/>

            <!-- Buildings left -->
            <rect x="15" y="100" width="70" height="110" rx="5" fill="#BBDEFB"/>
            <rect x="25" y="112" width="14" height="14" rx="2" fill="#90CAF9"/>
            <rect x="48" y="112" width="14" height="14" rx="2" fill="#90CAF9"/>
            <rect x="25" y="136" width="14" height="14" rx="2" fill="#90CAF9"/>
            <rect x="48" y="136" width="14" height="14" rx="2" fill="#90CAF9"/>
            <polygon points="15,100 50,72 85,100" fill="#EF9A9A"/>

            <rect x="100" y="118" width="55" height="92" rx="5" fill="#FFE0B2"/>
            <rect x="110" y="128" width="12" height="12" rx="2" fill="#FFCC80"/>
            <rect x="133" y="128" width="12" height="12" rx="2" fill="#FFCC80"/>
            <rect x="110" y="148" width="12" height="12" rx="2" fill="#FFCC80"/>
            <polygon points="100,118 127,95 155,118" fill="#FFAB40"/>

            <!-- Trees -->
            <circle cx="200" cy="240" r="22" fill="#66BB6A"/>
            <rect x="196" y="256" width="8" height="20" fill="#5D4037"/>
            <circle cx="210" cy="228" r="14" fill="#81C784"/>

            <circle cx="470" cy="260" r="20" fill="#4CAF50"/>
            <rect x="466" y="274" width="7" height="16" fill="#5D4037"/>

            <circle cx="55" cy="255" r="18" fill="#66BB6A"/>
            <rect x="51" y="268" width="7" height="14" fill="#5D4037"/>

            <!-- School building (destination) -->
            <rect x="230" y="28" width="110" height="85" rx="6" fill="#BBDEFB" stroke="#1565C0" stroke-width="2.5"/>
            <rect x="265" y="68" width="40" height="45" rx="4" fill="#1565C0"/>
            <polygon points="230,28 285,4 340,28" fill="#1565C0"/>
            <rect x="252" y="44" width="14" height="14" rx="2" fill="#90CAF9"/>
            <rect x="310" y="44" width="14" height="14" rx="2" fill="#90CAF9"/>
            <text x="285" y="62" text-anchor="middle" font-size="9" font-weight="bold" fill="#1565C0">SCHOOL</text>

            <!-- Buildings right -->
            <rect x="590" y="90" width="75" height="105" rx="5" fill="#E1BEE7"/>
            <rect x="600" y="104" width="13" height="13" rx="2" fill="#CE93D8"/>
            <rect x="624" y="104" width="13" height="13" rx="2" fill="#CE93D8"/>
            <rect x="648" y="104" width="13" height="13" rx="2" fill="#CE93D8"/>
            <rect x="600" y="128" width="13" height="13" rx="2" fill="#CE93D8"/>
            <rect x="624" y="128" width="13" height="13" rx="2" fill="#CE93D8"/>
            <polygon points="590,90 627,64 665,90" fill="#BA68C8"/>

            <!-- Road -->
            <path d="M 0 310 Q 160 290 290 255 Q 390 225 480 198 Q 550 178 640 148 L 700 128" fill="none" stroke="#90A4AE" stroke-width="28"/>
            <path d="M 0 310 Q 160 290 290 255 Q 390 225 480 198 Q 550 178 640 148 L 700 128" fill="none" stroke="#ECEFF1" stroke-width="24"/>
            <path d="M 0 310 Q 160 290 290 255 Q 390 225 480 198 Q 550 178 640 148 L 700 128" fill="none" stroke="white" stroke-width="2" stroke-dasharray="20,15" opacity="0.8"/>

            <!-- Route overlay -->
            <path d="M 80 308 Q 180 282 290 254 Q 380 228 460 200 Q 530 178 600 150 L 285 85"
              fill="none" stroke="#FFD93D" stroke-width="5" stroke-dasharray="12,8" opacity="0.95"/>

            <!-- Stop markers -->
            <circle cx="80" cy="308" r="13" fill="#66BB6A" stroke="white" stroke-width="3"/>
            <text x="80" y="313" text-anchor="middle" font-size="10" fill="white" font-weight="bold">✓</text>
            <text x="80" y="330" text-anchor="middle" font-size="8" fill="#388E3C" font-weight="bold">Stop 1</text>

            <circle cx="200" cy="276" r="13" fill="#66BB6A" stroke="white" stroke-width="3"/>
            <text x="200" y="281" text-anchor="middle" font-size="10" fill="white" font-weight="bold">✓</text>
            <text x="200" y="298" text-anchor="middle" font-size="8" fill="#388E3C" font-weight="bold">Stop 2</text>

            <circle cx="330" cy="242" r="13" fill="#66BB6A" stroke="white" stroke-width="3"/>
            <text x="330" y="247" text-anchor="middle" font-size="10" fill="white" font-weight="bold">✓</text>
            <text x="330" y="264" text-anchor="middle" font-size="8" fill="#388E3C" font-weight="bold">Stop 3</text>

            <!-- Current stop pulse -->
            <circle cx="450" cy="202" r="22" fill="none" stroke="#FFD93D" stroke-width="2.5" opacity="0.3">
              <animate attributeName="r" values="16;28;16" dur="1.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite"/>
            </circle>
            <circle cx="450" cy="202" r="13" fill="#FFD93D" stroke="white" stroke-width="3"/>
            <text x="450" y="207" text-anchor="middle" font-size="10" fill="#1A237E" font-weight="bold">4</text>
            <text x="450" y="225" text-anchor="middle" font-size="8" fill="#F57F17" font-weight="bold">Current</text>

            <circle cx="560" cy="168" r="13" fill="white" stroke="#B0BEC5" stroke-width="2.5"/>
            <text x="560" y="173" text-anchor="middle" font-size="10" fill="#90A4AE" font-weight="bold">5</text>

            <circle cx="285" cy="85" r="16" fill="#4FC3F7" stroke="white" stroke-width="3"/>
            <text x="285" y="90" text-anchor="middle" font-size="12">🏫</text>
            <text x="285" y="106" text-anchor="middle" font-size="8" fill="#0288D1" font-weight="bold">School</text>

            <!-- Animated bus -->
            <g class="bus-mover">
              <circle r="24" fill="#FFD93D" opacity="0.2">
                <animate attributeName="r" values="22;32;22" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle r="18" fill="#1A237E" stroke="#FFD93D" stroke-width="3.5"/>
              <text y="6" text-anchor="middle" font-size="16">🚌</text>
            </g>

            <!-- Legend -->
            <rect x="10" y="10" width="160" height="52" rx="10" fill="white" opacity="0.88"/>
            <circle cx="26" cy="26" r="7" fill="#66BB6A"/>
            <text x="38" y="30" font-size="9.5" fill="#333" font-weight="bold">Completed stop</text>
            <circle cx="26" cy="46" r="7" fill="#FFD93D" stroke="#1A237E" stroke-width="1.5"/>
            <text x="38" y="50" font-size="9.5" fill="#333" font-weight="bold">Current stop</text>
          </svg>

          <div style="position:absolute;bottom:14px;right:14px;background:white;border-radius:14px;padding:10px 16px;box-shadow:0 4px 16px rgba(0,0,0,0.12);display:flex;align-items:center;gap:8px;font-size:0.82rem;font-weight:700;color:var(--navy)">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--grass-green)"></div>
            Bus 07 · Moving · <span id="map-speed">38 km/h</span>
          </div>
        </div>
      </div>

      <!-- ROUTE TIMELINE -->
      <div class="card">
        <div class="card-header">
          <span style="font-size:1.3rem">📍</span>
          <span class="card-title">Route A — 6 Stops Today</span>
          <span style="margin-left:auto;font-size:0.78rem;font-weight:700;background:var(--green-light);color:var(--grass-dark);border-radius:20px;padding:3px 10px;">✅ On Schedule</span>
        </div>
        <div class="route-timeline">

          <div class="rt-item">
            <div class="rt-dot rt-done">✓</div>
            <div class="rt-line"></div>
            <div class="rt-content">
              <div class="rt-name">Maple Street Junction</div>
              <div class="rt-sub">Stop 1 · 6 students</div>
              <div class="rt-chips">
                <span class="chip chip-on">🟢 Amara K.</span>
                <span class="chip chip-on">🟢 James L.</span>
                <span class="chip chip-on">🟢 Fatuma A.</span>
                <span class="chip chip-off">🔴 David M. — Absent</span>
              </div>
            </div>
            <div class="rt-time done-t">6:45 AM</div>
          </div>

          <div class="rt-item">
            <div class="rt-dot rt-done">✓</div>
            <div class="rt-line"></div>
            <div class="rt-content">
              <div class="rt-name">Riverside Primary Flats</div>
              <div class="rt-sub">Stop 2 · 5 students</div>
              <div class="rt-chips">
                <span class="chip chip-on">🟢 Lena W.</span>
                <span class="chip chip-on">🟢 Kevin O.</span>
                <span class="chip chip-on">🟢 Priya S.</span>
              </div>
            </div>
            <div class="rt-time done-t">7:00 AM</div>
          </div>

          <div class="rt-item">
            <div class="rt-dot rt-done">✓</div>
            <div class="rt-line"></div>
            <div class="rt-content">
              <div class="rt-name">Garden Estate Gate B</div>
              <div class="rt-sub">Stop 3 · 4 students</div>
              <div class="rt-chips">
                <span class="chip chip-on">🟢 Brian N.</span>
                <span class="chip chip-on">🟢 Chloe R.</span>
              </div>
            </div>
            <div class="rt-time done-t">7:15 AM</div>
          </div>

          <div class="rt-item">
            <div class="rt-dot rt-current">🚌</div>
            <div class="rt-line"></div>
            <div class="rt-content">
              <div class="rt-name">
                Westlands Shopping Mall
                <span style="font-size:0.68rem;background:var(--bus-yellow);color:var(--navy);border-radius:8px;padding:2px 7px;margin-left:5px;font-weight:800;">NOW</span>
              </div>
              <div class="rt-sub" style="color:var(--coral);font-weight:700">🔴 Bus arriving — ETA 4 minutes</div>
              <div class="rt-chips">
                <span class="chip chip-wait">⏳ Mercy J.</span>
                <span class="chip chip-wait">⏳ Tom B.</span>
                <span class="chip chip-wait">⏳ Aisha M.</span>
              </div>
            </div>
            <div class="rt-time eta">~7:28 AM</div>
          </div>

          <div class="rt-item">
            <div class="rt-dot rt-upcoming">5</div>
            <div class="rt-line"></div>
            <div class="rt-content">
              <div class="rt-name" style="color:var(--text-soft)">Kileleshwa Estate</div>
              <div class="rt-sub">Stop 5 · 4 students · Upcoming</div>
            </div>
            <div class="rt-time">7:38 AM</div>
          </div>

          <div class="rt-item">
            <div class="rt-dot rt-school">🏫</div>
            <div class="rt-content">
              <div class="rt-name" style="color:var(--text-soft)">Nairobi Academy — School Gate</div>
              <div class="rt-sub">Final destination</div>
            </div>
            <div class="rt-time">7:52 AM</div>
          </div>

        </div>
      </div>
    </div>

    <!-- RIGHT COL -->
    <div class="right-col">

      <!-- STUDENTS -->
      <div class="card">
        <div class="card-header">
          <span style="font-size:1.3rem">🧒</span>
          <span class="card-title">Students — Bus 07</span>
          <span class="card-badge" style="background:var(--green-light);color:var(--grass-dark)">32 total</span>
        </div>
        <div class="search-box">
          <span>🔍</span>
          <input type="text" placeholder="Search student..." oninput="filterStudents(this.value)">
        </div>
        <div class="student-list-wrap" id="student-list"></div>
      </div>

      <!-- NOTIFICATIONS -->
      <div class="card">
        <div class="card-header">
          <span style="font-size:1.3rem">🔔</span>
          <span class="card-title">Live Alerts</span>
          <span class="card-badge live-tag">● NEW</span>
        </div>
        <div class="notif-list" id="notif-list"></div>
        <div class="notif-actions">
          <button class="btn-full" onclick="fireNotif()">🔔 Simulate Arrival Alert</button>
        </div>
      </div>

      <!-- DRIVER + ACTIONS -->
      <div class="card">
        <div class="card-header">
          <span style="font-size:1.3rem">🚘</span>
          <span class="card-title">Driver & Quick Actions</span>
        </div>
        <div class="driver-panel">
          <div class="driver-big">
            <div class="driver-top">
              <div class="driver-av">JM</div>
              <div>
                <div class="driver-name">James Mwangi</div>
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.55);margin-top:2px">Senior Driver · 8 yrs</div>
                <div class="driver-plate">KCA 482T · Bus 07</div>
              </div>
              <button class="call-btn-big">📞</button>
            </div>
            <div class="driver-grid">
              <div class="d-mini"><div class="d-mini-val">98%</div><div class="d-mini-lbl">On-Time</div></div>
              <div class="d-mini"><div class="d-mini-val">4.9★</div><div class="d-mini-lbl">Rating</div></div>
              <div class="d-mini"><div class="d-mini-val">312</div><div class="d-mini-lbl">Trips</div></div>
            </div>
          </div>
          <div class="qa-grid">
            <button class="qa-btn"><span class="qa-icon">📋</span>Attendance</button>
            <button class="qa-btn"><span class="qa-icon">📱</span>SMS Parents</button>
            <button class="qa-btn"><span class="qa-icon">🗺️</span>Full Route</button>
            <button class="qa-btn"><span class="qa-icon">🚨</span>Emergency</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
const students = [
  {n:"Amara Kimani",    g:"Grade 4", st:"on",   col:"#3B9EF5", i:"AK"},
  {n:"James Lungaho",   g:"Grade 3", st:"on",   col:"#8B5CF6", i:"JL"},
  {n:"Fatuma Ahmed",    g:"Grade 5", st:"on",   col:"#EC4899", i:"FA"},
  {n:"David Mwenda",    g:"Grade 4", st:"abs",  col:"#94A3B8", i:"DM"},
  {n:"Lena Wanjiku",    g:"Grade 2", st:"on",   col:"#F97316", i:"LW"},
  {n:"Kevin Otieno",    g:"Grade 6", st:"on",   col:"#22C55E", i:"KO"},
  {n:"Priya Sharma",    g:"Grade 3", st:"on",   col:"#EF4444", i:"PS"},
  {n:"Brian Njoroge",   g:"Grade 5", st:"on",   col:"#0EA5E9", i:"BN"},
  {n:"Chloe Ruto",      g:"Grade 4", st:"on",   col:"#A855F7", i:"CR"},
  {n:"Mercy Jebet",     g:"Grade 2", st:"wait", col:"#14B8A6", i:"MJ"},
  {n:"Tom Barasa",      g:"Grade 3", st:"wait", col:"#F59E0B", i:"TB"},
  {n:"Aisha Mohamed",   g:"Grade 5", st:"wait", col:"#6366F1", i:"AM"},
  {n:"Noah Kibet",      g:"Grade 6", st:"drop", col:"#10B981", i:"NK"},
  {n:"Sara Chege",      g:"Grade 4", st:"on",   col:"#F43F5E", i:"SC"},
  {n:"Ali Hassan",      g:"Grade 3", st:"on",   col:"#8B5CF6", i:"AH"},
  {n:"Grace Muthoni",   g:"Grade 2", st:"wait", col:"#06B6D4", i:"GM"},
];
const stLabel = {on:"Aboard 🟢", wait:"Waiting ⏳", abs:"Absent ❌", drop:"Dropped ✅"};
const stClass = {on:"sb-on", wait:"sb-wait", abs:"sb-abs", drop:"sb-drop"};
function renderStudents(list) {
  document.getElementById('student-list').innerHTML = list.map(s=>`
    <div class="student-row">
      <div class="s-avatar" style="background:${s.col}">${s.i}</div>
      <div><div class="s-name">${s.n}</div><div class="s-class">${s.g}</div></div>
      <div class="s-badge ${stClass[s.st]}">${stLabel[s.st]}</div>
    </div>`).join('');
}
function filterStudents(q){renderStudents(students.filter(s=>s.n.toLowerCase().includes(q.toLowerCase())));}
renderStudents(students);

let notifs = [
  {c:"n-green", i:"✅", m:"Amara Kimani safely boarded at Maple Street.", t:"6:45 AM"},
  {c:"n-red",   i:"⚠️", m:"David Mwenda is marked absent today.", t:"6:46 AM"},
  {c:"n-green", i:"✅", m:"Lena Wanjiku boarded at Riverside Flats.", t:"7:00 AM"},
  {c:"n-blue",  i:"📍", m:"Bus 07 approaching Westlands — ETA 4 min.", t:"7:24 AM"},
  {c:"n-green", i:"🚌", m:"Bus 07 departed Garden Estate on schedule.", t:"7:16 AM"},
];
const extras = [
  {c:"n-green", i:"✅", m:"Mercy Jebet has safely boarded at Westlands! 🎉", t:"Just now"},
  {c:"n-blue",  i:"📍", m:"Bus 07 arrived at Westlands Mall stop.", t:"Just now"},
  {c:"n-green", i:"✅", m:"Tom Barasa boarded the bus.", t:"Just now"},
  {c:"n-orange",i:"⏱️", m:"Bus 07 is 2 min behind — ETA updated.", t:"Just now"},
];
let eIdx=0;
function renderNotifs(){
  document.getElementById('notif-list').innerHTML=notifs.slice(0,6).map(n=>`
    <div class="notif-row ${n.c}">
      <div class="notif-icon">${n.i}</div>
      <div><div class="notif-msg">${n.m}</div><div class="notif-ts">${n.t}</div></div>
    </div>`).join('');
}
renderNotifs();
function fireNotif(){
  if(eIdx<extras.length){notifs.unshift(extras[eIdx++]);renderNotifs();}
  const el=document.getElementById('notif-count');
  el.textContent=parseInt(el.textContent||0)+1;
}
setInterval(()=>{
  const sp=Math.floor(30+Math.random()*16);
  document.getElementById('speed-lbl').textContent=sp+' km/h';
  document.getElementById('map-speed').textContent=sp+' km/h';
  document.getElementById('v-eta').textContent=Math.floor(3+Math.random()*5)+' min';
},3500);
function setRole(el,role){
  document.querySelectorAll('.role-tab').forEach(t=>t.className='role-tab');
  el.className='role-tab active-'+role;
}
</script>
</body>
</html>