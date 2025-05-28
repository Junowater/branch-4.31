// Handles table rendering **and** the edit-member modal.
// Drop into branch-4.2-main/js/TeamMemberRotation.js
(() => {
  /* ---------- config ---------- */
  const quarters = ["Quarter 1","Quarter 2","Quarter 3","Quarter 4"];
  const lines    = ["Front","Center","Rear","None"];

  /* ---------- short-hands ---------- */
  const $  = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const getData = () => JSON.parse(localStorage.getItem("teamMemberData") || "{}");
  const setData = d => localStorage.setItem("teamMemberData", JSON.stringify(d));

  /* ---------- ensure every known member has a record ---------- */
  function normalise() {
    const data = getData();
    const names = JSON.parse(localStorage.getItem("allTeamMembers") || "[]");
    names.forEach(n => {
      if (!data[n]) data[n] = {quarters:{}};
      quarters.forEach(q => { if (!data[n].quarters[q]) data[n].quarters[q] = "None"; });
    });
    setData(data);
    return data;
  }

  /* ---------- table ---------- */
  const tbody = $("#rotationChartBody");
  const sort  = $("#sortMode");

  function render() {
    const data = normalise();
    const rows = Object.entries(data).map(([name, {quarters:qObj}]) => ({
      name,
      assignments: quarters.map(q => qObj[q] || "None")
    }));

    switch (sort.value) {
      case "assignments":
        rows.sort((a,b)=>b.assignments.filter(l=>l!=="None").length -
                          a.assignments.filter(l=>l!=="None").length);
        break;
      case "firstQuarter":
        rows.sort((a,b)=>(a.assignments.findIndex(l=>l!=="None")||99) -
                          (b.assignments.findIndex(l=>l!=="None")||99));
        break;
      default:
        rows.sort((a,b)=>a.name.localeCompare(b.name));
    }

    tbody.innerHTML = "";
    rows.forEach(r=>{
      const tr=document.createElement("tr");
      tr.classList.add("clickable");
      tr.innerHTML = `<td>${r.name}</td>` +
                     r.assignments.map(l=>`<td>${l}</td>`).join("");
      tr.addEventListener("click", ()=>openModal(r.name));
      tbody.appendChild(tr);
    });
  }

  /* ---------- modal ---------- */
  const modal  = $("#memberModal"),
        title  = $("#modalTitle"),
        toggles= $("#quarterToggles"),
        close  = $("#closeModal"),
        save   = $("#saveRefreshBtn"),
        prof   = $("#openProfileBtn");

  function openModal(name){
    const data  = getData();
    const entry = data[name] || {quarters:{}};

    title.textContent = `Edit Assignments for ${name}`;
    toggles.innerHTML = "";

    quarters.forEach(q=>{
      const sel=document.createElement("select");
      lines.forEach(l=>{
        sel.innerHTML += `<option value="${l}"${l===entry.quarters[q]?" selected":""}>${l}</option>`;
      });
      sel.onchange=e=>entry.quarters[q]=e.target.value;

      const label=document.createElement("label");
      label.textContent = q+": ";
      label.appendChild(sel);
      toggles.appendChild(label);
      toggles.appendChild(document.createElement("br"));
    });

    save.onclick   = ()=>{ data[name]=entry; setData(data); modal.style.display="none"; render(); };
    prof.onclick   = ()=>{ location.href=`profile.html?name=${encodeURIComponent(name)}`; };

    modal.style.display="flex";
  }

  close.onclick       = ()=>modal.style.display="none";
  window.onclick      = e=>{ if(e.target===modal) modal.style.display="none"; };

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", ()=>{
    render();
    sort.addEventListener("change", render);
  });
})();
