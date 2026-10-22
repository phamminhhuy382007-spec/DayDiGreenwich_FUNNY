/* DẬY ĐI, GREENWICH! */
(() => {
"use strict";
const mb = window.mindblown;
const $ = (s) => document.querySelector(s);
const WORLD = 1024;
const INK = 0x1E1726;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------- tune ---------------- */
let T = {};
const fromFile = () => fetch("tune.json").then((r) => r.json())
  .then((f) => Object.fromEntries(Object.entries(f).map(([k, e]) => [k, e.value]))).catch(() => ({}));
const DEF = { s1_start: 5, s1_goal: 80, s1_decay: 0.6, s1_slope: 0.018, s1_wrong: 0.35, s2_wake: 65, s2_time: 180,
  s2_passive: 0.28, work_right: 12, work_wrong: 3, work_cost: 5, coffee_sips: 4, coffee_gain: 18, coffee_cd: 10,
  phone_time: 7, phone_wake: 8, ghost_gain: 26, ghost_drain: 1.2, buzz_every: 22, jab_every: 8, default_name: "Minh", accent: "#e8483a" };
const tv = (k) => (T[k] !== undefined ? T[k] : DEF[k]);
function applyTune() { document.documentElement.style.setProperty("--tomato", tv("accent")); $("#wGoal b").textContent = tv("s1_goal"); $("#wGoal").style.left = tv("s1_goal") + "%"; }

/* ---------------- profile ---------------- */
const prof = { name: "Minh", g: "m" };
let profRev = false;
const NAME = () => prof.name || "Minh";
const isF = () => prof.g === "f";
const fill = (s) => s.replace(/\{n\}/g, NAME());
const G = (m, f) => (isF() ? f : m);

/* ---------------- audio ---------------- */
const SND = ["alarm", "ting", "squeak", "sip", "typing", "boing", "flop", "snore", "win", "lose", "stamp", "whoosh", "pop", "night", "day", "slap", "yawn", "groan", "clang", "knock", "scare", "right", "wrong"];
const AU = { ctx: null, master: null, buf: {}, beds: {}, muted: false, voices: {} };
try {
  AU.ctx = new (window.AudioContext || window.webkitAudioContext)();
  AU.master = AU.ctx.createGain(); AU.master.connect(AU.ctx.destination);
} catch (e) { AU.ctx = null; }
const unlock = () => { if (AU.ctx && AU.ctx.state !== "running") AU.ctx.resume(); };
addEventListener("pointerdown", unlock); addEventListener("keydown", unlock);
function loadSounds() {
  if (!AU.ctx) return;
  SND.forEach((n) => fetch("snd/" + n + ".mp3").then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
    .then((b) => AU.ctx.decodeAudioData(b)).then((d) => { AU.buf[n] = d; if (pendingBed === n) bed(n); }).catch(() => {}));
}
function play(n, o = {}) {
  if (!AU.ctx || !AU.buf[n]) return null;
  const v = (AU.voices[n] = AU.voices[n] || []);
  while (v.length >= (o.max || 3)) { const old = v.shift(); try { old.g.gain.setTargetAtTime(0, AU.ctx.currentTime, 0.01); old.s.stop(AU.ctx.currentTime + 0.05); } catch (e) {} }
  const s = AU.ctx.createBufferSource(); s.buffer = AU.buf[n];
  s.playbackRate.value = o.rate || rnd(0.94, 1.06); s.loop = !!o.loop;
  const g = AU.ctx.createGain(); g.gain.value = o.vol ?? 0.8;
  s.connect(g); g.connect(AU.master); s.start();
  const h = { s, g, stop() { try { g.gain.setTargetAtTime(0, AU.ctx.currentTime, 0.03); s.stop(AU.ctx.currentTime + 0.15); } catch (e) {} } };
  v.push(h); s.onended = () => { const i = v.indexOf(h); if (i >= 0) v.splice(i, 1); };
  return h;
}
let bedH = null, bedName = null, pendingBed = null, snoreH = null;
function bed(n) {
  if (bedName === n && bedH) return;
  if (bedH) bedH.stop(); bedH = null; bedName = n; pendingBed = n;
  if (n && AU.buf[n]) { bedH = play(n, { loop: true, vol: 0.22, rate: 1, max: 1 }); pendingBed = null; }
}
function snore(on) {
  if (on && !snoreH && AU.buf.snore) snoreH = play("snore", { loop: true, vol: 0.35, rate: 1, max: 1 });
  if (!on && snoreH) { snoreH.stop(); snoreH = null; }
}
function setMuted(m) {
  AU.muted = m; if (AU.master) AU.master.gain.value = m ? 0 : 1;
  document.body.classList.toggle("muted", m);
  try { localStorage.setItem("ddg_muted", m ? "1" : "0"); } catch (e) {}
}
if (mb && mb.sound) { setMuted(!mb.sound.on); mb.sound.onchange?.((on) => setMuted(!on)); }
else { let m = false; try { m = localStorage.getItem("ddg_muted") === "1"; } catch (e) {} setMuted(m); }
$("#bMute").onclick = () => { unlock(); if (mb && mb.sound) setMuted(!mb.sound.toggle()); else setMuted(!AU.muted); };

/* ---------------- layout ---------------- */
const L = { x: 0, y: 0, s: 1, size: WORLD, portrait: false, side: 0 };
function layout() {
  const W = innerWidth, H = innerHeight;
  const hudB = Math.max($("#hud").getBoundingClientRect().bottom, $("#btns").getBoundingClientRect().bottom) + 6;
  const gb = $("#goalbar"); const goalH = getComputedStyle(gb).display !== "none" ? gb.getBoundingClientRect().height + 12 : 8;
  const avail = H - hudB - goalH;
  const portrait = H > W * 1.05;
  let size = portrait ? Math.min(W - 10, Math.max(avail - 130, avail * 0.66)) : Math.min(W - 12, avail);
  size = Math.max(160, size);
  const x = (W - size) / 2, y = portrait ? hudB : hudB + Math.max(0, (avail - size) / 2);
  Object.assign(L, { x, y, size, s: size / WORLD, portrait, side: x });
  document.documentElement.style.setProperty("--tagf", clamp(size * 0.019, 9, 14).toFixed(1) + "px");
  const st = $("#stage").style;
  st.left = x + "px"; st.top = y + "px"; st.width = size + "px"; st.height = size + "px";
  fitGame();
  // note + toasts placement
  const note = $("#note").style, toasts = $("#toasts").style;
  if (portrait && H - (y + size) - goalH > 90) {
    note.left = "50%"; note.right = "auto"; note.top = (y + size + 14) + "px"; note.bottom = "auto"; note.marginLeft = "-150px"; note.maxWidth = "300px";
  } else if (x > 200) {
    note.left = Math.max(8, x - 260) + "px"; note.marginLeft = "0"; note.maxWidth = Math.min(250, x - 16) + "px"; note.top = "auto"; note.bottom = (goalH + 30) + "px";
  } else {
    note.left = "50%"; note.marginLeft = "-150px"; note.maxWidth = "300px"; note.top = "auto"; note.bottom = (goalH + 16) + "px";
  }
  if (x > 220) { toasts.left = (x + size + 10) + "px"; toasts.top = (y + 40) + "px"; toasts.width = Math.min(260, x - 20) + "px"; }
  else { toasts.left = (x + 8) + "px"; toasts.top = (y + 8) + "px"; toasts.width = Math.min(260, size * 0.7) + "px"; }
  placeTags();
}
const DPR = () => Math.min(2, window.devicePixelRatio || 1);
function fitGame() {
  if (!game) return; const d = DPR(); const W = innerWidth, H = innerHeight;
  if (game.scale.width !== Math.round(W * d) || game.scale.height !== Math.round(H * d)) game.scale.setGameSize(Math.round(W * d), Math.round(H * d));
  game.scale.refresh();
  if (scene && scene.cameras && scene.cameras.main) {
    const cam = scene.cameras.main, b = 4, inner = (L.size - 2 * b) * d;
    cam.setViewport(Math.round((L.x + b) * d), Math.round((L.y + b) * d), Math.round(inner), Math.round(inner));
    cam.setZoom(inner / WORLD); cam.centerOn(WORLD / 2, WORLD / 2);
  }
}
const wp = (x, y) => ({ x: L.x + 4 + x * L.s * ((L.size - 8) / L.size), y: L.y + 4 + y * L.s * ((L.size - 8) / L.size) });

/* ---------------- DOM fx ---------------- */
const ov = $("#ov");
function burstAt(x, y, word, color) {
  const p = wp(x, y); const d = document.createElement("div"); d.className = "burst";
  d.style.left = p.x + "px"; d.style.top = p.y + "px";
  let pts = []; const n = 14;
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2; const r = i % 2 ? rnd(30, 38) : rnd(44, 52); pts.push((50 + Math.cos(a) * r * 1.25).toFixed(1) + "," + (50 + Math.sin(a) * r * 0.9).toFixed(1)); }
  d.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="${pts.join(" ")}" fill="${color}" stroke="#1E1726" stroke-width="4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><b>${word}</b>`;
  ov.appendChild(d); setTimeout(() => d.remove(), 950);
}
function floatNum(x, y, text, cls) {
  const p = wp(x, y); const d = document.createElement("div"); d.className = "float " + cls; d.textContent = text;
  d.style.left = p.x + rnd(-14, 14) + "px"; d.style.top = p.y + "px"; ov.appendChild(d); setTimeout(() => d.remove(), 1250);
}
let bubbleEl = null, bubbleT = 0;
function say(text, opt = {}) {
  if (bubbleEl) { bubbleEl.remove(); bubbleEl = null; }
  const anchor = opt.at || headPoint();
  const d = document.createElement("div"); d.className = "bubble";
  d.innerHTML = (opt.who ? `<span class="who">${opt.who}</span>` : "") + fill(text).replace(/\*(.+?)\*/g, "<em>$1</em>") + '<i class="tail"></i>';
  ov.appendChild(d); bubbleEl = d;
  const p = wp(anchor.x, anchor.y); const bw = d.offsetWidth, bh = d.offsetHeight;
  let side = opt.side || (opt.from !== undefined ? (opt.from < anchor.x ? 1 : -1) : 1);
  let left = side > 0 ? p.x + 30 : p.x - bw - 30;
  let top = p.y - bh - 24;
  if (left < 6) left = p.x + 30; if (left + bw > innerWidth - 6) left = Math.max(6, p.x - bw - 30);
  left = clamp(left, 6, innerWidth - bw - 6); top = clamp(top, 6, innerHeight - bh - 50);
  d.style.left = left + "px"; d.style.top = top + "px";
  const tail = d.querySelector(".tail"); tail.style.left = clamp(p.x - left - 8, 12, bw - 28) + "px";
  if (p.y < top + bh) tail.style.display = "none";
  clearTimeout(bubbleT); const me = d;
  bubbleT = setTimeout(() => { me.classList.add("fade"); setTimeout(() => me.remove(), 320); if (bubbleEl === me) bubbleEl = null; }, opt.ms || 2600);
}
let noteT = 0;
function narrate(text, ms = 2800) {
  const n = $("#note"); n.textContent = fill(text); n.className = "sticky"; void n.offsetWidth; n.className = "sticky show";
  n.style.transform = `rotate(${rnd(-4, 3).toFixed(1)}deg)`;
  play("slap", { vol: 0.35 });
  clearTimeout(noteT); noteT = setTimeout(() => { n.className = "sticky hide"; }, ms);
}
function toast(html) {
  const box = $("#toasts"); const d = document.createElement("div"); d.className = "toast"; d.innerHTML = fill(html);
  box.appendChild(d); while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => { d.classList.add("out"); setTimeout(() => d.remove(), 320); }, 2600);
}
function screenShake() { const b = document.body; b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); }

/* ---------------- quiz ---------------- */
const CAT = { do: "Đố vui", logic: "Logic thuật toán", py: "Đọc code Python", sql: "Đọc câu lệnh SQL" };
const used = { do: [], logic: [], py: [], sql: [] };
let quizCb = null;
function drawQ(cats) {
  const cat = pick(cats); const bank = window.QUIZ[cat];
  if (used[cat].length >= bank.length) used[cat] = [];
  let i; do { i = Math.floor(Math.random() * bank.length); } while (used[cat].includes(i));
  used[cat].push(i); return { cat, q: bank[i] };
}
function ask(cats, itemName, cb) {
  const { cat, q } = drawQ(cats);
  $("#qCat").textContent = CAT[cat]; $("#qCat").className = "chip " + cat;
  $("#qItem").textContent = "Để dùng " + itemName + ", giải câu này:";
  $("#qText").textContent = fill(q.q); $("#qCode").textContent = q.code ? fill(q.code) : "";
  const box = $("#qAns"); box.innerHTML = "";
  const order = q.a.map((_, k) => k).sort(() => Math.random() - 0.5);
  let done = false;
  order.forEach((k, j) => {
    const b = document.createElement("button"); b.textContent = String.fromCharCode(65 + j) + ". " + fill(q.a[k]); if (k === q.c) b.dataset.ok = "1";
    b.onclick = () => {
      if (done) return; done = true; const ok = k === q.c;
      b.classList.add(ok ? "ok" : "bad");
      if (!ok) [...box.children][order.indexOf(q.c)].classList.add("ok");
      play(ok ? "right" : "wrong", { vol: 0.6 });
      setTimeout(() => closeQuiz(ok), ok ? 380 : 900);
    };
    box.appendChild(b);
  });
  quizCb = cb; $("#quiz").classList.remove("hidden"); play("pop", { vol: 0.5 });
}
function closeQuiz(res) { $("#quiz").classList.add("hidden"); const cb = quizCb; quizCb = null; if (cb && res !== undefined) cb(res); }
$("#qClose").onclick = () => closeQuiz(null);
const quizOpen = () => !$("#quiz").classList.contains("hidden");

/* ---------------- content ---------------- */
const JABS1 = ["{n} ơi, deadline dí đến nơi rồi!", "Dậy học đi, ngủ nữa là bài tập tự biến mất à?", "Cà phê đâu? Cứu lấy GPA của tôi!",
  "Ngủ thêm 5 phút là trễ deadline 5 tiếng đấy.", "Gối êm thế thôi chứ không viết bài hộ đâu.", "Mặt trời lặn rồi mà {n} vẫn chưa mọc.",
  "Thử dọa ma xem, đảm bảo tỉnh!", "Gõ nồi gõ chảo đi, hàng xóm chịu được mà."];
const JABS2 = ["Bấm máy tính để làm bài, trả lời đúng mới được nhiều điểm!", "Đừng lướt điện thoại nữa, deadline không chờ ai!",
  "Buồn ngủ thì uống cà phê, nhưng uống từ từ thôi.", "Bấm vào {n} để động viên khi đang gật gù.", "23:59 là hết giờ, không có 24:00 đâu nhé!"];
const TOASTS_M = ["<b>Hội FA:</b> tối nay đi trà sữa không?", "<b>Nhóm lớp:</b> ai làm xong cho chép với", "<b>Reels:</b> mèo béo nhảy múa, 2,3 triệu lượt xem",
  "<b>Shopee:</b> sale 0 đồng nè bạn ơi!", "<b>Mẹ:</b> ăn cơm chưa con?", "<b>Hội FA:</b> kèo game tối nay nhé!", "<b>TikTok:</b> 10 mẹo học bài trong 5 phút"];
const TOASTS_F = ["<b>Hội chị em:</b> tối nay đi trà sữa không?", "<b>Crush:</b> cậu đang làm gì đó?", "<b>Nhóm lớp:</b> ai làm xong cho chép với",
  "<b>Reels:</b> mèo béo nhảy múa, 2,3 triệu lượt xem", "<b>Shopee:</b> son mới sale 50% nè!", "<b>Mẹ:</b> ăn cơm chưa con?"];
const WRONG = ["Sai rồi! GPA vừa tụt thêm 0,1.", "Trật lất! Nhưng thôi, cũng có tác dụng tí.", "Sai mất rồi, may mà vẫn còn hiệu lực một chút!", "Não chưa khởi động xong à? Sai rồi!"];
const RIGHT = ["Chuẩn không cần chỉnh!", "Đúng rồi! Não vẫn chạy tốt!", "Xuất sắc! Thầy mà thấy chắc cho 10.", "Quá đỉnh!"];

/* ---------------- scene data ---------------- */
// pose table: w = display width in world units, hx/hy = head point as fraction of sprite
const POSE = {
  bed_sleep: { w: 560, hx: 0.3, hy: 0.3 }, bed_startled: { w: 470, hx: 0.42, hy: 0.18 }, bed_annoyed: { w: 560, hx: 0.3, hy: 0.3 },
  bed_groggy: { w: 500, hx: 0.4, hy: 0.2 }, bed_coffee: { w: 500, hx: 0.4, hy: 0.2 }, bed_awake: { w: 500, hx: 0.4, hy: 0.18 }, bed_shy: { w: 500, hx: 0.4, hy: 0.22 },
  desk_study: { w: 370, hx: 0.5, hy: 0.22 }, desk_phone: { w: 370, hx: 0.5, hy: 0.22 }, desk_drowsy: { w: 370, hx: 0.5, hy: 0.25 },
  desk_coffee: { w: 370, hx: 0.5, hy: 0.22 }, desk_sleep: { w: 460, hx: 0.5, hy: 0.45 }, desk_victory: { w: 410, hx: 0.5, hy: 0.3 },
  desk_scared: { w: 390, hx: 0.5, hy: 0.22 }, desk_cheer: { w: 380, hx: 0.5, hy: 0.22 }, desk_shy: { w: 370, hx: 0.5, hy: 0.22 }
};
const BED = { x: 650, y: 770 };   // bottom-centre of the bed figure
const DESK = { x: 480, y: 668 };  // bottom-centre of the desk figure
const OBJ1 = {
  alarm:   { key: "alarm", x: 172, y: 630, w: 150, label: "Đồng hồ báo thức", word: "RENGGG!", color: "#E8483A" },
  phone:   { key: "phone1", x: 488, y: 700, w: 92, label: "Điện thoại", word: "TING TING!", color: "#2F6BFF", depth: 30 },
  mug:     { key: "mug", x: 300, y: 870, w: 110, label: "Cốc cà phê", word: "ỰC ỰC!", color: "#5FD3A0" },
  chicken: { key: "chicken", x: 600, y: 975, w: 240, label: "Gà cao su", word: "ÉÉÉT!", color: "#F4C430" },
  books:   { key: "books", x: 845, y: 940, w: 190, label: "Sách giáo trình và bài tập", word: "BỘP!", color: "#2F6BFF" },
  pots:    { key: "pots", x: 120, y: 1000, w: 190, label: "Nồi xoong chảo", word: "XOẢNG XOẢNG!", color: "#E8483A" },
  costume: { key: "costume", x: 395, y: 1010, w: 200, label: "Dọa ma", word: "HÙ!!!", color: "#FFF6E3" },
  door:    { key: "door", x: 0, y: 0, w: 0, label: "Gọi người đến", word: "CỘC CỘC!", color: "#F4C430" }
};
const OBJ2 = {
  laptop: { key: "laptop", x: 610, y: 812, w: 280, below: true, label: "Máy tính: làm bài", word: "LẠCH CẠCH", color: "#2F6BFF", depth: 40 },
  mug2:   { key: "mug", x: 800, y: 790, w: 100, label: "Cà phê", word: "ỰC ỰC!", color: "#5FD3A0", depth: 40 },
  phone2: { key: "phone2", x: 912, y: 770, w: 130, label: "Điện thoại", word: "TING TING!", color: "#2F6BFF", depth: 40 },
  lamp:   { key: "lamp", x: 165, y: 745, w: 230, label: "Giấy nhắc học", word: "CỐ LÊN!", color: "#F4C430", depth: 40 },
  ghost2: { key: "costume", x: 945, y: 1010, w: 150, label: "Dọa ma", word: "HÙ!!!", color: "#FFF6E3", depth: 46 },
  minh:   { key: null, label: "{n}", word: "CỐ LÊN!", color: "#5FD3A0" }
};
const DOOR = { x: 920, y: 20, w: 104, h: 885 };

/* ---------------- state ---------------- */
let S = null; let scene = null; let game = null;
function freshState(mode) {
  return { mode, paused: false, W: tv("s1_start"), P: 0, T: tv("s2_time"), t: 0, lastAct: 0,
    uses: {}, cool: {}, ring: 0, ringN: 0, sips1: 0, sips2: tv("coffee_sips"), doorN: 0, phoneN: 0, phoneF: 0,
    drain: 0, distract: 0, distractPen: 0, focus: 0, shaky: 0, busy: 0, buzz: 0, nextBuzz: tv("buzz_every"), nod: 0, nextNod: 6,
    mumNext: 0, teacherDone: {}, crushDone: 0, camDone: false, react: 0, reactPose: null, phoneUses: 0, coffeeN: 0, quizRight: 0, quizN: 0,
    s2t: 0, nextJab: tv("jab_every"), over: false };
}

/* ---------------- Phaser scene ---------------- */
class Room extends Phaser.Scene {
  constructor() { super("room"); }
  preload() {
    const imgs = ["bg1", "bg2", "desk", "fan", "alarm", "phone1", "mug", "chicken", "books", "blanket", "laptop", "textbook", "phone2", "lamp", "pots", "costume", "ghost", "teacher", "mum", "crush", "door", "bg1m", "bg2m", "alarm8", "phonecall"];
    imgs.forEach((k) => this.load.image(k, "img/" + k + ".webp"));
    ["m", "f"].forEach((g) => Object.keys(POSE).forEach((p) => { if (g === "m" && p.endsWith("shy")) return; this.load.image(g + "_" + p, "img/" + g + "_" + p + ".webp"); }));
  }
  create(data) {
    scene = this;
    S = freshState(data.mode || "title");
    ov.innerHTML = ""; $("#toasts").innerHTML = ""; $("#tint").classList.remove("on"); bubbleEl = null;
    this.objs = {}; this.fx = this.add.group();
    // stage 1
    this.bg1 = this.add.image(0, 0, "bg1").setOrigin(0).setDisplaySize(WORLD, WORLD).setDepth(0);
    this.doorway = this.add.rectangle(DOOR.x, DOOR.y, DOOR.w, DOOR.h, 0x15101c).setOrigin(0).setDepth(1).setVisible(false);
    this.visitor = this.add.image(0, 0, "teacher").setVisible(false).setDepth(2);
    this.fan = this.add.image(298, 718, "fan").setOrigin(0.5, 1).setDepth(5); this.fit(this.fan, 132);
    this.fan.base = this.fan.scaleX;
    // stage 2
    this.bg2 = this.add.image(0, 0, "bg2").setOrigin(0).setDisplaySize(WORLD, WORLD).setDepth(0).setVisible(false);
    this.cone = this.add.graphics().setDepth(45).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
    this.cone.fillStyle(0xffd75a, 0.16).fillPoints([{ x: 238, y: 520 }, { x: 290, y: 500 }, { x: 470, y: 820 }, { x: 150, y: 860 }], true);
    this.desk = this.add.image(512, 640, "desk").setOrigin(0.5, 0).setDepth(30).setVisible(false); this.fit(this.desk, 1010);
    this.textbook = this.add.image(320, 790, "textbook").setOrigin(0.5, 1).setDepth(38).setVisible(false); this.fit(this.textbook, 200);
    this.dark = this.add.rectangle(0, 0, WORLD, WORLD, 0x0d1730, 0).setOrigin(0).setDepth(90);
    // Minh
    this.minh = this.add.image(BED.x, BED.y, "m_bed_sleep").setOrigin(0.5, 1).setDepth(20);
    this.minh.setInteractive({ useHandCursor: true });
    this.minh.on("pointerdown", () => this.click("minh"));
    this.minh.on("pointerover", () => S.mode === "s2" && this.hover("minh", true));
    this.minh.on("pointerout", () => this.hover("minh", false));
    this.pose = null; this.setPose("bed_sleep", true);
    // objects
    for (const [id, o] of Object.entries(OBJ1)) this.makeObj(id, o, 1);
    for (const [id, o] of Object.entries(OBJ2)) if (o.key) this.makeObj(id, o, 2);
    this.objs.minh = { id: "minh", cfg: OBJ2.minh, stage: 2, img: this.minh, tag: this.makeTag("minh", OBJ2.minh) };
    this.ghost = this.add.image(512, 520, "ghost").setDepth(95).setVisible(false);
    this.blanket = this.add.image(600, 600, "blanket").setDepth(96).setVisible(false);
    this.flash = this.add.rectangle(0, 0, WORLD, WORLD, 0x000000, 0).setOrigin(0).setDepth(94);
    // ambient timers
    this.time.addEvent({ delay: 1100, loop: true, callback: () => this.zzz() });
    this.time.addEvent({ delay: 420, loop: true, callback: () => this.steam() });
    this.showStage(1);
    document.body.className = (AU.muted ? "muted " : "") + "mode-" + (S.mode === "s1" ? "s1" : S.mode);
    this.input.on("gameobjectover", () => {}, this);
    this.scale.on("resize", () => {}, this);
    layout(); this.updateHits(); updateHud(true);
    if (S.mode === "s1") startStage1();
    if (S.mode === "title") showTitle();
    snore(S.mode !== "s2");
    bed("day");
  }
  fit(img, w) { img.setScale(w / img.width); return img; }
  makeObj(id, o, stage) {
    let img;
    if (id === "door") {
      img = this.add.image(DOOR.x + DOOR.w, DOOR.y, "door").setOrigin(1, 0).setDepth(3);
      img.setDisplaySize(DOOR.w, DOOR.h);
    } else {
      img = this.add.image(o.x, o.y, o.key).setOrigin(0.5, 1).setDepth(o.depth || (10 + Math.round(o.y / 100)));
      this.fit(img, o.w);
    }
    img.base = { x: img.x, y: img.y, sx: img.scaleX, sy: img.scaleY };
    const sil = this.add.image(img.x, img.y, img.texture.key).setOrigin(img.originX, img.originY).setDepth(img.depth - 0.1).setTintFill(INK).setVisible(false);
    sil.setScale(img.scaleX, img.scaleY);
    img.setInteractive({ useHandCursor: true });
    img.on("pointerdown", () => this.click(id));
    img.on("pointerover", () => this.hover(id, true));
    img.on("pointerout", () => this.hover(id, false));
    this.objs[id] = { id, cfg: o, stage, img, sil, tag: this.makeTag(id, o) };
  }
  makeTag(id, o) { const d = document.createElement("div"); d.className = "tag"; d.dataset.id = id; d.textContent = fill(o.label); ov.appendChild(d); return d; }
  updateHits() {
    // keep every clickable at least ~54 css px
    const minW = 54 / Math.max(L.s, 0.01);
    for (const o of Object.values(this.objs)) {
      const img = o.img; if (!img.input) continue;
      const w = img.width, h = img.height, dw = img.displayWidth, dh = img.displayHeight;
      const padX = Math.max(0, (minW - dw) / 2) / Math.abs(img.scaleX), padY = Math.max(0, (minW - dh) / 2) / Math.abs(img.scaleY);
      img.input.hitArea.setTo(-padX, -padY, w + padX * 2, h + padY * 2);
    }
  }
  hover(id, on) {
    const o = this.objs[id]; if (!o) return;
    const active = o.stage === stageNo() && (S.mode === "s1" || S.mode === "s2");
    o.tag.classList.toggle("hot", on && active);
    if (!active) return;
    if (o.sil) { o.sil.setVisible(on); o.sil.setScale(o.img.base.sx * 1.07, o.img.base.sy * 1.07); }
    if (on && id !== "door" && id !== "minh") { this.tweens.add({ targets: [o.img, o.sil], y: o.img.base.y - 8, duration: 140, ease: "Back.out" }); play("pop", { vol: 0.15, max: 1 }); }
    else if (id !== "door" && id !== "minh") this.tweens.add({ targets: [o.img, o.sil], y: o.img.base.y, duration: 140 });
  }
  showStage(n) {
    const one = n === 1;
    this.bg1.setVisible(one); this.fan.setVisible(one); this.bg2.setVisible(!one); this.desk.setVisible(!one); this.textbook.setVisible(!one); this.cone.setVisible(!one);
    for (const o of Object.values(this.objs)) {
      if (o.id === "minh") continue;
      const vis = o.stage === n; o.img.setVisible(vis); if (o.sil) o.sil.setVisible(false);
      if (vis) o.img.setInteractive({ useHandCursor: true }); else o.img.disableInteractive();
    }
    this.minh.setDepth(one ? 20 : 25);
    if (one) { this.minh.setPosition(BED.x, BED.y); this.setPose("bed_sleep", true); }
    else { this.minh.setPosition(DESK.x, DESK.y); this.setPose("desk_study", true); }
    this.updateHits(); placeTags();
  }
  setPose(p, silent) {
    if (!POSE[p]) p = "bed_sleep";
    let key = prof.g + "_" + p;
    if (!this.textures.exists(key)) key = (p.startsWith("bed") ? prof.g + "_bed_startled" : prof.g + "_desk_cheer");
    if (!this.textures.exists(key)) key = "m_" + p.replace("shy", "startled");
    if (this.pose === p && !silent) return;
    this.pose = p; this.minh.setTexture(key);
    const sc = POSE[p].w / this.minh.width; this.minh.baseScale = sc;
    if (silent) { this.minh.setScale(sc); return; }
    this.tweens.killTweensOf(this.minh);
    this.minh.setScale(sc * 1.18, sc * 0.82);
    this.tweens.add({ targets: this.minh, scaleX: sc, scaleY: sc, duration: 230, ease: "Back.out" });
  }
  click(id) {
    if (!S || S.paused || S.over || quizOpen()) return;
    const o = this.objs[id]; if (!o || o.stage !== stageNo() || !(S.mode === "s1" || S.mode === "s2")) return;
    unlock(); S.lastAct = S.t; S.nextJab = S.t + tv("jab_every") + 4;
    if (S.mode === "s1") s1Click(id); else s2Click(id);
  }
  squash(id) {
    const o = this.objs[id]; if (!o) return; const img = o.img; const b = img.base;
    this.tweens.killTweensOf(img);
    img.setScale(b.sx * 1.2, b.sy * 0.78);
    this.tweens.add({ targets: img, scaleX: b.sx, scaleY: b.sy, y: b.y, duration: 260, ease: "Back.out" });
  }
  shakeObj(id, ms = 400, amp = 6) {
    const o = this.objs[id]; if (!o) return; const img = o.img; const b = img.base;
    this.tweens.add({ targets: img, x: { from: b.x - amp, to: b.x + amp }, angle: { from: -4, to: 4 }, duration: 50, yoyo: true, repeat: Math.round(ms / 100), onComplete: () => { img.x = b.x; img.angle = 0; } });
  }
  jump(h = 60) {
    const m = this.minh; const y0 = m.y;
    this.tweens.add({ targets: m, y: y0 - h, duration: 140, ease: "Quad.out", yoyo: true, onComplete: () => { m.y = y0; } });
  }
  sweat(n = 6) {
    const hp = headPoint();
    for (let i = 0; i < n; i++) {
      const d = this.add.ellipse(hp.x, hp.y, 12, 18, 0x9fd8ff).setStrokeStyle(3, INK).setDepth(60);
      const a = rnd(-Math.PI, 0);
      this.tweens.add({ targets: d, x: hp.x + Math.cos(a) * rnd(70, 120), y: hp.y + Math.sin(a) * rnd(50, 100), alpha: 0, duration: 520, ease: "Quad.out", onComplete: () => d.destroy() });
    }
  }
  sparkle(n = 5) {
    const hp = headPoint();
    for (let i = 0; i < n; i++) {
      const s = this.add.star(hp.x + rnd(-70, 70), hp.y + rnd(-60, 30), 4, 5, 16, 0xFFF6E3).setStrokeStyle(3, INK).setDepth(60).setScale(0.2);
      this.tweens.add({ targets: s, scale: 1.2, angle: 90, alpha: 0, duration: 700, delay: i * 60, ease: "Quad.out", onComplete: () => s.destroy() });
    }
  }
  puff(x, y, n = 6, col = 0xFFF6E3) {
    for (let i = 0; i < n; i++) {
      const c = this.add.circle(x + rnd(-60, 60), y + rnd(-10, 10), rnd(14, 24), col).setStrokeStyle(3, INK).setDepth(55);
      this.tweens.add({ targets: c, y: c.y - rnd(20, 50), x: c.x + rnd(-30, 30), scale: 1.5, alpha: 0, duration: 600, ease: "Quad.out", onComplete: () => c.destroy() });
    }
  }
  cloud() {
    const hp = headPoint();
    const g = this.add.container(hp.x + 40, hp.y - 90).setDepth(60);
    [[0, 0, 30], [-30, 8, 22], [30, 8, 24], [12, -16, 22]].forEach(([x, y, r]) => g.add(this.add.circle(x, y, r, 0xb7b4c4).setStrokeStyle(3, INK)));
    g.setScale(0.3);
    this.tweens.add({ targets: g, scale: 1, y: g.y - 30, duration: 500, ease: "Back.out", hold: 700, yoyo: false, onComplete: () => this.tweens.add({ targets: g, alpha: 0, duration: 400, onComplete: () => g.destroy() }) });
  }
  zzz() {
    if (!S || S.paused) return;
    const sleepy = (this.pose === "bed_sleep" || this.pose === "bed_annoyed" || this.pose === "desk_sleep");
    if (!sleepy) return;
    const hp = headPoint();
    const z = this.add.text(hp.x + 30, hp.y - 30, "Z", { fontFamily: "Baloo 2", fontStyle: "800", fontSize: "44px", color: "#FFF6E3", stroke: "#1E1726", strokeThickness: 8 }).setDepth(60).setOrigin(0.5);
    this.tweens.add({ targets: z, x: z.x + rnd(40, 80), y: z.y - 120, angle: rnd(-20, 20), scale: 1.5, alpha: 0, duration: 1800, onComplete: () => z.destroy() });
    // snot bubble
    if (Math.random() < 0.6 && this.pose === "bed_sleep") {
      const b = this.add.circle(hp.x + 26, hp.y + 22, 7, 0xc9f0ff, 0.8).setStrokeStyle(2, INK).setDepth(59);
      this.tweens.add({ targets: b, scale: 2.2, duration: 600, yoyo: true, ease: "Sine.inOut", onComplete: () => b.destroy() });
    }
  }
  steam() {
    if (!S || S.paused) return;
    const id = stageNo() === 1 ? "mug" : "mug2"; const o = this.objs[id];
    if (!o || !o.img.visible) return;
    if (id === "mug" && S.sips1 >= 2) return; if (id === "mug2" && S.sips2 <= 0) return;
    const x = o.img.x + rnd(-14, 10), y = o.img.y - o.img.displayHeight + 6;
    const c = this.add.circle(x, y, rnd(6, 10), 0xFFF6E3, 0.8).setDepth(o.img.depth + 1);
    this.tweens.add({ targets: c, y: y - rnd(60, 90), x: x + rnd(-20, 20), scale: 2.2, alpha: 0, duration: 1600, ease: "Sine.out", onComplete: () => c.destroy() });
  }
  update(time, delta) {
    if (!S || S.paused) return;
    const dt = Math.min(delta, 100) / 1000;
    // fan oscillation
    if (this.fan.visible) this.fan.scaleX = this.fan.base * (0.82 + 0.18 * Math.cos(time / 1400));
    if (S.mode === "s1") tickS1(dt); else if (S.mode === "s2") tickS2(dt);
    updateHud();
  }
}

function stageNo() { return S && (S.mode === "s2" || S.stage2) ? 2 : 1; }
function headPoint() {
  if (!scene || !scene.minh) return { x: 600, y: 500 };
  const m = scene.minh, p = POSE[scene.pose] || POSE.bed_sleep;
  return { x: m.x - m.displayWidth / 2 + m.displayWidth * p.hx, y: m.y - m.displayHeight + m.displayHeight * p.hy };
}
function objTop(id) { const o = scene.objs[id]; if (!o) return { x: 0, y: 0 }; const i = o.img; if (id === "door") return { x: DOOR.x + DOOR.w / 2, y: 340 }; if (id === "minh") { const h = headPoint(); return { x: h.x, y: h.y - 70 }; } return { x: i.base.x, y: i.base.y - i.displayHeight }; }
function objMid(id) { const o = scene.objs[id]; const i = o.img; if (id === "door") return { x: DOOR.x + DOOR.w / 2, y: 460 }; if (id === "minh") return headPoint(); return { x: i.base.x, y: i.base.y - i.displayHeight / 2 }; }
function placeTags() {
  if (!scene || !scene.objs) return;
  for (const o of Object.values(scene.objs)) {
    const vis = o.stage === stageNo(); o.tag.style.display = vis ? "" : "none";
    if (!vis) continue; o.tag.textContent = fill(o.cfg.label);
    const p = o.cfg.below ? wp(o.img.base.x, o.img.base.y + 8 + 26 / L.s) : wp(objTop(o.id).x, objTop(o.id).y);
    let x = clamp(p.x, L.x + o.tag.offsetWidth / 2 + 2, L.x + L.size - o.tag.offsetWidth / 2 - 2);
    o.tag.style.left = x + "px"; o.tag.style.top = Math.max(L.y + o.tag.offsetHeight + 2, p.y - 4) + "px";
  }
}

/* ---------------- value changes ---------------- */
function addW(v, silent) {
  const before = S.W; S.W = clamp(S.W + v, 0, 100); const d = S.W - before;
  if (!silent && Math.abs(d) >= 0.5) { const h = headPoint(); floatNum(h.x, h.y - 40, (d > 0 ? "+" : "-") + Math.round(Math.abs(d)), d > 0 ? "w" : "l"); }
}
function addP(v) { const before = S.P; S.P = clamp(S.P + v, 0, 100); const d = S.P - before; if (d > 0) { const h = headPoint(); floatNum(h.x + 60, h.y - 10, "+" + Math.round(d) + "%", "p"); } }
function eff(id) { S.uses[id] = S.uses[id] || 0; const h = Math.max(0.35, Math.pow(0.72, S.uses[id])); S.uses[id] += 1; return h; }
function react(pose, ms) { scene.setPose(pose); S.react = ms / 1000; S.reactPose = pose; }

/* ---------------- stage 1 ---------------- */
function startStage1() {
  S.mode = "s1"; S.t = 0; document.body.className = (AU.muted ? "muted " : "") + "mode-s1";
  $("#goalText").textContent = fill("Bấm đồ vật, giải câu đố để đánh thức {n}. Đạt " + tv("s1_goal") + " tỉnh táo!");
  layout(); placeTags(); snore(true); bed("day");
  setTimeout(() => narrate(pick(JABS1.slice(0, 3))), 600);
}
const QUIZ1 = ["do", "logic", "do", "logic", "py"];
function s1Click(id) {
  const o = scene.objs[id];
  if (id === "phone") return s1Phone();
  if (id === "minh") return;
  if (S.cool[id] > S.t) { say(pick(["Từ từ đã, vừa dùng xong mà!", "Đợi chút, {n} còn đang choáng!"]), { from: objMid(id).x, ms: 1400 }); return; }
  scene.squash(id);
  ask(QUIZ1, o.cfg.label.toLowerCase().replace("dọa ma", "bộ đồ dọa ma").replace("gọi người đến", "cánh cửa"), (ok) => {
    if (ok === null) return;
    S.quizN++; if (ok) S.quizRight++;
    const k = ok ? 1 : tv("s1_wrong");
    narrate(ok ? pick(RIGHT) : pick(WRONG), 1800);
    S1ACT[id](k);
  });
}
function bigReact(id, word) { const m = objMid(id); burstAt(m.x, m.y - 20, word || scene.objs[id].cfg.word, scene.objs[id].cfg.color); scene.squash(id); }
const S1ACT = {
  alarm(k) {
    bigReact("alarm"); S.ring = 3; S.ringK = eff("alarm") * k; S.ringN++;
    S.ringH && S.ringH.stop(); S.ringH = play("alarm", { loop: true, vol: 0.7, max: 1 });
    addW(8 * S.ringK); react("bed_startled", 700); scene.jump(50); scene.sweat();
    setTimeout(() => { if (S.mode === "s1" && S.ring > 0) { react("bed_annoyed", 1800); say(G("Ồn quá... cho ngủ tí nữa...", "Ồn quá... cho em ngủ tí nữa..."), { from: 172 }); play("groan", { vol: 0.6 }); } }, 800);
    narrate("Báo thức kêu lần thứ " + (16 + S.ringN) + " rồi đấy!");
    S.cool.alarm = S.t + 3.5;
  },
  mug(k) {
    const h = eff("mug") * k;
    if (S.W < 35) { bigReact("mug", "HÍT HÀ..."); addW(8 * h); say(pick(["Mùi gì thơm thế nhỉ...", "Cà phê... ở đâu đó... zzz"]), { from: 300 }); S.cool.mug = S.t + 2; return; }
    if (S.sips1 >= 2) { say("Hết cà phê rồi... đời buồn quá.", { from: 300 }); S.cool.mug = S.t + 2; return; }
    S.sips1++; S.coffeeN++; bigReact("mug"); play("sip", { vol: 0.8 }); react("bed_coffee", 1300); addW(22 * k);
    setTimeout(() => { if (S.mode === "s1") { scene.sparkle(); say("*ỰC!* Sống lại rồi!!", { from: 300 }); } }, 700);
    S.cool.mug = S.t + 2.5;
  },
  chicken(k) {
    bigReact("chicken"); play("squeak", { vol: 0.9 }); play("boing", { vol: 0.5 });
    addW(12 * eff("chicken") * k); react("bed_startled", 900); scene.jump(90); scene.sweat(8);
    say(pick(["*GÀ* Ở ĐÂU RA?!", "Ai nhét gà vào chăn tôi?!", "Tim tôi rơi ra ngoài rồi!"]), { from: 600 });
    S.cool.chicken = S.t + 1.2;
  },
  books(k) {
    bigReact("books"); play("flop", { vol: 0.5 }); const h = eff("books") * k;
    if (S.W < 40) { addW(6 * h); say("Coursework... là món gì... ăn được không...", { from: 845 }); react("bed_annoyed", 1200); }
    else if (S.uses.books <= 3) { addW(16 * h); react("bed_startled", 1000); scene.sweat(); say(pick(["*COURSEWORK?!* Hạn nộp hôm nay á?!", G("*GPA ơi!!* Đợi anh!!", "*GPA ơi!!* Đợi em!!")]), { from: 845 }); }
    else { addW(4 * h); say("Biết rồi, biết rồi mà...", { from: 845 }); react("bed_annoyed", 1000); }
    S.cool.books = S.t + 2;
  },
  pots(k) {
    bigReact("pots"); play("clang", { vol: 0.85 }); scene.shakeObj("pots", 500, 8); scene.shakeObj("mug", 300, 4);
    addW(14 * eff("pots") * k); react("bed_startled", 900); scene.jump(70); scene.sweat();
    say(pick(["Đánh trống trận à?!", "Động đất!! Động đất!!", "Tai tôi ù hết rồi!"]), { from: 120 });
    S.cool.pots = S.t + 2;
  },
  costume(k) {
    const h = eff("costume") * k;
    ghostScare(() => {
      if (S.W < 30) { addW(12 * h); say("Ma... ma gì... cho ngủ cái...", { from: 395 }); react("bed_annoyed", 1400); }
      else { addW(tv("ghost_gain") * h + 4); react("bed_startled", 1200); scene.jump(110); scene.sweat(10); say(G("*MAAAA!!!* Cứu với!!", "*MAAAA!!!* Mẹ ơi cứu con!!"), { from: 395 }); S.drain = 8; }
    });
    S.cool.costume = S.t + 12;
  },
  door(k) {
    const h = eff("door") * k; S.doorN++;
    const seq = isF() ? ["crush", "teacher", "mum"] : ["teacher", "mum"];
    const who = seq[(S.doorN - 1) % seq.length];
    play("knock", { vol: 0.9 }); burstAt(DOOR.x + 30, 300, "CỘC CỘC!", "#F4C430");
    visitorDoor(who, () => {
      if (who === "teacher") { addW(15 * h); react("bed_startled", 1200); scene.jump(80); scene.sweat(); say(G("*TH-THẦY?!* Em dậy rồi ạ!!", "*TH-THẦY?!* Em dậy rồi ạ, thầy đừng nhìn!!"), { from: 1000 }); }
      else if (who === "mum") { addW(17 * h); react("bed_startled", 1000); scene.jump(60); say("Dạ dạ, con dậy đây!!", { from: 1000 }); }
      else { addW(22 * h); react("bed_shy", 1700); scene.jump(70); say(pick(["*ÁÁÁ!* Đừng nhìn! Tóc tớ như tổ quạ!!", "Chết rồi, mặt mình đầy vết gối!!"]), { from: 1000 }); narrate("Ngại quá nên tỉnh luôn!"); }
    });
    S.cool.door = S.t + 8;
  }
};
function s1Phone() {
  bigReact("phone"); play("ting", { vol: 0.8 }); S.phoneN++;
  if (S.ring > 0) {
    stopRing(); addW(-9); react("bed_annoyed", 1500);
    setTimeout(() => { play("flop", { vol: 0.6 }); scene.puff(BED.x, BED.y - 120); }, 300);
    say(pick(["Tắt... ngủ tiếp thôi...", "Thêm 5 phút nữa thôi mà..."]), { from: 488 });
    narrate("Điện thoại tắt báo thức, nhưng {n} lại ngủ tiếp rồi!");
    return;
  }
  if (isF() && !S.phoneF) {
    S.phoneF = 1; toast("<b>Nhóm lớp:</b> ai đăng ảnh {n} ngủ chảy dãi lên group thế này =))");
    addW(14); react("bed_shy", 1800); scene.jump(50);
    say("*XÓA NGAY!!* Ai chụp thế hả?!", { from: 488 }); narrate("Bị dìm hàng trên nhóm lớp, ngại muốn độn thổ!");
    return;
  }
  toast(pick(isF() ? TOASTS_F : TOASTS_M)); addW(4); react("bed_groggy", 1400);
  say("Ơ, có tin nhắn... lướt tí thôi...", { from: 488 });
  setTimeout(() => { if (S.mode === "s1") { addW(-8); react("bed_annoyed", 900); play("yawn", { vol: 0.5 }); narrate("Lướt điện thoại xong lại ngủ quên. Đúng là kẻ thù của báo thức!"); } }, 1700);
}
function stopRing() { S.ring = 0; if (S.ringH) { S.ringH.stop(); S.ringH = null; } }
function tickS1(dt) {
  if (quizOpen()) return;
  S.t += dt;
  if (S.ring > 0) {
    S.ring -= dt; addW(2.4 * S.ringK * dt, true);
    if (Math.random() < 0.5) scene.shakeObj("alarm", 100, 5);
    if (S.ring <= 0) stopRing();
  }
  let decay = tv("s1_decay") + S.W * tv("s1_slope");
  if (S.drain > 0) { S.drain -= dt; decay += tv("ghost_drain"); }
  addW(-decay * dt, true);
  // recover object habituation slowly
  for (const k in S.uses) S.uses[k] = Math.max(0, S.uses[k] - dt / 7);
  if (S.react > 0) { S.react -= dt; if (S.react <= 0) scene.setPose(s1Base()); }
  else if (scene.pose !== s1Base()) scene.setPose(s1Base());
  snore(scene.pose === "bed_sleep");
  if (S.t > S.nextJab) { S.nextJab = S.t + tv("jab_every") + rnd(0, 4); narrate(pick(JABS1)); }
  if (S.W >= tv("s1_goal") && !S.over) toStage2();
}
function s1Base() { return S.W >= 45 ? "bed_groggy" : "bed_sleep"; }

function ghostScare(after) {
  const g = scene.ghost; g.setVisible(true).setScale(0.15).setAlpha(1).setPosition(512, 560);
  scene.flash.setFillStyle(0x000000, 0.7);
  play("scare", { vol: 1 }); burstAt(512, 300, "HÙ!!!", "#FFF6E3"); screenShake();
  scene.tweens.add({ targets: g, scale: 0.9 * (900 / g.width), duration: 260, ease: "Back.out" });
  scene.time.delayedCall(250, after);
  scene.time.delayedCall(950, () => { scene.tweens.add({ targets: g, alpha: 0, scale: 0.2, duration: 260, onComplete: () => g.setVisible(false) }); scene.tweens.add({ targets: scene.flash, fillAlpha: 0, duration: 300 }); });
}
const VIS = { teacher: { name: "Thầy giáo", lines: ["{n}! Bài coursework của em đâu?", "Thầy chỉ chờ đến 23:59 thôi nhé!"] },
  mum: { name: "Mẹ", lines: [G("Mấy giờ rồi còn ngủ hả con?!", "Con gái con lứa gì mà ngủ đến giờ này!"), "Dậy ngay! Mẹ đếm đến 3!"] },
  crush: { name: "Crush", lines: ["Ơ... tớ mang tài liệu nhóm qua. Cậu... đang ngủ à?", "Tớ mua trà sữa cho cậu nè..."] } };
function visitorDoor(who, after) {
  const v = scene.visitor, d = scene.objs.door.img;
  v.setTexture(who); v.setOrigin(0.5, 1); const sc = 620 / v.height; v.setScale(sc); v.setPosition(DOOR.x + 60, 900).setVisible(true).setAlpha(1);
  scene.doorway.setVisible(true); v.setDepth(2);
  scene.tweens.add({ targets: d, scaleX: d.base.sx * 0.12, duration: 220, ease: "Quad.out" });
  v.x = DOOR.x + 140; scene.tweens.add({ targets: v, x: DOOR.x + 30, duration: 300, ease: "Back.out" });
  const lines = VIS[who].lines; const line = typeof lines[0] === "string" ? pick(lines) : lines[0];
  say(line, { who: VIS[who].name, at: { x: DOOR.x, y: 380 }, side: -1, ms: 2200 });
  scene.time.delayedCall(700, after);
  scene.time.delayedCall(2800, () => {
    scene.tweens.add({ targets: v, x: DOOR.x + 160, duration: 250, onComplete: () => { v.setVisible(false); scene.doorway.setVisible(false); } });
    scene.tweens.add({ targets: d, scaleX: d.base.sx, duration: 260, delay: 200, ease: "Back.out" });
  });
}

/* ---------------- transition ---------------- */
function toStage2() {
  S.over = true; S.mode = "trans"; stopRing(); snore(false);
  document.body.className = (AU.muted ? "muted " : "") + "mode-trans";
  mb?.event?.("stage1_cleared", { seconds: Math.round(S.t), quizzes: S.quizN });
  if (bubbleEl) bubbleEl.remove();
  react("bed_awake", 99); scene.sparkle(8); scene.jump(120);
  say("*DẬY RỒI!!!* Coursework, ta đến đây!", { ms: 1200 });
  const b = scene.blanket; b.setVisible(true).setPosition(BED.x + 40, BED.y - 120).setScale(0.45).setAngle(0);
  play("whoosh", { vol: 0.9 });
  scene.tweens.add({ targets: b, delay: 450, scale: 3.6, x: 512, y: 512, angle: -18, duration: 450, ease: "Quad.in", onComplete: () => {
    // swap under the blanket
    S.stage2 = true; scene.showStage(2); scene.dark.setFillStyle(0x0d1730, 0); bed("night");
    scene.tweens.add({ targets: b, y: 1700, angle: 25, scale: 2.2, duration: 500, ease: "Quad.in", delay: 120, onComplete: () => b.setVisible(false) });
    setTimeout(() => {
      const c = $("#stageCard"); c.classList.remove("hidden"); const n = c.querySelector(".slapnote"); n.className = "sticky slapnote"; play("slap", { vol: 0.8 });
      setTimeout(() => { n.classList.add("peel"); play("whoosh", { vol: 0.4 }); }, 1300);
      setTimeout(() => { c.classList.add("hidden"); startStage2(); }, 1800);
    }, 450);
  } });
}

/* ---------------- stage 2 ---------------- */
function startStage2() {
  Object.assign(S, { mode: "s2", over: false, stage2: true, W: tv("s2_wake"), P: 0, T: tv("s2_time"), t: 0, react: 0, uses: {}, cool: {}, nextJab: 6, nextBuzz: tv("buzz_every"), nextNod: 6, mumNext: 0 });
  document.body.className = (AU.muted ? "muted " : "") + "mode-s2";
  $("#goalText").textContent = fill("Bấm máy tính và trả lời đúng để làm bài. Xong 100% trước khi hết giờ!");
  layout(); placeTags(); scene.setPose("desk_study");
  say(G("Được rồi! *Chiến* thôi!", "Được rồi! *Chiến* thôi nào!"));
  setTimeout(() => narrate("Bấm máy tính để làm bài. Đừng đụng điện thoại!"), 900);
}
function s2Click(id) {
  if (S.busy > 0 && id !== "minh") { say("Đợi chút, đang bận mà!", { ms: 1000 }); return; }
  if (S.distract > 0 && id !== "phone") { say("Đang lướt dở mà... *hehe*", { ms: 1000 }); return; }
  ({ laptop: s2Laptop, mug2: s2Coffee, phone2: s2Phone, lamp: s2Lamp, ghost2: s2Ghost, minh: s2Minh })[id]?.();
}
function s2Laptop() {
  scene.squash("laptop");
  ask(["py", "py", "sql", "sql", "logic"], "máy tính", (ok) => {
    if (ok === null || S.mode !== "s2") return;
    S.quizN++; if (ok) S.quizRight++;
    const mult = (S.W >= 50 ? 1 : S.W >= 25 ? 0.8 : 0.6) * (S.distractPen > 0 ? 0.6 : 1) * (S.focus > 0 ? 1.35 : 1) * (S.shaky > 0 ? 0.75 : 1);
    const gain = (ok ? tv("work_right") : tv("work_wrong")) * mult;
    S.busy = 1.2; react("desk_study", 1200);
    const m = objMid("laptop"); burstAt(m.x, m.y - 60, "LẠCH CẠCH", "#2F6BFF"); play("typing", { vol: 0.7 });
    typer(ok ? null : "ERROR ERROR ERROR");
    addP(gain); addW(-(ok ? tv("work_cost") : tv("work_cost") + 2));
    say(ok ? pick(["Chạy ngon lành! Thêm một đoạn nữa!", "Code chạy rồi kìa!!", "Đúng rồi! Mình là thiên tài!"]) : pick(["Code lỗi đỏ lòm rồi!!", "Sai rồi... viết lại vậy.", "Ơ, sao nó báo lỗi?!"]), { from: 512 });
    if (!ok) narrate(pick(WRONG), 1800);
  });
}
function typer(txt) {
  const m = objMid("laptop"); const p = wp(m.x, m.y - 20); const d = document.createElement("div"); d.className = "typer";
  d.style.left = p.x + "px"; d.style.top = p.y + "px"; ov.appendChild(d);
  const chars = txt || "def nop_bai(): return True ";
  let i = 0; const iv = setInterval(() => { d.textContent = chars.slice(Math.max(0, i - 14), i + 1); i++; if (i > chars.length + 2) { clearInterval(iv); d.remove(); } }, 45);
}
function s2Coffee() {
  if (S.sips2 <= 0) { say("Hết sạch cà phê rồi!! *Huhu*", { from: 765 }); return; }
  if (S.cool.coffee > S.t) { say("Từ từ thôi, tim đập như trống rồi!", { from: 765 }); return; }
  scene.squash("mug2");
  ask(["do"], "cốc cà phê", (ok) => {
    if (ok === null || S.mode !== "s2") return;
    S.quizN++; if (ok) S.quizRight++;
    const n = tv("coffee_sips") - S.sips2; const g = tv("coffee_gain") * Math.max(0.5, 1 - n * 0.15) * (ok ? 1 : 0.4);
    S.sips2--; S.coffeeN++; S.cool.coffee = S.t + tv("coffee_cd");
    const m = objMid("mug2"); burstAt(m.x, m.y - 30, "ỰC ỰC!", "#5FD3A0"); play("sip", { vol: 0.9 });
    react("desk_coffee", 1500); addW(g); scene.sparkle(); S.busy = 0.8;
    say(ok ? pick(["*Tỉnh như sáo!*", "Cà phê sữa đá muôn năm!"]) : "Sặc... nhưng cũng tỉnh được tí.", { from: 765 });
    if (!ok) narrate(pick(WRONG), 1800);
    updateMug();
  });
}
function updateMug() {
  const o = scene.objs.mug2; const frac = S.sips2 / tv("coffee_sips");
  o.cfg.label = "Cà phê (" + S.sips2 + "/" + tv("coffee_sips") + " ngụm)"; placeTags();
  o.img.setAlpha(S.sips2 > 0 ? 1 : 0.55);
}
function s2Phone(auto) {
  const m = objMid("phone2"); burstAt(m.x, m.y - 30, "TING TING!", "#2F6BFF"); play("ting", { vol: 0.8 });
  scene.objs.phone2.img.setVisible(false); S.buzz = 0;
  S.distract = 4; S.phoneUses++; S.T = Math.max(0, S.T - tv("phone_time")); addW(tv("phone_wake"));
  floatNum(m.x, m.y - 80, "-" + tv("phone_time") + " giây", "l");
  react("desk_phone", 4000); $("#tint").classList.add("on");
  const list = isF() ? TOASTS_F : TOASTS_M;
  toast(pick(list)); setTimeout(() => toast(pick(list)), 1100); setTimeout(() => toast(pick(list)), 2200);
  say(auto ? "Ơ... có thông báo... *xem tí thôi*" : pick(["Xem một video thôi...", "Hehe... mèo béo..."]), { from: 880 });
  narrate(auto ? "{n} tự cầm điện thoại lên rồi! Lần sau bấm vào {n} để giữ tập trung." : "Lướt điện thoại: mất " + tv("phone_time") + " giây, làm bài chậm đi một lúc!");
}
function s2Lamp() {
  if (S.cool.lamp > S.t) { say("Vừa đọc giấy nhắc rồi mà!", { from: 165, ms: 1200 }); return; }
  S.cool.lamp = S.t + 25; S.focus = 10; addW(2);
  const m = objMid("lamp"); burstAt(m.x, m.y - 40, "CỐ LÊN!", "#F4C430"); scene.squash("lamp"); play("pop", { vol: 0.6 });
  react("desk_cheer", 1400);
  narrate(pick(["Giấy nhắc: \"Học xong mới được ngủ!\"", "Giấy nhắc: \"Nộp muộn là bị trừ điểm!\"", "Giấy nhắc: \"Qua môn là được, không cần đẹp!\""]));
  say("Tập trung 10 giây, làm bài nhanh hơn!", { from: 165 });
}
function s2Ghost() {
  if (S.cool.ghost > S.t) { say("Thôi, sợ lắm rồi! Đợi tí đã!", { from: 945, ms: 1300 }); return; }
  scene.squash("ghost2");
  ask(["do", "logic"], "bộ đồ dọa ma", (ok) => {
    if (ok === null || S.mode !== "s2") return;
    S.quizN++; if (ok) S.quizRight++;
    S.cool.ghost = S.t + 30;
    ghostScare(() => {
      react("desk_scared", 1500); addW(tv("ghost_gain") * (ok ? 1 : 0.45)); scene.jump(50); scene.sweat(10);
      say(G("*MAAAA!!* Tỉnh hẳn luôn!!", "*ÁÁÁ!!* Mẹ ơi, tỉnh hẳn rồi!!"), { from: 945 });
      S.drain = 10; S.shaky = 6;
      setTimeout(() => { if (S.mode === "s2") narrate("Tim đập thình thịch, tay run khi gõ một lúc..."); }, 1600);
    });
  });
}
const MOTIV = ["Mình làm được! Chắc thế...", "Qua môn là được, không cần đẹp!", "Nghĩ đến tấm bằng Greenwich đi {n}!", "Cố lên! Xong rồi đi trà sữa!", "Không ngủ! Không ngủ! *Không ngủ!*"];
function s2Minh() {
  if (S.nod > 0) { S.nod = 0; addW(6); react("desk_cheer", 1100); scene.sparkle(); play("boing", { vol: 0.6 }); say("Ơ! Mình vẫn thức! *Vẫn thức!*"); return; }
  if (S.buzz > 0) { S.buzz = 0; addW(2); react("desk_cheer", 1100); say("Không! *Tập trung!* Điện thoại để sau!"); narrate("Giữ được tập trung, giỏi lắm!"); return; }
  if (S.cool.minh > S.t) return;
  S.cool.minh = S.t + 2.5; S.uses.minh = (S.uses.minh || 0) + 1;
  addW(Math.max(1, 4 - S.uses.minh)); react("desk_cheer", 1100); play("pop", { vol: 0.5 });
  say(pick(MOTIV));
}
function tickS2(dt) {
  S.t += dt; S.T -= dt;
  for (const k of ["busy", "focus", "shaky", "distractPen"]) if (S[k] > 0) S[k] -= dt;
  for (const k in S.uses) S.uses[k] = Math.max(0, S.uses[k] - dt / 10);
  let decay = tv("s2_passive") + (S.W < 30 ? 0.08 : 0);
  if (S.drain > 0) { S.drain -= dt; decay += tv("ghost_drain"); }
  addW(-decay * dt, true);
  if (S.distract > 0) {
    S.distract -= dt;
    if (S.distract <= 0) { scene.objs.phone2.img.setVisible(true); $("#tint").classList.remove("on"); S.distractPen = 10; S.react = 0; }
  }
  // phone buzz hazard
  if (S.buzz > 0) {
    S.buzz -= dt; if (Math.random() < 0.4) scene.shakeObj("phone2", 100, 4);
    if (S.buzz <= 0 && !quizOpen()) s2Phone(true); else if (S.buzz <= 0) S.buzz = 0.5;
  } else if (S.t > S.nextBuzz && S.distract <= 0) {
    S.nextBuzz = S.t + tv("buzz_every") + rnd(0, 8); S.buzz = 4.5; play("ting", { vol: 0.6 });
    toast(pick(isF() ? TOASTS_F : TOASTS_M)); narrate("Điện thoại rung! Bấm vào {n} để giữ tập trung!");
  }
  // nodding off
  if (S.nod > 0) { S.nod -= dt; if (S.nod <= 0) { addW(-6); play("yawn", { vol: 0.5 }); react("desk_drowsy", 900); } }
  else if (S.W < 30 && S.t > S.nextNod && S.distract <= 0 && S.react <= 0) {
    S.nextNod = S.t + 7; S.nod = 2.6; react("desk_drowsy", 2600); scene.cloud(); scene.tweens.add({ targets: scene.minh, y: DESK.y + 14, duration: 300, yoyo: true, repeat: 2 });
    if (isF() && !S.camDone) { S.camDone = true; S.nod = 0; narrate("Ơ kìa, camera học nhóm online vẫn đang bật!"); setTimeout(() => { if (S.mode === "s2") { addW(14); react("desk_shy", 1600); say("*Chết!* Cả nhóm thấy mình ngủ gật rồi!!"); } }, 700); }
    else narrate("{n} đang gật gù kìa! Bấm vào {n} mau!");
  }
  // visitors
  if (S.W < 35 && S.t > S.mumNext && S.react <= 0) { S.mumNext = S.t + 45; visitorSide(isF() && !S.crushDone ? "crush" : "mum"); }
  for (const at of [S.T < tv("s2_time") - 60 ? 1 : 0, S.T < 60 && S.P < 85 ? 2 : 0]) if (at && !S.teacherDone[at] && S.react <= 0) { S.teacherDone[at] = 1; visitorSide("teacher"); }
  if (S.react > 0) { S.react -= dt; if (S.react <= 0) scene.setPose(s2Base()); }
  else if (S.distract <= 0 && scene.pose !== s2Base()) scene.setPose(s2Base());
  // laptop glow on the face
  scene.minh.setTint(S.distract > 0 ? 0x9bb5ff : 0xdfe6ff);
  if (S.t > S.nextJab) { S.nextJab = S.t + tv("jab_every") + rnd(2, 6); narrate(pick(JABS2)); }
  if (S.P >= 100) return finish(true, "win");
  if (S.W <= 0) return finish(false, "sleep");
  if (S.T <= 0) { S.T = 0; return finish(false, "time"); }
}
function s2Base() { return S.W < 30 ? "desk_drowsy" : "desk_study"; }
function visitorSide(who) {
  const v = scene.visitor; v.setTexture(who).setOrigin(0.5, 1); v.setScale(560 / v.height).setDepth(70).setVisible(true).setAlpha(1);
  v.setPosition(1250, 1024); scene.tweens.add({ targets: v, x: 880, duration: 320, ease: "Back.out" });
  play(who === "mum" ? "clang" : "knock", { vol: 0.6 });
  const L2 = { mum: ["Học hay ngủ đấy hả con?! Mẹ pha thêm cà phê rồi đấy!"], teacher: ["{n}! Thầy chỉ chờ đến 23:59 thôi nhé!", "Em làm đến đâu rồi? Thầy hỏi thật đấy!"], crush: ["Cậu xong phần của cậu chưa? Cả nhóm đang chờ đó..."] };
  say(pick(L2[who]), { who: VIS[who].name, at: { x: 880, y: 560 }, side: -1, ms: 2400 });
  setTimeout(() => {
    if (S.mode !== "s2") return;
    if (who === "mum") { addW(10); S.sips2 = Math.min(tv("coffee_sips"), S.sips2 + 1); updateMug(); react("desk_scared", 900); scene.jump(40); say("Dạ con đang học mà!!", { from: 1000 }); }
    else if (who === "teacher") { addW(8); S.focus = 8; react("desk_scared", 900); scene.sweat(); say("Dạ em đang làm ạ!!", { from: 1000 }); }
    else { S.crushDone = 1; addW(12); S.focus = 8; react("desk_shy", 1500); say("Ơ... *xong ngay đây!* Đừng nhìn tớ ngủ gật!!", { from: 1000 }); narrate("Ngại quá nên tỉnh luôn!"); }
  }, 900);
  setTimeout(() => { if (scene && v.visible) scene.tweens.add({ targets: v, x: 1300, duration: 300, onComplete: () => v.setVisible(false) }); }, 2900);
}

/* ---------------- end ---------------- */
function finish(win, why) {
  if (S.over) return; S.over = true; S.mode = "end"; stopRing(); closeQuiz(); $("#tint").classList.remove("on");
  const secs = Math.round(S.t);
  mb?.run?.end?.({ result: win ? "win" : why, stage: 2, seconds: secs, progress: Math.round(S.P), time_left: Math.round(S.T) });
  mb?.event?.(win ? "won" : "lost", { reason: why, progress: Math.round(S.P) });
  if (win) {
    scene.setPose("desk_victory"); scene.sparkle(10); play("win", { vol: 0.9 });
    say("*XONG RỒI!!!*", { ms: 1400 });
    setTimeout(() => cutscene(), 1500);
  } else {
    scene.setPose("desk_sleep"); play("lose", { vol: 0.9 }); scene.dark.fillAlpha = 0.45;
    scene.tweens.add({ targets: scene.cone, alpha: { from: 1, to: 0.15 }, duration: 90, yoyo: true, repeat: 9 });
    if (why === "sleep") typerLoop();
    const msg = S.phoneUses >= 3 ? "Thử lại nhé! Lần này đừng lướt điện thoại nữa!" : why === "time" ? "Toang rồi! Deadline không chờ ai cả." : "{n} đã ngủ, còn bài tập thì vẫn chưa xong.";
    setTimeout(() => showEnd(false, msg), 1400);
  }
}
/* ---------------- victory cutscene ---------------- */
let cineGo = null, cineSkip = false, cineOn = false;
const cineWait = (ms) => new Promise((r) => { const t = setTimeout(() => { cineGo = null; r(); }, ms); cineGo = () => { clearTimeout(t); cineGo = null; r(); }; });
$("#cine").addEventListener("click", (e) => { if (e.target.id === "cSkip") return; cineGo && cineGo(); });
$("#cSkip").onclick = () => { cineSkip = true; cineGo && cineGo(); };
function cap(html) { const c = $("#cCap"); c.innerHTML = fill(html); c.style.animation = "none"; void c.offsetWidth; c.style.animation = ""; play("slap", { vol: 0.35 }); }
function panel(src, cls) { const p = $("#cPanel"); p.className = "cpanel " + (cls || ""); $("#cImg").src = src; p.style.animation = "none"; void p.offsetWidth; p.style.animation = ""; }
async function cutscene() {
  cineOn = true; cineSkip = false; const g = prof.g; const c = $("#cine");
  document.body.className = (AU.muted ? "muted " : "") + "mode-end mode-cine";
  if (bubbleEl) bubbleEl.remove(); $("#note").className = "sticky hide";
  c.className = "full"; bed(null); snore(false);
  const steps = [
    async () => { panel("img/" + g + "_desk_cool.webp", "cool"); play("glow", { vol: 0.9 }); cap("Coursework xong 100%. {n} bỗng <b>phát sáng</b>... ngầu lòi!"); await cineWait(3000); },
    async () => { play("dream", { vol: 0.8 }); panel("img/" + g + "_dream_ceo.webp", "dream"); cap("Tương lai thứ nhất: <b>tỷ phú tập đoàn công nghệ</b> bước lên chuyên cơ riêng. Vé máy bay á? Mua luôn cả hãng!"); await cineWait(3600); },
    async () => { panel("img/" + g + "_dream_hacker.webp", "dream"); play("typing", { vol: 0.5 }); cap("Tương lai thứ hai: <b>hacker số một thế giới</b>. Các tập đoàn xếp hàng săn đón, lương trả bằng cả két tiền."); await cineWait(3600); },
    async () => { panel("img/" + g + "_dream_rich.webp", "dream"); play("win", { vol: 0.5 });
      cap(G("Tương lai thứ ba: giàu nứt đố đổ vách, <b>bạn gái vây quanh</b>. Nụ cười này đáng giá triệu đô. Hề hề hề!", "Tương lai thứ ba: giàu nứt đố đổ vách, <b>trai đẹp xếp hàng</b> tặng trà sữa. Nụ cười này đáng giá triệu đô. Hí hí hí!")); await cineWait(3800); },
    async () => { $("#cCall").classList.remove("hidden"); $("#cPanel").classList.add("ring"); const r = play("ringtone", { vol: 0.9, rate: 1, max: 1 }); cap("<b>Reng reng reng!</b> Ai gọi giữa giấc mơ đẹp thế này?"); await cineWait(2600);
      cap("Mẹ: \"Alo! {n} ơi, <b>8 giờ sáng</b> rồi! Hôm nay hạn nộp bài đấy, dậy chưa hả con?!\""); await cineWait(3200); r && r.stop(); },
    async () => { $("#cCall").classList.add("hidden"); $("#cPanel").className = "cpanel shatter"; play("whoosh", { vol: 0.9 }); await cineWait(500);
      morningRoom(); c.className = "over"; play("boing", { vol: 0.7 }); scene.setPose("bed_startled"); scene.jump(90); scene.sweat(8); bed("birds");
      cap("<b>PLOT TWIST:</b> từ nãy đến giờ, {n} vẫn đang <b>ngủ</b>!"); await cineWait(3200); },
    async () => { scene.setPose("bed_sleep"); cap("Chẳng có người bạn cùng phòng nào cố đánh thức cả. Báo thức, gà cao su, con ma... tất cả chỉ là <b>một giấc mơ</b>."); await cineWait(4000); },
    async () => { const a = scene.objs.alarm; burstAt(a.img.x, a.img.y - 90, "8:00 SÁNG!", "#E8483A"); scene.squash("alarm"); play("alarm", { vol: 0.5 }); cap("Đồng hồ điểm <b>8 giờ sáng</b>."); await cineWait(2600); },
    async () => { scene.setPose("bed_awake"); scene.sparkle(8); play("yawn", { vol: 0.6 }); cap("Lần này, {n} <b>tự mình</b> thức dậy. Không cần ai gọi, không cần gà cao su."); await cineWait(3200); },
    async () => { morningDesk(); scene.setPose("desk_study"); play("typing", { vol: 0.7 }); typer("print('Bắt đầu thôi!')");
      cap("...rồi ngồi vào bàn học và <b>tự giác</b> bắt đầu làm bài. Lần này là thật!"); await cineWait(3800); }
  ];
  for (const s of steps) { if (cineSkip || !cineOn) break; await s(); }
  if (!cineOn) return;
  cineOn = false; c.className = "hidden"; $("#cCall").classList.add("hidden");
  if (!S.stage2) {} morningDesk(); scene.setPose("desk_victory");
  showEnd(true, "Nộp bài thành công! {n} đã sống sót qua deadline!");
}
function morningRoom() {
  S.stage2 = false; scene.dark.fillAlpha = 0; scene.showStage(1);
  scene.bg1.setTexture("bg1m").setDisplaySize(WORLD, WORLD);
  scene.objs.alarm.img.setTexture("alarm8"); scene.objs.phone.img.setTexture("phonecall"); scene.objs.door.img.setVisible(false);
  scene.minh.clearTint(); for (const o of Object.values(scene.objs)) o.img.disableInteractive();
}
function morningDesk() {
  S.stage2 = true; scene.dark.fillAlpha = 0; scene.showStage(2);
  scene.bg2.setTexture("bg2m").setDisplaySize(WORLD, WORLD); scene.cone.setVisible(false); scene.minh.clearTint();
  for (const o of Object.values(scene.objs)) o.img.disableInteractive();
}
function typerLoop() { const m = objMid("laptop"); const p = wp(m.x, m.y - 20); const d = document.createElement("div"); d.className = "typer"; d.style.left = p.x + "px"; d.style.top = p.y + "px"; ov.appendChild(d); let s = ""; const iv = setInterval(() => { if (!d.isConnected) return clearInterval(iv); s += pick("jjjjkkkkfffdddsssaaa;;;"); d.textContent = s.slice(-14); }, 70); }
function showEnd(win, msg) {
  document.body.className = (AU.muted ? "muted " : "") + "mode-end";
  const e = $("#end"); e.classList.remove("hidden"); e.classList.toggle("lose", !win);
  $("#endImg").src = "img/" + prof.g + "_desk_" + (win ? "victory" : "sleep") + ".webp";
  $("#endMsg").textContent = fill(msg);
  $("#endStats").textContent = "Tiến độ: " + Math.round(S.P) + "% · Còn lại: " + Math.max(0, Math.round(S.T)) + " giây · Trả lời đúng: " + S.quizRight + "/" + S.quizN + " · Cà phê: " + S.coffeeN + " lần";
  const st = $("#stamp"); st.textContent = win ? "ĐÃ NỘP" : "TOANG"; st.className = "stamp";
  setTimeout(() => { st.classList.add("thud"); play("stamp", { vol: 1 }); setTimeout(screenShake, 250); }, 500);
  const rain = $("#rain"); rain.innerHTML = "";
  if (win) for (let i = 0; i < 26; i++) { const p = document.createElement("i"); p.className = Math.random() < 0.5 ? "y" : ""; p.style.left = rnd(0, 100) + "vw"; p.style.animationDuration = rnd(2.5, 5) + "s"; p.style.animationDelay = rnd(0, 2) + "s"; rain.appendChild(p); }
}

/* ---------------- HUD ---------------- */
const segs = []; (() => { const bar = $("#wBar"); for (let i = 0; i < 20; i++) { const s = document.createElement("i"); s.className = "s"; bar.appendChild(s); segs.push(s); } bar.appendChild($("#wGoal")); })();
const H = { w: -1, p: -1, t: -1, face: "" };
function updateHud(force) {
  if (!S) return;
  const w = Math.round(S.W);
  if (w !== H.w || force) {
    H.w = w; $("#wNum").textContent = w;
    const n = Math.ceil(S.W / 5); segs.forEach((s, i) => s.classList.toggle("f", i < n));
    const bar = $("#wBar"); bar.classList.toggle("mid", S.W < 50 && S.W >= 25); bar.classList.toggle("low", S.W < 25);
    const face = S.W >= 50 ? "awake" : S.W >= 25 ? "tired" : "asleep";
    const src = "img/" + prof.g + "_i_" + face + ".webp";
    if (H.face !== src) { H.face = src; const im = $("#wIcon"); im.src = src; im.classList.remove("pop"); void im.offsetWidth; im.classList.add("pop"); }
  }
  const p = Math.floor(S.P);
  if (p !== H.p || force) { H.p = p; $("#pNum").textContent = p + "%"; $("#pFill").style.width = p + "%"; }
  const t = Math.ceil(Math.max(0, S.T));
  if (t !== H.t || force) {
    H.t = t; $("#tNum").textContent = Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
    const c = $("#clock"); c.classList.toggle("warn", t < 30);
    if (t < 30 && S.mode === "s2") { c.classList.remove("wob"); void c.offsetWidth; c.classList.add("wob"); }
  }
  document.querySelectorAll(".nm").forEach((e) => { if (e.textContent !== NAME()) e.textContent = NAME(); });
}

/* ---------------- screens ---------------- */
function showTitle() {
  document.body.className = (AU.muted ? "muted " : "") + "mode-title";
  $("#title").classList.remove("hidden"); $("#end").classList.add("hidden"); $("#pause").classList.add("hidden");
  $("#nameIn").value = prof.name; document.querySelectorAll(".gbtn").forEach((b) => b.classList.toggle("sel", b.dataset.g === prof.g));
}
document.querySelectorAll(".gbtn").forEach((b) => b.onclick = () => {
  prof.g = b.dataset.g; play("pop", { vol: 0.5 });
  document.querySelectorAll(".gbtn").forEach((x) => x.classList.toggle("sel", x === b));
  if (scene && S.mode === "title") scene.setPose("bed_sleep", false);
  updateHud(true);
});
$("#nameIn").addEventListener("input", () => { prof.name = cleanName($("#nameIn").value) || ""; updateHud(true); });
function cleanName(s) { return (s || "").replace(/[<>{}*&"\\]/g, "").trim().slice(0, 12); }
let running = false;
function startGame() {
  if (!scene) { setTimeout(startGame, 300); return; }
  cineOn = false; $("#cine").className = "hidden";
  unlock(); prof.name = cleanName($("#nameIn").value) || tv("default_name"); $("#nameIn").value = prof.name;
  saveProfile();
  $("#title").classList.add("hidden"); $("#end").classList.add("hidden"); $("#pause").classList.add("hidden");
  if (running) mb?.run?.end?.({ result: "restart" });
  running = true; mb?.run?.start?.();
  scene.scene.restart({ mode: "s1" });
}
$("#bStart").onclick = (e) => { e.currentTarget.classList.add("press"); setTimeout(() => e.currentTarget && e.currentTarget.classList.remove("press"), 120); startGame(); };
$("#nameIn").addEventListener("keydown", (e) => { if (e.key === "Enter") startGame(); });
function goHome() {
  cineOn = false; $("#cine").className = "hidden";
  if (S && (S.mode === "s1" || S.mode === "s2" || S.mode === "trans") && running) mb?.run?.end?.({ result: "quit" });
  running = false; $("#pause").classList.add("hidden"); $("#end").classList.add("hidden");
  if (S && S.paused) { S.paused = false; scene.scene.resume(); if (AU.ctx) AU.ctx.resume(); }
  scene.scene.restart({ mode: "title" });
}
const HELP = () => `<ul>
<li><b>Giai đoạn 1:</b> bấm đồ vật, giải câu đố để đánh thức ${NAME()}. Đúng thì hiệu quả đầy đủ, sai thì yếu hơn. Đạt ${tv("s1_goal")} tỉnh táo là qua.</li>
<li>Gà cao su, nồi xoong chảo, báo thức làm giật mình. Cà phê hiệu quả khi đã hé mắt. Dọa ma cực mạnh nhưng mệt sau đó. Điện thoại tắt báo thức và làm ngủ lại!</li>
<li><b>Giai đoạn 2:</b> bấm máy tính, trả lời câu Python, SQL để làm bài. Mỗi lần làm bài thì mệt hơn một chút.</li>
<li>Cà phê: có hạn. Giấy nhắc trên đèn: tập trung 10 giây. Bấm vào ${NAME()} khi gật gù hoặc khi điện thoại rung.</li>
<li>Thua khi tỉnh táo về 0 hoặc hết giờ.</li></ul>`;
function pauseGame(help) {
  if (!S || S.over || !(S.mode === "s1" || S.mode === "s2" || S.mode === "trans")) {
    if (help) { $("#pTitle").textContent = "Hướng dẫn"; $("#helpBox").innerHTML = HELP(); $("#pause").classList.remove("hidden"); $("#bResume").textContent = "Đóng"; $("#bRestart").classList.add("hidden"); $("#bHome").classList.add("hidden"); }
    return;
  }
  if (S.paused) return;
  S.paused = true; scene.scene.pause(); if (AU.ctx) AU.ctx.suspend();
  mb?.run?.pause?.();
  $("#pTitle").textContent = help ? "Hướng dẫn" : "Tạm dừng"; $("#helpBox").innerHTML = help ? HELP() : "";
  $("#bResume").textContent = "Tiếp tục"; $("#bRestart").classList.remove("hidden"); $("#bHome").classList.remove("hidden");
  $("#pause").classList.remove("hidden");
}
function resumeGame() {
  $("#pause").classList.add("hidden");
  if (!S || !S.paused) return;
  S.paused = false; scene.scene.resume(); if (AU.ctx) AU.ctx.resume();
  mb?.run?.resume?.();
}
$("#bPause").onclick = () => pauseGame(false);
$("#bHelp").onclick = () => pauseGame(true);
$("#bResume").onclick = resumeGame;
$("#bRestart").onclick = () => { if (S && S.paused) { S.paused = false; scene.scene.resume(); mb?.run?.resume?.(); if (AU.ctx) AU.ctx.resume(); } startGame(); };
$("#bHome").onclick = goHome; $("#bHome2").onclick = goHome;
$("#bAgain").onclick = startGame;
document.addEventListener("visibilitychange", () => { if (document.hidden) pauseGame(false); });
addEventListener("keydown", (e) => { if (e.key === "Escape" || e.key === "p") { if (S && S.paused) resumeGame(); else pauseGame(false); } });

/* ---------------- saves ---------------- */
async function loadProfile() {
  try { const r = await mb?.load?.("profile"); if (r && r.value) { prof.name = cleanName(r.value.name) || prof.name; prof.g = r.value.g === "f" ? "f" : "m"; } profRev = true; } catch (e) { profRev = false; }
}
async function saveProfile() {
  if (!mb?.save || !profRev) return;
  try { await mb.save("profile", { schemaVersion: 1, name: prof.name, g: prof.g }); }
  catch (e) { if (e && e.reason === "REVISION_CONFLICT") { try { await mb.load("profile"); await mb.save("profile", { schemaVersion: 1, name: prof.name, g: prof.g }); } catch (_) {} } }
}

/* ---------------- boot ---------------- */
mb?.measure?.([{ name: "stage1_cleared", kind: "step", label: "Đánh thức thành công" }, { name: "won", kind: "step", label: "Nộp bài thành công" }, { name: "lost", kind: "count", label: "Thua" }]);
window.__ddg = { wp: (x, y) => wp(x, y), get S() { return S; }, get scene() { return scene; }, prof, finish, toStage2, s1Click: (id) => scene.click(id), answer: (ok) => { const b = [...$("#qAns").children]; const q = b.find((x) => ok ? x.dataset.ok : !x.dataset.ok); q && q.click(); return !!q; }, quizOpen, closeQuiz };
Promise.all([(mb?.tune ? mb.tune() : fromFile()), loadProfile(), document.fonts ? Promise.race([document.fonts.load("800 20px 'Baloo 2'"), new Promise((r) => setTimeout(r, 1500))]) : 0]).then(([vals]) => {
  T = vals || {}; applyTune(); if (!prof.name) prof.name = tv("default_name");
  mb?.tune?.on?.((next) => { T = next || {}; applyTune(); });
  loadSounds();
  game = new Phaser.Game({ type: Phaser.AUTO, parent: "game", width: Math.round(innerWidth * DPR()), height: Math.round(innerHeight * DPR()), transparent: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.NO_CENTER }, scene: [], render: { antialias: true } });
  game.scene.add("room", Room, true, { mode: "title" });
  game.events.once("ready", () => {});
  setTimeout(() => $("#loading").classList.add("hidden"), 300);
  addEventListener("resize", () => { layout(); scene && scene.updateHits && scene.updateHits(); });
  layout();
});
})();
