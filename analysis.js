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
        const pollenTypes = firstEntry.pollen?.pollenTypes ?? [];

        const treePollen = pollenTypes.find(type => type.code === 'TREE')?.value ?? null;
        const grassPollen= pollenTypes.find(type => type.code ==='GRASS')?.value ?? null;
        const weedPollen= pollenTypes.find(type => type.code ==='WEED')?.value ?? null;

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
            treePollen: treePollen,
            grassPollen: grassPollen,
            weedPollen: weedPollen,
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

function countSymptomOccurrences(observations, symptomName){
    let count = 0;

    observations.forEach(observation => {
        const severity = getSymptomSeverity(observation, symptomName);
        if(severity>0){
            count++;
        }
    });

    return count;
}

function calculateOccurenceRate(observations, symptomName){
    const count = countSymptomOccurrences(observations, symptomName);
    const total = observations.length;

    if(total===0){
        return null;
    }

    const occurrence = (count/total)*100;
    return occurrence;
}

function calculateAverageSeverity(observations, symptomName){
    let totalSeverity = 0;
    observations.forEach(observation => {
        const severity = getSymptomSeverity(observation, symptomName);

        if(severity>0){
            totalSeverity+=severity;
        }
    });

    const count = countSymptomOccurrences(observations, symptomName);

    if(count ===0){
        return null;
    }

    return totalSeverity/count;
}

function filterByExposure(observations, pollutant, threshold, isHigh){
    return observations.filter(observation => {
        const value = observation[pollutant];

        if(value == null){
            return false;
        }

        if(isHigh){
            return value >= threshold;
        }else{
            return value < threshold;
        }
    });
}

function compareExposureGroups(observations, symptomName, pollutant, threshold){
    const highGroup = filterByExposure(
        observations, pollutant, threshold, true
    );

    const lowGroup = filterByExposure(
        observations, pollutant, threshold, false
    );
    
    const minimumObservations = 5; 

    if(highGroup.length < minimumObservations || lowGroup.length < minimumObservations){
        return{
            status: "insufficient_data",
            highCount: highGroup.length,
            lowCount: lowGroup.length,
            pollutant: pollutant,
            symptom: symptomName
        };
    }
    const highRate = calculateOccurenceRate(highGroup, symptomName);

    const lowRate = calculateOccurenceRate(lowGroup, symptomName);

    const highSeverity = calculateAverageSeverity(highGroup, symptomName);

    const lowSeverity = calculateAverageSeverity(lowGroup, symptomName);

    
    return {
        pollutant: pollutant,
        symptom: symptomName,
        highCount: highGroup.length,
        lowCount: lowGroup.length,
        highRate: highRate,
        lowRate: lowRate,
        highSeverity: highSeverity,
        lowSeverity: lowSeverity,
        status: "analyzed"
    }
}

function analyzeSymptom(observations, symptomName){
    const thresholds = {
        pm25: 15, 
        pm10: 30, 
        aqi: 50, 
        ozone: 60, 
        no2: 20, 
        co: 500,
        treePollen: 3,
        grassPollen: 3,
        weedPollen: 3
    }

    const pollutants = Object.keys(thresholds);

    const results = pollutants.map(pollutant => {
        const threshold = thresholds[pollutant];

        return compareExposureGroups(observations, symptomName, pollutant, threshold);
    });

    return results;
}

function analyzeAllSymptoms(observations){
    const symptomNames = new Set();

    observations.forEach(observation => {
        observation.symptoms.forEach(symptom => {
            symptomNames.add(symptom.name);
        });
    });

    const results = {};

    symptomNames.forEach(symptomName => {
        results[symptomName] = analyzeSymptom(
            observations,
            symptomName
        );
    });
    return results;
}