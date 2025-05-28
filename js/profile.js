
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name");

  if (!name) {
    document.getElementById("memberName").textContent = "No team member selected.";
    return;
  }

  document.getElementById("memberName").textContent = "Profile: " + name;

  const scheduleKeys = {
    "Front Line": "frontLine_schedule",
    "Rear Line": "rearLine_schedule",
    "Center Section": "centerSection_schedule"
  };

  const knownStations = {
    "Front Line": new Set(),
    "Rear Line": new Set(),
    "Center Section": new Set()
  };

  for (let section in scheduleKeys) {
    const schedule = JSON.parse(localStorage.getItem(scheduleKeys[section]) || "{}");
    for (let quarter in schedule) {
      const stations = schedule[quarter];
      for (let station in stations) {
        const entries = stations[station];
        if (Array.isArray(entries)) {
          entries.forEach(obj => {
            if (obj.name === name) {
              knownStations[section].add(station);
            }
          });
        }
      }
    }
  }

  let output = "";
  for (let section in knownStations) {
    const list = Array.from(knownStations[section]);
    output += "<strong>" + section + ":</strong> " + (list.length ? list.join(", ") : "None") + "<br>";
  }

  const teamMemberData = JSON.parse(localStorage.getItem("teamMemberData") || "{}");
  const memberEntry = teamMemberData[name] || {};
  const trainingStations = [];

  if (memberEntry.yellowDots) {
    for (let station in memberEntry.yellowDots) {
      if (memberEntry.yellowDots[station]) {
        trainingStations.push(station);
      }
    }
  }

  output += "<strong>Training:</strong> " + (trainingStations.length ? trainingStations.join(", ") : "None");
  document.getElementById("knownStations").innerHTML = output;

  // Quarterly assignment display (formatted)
  const quarters = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"];
  const quarterAssignments = memberEntry.quarters || {};
  let assignmentHTML = "<ul>";
  quarters.forEach(q => {
    const line = quarterAssignments[q] || "Unassigned";
    assignmentHTML += "<li><strong>" + q + ":</strong> " + line + "</li>";
  });
  assignmentHTML += "</ul>";
  document.getElementById("lineAssignments").innerHTML = assignmentHTML;
});
