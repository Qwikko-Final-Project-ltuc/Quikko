function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// حساب المسافة الإجمالية لمسار من مجموعة نقاط [ {lat, lng}, ... ]
function calculateTotalRouteDistance(points) {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const d = calculateDistanceKm(
      points[i].lat,
      points[i].lng,
      points[i + 1].lat,
      points[i + 1].lng
    );
    if (d !== null) total += d;
  }
  return parseFloat(total.toFixed(2));
}

function orderVendorsByNearest(startPoint, vendors) {
  const remaining = [...vendors];
  const ordered = [];
  let current = { lat: startPoint.lat, lng: startPoint.lng };

  while (remaining.length > 0) {
    let closestIndex = 0;
    let minDist = calculateDistanceKm(
      current.lat,
      current.lng,
      remaining[0].latitude,
      remaining[0].longitude
    );

    for (let i = 1; i < remaining.length; i++) {
      const dist = calculateDistanceKm(
        current.lat,
        current.lng,
        remaining[i].latitude,
        remaining[i].longitude
      );
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }

    current = remaining.splice(closestIndex, 1)[0];
    ordered.push(current);
  }

  return ordered;
}

function calculateTotalVendorsDistance(vendors) {
  if (!vendors || vendors.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < vendors.length - 1; i++) {
    const v1 = vendors[i];
    const v2 = vendors[i + 1];
    const dist = calculateDistanceKm(
      v1.latitude,
      v1.longitude,
      v2.latitude,
      v2.longitude
    );
    if (dist !== null) total += dist;
  }

  return parseFloat(total.toFixed(2));
}


module.exports = { calculateDistanceKm, calculateTotalRouteDistance, orderVendorsByNearest , calculateTotalVendorsDistance };
