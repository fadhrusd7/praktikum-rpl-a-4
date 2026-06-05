function d(){document.querySelectorAll(".password-toggle").forEach(t=>{t.addEventListener("click",()=>{const r=t.previousElementSibling||t.parentElement.querySelector("input");if(!r)return;const o=r.type==="text";r.type=o?"password":"text",t.innerHTML=o?`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <path d="M14.12 14.12a3 3 0 01-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>`:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>`})})}function u(){const e=document.querySelector("#password"),t=document.querySelectorAll(".strength-bar"),r=document.querySelector(".strength-text");!e||!t.length||e.addEventListener("input",()=>{const o=e.value;let s=0;o.length>=8&&s++,/[A-Z]/.test(o)&&s++,/[0-9]/.test(o)&&s++,/[^A-Za-z0-9]/.test(o)&&s++;const a=["","weak","medium","strong","strong"],l=["","Lemah","Sedang","Kuat","Sangat Kuat"];t.forEach(n=>{n.className="strength-bar"}),t.forEach((n,c)=>{c<s&&n.classList.add("active",a[s])}),r&&(r.textContent=o?`Kekuatan: ${l[s]}`:"")})}function g(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function h(e,t){var o;if(!e)return;e.classList.add("error");const r=(o=e.closest(".form-group"))==null?void 0:o.querySelector(".form-error");r&&(r.textContent=t,r.classList.add("show"))}function i(e){var r;if(!e)return;e.classList.remove("error");const t=(r=e.closest(".form-group"))==null?void 0:r.querySelector(".form-error");t&&(t.textContent="",t.classList.remove("show"))}function m(){document.querySelectorAll(".form-input.error").forEach(e=>i(e))}function p(e,t=!0){e&&(t?(e.dataset.originalText=e.innerHTML,e.disabled=!0,e.innerHTML=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" class="spinner">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0" opacity="0.2"/>
        <path d="M21 12a9 9 0 00-9-9"/>
      </svg>`,e.classList.add("loading")):(e.innerHTML=e.dataset.originalText||"Submit",e.disabled=!1,e.classList.remove("loading")))}function f(){if(document.querySelector("#ui-spinner-style"))return;const e=document.createElement("style");e.id="ui-spinner-style",e.textContent=`
    .spinner { animation: spin .8s linear infinite; vertical-align: middle; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `,document.head.appendChild(e)}document.addEventListener("DOMContentLoaded",()=>{f(),d(),u(),document.querySelectorAll(".form-input").forEach(e=>{e.addEventListener("input",()=>i(e))})});export{p as a,u as b,m as c,d as i,h as s,g as v};
