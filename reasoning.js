/**
 * reasoning.js — LLM Advisory Engine
 * 
 * Simulates an AI-powered advisory system that generates contextual
 * recommendations based on risk scores, infrastructure type, and storm
 * characteristics.
 * 
 * In production, this would connect to an LLM API (OpenAI, Anthropic, etc.):
 * 
 * const OPENAI_API_KEY = 'YOUR_OPENAI_KEY';
 * async function generateAdvisoryLLM(riskData) {
 *     const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *         method: 'POST',
 *         headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
 *         body: JSON.stringify({
 *             model: 'gpt-4',
 *             messages: [{ role: 'user', content: buildPrompt(riskData) }]
 *         })
 *     });
 *     return response.json();
 * }
 * 
 * For this demo, we use a rule-based expert system that mimics LLM output.
 */

// ============================================================
// ADVISORY TEMPLATES
// ============================================================

const ADVISORY_TEMPLATES = {
    hospital: {
        critical: [
            "IMMEDIATE EVACUATION RECOMMENDED: {name} is in the direct path of {stormName} with sustained winds of {windSpeed} mph. Patient relocation to inland facilities advised within {timeWindow} hours.",
            "CRITICAL ALERT: {name} faces catastrophic wind damage and storm surge flooding. Activate emergency generator protocols and prepare for extended grid-down operations.",
            "EMERGENCY ACTION: {name} structural integrity at risk. Recommend immediate suspension of non-essential services and full emergency preparedness activation."
        ],
        high: [
            "HIGH PRIORITY: {name} should prepare for hurricane-force winds. Verify backup power systems, secure medical supplies, and review patient evacuation procedures.",
            "WARNING: {name} is at significant risk from {stormName}. Recommend pre-positioning emergency medical teams and testing all backup systems.",
            "ADVISORY: {name} should activate hurricane preparedness plan. Confirm 72-hour supply inventory and backup generator fuel reserves."
        ],
        medium: [
            "PREPAREDNESS: {name} should monitor {stormName} progression. Review emergency protocols and verify communication systems are functional.",
            "ADVISORY: {name} in potential impact zone. Recommend checking emergency supplies and ensuring staff awareness of evacuation procedures."
        ],
        low: [
            "MONITOR: {name} should maintain awareness of {stormName} updates. Standard preparedness measures sufficient at this time."
        ]
    },

    power: {
        critical: [
            "GRID EMERGENCY: {name} faces catastrophic damage from {stormName}. Recommend preemptive controlled shutdown to prevent equipment destruction and facilitate faster post-storm restoration.",
            "CRITICAL: {name} infrastructure at severe risk. Initiate emergency shutdown procedures for non-critical systems and secure all transformers.",
            "URGENT: {name} should execute hurricane hardening protocols. Flood barriers deployment and critical equipment elevation recommended."
        ],
        high: [
            "POWER INFRASTRUCTURE ALERT: {name} at high risk. Recommend pre-storm inspection of all substations and verification of mobile generator availability.",
            "WARNING: {name} should prepare for extended outage. Coordinate with emergency services on priority restoration sequencing.",
            "ADVISORY: {name} should test all backup systems and pre-position repair crews for rapid response."
        ],
        medium: [
            "PREPAREDNESS: {name} should conduct pre-storm equipment checks and verify fuel reserves for backup generators.",
            "ADVISORY: {name} in potential impact zone. Recommend reviewing mutual aid agreements with neighboring utilities."
        ],
        low: [
            "MONITOR: {name} should maintain standard operational readiness and monitor storm updates."
        ]
    },

    water: {
        critical: [
            "WATER SYSTEM EMERGENCY: {name} at critical risk from storm surge and flooding. Recommend preemptive system shutdown to prevent contamination and equipment damage.",
            "CRITICAL: {name} faces catastrophic flooding risk. Activate emergency water distribution plan and secure all chemical storage.",
            "URGENT: {name} should implement flood protection measures immediately. Sandbag critical infrastructure and prepare for service interruption."
        ],
        high: [
            "WATER INFRASTRUCTURE ALERT: {name} at high risk. Recommend testing all backup pumps and verifying emergency water supply contracts.",
            "WARNING: {name} should prepare for potential service disruption. Issue pre-storm boil water advisory to downstream users.",
            "ADVISORY: {name} should inspect all flood protection systems and clear drainage pathways."
        ],
        medium: [
            "PREPAREDNESS: {name} should verify emergency equipment inventory and review flood response procedures.",
            "ADVISORY: {name} in potential impact zone. Recommend monitoring water levels and preparing for possible service adjustments."
        ],
        low: [
            "MONITOR: {name} should maintain standard operational readiness."
        ]
    },

    school: {
        critical: [
            "SCHOOL EMERGENCY: {name} in direct path of {stormName}. Immediate closure and conversion to emergency shelter or evacuation recommended.",
            "CRITICAL: {name} structural safety compromised. Recommend immediate relocation of all students and staff to designated safe facilities.",
            "URGENT: {name} should execute emergency closure protocols. Coordinate with emergency management for potential shelter use."
        ],
        high: [
            "SCHOOL ALERT: {name} at high risk. Recommend early dismissal and activation of remote learning protocols.",
            "WARNING: {name} should prepare for extended closure. Verify emergency communication systems with parents and staff.",
            "ADVISORY: {name} should review shelter-in-place procedures and emergency supply inventory."
        ],
        medium: [
            "PREPAREDNESS: {name} should monitor storm progression and prepare for potential early closure.",
            "ADVISORY: {name} in potential impact zone. Recommend reviewing emergency procedures with staff."
        ],
        low: [
            "MONITOR: {name} should maintain awareness of storm updates."
        ]
    },

    shelter: {
        critical: [
            "SHELTER ALERT: {name} itself at risk from {stormName}. Recommend evacuation of current occupants to inland facilities.",
            "CRITICAL: {name} structural integrity compromised. Cannot serve as reliable emergency shelter. Redirect to alternative facilities.",
            "URGENT: {name} should be inspected for wind resistance before accepting evacuees."
        ],
        high: [
            "SHELTER WARNING: {name} at significant risk. Verify structural capacity and prepare backup shelter locations.",
            "ADVISORY: {name} should be inspected and supplies verified before activation."
        ],
        medium: [
            "PREPAREDNESS: {name} should be inspected and supplies verified before potential activation.",
            "ADVISORY: {name} in potential impact zone. Recommend reviewing capacity and supply levels."
        ],
        low: [
            "MONITOR: {name} should maintain readiness for potential activation."
        ]
    },

    port: {
        critical: [
            "PORT EMERGENCY: {name} faces catastrophic damage from storm surge. Immediate vessel evacuation and port closure recommended.",
            "CRITICAL: {name} at extreme risk. Execute hurricane preparedness plan: secure cranes, evacuate vessels, and activate flood barriers.",
            "URGENT: {name} should initiate port closure protocols and coordinate vessel traffic evacuation."
        ],
        high: [
            "PORT ALERT: {name} at high risk. Recommend vessel evacuation and securing of all cargo handling equipment.",
            "WARNING: {name} should prepare for extended closure. Coordinate with shipping lines on rerouting.",
            "ADVISORY: {name} should inspect mooring systems and prepare for storm surge flooding."
        ],
        medium: [
            "PREPAREDNESS: {name} should review hurricane preparedness plan and verify equipment securing procedures.",
            "ADVISORY: {name} in potential impact zone. Recommend monitoring storm progression."
        ],
        low: [
            "MONITOR: {name} should maintain standard operational readiness."
        ]
    },

    airport: {
        critical: [
            "AIRPORT EMERGENCY: {name} faces catastrophic wind damage. Immediate closure and aircraft evacuation recommended.",
            "CRITICAL: {name} at extreme risk. Execute full airport closure and coordinate aircraft relocation to inland facilities.",
            "URGENT: {name} should initiate emergency closure protocols and secure all ground equipment."
        ],
        high: [
            "AIRPORT ALERT: {name} at high risk. Recommend aircraft relocation and terminal preparation for hurricane-force winds.",
            "WARNING: {name} should prepare for extended closure. Coordinate with airlines on flight cancellations.",
            "ADVISORY: {name} should secure all ground support equipment and verify emergency power systems."
        ],
        medium: [
            "PREPAREDNESS: {name} should review hurricane preparedness plan and verify equipment securing procedures.",
            "ADVISORY: {name} in potential impact zone. Recommend monitoring storm progression."
        ],
        low: [
            "MONITOR: {name} should maintain standard operational readiness."
        ]
    },

    emergency: {
        critical: [
            "EMERGENCY SERVICES ALERT: {name} at critical risk. Recommend relocation of emergency operations center to backup facility.",
            "CRITICAL: {name} faces catastrophic damage. Activate alternate EOC and pre-position search and rescue teams.",
            "URGENT: {name} should execute continuity of operations plan and verify all backup communication systems."
        ],
        high: [
            "EMERGENCY PREPAREDNESS: {name} at high risk. Recommend activation of backup EOC and verification of all emergency systems.",
            "WARNING: {name} should prepare for potential service disruption. Pre-position emergency supplies and equipment.",
            "ADVISORY: {name} should test all backup communication systems and review mutual aid agreements."
        ],
        medium: [
            "PREPAREDNESS: {name} should verify emergency equipment inventory and review response procedures.",
            "ADVISORY: {name} in potential impact zone. Recommend monitoring storm progression."
        ],
        low: [
            "MONITOR: {name} should maintain standard operational readiness."
        ]
    },

    industrial: {
        critical: [
            "INDUSTRIAL EMERGENCY: {name} at critical risk. Recommend immediate shutdown of hazardous material processes and evacuation of non-essential personnel.",
            "CRITICAL: {name} faces catastrophic damage. Execute emergency shutdown procedures and secure all chemical storage.",
            "URGENT: {name} should implement hurricane hardening protocols and prepare for potential hazardous material release."
        ],
        high: [
            "INDUSTRIAL ALERT: {name} at high risk. Recommend pre-storm inspection and securing of all outdoor equipment and materials.",
            "WARNING: {name} should prepare for potential environmental release. Verify containment systems and emergency response equipment.",
            "ADVISORY: {name} should review emergency shutdown procedures and coordinate with local emergency management."
        ],
        medium: [
            "PREPAREDNESS: {name} should conduct pre-storm equipment checks and verify emergency response supplies.",
            "ADVISORY: {name} in potential impact zone. Recommend reviewing safety procedures."
        ],
        low: [
            "MONITOR: {name} should maintain standard operational readiness."
        ]
    },

    coastal: {
        critical: [
            "COASTAL DEFENSE EMERGENCY: {name} at critical risk from storm surge. Recommend immediate activation of all flood defense systems.",
            "CRITICAL: {name} faces catastrophic failure risk. Evacuate all personnel and activate emergency flood barriers.",
            "URGENT: {name} should be inspected and reinforced immediately. Prepare for overtopping and structural failure."
        ],
        high: [
            "COASTAL DEFENSE ALERT: {name} at high risk. Recommend pre-storm inspection and activation of flood defense systems.",
            "WARNING: {name} should prepare for significant wave action. Verify structural integrity and drainage systems.",
            "ADVISORY: {name} should inspect all flood protection infrastructure and clear drainage pathways."
        ],
        medium: [
            "PREPAREDNESS: {name} should inspect flood protection systems and verify drainage capacity.",
            "ADVISORY: {name} in potential impact zone. Recommend monitoring water levels."
        ],
        low: [
            "MONITOR: {name} should maintain standard operational readiness."
        ]
    }
};

// ============================================================
// ADVISORY GENERATION ENGINE
// ============================================================

/**
 * Generate a contextual advisory for a risk event
 * Uses template-based generation with dynamic variable substitution
 * 
 * @param {Object} riskResult - Risk assessment result from calculation.js
 * @param {Array|Object} stormData - Storm track data (single object or array)
 * @returns {Object} Advisory object with title, text, priority, and timestamp
 */
function generateAdvisory(riskResult, stormData) {
    const { infraName, infraType, riskLevel, factors, score } = riskResult;

    // Handle both single storm object and array of storms
    const storms = Array.isArray(stormData) ? stormData : [stormData];
    const stormNames = storms.map(s => s.name).join(', ');
    // Use the closest storm's name for display
    const primaryStormName = storms.length === 1 ? storms[0].name : `${storms.length} storms`;

    // Get templates for this infrastructure type and risk level
    const typeTemplates = ADVISORY_TEMPLATES[infraType] || ADVISORY_TEMPLATES.industrial;
    const levelTemplates = typeTemplates[riskLevel] || typeTemplates.medium;

    // Select template (use score to deterministically pick from array)
    const templateIndex = score % levelTemplates.length;
    let template = levelTemplates[templateIndex];

    // Calculate time window based on storm proximity
    const timeWindow = factors.distance.km < 50 ? '6' :
                       factors.distance.km < 150 ? '12' : '24';

    // Substitute variables
    const advisoryText = template
        .replace(/{name}/g, infraName)
        .replace(/{stormName}/g, primaryStormName)
        .replace(/{windSpeed}/g, factors.wind.speedMph)
        .replace(/{timeWindow}/g, timeWindow);

    // Generate title based on risk level and type
    const title = generateAdvisoryTitle(infraType, riskLevel, infraName);

    // Determine priority score (1-10)
    const priority = calculatePriority(riskResult);

    return {
        id: `ADV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: title,
        text: advisoryText,
        priority: priority,
        riskLevel: riskLevel,
        infraId: riskResult.infraId,
        infraName: infraName,
        infraType: infraType,
        score: score,
        timestamp: new Date().toISOString(),
        acknowledged: false
    };
}

/**
 * Generate a concise advisory title
 * @param {string} infraType - Infrastructure type
 * @param {string} riskLevel - Risk level
 * @param {string} infraName - Infrastructure name
 * @returns {string} Advisory title
 */
function generateAdvisoryTitle(infraType, riskLevel, infraName) {
    const actions = {
        critical: 'IMMEDIATE ACTION REQUIRED',
        high: 'High Priority Advisory',
        medium: 'Preparedness Advisory',
        low: 'Monitor Advisory'
    };

    const typeLabels = {
        hospital: 'Medical Facility',
        power: 'Power Infrastructure',
        water: 'Water System',
        school: 'Educational Facility',
        shelter: 'Emergency Shelter',
        port: 'Port Authority',
        airport: 'Airport',
        emergency: 'Emergency Services',
        industrial: 'Industrial Site',
        coastal: 'Coastal Defense'
    };

    return `${actions[riskLevel]}: ${typeLabels[infraType] || 'Infrastructure'} — ${infraName}`;
}

/**
 * Calculate advisory priority (1-10)
 * @param {Object} riskResult - Risk assessment result
 * @returns {number} Priority score
 */
function calculatePriority(riskResult) {
    let priority = riskResult.score / 10; // Base: 0-10 from score

    // Boost for critical infrastructure types
    const criticalTypes = ['hospital', 'power', 'emergency', 'water'];
    if (criticalTypes.includes(riskResult.infraType)) {
        priority += 1.5;
    }

    // Boost for very close proximity
    if (riskResult.factors.distance.km < 30) {
        priority += 1;
    }

    return Math.min(10, Math.round(priority * 10) / 10);
}

/**
 * Process all risk results and generate advisories for items above threshold
 * @param {Array} riskResults - All risk assessment results
 * @param {Object} stormData - Storm track data
 * @param {number} threshold - Minimum score to generate advisory (default: 40)
 * @returns {Array} Advisory queue sorted by priority
 */
function generateAdvisoryQueue(riskResults, stormData, threshold = 40) {
    console.log(`[Advisory Engine] Processing ${riskResults.length} risk results (threshold: ${threshold})...`);

    const advisories = [];

    for (const result of riskResults) {
        if (result.score >= threshold) {
            const advisory = generateAdvisory(result, stormData);
            advisories.push(advisory);
        }
    }

    // Sort by priority descending
    advisories.sort((a, b) => b.priority - a.priority);

    console.log(`[Advisory Engine] Generated ${advisories.length} advisories`);
    return advisories;
}

/**
 * Generate a summary report of all advisories
 * @param {Array} advisories - Advisory queue
 * @returns {Object} Summary statistics
 */
function getAdvisorySummary(advisories) {
    const summary = {
        total: advisories.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        averagePriority: 0,
        topRecommendation: null
    };

    let totalPriority = 0;

    for (const adv of advisories) {
        summary[adv.riskLevel]++;
        totalPriority += adv.priority;
    }

    if (advisories.length > 0) {
        summary.averagePriority = Math.round((totalPriority / advisories.length) * 10) / 10;
        summary.topRecommendation = advisories[0].text;
    }

    return summary;
}

/**
 * Simulate LLM-style reasoning explanation for a risk score
 * Provides human-readable explanation of why a score was assigned
 * 
 * @param {Object} riskResult - Risk assessment result
 * @returns {string} Reasoning explanation
 */
function explainRiskScore(riskResult) {
    const { factors, score, riskLevel, vulnerabilityMultiplier } = riskResult;

    const explanations = [];

    // Distance explanation
    if (factors.distance.km < 50) {
        explanations.push(`Very close to storm track (${factors.distance.km} km)`);
    } else if (factors.distance.km < 150) {
        explanations.push(`Moderate distance from storm track (${factors.distance.km} km)`);
    } else {
        explanations.push(`Far from storm track (${factors.distance.km} km)`);
    }

    // Elevation explanation
    if (factors.elevation.meters < 5) {
        explanations.push(`Low elevation (${factors.elevation.meters}m) — high flood risk`);
    } else if (factors.elevation.meters < 20) {
        explanations.push(`Moderate elevation (${factors.elevation.meters}m)`);
    } else {
        explanations.push(`High elevation (${factors.elevation.meters}m) — reduced flood risk`);
    }

    // Wind explanation
    if (factors.wind.speedMph > 130) {
        explanations.push(`Extreme winds (${factors.wind.speedMph} mph) — catastrophic damage potential`);
    } else if (factors.wind.speedMph > 100) {
        explanations.push(`Major hurricane winds (${factors.wind.speedMph} mph)`);
    } else if (factors.wind.speedMph > 74) {
        explanations.push(`Hurricane-force winds (${factors.wind.speedMph} mph)`);
    } else {
        explanations.push(`Tropical storm winds (${factors.wind.speedMph} mph)`);
    }

    // Vulnerability explanation
    if (vulnerabilityMultiplier > 1.2) {
        explanations.push(`Critical infrastructure type (vulnerability ×${vulnerabilityMultiplier})`);
    }

    return `Risk Score ${score}/100 (${riskLevel.toUpperCase()}): ${explanations.join('; ')}.`;
}
