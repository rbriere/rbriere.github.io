// Grid width
const DISPLAYWIDTH = 3;

// Load observations.json
async function loadObservations() {
    try {
        const res = await fetch("observations.json");
        const data = await res.json();
        return data.map((o, index) => ({ ...o, _id: index }));
    } catch (e) {
        console.error("Error loading observations.json", e);
        return [];
    }
}

// Utility: query param
function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// Utility: copyright
function setCopyright() {
    const el = document.getElementById("copyright");
    if (el) {
        el.textContent = `© RAB ${new Date().getFullYear()}`;
    }
}

// Sorting
function sortObservations(observations, mode) {
    const obs = [...observations];

    if (mode === "name") {
        obs.sort((a, b) =>
            a.description_short.localeCompare(b.description_short)
        );
    } else if (mode === "date_asc") {
        obs.sort((a, b) =>
            a.observation_date.localeCompare(b.observation_date)
        );
    } else {
        obs.sort((a, b) =>
            b.observation_date.localeCompare(a.observation_date)
        );
    }

    return obs;
}

// Filtering
function filterObservations(observations, text, field) {
    const q = text.trim().toLowerCase();
    if (!q) return observations;

    return observations.filter(o =>
        (o[field] || "").toLowerCase().includes(q)
    );
}

// Render grid
function renderGrid(observations) {
    const grid = document.getElementById("grid");
    grid.style.gridTemplateColumns = `repeat(${DISPLAYWIDTH}, 1fr)`;
    grid.innerHTML = "";

    observations.forEach(obs => {
        const item = document.createElement("div");
        item.className = "grid-item";

        const img = document.createElement("img");
        img.src = `thumbnails/${obs.thumbnail_image}`;
        img.alt = obs.description_short;
        img.addEventListener("click", () => {
            window.open(`observation.html?id=${obs._id}`, "_blank");
        });

        const caption = document.createElement("p");
        caption.textContent = obs.description_short;

        item.appendChild(img);
        item.appendChild(caption);
        grid.appendChild(item);
    });
}

// Init main page
async function initObservationsPage() {
    setCopyright();

    const allObservations = await loadObservations();

    const sortRadios = document.querySelectorAll('input[name="sort"]');
    const filterText = document.getElementById("filterText");
    const filterFieldRadios = document.querySelectorAll('input[name="filterField"]');

    function getSortMode() {
        return document.querySelector('input[name="sort"]:checked').value;
    }

    function getFilterField() {
        return document.querySelector('input[name="filterField"]:checked').value;
    }

    function refresh() {
        let obs = sortObservations(allObservations, getSortMode());
        obs = filterObservations(obs, filterText.value, getFilterField());
        renderGrid(obs);
    }

    sortRadios.forEach(r => r.addEventListener("change", refresh));
    filterFieldRadios.forEach(r => r.addEventListener("change", refresh));
    filterText.addEventListener("input", refresh);

    refresh();
}

// Init detail page
async function initObservationDetailPage() {
    setCopyright();

    const id = parseInt(getQueryParam("id"), 10);
    if (isNaN(id)) return;

    const observations = await loadObservations();
    const obs = observations.find(o => o._id === id);
    if (!obs) return;

    document.getElementById("detailImageWrapper").innerHTML =
        `<img src="images/${obs.actual_image}" alt="${obs.description_short}">`;

    document.getElementById("detailTable").innerHTML = `
        <tr><th>Description</th><td>${obs.description_full}</td></tr>
        <tr><th>Date</th><td>${obs.observation_date}</td></tr>
        <tr><th>Location</th><td>${obs.observation_location}</td></tr>
    `;
}
