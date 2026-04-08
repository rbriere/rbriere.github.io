// Static grid width
const DISPLAYWIDTH = 3;

// Dynamically load all JSON files from /observations
async function loadObservations() {
    const observations = [];

    try {
        // Fetch directory listing
        const res = await fetch("observations/");
        const html = await res.text();

        // Extract all .json filenames
        const matches = [...html.matchAll(/href="([^"]+\.json)"/g)];
        const files = matches.map(m => m[1]);

        for (const file of files) {
            try {
                const jsonRes = await fetch(`observations/${file}`);
                if (!jsonRes.ok) continue;

                const data = await jsonRes.json();
                data._file = file;
                data._id = file.replace(/\.json$/i, "");
                observations.push(data);
            } catch (e) {
                console.error("Error loading JSON:", file, e);
            }
        }
    } catch (e) {
        console.error("Unable to read /observations directory", e);
    }

    return observations;
}

// Sorting helpers
function sortObservations(observations, mode) {
    const obs = [...observations];

    if (mode === "name") {
        obs.sort((a, b) =>
            (a.description_short || "").localeCompare(
                b.description_short || "",
                undefined,
                { sensitivity: "base" }
            )
        );
    } else if (mode === "date_asc") {
        obs.sort((a, b) =>
            new Date(a.observation_date) - new Date(b.observation_date)
        );
    } else {
        // Default: date_desc
        obs.sort((a, b) =>
            new Date(b.observation_date) - new Date(a.observation_date)
        );
    }

    return obs;
}

// Filtering helper
function filterObservations(observations, text, field) {
    const q = text.trim().toLowerCase();
    if (!q) return observations;

    return observations.filter(o => {
        const val = (o[field] || "").toString().toLowerCase();
        return val.includes(q);
    });
}

// Render grid
function renderGrid(observations) {
    const grid = document.getElementById("grid");
    if (!grid) return;

    grid.style.gridTemplateColumns = `repeat(${DISPLAYWIDTH}, 1fr)`;
    grid.innerHTML = "";

    observations.forEach(obs => {
        const id = obs._id;
        const thumb = obs.thumbnail_image
            ? `thumbnails/${obs.thumbnail_image}`
            : `thumbnails/${id}_tn.jpg`;

        const item = document.createElement("div");
        item.className = "grid-item";

        const img = document.createElement("img");
        img.src = thumb;
        img.alt = obs.description_short || "";
        img.addEventListener("click", () => {
            window.location.href = `observation.html?file=${encodeURIComponent(obs._file)}`;
        });

        const caption = document.createElement("p");
        caption.textContent = obs.description_short || "";

        item.appendChild(img);
        item.appendChild(caption);
        grid.appendChild(item);
    });
}

// Initialize main grid page
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

// Initialize detail page
async function initObservationDetailPage() {
    setCopyright();

    const file = getQueryParam("file");
    if (!file) return;

    let data;
    try {
        const res = await fetch(`observations/${file}`);
        if (!res.ok) return;
        data = await res.json();
    } catch (e) {
        console.error("Error loading detail JSON", e);
        return;
    }

    const id = file.replace(/\.json$/i, "");
    const imgPath = data.actual_image
        ? `images/${data.actual_image}`
        : `images/${id}.jpg`;

    const imgWrapper = document.getElementById("detailImageWrapper");
    const table = document.getElementById("detailTable");

    imgWrapper.innerHTML = `<img src="${imgPath}" alt="${data.description_short}">`;

    table.innerHTML = `
        <tr><th>Description</th><td>${data.description_full}</td></tr>
        <tr><th>Date</th><td>${data.observation_date}</td></tr>
        <tr><th>Location</th><td>${data.observation_location}</td></tr>
    `;
}

// Utility: get query parameter
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
