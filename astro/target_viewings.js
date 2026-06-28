let viewingData = [];

let currentSortColumn = "CardinalDirection";
let currentSortDirection = "asc";

document.addEventListener("DOMContentLoaded", () => {

    const uploadButton = document.getElementById("uploadButton");
    const fileInput = document.getElementById("jsonFile");

    uploadButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", loadJsonFile);

    document
        .querySelectorAll(".directionFilter")
        .forEach(cb => {
            cb.addEventListener("change", renderGrid);
        });

    document
        .querySelectorAll("th[data-sort]")
        .forEach(th => {
            th.addEventListener("click", () => {
                sortGrid(th.dataset.sort);
            });
        });
});

function loadJsonFile(event) {

    const file = event.target.files[0];

    if (!file)
        return;

    const reader = new FileReader();

    reader.onload = function (e) {

        const json = JSON.parse(e.target.result);

        viewingData = json.map(item => new ViewingTarget(item));
        selectAllDirectionFilters();
        renderGrid();
    };

    reader.readAsText(file);
}

function getSelectedDirections() {

    return [...document.querySelectorAll(".directionFilter:checked")]
        .map(cb => cb.value);
}

function getFilteredData() {

    const directions = getSelectedDirections();

    return viewingData.filter(item =>
        directions.includes(item.CardinalDirection)
    );
}

function sortGrid(column) {

    if (currentSortColumn === column) {
        currentSortDirection =
            currentSortDirection === "asc"
                ? "desc"
                : "asc";
    }
    else {
        currentSortColumn = column;
        currentSortDirection = "asc";
    }

    renderGrid();
}

function renderGrid() {

    const tbody = document.querySelector("#viewingTable tbody");

    let rows = getFilteredData();

    rows.sort((a, b) => {

        let result = 0;

        if (currentSortColumn === "CardinalDirection") {

            result =
                a.CardinalDirection.localeCompare(
                    b.CardinalDirection
                );

            if (result === 0) {
                result = a.Rank - b.Rank;
            }
        }
        else if (currentSortColumn === "Rank") {

            result = a.Rank - b.Rank;

            if (result === 0) {

                result =
                    a.CardinalDirection.localeCompare(
                        b.CardinalDirection
                    );
            }
        }

        return currentSortDirection === "asc"
            ? result
            : result * -1;
    });

    tbody.innerHTML = "";

    rows.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.CardinalDirection}</td>
            <td>${item.Rank}</td>
            <td>${item.getCombinedTarget()}</td>
            <td>${item.GeneralDirection}</td>
            <td>${item.Constellation}</td>
            <td>${item.getDistanceMillions()}</td>
            <td>${item.Altitude}</td>
        `;

        tbody.appendChild(tr);
    });
}

function selectAllDirectionFilters() {

    document
        .querySelectorAll(".directionFilter")
        .forEach(cb => cb.checked = true);

    // renderGrid();
}

function clearAllDirectionFilters() {

    document
        .querySelectorAll(".directionFilter")
        .forEach(cb => cb.checked = false);

    // renderGrid();
}

function setCopyright() {
    const el = document.getElementById("copyright");
    if (el) {
        el.textContent =  `© ${new Date().getFullYear()} RAB`;
    }
}
