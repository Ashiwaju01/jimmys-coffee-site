function closeM(){document.getElementById('mpanel').classList.remove('open')}

const LOCATIONS = [
  {name:"107 Portland St (Original)", lat:43.6448, lng:-79.4008, addr:"107 Portland St, Toronto, ON", phone:"416-901-2289", hours:"Mon–Fri 7:00am–6:00pm · Sat–Sun 8:00am–6:00pm", tag:"Flagship · est. 2009", desc:"Jimmy's Coffee was founded in 2009 on Portland St. in an unlikely, dilapidated residential home. It's a small but bustling café with a small back patio — the perfect King West escape.", img:"images/loc-portland.jpg"},
  {name:"191 Baldwin St — Kensington Market", lat:43.6554, lng:-79.4012, addr:"191 Baldwin St, Toronto, ON", phone:"647-352-5466", hours:"Mon–Sun 8:00am–6:00pm", tag:"Opened 2013", desc:"In the heart of Kensington Market, highlighted by a beautiful, expansive back patio — Toronto's perfect downtown oasis. Come early; tables fill fast with students, artists and locals.", gallery:["images/g-kensington-1.jpg", "images/g-kensington-2.jpg"], img:"images/loc-kensington.jpg"},
  {name:"84 Gerrard St W", lat:43.6578, lng:-79.3857, addr:"84 Gerrard St W, Toronto, ON", phone:"416-792-1141", hours:"Mon–Fri 7:00am–6:00pm · Sat–Sun 8:00am–5:00pm", tag:"Opened May 2014", desc:"A stand-alone brick building you can't miss, with the Mount Jimmy's Rushmore mural on the wall. Plenty of studying space spread over three floors — the third doubles as boardroom rental.", gallery:["images/g-gerrard-1.jpg", "images/g-gerrard-2.jpg"], img:"images/loc-gerrard.jpg"},
  {name:"15 Ossington Ave", lat:43.6444, lng:-79.4201, addr:"15 Ossington Ave, Toronto, ON", phone:"647-348-2204", hours:"Mon–Fri 7:00am–6:00pm · Sat–Sun 8:00am–6:00pm", tag:"Opened Nov 2015", desc:"Known for boutique shops and intimate bars, Ossington is the perfect place for a lazy weekend stroll. Ceiling murals, a communal table, and a fireplace for Toronto's colder months.", gallery:["images/g-ossington-1.jpg", "images/g-ossington-2.jpg"], img:"images/loc-ossington.jpg"},
  {name:"806 Queen St E", lat:43.6598, lng:-79.3494, addr:"806 Queen St E, Toronto, ON", phone:"416-546-4154", hours:"Mon–Sun 7:00am–6:00pm", tag:"Queen East / Riverside", desc:"In the Riverside neighbourhood, just steps from Leslieville, with cozy indoor seating and a spacious back patio. Featuring cold-pressed juices, kombucha, smoothies and unique treats.", gallery:["images/g-queeneast-1.jpg", "images/g-queeneast-2.jpg", "images/g-queeneast-3.jpg"], img:"images/loc-queeneast.jpg"},
  {name:"166 McCaul St", lat:43.6537, lng:-79.39, addr:"166 McCaul St, Toronto, ON", phone:"647-748-0500", hours:"Mon–Fri 7:00am–6:00pm · Sat–Sun 8:00am–5:00pm", tag:"Opened Oct 2016", desc:"Just around the corner from Baldwin Village, a few steps from OCAD, U of T and UHN. A cozy fireplace, and an open-concept barista training area behind old factory windows.", gallery:["images/g-mccaul-1.jpg", "images/g-mccaul-2.jpg", "images/g-mccaul-3.jpg"], img:"images/loc-mccaul.jpg"},
  {name:"380 Royal York Rd — Mimico", lat:43.6179, lng:-79.4968, addr:"380 Royal York Rd, Toronto, ON", phone:"647-748-7333", hours:"Mon–Sun 7:00am–6:00pm", tag:"Mimico", desc:"Population 18,573 and counting — Jimmy's newer west-end neighbourhood room, with the same warm welcome as the original.", gallery:["images/g-mimico-1.jpg", "images/g-mimico-2.jpg", "images/g-mimico-3.jpg"], img:"images/loc-mimico.jpg"},
  {name:"585 University Ave — Toronto General Hospital", lat:43.6579, lng:-79.3874, addr:"585 University Ave, Toronto, ON", phone:"", hours:"Mon–Fri 6:30am–7:00pm · Sat–Sun 8:00am–4:00pm", tag:"Peter Munk Building", desc:"Located inside the Peter Munk Building at Toronto General Hospital, proud to serve patients, visitors, hospital staff and the surrounding community with coffee, espresso and grab-and-go options.", img:"images/loc-hospital.jpg"}
];

function mapsUrl(addr){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent("Jimmy's Coffee "+addr)}

document.getElementById('locList').innerHTML = LOCATIONS.map((l,i)=>{
  const shots = [l.img, ...(l.gallery||[])];
  return `
  <div class="loc" id="loc-${i}">
    <div class="loc-photo" onclick="openLightbox(${i},0)" role="button" tabindex="0" aria-label="View all photos of ${l.name.split(' — ')[0]}" onkeypress="if(event.key==='Enter')openLightbox(${i},0)">
      <img src="${l.img}" alt="Jimmy's Coffee — ${l.name} storefront" loading="lazy">
      ${shots.length>1 ? `<span class="photo-count">🔍 ${shots.length} photos</span>` : `<span class="photo-count">🔍 View</span>`}
    </div>
    <div>
      <span class="tag">${l.tag}</span><span class="dist-badge" id="dist-${i}"></span>
      <h3>${l.name}</h3>
      <div class="meta">${l.addr}${l.phone? " · "+l.phone : ""}</div>
      <div class="meta">${l.hours}</div>
      <p class="desc">${l.desc}</p>
      ${l.gallery ? `<div class="mini-gallery">${l.gallery.map((g,gi)=>`<img src="${g}" alt="More of ${l.name.split(' — ')[0]}" loading="lazy" onclick="openLightbox(${i},${gi+1})" role="button" tabindex="0" onkeypress="if(event.key==='Enter')openLightbox(${i},${gi+1})">`).join('')}</div>` : ''}
    </div>
    <div class="loc-actions">
      <a class="reserve-btn" href="#reserve">Reserve</a>
      <a class="dir-btn" href="${mapsUrl(l.addr)}" target="_blank" rel="noopener">Directions</a>
    </div>
  </div>
`;}).join('');

document.getElementById('contactLocs').innerHTML = LOCATIONS.map(l=>`<li><strong>${l.name.split(' — ')[0]}</strong><br>${l.addr}${l.phone? " · "+l.phone:""}<br>${l.hours}</li>`).join('');

document.getElementById('rLoc').innerHTML = LOCATIONS.map(l=>`<option>${l.name}</option>`).join('');

// ---- Stylized neighbourhood map: plot real coordinates onto the SVG grid ----
(function(){
  const lats = LOCATIONS.map(l=>l.lat), lngs = LOCATIONS.map(l=>l.lng);
  const latMin=Math.min(...lats), latMax=Math.max(...lats);
  const lngMin=Math.min(...lngs), lngMax=Math.max(...lngs);
  const pad = 32;
  function project(lat,lng){
    const x = pad + (lng-lngMin)/(lngMax-lngMin) * (400-2*pad);
    const y = pad + (1-(lat-latMin)/(latMax-latMin)) * (260-2*pad);
    return [x,y];
  }
  const g = document.getElementById('mapPins');
  g.innerHTML = LOCATIONS.map((l,i)=>{
    const [x,y] = project(l.lat,l.lng);
    const short = l.name.split(' — ')[0].split(' (')[0];
    return `<g class="map-pin" id="pin-${i}" tabindex="0" role="button" aria-label="${short}" onclick="focusLoc(${i})" onkeypress="if(event.key==='Enter')focusLoc(${i})" transform="translate(${x-7},${y-7})">
      <circle class="halo" cx="7" cy="7" r="13"></circle>
      <svg class="lidshape" x="0" y="0" width="14" height="14" viewBox="0 0 100 100"><use href="#lid"></use></svg>
      <text x="9" y="-3" text-anchor="middle">${short}</text>
    </g>`;
  }).join('');
})();

// Location photo lightbox
let lbLocIdx=null, lbPhotoIdx=0, lbShots=[];
function openLightbox(locIdx, photoIdx){
  lbLocIdx = locIdx;
  lbShots = [LOCATIONS[locIdx].img, ...(LOCATIONS[locIdx].gallery||[])];
  lbPhotoIdx = Math.max(0, Math.min(photoIdx, lbShots.length-1));
  renderLb();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeLightbox(){
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow='';
}
function lbStep(dir){
  lbPhotoIdx = (lbPhotoIdx + dir + lbShots.length) % lbShots.length;
  renderLb();
}
function renderLb(){
  const name = LOCATIONS[lbLocIdx].name.split(' — ')[0];
  document.getElementById('lbImg').src = lbShots[lbPhotoIdx];
  document.getElementById('lbImg').alt = name + ' photo ' + (lbPhotoIdx+1);
  document.getElementById('lbMeta').textContent = `${name} — ${lbPhotoIdx+1} / ${lbShots.length}`;
}
document.addEventListener('keydown', (e)=>{
  if(!document.getElementById('lightbox').classList.contains('open')) return;
  if(e.key==='Escape') closeLightbox();
  if(e.key==='ArrowRight') lbStep(1);
  if(e.key==='ArrowLeft') lbStep(-1);
});
// basic touch swipe support
document.addEventListener('DOMContentLoaded', function(){
  const inner = document.querySelector('.lightbox-inner');
  if(!inner) return;
  let sx=null;
  inner.addEventListener('touchstart', e=>{ sx = e.touches[0].clientX; }, {passive:true});
  inner.addEventListener('touchend', e=>{
    if(sx===null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if(Math.abs(dx) > 40) lbStep(dx>0 ? -1 : 1);
    sx = null;
  }, {passive:true});
});

function focusLoc(i){
  document.querySelectorAll('.map-pin').forEach(p=>p.classList.remove('active'));
  const pin = document.getElementById('pin-'+i);
  if(pin) pin.classList.add('active');
  const card = document.getElementById('loc-'+i);
  if(card){
    if(card.scrollIntoView) card.scrollIntoView({behavior:'smooth', block:'center'});
    card.style.transition='box-shadow .3s';
    card.style.boxShadow='0 0 0 2px var(--brick) inset';
    setTimeout(()=>{ card.style.boxShadow=''; }, 1600);
  }
}

function haversine(lat1,lng1,lat2,lng2){
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function findNearest(){
  const btn = document.getElementById('geoBtn');
  const status = document.getElementById('geoStatus');
  if(!navigator.geolocation){ status.textContent = "Location isn't available in this browser — pick a spot on the map instead."; return; }
  btn.disabled = true; status.textContent = "Finding you…";
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude, longitude} = pos.coords;
    const withDist = LOCATIONS.map((l,i)=>({i, d: haversine(latitude,longitude,l.lat,l.lng)}));
    withDist.sort((a,b)=>a.d-b.d);
    withDist.forEach(({i,d})=>{
      const badge = document.getElementById('dist-'+i);
      if(badge) badge.textContent = d<1 ? Math.round(d*1000)+' m away' : d.toFixed(1)+' km away';
    });
    const nearest = withDist[0];
    const list = document.getElementById('locList');
    withDist.forEach(({i})=> list.appendChild(document.getElementById('loc-'+i)));
    btn.disabled = false;
    const shortName = LOCATIONS[nearest.i].name.split(' — ')[0].split(' (')[0];
    status.textContent = `Closest: ${shortName} — ${nearest.d<1 ? Math.round(nearest.d*1000)+'m' : nearest.d.toFixed(1)+'km'} away.`;
    focusLoc(nearest.i);
  }, err=>{
    btn.disabled = false;
    status.textContent = "Couldn't get your location — pick a spot on the map instead.";
  }, {timeout:8000});
}

// Event catering FAQ (verbatim from supplied source material)
const EV_FAQ = [
  ["How much notice do you need?","We recommend placing catering orders at least 1 week in advance. Larger orders, staffed events, and special requests may require additional notice. If you have a last-minute request, get in touch and we'll do our best to accommodate it."],
  ["Do you offer delivery?","Yes. Delivery is available for catering orders within Toronto and surrounding areas. Delivery fees vary depending on location and order size. Pickup can also be arranged from select Jimmy's Coffee locations."],
  ["How much coffee should I order?","Not sure what size you need? Tell us your estimated guest count and we can recommend the right amount of coffee for your event."],
  ["Can Jimmy's provide staff for my event?","Yes. Depending on availability and the size of your event, we can provide a Jimmy to help serve coffee and keep everything stocked throughout the event."],
  ["When will the espresso cart be available?","Our mobile espresso cart is coming soon. If you're interested in having freshly prepared espresso drinks at an upcoming event, let us know through the catering inquiry form. We'll keep you updated as the service becomes available."]
];
// General FAQ
const GEN_FAQ = [
  ["General","What are Jimmy's hours?","Hours vary by café — check the location list above; most rooms open around 7–8am and close 5–7pm, seven days a week."],
  ["General","Is Jimmy a real person?","Not one single person — Jimmy's Coffee started in 2009, named in the spirit of every Jimmy we love: James Dean, Jimmy Hoffa, Jimi Hendrix, Jimmy Carter, Jim Morrison, Jimmy Durante, and your friend Jimmy too."],
  ["Careers","How do I apply for a job at Jimmy's?","Send a note to work4jimmys@jimmyscoffee.ca with a little about you and why you want to join, plus your resume. Coffee experience is an asset but not a requirement — or introduce yourself in person at any shop."],
  ["Gift Cards","How do gift cards work?","Buy, reload or check the balance of a Jimmy's Coffee gift card any time — delivered instantly by text or email, or bought for yourself."]
];
document.getElementById('evFaq').innerHTML = EV_FAQ.map((f,i)=>`
  <div class="faq-item" id="evfaq-${i}">
    <button class="faq-q" onclick="this.parentElement.classList.toggle('open')">${f[0]}<span class="chev">+</span></button>
    <div class="faq-a"><p>${f[1]}</p></div>
  </div>`).join('');

function buildFaqAll(){
  let cats = {};
  EV_FAQ.forEach(f=>{ (cats['Catering & Events']=cats['Catering & Events']||[]).push([f[0],f[1]]) });
  GEN_FAQ.forEach(f=>{ (cats[f[0]]=cats[f[0]]||[]).push([f[1],f[2]]) });
  let html='';
  Object.keys(cats).forEach(cat=>{
    html+=`<div class="faq-cat">${cat}</div>`;
    cats[cat].forEach(([q,a])=>{
      html+=`<div class="faq-item" data-q="${q.toLowerCase()}" data-a="${a.toLowerCase()}">
        <button class="faq-q" onclick="this.parentElement.classList.toggle('open')">${q}<span class="chev">+</span></button>
        <div class="faq-a"><p>${a}</p></div></div>`;
    });
  });
  document.getElementById('faqAll').innerHTML = html;
}
buildFaqAll();

function filterFaq(){
  const term = document.getElementById('faqSearch').value.toLowerCase();
  let any=false;
  document.querySelectorAll('#faqAll .faq-item').forEach(el=>{
    const match = el.dataset.q.includes(term) || el.dataset.a.includes(term);
    el.style.display = match ? '' : 'none';
    if(match) any=true;
  });
  document.querySelectorAll('#faqAll .faq-cat').forEach(cat=>{
    let sib = cat.nextElementSibling, show=false;
    while(sib && !sib.classList.contains('faq-cat')){ if(sib.style.display!=='none') show=true; sib=sib.nextElementSibling; }
    cat.style.display = show ? '' : 'none';
  });
  document.getElementById('faqEmpty').style.display = any ? 'none':'block';
}

function joinList(e){
  e.preventDefault();
  const email = document.getElementById('joinEmail').value;
  window.location.href = `mailto:hello@jimmyscoffee.ca?subject=${encodeURIComponent('Sign me up')}&body=${encodeURIComponent('Please add this email to the list: '+email)}`;
  document.getElementById('joinOk').style.display='block';
  return false;
}

function sendContact(e){
  e.preventDefault();
  const subj = encodeURIComponent(document.getElementById('csubject').value||'Website enquiry');
  const body = encodeURIComponent(`Name: ${document.getElementById('cname').value}\nEmail: ${document.getElementById('cemail').value}\nPhone: ${document.getElementById('cphone').value}\n\n${document.getElementById('cmessage').value}`);
  window.location.href = `mailto:hello@jimmyscoffee.ca?subject=${subj}&body=${body}`;
  document.getElementById('contactOk').style.display='block';
  return false;
}

// Reservation flow
let rStep=1, rTime=null;
function renderTimes(){
  const times=["11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","4:30 PM"];
  document.getElementById('timeGrid').innerHTML = times.map(t=>`<button type="button" onclick="pickTime(this,'${t}')">${t}</button>`).join('');
}
function pickTime(btn,t){
  document.querySelectorAll('.time-grid button').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel'); rTime=t;
}
function rsvNext(){
  if(rStep===1 && !rTime) renderTimes();
  if(rStep===2 && !rTime){ alert('Please choose a time.'); return; }
  if(rStep===3){
    const loc=document.getElementById('rLoc').value;
    const date=document.getElementById('rDate').value || 'a date to be confirmed';
    const party=document.getElementById('rParty').value;
    const first=document.getElementById('rFirst').value||'Guest';
    const ref='JC-'+Math.random().toString(36).slice(2,8).toUpperCase();
    document.getElementById('summary').innerHTML = `
      <div class="summary-row"><span>Location</span><strong>${loc}</strong></div>
      <div class="summary-row"><span>Date</span><strong>${date}</strong></div>
      <div class="summary-row"><span>Time</span><strong>${rTime}</strong></div>
      <div class="summary-row"><span>Party size</span><strong>${party}</strong></div>
      <div class="summary-row"><span>Name</span><strong>${first} ${document.getElementById('rLast').value}</strong></div>
      <p style="margin-top:1.2rem">Thanks, ${first} — your request is ready to send.</p>
      <div class="ref">${ref}</div>
      <p style="font-size:.88rem;opacity:.75">This confirms your request was drafted, not a guaranteed table — a team member will confirm by email or phone before your visit.</p>`;
  }
  if(rStep<4){ rStep++; goToStep(); }
}
function rsvBack(){ if(rStep>1){ rStep--; goToStep(); } }
function goToStep(){
  document.querySelectorAll('.rsv-step').forEach(s=>s.classList.toggle('active', +s.dataset.step===rStep));
  document.querySelectorAll('.rsv-steps span').forEach(s=>s.classList.toggle('active', +s.dataset.s<=rStep));
  document.getElementById('rBack').style.visibility = rStep>1 ? 'visible':'hidden';
  document.getElementById('rNext').style.display = rStep<4 ? 'inline-block':'none';
  if(rStep===2) renderTimes();
}
goToStep();

// Swipe menu carousel
(function(){
  const track = document.getElementById('swipeTrack');
  if(!track) return;
  const cards = track.querySelectorAll('.swipe-card');
  const dotsWrap = document.getElementById('swipeDots');
  const countEl = document.getElementById('swipeCount');
  cards.forEach((_,i)=>{
    const b = document.createElement('button');
    b.setAttribute('aria-label','Go to slide '+(i+1));
    if(i===0) b.classList.add('active');
    b.addEventListener('click', ()=>swipeTo(i));
    dotsWrap.appendChild(b);
  });
  function current(){
    return Math.round(track.scrollLeft / track.clientWidth);
  }
  function updateUI(){
    const i = Math.min(cards.length-1, Math.max(0, current()));
    dotsWrap.querySelectorAll('button').forEach((b,bi)=>b.classList.toggle('active', bi===i));
    countEl.textContent = (i+1)+' / '+cards.length;
  }
  window.swipeTo = function(i){
    if(track.scrollTo) track.scrollTo({left: i*track.clientWidth, behavior:'smooth'});
    else track.scrollLeft = i*track.clientWidth;
  };
  window.swipeGo = function(dir){
    const i = Math.min(cards.length-1, Math.max(0, current()+dir));
    swipeTo(i);
  };
  let ticking=false;
  track.addEventListener('scroll', ()=>{
    if(!ticking){ requestAnimationFrame(()=>{ updateUI(); ticking=false; }); ticking=true; }
  }, {passive:true});
  track.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowRight'){ swipeGo(1); e.preventDefault(); }
    if(e.key==='ArrowLeft'){ swipeGo(-1); e.preventDefault(); }
  });
  window.addEventListener('resize', ()=>swipeTo(current()));
  updateUI();
})();

// Sticky nav shadow on scroll
const siteHeader = document.querySelector('header.site');
window.addEventListener('scroll', ()=>{
  siteHeader.classList.toggle('scrolled', window.scrollY > 8);
}, {passive:true});

// Gentle reveal-on-scroll for major sections
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
}