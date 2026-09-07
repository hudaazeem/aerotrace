const symptoms = [];

const symptomSelect = document.getElementById('symptoms');
const submit = document.getElementById('submit');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('timing');

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

    selectedSymptoms.forEach(symptom => {
        const symptomEntry = {
            symptom: symptom,
            date: date,
            time: timeOfDay
        }
        symptoms.push(symptomEntry);
    });

    updateStorage();
    renderSymptoms();
}

function renderSymptoms() {
    table.innerHTML = '';

    symptoms.forEach(symptom => {
        
        const row = document.createElement('tr');
        const symptomCell = document.createElement('td');
        const dateCell = document.createElement('td');
        const timeCell = document.createElement('td');

        symptomCell.innerText = symptom.symptom;
        dateCell.innerText = symptom.date;
        timeCell.innerText = symptom.time;

        row.appendChild(symptomCell);
        row.appendChild(dateCell);
        row.appendChild(timeCell);

        table.appendChild(row);
    });
}


function updateStorage(){
    localStorage.setItem('symptoms', JSON.stringify(symptoms));
}
