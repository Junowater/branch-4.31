// Team Member Rotation -- v1.2
// • Handles table rendering and the edit-member modal
// • Imports rotations from Front, Center, Rear line pages
// • NEW: gracefully handles schedule entries that are objects
//        ( { name:"Alice", … } ) and falls back to .toString()

(() => {
  /* ---------- config ---------- */
  const quarters = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"];
  const lines    = ["Front", "Center", "Rear", "None"];

  const lineStores = [
    { prefix: "frontLine_",     label: "Front"  },
    { prefix: "centerSection_", label: "Center" },
    { prefix: "rearLine_",      label: "Rear"   }
  ];

  /* ---------- helpers ---------- */
  const $  = s => document.querySelector(s);
  const getData = () => JSON.parse(localStorage.getItem("teamMemberData") || "{}");
  const setData = d => localStorage.setItem("teamMemberData", JSON.stringify(d));

  /* =====================================================================
     1 – IMPORT EXISTING DATA (schedules + master team list) ONCE AT LOAD
  ====================================================================== */
  function importSchedules() {
    const imported = {};              // { "Alice": { quarters:{} }, … }
    const allNames = new Set();

    /* ---- a.  names from the master teamMembers array ---- */
    try {
      const master = JSON.parse(localStorage.getItem("teamMembers") || "[]");
      master.forEach(entry => {
        const name = (typeof entry === "string") ? entry
                   : (entry && entry.name)       ? entry.name
                   : String(entry);
        allNames.add(name);
        imported[name] = imported[name] || { quarters: {} };
      });
    } catch { /* ignore parse errors */ }

    /* ---- b.  names/lines from each line-page schedule ---- */
    lineStores.forEach(({ prefix, label }) => {
      const raw = localStorage.getItem(prefix + "schedule");
      if (!raw) return;

      let sched; try { sched = JSON.parse(raw); } catch { return; }

      quarters.forEach(q => {
        const byStation = sched[q];
        if (!byStation) return;

        Object.values(byStation).forEach(list => {
          (list || []).forEach(entry => {
            const name = (typeof entry === "string") ? entry
                       : (entry && entry.name)       ? entry.name
                       : String(entry);

            allNames.add(name);
            imported[name] = imported[name] || { quarters: {} };
            if (!imported[name].quarters[q] || imported[name].quarters[q] === "None") {
              imported[name].quarters[q] = label;
            }
          });
        });
      });
    });

    /* ---- c.  merge with whatever the rotation page saved previously ---- */
    const existing = getData();
    Object.entries(existing).forEach(([name, obj]) => {
      allNames.add(name);
      imported[name] = imported[name] || { quarters: {} };
      quarters.forEach(q => {
        if (obj.quarters && obj.quarters[q]) imported[name].quarters[q] = obj.quarters[q];
      });
    });

    /* ---- d.  persist and expose ---- */
    setData(imported);
    localStorage.setItem("allTeamMembers", JSON.stringify([...allNames].sort()));
  }

  /* ---------- ensure every member has 4 quarters ---------- */
  function normalise() {
    const data  = getData();
    const names = JSON.parse(localStorage.getItem("allTeamMembers") || "[]");

    names.forEach(n => {
      if (!data[n]) data[n] = { quarters: {} };
      quarters.forEach(q => {
        if (!data[n].quarters[q]) data[n].quarters[q] = "None";
      });
    });

    setData(data);
    return data;
  }

  /* ---------- table renderer ---------- */
  const tbody = $("#rotationChartBody");
  const sort  = $("#sortMode");

  function render() {
    const data = normalise();
    const rows = Object.entries(data).map(([name, { quarters: qs }]) => ({
      name,
      assignments: quarters.map(q => qs[q] || "None")
    }));

    switch (sort.value) {
      case "assignments":
        rows.sort((a, b) =>
          b.assignments.filter(l => l !== "None").length -
          a.assignments.filter(l => l !== "None").length);
        break;
      case "firstQuarter":
        rows.sort((a, b) =>
          (a.assignments.findIndex(l => l !== "None") || 99) -
          (b.assignments.findIndex(l => l !== "None") || 99));
        break;
      default:
        rows.sort((a, b) => a.name.localeCompare(b.name));
    }

    tbody.innerHTML = "";
    rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.classList.add("clickable");
      tr.innerHTML = `<td>${r.name}</td>` +
                     r.assignments.map(l => `<td>${l}</td>`).join("");
      tr.onclick = () => openModal(r.name);
      tbody.appendChild(tr);
    });
  }

  /* ---------- modal ---------- */
  const modal   = $("#memberModal");
  const title   = $("#modalTitle");
  const toggles = $("#quarterToggles");
  const close   = $("#closeModal");
  const save    = $("#saveRefreshBtn");
  const prof    = $("#openProfileBtn");

  function openModal(name) {
    const data  = getData();
    const entry = data[name] || { quarters: {} };

    title.textContent = `Edit Assignments for ${name}`;
    toggles.innerHTML = "";

    quarters.forEach(q => {
      const sel = document.createElement("select");
      lines.forEach(l => {
        sel.innerHTML += `<option value="${l}"${l === entry.quarters[q] ? " selected" : ""}>${l}</option>`;
      });
      sel.onchange = e => entry.quarters[q] = e.target.value;

      const label = document.createElement("label");
      label.textContent = q + ": ";
      label.appendChild(sel);
      toggles.appendChild(label);
      toggles.appendChild(document.createElement("br"));
    });

    save.onclick = () => { data[name] = entry; setData(data); modal.style.display = "none"; render(); };
    prof.onclick = () => { location.href = `profile.html?name=${encodeURIComponent(name)}`; };

    modal.style.display = "flex";
  }

  close.onclick  = () => modal.style.display = "none";
  window.onclick = e  => { if (e.target === modal) modal.style.display = "none"; };

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    importSchedules();      // first, gather everything
    render();               // then draw
    sort.onchange = render;
  });
})();
