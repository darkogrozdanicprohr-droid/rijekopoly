// Rijekopoly - HTML verzija
// Converted from canvas to HTML elements

// DOM Elements
const board = document.getElementById('board');
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

// Game Constants
const START_MONEY = 1500;
const MAX_LAPS = 3;

// Field names (same as original)
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
    "IZAZOV",
    "Dan grada Rijeke – manifestacija",
    "PRILIKA!",
    "Čeka kuća i Art kvart Benčić",
    "Program \"Mladi za zajednicu\"",
    "Studentski posao / ljetna praksa",
    "PRILIKA!"
];

// Board Configuration
const TILE_SEGMENTS_BASE = 9;
const SCALE = 1.40;
const segments = Math.max(6, Math.round(TILE_SEGMENTS_BASE / SCALE));
const POSITIONS_PER_SIDE = segments + 1;
const POS_COUNT = POSITIONS_PER_SIDE * 4;

// Generate prices (same logic as original)
const prices = [];
for (let i = 0; i < POS_COUNT; i++) {
    if (i === 0) prices.push(0);
    else {
        const name = (fieldNames[i] || "").toUpperCase();
        if (name.includes("PRILIKA") || name.includes("IZAZOV") || name.includes("ZATVOR") || 
            name.includes("START") || name.includes("DRŽAVA") || name.includes("POKLON")) {
            prices.push(0);
        } else {
            const base = 100 + Math.round((i % POSITIONS_PER_SIDE) * 20 + Math.floor(i / POSITIONS_PER_SIDE) * 30);
            prices.push(base);
        }
    }
}

function rentFor(i) { return Math.max(10, Math.round(prices[i] * 0.25)); }

// Game state
const fields = [];
const tiles = []; // DOM elements for each field

// Tile descriptions with detailed information
const tileDescriptions = {
    "Lista stanova za mlade": {
        description: "Program stambenog zbrinjavanja mladih",
        details: [
            "Informacije o slobodnim stanovima",
            "Pregled raspona cijena (min-max)",
        ],
        link: "https://www.rijeka.hr/gradska-uprava/gradsko-vijece/savjet-mladih-grada-rijeke/"
    },
    "Dom mladih Rijeka": {
        description: "Programi i radionice za mlade",
        details: [
            "Nadolazeće radionice i edukacije",
            "Mogućnosti za prijave na programe"
        ],
        link: "https://dom-mladih.hr/aktivnosti/"
    },
    "Odjel za mlade – Knjižnica": {
        description: "Gradska knjižnica Rijeka (Rasadnik)",
        details: [
            "Informacije o prostorima za mlade",
            "Promotivni programi i aktivnosti"
        ],
        link: "https://gkr.hr/o-nama/projekti--p-27"
    },
    "Portal za mlade / komunikacija": {
        description: "Moja Rijeka - portal za mlade",
        details: [
            "Digitalna platforma za sudjelovanje",
            "Informacije i novosti za mlade"
        ],
        link: "https://www.mojarijeka.hr/"
    },
    "Najbliži za kulturne programe": {
        description: "Natječaji i javni pozivi za kulturne programe mladih",
        details: [
            "Pregled natječaja za projekte",
            "Informacije o poticajima"
        ],
        link: "https://www.rijeka.hr/teme-za-gradane/obitelj-i-drustvena-skrb/mladi/program-za-mlade-grada-rijeke/"
    },
    "Bezplatni gradski prijevoz": {
        description: "Besplatni gradski prijevoz za srednjoškolce",
        details: [
            "Potrebna dokumentacija za prijavu",
            "Informacije o programu"
        ],
        link: "https://www.rijeka.hr/teme-za-gradane/obitelj-i-drustvena-skrb/mladi/besplatan-javni-gradski-prijevoz-za-srednjoskolce/"
    },
    "Sufinanciranje prijevoza za studente": {
        description: "Program sufinanciranja javnog prijevoza",
        details: [
            "Potrebna dokumentacija",
            "Rokovi za predaju",
            "Uvjeti sufinanciranja"
        ],
        link: "https://www.rijeka.hr"
    },
    "Savjet mladih grada Rijeke": {
        description: "Participacija mladih u odlučivanju",
        details: [
            "Aktivnosti za uključivanje mladih",
            "Poticanje dijaloga",
            "Razvoj kritičkog razmišljanja"
        ],
        link: "https://www.rijeka.hr/gradska-uprava/gradsko-vijece/savjet-mladih-grada-rijeke/"
    },
    "Online savjetovalište / karijerni servis": {
        description: "Podrška pri zapošljavanju mladih",
        details: [
            "Pomoć pri izradi CV-a",
            "Savjeti za traženje posla",
            "Karijerno usmjeravanje"
        ],
        link: "https://www.ctk-rijeka.hr/"
    },
    "Programi socijalne i zdravstvene zaštite mladih": {
        description: "Socijalna i zdravstvena podrška",
        details: [
            "Programi socijalne zaštite",
            "Prevencija i podrška mladima",
            "Pomoć ugroženima"
        ],
        link: "https://www.rijeka.hr"
    },
    "Eduktivne i mentorska aktivnost (škole)": {
        description: "Obrazovni programi i mentorstvo",
        details: [
            "Školske radionice",
            "Projekti cjeloživotnog učenja",
            "Razvoj kompetencija"
        ],
        link: "https://dom-mladih.hr/aktivnosti/"
    },
    "Kulturni i festivalski programi": {
        description: "Manifestacije i događanja za mlade",
        details: [
            "Student Day festival",
            "Kulturni programi",
            "Studentska događanja"
        ],
        link: "https://www.rijeka.hr"
    }
};

// Function to get description HTML for a tile
function getTileDescriptionHTML(i) {
    const name = fieldNames[i];
    if (!name) return "Nema opisa za ovo polje.";
    
    // Find matching description
    for (const [key, value] of Object.entries(tileDescriptions)) {
        if (name.includes(key)) {
            return `
                <div class="tile-desc-content">
                    <p>${value.description}</p>
                    <ul>
                        ${value.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                    <p><a href="${value.link}" target="_blank" class="info-link">Više informacija</a></p>
                </div>
            `;
        }
    }
    
    // Default description for special fields
    if (name.includes("PRILIKA")) return "<p>Polje prilike! Možeš dobiti ili izgubiti novac.</p>";
    if (name.includes("IZAZOV")) return "<p>Polje izazova! Testiraj svoju sreću.</p>";
    if (name.includes("ZATVOR")) return "<p>Zatvor - odmori jedan krug.</p>";
    if (name.includes("START")) return "<p>Početno polje - dobij 200$ kada prođeš preko njega!</p>";
    
    return "<p>Običnо polje bez posebnog opisa.</p>";
}

// Players
const players = [
    { id: 0, name: "Plavi", color: "#2980b9", pos: 0, money: START_MONEY, laps: 0, element: null },
    { id: 1, name: "Crveni", color: "#e74c3c", pos: 0, money: START_MONEY, laps: 0, element: null }
];
let turn = 0;
let rolling = false;
let gameOver = false;

// Create board layout
function createBoard() {
    // Clear existing board
    while (board.children.length > 1) { // Keep the center div
        board.removeChild(board.lastChild);
    }

    // Create tiles
    for (let i = 0; i < POS_COUNT; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.index = i;

        // Position the tile
        const side = Math.floor(i / POSITIONS_PER_SIDE);
        const idxOnSide = i % POSITIONS_PER_SIDE;
        const totalSize = board.clientWidth;
        const margin = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--board-margin'));
        const tileSize = (totalSize - 2 * margin) / segments;

        // Set tile size
        tile.style.width = tile.style.height = tileSize + 'px';

        // Position based on side
        let x, y;
        if (side === 0) { // bottom row
            x = totalSize - margin - idxOnSide * tileSize;
            y = totalSize - margin;
        } else if (side === 1) { // left column
            x = margin - tileSize;
            y = totalSize - margin - (idxOnSide) * tileSize;
        } else if (side === 2) { // top row
            x = margin + (idxOnSide - 1) * tileSize;
            y = margin - tileSize;
        } else { // right column
            x = totalSize - margin;
            y = margin + (idxOnSide - 1) * tileSize;
        }

        tile.style.transform = `translate(${x}px, ${y}px)`;

        // Add content
        const name = fieldNames[i] || `Polje ${i}`;
        tile.innerHTML = `<div class="tile-name">${name}</div>`;
        
        // Special styling for START
        if (i === 0) tile.classList.add('start');

        // Store field data
        fields[i] = {
            index: i,
            name: name,
            price: prices[i],
            owner: null
        };

        // Store DOM element
        tiles[i] = tile;

        // Add click handler
        tile.addEventListener('click', () => showFieldInfo(i));

        board.appendChild(tile);
    }

    // Create player tokens
    players.forEach(player => {
        const token = document.createElement('div');
        token.className = `player-token ${player.id === 0 ? 'red' : 'blue'}`;
        player.element = token;
        board.appendChild(token);
    });

    updatePlayerPositions();
}

// Show aside with tile description
function showTileAside(i) {
    const aside = document.getElementById('tileAside');
    const nameEl = document.getElementById('tileAsideName');
    const descEl = document.getElementById('tileAsideDesc');
    nameEl.textContent = fieldNames[i] || `Polje ${i}`;
    descEl.innerHTML = getTileDescriptionHTML(i);
}

function updatePlayerPositions() {
    players.forEach(player => {
        const tile = tiles[player.pos];
        const tileRect = tile.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();
        
        // Offset within tile based on player ID
        const offset = player.id === 0 ? -15 : 15;
        
        player.element.style.left = (tileRect.left - boardRect.left + tileRect.width/2 + offset) + 'px';
        player.element.style.top = (tileRect.top - boardRect.top + tileRect.height/2) + 'px';
    });
}

function updateOwnership() {
    tiles.forEach((tile, i) => {
        const field = fields[i];
        // Remove existing owner band if any
        const existingBand = tile.querySelector('.owner-band');
        if (existingBand) existingBand.remove();

        if (field.owner !== null) {
            const band = document.createElement('div');
            band.className = 'owner-band';
            band.style.backgroundColor = players[field.owner].color;
            tile.appendChild(band);
        }
    });
}

function showFieldInfo(i) {
    const f = fields[i];
    fieldName.textContent = `${i}. ${f.name}`;
    fieldPrice.textContent = (f.price > 0) ? `Cijena: ${f.price}$` : `Ne može se kupiti`;
    fieldOwner.textContent = (f.owner === null) ? `Vlasnik: nitko` : `Vlasnik: ${players[f.owner].name}`;
    
    // Show the description in the aside when clicking the tile
    showTileAside(i);
    
    if (f.price > 0 && f.owner === null) {
        buyBtn.classList.remove('hidden');
        buyBtn.disabled = players[turn].money < f.price;
        buyBtn.onclick = () => { buyField(i); };
    } else {
        buyBtn.classList.add('hidden');
        buyBtn.onclick = null;
    }
}

function buyField(i) {
    const p = players[turn];
    const f = fields[i];
    if (p.money >= f.price && f.owner === null && f.price > 0) {
        p.money -= f.price;
        f.owner = turn;
        msg.textContent = `${p.name} je kupio ${f.name} za ${f.price}$`;
        updateOwnership();
        updateHUD();
        buyBtn.classList.add('hidden');
    } else {
        msg.textContent = `Ne možeš kupiti ovo polje.`;
    }
    checkGameOver();
}

rollBtn.addEventListener('click', async () => {
    if (rolling || gameOver) return;
    rolling = true;
    msg.textContent = "";
    rollBtn.disabled = true;
    const d = Math.floor(Math.random() * 6) + 1;
    diceResult.textContent = d;
    await animateMove(d);
    rolling = false;
    rollBtn.disabled = false;
    checkGameOver();
});

function animateMove(steps) {
    return new Promise((resolve) => {
        const player = players[turn];
        let remaining = steps;
        const stepTime = 300;
        
        const interval = setInterval(() => {
            player.pos = (player.pos + 1) % POS_COUNT;
            
            if (player.pos === 0) {
                player.laps += 1;
                msg.textContent = `${player.name} je završio krug (${player.laps}).`;
            }
            
            updatePlayerPositions();
            updateHUD();

            remaining--;
            if (remaining <= 0) {
                clearInterval(interval);
                processLanding(player.pos);
                if (!gameOver) {
                    turn = 1 - turn;
                    updateHUD();
                }
                resolve();
            }
        }, stepTime);
    });
}

function processLanding(index) {
    const player = players[turn];
    const f = fields[index];
    const name = f.name.toUpperCase();
    
    if (name.includes("PRILIKA")) {
        const delta = (Math.random() > 0.5) ? 100 : -50;
        player.money += delta;
        msg.textContent = `${player.name} dobiva PRILIKU: ${delta >= 0 ? '+' + delta : delta}$`;
    } else if (name.includes("IZAZOV")) {
        const delta = (Math.random() > 0.5) ? 150 : -100;
        player.money += delta;
        msg.textContent = `${player.name} je naišao na IZAZOV: ${delta >= 0 ? '+' + delta : delta}$`;
    } else if (name.includes("ZATVOR")) {
        msg.textContent = `${player.name} je u ZATVORU (ništa se ne događa)`;
    } else if (f.price > 0 && f.owner === null) {
        msg.textContent = `${player.name} stoji na slobodnom polju ${f.name}. Možeš ga kupiti (klik na polje).`;
    } else if (f.owner === turn) {
        msg.textContent = `${player.name} stoji na svom polju ${f.name}.`;
    } else if (f.owner !== null && f.owner !== turn) {
        const to = f.owner;
        const rent = rentFor(index);
        player.money -= rent;
        players[to].money += rent;
        msg.textContent = `${player.name} plaća rent ${rent}$ vlasniku ${players[to].name} za ${f.name}.`;
    } else if (index === 0) {
        player.money += 200;
        msg.textContent = `${player.name} je prošao START i dobiva 200$.`;
    } else {
        msg.textContent = `${player.name} stoji na ${f.name}.`;
    }
    updateHUD();
}

function updateHUD() {
    moneyEls[0].textContent = players[0].money;
    moneyEls[1].textContent = players[1].money;
    lapsEls[0].textContent = players[0].laps;
    lapsEls[1].textContent = players[1].laps;
    turnLabel.textContent = players[turn].name;
}

function checkGameOver() {
    for (const p of players) {
        if (p.money < 0) {
            gameOver = true;
            msg.textContent = `${p.name} je bankrotirao! Kraj igre.`;
            announceWinner();
            rollBtn.disabled = true;
            return;
        }
    }
    
    for (const p of players) {
        if (p.laps >= MAX_LAPS) {
            gameOver = true;
            msg.textContent = `Igra završava jer je ${p.name} odigrao ${MAX_LAPS} kruga.`;
            announceWinner();
            rollBtn.disabled = true;
            return;
        }
    }
}

function announceWinner() {
    const sorted = [...players].sort((a, b) => b.money - a.money);
    const top = sorted[0];
    const second = sorted[1];
    if (top.money === second.money) {
        msg.textContent += ` Neriješeno: oba imaju ${top.money}$.`;
    } else {
        msg.textContent += ` Pobjednik: ${top.name} s ${top.money}$!`;
    }
}

function resetGame() {
    for (const f of fields) { f.owner = null; }
    players[0].money = START_MONEY; players[0].pos = 0; players[0].laps = 0;
    players[1].money = START_MONEY; players[1].pos = 0; players[1].laps = 0;
    turn = 0;
    gameOver = false;
    msg.textContent = "Igra resetirana.";
    updateOwnership();
    updatePlayerPositions();
    updateHUD();
}

// Initialize game
window.addEventListener('load', () => {
    createBoard();
    updateHUD();
    msg.textContent = "Klikni polje za info, ili Baci kocku za kretanje.";
    showTileAside(0); // Show START field description initially
});

// Debug: Shift+double-click to reset (same as original)
board.addEventListener('dblclick', (e) => {
    if (!e.shiftKey) return;
    resetGame();
});
