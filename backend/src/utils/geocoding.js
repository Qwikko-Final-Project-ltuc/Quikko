const axios = require("axios");
require("dotenv").config();

async function geocodeAddress(addressText) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const cleanAddress = addressText.includes("Jordan")
      ? addressText
      : addressText + ", Jordan";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      cleanAddress
    )}&key=${apiKey}`;

    const response = await axios.get(url);

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      console.error(
        `Geocoding failed for "${addressText}":`,
        response.data.status
      );
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
  }
  return null;
}

module.exports = { geocodeAddress };
