const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const PORT  = process.env.PORT || 3000;
const cors = require("cors");
dotenv.config();



const days = 1; 


const pollenApiKey = process.env.GOOGLE_POLLEN_API_KEY;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
    origin: "http://localhost:5500"
}));

app.get("/api/pollen", async (req, res) => {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    if(req.query.latitude == null || req.query.longitude == null || String(req.query.latitude).trim()=== "" || String(req.query.longitude).trim()=== "" || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180){
        return res.status(400).json({
            error: "Invalid coordinates"
        });
    }
    try {
        const url = new URL("https://pollen.googleapis.com/v1/forecast:lookup");
        
        url.searchParams.set("location.latitude", latitude);
        url.searchParams.set("location.longitude", longitude);
        url.searchParams.set("key", pollenApiKey);
        url.searchParams.set("days", days);
        const response = await fetch(url);
        if(!response.ok){
            const errorData = await response.json();
            console.log("Google error message: ", errorData.error?.message);

            throw new Error(`Google Pollen API returned ${response.status}`);
        }
        const data = await response.json();
        const pollenTypes = data.dailyInfo?.[0]?.pollenTypeInfo ?? [];
        const pollenResults = pollenTypes.map(pollenType => {
            return {
                code: pollenType.code,
                value: pollenType.indexInfo?.value ?? null,
                category: pollenType.indexInfo?.category ?? null
            }
            
        });
        const plants = data.dailyInfo?.[0]?.plantInfo ?? [];
        const plantResults = plants.map(plant => {
            return {
                name: plant.displayName,
                code: plant.code,
                value: plant.indexInfo?.value ?? null,
                category: plant.indexInfo?.category ?? null
            }
        });
        return res.json({
                pollenTypes: pollenResults,
                plants: plantResults
        });
    } catch(error){
        console.log("pollen request failed: ", error.message);
        res.status(500).json({
            error: "unable to retrieve pollen data"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`AeroTrace server running on port ${PORT}`);
});
