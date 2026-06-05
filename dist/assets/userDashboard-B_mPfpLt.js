import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css                  */const B=typeof import.meta<"u"?"http://127.0.0.1:8000/api":"/api";async function D(){const e=await fetch(`${B}/reports/map`,{method:"GET",headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`HTTP ${e.status}: Gagal memuat data laporan.`);const t=await e.json();if(!t.success)throw new Error(t.message||"Gagal memuat data laporan.");return Array.isArray(t.data)?t.data:[]}const u={sampah:{color:"#A40000",label:"Sampah",legendSvg:`<svg viewBox="0 0 24 24" width="22" height="22" fill="#A40000">
      <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12h-11L5 9zm5 2v8h1v-8h-1zm3 0v8h1v-8h-1zM8 4h8v2H8V4z"/>
    </svg>`},banjir:{color:"#53B6FE",label:"Banjir",legendSvg:`<svg viewBox="0 0 24 24" width="22" height="22" fill="#53B6FE">
      <path d="M12 3L4 9v4.5c1.1-.3 2.3-.3 3.5.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8.4 0 .7-.1 1.1-.2V9l-8-6z"/>
      <path d="M2 16.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3v2.5c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z"/>
      <path d="M2 20.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3V23c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z" opacity=".6"/>
    </svg>`},polusi:{color:"#7A7A79",label:"Polusi",legendSvg:`<svg viewBox="0 0 24 24" width="22" height="22" fill="#7A7A79">
      <path d="M2 21h20v-2H2v2zm2-2v-7l5 2.5V12l5 2.5V12l5 2.5V19H4z"/>
      <path d="M17 9.5a2.5 2.5 0 0 0-1.6-2.3 3.5 3.5 0 0 0-6.8-1A2.5 2.5 0 0 0 8 11h9a2.5 2.5 0 0 0 0-1.5z" opacity=".7"/>
    </svg>`},penebangan:{color:"#884C08",label:"Penebangan",legendSvg:`<svg viewBox="0 0 24 24" width="22" height="22" fill="#884C08">
      <rect x="10" y="3" width="4" height="19" rx="1"/>
      <path d="M14 6l5-2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2l-5-2V6z"/>
      <path d="M10 6.5h-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2v-3z" opacity=".6"/>
    </svg>`},"isu air":{color:"#1674DB",label:"Isu Air",legendSvg:`<svg viewBox="0 0 24 24" width="22" height="22" fill="#1674DB">
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/>
    </svg>`},lainnya:{color:"#3A3A3A",label:"Lainnya",legendSvg:`<svg viewBox="0 0 24 24" width="22" height="22" fill="#3A3A3A">
      <circle cx="5"  cy="12" r="2.2"/>
      <circle cx="12" cy="12" r="2.2"/>
      <circle cx="19" cy="12" r="2.2"/>
    </svg>`}};function T(e){const t=S(e),i=(u[t]||u.lainnya).color,n={sampah:'<path d="M3 6h18v2H3V6zm2 3h14l-1.5 12h-11L5 9zm5 2v8h1v-8h-1zm3 0v8h1v-8h-1zM8 4h8v2H8V4z"/>',banjir:`<path d="M12 3L4 9v4.5c1.1-.3 2.3-.3 3.5.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8.4 0 .7-.1 1.1-.2V9l-8-6z"/>
                <path d="M2 16.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3v2.5c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z"/>
                <path d="M2 20.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3V23c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z" opacity=".6"/>`,polusi:`<path d="M2 21h20v-2H2v2zm2-2v-7l5 2.5V12l5 2.5V12l5 2.5V19H4z"/>
                <path d="M17 9.5a2.5 2.5 0 0 0-1.6-2.3 3.5 3.5 0 0 0-6.8-1A2.5 2.5 0 0 0 8 11h9a2.5 2.5 0 0 0 0-1.5z" opacity=".7"/>`,penebangan:`<rect x="10" y="3" width="4" height="19" rx="1"/>
                <path d="M14 6l5-2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2l-5-2V6z"/>
                <path d="M10 6.5h-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2v-3z" opacity=".6"/>`,"isu air":'<path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/>',lainnya:'<circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/>'},c=n[t]||n.lainnya,r=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
  <defs>
    <filter id="dropshadow" x="-40%" y="-20%" width="180%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="rgba(0,0,0,0.30)"/>
    </filter>
  </defs>
  <path d="M20 2C12.27 2 6 8.27 6 16c0 10.5 14 30 14 30S34 26.5 34 16C34 8.27 27.73 2 20 2z"
    fill="${i}" filter="url(#dropshadow)"/>
  <circle cx="20" cy="16" r="9" fill="white" opacity="0.93"/>
  
  <g transform="translate(12.2, 8.2) scale(0.65)" fill="${i}">${c}</g>
</svg>`;return L.divIcon({html:r,className:"lestari-marker",iconSize:[40,50],iconAnchor:[20,50],popupAnchor:[0,-50]})}function q(e){return u[S(e)]||u.lainnya}function S(e){return(e||"").toLowerCase().trim()}let m="semua",g=[],p=null,l=null,s=null;function j(e,t){p=t,s=document.querySelector("#filterBtn"),H(),P()}function I(e,t){g.push({marker:e,report:t})}function V(){g=[]}function F(){C(m)}function H(){if(document.querySelector("#filterDropdown")){l=document.querySelector("#filterDropdown");return}const e=[{key:"semua",label:"Semua Kategori",color:null},...Object.entries(u).map(([t,a])=>({key:t,label:a.label,color:a.color}))];l=document.createElement("div"),l.id="filterDropdown",l.className="filter-dropdown hidden",l.setAttribute("role","listbox"),l.innerHTML=`
    <div class="filter-dropdown-header">Filter Kategori</div>
    <ul class="filter-list">
      ${e.map(t=>`
        <li class="filter-item${t.key===m?" active":""}" data-key="${t.key}" role="option">
          <span class="filter-dot${t.color?"":" filter-dot-all"}"
            ${t.color?`style="background:${t.color}"`:""}></span>
          <span>${t.label}</span>
        </li>`).join("")}
    </ul>`,document.body.appendChild(l),l.querySelectorAll(".filter-item").forEach(t=>{t.addEventListener("click",()=>{l.querySelectorAll(".filter-item").forEach(a=>a.classList.remove("active")),t.classList.add("active"),m=t.dataset.key,C(m),N(m),b()})}),document.addEventListener("click",t=>{l&&!l.classList.contains("hidden")&&!l.contains(t.target)&&s&&!s.contains(t.target)&&b()})}function P(){s&&(s.hasAttribute("data-bound")||(s.setAttribute("data-bound","true"),s.addEventListener("click",e=>{e.stopPropagation(),l.classList.contains("hidden")?O():b()})))}function O(){if(!s||!l)return;const e=s.getBoundingClientRect();l.style.left="auto",l.style.right=`${window.innerWidth-e.right}px`,l.classList.remove("hidden")}function b(){l==null||l.classList.add("hidden")}function C(e){if(!p)return;p.clearLayers(),(e==="semua"?g:g.filter(({report:a})=>S(a.kategori)===e)).forEach(({marker:a})=>p.addLayer(a))}function N(e){if(!s)return;const t=s.querySelector(".filter-label");if(!t)return;const a=u[e];t.textContent=a?a.label:"Filter"}const G=[-7.5613,110.8574],R=15,U="jbw2UA5I3iDnxCTJfNpg";let o=null,d=null,w=[];document.addEventListener("DOMContentLoaded",async()=>{Z(),K(),Y(),J(),await W()});function Z(){const e=localStorage.getItem("auth_token"),t=localStorage.getItem("user_name")||"Nama Pengguna",a=localStorage.getItem("user_email")||"email@email.com";x(t,a),e&&fetch("/api/auth/me",{headers:{Accept:"application/json",Authorization:`Bearer ${e}`}}).then(i=>i.json()).then(i=>{if(!i.success)return;const n=i.data,c=[n.nama_depan,n.nama_belakang].filter(Boolean).join(" ").trim()||n.username||t,r=n.email||a;x(c,r),localStorage.setItem("user_name",c),localStorage.setItem("user_email",r)}).catch(()=>{})}function x(e,t){const a=document.querySelector("#sidebarUserName"),i=document.querySelector("#userEmailDisplay");a&&(a.textContent=e||"Nama Pengguna"),i&&(i.textContent=t||"email@email.com")}function K(){o=L.map("map",{zoomControl:!1,scrollWheelZoom:!0}),L.control.zoom({position:"bottomright"}).addTo(o),L.tileLayer(`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${U}`,{attribution:'© <a href="https://www.maptiler.com" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a>',tileSize:512,zoomOffset:-1,maxZoom:20}).addTo(o),o.setView(G,R),o.on("click",()=>f()),setTimeout(()=>{o.invalidateSize()},200);const e=o.getContainer();e.setAttribute("tabindex","0"),e.addEventListener("mouseenter",()=>{e.focus()}),e.addEventListener("wheel",t=>{t.preventDefault(),t.deltaY<0?o.zoomIn():o.zoomOut()},{passive:!1})}function Y(){const e=document.querySelector("#legendList");e&&(e.innerHTML=Object.entries(u).map(([,t])=>`
    <li class="legend-item">
      <span class="legend-icon">${t.legendSvg}</span>
      <span>${t.label}</span>
    </li>`).join(""))}function J(){console.log("[Sidebar] Binding dikonfigurasi.")}async function W(){A(!0),te(),f();try{w=await D(),M(w),w.length===0&&_()}catch(e){console.error("[map]",e),M([]),_("Gagal memuat data. Periksa koneksi Anda.")}finally{A(!1),o&&setTimeout(()=>{o.invalidateSize()},50)}}function M(e){d&&(d.clearLayers(),o.removeLayer(d)),V(),d=e.length>50&&typeof L.markerClusterGroup=="function"?L.markerClusterGroup({chunkedLoading:!0,maxClusterRadius:60}):L.layerGroup();const a=[];e.forEach(i=>{if(i.latitude==null||i.longitude==null)return;const n=[+i.latitude,+i.longitude],c=T(i.kategori),r=L.marker(n,{icon:c,title:i.judul});r.on("click",v=>{L.DomEvent.stopPropagation(v),o.flyTo(n,18,{duration:1.2}),Q(i)}),d.addLayer(r),I(r,i),a.push(n)}),d.addTo(o),a.length>1?o.fitBounds(a,{padding:[50,50]}):a.length===1&&o.setView(a[0],17),j(o,d),F()}function Q(e){var k,z;const t=document.querySelector("#detailPanel"),a=document.querySelector("#detailBody"),i=document.querySelector("#detailActionBtn");if(!t||!a)return;const n=q(e.kategori),c=X(e.created_at,e.id),{tgl:r,jam:v}=ee(e.created_at),$=e.foto?h(e.foto):"https://placehold.co/340x160/e8f5e9/16a34a?text=Foto+Tidak+Tersedia";a.innerHTML=`
    <div class="detail-header">
      <div class="detail-title-wrap">
        <h2 class="detail-title">${h(e.judul)}</h2>
        <span class="detail-lapnum">${c}</span>
      </div>
      <button class="detail-close" id="detailClose" aria-label="Tutup panel">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6"  y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="detail-lokasi">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="#22c55e">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      </svg>
      <span>${h(e.lokasi||"—")}</span>
    </div>

    <span class="detail-badge"
      style="background:${n.color}1a;color:${n.color};border:1px solid ${n.color}40;">
      ${n.label}
    </span>

    <img class="detail-foto" src="${$}" alt="Foto laporan ${h(e.judul)}"
      onerror="this.src='https://placehold.co/340x160/e8f5e9/16a34a?text=Foto+Tidak+Tersedia'"/>

    <div class="detail-meta">
      <div class="detail-meta-row">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="#9ca3af">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <div>
          <span class="detail-meta-label">Pelapor</span>
          <span class="detail-meta-value">${h(((k=e.user)==null?void 0:k.nama)||"—")}</span>
        </div>
      </div>
      <div class="detail-meta-row">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="#9ca3af">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
        </svg>
        <div>
          <span class="detail-meta-label">Dilaporkan pada</span>
          <span class="detail-meta-value">${r}</span>
          <span class="detail-meta-sub">${v} WIB</span>
        </div>
      </div>
    </div>

    <div class="detail-desc">${h(e.deskripsi||"")}</div>
  `,i&&(i.onclick=()=>{window.location.href=`../peta/detail.html?id=${e.id}`});const y=document.querySelector("#detailOverlay");y&&(y.classList.remove("hidden"),y.addEventListener("click",f,{once:!0})),(z=document.querySelector("#detailClose"))==null||z.addEventListener("click",E=>{E.stopPropagation(),f()}),t.classList.remove("hidden"),t.offsetHeight,t.classList.add("slide-in")}function f(){const e=document.querySelector("#detailPanel"),t=document.querySelector("#detailOverlay");t&&t.classList.add("hidden"),e&&(e.classList.remove("slide-in"),e.classList.add("hidden"))}function X(e,t){try{const a=new Date(e),i=String(a.getDate()).padStart(2,"0"),n=String(a.getMonth()+1).padStart(2,"0"),c=a.getFullYear();return`LAP-${i}${n}${c}-${String(t).padStart(4,"0")}`}catch{return`LAP-000000-${String(t).padStart(4,"0")}`}}function ee(e){try{const t=new Date(e),a=new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Jakarta"}).format(t),i=new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",hour12:!1,timeZone:"Asia/Jakarta"}).format(t).replace(".",":");return{tgl:a,jam:i}}catch{return{tgl:"—",jam:"—"}}}function h(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function A(e){const t=document.querySelector("#mapSkeleton");t&&t.classList.toggle("hidden",!e)}function _(e="Belum ada laporan terverifikasi."){const t=document.querySelector("#mapEmptyState");t&&(t.querySelector("p").textContent=e,t.classList.remove("hidden"))}function te(){const e=document.querySelector("#mapEmptyState");e&&e.classList.add("hidden")}
