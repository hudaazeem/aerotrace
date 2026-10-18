function groupObservations(entries){
    const groups = {};
    
    entries.forEach(entry =>{
        const id = entry.observationId;
        if(!id){
            return;
        }
        if(!groups[id]){
            groups[id] = [];
        }
        groups[id].push(entry);
    })
    return groups;
}

function prepareObservations(groups){
    const observations = Object.values(groups);

    const newGroups=observations.map(group=>{
        const firstEntry = group[0];
        const symptomData = group.filter(entry => entry.symptom !== null).map(entry=> {
        return{
            name: entry.symptom,
            severity: entry.severity
        }
        });

        return{
            observationId: firstEntry.observationId,
            pm25: firstEntry.airQuality?.pm25 ?? null,
            pm10: firstEntry.airQuality?.pm10 ?? null,
            aqi: firstEntry.airQuality?.aqi ?? null,
            ozone: firstEntry.airQuality?.ozone ?? null,
            no2: firstEntry.airQuality?.no2 ?? null,
            co: firstEntry.airQuality?.co ?? null,
            symptoms: symptomData
        }

        
    });

    

    return newGroups;
}

function getSymptomSeverity(observation, symptomName){
    const result = observation.symptoms.find(
        symptom => symptom.name === symptomName
    );
    if(!result){
        return 0;
    }
    return result.severity;
}