/* ==========================================================
   main.js: two jobs
   1) Parallax: move the hero image layers at different speeds
   2) Tank: build dots, and re-arrange them for each treatment step
   ========================================================== */

/* ---------- 1. PARALLAX HERO ---------- */
const hero = document.querySelector('.hero');
const layers = document.querySelectorAll('.hero__layer');
const calmMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Give each layer its speed (from data-speed in the HTML) as a CSS variable.
layers.forEach(l => l.style.setProperty('--speed', l.dataset.speed));

function onScroll() {
  // Only update while the hero is on screen: saves work.
  if (window.scrollY < hero.offsetHeight) hero.style.setProperty('--scroll', window.scrollY + 'px');
}
if (!calmMotion) window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- 2. TREATMENT STEPS (the content lives here: edit text freely) ---------- */
const STEPS = [
  { label: 'Start: raw water', water: '#9a7f50', caption: 'Raw water: cloudy and full of germs.',
    chem: 'No chemicals yet',
    text: 'Dirt is spread out evenly. Each speck carries a small negative charge, so the specks push each other away and stay floating.' },
  { label: '1. Coagulation', water: '#9a7f50', caption: 'Chemical added: the dirt loses its charge.',
    chem: 'Added: alum (aluminium sulfate)',
    text: 'Alum has positive charges. They cancel the negative charge on the dirt, so the specks stop repelling each other and become sticky.' },
  { label: '2. Flocculation', water: '#a99468', caption: 'Slow stirring: sticky specks join into flocs.',
    chem: 'Gentle stirring (sometimes a polymer helper)',
    text: 'Slow mixing lets sticky specks bump into each other and join. They form fluffy clumps called flocs, big enough to see.' },
  { label: '3. Sedimentation', water: '#c3d8d4', caption: 'Heavy flocs sink to the bottom as sludge.',
    chem: 'No chemical: gravity does the work',
    text: 'In a still tank the heavy flocs sink. The water above is much clearer, but a few tiny specks and all the germs are still there.' },
  { label: '4. Filtration', water: '#d9f0f3', caption: 'The filter catches the last tiny specks.',
    chem: 'Sand and activated carbon',
    text: 'Water trickles through sand and carbon. Sand traps tiny specks. Carbon grabs chemicals that cause bad taste and smell.' },
  { label: '5. Disinfection', water: '#bfe9f2', caption: 'Chlorine has deactivated the germs.',
    chem: 'Added: chlorine (or ozone, or UV light)',
    text: 'Chlorine becomes hypochlorous acid in water. It damages the germs so they cannot grow or make you ill. A little stays in the water to protect it on the way to your tap.' }
];

/* ---------- 3. BUILD THE DOTS ---------- */
const NS = 'http://www.w3.org/2000/svg';
const particleBox = document.getElementById('particles');
const FLOC_CENTERS = [[90,110],[200,90],[310,120],[120,220],[220,200],[310,230]]; // where flocs form
const rnd = (min, max) => min + Math.random() * (max - min);                      // random number helper

// Each dot remembers a start spot (x,y), a floc group, and its own random wobble (jx, jy).
const dots = [];
function makeDot(type, i) {
  const el = document.createElementNS(NS, 'circle');
  el.setAttribute('r', type === 'dirt' ? rnd(3, 5) : 4);
  el.setAttribute('class', `dot dot--${type}`);
  particleBox.appendChild(el);
  dots.push({ el, type, x: rnd(40, 360), y: rnd(50, 290), group: i % FLOC_CENTERS.length,
              jx: rnd(-16, 16), jy: rnd(-16, 16), floor: 296 - rnd(0, 20),
              fine: type === 'dirt' && i % 4 === 0 });  // "fine" dirt is too small to sink: only the filter catches it
}
for (let i = 0; i < 40; i++) makeDot('dirt', i);
for (let i = 0; i < 12; i++) makeDot('germ', i);

/* ---------- 4. DECIDE WHERE EACH DOT GOES FOR A GIVEN STEP ---------- */
function place(d, step) {
  let x = d.x, y = d.y, scale = 1, opacity = 1;

  if (d.type === 'dirt' && !d.fine) {                         // normal dirt follows the full story
    if (step >= 1) scale = 1.3;                               // coagulation: specks become sticky
    if (step === 2) { [x, y] = [FLOC_CENTERS[d.group][0] + d.jx, FLOC_CENTERS[d.group][1] + d.jy]; scale = 2.2; }
    if (step >= 3) { x = d.x; y = d.floor; scale = 2.2; }     // sedimentation onwards: sunk to the bottom
  }
  if (d.fine && step >= 4) opacity = 0;                       // filtration removes fine dirt
  if (d.type === 'germ' && step === 5) { opacity = 0; scale = 0.2; } // disinfection removes germs

  d.el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  d.el.style.opacity = opacity;
}

/* ---------- 5. BUTTONS + INFO PANEL ---------- */
const buttonBox = document.getElementById('step-buttons');
const water = document.getElementById('water');
const caption = document.getElementById('tank-caption');
const info = { title: document.getElementById('info-title'), chem: document.getElementById('info-chem'),
               text: document.getElementById('info-text') };

function showStep(n) {
  const s = STEPS[n];
  dots.forEach(d => place(d, n));
  water.style.fill = s.water;
  caption.textContent = s.caption;
  info.title.textContent = s.label;
  info.chem.textContent = s.chem;
  info.text.textContent = s.text;
  buttonBox.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', i === n)); // marks the active button
}

STEPS.forEach((s, i) => {
  const b = document.createElement('button');
  b.className = 'step-btn';
  b.type = 'button';
  b.textContent = s.label;
  b.addEventListener('click', () => showStep(i));
  buttonBox.appendChild(b);
});

showStep(0); // start on raw water
