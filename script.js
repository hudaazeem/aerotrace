const symptoms = [];

const symptomSelect = document.getElementById('symptoms');
const submit = document.getElementById('submit');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('timing');
const severitySelect = document.getElementById('severity');
const locationInput = document.getElementById('location');
const table = document.getElementById('symptomList');


window.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('symptoms')) || [];
    symptoms.push(...saved);
    renderSymptoms();
});

submit.addEventListener('click', addSymptoms);

function addSymptoms(){
    const selectedSymptoms = Array.from(symptomSelect.selectedOptions).map(option => option.value);

    const date = dateInput.value;

    const timeOfDay = timeSelect.value;
    
    const severity = severitySelect.value;

    const location = locationInput.value;

    if(selectedSymptoms.length === 0 || date === '' || timeOfDay === '' || severity === '' || location === '' || location.length !=5){
        alert('Please complete all fields');
        return;
    }

    selectedSymptoms.forEach(symptom => {
        const symptomEntry = {
            symptom: symptom,
            date: date,
            time: timeOfDay,
            severity: severity,
            location: location
        }
        symptoms.push(symptomEntry);
    });

    

    updateStorage();
    renderSymptoms();

    symptomSelect.selectedIndex = -1;
    dateInput.value = '';
    timeSelect.value = 'morning';
    severitySelect.value = '1';
}

function renderSymptoms() {
    table.innerHTML = '';

    symptoms.forEach((symptom, index) => {
        
        const row = document.createElement('tr');
        const symptomCell = document.createElement('td');
        const dateCell = document.createElement('td');
        const timeCell = document.createElement('td');
        const severityCell = document.createElement('td');
        const locationCell = document.createElement('td');

        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        
        deleteButton.innerText = 'Delete';

        deleteButton.addEventListener('click', () => {
            symptoms.splice(index, 1);
            updateStorage();
            renderSymptoms();
        });

        actionCell.appendChild(deleteButton);

        symptomCell.innerText = symptom.symptom;
        dateCell.innerText = symptom.date;
        timeCell.innerText = symptom.time;
        severityCell.innerText = symptom.severity;
        locationCell.innerText = symptom.location;

        row.appendChild(symptomCell);
        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(severityCell);
        row.appendChild(locationCell);
        row.appendChild(actionCell);
        
        table.appendChild(row);
    });
}


function updateStorage(){
    localStorage.setItem('symptoms', JSON.stringify(symptoms));
}
