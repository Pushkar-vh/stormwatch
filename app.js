/**
 * app.js — StormWatch Tactical Command HUD Controller
 * 
 * Manages the Leaflet map, tactical panels, storm data, and HUD interactions.
 * Redesigned for the military tactical command interface.
 */

// ============================================================
// GLOBAL STATE
// ============================================================

let map;
let selectedStormIds = ['katrina'];
let currentData = null;
let riskResults = null;
let advisoryQueue = [];

let trackLayer = null;
let heatmapLayer = null;
let infraLayer = null;
let animationMarker = null;

let isAnimating = false;
let animationIndex = 0;
let animationInterval = null;
let simulationMarker = null;
let simulationTrail = null;
let simulationSpeed = 1;
let simulationPlaying = false;

let gridLocked = false;
let currentViewMode = 'recon';

const STORM_COLORS = [
    '#f97316', '#3b82f6', '#22c55e', '#eab308',
    '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#14b8a6',
];

const STORM_SHORT_NAMES = {
    katrina: 'KATRINA', harvey: 'HARVEY', maria: 'MARIA', ian: 'IAN',
    sandy: 'SANDY', irma: 'IRMA', michael: 'MICHAEL', laura: 'LAURA', ida: 'IDA'
};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[StormWatch] Tactical HUD Initializing...');
    initMap();
    loadStorms(selectedStormIds);
    startCycleTimer();
});

// ============================================================
// MAP INIT
// ============================================================

function initMap() {
    map = L.map('map', {
        center: [28.0, -85.0],
        zoom: 5,
        zoomControl: false,
        attributionControl: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 18
    }).addTo(map);

    console.log('[Map] Tactical map initialized');
}

// ============================================================
// STORM LOADING
// ============================================================

async function loadStorms(stormIds) {
    if (stormIds.length === 0) return;

    console.log('[StormWatch] Loading target data:', stormIds);
    showLoading(true);

    try {
        currentData = await fetchAllStormData(stormIds);
        riskResults = calculateAllRiskScores(
            currentData.infrastructure,
            currentData.tracks.map(t => t.track)
        );
        advisoryQueue = generateAdvisoryQueue(riskResults, currentData.tracks, 40);

        updateTacticalHUD(currentData.tracks);
        updateBottomStrip(currentData.tracks);

        clearMapLayers();
        drawAllStormTracks(currentData.tracks);
        drawHeatmap(currentData.tracks.map(t => t.track));
        drawInfrastructure(riskResults);
        fitMapToTracks(currentData.tracks);

        console.log('[StormWatch] Target acquired:', currentData.tracks.map(t => t.name).join(', '));

    } catch (error) {
        console.error('[StormWatch] Target acquisition failed:', error);
    } finally {
        showLoading(false);
    }
}

// ============================================================
// TACTICAL HUD UPDATES
// ============================================================

function updateTacticalHUD(tracks) {
    if (!tracks || tracks.length === 0) return;

    const nameEl = document.getElementById('hudStormName');
    const catEl = document.getElementById('hudThreatCat');
    const navNameEl = document.getElementById('navStormName');
    const serialEl = document.getElementById('panelSerial');

    if (tracks.length === 1) {
        const storm = tracks[0];
        const shortName = STORM_SHORT_NAMES[selectedStormIds[0]] || storm.name.toUpperCase();
        nameEl.textContent = storm.name.toUpperCase();
        catEl.textContent = `CAT ${storm.category} ${getThreatLabel(storm.category)}`;
        if (navNameEl) navNameEl.textContent = shortName;
        if (serialEl) serialEl.textContent = `ID: STM-05${shortName.charAt(0)}-NOR`;
    } else {
        const maxCat = Math.max(...tracks.map(t => t.category));
        nameEl.textContent = `${tracks.length} TARGETS`;
        catEl.textContent = `MAX CAT ${maxCat} ${getThreatLabel(maxCat)}`;
        if (navNameEl) navNameEl.textContent = `${tracks.length} TARGETS`;
        if (serialEl) serialEl.textContent = `ID: MULTI-TGT`;
    }

    const maxWind = Math.max(...tracks.map(t => t.maxWindSpeed));
    const minPres = Math.min(...tracks.map(t => t.minPressure));

    document.getElementById('metricWind').innerHTML = `${maxWind}<span class="metric-unit">MPH</span>`;
    document.getElementById('metricPressure').innerHTML = `${minPres}<span class="metric-unit">hPa</span>`;
    document.getElementById('metricSpeed').innerHTML = `${Math.round(maxWind * 0.086)}<span class="metric-unit">KTS</span>`;
    document.getElementById('metricDirection').textContent = getDirectionFromTrack(tracks[0].track);
}

function updateBottomStrip(tracks) {
    if (!tracks || tracks.length === 0) return;

    const maxWind = Math.max(...tracks.map(t => t.maxWindSpeed));
    const minPres = Math.min(...tracks.map(t => t.minPressure));

    document.getElementById('hudWindVal').innerHTML = `${maxWind} <span class="strip-unit">MPH</span>`;
    document.getElementById('hudPressVal').innerHTML = `${minPres} <span class="strip-unit">HPA</span>`;
    document.getElementById('hudRainVal').innerHTML = `${Math.round(maxWind * 2.4)} <span class="strip-unit">MM/24H</span>`;
    document.getElementById('hudPopVal').textContent = `${(tracks.length * 0.47).toFixed(2)}M`;
    document.getElementById('hudEvacVal').innerHTML = `${Math.min(95, Math.round(maxWind * 0.5))}.4 <span class="strip-unit">%</span>`;
}

function getThreatLabel(category) {
    if (category >= 5) return 'CRITICAL';
    if (category >= 4) return 'SEVERE';
    if (category >= 3) return 'HIGH';
    if (category >= 2) return 'ELEVATED';
    return 'MODERATE';
}

function getDirectionFromTrack(track) {
    if (track.length < 2) return '—';
    const last = track[track.length - 1];
    const prev = track[track.length - 2];
    const dLat = last[0] - prev[0];
    const dLon = last[1] - prev[1];
    const angle = Math.atan2(dLon, dLat) * (180 / Math.PI);
    const directions = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
    const deg = Math.round((angle + 360) % 360);
    const dir = directions[Math.round(deg / 45) % 8];
    return `${String(deg).padStart(3, '0')}° ${dir}`;
}

// ============================================================
// MAP LAYER FUNCTIONS
// ============================================================

function clearMapLayers() {
    if (trackLayer) { map.removeLayer(trackLayer); trackLayer = null; }
    if (heatmapLayer) { map.removeLayer(heatmapLayer); heatmapLayer = null; }
    if (infraLayer) { map.removeLayer(infraLayer); infraLayer = null; }
    if (animationMarker) { map.removeLayer(animationMarker); animationMarker = null; }
    stopAnimation();
}

function drawAllStormTracks(tracks) {
    trackLayer = L.layerGroup();

    tracks.forEach((stormData, stormIndex) => {
        const color = STORM_COLORS[stormIndex % STORM_COLORS.length];
        const track = stormData.track;
        const trackCoords = track.map(p => [p[0], p[1]]);

        // Past track (dimmed)
        const pastCoords = trackCoords.slice(0, Math.floor(trackCoords.length / 2));
        if (pastCoords.length > 1) {
            trackLayer.addLayer(L.polyline(pastCoords, {
                color: color, weight: 2, opacity: 0.4, dashArray: '4, 8'
            }));
        }

        // Predicted track (dashed)
        const futureCoords = trackCoords.slice(Math.floor(trackCoords.length / 2));
        if (futureCoords.length > 1) {
            trackLayer.addLayer(L.polyline(futureCoords, {
                color: color, weight: 2, opacity: 0.6, dashArray: '8, 6'
            }));
        }

        // Track points
        track.forEach((point, idx) => {
            const [lat, lon, windSpeed] = point;
            const isCurrent = idx === Math.floor(track.length / 2);
            const circle = L.circleMarker([lat, lon], {
                radius: isCurrent ? 8 : 4 + (windSpeed / 40),
                fillColor: isCurrent ? '#fff' : color,
                color: color,
                weight: isCurrent ? 3 : 1,
                opacity: 0.9,
                fillOpacity: isCurrent ? 1 : 0.7
            });
            circle.bindPopup(`
                <div style="font-family:Orbitron;font-weight:700;color:${color};margin-bottom:4px">${stormData.name}</div>
                <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#52637a">Time:</span> ${formatDate(point[4])}</div>
                <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#52637a">Wind:</span> ${windSpeed} mph</div>
                <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#52637a">Pressure:</span> ${point[3]} hPa</div>
            `);
            trackLayer.addLayer(circle);
        });

        // Current location marker
        const currentIdx = Math.floor(track.length / 2);
        const [cLat, cLon, cWind] = track[currentIdx];
        const marker = L.circleMarker([cLat, cLon], {
            radius: 12, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9
        });
        marker.bindPopup(`<b>${stormData.name}</b><br>Current Location<br>Wind: ${cWind} mph`);
        trackLayer.addLayer(marker);
    });

    trackLayer.addTo(map);
}

function drawHeatmap(allTracks) {
    const combinedTrack = allTracks.flat();
    const heatmapData = generateHeatmapData(combinedTrack, 35);
    heatmapLayer = L.layerGroup();

    heatmapData.forEach(([lat, lon, intensity]) => {
        const color = getHeatmapColor(intensity);
        heatmapLayer.addLayer(L.circle([lat, lon], {
            radius: 8000 + intensity * 20000,
            fillColor: color, fillOpacity: intensity * 0.3, stroke: false
        }));
    });

    heatmapLayer.addTo(map);
}

function drawInfrastructure(riskResults) {
    infraLayer = L.layerGroup();

    riskResults.forEach(result => {
        const { coordinates, score, riskLevel, infraType } = result;
        const color = getRiskColor(score);
        const marker = L.circleMarker([coordinates.lat, coordinates.lon], {
            radius: 6 + (score / 15),
            fillColor: color, color: '#fff', weight: 1.5, opacity: 0.9, fillOpacity: 0.8
        });
        marker.bindPopup(`
            <div style="font-family:Orbitron;font-weight:700;margin-bottom:4px">${getInfraIcon(infraType)} ${result.infraName}</div>
            <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#52637a">Risk:</span> <strong style="color:${color}">${score}/100</strong></div>
            <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#52637a">Dist:</span> ${result.factors.distance.km} km</div>
        `);
        infraLayer.addLayer(marker);
    });

    infraLayer.addTo(map);
}

function fitMapToTracks(tracks) {
    const allCoords = tracks.flatMap(t => t.track.map(p => [p[0], p[1]]));
    map.fitBounds(L.latLngBounds(allCoords), { padding: [80, 80] });
}

// ============================================================
// TACTICAL UI FUNCTIONS
// ============================================================

function toggleTacticalLayer(layerName) {
    const toggle = document.getElementById(`lyr-${layerName}`);
    if (toggle) toggle.classList.toggle('active');

    switch (layerName) {
        case 'track':
            if (trackLayer) {
                if (map.hasLayer(trackLayer)) map.removeLayer(trackLayer);
                else trackLayer.addTo(map);
            }
            break;
        case 'zones':
        case 'heatmap':
            if (heatmapLayer) {
                if (map.hasLayer(heatmapLayer)) map.removeLayer(heatmapLayer);
                else heatmapLayer.addTo(map);
            }
            break;
        case 'infra':
            if (infraLayer) {
                if (map.hasLayer(infraLayer)) map.removeLayer(infraLayer);
                else infraLayer.addTo(map);
            }
            break;
    }
}

function switchStormTarget() {
    const catalog = getStormCatalog();
    const currentIdx = catalog.findIndex(s => s.id === selectedStormIds[0]);
    const nextIdx = (currentIdx + 1) % catalog.length;
    selectedStormIds = [catalog[nextIdx].id];

    // Visual feedback - flash the button
    const btn = document.querySelector('.hud-btn.active');
    if (btn) {
        btn.style.background = '#0f2723';
        btn.style.borderColor = '#00ff9d';
        setTimeout(() => {
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 300);
    }

    // Update button label immediately
    const shortName = STORM_SHORT_NAMES[selectedStormIds[0]] || catalog[nextIdx].name.toUpperCase();
    const labelEl = document.getElementById('navStormName');
    if (labelEl) labelEl.textContent = shortName;

    loadStorms(selectedStormIds);
}

// ============================================================
// STORM SEARCH
// ============================================================

function toggleSearchPanel() {
    const panel = document.getElementById('searchPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            const input = document.getElementById('stormSearchInput');
            if (input) input.focus();
        }
    }
}

function handleSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    const results = searchStorms(query);
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="color:var(--text-muted);font-size:0.7rem;padding:8px;">No storms found.</div>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(storm => `
        <div onclick="selectStorm('${storm.id}')" 
             style="padding:6px 8px;margin-bottom:4px;background:var(--bg-panel-dark);border:1px solid var(--gunmetal-border);cursor:pointer;transition:all 0.15s ease;"
             onmouseover="this.style.borderColor='var(--tactical-green)'" 
             onmouseout="this.style.borderColor='var(--gunmetal-border)'">
            <div style="font-family:var(--font-hud);font-size:0.65rem;font-weight:700;color:var(--text-highlight);">${storm.name}</div>
            <div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px;">${storm.year} | CAT ${storm.category} | ${storm.region}</div>
        </div>
    `).join('');
}

function selectStorm(stormId) {
    selectedStormIds = [stormId];
    loadStorms(selectedStormIds);
    toggleSearchPanel();
}

function cycleReconSweep() {
    if (!currentData) return;
    const center = currentData.tracks[0].track[Math.floor(currentData.tracks[0].track.length / 2)];
    map.panTo([center[0], center[1]], { animate: true, duration: 1 });
}

function triggerAlertBroadcast() {
    alert('EVACUATION BROADCAST INITIATED\n\nAll sectors advised to execute immediate evacuation protocols.');
}

function triggerZoomIn() {
    map.zoomIn();
    updateZoomDisplay();
}

function triggerZoomOut() {
    map.zoomOut();
    updateZoomDisplay();
}

function updateZoomDisplay() {
    const zoom = map.getZoom();
    const mag = (zoom / 5).toFixed(1);
    const el = document.getElementById('hudMagVal');
    if (el) el.textContent = `${mag}X`;
}

function focusLocation(locName) {
    if (!currentData) return;
    const loc = currentData.infrastructure.find(i => i.name.toUpperCase().includes(locName.toUpperCase()));
    if (loc) {
        map.flyTo([loc.lat, loc.lon], 12, { duration: 1.5 });
        document.getElementById('hudCoords').textContent = `LOC: ${loc.lat.toFixed(2)}°N // ${Math.abs(loc.lon).toFixed(2)}°W`;
        document.getElementById('hudSector').textContent = `SECTOR: ${locName.toUpperCase()}`;
    }
}

function resetTacticalView() {
    if (currentData) fitMapToTracks(currentData.tracks);
}

function setMapViewMode(mode) {
    currentViewMode = mode;
    document.querySelectorAll('.hud-icon-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btnMode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    if (btn) btn.classList.add('active');
}

function toggleGridLock() {
    gridLocked = !gridLocked;
    document.querySelector('.hud-grid-overlay').style.display = gridLocked ? 'none' : 'block';
}

// ============================================================
// ANIMATION
// ============================================================

function toggleAnimation() {
    if (isAnimating) stopAnimation();
    else startAnimation();
}

function startAnimation() {
    if (!currentData || currentData.tracks.length === 0) return;
    isAnimating = true;
    animationIndex = 0;
    const track = currentData.tracks[0].track;
    const color = STORM_COLORS[0];

    animationInterval = setInterval(() => {
        if (animationIndex >= track.length) { stopAnimation(); return; }
        const [lat, lon, windSpeed] = track[animationIndex];
        if (animationMarker) map.removeLayer(animationMarker);
        animationMarker = L.circleMarker([lat, lon], {
            radius: 14, fillColor: color, color: '#fff', weight: 3, opacity: 1, fillOpacity: 0.9
        }).addTo(map);
        animationMarker.bindPopup(`<b>${currentData.tracks[0].name}</b><br>Wind: ${windSpeed} mph`).openPopup();
        map.panTo([lat, lon], { animate: true, duration: 0.5 });
        animationIndex++;
    }, 700);
}

function stopAnimation() {
    isAnimating = false;
    if (animationInterval) { clearInterval(animationInterval); animationInterval = null; }
    if (animationMarker) { map.removeLayer(animationMarker); animationMarker = null; }
}

// ============================================================
// STORM SIMULATION (Track Playback)
// ============================================================

function toggleSimulation() {
    if (simulationPlaying) {
        pauseSimulation();
    } else {
        startSimulation();
    }
}

function startSimulation() {
    if (!currentData || currentData.tracks.length === 0) return;
    
    // Clear any existing simulation layers
    clearSimulation();
    
    simulationPlaying = true;
    animationIndex = 0;
    
    const track = currentData.tracks[0].track;
    const color = STORM_COLORS[0];
    const stormName = currentData.tracks[0].name;
    
    // Create pulsing marker at start position
    const [startLat, startLon, startWind] = track[0];
    simulationMarker = L.circleMarker([startLat, startLon], {
        radius: 16,
        fillColor: color,
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
    }).addTo(map);
    simulationMarker.bindPopup(`<b>${stormName}</b><br>Wind: ${startWind} mph<br>Status: <span style="color:#00ff9d">SIMULATION ACTIVE</span>`).openPopup();
    
    // Create trail polyline (initially empty)
    simulationTrail = L.polyline([], {
        color: color,
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 6'
    }).addTo(map);
    
    // Add simulation control panel
    addSimulationPanel();
    
    // Start animation loop
    const baseInterval = 800;
    animationInterval = setInterval(() => {
        if (animationIndex >= track.length) {
            completeSimulation();
            return;
        }
        
        const [lat, lon, windSpeed, pressure, timestamp] = track[animationIndex];
        
        // Update marker position
        simulationMarker.setLatLng([lat, lon]);
        simulationMarker.setRadius(12 + (windSpeed / 20));
        simulationMarker.bindPopup(`
            <div style="font-family:Orbitron;font-weight:700;color:${color};margin-bottom:4px">${stormName}</div>
            <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#52637a">Time:</span> ${formatDate(timestamp)}</div>
            <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#52637a">Wind:</span> ${windSpeed} mph</div>
            <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#52637a">Pressure:</span> ${pressure} hPa</div>
            <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#52637a">Progress:</span> ${animationIndex + 1}/${track.length}</div>
        `).openPopup();
        
        // Update trail
        const currentTrail = simulationTrail.getLatLngs();
        currentTrail.push([lat, lon]);
        simulationTrail.setLatLngs(currentTrail);
        
        // Pan map to follow
        map.panTo([lat, lon], { animate: true, duration: 0.6 });
        
        // Update simulation panel
        updateSimulationPanel(windSpeed, pressure, animationIndex + 1, track.length);
        
        animationIndex++;
    }, baseInterval / simulationSpeed);
    
    // Update button state
    const btn = document.getElementById('btnSimulate');
    if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '<span>PAUSE</span>';
    }
    
    console.log('[StormWatch] Simulation started:', stormName);
}

function pauseSimulation() {
    simulationPlaying = false;
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    const btn = document.getElementById('btnSimulate');
    if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '<span>SIM</span>';
    }
    
    // Update panel status
    const statusEl = document.getElementById('simStatus');
    if (statusEl) statusEl.textContent = 'PAUSED';
    
    console.log('[StormWatch] Simulation paused');
}

function resumeSimulation() {
    if (!currentData || currentData.tracks.length === 0) return;
    simulationPlaying = true;
    
    const track = currentData.tracks[0].track;
    const color = STORM_COLORS[0];
    const stormName = currentData.tracks[0].name;
    
    const baseInterval = 800;
    animationInterval = setInterval(() => {
        if (animationIndex >= track.length) {
            completeSimulation();
            return;
        }
        
        const [lat, lon, windSpeed, pressure, timestamp] = track[animationIndex];
        
        simulationMarker.setLatLng([lat, lon]);
        simulationMarker.setRadius(12 + (windSpeed / 20));
        
        const currentTrail = simulationTrail.getLatLngs();
        currentTrail.push([lat, lon]);
        simulationTrail.setLatLngs(currentTrail);
        
        map.panTo([lat, lon], { animate: true, duration: 0.6 });
        updateSimulationPanel(windSpeed, pressure, animationIndex + 1, track.length);
        
        animationIndex++;
    }, baseInterval / simulationSpeed);
    
    const btn = document.getElementById('btnSimulate');
    if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '<span>PAUSE</span>';
    }
    
    const statusEl = document.getElementById('simStatus');
    if (statusEl) statusEl.textContent = 'RUNNING';
}

function completeSimulation() {
    pauseSimulation();
    
    const statusEl = document.getElementById('simStatus');
    if (statusEl) statusEl.textContent = 'COMPLETE';
    
    // Flash the marker
    if (simulationMarker) {
        simulationMarker.setStyle({ fillColor: '#00ff9d', color: '#fff' });
    }
    
    console.log('[StormWatch] Simulation complete');
}

function clearSimulation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    if (simulationMarker) {
        map.removeLayer(simulationMarker);
        simulationMarker = null;
    }
    if (simulationTrail) {
        map.removeLayer(simulationTrail);
        simulationTrail = null;
    }
    const panel = document.getElementById('simControlPanel');
    if (panel) panel.remove();
    simulationPlaying = false;
}

function addSimulationPanel() {
    // Remove existing panel if any
    const existing = document.getElementById('simControlPanel');
    if (existing) existing.remove();
    
    const panel = document.createElement('div');
    panel.id = 'simControlPanel';
    panel.style.cssText = `
        position: absolute;
        bottom: 90px;
        left: 20px;
        background: var(--bg-panel);
        border: 2px solid var(--gunmetal-border);
        box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.95);
        padding: 12px;
        z-index: 500;
        min-width: 220px;
        font-family: var(--font-mono);
    `;
    
    panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--gunmetal-border);">
            <span style="font-family:var(--font-hud);font-size:0.65rem;font-weight:800;color:var(--tactical-green);letter-spacing:1px;">STORM SIMULATION</span>
            <span id="simStatus" style="font-size:0.6rem;color:var(--tactical-cyan);font-weight:700;">RUNNING</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.68rem;margin-bottom:4px;">
            <span style="color:var(--text-muted);">WIND SPEED</span>
            <span id="simWind" style="color:var(--text-highlight);font-weight:700;">---</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.68rem;margin-bottom:4px;">
            <span style="color:var(--text-muted);">PRESSURE</span>
            <span id="simPressure" style="color:var(--text-highlight);font-weight:700;">---</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.68rem;margin-bottom:8px;">
            <span style="color:var(--text-muted);">PROGRESS</span>
            <span id="simProgress" style="color:var(--tactical-green);font-weight:700;">0/0</span>
        </div>
        <div style="display:flex;gap:4px;">
            <button onclick="simulationSpeed = Math.max(0.5, simulationSpeed - 0.5)" style="flex:1;background:var(--bg-panel-dark);border:1px solid var(--gunmetal-border);color:var(--text-secondary);font-size:0.6rem;padding:4px;cursor:pointer;">SLOW</button>
            <button onclick="simulationSpeed = 1" style="flex:1;background:var(--bg-panel-dark);border:1px solid var(--gunmetal-border);color:var(--text-secondary);font-size:0.6rem;padding:4px;cursor:pointer;">1X</button>
            <button onclick="simulationSpeed = Math.min(4, simulationSpeed + 0.5)" style="flex:1;background:var(--bg-panel-dark);border:1px solid var(--gunmetal-border);color:var(--text-secondary);font-size:0.6rem;padding:4px;cursor:pointer;">FAST</button>
            <button onclick="clearSimulation();document.getElementById('btnSimulate').classList.remove('active');document.getElementById('btnSimulate').innerHTML='<span>SIM</span>';" style="flex:1;background:#1c150b;border:1px solid var(--warning-amber);color:var(--warning-amber);font-size:0.6rem;padding:4px;cursor:pointer;">STOP</button>
        </div>
    `;
    
    document.querySelector('.map-area').appendChild(panel);
}

function updateSimulationPanel(windSpeed, pressure, current, total) {
    const windEl = document.getElementById('simWind');
    const pressureEl = document.getElementById('simPressure');
    const progressEl = document.getElementById('simProgress');
    
    if (windEl) windEl.textContent = windSpeed + ' mph';
    if (pressureEl) pressureEl.textContent = pressure + ' hPa';
    if (progressEl) progressEl.textContent = current + '/' + total;
}

// ============================================================
// AI DIRECTIVE PANEL
// ============================================================

function toggleNeuralDirectivePanel() {
    const panel = document.getElementById('aiDirectiveTerminal');
    if (panel) {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) generateDirectives();
    }
}

function generateDirectives() {
    if (!currentData || !riskResults) return;

    const storm = currentData.tracks[0];
    const highRisk = riskResults.filter(r => r.score >= 60).slice(0, 3);

    document.getElementById('aiIntelStream').innerHTML = `
        <strong>ASSESSMENT REPORT:</strong> Category ${storm.category} eyewall expansion confirmed. 
        ${highRisk.length} critical infrastructure points identified. 
        Storm surge potential EXTREME. Immediate action required.
    `;

    const directives = [
        'STAGE EMERGENCY RESPONSE UNITS TO HIGH-RISK SECTORS',
        'ENFORCE SHUTDOWN OF CRITICAL INFRASTRUCTURE GRID',
        'DIRECT CIVILIAN EVACUATION ALONG DESIGNATED CORRIDORS',
        'ACTIVATE EMERGENCY SHELTER PROTOCOLS',
        'COORDINATE WITH REGIONAL DEFENSE NETWORKS'
    ];

    document.getElementById('aiDirectives').innerHTML = directives.map(d =>
        `<div class="intel-action-item"><span>${d}</span></div>`
    ).join('');
}

function executeDirectives() {
    alert('DIRECTIVES TRANSMITTED TO DEFENSE NETWORK\n\nAll sectors acknowledge receipt. Execution beginning.');
}

// ============================================================
// TIMER
// ============================================================

function startCycleTimer() {
    let seconds = 4 * 3600 + 12 * 60 + 9;
    setInterval(() => {
        seconds++;
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        const el = document.getElementById('cycleTimer');
        if (el) el.textContent = `T+${h}:${m}:${s}`;
    }, 1000);
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) overlay.classList.remove('hidden');
        else overlay.classList.add('hidden');
    }
}

function getRiskColor(score) {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f97316';
    if (score >= 40) return '#eab308';
    return '#22c55e';
}

function getHeatmapColor(intensity) {
    if (intensity > 0.7) return '#ef4444';
    if (intensity > 0.5) return '#f97316';
    if (intensity > 0.3) return '#eab308';
    return '#22c55e';
}

function getInfraIcon(type) {
    const icons = {
        hospital: '🏥', power: '⚡', water: '💧', school: '🏫',
        shelter: '🏠', port: '⚓', airport: '✈️', emergency: '🚨',
        industrial: '🏭', coastal: '🌊'
    };
    return icons[type] || '📍';
}

function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return dateStr; }
}
