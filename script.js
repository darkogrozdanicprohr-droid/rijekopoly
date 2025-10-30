// Rijekopoly — osnovna web verzija
// Autor: automatski generator prilagođen Josipi

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const rollBtn = document.getElementById('rollBtn');
const diceResult = document.getElementById('diceResult');
const turnLabel = document.getElementById('turnLabel');
const msg = document.getElementById('msg');

const fieldName = document.getElementById('fieldName');
const fieldPrice = document.getElementById('fieldPrice');
const fieldOwner = document.getElementById('fieldOwner');
const buyBtn = document.getElementById('buyBtn');

const moneyEls = [document.getElementById('money0'), document.getElementById('money1')];
const lapsEls = [document.getElementById('laps0'), document.getElementById('laps1')];

const W = canvas.width;
const H = canvas.height;

// postavke
const START_MONEY = 1500;
const MAX_LAPS = 3;

// definiraj imena polja (iz tvoje liste)
const fieldNames = [
"START - Dobrodošli u Rijeku",
"Dom mladih Rijeka",
"Odjel za mlade – Knjižnica",
"PRILIKA!",
"Programi – Radionice",
"Savjet mladih grada Rijeke",
"Programi – Radionice",
"ZATVOR",
"Lista stanova za mlade",
"Portal za mlade / komunikacija",
"Država ti poklanja 200 $",
"Najbliži za kulturne programe",
"Bezplatni gradski prijevoz",
"Sufinanciranje prijevoza za studente",
"PRILIKA!",
"Online savjetovalište / karijerni servis",
"Programi socijalne i zdravstvene zaštite mladih",
"Eduktivne i mentorska aktivnost (škole)",
"Kulturni i festivalski programi",
"PRILIKA!",
"Odmoranca",
"Država ti poklanja 200 $",
"Volonterski centar Rijeka",
"ZATVOR",
"Povratak na START",
"Studentski centar Rijeka",
"Gradska galerija / Art kino Croatia",
"Startup Inkubator Rijeka",
"PRILIKA!",
"Edukacija o digitalnim vještinama",
"Gradska tržnica - lokalni proizvodi",
"Centar za tehničku kulturu (CTK Rijeka)",
"IZAZOV",                // index 33 -> izazov
"Dan grada Rijeke – manifestacija",
"PRILIKA!",
"Čeka kuća i Art kvart Benčić",
"Program \"Mladi za zajednicu\"",
"Studentski posao / ljetna praksa",
"PRILIKA!"
];

// generiraj cijene i najam (jednostavno)
// želimo povećati pločice za ~30% i smanjiti broj pozicija po strani tako da pločice stanu na isti canvas
const TILE_SEGMENTS_BASE = 9; // originalno je korišteno 9 segmenata (10 polja po strani)
const SCALE = 1.40; // cilj: 40% veće pločice (povećano još za ~10%)
// smanjenje fonta za 10% prema zahtjevu
const FONT_SCALE = 0.90;
const segments = Math.max(6, Math.round(TILE_SEGMENTS_BASE / SCALE));
const POSITIONS_PER_SIDE = segments + 1; // broj polja po strani
const POS_COUNT = POSITIONS_PER_SIDE * 4; // ukupno polja na ploči

// generiraj cijene i najam (jednostavno)
const prices = [];
for (let i=0;i<POS_COUNT;i++){
  // start/posebna polja imaju 0
  if (i===0) prices.push(0);
  else {
  // izazov ili PRILIKA nemaju kupovinu
  // fieldNames may be shorter than 40 in some edits — guard against undefined
  const name = (fieldNames[i] || "").toUpperCase();
    if (name.includes("PRILIKA") || name.includes("IZAZOV") || name.includes("ZATVOR") || name.includes("START") || name.includes("DRŽAVA") || name.includes("POKLON")) {
      prices.push(0);
    } else {
      // cijena ovisi o poziciji
      const base = 100 + Math.round((i%POSITIONS_PER_SIDE) * 20 + Math.floor(i/POSITIONS_PER_SIDE)*30);
      prices.push(base);
    }
  }
}
function rentFor(i){ return Math.max(10, Math.round(prices[i]*0.25)); }

// polja: pozicije oko kvadrata
const fields = [];
// računamo širinu/visinu ćelije tako da pločice budu veće (~SCALE) ali stanu u canvas
const refMargin = 100;
// broj segmenata koji koristimo po strani = segments (računato gore)
const cellW = (W - 2*refMargin) / segments;
const cellH = (H - 2*refMargin) / segments;
// margin-e prilagođavamo tako da pločice centriramo
const marginX = refMargin;
const marginY = refMargin;
const coords = [];

// generiraj pozicije koordinata oko kvadrata (clockwise) počevši od bottom-right (index 0)
// koristimo POS_COUNT pozicija koje proizlaze iz izračuna broja segmenata po strani.
for (let i=0;i<POS_COUNT;i++){
  let x,y;
  const side = Math.floor(i / POSITIONS_PER_SIDE);
  const idxOnSide = i % POSITIONS_PER_SIDE;
  if (side === 0){ // bottom row, right->left
    const t = idxOnSide;
    x = W - marginX - t*cellW - cellW/2;
    y = H - marginY + cellH/2;
  } else if (side === 1){ // left column, bottom->top
    const t = idxOnSide-1;
    x = marginX - cellW/2;
    y = H - marginY - (t+1)*cellH + cellH/2;
  } else if (side === 2){ // top row, left->right
    const t = idxOnSide-1;
    x = marginX + (t+1)*cellW - cellW/2;
    y = marginY - cellH/2;
  } else { // right column, top->bottom
    const t = idxOnSide-1;
    x = W - marginX + cellW/2;
    y = marginY + (t+1)*cellH - cellH/2;
  }
  coords.push({x,y});
  fields.push({
    index: i,
    name: fieldNames[i] || `Polje ${i}`,
    price: prices[i],
    owner: null
  });
}

// igrači
const players = [
  { id:0, name:"Crveni", color:"#e74c3c", pos:0, money:START_MONEY, laps:0 },
  { id:1, name:"Plavi", color:"#2980b9", pos:0, money:START_MONEY, laps:0 }
];
let turn = 0; // 0 crveni, 1 plavi
let rolling = false;
let gameOver = false;

// crtaj ploču i elemente
function drawBoard(){
  ctx.clearRect(0,0,W,H);
  // centralni kvadrat
  ctx.fillStyle = "#f7e7d6";
  const centerW = Math.max(200, Math.round(cellW * 3));
  const centerH = Math.max(200, Math.round(cellH * 3));
  ctx.fillRect(W/2 - centerW/2, H/2 - centerH/2, centerW, centerH);

  // helper: wrap text into multiple lines to fit inside tile
  function wrapTextToLines(context, text, maxWidth){
    if (!text) return [];
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line ? (line + ' ' + words[n]) : words[n];
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = words[n];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // polja (male pravokutnike)
  for (let i=0;i<POS_COUNT;i++){
    const c = coords[i];
  // compute orientation sizes (use computed cell sizes so tiles touch)
  const w = Math.round(cellW);
  const h = Math.round(cellH);
    // outline
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = "#fff8f0";
    ctx.strokeStyle = "#c9b89f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-w/2, -h/2, w, h);
    ctx.fill();
    ctx.stroke();

    // owner color band at top
    if (fields[i] && fields[i].owner !== null){
      ctx.fillStyle = players[fields[i].owner].color;
      const bandH = Math.max(6, Math.round(h * 0.12));
      ctx.fillRect(-w/2, -h/2, w, bandH);
    }

    // small text (wrapped). reduce font by FONT_SCALE
    ctx.fillStyle = "#222";
    const baseFontPx = Math.max(8, Math.round(h * 0.18 * FONT_SCALE));
    ctx.font = baseFontPx + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = (fields[i] && fields[i].name) || '';
    // measure available width inside tile (leave small padding)
    const paddingX = Math.max(6, Math.round(w * 0.08));
    const availableWidth = w - paddingX * 2;
    const lines = wrapTextToLines(ctx, label, availableWidth);
    // compute vertical start so lines are vertically centered
    const lineHeight = Math.round(baseFontPx * 1.15);
    const totalHeight = lines.length * lineHeight;
    let startY = - (totalHeight / 2) + (lineHeight/2);
    // draw lines
    for (let li = 0; li < lines.length; li++){
      ctx.fillText(lines[li], 0, startY + li * lineHeight);
    }

    // prices are intentionally not drawn on the tile faces (shown in HUD instead)
    ctx.restore();
  }

  // nacrtaj figure
  for (const p of players){
    const c = coords[p.pos];
    ctx.beginPath();
    ctx.fillStyle = p.color;
    // kako bi se obje figure vidjele lagano ofsestiraj
    const offset = p.id===0 ? -12 : 12;
    ctx.arc(c.x+offset, c.y-20, 12, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.stroke();
  }

  // nacrtaj START u donjem desnom kutu (index 0)
  ctx.fillStyle = "#f0c987";
  const s = coords[0];
  ctx.beginPath();
  const startW = Math.round(cellW);
  const startH = Math.round(cellH);
  ctx.rect(s.x - startW/2, s.y - startH/2, startW, startH);
  ctx.fill();
  ctx.strokeStyle = "#b48a3a";
  ctx.stroke();
  ctx.fillStyle = "#000";
  ctx.font = Math.max(10, Math.round(startH * 0.18 * FONT_SCALE)) + "px Arial";
  ctx.fillText("START / KRAJ", s.x, s.y);
}

// helper: update HUD
function updateHUD(){
  moneyEls[0].textContent = players[0].money;
  moneyEls[1].textContent = players[1].money;
  lapsEls[0].textContent = players[0].laps;
  lapsEls[1].textContent = players[1].laps;
  turnLabel.textContent = players[turn].name;
}

// klik na canvas - vidi koje polje je kliknuto
canvas.addEventListener('click', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // provjeri najbliže polje (oko centra polja s tolerancijom)
  let clicked = -1;
  for (let i=0;i<coords.length;i++){
    const c = coords[i];
    const dx = x-c.x, dy = y-c.y;
    if (Math.abs(dx) <= cellW/2 && Math.abs(dy) <= cellH/2){
      clicked = i;
      break;
    }
  }
  if (clicked>=0){
    showFieldInfo(clicked);
  }
});

function showFieldInfo(i){
  const f = fields[i];
  fieldName.textContent = `${i}. ${f.name}`;
  fieldPrice.textContent = (f.price>0) ? `Cijena: ${f.price}$` : `Ne može se kupiti`;
  fieldOwner.textContent = (f.owner===null) ? `Vlasnik: nitko` : `Vlasnik: ${players[f.owner].name}`;
  if (f.price>0 && f.owner===null){
    buyBtn.classList.remove('hidden');
    buyBtn.disabled = players[turn].money < f.price;
    buyBtn.onclick = ()=>{ buyField(i); };
  } else {
    buyBtn.classList.add('hidden');
    buyBtn.onclick = null;
  }
}

// kupovina polja
function buyField(i){
  const p = players[turn];
  const f = fields[i];
  if (p.money >= f.price && f.owner===null && f.price>0){
    p.money -= f.price;
    f.owner = turn;
    msg.textContent = `${p.name} je kupio ${f.name} za ${f.price}$`;
    drawBoard();
    updateHUD();
  // sakrij info
  buyBtn.classList.add('hidden');
  } else {
    msg.textContent = `Ne možeš kupiti ovo polje.`;
  }
  checkGameOver();
}

// bacanje kocke i pomicanje
rollBtn.addEventListener('click', async ()=>{
  if (rolling || gameOver) return;
  rolling = true;
  msg.textContent = "";
  rollBtn.disabled = true;
  const d = Math.floor(Math.random()*6)+1;
  diceResult.textContent = d;
  await animateMove(d);
  rolling = false;
  rollBtn.disabled = false;
  checkGameOver();
});

// animirano kretanje korak-po-korak
function animateMove(steps){
  return new Promise((resolve)=>{
    const player = players[turn];
    let remaining = steps;
    const stepTime = 300;
    const interval = setInterval(()=>{
      const prevPos = player.pos;
  player.pos = (player.pos + 1) % POS_COUNT;
      // ako smo prošli preko START (pos postao 0 nakon povećanja), povećaj laps
      if (player.pos === 0) {
        player.laps += 1;
        msg.textContent = `${player.name} je završio krug (${player.laps}).`;
      }
      drawBoard();
      updateHUD();

      remaining--;
      if (remaining<=0){
        clearInterval(interval);
        // nakon završetka poteza: obradi polje
        processLanding(player.pos);
        // switch turn (ako igra nije gotova)
        if (!gameOver){
          turn = 1 - turn;
          updateHUD();
        }
        resolve();
      }
    }, stepTime);
  });
}

// kad igrač stane na polje
function processLanding(index){
  const player = players[turn];
  const f = fields[index];
  // PRILIKA / IZAZOV / ZATVOR / START
  const name = f.name.toUpperCase();
  if (name.includes("PRILIKA")){
    // give small bonus ili kazna
    const delta = (Math.random()>0.5) ? 100 : -50;
    player.money += delta;
    msg.textContent = `${player.name} dobiva PRILIKU: ${delta>=0 ? '+'+delta : delta }$`;
  } else if (name.includes("IZAZOV")){
    // izazov: ponekad plati, ponekad dobije
    const delta = (Math.random()>0.5) ? 150 : -100;
    player.money += delta;
    msg.textContent = `${player.name} je naišao na IZAZOV: ${delta>=0 ? '+'+delta : delta }$`;
  } else if (name.includes("ZATVOR")){
    msg.textContent = `${player.name} je u ZATVORU (ništa se ne događa)`;
  } else if (f.price>0 && f.owner===null){
    msg.textContent = `${player.name} stoji na slobodnom polju ${f.name}. Možeš ga kupiti (klik na polje).`;
    // ne automatski kupi — igrač može kliknuti buy u panelu
  } else if (f.owner===turn){
    msg.textContent = `${player.name} stoji na svom polju ${f.name}.`;
  } else if (f.owner!==null && f.owner!==turn){
    // plati rent
    const to = f.owner;
    const rent = rentFor(index);
    player.money -= rent;
    players[to].money += rent;
    msg.textContent = `${player.name} plaća rent ${rent}$ vlasniku ${players[to].name} za ${f.name}.`;
  } else if (index===0){
    // START - mali bonus
    player.money += 200;
    msg.textContent = `${player.name} je prošao START i dobiva 200$.`;
  } else {
    msg.textContent = `${player.name} stoji na ${f.name}.`;
  }
  updateHUD();
}

// provjeri kraj igre
function checkGameOver(){
  // tko je bankrotirao?
  for (const p of players){
    if (p.money < 0){
      gameOver = true;
      msg.textContent = `${p.name} je bankrotirao! Kraj igre.`;
      announceWinner();
      rollBtn.disabled = true;
      return;
    }
  }
  // provjeri laps
  for (const p of players){
    if (p.laps >= MAX_LAPS){
      gameOver = true;
      msg.textContent = `Igra završava jer je ${p.name} odigrao ${MAX_LAPS} kruga.`;
      announceWinner();
      rollBtn.disabled = true;
      return;
    }
  }
}

// odredi pobjednika po novcu
function announceWinner(){
  const sorted = [...players].sort((a,b)=>b.money-a.money);
  const top = sorted[0];
  const second = sorted[1];
  if (top.money === second.money){
    msg.textContent += ` Neriješeno: oba imaju ${top.money}$.`;
  } else {
    msg.textContent += ` Pobjednik: ${top.name} s ${top.money}$!`;
  }
}

// inicijalno
drawBoard();
updateHUD();
msg.textContent = "Klikni polje za info, ili Baci kocku za kretanje.";

// inicijalna info na klik default
canvas.addEventListener('dblclick', (e)=>{
  // dvoklik resetira igru (samo za razvoj)
  // ne raditi automatski; ostavio kao debug: držite SHIFT+double-click za reset
  if (!e.shiftKey) return;
  resetGame();
});

function resetGame(){
  // reset
  for (const f of fields){ f.owner = null; }
  players[0].money = START_MONEY; players[0].pos=0; players[0].laps=0;
  players[1].money = START_MONEY; players[1].pos=0; players[1].laps=0;
  turn = 0; gameOver=false; msg.textContent="Igra resetirana.";
  drawBoard(); updateHUD();
}
