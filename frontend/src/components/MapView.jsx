// components/MapView.jsx
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useEffect } from "react";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
};

export default function MapView({ routePoints, deliveryCompany }) {
  const [showInfo, setShowInfo] = useState(false);
  const [directions, setDirections] = useState(null);
  const [legsInfo, setLegsInfo] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const fullRoute = deliveryCompany
    ? [
        {
          ...deliveryCompany,
          label: deliveryCompany.label,
        },
        ...(routePoints || []),
      ]
    : routePoints || [];

  const uniqueRoute = fullRoute.filter(
    (p, i, arr) =>
      i === arr.findIndex((q) => q.lat === p.lat && q.lng === p.lng)
  );

  useEffect(() => {
    if (!isLoaded || uniqueRoute.length < 2) return;

    const origin = {
      lat: uniqueRoute[0].lat,
      lng: uniqueRoute[0].lng,
    };
    const destination = {
      lat: uniqueRoute[uniqueRoute.length - 1].lat,
      lng: uniqueRoute[uniqueRoute.length - 1].lng,
    };
    const waypoints = uniqueRoute
      .slice(1, -1)
      .map((p) => ({ location: { lat: p.lat, lng: p.lng }, stopover: true }));

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);

          const legs = result.routes[0].legs.map((leg) => ({
            start: leg.start_address,
            end: leg.end_address,
            distance: leg.distance.text,
            duration: leg.duration.text,
          }));
          setLegsInfo(legs);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [isLoaded, fullRoute]);

  if (!isLoaded) return <p>Loading map...</p>;
  if (fullRoute.length < 2) return <p>Insufficient route points</p>;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={fullRoute[0]}
        zoom={12}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
        }}
      >
        {directions && <DirectionsRenderer directions={directions} />}

        {uniqueRoute.map((p, idx) => {
          let iconUrl;

          if (idx === 0) {
            iconUrl = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // Delivery Company
          } else if (idx === uniqueRoute.length - 1) {
            iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png"; // Customer
          } else {
            iconUrl = "http://maps.google.com/mapfiles/ms/icons/green-dot.png"; // Vendors
          }

          return (
            <MarkerF
              key={idx}
              position={{ lat: p.lat, lng: p.lng }}
              label={p.label || `Point ${idx + 1}`}
              icon={iconUrl}
              onClick={() => setShowInfo(idx)}
            >
              {showInfo === idx && (
                <InfoWindowF
                  onCloseClick={() => setShowInfo(null)}
                  position={{ lat: p.lat, lng: p.lng }}
                >
                  <div style={{ fontSize: "14px" }}>{p.label}</div>
                </InfoWindowF>
              )}
            </MarkerF>
          );
        })}
      </GoogleMap>

      {legsInfo.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Route Details:</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  From
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>To</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Distance
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {legsInfo.map((leg, idx) => {
                const fromLabel = fullRoute[idx]?.label || leg.start;
                const toLabel = fullRoute[idx + 1]?.label || leg.end;

                return (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {fromLabel}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {toLabel}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {leg.distance}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {leg.duration}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div
            style={{
              marginTop: "15px",
              display: "flex",
              gap: "20px",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img
                src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                alt="Delivery"
              />
              <span>Delivery Company</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img
                src="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                alt="Vendor"
              />
              <span>Vendors</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img
                src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                alt="Customer"
              />
              <span>Customer</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
