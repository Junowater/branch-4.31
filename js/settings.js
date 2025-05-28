
// Settings Page - Create Line Functionality

document.addEventListener("DOMContentLoaded", () => {
    const createLineForm = document.getElementById("createLineForm");
    const workstationsContainer = document.getElementById("workstationsContainer");
    const addWorkstationBtn = document.getElementById("addWorkstationBtn");

    // Add another workstation input field
    addWorkstationBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "workstationInput";
        input.placeholder = "Enter workstation name";
        workstationsContainer.appendChild(input);
        workstationsContainer.appendChild(document.createElement("br"));
    });

    // Handle form submission to create a new line
    createLineForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const lineName = document.getElementById("lineName").value.trim();
        const numQuarters = parseInt(document.getElementById("numQuarters").value);
        const workstations = Array.from(document.getElementsByClassName("workstationInput"))
            .map(input => input.value.trim())
            .filter(name => name);

        if (!lineName || workstations.length === 0 || numQuarters < 1) {
            alert("Please fill in all required fields!");
            return;
        }

        // Save data to localStorage or use your backend API
        const newLine = { lineName, workstations, numQuarters };
        const existingLines = JSON.parse(localStorage.getItem("lines") || "[]");
        existingLines.push(newLine);
        localStorage.setItem("lines", JSON.stringify(existingLines));

        alert(`Line "${lineName}" created successfully!`);
        window.location.href = "home.html"; // Redirect to Home Page
    });
});
