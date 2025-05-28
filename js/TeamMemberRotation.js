document.addEventListener('DOMContentLoaded', () => {
    const rotationChartBody = document.getElementById('rotationChartBody');
    const sortSelect = document.getElementById('sortMode');

    const centerData = JSON.parse(localStorage.getItem('centerSection_schedule') || '{}');
    const frontData = JSON.parse(localStorage.getItem('frontLine_schedule') || '{}');
    const rearData = JSON.parse(localStorage.getItem('rearLine_schedule') || '{}');

    const allQuarters = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4", "Quarter 5"];

    const extractTeamMembers = () => {
        const teamMembersSet = new Set();

        const extractMembers = (data) => {
            Object.values(data).forEach(quarterData => {
                Object.values(quarterData).forEach(members => {
                    if (Array.isArray(members)) {
                        members.forEach(member => {
                            if (typeof member === 'object' && member !== null) {
                                teamMembersSet.add(member.name || '[unnamed]');
                            } else {
                                teamMembersSet.add(member);
                            }
                        });
                    }
                });
            });
        };

        extractMembers(centerData);
        extractMembers(frontData);
        extractMembers(rearData);

        return Array.from(teamMembersSet).map(name => {
            const activity = (schedule) => {
                return allQuarters.reduce((count, quarter) => {
                    const qData = schedule[quarter];
                    if (!qData) return count;
                    for (const station in qData) {
                        const members = qData[station];
                        if (Array.isArray(members)) {
                            for (const m of members) {
                                const mName = typeof m === 'object' && m !== null ? m.name : m;
                                if (mName === name) return count + 1;
                            }
                        }
                    }
                    return count;
                }, 0);
            };

            const firstQuarter = allQuarters.findIndex(quarter => {
                const check = schedule => {
                    const qData = schedule[quarter];
                    if (!qData) return false;
                    return Object.values(qData).some(members =>
                        Array.isArray(members) && members.some(m =>
                            (typeof m === 'object' ? m.name : m) === name
                        )
                    );
                };
                return check(centerData) || check(frontData) || check(rearData);
            });

            return {
                name,
                activityCount: activity(centerData) + activity(frontData) + activity(rearData),
                firstQuarter: firstQuarter === -1 ? 99 : firstQuarter
            };
        });
    };

    const renderRotationChart = () => {
        rotationChartBody.innerHTML = "";

        let teamMembers = extractTeamMembers();

        const mode = sortSelect ? sortSelect.value : "alpha";
        if (mode === "assignments") {
            teamMembers.sort((a, b) => b.activityCount - a.activityCount);
        } else if (mode === "firstQuarter") {
            teamMembers.sort((a, b) => a.firstQuarter - b.firstQuarter);
        } else {
            teamMembers.sort((a, b) => a.name.localeCompare(b.name));
        }

        teamMembers.forEach(member => {
            const memberName = member.name;
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            nameCell.innerHTML = `<span style="cursor:pointer; text-decoration:underline;" onclick="openModal('${member.name}')">${member.name}</span>`;
            row.appendChild(nameCell);

            allQuarters.forEach(quarter => {
                const cell = document.createElement('td');
                let assignedStation = "-";

                const findStation = (schedule) => {
                    const quarterData = schedule[quarter];
                    if (quarterData) {
                        for (const station in quarterData) {
                            const members = quarterData[station];
                            if (Array.isArray(members)) {
                                for (const m of members) {
                                    const mName = typeof m === 'object' && m !== null ? m.name : m;
                                    if (mName === memberName) {
                                        return station;
                                    }
                                }
                            }
                        }
                    }
                    return null;
                };

                assignedStation = findStation(centerData) || findStation(frontData) || findStation(rearData) || "-";
                cell.textContent = assignedStation;
                row.appendChild(cell);
            });

            rotationChartBody.appendChild(row);
        });
    };

    // Initial render
    renderRotationChart();

    // Re-render on sort change
    if (sortSelect) {
        sortSelect.addEventListener("change", renderRotationChart);
    }
});
