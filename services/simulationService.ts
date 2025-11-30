import { VehicleTelemetry, RiskLevel, Incident, RoadZone } from "../types";

const DRIVER_NAMES_AR = ["أحمد الفهد", "خالد العتيبي", "محمد سالم", "فهد الدوسري", "عمر الغامدي", "عبدالله العنزي", "سلمان القحطاني", "فيصل المطيري", "سعد المالكي", "تركي آل الشيخ", "ياسر القحطاني", "بدر الشمري"];

// Approximate bounding box for Riyadh (Used for Lat/Lng display)
const RIYADH_BOUNDS = {
  latMin: 24.60,
  latMax: 24.85,
  lngMin: 46.60,
  lngMax: 46.85
};

// Define explicit road networks as arrays of [x, y] coordinates (0-100 scale)
export const ROAD_NETWORKS = [
  // Outer Ring Road (Highway)
  { id: 'ring_road', width: 4, type: 'highway', points: [{x: 5, y: 5}, {x: 95, y: 5}, {x: 95, y: 95}, {x: 5, y: 95}, {x: 5, y: 5}] },
  
  // Main Vertical Artery (King Fahd Rd style)
  { id: 'main_vertical', width: 4, type: 'highway', points: [{x: 50, y: 0}, {x: 50, y: 100}] },
  
  // Main Horizontal Artery (Khurais Rd style)
  { id: 'main_horizontal', width: 4, type: 'highway', points: [{x: 0, y: 50}, {x: 100, y: 50}] },
  
  // Inner City Grid
  { id: 'inner_1', width: 2, type: 'street', points: [{x: 25, y: 5}, {x: 25, y: 95}] },
  { id: 'inner_2', width: 2, type: 'street', points: [{x: 75, y: 5}, {x: 75, y: 95}] },
  { id: 'inner_3', width: 2, type: 'street', points: [{x: 5, y: 25}, {x: 95, y: 25}] },
  { id: 'inner_4', width: 2, type: 'street', points: [{x: 5, y: 75}, {x: 95, y: 75}] },
  
  // Diagonal Connector
  { id: 'diag_1', width: 2, type: 'street', points: [{x: 5, y: 50}, {x: 50, y: 25}, {x: 95, y: 5}] }
];

// Define Hazardous Road Zones (e.g. Bumpy roads)
export const ROAD_ZONES: RoadZone[] = [
  {
    id: 'zone_bumpy_1',
    type: 'Bumpy',
    // Top right corner of the ring road
    bounds: { xMin: 60, xMax: 95, yMin: 0, yMax: 10 }, 
    label: 'طريق وعر'
  }
];

// Helper to interpolate position along a path
const getPositionOnPath = (pathPoints: {x: number, y: number}[], progress: number) => {
  const totalSegments = pathPoints.length - 1;
  const segmentLength = 1 / totalSegments;
  const currentSegmentIndex = Math.min(Math.floor(progress / segmentLength), totalSegments - 1);
  const segmentProgress = (progress - (currentSegmentIndex * segmentLength)) / segmentLength;

  const p1 = pathPoints[currentSegmentIndex];
  const p2 = pathPoints[currentSegmentIndex + 1];

  const x = p1.x + (p2.x - p1.x) * segmentProgress;
  const y = p1.y + (p2.y - p1.y) * segmentProgress;
  
  // Calculate angle
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const heading = (Math.atan2(dy, dx) * 180 / Math.PI) + 90; // +90 to align with CSS rotation if 0 is Up

  return { x, y, heading };
};

// State to track vehicle progress along their assigned paths
let vehicleStates: Record<string, { pathIndex: number, progress: number, direction: 1 | -1 }> = {};

export const generateInitialVehicles = (count: number): VehicleTelemetry[] => {
  return Array.from({ length: count }).map((_, i) => {
    const roadIndex = i % ROAD_NETWORKS.length;
    const road = ROAD_NETWORKS[roadIndex];
    const progress = Math.random();
    
    // Initialize state
    const id = `VEH-${1000 + i}`;
    vehicleStates[id] = { 
      pathIndex: roadIndex, 
      progress: progress, 
      direction: 1 
    };

    const { x, y, heading } = getPositionOnPath(road.points, progress);

    // Convert relative grid to Lat/Lng
    const lng = RIYADH_BOUNDS.lngMin + (x / 100) * (RIYADH_BOUNDS.lngMax - RIYADH_BOUNDS.lngMin);
    const lat = RIYADH_BOUNDS.latMax - (y / 100) * (RIYADH_BOUNDS.latMax - RIYADH_BOUNDS.latMin);

    return {
      id,
      plateNumber: `${Math.floor(Math.random() * 9000 + 1000)} ${['أ', 'ب', 'ج', 'د', 'ر', 'س'][Math.floor(Math.random() * 6)]} ${['ل', 'م', 'ن', 'ه', 'و', 'ي'][Math.floor(Math.random() * 6)]} ${['د', 'ذ', 'ر', 'ز', 'س'][Math.floor(Math.random() * 5)]}`,
      driverName: DRIVER_NAMES_AR[i % DRIVER_NAMES_AR.length],
      speed: Math.floor(Math.random() * 60 + 60),
      coordinates: { x, y },
      lat,
      lng,
      riskScore: Math.floor(Math.random() * 30),
      riskLevel: RiskLevel.LOW,
      factors: [],
      status: 'active',
      lastUpdate: new Date().toISOString(),
      heading,
      verticalG: 1.0 // Initial G-Force
    };
  });
};

export const updateVehicleData = (vehicles: VehicleTelemetry[]): VehicleTelemetry[] => {
  return vehicles.map((v) => {
    const state = vehicleStates[v.id];
    const road = ROAD_NETWORKS[state.pathIndex];
    
    // Move vehicle
    const speed = v.speed / 2000; // Scale speed to map movement
    let newProgress = state.progress + (speed * state.direction);

    // Loop logic
    if (newProgress >= 1) {
      newProgress = 0;
    } else if (newProgress <= 0) {
      newProgress = 1;
    }
    
    // Update State
    vehicleStates[v.id].progress = newProgress;

    // Get new coords
    const { x, y, heading } = getPositionOnPath(road.points, newProgress);

    // Lat/Lng update
    const newLng = RIYADH_BOUNDS.lngMin + (x / 100) * (RIYADH_BOUNDS.lngMax - RIYADH_BOUNDS.lngMin);
    const newLat = RIYADH_BOUNDS.latMax - (y / 100) * (RIYADH_BOUNDS.latMax - RIYADH_BOUNDS.latMin);

    // Dynamic Speed & Risk Simulation
    let newSpeed = v.speed + (Math.random() - 0.5) * 5;
    
    // Slow down at intersections (simplified: near 50,50)
    if (Math.abs(x - 50) < 5 && Math.abs(y - 50) < 5) {
      newSpeed = Math.max(20, newSpeed - 5);
    } else {
      newSpeed = Math.min(140, newSpeed + 1);
    }
    
    newSpeed = Math.round(newSpeed);

    // Check Road Zones (Bumpy Roads)
    const inBumpyZone = ROAD_ZONES.some(zone => 
      zone.type === 'Bumpy' && 
      x >= zone.bounds.xMin && x <= zone.bounds.xMax &&
      y >= zone.bounds.yMin && y <= zone.bounds.yMax
    );

    // Simulate Vertical G-Force
    let verticalG = 1.0 + (Math.random() * 0.05 - 0.025); // Normal driving noise
    
    // Calculate Risk
    let newRiskScore = v.riskScore;
    let factors: string[] = [];

    // Base Speed Risk
    if (newSpeed > 120) {
      newRiskScore += 2;
      factors.push("سرعة زائدة");
    } else {
      newRiskScore = Math.max(10, newRiskScore - 1);
    }

    // Bumpy Road / G-Force Logic
    if (inBumpyZone) {
      // Simulate impacts: Random spikes between 1.5G and 3.5G
      verticalG = 1.5 + (Math.random() * 2.0); 
      
      factors.push("طريق وعر");
      factors.push("صدمة تعليق"); // Suspension shock

      // If vehicle is speeding in a bumpy zone, risk skyrockets
      if (newSpeed > 80) {
        newRiskScore += 5;
        factors.push("قيادة سريعة في طريق وعر");
      }
    }
    
    // Random incident trigger
    if (Math.random() > 0.995) { // Slightly lowered freq
       newRiskScore += 10;
       factors.push("تجاوز خطر");
    }

    newRiskScore = Math.min(100, Math.max(0, newRiskScore));

    let level = RiskLevel.LOW;
    if (newRiskScore > 50) level = RiskLevel.MODERATE;
    if (newRiskScore > 75) level = RiskLevel.HIGH;
    if (newRiskScore > 90) level = RiskLevel.CRITICAL;

    return {
      ...v,
      coordinates: { x, y },
      lat: newLat,
      lng: newLng,
      speed: newSpeed,
      riskScore: newRiskScore,
      riskLevel: level,
      factors: [...new Set(factors)], 
      lastUpdate: new Date().toISOString(),
      heading,
      verticalG
    };
  });
};

export const generateMockIncidents = (): Incident[] => [
  {
    id: "INC-001",
    timestamp: "١٠:٤٢ ص",
    type: "فرملة قاسية",
    location: "طريق الملك فهد",
    severity: "متوسط",
    status: "منتهي"
  },
  {
    id: "INC-002",
    timestamp: "١١:١٥ ص",
    type: "سرعة زائدة",
    location: "الطريق الدائري الشمالي",
    severity: "حرج",
    status: "مفتوح"
  },
  {
    id: "INC-003",
    timestamp: "١١:٣٠ ص",
    type: "انحراف خطير",
    location: "طريق خريص",
    severity: "طفيف",
    status: "مفتوح"
  }
];