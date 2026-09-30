/**
 * calculation.js — Risk Scoring Engine
 * 
 * Implements the simplified impact risk formula:
 * 
 *   impactScore = DistanceFactor × ElevationAdjustment × WindSpeedFactor
 * 
 * Where:
 *   - DistanceFactor: Inverse relationship to storm proximity (closer = higher risk)
 *   - ElevationAdjustment: Lower elevation = higher flood/storm surge risk
 *   - WindSpeedFactor: Higher wind speeds = greater structural damage risk
 * 
 * All factors are normalized to 0-100 scale for consistent scoring.
 * 
 * PRODUCTION NOTES:
 * - Replace simplified distance with actual Haversine distance to storm eye
 * - Integrate SLOSH model for storm surge elevation adjustment
 * - Add building type vulnerability curves for infrastructure-specific scoring
 */

// ============================================================
// CONFIGURATION
// ============================================================

const RISK_CONFIG = {
    // Distance scoring
    maxDistanceKm: 500,        // Maximum distance for risk consideration
    distanceDecayRate: 0.003,  // Exponential decay rate for distance factor

    // Elevation scoring
    maxElevationM: 100,        // Elevation above which risk is minimal
    elevationWeight: 0.3,      // Weight of elevation in overall score

    // Wind speed scoring
    maxWindSpeedMph: 200,      // Maximum wind speed for normalization
    windSpeedWeight: 0.5,      // Weight of wind speed in overall score

    // Risk thresholds
    thresholds: {
        critical: 80,
        high: 60,
        medium: 40,
        low: 0
    },

    // Infrastructure type vulnerability multipliers
    typeVulnerability: {
        hospital: 1.3,
        power: 1.2,
        water: 1.15,
        school: 1.1,
        shelter: 0.9,
        port: 1.0,
        airport: 0.85,
        emergency: 1.25,
        industrial: 1.1,
        coastal: 1.35
    }
};

// ============================================================
// CORE CALCULATION FUNCTIONS
// ============================================================

/**
 * Calculate Haversine distance between two geographic points
 * @param {number} lat1 - Point 1 latitude
 * @param {number} lon1 - Point 1 longitude
 * @param {number} lat2 - Point 2 latitude
 * @param {number} lon2 - Point 2 longitude
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance factor (0-100)
 * Closer to storm = higher risk
 * Uses exponential decay: score = 100 * e^(-decay * distance)
 * 
 * @param {number} distanceKm - Distance from storm track in km
 * @returns {number} Distance factor (0-100)
 */
function calculateDistanceFactor(distanceKm) {
    if (distanceKm <= 0) return 100;
    if (distanceKm >= RISK_CONFIG.maxDistanceKm) return 0;

    const factor = 100 * Math.exp(-RISK_CONFIG.distanceDecayRate * distanceKm);
    return Math.round(factor * 100) / 100;
}

/**
 * Calculate elevation adjustment factor (0-100)
 * Lower elevation = higher flood/storm surge risk
 * 
 * @param {number} elevationM - Elevation in meters
 * @returns {number} Elevation factor (0-100)
 */
function calculateElevationFactor(elevationM) {
    if (elevationM <= 0) return 100;
    if (elevationM >= RISK_CONFIG.maxElevationM) return 0;

    // Linear decrease: lower elevation = higher risk
    const factor = 100 * (1 - elevationM / RISK_CONFIG.maxElevationM);
    return Math.round(factor * 100) / 100;
}

/**
 * Calculate wind speed factor (0-100)
 * Higher wind = greater structural damage potential
 * 
 * @param {number} windSpeedMph - Wind speed in mph
 * @returns {number} Wind speed factor (0-100)
 */
function calculateWindSpeedFactor(windSpeedMph) {
    if (windSpeedMph <= 0) return 0;
    if (windSpeedMph >= RISK_CONFIG.maxWindSpeedMph) return 100;

    // Sigmoid-like curve for more realistic wind damage potential
    const normalized = windSpeedMph / RISK_CONFIG.maxWindSpeedMph;
    const factor = 100 * (normalized ** 1.5); // Power curve emphasizes high winds
    return Math.round(factor * 100) / 100;
}

/**
 * Find the closest point on the storm track to a given location
 * @param {number} lat - Infrastructure latitude
 * @param {number} lon - Infrastructure longitude
 * @param {Array} track - Storm track array [[lat, lon, wind, pressure, time], ...]
 * @returns {Object} { closestPoint, distanceKm, windSpeedAtClosest }
 */
function findClosestTrackPoint(lat, lon, track) {
    let minDistance = Infinity;
    let closestPoint = null;
    let windSpeedAtClosest = 0;

    for (const point of track) {
        const [pLat, pLon, windSpeed] = point;
        const dist = haversineDistance(lat, lon, pLat, pLon);

        if (dist < minDistance) {
            minDistance = dist;
            closestPoint = { lat: pLat, lon: pLon };
            windSpeedAtClosest = windSpeed;
        }
    }

    return {
        closestPoint,
        distanceKm: Math.round(minDistance * 100) / 100,
        windSpeedAtClosest
    };
}

/**
 * Calculate comprehensive risk score for an infrastructure point
 * 
 * FORMULA: impactScore = DistanceFactor × ElevationAdjustment × WindSpeedFactor
 * 
 * With type vulnerability multiplier applied at the end.
 * 
 * @param {Object} infraPoint - Infrastructure data point
 * @param {Array} stormTrack - Storm track data
 * @returns {Object} Risk assessment result
 */
function calculateRiskScore(infraPoint, stormTrack) {
    // Step 1: Find closest approach of storm
    const { distanceKm, windSpeedAtClosest } = findClosestTrackPoint(
        infraPoint.lat, infraPoint.lon, stormTrack
    );

    // Step 2: Calculate individual factors
    const distanceFactor = calculateDistanceFactor(distanceKm);
    const elevationFactor = calculateElevationFactor(infraPoint.elevation || 2);
    const windFactor = calculateWindSpeedFactor(windSpeedAtClosest);

    // Step 3: Apply weighted formula
    // impactScore = (DistanceFactor * 0.4) + (ElevationFactor * 0.3) + (WindFactor * 0.5)
    // Note: Weights sum to 1.2 to allow scores above 100 before clamping
    const rawScore = (
        distanceFactor * 0.4 +
        elevationFactor * RISK_CONFIG.elevationWeight +
        windFactor * RISK_CONFIG.windSpeedWeight
    );

    // Step 4: Apply infrastructure type vulnerability multiplier
    const vulnMultiplier = RISK_CONFIG.typeVulnerability[infraPoint.type] || 1.0;
    const adjustedScore = rawScore * vulnMultiplier;

    // Step 5: Clamp to 0-100
    const finalScore = Math.min(100, Math.max(0, Math.round(adjustedScore)));

    // Step 6: Determine risk level
    const riskLevel = getRiskLevel(finalScore);

    return {
        infraId: infraPoint.id,
        infraName: infraPoint.name,
        infraType: infraPoint.type,
        coordinates: { lat: infraPoint.lat, lon: infraPoint.lon },
        score: finalScore,
        riskLevel: riskLevel,
        factors: {
            distance: {
                km: distanceKm,
                factor: distanceFactor
            },
            elevation: {
                meters: infraPoint.elevation || 2,
                factor: elevationFactor
            },
            wind: {
                speedMph: windSpeedAtClosest,
                factor: windFactor
            }
        },
        vulnerabilityMultiplier: vulnMultiplier,
        timestamp: new Date().toISOString()
    };
}

/**
 * Determine risk level category from score
 * @param {number} score - Risk score (0-100)
 * @returns {string} Risk level: 'critical' | 'high' | 'medium' | 'low'
 */
function getRiskLevel(score) {
    const { thresholds } = RISK_CONFIG;
    if (score >= thresholds.critical) return 'critical';
    if (score >= thresholds.high) return 'high';
    if (score >= thresholds.medium) return 'medium';
    return 'low';
}

/**
 * Calculate risk scores for all infrastructure points
 * Supports multiple storm tracks — takes the maximum risk score across all storms
 * @param {Array} infrastructure - Array of infrastructure points
 * @param {Array} stormTracks - Single track array OR array of track arrays
 * @returns {Array} Risk assessments sorted by score (descending)
 */
function calculateAllRiskScores(infrastructure, stormTracks) {
    console.log(`[Risk Engine] Calculating scores for ${infrastructure.length} infrastructure points...`);

    // Normalize to array of arrays
    const tracksArray = Array.isArray(stormTracks[0][0]) ? stormTracks : [stormTracks];
    console.log(`[Risk Engine] Processing ${tracksArray.length} storm track(s)...`);

    const results = infrastructure.map(point => {
        // Calculate risk for each storm track and take the maximum
        let maxResult = null;
        let maxScore = -1;

        for (const track of tracksArray) {
            const result = calculateRiskScore(point, track);
            if (result.score > maxScore) {
                maxScore = result.score;
                maxResult = result;
            }
        }

        return maxResult;
    });

    // Sort by risk score descending
    results.sort((a, b) => b.score - a.score);

    console.log(`[Risk Engine] Scores calculated. Highest: ${results[0].score}, Lowest: ${results[results.length - 1].score}`);
    return results;
}

/**
 * Generate risk heatmap data for Leaflet visualization
 * Creates a grid of risk values around the storm track
 * @param {Array} stormTrack - Storm track data
 * @param {number} gridSize - Number of grid cells (default: 50)
 * @returns {Array} Heatmap points [lat, lon, intensity]
 */
function generateHeatmapData(stormTrack, gridSize = 50) {
    const heatmapPoints = [];

    // Find bounding box of track
    const lats = stormTrack.map(p => p[0]);
    const lons = stormTrack.map(p => p[1]);
    const minLat = Math.min(...lats) - 2;
    const maxLat = Math.max(...lats) + 2;
    const minLon = Math.min(...lons) - 2;
    const maxLon = Math.max(...lons) + 2;

    // Generate grid
    const latStep = (maxLat - minLat) / gridSize;
    const lonStep = (maxLon - minLon) / gridSize;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const lat = minLat + i * latStep;
            const lon = minLon + j * lonStep;

            // Find closest track point
            let minDist = Infinity;
            let maxWind = 0;

            for (const point of stormTrack) {
                const dist = haversineDistance(lat, lon, point[0], point[1]);
                if (dist < minDist) {
                    minDist = dist;
                    maxWind = point[2];
                }
            }

            // Calculate intensity
            const distFactor = calculateDistanceFactor(minDist);
            const windFactor = calculateWindSpeedFactor(maxWind);
            const intensity = (distFactor * 0.5 + windFactor * 0.5) / 100;

            if (intensity > 0.05) { // Only include meaningful values
                heatmapPoints.push([lat, lon, intensity]);
            }
        }
    }

    console.log(`[Heatmap] Generated ${heatmapPoints.length} heatmap points`);
    return heatmapPoints;
}

/**
 * Get risk statistics summary
 * @param {Array} riskResults - Array of risk assessment results
 * @returns {Object} Summary statistics
 */
function getRiskSummary(riskResults) {
    const summary = {
        total: riskResults.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        averageScore: 0,
        maxScore: 0,
        minScore: 100
    };

    let totalScore = 0;

    for (const result of riskResults) {
        summary[result.riskLevel]++;
        totalScore += result.score;
        summary.maxScore = Math.max(summary.maxScore, result.score);
        summary.minScore = Math.min(summary.minScore, result.score);
    }

    summary.averageScore = Math.round((totalScore / riskResults.length) * 10) / 10;
    return summary;
}
