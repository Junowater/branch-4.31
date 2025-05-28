// scripts.js

// ==================================================
// Data Structures
// ==================================================

// Workstations array
const workstations = [
    // If you have default workstations, list them here, e.g. "Hog 1", "Hog 2", etc.
];

let teamMembers = [];
let constraints = [];

const quarters = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4", "Quarter 5"];
let schedule = {};

// A global Set to track which constraints got violated
let violatedConstraints = new Set();

// ==================================================
// Initialize Schedule
// ==================================================
function initSchedule() {
    quarters.forEach(q => {
        schedule[q] = schedule[q] || {};
        workstations.forEach(ws => {
            if (!schedule[q][ws]) {
                schedule[q][ws] = [];
            }
        });
    });
    // Clear unassigned team members box
    document.getElementById("unassignedContent").innerHTML = "All team members are assigned in all quarters.";
}

// Function to get default team members
function getDefaultTeamMembers() {
    return [
        // Populate with default team members if needed
    ];
}

// Load Data from localStorage
function loadData() {
    let savedTeamMembers = localStorage.getItem('centerSection_' + "teamMembers");
    if (savedTeamMembers) {
        try {
            teamMembers = JSON.parse(savedTeamMembers);
            // Check if teamMembers is an array with at least one element
            if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
                teamMembers = getDefaultTeamMembers();
            }
        } catch (e) {
            teamMembers = getDefaultTeamMembers();
        }
    } else {
        teamMembers = getDefaultTeamMembers();
    }

    // Default constraints
    const defaultConstraints = [
        {
            id: 'noSameStationTwice',
            description: 'Team members cannot be assigned to the same station twice',
            enabled: true,
            type: 'noSameStationTwice',
            parameters: {}
        }
    ];

    let savedConstraints = localStorage.getItem('centerSection_' + "constraints");
    if (savedConstraints) {
        try {
            constraints = JSON.parse(savedConstraints);
            if (!Array.isArray(constraints) || constraints.length === 0) {
                constraints = defaultConstraints;
            }
        } catch (e) {
            constraints = defaultConstraints;
        }
    } else {
        constraints = defaultConstraints;
    }

    // Load workstations from localStorage
    let savedWorkstations = localStorage.getItem('centerSection_' + "workstations");
    if (savedWorkstations) {
        try {
            const parsedWorkstations = JSON.parse(savedWorkstations);
            if (Array.isArray(parsedWorkstations)) {
                workstations.length = 0;
                workstations.push(...parsedWorkstations);
            }
        } catch (e) {
            console.error("Error parsing saved workstations:", e);
        }
    }
}

// Save Data to localStorage
function saveData(showAlert = true) {
    localStorage.setItem('centerSection_' + "teamMembers", JSON.stringify(teamMembers));
    localStorage.setItem('centerSection_' + "constraints", JSON.stringify(constraints));
    localStorage.setItem('centerSection_' + "workstations", JSON.stringify(workstations));

    if (showAlert) {
        alert("Changes saved successfully!");
    }
}

// Generate Constraints List
function generateConstraintsList() {
    const constraintsList = document.getElementById("constraintsList");
    constraintsList.innerHTML = "";
    constraints.forEach((constraint, index) => {
        const div = document.createElement("div");
        div.classList.add("constraint-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `constraint-${index}`;
        checkbox.checked = constraint.enabled;
        checkbox.addEventListener("change", (e) => {
            constraint.enabled = e.target.checked;
            saveData(false);
        });

        const label = document.createElement("label");
        label.htmlFor = `constraint-${index}`;
        label.textContent = constraint.description;

        div.appendChild(checkbox);
        div.appendChild(label);

        // Delete Button
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("constraint-actions");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
            deleteConstraint(constraint.id);
        });

        actionsDiv.appendChild(deleteBtn);
        div.appendChild(actionsDiv);

        constraintsList.appendChild(div);
    });
}

// Delete Constraint
function deleteConstraint(id) {
    constraints = constraints.filter(constraint => constraint.id !== id);
    generateConstraintsList();
    saveData(false);
}

// Update Constraint Parameter Inputs
function updateConstraintParameterInputs() {
    const constraintTypeSelect = document.getElementById("constraintTypeSelect");
    const selectedType = constraintTypeSelect.value;
    const parametersDiv = document.getElementById("constraintParameters");
    parametersDiv.innerHTML = ''; // Clear previous parameters

    if (selectedType === 'noBackToBackStations') {
        parametersDiv.innerHTML = `
            <label>Station 1:</label>
            <select id="station1Select">
                ${workstations.map(ws => `<option value="${ws}">${ws}</option>`).join('')}
            </select>
            <label>Station 2:</label>
            <select id="station2Select">
                ${workstations.map(ws => `<option value="${ws}">${ws}</option>`).join('')}
            </select>
        `;
    } else if (selectedType === 'maxOneOfTwoStationsPerDay') {
        parametersDiv.innerHTML = `
            <label>Station 1:</label>
            <select id="station1Select">
                ${workstations.map(ws => `<option value="${ws}">${ws}</option>`).join('')}
            </select>
            <label>Station 2:</label>
            <select id="station2Select">
                ${workstations.map(ws => `<option value="${ws}">${ws}</option>`).join('')}
            </select>
        `;
    } else if (selectedType === 'noBackToBackThreeStations') {
        parametersDiv.innerHTML = `
            <label>Station 1:</label>
            <select id="station1Select">
                ${workstations.map(ws => `<option value="${ws}">${ws}</option>`).join('')}
            </select>
            <label>Station 2:</label>
            <select id="station2Select">
                ${workstations.map(ws => `<option value="${ws}">${ws}</option>`).join('')}
            </select>
            <label>Station 3:</label>
            <select id="station3Select">
                ${workstations.map(ws => `<option value="${ws}">${ws}</option>`).join('')}
            </select>
        `;
    } else if (selectedType === 'noSameStationTwice') {
        parametersDiv.innerHTML = '';
    }
}

// Add New Constraint
function addConstraint() {
    const constraintTypeSelect = document.getElementById("constraintTypeSelect");
    const selectedType = constraintTypeSelect.value;

    if (!selectedType) {
        alert("Please select a constraint type.");
        return;
    }

    let description = '';
    let parameters = {};

    if (selectedType === 'noBackToBackStations') {
        const station1Select = document.getElementById("station1Select");
        const station2Select = document.getElementById("station2Select");
        const station1 = station1Select.value;
        const station2 = station2Select.value;

        if (!station1 || !station2) {
            alert("Please select both stations.");
            return;
        }

        parameters = { station1, station2 };
        description = `Team members cannot do ${station1} and ${station2} back to back`;

    } else if (selectedType === 'maxOneOfTwoStationsPerDay') {
        const station1Select = document.getElementById("station1Select");
        const station2Select = document.getElementById("station2Select");
        const station1 = station1Select.value;
        const station2 = station2Select.value;

        if (!station1 || !station2) {
            alert("Please select both stations.");
            return;
        }

        parameters = { station1, station2 };
        description = `Team members can only work on ${station1} or ${station2} once per day`;

    } else if (selectedType === 'noBackToBackThreeStations') {
        const station1Select = document.getElementById("station1Select");
        const station2Select = document.getElementById("station2Select");
        const station3Select = document.getElementById("station3Select");
        const station1 = station1Select.value;
        const station2 = station2Select.value;
        const station3 = station3Select.value;

        if (!station1 || !station2 || !station3) {
            alert("Please select all three stations.");
            return;
        }

        parameters = { stations: [station1, station2, station3] };
        description = `Team members cannot work on ${station1}, ${station2}, or ${station3} back to back`;

    } else if (selectedType === 'noSameStationTwice') {
        description = 'Team members cannot be assigned to the same station twice';
        parameters = {};
    } else {
        alert("Invalid constraint type selected.");
        return;
    }

    // Generate a unique id for the constraint
    const id = selectedType + "_" + Date.now();

    // Check if constraint already exists with same parameters
    if (constraints.some(c => c.type === selectedType && JSON.stringify(c.parameters) === JSON.stringify(parameters))) {
        alert("This constraint already exists.");
        return;
    }

    // Add new constraint
    constraints.push({
        id: id,
        description: description,
        enabled: true,
        type: selectedType,
        parameters: parameters
    });

    generateConstraintsList();
    saveData(false);

    document.getElementById("constraintParameters").innerHTML = '';
    constraintTypeSelect.value = '';
}

// ==================================================
// Generate Skills Table
// ==================================================
function generateSkillsTable() {
    const table = document.getElementById("skillsTable");
    if (!table) {
        console.error("Skills table element not found.");
        return;
    }
    table.innerHTML = "";

    // Header Row
    let headerRow = "<tr><th>Team Member</th>";
    workstations.forEach(ws => {
        headerRow += `<th>${ws}</th>`;
    });
    headerRow += "</tr>";
    table.innerHTML += headerRow;

    // Data Rows
    teamMembers.forEach(tm => {
        let row = `<tr>`;
        row += `<td>
                    <div class="team-member-name-container">
                        <span onclick="toggleTeamMemberActive('${tm.name}', this)" class="${tm.active ? '' : 'inactive'}">${tm.name}</span>
                        <button class="delete-team-member-btn" onclick="deleteTeamMember('${tm.name}')">Delete</button>
                    </div>
                    <div class="dot-container">`;
        quarters.forEach(q => {
            let isActive = !tm.unavailableQuarters.includes(q);
            row += `<span class="quarter-dot ${isActive ? 'active' : 'inactive'}" onclick="toggleQuarterAvailability('${tm.name}', '${q}', this)" title="${q}"></span>`;
        });
        row += `   </div>
                </td>`;

        workstations.forEach(ws => {
            let canDo = tm.stations.includes(ws);
            let partialCanDo = tm.visualPartialStations && tm.visualPartialStations.includes(ws);
            row += `<td>
                        <span class="dot ${canDo ? 'black-dot' : 'white-dot'}" onclick="toggleSkill('${tm.name}', '${ws}', this)" title="Full Skill"></span>
                        <span class="dot ${partialCanDo ? 'yellow-dot' : 'white-dot'}" onclick="togglePartialSkill('${tm.name}', '${ws}', this)" title="Partial Skill"></span>
                    </td>`;
        });
        row += "</tr>";
        table.innerHTML += row;
    });

    console.log("Skills table regenerated with workstations:", workstations);
}

// After modifying schedule in any function:
generateScheduleTable();
generateSkillsTable();  // Refresh the skills chart

// ==================================================
// Generate Schedule Table
// ==================================================
function generateScheduleTable() {
    const table = document.getElementById("scheduleTable");
    table.innerHTML = "";

    // Header Row
    let headerRow = "<tr><th>Workstations</th>";
    quarters.forEach(q => {
        headerRow += `<th>${q} <button onclick="rotateQuarter('${q}')">Rotate</button></th>`;
    });
    headerRow += "</tr>";
    table.innerHTML += headerRow;

    // Data Rows
    workstations.forEach(ws => {
        let row = `<tr><td>${ws}</td>`;
        quarters.forEach(q => {
            let cellContent = schedule[q][ws].map(assignment => {
                let name = assignment.name;
                let lockState = assignment.lockState;
                let tm = teamMembers.find(tm => tm.name === name);
                if (tm && tm.active && !tm.unavailableQuarters.includes(q)) {
                    return `<div class="draggable ${lockState}" draggable="true" data-quarter="${q}" data-workstation="${ws}" ondragstart="drag(event)" onclick="event.stopPropagation(); toggleLockState(event, '${name}', '${q}', '${ws}')">
                        ${name}
                        <button class="remove-btn" onclick="removeTeamMemberFromCell(event, '${name}', '${q}', '${ws}')">X</button>
                    </div>`;
                } else {
                    return '';
                }
            }).join('');

            row += `<td class="droppable" onclick="handleCellClick(event)" ondrop="drop(event)" ondragover="allowDrop(event)" data-quarter="${q}" data-workstation="${ws}">
                ${cellContent}
            </td>`;
        });
        row += "</tr>";
        table.innerHTML += row;
    });
    generateTeamMemberPool();
}

function removeTeamMemberFromCell(event, name, quarter, workstation) {
    event.stopPropagation();
    schedule[quarter][workstation] = schedule[quarter][workstation].filter(a => a.name !== name);
    generateScheduleTable();
    updateUnassignedBox();
}

// Handle Cell Clicks to Add Team Member
function handleCellClick(event) {
    let cell = event.currentTarget;
    let quarter = cell.dataset.quarter;
    let workstation = cell.dataset.workstation;

    if (cell.innerHTML.trim() === '') {
        let input = document.createElement('input');
        input.type = 'text';
        input.className = 'team-member-input';
        input.placeholder = 'Type team member name';
        cell.appendChild(input);
        input.focus();

        input.addEventListener("input", function(e) {
            showTeamMemberSuggestions(e, input, quarter, workstation);
        });

        input.addEventListener("keydown", function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const name = input.value.trim();
                if (name !== "") {
                    assignTeamMemberToCell(name, quarter, workstation);
                }
                generateScheduleTable();
                updateUnassignedBox();
            }
        });

        input.addEventListener("blur", function() {
            setTimeout(function() {
                generateScheduleTable();
                updateUnassignedBox();
            }, 200);
        });
    }
}

function showTeamMemberSuggestions(e, input, quarter, workstation) {
    let value = input.value.toLowerCase();
    let cell = input.parentElement;
    let existingList = cell.querySelector('.suggestions-list');
    if (existingList) {
        cell.removeChild(existingList);
    }
    if (value === '') {
        return;
    }

    let suggestions = teamMembers.filter(tm => {
        return tm.active &&
               !tm.unavailableQuarters.includes(quarter) &&
               tm.name.toLowerCase().includes(value) &&
               !isTeamMemberAssignedInQuarter(tm.name, quarter);
    });

    if (suggestions.length === 0) {
        return;
    }

    let list = document.createElement('ul');
    list.className = 'suggestions-list';

    suggestions.forEach(tm => {
        let item = document.createElement('li');
        item.textContent = tm.name;
        item.addEventListener('mousedown', function(e) {
            e.preventDefault();
            assignTeamMemberToCell(tm.name, quarter, workstation);
            generateScheduleTable();
            updateUnassignedBox();
        });
        list.appendChild(item);
    });
    cell.appendChild(list);
}

function isTeamMemberAssignedInQuarter(name, quarter) {
    let assigned = false;
    workstations.forEach(ws => {
        if (schedule[quarter][ws].some(a => a.name === name)) {
            assigned = true;
        }
    });
    return assigned;
}

function assignTeamMemberToCell(name, quarter, workstation) {
    let tm = teamMembers.find(tm => tm.name === name);
    if (!tm || !tm.active || tm.unavailableQuarters.includes(quarter)) {
        alert(`${name} is not available in ${quarter}.`);
        return;
    }

    if (isTeamMemberAssignedInQuarter(name, quarter)) {
        alert(`${name} is already assigned in ${quarter}.`);
        return;
    }

    if (!tm.stations.includes(workstation) && !(tm.partialStations && tm.partialStations.includes(workstation))) {
        alert(`${name} does not have the skill to work on ${workstation}.`);
        return;
    }

    schedule[quarter][workstation].push({ name: name, lockState: 'none' });
}

// Toggle Lock State
function toggleLockState(event, name, quarter, workstation) {
    event.stopPropagation();
    let assignment = schedule[quarter][workstation].find(a => a.name === name);
    if (assignment) {
        if (assignment.lockState === 'none') {
            assignment.lockState = 'locked';
        } else if (assignment.lockState === 'locked') {
            assignment.lockState = 'training';
        } else {
            assignment.lockState = 'none';
        }
        generateScheduleTable();
    }
}

// Generate Team Member Pool
function generateTeamMemberPool() {
    const pool = document.getElementById("teamMemberPool");
    pool.innerHTML = "";
    teamMembers.forEach(tm => {
        if (tm.active) {
            let div = document.createElement("div");
            div.classList.add("draggable");
            div.setAttribute("draggable", "true");
            div.addEventListener("dragstart", dragFromPool);
            div.textContent = tm.name;
            pool.appendChild(div);
        }
    });
}

// Toggle Quarter Availability
function toggleQuarterAvailability(name, quarter, element) {
    let tm = teamMembers.find(tm => tm.name === name);
    if (tm.unavailableQuarters.includes(quarter)) {
        tm.unavailableQuarters = tm.unavailableQuarters.filter(q => q !== quarter);
        element.classList.remove('inactive');
        element.classList.add('active');
    } else {
        tm.unavailableQuarters.push(quarter);
        element.classList.remove('active');
        element.classList.add('inactive');
    }
    workstations.forEach(ws => {
        schedule[quarter][ws] = schedule[quarter][ws].filter(a => a.name !== name);
    });
    generateScheduleTable();
    updateUnassignedBox();
}

// Toggle Team Member Active Status
function toggleTeamMemberActive(name, element) {
    let tm = teamMembers.find(tm => tm.name === name);
    tm.active = !tm.active;
    if (!tm.active) {
        element.classList.add('inactive');
    } else {
        element.classList.remove('inactive');
    }
    quarters.forEach(quarter => {
        workstations.forEach(ws => {
            schedule[quarter][ws] = schedule[quarter][ws].filter(a => a.name !== name);
        });
    });
    generateScheduleTable();
    updateUnassignedBox();
    generateSkillsTable();
}

// Toggle Skill
function toggleSkill(name, ws, element) {
    let tm = teamMembers.find(tm => tm.name === name);

    if (tm.stations.includes(ws)) {
        tm.stations = tm.stations.filter(s => s !== ws);
        element.classList.remove('black-dot');
        element.classList.add('white-dot');
    } else {
        tm.stations.push(ws);
        element.classList.remove('white-dot');
        element.classList.add('black-dot');
        tm.partialStations = tm.partialStations ? tm.partialStations.filter(s => s !== ws) : [];
        let sibling = element.nextElementSibling;
        if (sibling && sibling.classList.contains('dot')) {
            sibling.classList.remove('yellow-dot');
            sibling.classList.add('white-dot');
        }
    }
    regenerateScheduleAfterSkillChange();
}

function togglePartialSkill(name, ws, element) {
    let tm = teamMembers.find(tm => tm.name === name);
    if (!tm) return;
    
    if (!tm.visualPartialStations) {
        tm.visualPartialStations = [];
    }
    if (tm.visualPartialStations.includes(ws)) {
        tm.visualPartialStations = tm.visualPartialStations.filter(s => s !== ws);
        element.classList.remove('yellow-dot');
        element.classList.add('white-dot');
    } else {
        tm.visualPartialStations.push(ws);
        element.classList.remove('white-dot');
        element.classList.add('yellow-dot');
    }
}

function regenerateScheduleAfterSkillChange() {
    quarters.forEach(quarter => {
        workstations.forEach(ws => {
            schedule[quarter][ws] = schedule[quarter][ws].filter(assignment => {
                let tm = teamMembers.find(tm => tm.name === assignment.name);
                return tm && (tm.stations.includes(ws) || (tm.partialStations && tm.partialStations.includes(ws)));
            });
        });
    });
    generateScheduleTable();
    updateUnassignedBox();
}

// Delete Team Member
function deleteTeamMember(name) {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
        teamMembers = teamMembers.filter(tm => tm.name !== name);
        quarters.forEach(q => {
            workstations.forEach(ws => {
                schedule[q][ws] = schedule[q][ws].filter(a => a.name !== name);
            });
        });
        saveData(false);
        generateSkillsTable();
        generateScheduleTable();
        updateUnassignedBox();
        renderSnapshotChart(schedule);

        let savedRotations = localStorage.getItem('centerSection_' + "savedRotations");
        if (savedRotations) {
            savedRotations = JSON.parse(savedRotations);
            savedRotations.forEach(rotation => {
                let rotationSchedule = rotation.schedule;
                quarters.forEach(q => {
                    workstations.forEach(ws => {
                        rotationSchedule[q][ws] = rotationSchedule[q][ws].filter(a => a.name !== name);
                    });
                });
            });
            localStorage.setItem('centerSection_' + "savedRotations", JSON.stringify(savedRotations));
            renderWeeklyChart(savedRotations);
        }
        generateTeamMemberPool();
    }
}

// Add New Team Member
function addTeamMember() {
    let nameInput = document.getElementById("newTeamMemberName");
    let name = nameInput.value.trim();
    if (name === "") {
        alert("Please enter a valid team member name.");
        return;
    }

    if (teamMembers.some(tm => tm.name === name)) {
        alert("A team member with this name already exists.");
        return;
    }

    teamMembers.push({
        name: name,
        stations: [],
        partialStations: [],
        active: true,
        unavailableQuarters: []
    });

    nameInput.value = "";
    generateSkillsTable();
    generateTeamMemberPool();
}

// Show Unassigned Team Members (display quarters horizontally)
function showUnassignedTeamMembers(teamMemberAssignments) {
    let unassignedByQuarter = {};
    quarters.forEach(quarter => {
        unassignedByQuarter[quarter] = [];
        teamMembers.forEach(tm => {
            if (!tm.active) return;
            const qIdx = quarters.indexOf(quarter);
            if (tm.unavailableQuarters.includes(quarter)) {
                unassignedByQuarter[quarter].push(`${tm.name} (Unavailable)`);
            } else if (!teamMemberAssignments[tm.name].assignments[qIdx]) {
                unassignedByQuarter[quarter].push(tm.name);
            }
        });
    });

    let contentDiv = document.getElementById("unassignedContent");
    contentDiv.innerHTML = "";

    let hasUnassigned = false;

    // Create a container to hold quarter-blocks side by side
    let quartersContainer = document.createElement("div");
    quartersContainer.classList.add("quarters-container");

    quarters.forEach(quarter => {
        if (unassignedByQuarter[quarter].length > 0) {
            hasUnassigned = true;

            // One block for each quarter
            let quarterBlock = document.createElement("div");
            quarterBlock.classList.add("quarter-block");

            let quarterHeading = document.createElement("h4");
            quarterHeading.textContent = quarter;
            quarterBlock.appendChild(quarterHeading);

            // Create the UL for unassigned members
            let ul = document.createElement("ul");
            ul.classList.add("unassigned-list");

            // Populate the UL
            unassignedByQuarter[quarter].forEach(name => {
                let li = document.createElement("li");
                // If the name includes "(Unavailable)", add the .unavailable class
                if (name.includes("(Unavailable)")) {
                    li.classList.add("unavailable");
                }
                li.textContent = name;
                ul.appendChild(li);
            });

            quarterBlock.appendChild(ul);
            quartersContainer.appendChild(quarterBlock);
        }
    });

    if (!hasUnassigned) {
        contentDiv.innerHTML = "All team members are assigned in all quarters.";
    } else {
        contentDiv.appendChild(quartersContainer);
    }
}

function updateUnassignedBox() {
    let teamMemberAssignments = {};
    teamMembers.forEach(tm => {
        teamMemberAssignments[tm.name] = {
            assignments: Array(quarters.length).fill(null)
        };
    });

    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        let quarter = quarters[qIdx];
        workstations.forEach(ws => {
            schedule[quarter][ws].forEach(assignment => {
                teamMemberAssignments[assignment.name].assignments[qIdx] = ws;
            });
        });
    }

    showUnassignedTeamMembers(teamMemberAssignments);
}

// ==================================================
// Drag & Drop
// ==================================================
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    const data = {
        name: ev.target.innerText.trim(),
        sourceQuarter: ev.target.dataset.quarter,
        sourceWorkstation: ev.target.dataset.workstation,
        fromPool: false
    };
    ev.dataTransfer.setData("text/plain", JSON.stringify(data));
}

function dragFromPool(ev) {
    const data = {
        name: ev.target.innerText.trim(),
        sourceQuarter: null,
        sourceWorkstation: null,
        fromPool: true
    };
    ev.dataTransfer.setData("text/plain", JSON.stringify(data));
}

function drop(ev) {
    ev.preventDefault();
    const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
    const name = data.name;
    const fromPool = data.fromPool;
    const sourceQuarter = data.sourceQuarter;
    const sourceWorkstation = data.sourceWorkstation;

    let targetCell = ev.currentTarget;
    let targetQuarter = targetCell.dataset.quarter;
    let targetWorkstation = targetCell.dataset.workstation;

    if (!targetQuarter || !targetWorkstation) {
        return;
    }

    let tm = teamMembers.find(tm => tm.name === name);
    if (!tm || !tm.active || tm.unavailableQuarters.includes(targetQuarter)) {
        alert(`${name} is not available in ${targetQuarter}.`);
        return;
    }

    if (sourceQuarter === targetQuarter) {
        if (sourceWorkstation === targetWorkstation) {
            return;
        }
        if (sourceWorkstation && schedule[sourceQuarter] && schedule[sourceQuarter][sourceWorkstation]) {
            schedule[sourceQuarter][sourceWorkstation] = schedule[sourceQuarter][sourceWorkstation].filter(a => a.name !== name);
        }

        if (schedule[targetQuarter] && schedule[targetQuarter][targetWorkstation]) {
            schedule[targetQuarter][targetWorkstation].push({ name: name, lockState: 'none' });
        }

        generateScheduleTable();
        updateUnassignedBox();
        return;
    }
    const audio = new Audio('sounds/drop letter.mp3'); // <-- Update path if needed
    audio.play().catch(err => {
        console.warn("Audio playback blocked by the browser:", err);
    });

    generateScheduleTable();
    updateUnassignedBox();
    

    let alreadyAssigned = false;
    workstations.forEach(ws => {
        if (schedule[targetQuarter][ws].some(a => a.name === name)) {
            alreadyAssigned = true;
        }
    });
    if (alreadyAssigned) {
        alert(`${name} is already assigned in ${targetQuarter}.`);
        return;
    }

    if (!fromPool) {
        if (sourceQuarter && sourceWorkstation && schedule[sourceQuarter][sourceWorkstation]) {
            schedule[sourceQuarter][sourceWorkstation] = schedule[sourceQuarter][sourceWorkstation].filter(a => a.name !== name);
        }
    }

    if (schedule[targetQuarter] && schedule[targetQuarter][targetWorkstation]) {
        schedule[targetQuarter][targetWorkstation].push({ name: name, lockState: 'none' });
    }

    generateScheduleTable();
    updateUnassignedBox();
}

function dropToPool(ev) {
    ev.preventDefault();
    const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
    const name = data.name;
    const fromPool = data.fromPool;
    const sourceQuarter = data.sourceQuarter;
    const sourceWorkstation = data.sourceWorkstation;

    if (fromPool) return;
    if (sourceQuarter && sourceWorkstation && schedule[sourceQuarter][sourceWorkstation]) {
        schedule[sourceQuarter][sourceWorkstation] = schedule[sourceQuarter][sourceWorkstation].filter(a => a.name !== name);
    }

    generateScheduleTable();
    updateUnassignedBox();
}

// ==================================================
// Rotate Assignments with Constraints (All Quarters)
// ==================================================
function rotateAssignments() {
    // Clear out old violations each time we attempt a rotation
    violatedConstraints = new Set();

    let teamMemberAssignments = {};
    teamMembers.forEach(tm => {
        teamMemberAssignments[tm.name] = {
            assignments: Array(quarters.length).fill(null),
            assignedWorkstations: [],
            Hog1or2AssignedToday: false
        };
    });

    // Fill in locked assignments
    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        let quarter = quarters[qIdx];
        workstations.forEach(ws => {
            schedule[quarter][ws].forEach(assignment => {
                if (assignment.lockState === 'locked' || assignment.lockState === 'training') {
                    let name = assignment.name;
                    teamMemberAssignments[name].assignments[qIdx] = ws;
                    teamMemberAssignments[name].assignedWorkstations.push(ws);
                    if (wsIsHog1or2(ws)) {
                        teamMemberAssignments[name].Hog1or2AssignedToday = true;
                    }
                }
            });
        });
    }

    // Clear non-locked assignments
    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        let quarter = quarters[qIdx];
        workstations.forEach(ws => {
            schedule[quarter][ws] = schedule[quarter][ws].filter(
                assignment => assignment.lockState === 'locked' || assignment.lockState === 'training'
            );
        });
    }

    const maxExecutionTime = 15000;
    const startTime = Date.now();

    if (assignWorkstationsEnhanced(0, teamMemberAssignments, startTime, maxExecutionTime)) {
        generateScheduleTable();
        updateUnassignedBox();
        renderSnapshotChart(schedule);
    } else {
        // If constraints were violated
        if (violatedConstraints.size > 0) {
            let audio = new Audio('sounds/alert tone 1.mp3');  // <-- update path if needed
            audio.play().catch(err => {
                console.warn("Audio playback blocked by the browser:", err);
            });

            alert(
                "Unable to create a schedule. The following constraints/issues were found:\n\n" +
                Array.from(violatedConstraints).join("\n")
            );
        } else {
            alert("No valid schedule could be generated with the current constraints.");
        }
    }
}

// The helper function for ALL quarters
function assignWorkstationsEnhanced(index, teamMemberAssignments, startTime, maxExecutionTime) {
    if (Date.now() - startTime > maxExecutionTime) {
        return false;
    }

    // Check if all stations assigned
    let allAssigned = true;
    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        let quarter = quarters[qIdx];
        for (let wsIdx = 0; wsIdx < workstations.length; wsIdx++) {
            let workstation = workstations[wsIdx];
            let existingAssignments = schedule[quarter][workstation];
            let isTraining = existingAssignments.some(a => a.lockState === 'training');
            let requiredAssignments = isTraining ? 2 : 1;

            if (existingAssignments.length < requiredAssignments) {
                allAssigned = false;
                break;
            }
        }
        if (!allAssigned) break;
    }
    if (allAssigned) return true;

    let minCandidates = Infinity;
    let selectedQuarterIndex = -1;
    let selectedWorkstationIndex = -1;

    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        let quarter = quarters[qIdx];
        for (let wsIdx = 0; wsIdx < workstations.length; wsIdx++) {
            let workstation = workstations[wsIdx];
            let existingAssignments = schedule[quarter][workstation];
            let isTraining = existingAssignments.some(a => a.lockState === 'training');
            let requiredAssignments = isTraining ? 2 : 1;

            if (existingAssignments.length >= requiredAssignments) continue;

            let candidates = teamMembers.filter(tm => {
                return tm.active &&
                       !tm.unavailableQuarters.includes(quarter) &&
                       (tm.stations.includes(workstation) || (tm.partialStations && tm.partialStations.includes(workstation))) &&
                       !teamMemberAssignments[tm.name].assignments[qIdx];
            });

            if (candidates.length < minCandidates) {
                minCandidates = candidates.length;
                selectedQuarterIndex = qIdx;
                selectedWorkstationIndex = wsIdx;
            }
        }
    }

    if (selectedQuarterIndex === -1) {
        return false;
    }

    let quarter = quarters[selectedQuarterIndex];
    let workstation = workstations[selectedWorkstationIndex];
    let existingAssignments = schedule[quarter][workstation];
    let isTraining = existingAssignments.some(a => a.lockState === 'training');
    let requiredAssignments = isTraining ? 2 : 1;

    let candidates = teamMembers.filter(tm => {
        return tm.active &&
               !tm.unavailableQuarters.includes(quarter) &&
               (tm.stations.includes(workstation) || (tm.partialStations && tm.partialStations.includes(workstation))) &&
               !teamMemberAssignments[tm.name].assignments[selectedQuarterIndex];
    });

    // If no candidates are available at all, mark "lack of team members" reason
    if (candidates.length === 0) {
        violatedConstraints.add(
            `Not enough team members to fill workstation "${workstation}" in ${quarter}.`
        );
        return false;
    }

    candidates = shuffleArray(candidates);

    for (let tm of candidates) {
        if (!isValidAssignment(tm, selectedQuarterIndex, workstation, teamMemberAssignments)) {
            continue;
        }
        schedule[quarter][workstation].push({ name: tm.name, lockState: 'none' });
        teamMemberAssignments[tm.name].assignments[selectedQuarterIndex] = workstation;
        let wasHog = teamMemberAssignments[tm.name].Hog1or2AssignedToday;
        if (wsIsHog1or2(workstation)) {
            teamMemberAssignments[tm.name].Hog1or2AssignedToday = true;
        }
        teamMemberAssignments[tm.name].assignedWorkstations.push(workstation);

        if (assignWorkstationsEnhanced(index + 1, teamMemberAssignments, startTime, maxExecutionTime)) {
            return true;
        }

        // Backtrack
        schedule[quarter][workstation] = schedule[quarter][workstation].filter(a => a.name !== tm.name);
        teamMemberAssignments[tm.name].assignments[selectedQuarterIndex] = null;
        teamMemberAssignments[tm.name].Hog1or2AssignedToday = wasHog;
        teamMemberAssignments[tm.name].assignedWorkstations.pop();
    }

    return false;
}

// Check constraints
function isValidAssignment(tm, quarterIndex, workstation, teamMemberAssignments) {
    for (let constraint of constraints) {
        if (!constraint.enabled) continue;
        switch (constraint.type) {
            case 'noSameStationTwice':
                if (teamMemberAssignments[tm.name].assignedWorkstations.includes(workstation)) {
                    violatedConstraints.add(constraint.description);
                    return false;
                }
                break;

            case 'noBackToBackStations':
                const prevWs = quarterIndex > 0
                    ? teamMemberAssignments[tm.name].assignments[quarterIndex - 1]
                    : null;
                if (prevWs === constraint.parameters.station1 && workstation === constraint.parameters.station2) {
                    violatedConstraints.add(constraint.description);
                    return false;
                }
                break;

            case 'maxOneOfTwoStationsPerDay':
                const assignedStations1 = teamMemberAssignments[tm.name].assignedWorkstations;
                if (assignedStations1.includes(constraint.parameters.station1) || assignedStations1.includes(constraint.parameters.station2)) {
                    if (workstation === constraint.parameters.station1 || workstation === constraint.parameters.station2) {
                        violatedConstraints.add(constraint.description);
                        return false;
                    }
                }
                break;

            case 'noBackToBackThreeStations':
                const prevWsThree = quarterIndex > 0
                    ? teamMemberAssignments[tm.name].assignments[quarterIndex - 1]
                    : null;
                if (prevWsThree && constraint.parameters.stations.includes(prevWsThree) &&
                    constraint.parameters.stations.includes(workstation)) {
                    violatedConstraints.add(constraint.description);
                    return false;
                }
                break;

            default:
                break;
        }
    }
    return true;
}

function wsIsHog1or2(ws) {
    return ws === "Hog 1" || ws === "Hog 2";
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ==================================================
// Export & Save Schedule
// ==================================================
function exportAndSaveSchedule() {
    const today = new Date().toLocaleDateString();
    const currentSchedule = JSON.parse(JSON.stringify(schedule));

    let savedRotations = localStorage.getItem('centerSection_' + "savedRotations");
    if (savedRotations) {
        savedRotations = JSON.parse(savedRotations);
    } else {
        savedRotations = [];
    }
    savedRotations.push({ date: today, schedule: currentSchedule });
    localStorage.setItem('centerSection_' + "savedRotations", JSON.stringify(savedRotations));

    alert("Schedule exported and saved successfully!");
    renderSnapshotChart(currentSchedule);
    renderWeeklyChart(savedRotations);
}

// ==================================================
// Charts
// ==================================================

// Snapshot Chart
function renderSnapshotChart(currentSchedule) {
    const ctx = document.getElementById('snapshotChart').getContext('2d');

    const workstationsLabels = workstations;
    const teamMemberColors = generateColorArray(teamMembers.length);
    const datasets = teamMembers.map((tm, index) => {
        const data = workstations.map(ws => {
            let assigned = false;
            quarters.forEach(q => {
                if (currentSchedule[q][ws].some(a => a.name === tm.name)) {
                    assigned = true;
                }
            });
            return assigned ? 1 : 0;
        });
        return {
            label: tm.name,
            data: data,
            backgroundColor: teamMemberColors[index],
            hidden: false
        };
    });

    if (window.snapshotChartInstance) {
        window.snapshotChartInstance.destroy();
    }

    window.snapshotChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: workstationsLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: { stacked: true },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return value === 1 ? label : null;
                        }
                    }
                }
            }
        }
    });
}

// Weekly Chart
function renderWeeklyChart(savedRotations) {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    const datesDiv = document.getElementById('weeklyDates');

    if (!savedRotations || savedRotations.length === 0) {
        if (window.weeklyChartInstance) {
            window.weeklyChartInstance.destroy();
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("No data available for the weekly chart.", ctx.canvas.width / 2, ctx.canvas.height / 2);
        datesDiv.innerHTML = "";
        return;
    }

    const last7Rotations = savedRotations.slice(-7);
    const rotationDates = last7Rotations.map(rotation => rotation.date);

    let dataMap = {};
    teamMembers.forEach(tm => {
        dataMap[tm.name] = {};
        workstations.forEach(ws => {
            dataMap[tm.name][ws] = 0;
        });
    });

    last7Rotations.forEach(rotation => {
        const rotationSchedule = rotation.schedule;
        quarters.forEach(q => {
            workstations.forEach(ws => {
                rotationSchedule[q][ws].forEach(assignment => {
                    if (dataMap[assignment.name] && dataMap[assignment.name][ws] !== undefined) {
                        dataMap[assignment.name][ws]++;
                    }
                });
            });
        });
    });

    const workstationsLabels = workstations;
    const teamMemberColors = generateColorArray(teamMembers.length);
    const datasets = teamMembers.map((tm, index) => {
        const data = workstationsLabels.map(ws => dataMap[tm.name][ws]);
        return {
            label: tm.name,
            data: data,
            backgroundColor: teamMemberColors[index],
            hidden: false
        };
    });

    if (window.weeklyChartInstance) {
        window.weeklyChartInstance.destroy();
    }

    window.weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: workstationsLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            },
            plugins: {
                legend: { position: 'right' },
                tooltip: { enabled: true }
            }
        }
    });

    datesDiv.innerHTML = `<p>Dates included in this chart: ${rotationDates.join(', ')}</p>`;
}

// Reset Weekly Data
function resetWeeklyData() {
    localStorage.removeItem('centerSection_' + "savedRotations");
    alert("Weekly data has been reset.");
    renderWeeklyChart([]);
}

function generateColorArray(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const hue = i * (360 / numColors);
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

function toggleAllDatasets(chartInstance, show) {
    chartInstance.data.datasets.forEach(function(dataset, index) {
        chartInstance.getDatasetMeta(index).hidden = !show;
    });
    chartInstance.update();
}

function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Event Listener for Export & Save
document.getElementById("exportScheduleBtn").addEventListener("click", exportAndSaveSchedule);

// Event Listeners
document.getElementById("rotateAllBtn").addEventListener("click", rotateAssignments);
document.getElementById("prioritizeNewStationBtn").addEventListener("click", rotateAssignmentsPrioritizeNewStation);
document.getElementById("addConstraintBtn").addEventListener("click", addConstraint);
document.getElementById("addTeamMemberBtn").addEventListener("click", addTeamMember);
document.getElementById("saveChangesBtn").addEventListener("click", saveData);

// Snapshot Chart Buttons
document.getElementById("snapshotHideAllBtn").addEventListener("click", function() {
    toggleAllDatasets(window.snapshotChartInstance, false);
});
document.getElementById("snapshotShowAllBtn").addEventListener("click", function() {
    toggleAllDatasets(window.snapshotChartInstance, true);
});

// Weekly Chart Buttons
document.getElementById("weeklyHideAllBtn").addEventListener("click", function() {
    toggleAllDatasets(window.weeklyChartInstance, false);
});
document.getElementById("weeklyShowAllBtn").addEventListener("click", function() {
    toggleAllDatasets(window.weeklyChartInstance, true);
});

// Event Listener for Reset Week
document.getElementById("resetWeekBtn").addEventListener("click", resetWeeklyData);

// NEW FEATURE: Delete Last Date from Weekly Chart
function deleteLastDateFromWeeklyChart() {
    let savedRotations = localStorage.getItem('centerSection_' + "savedRotations");
    if (!savedRotations) {
        alert("No saved rotations found.");
        return;
    }

    savedRotations = JSON.parse(savedRotations);
    if (savedRotations.length === 0) {
        alert("No saved days to delete.");
        return;
    }

    const lastEntry = savedRotations[savedRotations.length - 1];
    savedRotations.pop();
    localStorage.setItem('centerSection_' + "savedRotations", JSON.stringify(savedRotations));
    renderWeeklyChart(savedRotations);

    alert(`Rotation for ${lastEntry.date} has been deleted.`);
}

document.getElementById("deleteLastDayBtn").addEventListener("click", function() {
    deleteLastDateFromWeeklyChart();
});

// ==================================================
// Workstation Management
// ==================================================
function reloadWorkstations() {
    generateSkillsTable();
    updateUnassignedBox();
}

function addWorkstation(workstationName) {
    if (!workstations.includes(workstationName)) {
        workstations.push(workstationName);
        quarters.forEach(q => {
            schedule[q][workstationName] = [];
        });
        saveData(false);
        reloadWorkstations();
        console.log(`Workstation '${workstationName}' added successfully.`);
    } else {
        alert(`Workstation '${workstationName}' already exists.`);
    }
}

function removeWorkstation(workstationName) {
    const index = workstations.indexOf(workstationName);
    if (index !== -1) {
        workstations.splice(index, 1);
        quarters.forEach(q => {
            delete schedule[q][workstationName];
        });
        saveData(false);
        reloadWorkstations();
        console.log(`Workstation '${workstationName}' removed successfully.`);
    } else {
        alert(`Workstation '${workstationName}' does not exist.`);
    }
}

document.getElementById('addWorkstationBtn').addEventListener('click', function () {
    const workstationName = document.getElementById('newWorkstationName').value.trim();
    if (workstationName) {
        addWorkstation(workstationName);
        document.getElementById('newWorkstationName').value = '';
        generateScheduleTable();
    } else {
        alert('Please enter a workstation name.');
    }
});

document.getElementById('removeWorkstationBtn').addEventListener('click', function () {
    const workstationName = document.getElementById('removeWorkstationName').value.trim();
    if (workstationName) {
        removeWorkstation(workstationName);
        document.getElementById('removeWorkstationName').value = '';
        generateScheduleTable();
    } else {
        alert('Please enter a workstation name to remove.');
    }
});

// ==================================================
// Prioritize New Station Feature (Rotate All)
// ==================================================
function getPreviousDaySchedule() {
    let savedRotations = localStorage.getItem('centerSection_' + "savedRotations");
    if (savedRotations) {
        savedRotations = JSON.parse(savedRotations);
        if (savedRotations.length >= 1) {
            return savedRotations[savedRotations.length - 1].schedule;
        }
    }
    return null;
}

function checkTeamMemberAvailability() {
    let activeTeamMembers = teamMembers.filter(tm => tm.active);
    let totalAssignments = quarters.length * workstations.length;
    if (activeTeamMembers.length * quarters.length < totalAssignments) {
        alert("Not enough active team members to fill all workstations. Please add more team members or adjust constraints.");
        return false;
    }
    return true;
}

function rotateAssignmentsPrioritizeNewStation() {
    if (!checkTeamMemberAvailability()) {
        return;
    }
    violatedConstraints = new Set();

    let previousSchedule = getPreviousDaySchedule();
    if (!previousSchedule) {
        alert("No previous schedule found. Please ensure you have saved at least one schedule.");
        return;
    }

    let teamMemberAssignments = {};
    teamMembers.forEach(tm => {
        teamMemberAssignments[tm.name] = {
            assignments: Array(quarters.length).fill(null),
            assignedWorkstations: [],
            Hog1or2AssignedToday: false,
            previousStations: []
        };
        quarters.forEach(q => {
            workstations.forEach(ws => {
                if (previousSchedule[q] && previousSchedule[q][ws].some(a => a.name === tm.name)) {
                    teamMemberAssignments[tm.name].previousStations.push(ws);
                }
            });
        });
    });

    // Clear out non-locked/training for each quarter
    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        let quarter = quarters[qIdx];
        workstations.forEach(ws => {
            schedule[quarter][ws] = schedule[quarter][ws].filter(
                assignment => assignment.lockState === 'locked' || assignment.lockState === 'training'
            );
        });
    }

    // Keep locked/training
    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        let quarter = quarters[qIdx];
        workstations.forEach(ws => {
            schedule[quarter][ws].forEach(assignment => {
                if (assignment.lockState === 'locked' || assignment.lockState === 'training') {
                    let name = assignment.name;
                    teamMemberAssignments[name].assignments[qIdx] = ws;
                    teamMemberAssignments[name].assignedWorkstations.push(ws);
                    if (wsIsHog1or2(ws)) {
                        teamMemberAssignments[name].Hog1or2AssignedToday = true;
                    }
                }
            });
        });
    }

    const maxExecutionTime = 20000; 
    const startTime = Date.now();
    const result = assignWorkstationsPrioritizeNewStationEnhanced(teamMemberAssignments, startTime, maxExecutionTime);

    if (result) {
        generateScheduleTable();
        updateUnassignedBox();
        renderSnapshotChart(schedule);
    } else {
        // <--- CHANGED THIS PART --->
        // ALWAYS play error sound on failure
        let audio = new Audio('sounds/alert tone 1.mp3'); // <-- update path if needed
        audio.play().catch(err => {
            console.warn("Audio playback blocked by the browser:", err);
        });

        // Then check the constraints branch
        if (violatedConstraints.size > 0) {
            alert(
                "No valid schedule could be generated with the current constraints. " +
                "The following constraints/issues were found:\n\n" +
                Array.from(violatedConstraints).join("\n")
            );
        } else {
            alert("No valid schedule could be generated with the current constraints and prioritization.");
        }
    }
}

function assignWorkstationsPrioritizeNewStationEnhanced(teamMemberAssignments, startTime, maxExecutionTime) {
    if (Date.now() - startTime > maxExecutionTime) {
        return false;
    }

    let allAssigned = true;
    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        let quarter = quarters[qIdx];
        for (let wsIdx = 0; wsIdx < workstations.length; wsIdx++) {
            let workstation = workstations[wsIdx];
            let existingAssignments = schedule[quarter][workstation];
            let isTraining = existingAssignments.some(a => a.lockState === 'training');
            let requiredAssignments = isTraining ? 2 : 1;
            if (existingAssignments.length < requiredAssignments) {
                allAssigned = false;
                break;
            }
        }
        if (!allAssigned) break;
    }
    if (allAssigned) return true;

    let minCandidates = Infinity;
    let selectedQuarterIndex = -1;
    let selectedWorkstationIndex = -1;

    for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        let quarter = quarters[qIdx];
        for (let wsIdx = 0; wsIdx < workstations.length; wsIdx++) {
            let workstation = workstations[wsIdx];
            let existingAssignments = schedule[quarter][workstation];
            let isTraining = existingAssignments.some(a => a.lockState === 'training');
            let requiredAssignments = isTraining ? 2 : 1;

            if (existingAssignments.length >= requiredAssignments) continue;

            let candidates = teamMembers.filter(tm => {
                return tm.active &&
                       !tm.unavailableQuarters.includes(quarter) &&
                       (tm.stations.includes(workstation) || (tm.partialStations && tm.partialStations.includes(workstation))) &&
                       !teamMemberAssignments[tm.name].assignments[qIdx];
            });

            if (candidates.length < minCandidates) {
                minCandidates = candidates.length;
                selectedQuarterIndex = qIdx;
                selectedWorkstationIndex = wsIdx;
            }
        }
    }

    if (selectedQuarterIndex === -1) {
        return false;
    }

    let quarter = quarters[selectedQuarterIndex];
    let workstation = workstations[selectedWorkstationIndex];
    let existingAssignments = schedule[quarter][workstation];
    let isTraining = existingAssignments.some(a => a.lockState === 'training');
    let requiredAssignments = isTraining ? 2 : 1;

    let candidates = teamMembers.filter(tm => {
        return tm.active &&
               !tm.unavailableQuarters.includes(quarter) &&
               (tm.stations.includes(workstation) || (tm.partialStations && tm.partialStations.includes(workstation))) &&
               !teamMemberAssignments[tm.name].assignments[selectedQuarterIndex];
    });

    if (candidates.length === 0) {
        violatedConstraints.add(
            `Not enough team members to fill workstation "${workstation}" in ${quarter}.`
        );
        return false;
    }

    // Sort to prioritize new station (didn't work it yesterday => higher priority)
    candidates.sort((a, b) => {
        let aWorkedYesterday = teamMemberAssignments[a.name].previousStations.includes(workstation);
        let bWorkedYesterday = teamMemberAssignments[b.name].previousStations.includes(workstation);
        if (aWorkedYesterday && !bWorkedYesterday) return 1;
        if (!aWorkedYesterday && bWorkedYesterday) return -1;
        return 0;
    });

    candidates = shuffleArray(candidates);

    for (let tm of candidates) {
        if (!isValidAssignmentPrioritizeNewStation(tm, selectedQuarterIndex, workstation, teamMemberAssignments)) {
            continue;
        }
        schedule[quarter][workstation].push({ name: tm.name, lockState: 'none' });
        teamMemberAssignments[tm.name].assignments[selectedQuarterIndex] = workstation;
        let wasHog = teamMemberAssignments[tm.name].Hog1or2AssignedToday;
        if (wsIsHog1or2(workstation)) {
            teamMemberAssignments[tm.name].Hog1or2AssignedToday = true;
        }
        teamMemberAssignments[tm.name].assignedWorkstations.push(workstation);

        if (assignWorkstationsPrioritizeNewStationEnhanced(teamMemberAssignments, startTime, maxExecutionTime)) {
            return true;
        }

        schedule[quarter][workstation] = schedule[quarter][workstation].filter(a => a.name !== tm.name);
        teamMemberAssignments[tm.name].assignments[selectedQuarterIndex] = null;
        teamMemberAssignments[tm.name].Hog1or2AssignedToday = wasHog;
        teamMemberAssignments[tm.name].assignedWorkstations.pop();
    }

    return false;
}

function isValidAssignmentPrioritizeNewStation(tm, quarterIndex, workstation, teamMemberAssignments) {
    // Basic check: no same station twice
    if (teamMemberAssignments[tm.name].assignedWorkstations.includes(workstation)) {
        violatedConstraints.add("Team members cannot be assigned to the same station twice");
        return false;
    }

    // Also check user-defined constraints
    for (let constraint of constraints) {
        if (!constraint.enabled) continue;

        switch (constraint.type) {
            case 'noSameStationTwice':
                if (teamMemberAssignments[tm.name].assignedWorkstations.includes(workstation)) {
                    violatedConstraints.add(constraint.description);
                    return false;
                }
                break;

            case 'noBackToBackStations':
                const prevWs = quarterIndex > 0
                    ? teamMemberAssignments[tm.name].assignments[quarterIndex - 1]
                    : null;
                if (prevWs === constraint.parameters.station1 && workstation === constraint.parameters.station2) {
                    violatedConstraints.add(constraint.description);
                    return false;
                }
                break;

            case 'maxOneOfTwoStationsPerDay':
                const assignedStations1 = teamMemberAssignments[tm.name].assignedWorkstations;
                if (assignedStations1.includes(constraint.parameters.station1) || assignedStations1.includes(constraint.parameters.station2)) {
                    if (workstation === constraint.parameters.station1 || workstation === constraint.parameters.station2) {
                        violatedConstraints.add(constraint.description);
                        return false;
                    }
                }
                break;

            case 'noBackToBackThreeStations':
                const prevWsThree = quarterIndex > 0
                    ? teamMemberAssignments[tm.name].assignments[quarterIndex - 1]
                    : null;
                if (prevWsThree && constraint.parameters.stations.includes(prevWsThree) &&
                    constraint.parameters.stations.includes(workstation)) {
                    violatedConstraints.add(constraint.description);
                    return false;
                }
                break;

            default:
                break;
        }
    }

    return true;
}

// ==================================================
// NEW: Rotate Single Quarter (Advanced Approach)
// ==================================================
function rotateQuarter(quarter) {
    violatedConstraints = new Set();
    
    let qIdx = quarters.indexOf(quarter);
    if (qIdx === -1) {
        console.error("Invalid quarter:", quarter);
        return;
    }

    let teamMemberAssignments = {};
    teamMembers.forEach(tm => {
        teamMemberAssignments[tm.name] = {
            assignments: Array(quarters.length).fill(null),
            assignedWorkstations: [],
            Hog1or2AssignedToday: false
        };
    });

    // For all quarters, keep locked/training assignments as they are,
    // but remove non-locked from the chosen quarter.
    for (let i = 0; i < quarters.length; i++) {
        let theQuarter = quarters[i];
        workstations.forEach(ws => {
            if (i === qIdx) {
                schedule[theQuarter][ws] = schedule[theQuarter][ws].filter(
                    assignment => assignment.lockState === 'locked' || assignment.lockState === 'training'
                );
            }
            // Record locked/training assignments
            schedule[theQuarter][ws].forEach(assignment => {
                let name = assignment.name;
                teamMemberAssignments[name].assignments[i] = ws;
                teamMemberAssignments[name].assignedWorkstations.push(ws);
                if (wsIsHog1or2(ws)) {
                    teamMemberAssignments[name].Hog1or2AssignedToday = true;
                }
            });
        });
    }

    const maxExecutionTime = 15000;
    const startTime = Date.now();
    if (assignOneQuarter(qIdx, teamMemberAssignments, startTime, maxExecutionTime)) {
        generateScheduleTable();
        updateUnassignedBox();
        renderSnapshotChart(schedule);
    } else {
        if (violatedConstraints.size > 0) {
            let audio = new Audio('sounds/alert tone 1.mp3'); // <-- update path if needed
            audio.play().catch(err => {
                console.warn("Audio playback blocked by the browser:", err);
            });

            alert(
                `No valid schedule could be generated for ${quarter} given the constraints:\n\n` +
                Array.from(violatedConstraints).join("\n")
            );
        } else {
            alert(`No valid schedule could be generated for ${quarter} with the current constraints.`);
        }
    }
}

function assignOneQuarter(qIdx, teamMemberAssignments, startTime, maxExecutionTime) {
    if (Date.now() - startTime > maxExecutionTime) {
        return false;
    }

    let quarter = quarters[qIdx];
    // If the chosen quarter is fully assigned (including training duplications), we succeed
    for (let wsIdx = 0; wsIdx < workstations.length; wsIdx++) {
        let ws = workstations[wsIdx];
        let existingAssignments = schedule[quarter][ws];
        let isTraining = existingAssignments.some(a => a.lockState === 'training');
        let requiredAssignments = isTraining ? 2 : 1;

        if (existingAssignments.length < requiredAssignments) {
            // We must fill this station
            let candidates = teamMembers.filter(tm => {
                return tm.active &&
                    !tm.unavailableQuarters.includes(quarter) &&
                    (tm.stations.includes(ws) || (tm.partialStations && tm.partialStations.includes(ws))) &&
                    !teamMemberAssignments[tm.name].assignments[qIdx];
            });

            if (candidates.length === 0) {
                violatedConstraints.add(
                    `Not enough team members to fill workstation "${ws}" in ${quarter}.`
                );
                return false;
            }

            candidates = shuffleArray(candidates);

            for (let tm of candidates) {
                // Reuse the existing all-quarters constraint checker
                if (!isValidAssignment(tm, qIdx, ws, teamMemberAssignments)) {
                    continue;
                }

                // Assign
                schedule[quarter][ws].push({ name: tm.name, lockState: 'none' });
                teamMemberAssignments[tm.name].assignments[qIdx] = ws;

                let wasHog = teamMemberAssignments[tm.name].Hog1or2AssignedToday;
                if (wsIsHog1or2(ws)) {
                    teamMemberAssignments[tm.name].Hog1or2AssignedToday = true;
                }
                teamMemberAssignments[tm.name].assignedWorkstations.push(ws);

                // Continue filling the rest of the quarter
                if (assignOneQuarter(qIdx, teamMemberAssignments, startTime, maxExecutionTime)) {
                    return true;
                }

                // Backtrack
                schedule[quarter][ws] = schedule[quarter][ws].filter(a => a.name !== tm.name);
                teamMemberAssignments[tm.name].assignments[qIdx] = null;
                teamMemberAssignments[tm.name].Hog1or2AssignedToday = wasHog;
                teamMemberAssignments[tm.name].assignedWorkstations.pop();
            }
            return false;
        }
    }
    // If we reach here, the quarter is fully assigned
    return true;
}

// ==================================================
// Window Onload
// ==================================================
window.onload = function() {
    loadData();
    initSchedule();
    generateConstraintsList();
    generateSkillsTable();
    rotateAssignments(); // Attempt an initial schedule by default
    generateScheduleTable();
    updateUnassignedBox();

    renderSnapshotChart(schedule);

    let savedRotations = localStorage.getItem('centerSection_' + "savedRotations");
    if (savedRotations) {
        savedRotations = JSON.parse(savedRotations);
    } else {
        savedRotations = [];
    }
    renderWeeklyChart(savedRotations);

    displayCurrentDate();
};
document.getElementById("clearScheduleBtn").addEventListener("click", clearSchedule);
function clearSchedule() {
    // 1) Play audio
    let audio = new Audio('sounds/clear.mp3'); // <-- Update path if needed
    audio.play().catch(err => {
        console.warn("Audio playback blocked by the browser:", err);
    });

    // 2) Remove all assignments
    quarters.forEach(quarter => {
        workstations.forEach(ws => {
            schedule[quarter][ws] = [];
        });
    });

    // 3) Regenerate the table UI
    generateScheduleTable();
    updateUnassignedBox();

    // 4) (Optional) Provide user feedback
    alert("All team member assignments have been cleared.");
}
