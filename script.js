const symptoms = [];

const symptomSelect = document.getElementById('symptoms');
const submit = document.getElementById('submit');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('timing');
const severitySelect = document.getElementById('severity');
const locationInput = document.getElementById('location');
const loggingNow = document.getElementById('loggingNow');
const table = document.getElementById('symptomList');
const noSymptoms = document.getElementById('noSymptoms');

window.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('symptoms')) || [];
    symptoms.push(...saved);
    renderSymptoms();
});

submit.addEventListener('click', addSymptoms);
loggingNow.addEventListener('change', ()=> {
    if(loggingNow.checked){
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth()+1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;

        dateInput.value=formattedDate;
        dateInput.disabled = true;

        const hour = today.getHours();
        timeSelect.disabled = true;
        if(hour>=5&&hour<12){
            timeSelect.value = 'morning';
        }else if(hour >=12 && hour<17){
            timeSelect.value = 'afternoon';
        }else{
            timeSelect.value = 'evening';
        }

    }else{
        dateInput.disabled = false;
        timeSelect.disabled = false;
    }
});

noSymptoms.addEventListener('change', ()=> {
    symptomSelect.disabled = noSymptoms.checked;
    severitySelect.disabled = noSymptoms.checked;

    if(noSymptoms.checked){
        symptomSelect.selectedIndex = -1;
    }
})

async function addSymptoms(){
    const selectedSymptoms = Array.from(symptomSelect.selectedOptions).map(option => option.value);

    const date = dateInput.value;

    const timeOfDay = timeSelect.value;
    
    const severity = severitySelect.value;

    const location = locationInput.value.trim();
    const zipPattern = /^[0-9]{5}$/;

    if((!noSymptoms.checked && selectedSymptoms.length === 0) || date === '' || timeOfDay === '' || (severity === '' &&!noSymptoms.checked)){
        alert('Please complete all fields');
        return;
    }

    if(!zipPattern.test(location)){
        alert('Please enter a valid 5-digit ZIP code.');
        return;
    }

    let airQuality = null;

    if(loggingNow.checked){
        try{
            airQuality= await getEnvironmentalData(location);
        }catch(error){
            console.log(error.message);
        }
    }

    console.log(airQuality);

    const observationId=crypto.randomUUID();

    if(noSymptoms.checked){
        symptoms.push({
            observationId: observationId,
            symptom: null, 
            date: date,
            time: timeOfDay, 
            severity: 0, 
            location: location,
            airQuality: airQuality,
            loggedAt: new Date().toISOString()
        })
    }

    selectedSymptoms.forEach(symptom => {
        const symptomEntry = {
            observationId: observationId,
            symptom: symptom,
            date: date,
            time: timeOfDay,
            severity: Number(severity),
            location: location,
            airQuality: airQuality,
            loggedAt: new Date().toISOString()
        }
        symptoms.push(symptomEntry);
    });

    

    updateStorage();
    renderSymptoms();

    symptomSelect.selectedIndex = -1;
    dateInput.value = '';
    timeSelect.value = 'morning';
    severitySelect.value = '1';

    loggingNow.checked = false;
    dateInput.disabled = false;
    timeSelect.disabled = false;

    noSymptoms.checked = false;
    symptomSelect.disabled = false;
    severitySelect.disabled = false;
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


async function getLocation(zipcode){
    const response = await fetch(`https://api.zippopotam.us/us/${zipcode}`);
    if(!response.ok){
        throw new Error("Invalid ZIP code");
    }
    
    const data = await response.json();

    return {
        latitude: data.places[0].latitude,
        longitude: data.places[0].longitude
    }

}

async function getAirQuality(latitude, longitude){
    const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide`);
    
    if(!response.ok){
        throw new Error("Unable to retrieve air quality data");
    }
    
    const data = await response.json();

    return {
        aqi: data.current.us_aqi,
        pm25: data.current.pm2_5,
        pm10: data.current.pm10,
        ozone: data.current.ozone,
        no2: data.current.nitrogen_dioxide,
        co: data.current.carbon_monoxide,
        time: data.current.time
    }
}

async function getEnvironmentalData(zipcode){
    const location = await getLocation(zipcode);

    const airQuality = await getAirQuality(location.latitude, location.longitude)

    return airQuality;
}