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
        
        // Normalize data for consistent filtering
        teacherData = teacherData.map(item => ({
            ...item,
            Section: normalizeSectionName(item.Section)
        }));
        
        // Populate filter options
        populateFilterOptions();
    } catch (error) {
        console.error('Error fetching teacherData:', error);
    }
}

// Function to normalize section names for consistency
function normalizeSectionName(section) {
    if (!section) return section;

    // Remove leading and trailing spaces and convert to uppercase
    section = section.trim().toUpperCase();

    // Normalize spaces around hyphens
    section = section.replace(/\s*-\s*/g, '-');

    // Normalize section variations
    if (section === 'AI&ML' || section === 'AI & ML' || section === 'AIML') {
        return 'AIML';
    } else if (section === 'AI & DS' || section === 'AIDS' || section === 'AI&DS') {
        return 'AI & DS';
    } else if (section.startsWith('CSE') && section !== 'CSE') {
        return section; // Keep differentiated sections like CSE-1, CSE-2
    } else if (section.startsWith('IT') && section !== 'IT') {
        return section; // Keep differentiated sections like IT-2
    } else if (section.startsWith('ECE') && section !== 'ECE') {
        return section; // Keep differentiated sections like ECE-1, ECE-2
    } else if (section.startsWith('EEE') && section !== 'EEE') {
        return section; // Keep differentiated sections like EEE-1, EEE-2
    } else if (section === 'CSE' || section === 'IT' || section === 'ECE' || section === 'EEE' || section === 'MECH' || section === 'CIVIL') {
        return section; // Return major departments as is
    } else if (section === 'CE') {
        return 'CIVIL';
    } else if (section === 'MECHANICAL') {
        return 'MECH';
    }
    return section; // Return original if no match is found
}

// Populate filter dropdowns
function populateFilterOptions() {
    const academicYears = [...new Set(teacherData.map(item => item["Academic Year"]))];
    const semesters = [...new Set(teacherData.map(item => item["Sem"]))];
    
    // Collect unique main departments while keeping differentiated sections intact
    const sections = [];
    teacherData.forEach(item => {
        const section = item.Section;
        if (section && !sections.includes(section)) {
            sections.push(section);
        }
    });

    const academicYearSelect = document.getElementById('academicYear');
    const semesterSelect = document.getElementById('semester');
    const departmentSelect = document.getElementById('department');

    // Populate academic years
    academicYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        academicYearSelect.appendChild(option);
    });

    // Populate semesters
    semesters.forEach(sem => {
        const option = document.createElement('option');
        option.value = sem;
        option.textContent = sem;
        semesterSelect.appendChild(option);
    });

    // Populate unique sections
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        departmentSelect.appendChild(option);
    });
}

fetchData();

document.getElementById('applyFilters').addEventListener('click', () => {
    // Get filter values
    filters.academicYear = document.getElementById('academicYear').value;
    filters.btechYear = document.getElementById('btechYear').value;
    filters.semester = document.getElementById('semester').value;
    filters.department = document.getElementById('department').value.trim(); 
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
        if (filters.department) {
            const normalizedDepartment = normalizeSectionName(filters.department);
            const normalizedItemSection = normalizeSectionName(item.Section);
            
            // If the main department (e.g., "ECE") is selected, match all corresponding sections (e.g., "ECE-1", "ECE-2", etc.)
            if (
                normalizedDepartment !== normalizedItemSection &&
                !normalizedItemSection.startsWith(normalizedDepartment)
            ) {
                pass = false;
            }
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
