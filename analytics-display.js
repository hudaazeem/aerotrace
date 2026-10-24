const savedEntries = JSON.parse(
    localStorage.getItem('symptoms')
) || [];

const groups = groupObservations(savedEntries);
const observations = prepareObservations(groups);
const results = analyzeAllSymptoms(observations);

const container = document.getElementById('analyticsResults');

const labels = {
    pm25: 'PM2.5',
    pm10: 'PM10',
    aqi: 'Air Quality Index',
    ozone: 'Ozone',
    no2: 'Nitrogen Dioxide',
    co: 'Carbon Monoxide',
    treePollen: 'Tree Pollen',
    grassPollen: 'Grass Pollen',
    weedPollen: 'Weed Pollen'
};

if(Object.keys(results).length === 0){
    container.textContent = 'No symptoms logged yet...';
}

Object.entries(results).forEach(([symptomName, comparisons]) =>{
    const heading = document.createElement('h2');
    heading.textContent = symptomName;
    container.appendChild(heading);

    comparisons.forEach(result => {
        const card = document.createElement('div');
        card.className = 'analysis-card';

        const title = document.createElement("h3");
        title.textContent = labels[result.pollutant];
        card.appendChild(title);

        const description = document.createElement('p');

        if(result.status === 'insufficient_data'){
            description.textContent  = `Not enough data yet (${result.highCount} higher-exposure and ${result.lowCount} lower-exposure observations).`;
        }else{
            description.textContent = `${symptomName} occured in ${result.highRate.toFixed(0)}% of higher-exposure observations verses ${result.lowRate.toFixed(0)}% of lower-exposure-observations.`;
        }

        card.appendChild(description);
        container.appendChild(card);
    });

});