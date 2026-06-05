function r(s,t="success",c=4e3){const a=document.querySelector(".toast-container")||l(),o={success:`<svg class="toast-icon" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10"/><polyline points="9,12 11,14 15,10"/></svg>`,error:`<svg class="toast-icon" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/></svg>`,warning:`<svg class="toast-icon" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,info:`<svg class="toast-icon" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/></svg>`},e=document.createElement("div");e.className=`toast toast-${t}`,e.innerHTML=`
    ${o[t]||o.success}
    <span class="toast-message">${s}</span>
    <button class="toast-close">&times;</button>
  `,a.appendChild(e),requestAnimationFrame(()=>e.classList.add("show"));const n=()=>{e.classList.remove("show"),setTimeout(()=>e.remove(),300)},i=setTimeout(n,c);e.querySelector(".toast-close").addEventListener("click",()=>{clearTimeout(i),n()})}function l(){const s=document.createElement("div");return s.className="toast-container",document.body.appendChild(s),s}export{r as s};
