const filters = {
    academicYear: '',
    btechYear: '',
    semester: '',
    department: '',
    passComparison: 'equal', 
    passPercentage: ''
};

let teacherData = [];

// Fetch teacher data from JSON
async function fetchData() {
    try {
        const response = await fetch('teacherData.json');
        if (!response.ok) throw new Error('Network response was not ok');
        teacherData = await response.json();
        console.log("Data loaded:", teacherData);
        
        // Populate filter options
        populateFilterOptions();
    } catch (error) {
        console.error('Error fetching teacherData:', error);
    }
}

// Populate filter dropdowns
function populateFilterOptions() {
    const academicYears = [...new Set(teacherData.map(item => item["Academic Year"]))];
    const semesters = [...new Set(teacherData.map(item => item["Sem"]))];

    const academicYearSelect = document.getElementById('academicYear');
    const semesterSelect = document.getElementById('semester');

    academicYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        academicYearSelect.appendChild(option);
    });

    semesters.forEach(sem => {
        const option = document.createElement('option');
        option.value = sem;
        option.textContent = sem;
        semesterSelect.appendChild(option);
    });
}

fetchData();

document.getElementById('applyFilters').addEventListener('click', () => {
    // Get filter values
    filters.academicYear = document.getElementById('academicYear').value;
    filters.btechYear = document.getElementById('btechYear').value;
    filters.semester = document.getElementById('semester').value;
    filters.department = document.getElementById('department').value; 
    filters.passComparison = document.getElementById('passComparison').value;
    filters.passPercentage = document.getElementById('passPercentage').value;

    // Log current filter values for debugging
    console.log('Applying filters:', filters);

    applyFilters();
});

function applyFilters() {
    const filteredData = teacherData.filter(item => {
        let pass = true;

        // Filter by Academic Year
        if (filters.academicYear === '3') {
            // Filter for the last 3 years
            const last3Years = getLastNYears(3);
            if (!last3Years.includes(item["Academic Year"])) {
                pass = false;
            }
        } else if (filters.academicYear === '5') {
            // Filter for the last 5 years
            const last5Years = getLastNYears(5);
            if (!last5Years.includes(item["Academic Year"])) {
                pass = false;
            }
        } else if (filters.academicYear && filters.academicYear !== item["Academic Year"]) {
            pass = false;
        }

        // Filter by B. Tech. Year
        if (filters.btechYear && filters.btechYear !== String(item["B. Tech. Year"])) {
            pass = false;
        }

        // Filter by Semester
        if (filters.semester && filters.semester !== String(item.Sem)) {
            pass = false;
        }

        // Filter by Department/Section
        if (filters.department && !item.Section.startsWith(filters.department)) {
            pass = false;
        }

        // Filter by % of Pass
        if (filters.passPercentage) {
            const passPercent = parseFloat(filters.passPercentage);
            const itemPassPercent = parseFloat(item["% of Pass"]);
            if (isNaN(itemPassPercent)) return false; // Skip if invalid percentage

            switch (filters.passComparison) {
                case 'greater':
                    pass = itemPassPercent > passPercent;
                    break;
                case 'greaterEqual':
                    pass = itemPassPercent >= passPercent;
                    break;
                case 'less':
                    pass = itemPassPercent < passPercent;
                    break;
                case 'lessEqual':
                    pass = itemPassPercent <= passPercent;
                    break;
                case 'equal':
                default:
                    pass = itemPassPercent === passPercent;
                    break;
            }
        }

        return pass;
    });

    displayResults(filteredData);
}

// Get last N academic years
function getLastNYears(n) {
    const currentYear = new Date().getFullYear();
    const lastNYears = [];

    // Assuming academic year is formatted like "2022-2023"
    teacherData.forEach(item => {
        const year = item["Academic Year"];
        const yearParts = year.split("-");
        const startYear = parseInt(yearParts[0], 10);

        if (startYear >= currentYear - n) {
            lastNYears.push(year);
        }
    });

    return lastNYears;
}

// Display results
function displayResults(data) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results

    if (data.length === 0) {
        resultDiv.innerHTML = '<p>No results found.</p>';
        return;
    }

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    
    // Create table headers
    const headers = ['Sl. No', 'Name of the Teacher', 'Department', 'Name of the subject', 'Academic Year', 'B. Tech. Year', 'Sem', '% of Pass'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate table rows
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item["Name of the teacher"] || 'N/A'}</td>
            <td>${item.Section || 'N/A'}</td>
            <td>${item["Name of the subject"] || 'N/A'}</td>
            <td>${item["Academic Year"]}</td>
            <td>${item["B. Tech. Year"]}</td>
            <td>${item.Sem}</td>
            <td>${parseFloat(item["% of Pass"]).toFixed(2)}%</td>
        `;
        table.appendChild(row);
    });

    resultDiv.appendChild(table);
}
