

async function loadResourcesWhereTo1() {
    // alert("here");
    const dropdown = document.getElementById('resourceDropdown');
    const status = document.getElementById('status');

    try {
        const response = await fetch('./other_resources.json');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const resources = await response.json();

        resources.sort((a, b) =>
            a.title.localeCompare(b.title)
        );

        dropdown.innerHTML =
            '<option value="">-- Select a destination --</option>';

        resources.forEach(resource => {
            const option = document.createElement('option');
            option.value = resource.url;
            option.textContent = resource.title;
            dropdown.appendChild(option);
        });

        // status.textContent =
        //     `${resources.length} destinations loaded.`;

    } catch (error) {
        dropdown.innerHTML =
            '<option value="">Unable to load resources</option>';

        // status.textContent =
        //     'Error loading other_resources.json';
        status.textContent =
            'leaving loadResourcesWhereTo 2';
    }
}

