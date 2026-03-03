// 5Pilot.com - The Resilient Hive Formation
// Concepts: Structure, Interconnection, Resilience

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// 1. Fog for Depth (Deep Space Effect)
scene.fog = new THREE.FogExp2(0x0a0c12, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- GEOMETRY: The Hexagonal Hive Lattice ---
// Represents structured resilience vs. chaos
const hexGroup = new THREE.Group();
scene.add(hexGroup);

const geometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 6); // Hexagon shape
const material = new THREE.MeshBasicMaterial({ 
    color: 0xffd700, // Gold
    wireframe: true,
    transparent: true,
    opacity: 0.15
});

// Create a grid of hexagons
const rows = 10;
const cols = 10;
const spacing = 2.5;

for (let i = -rows; i < rows; i++) {
    for (let j = -cols; j < cols; j++) {
        const hex = new THREE.Mesh(geometry, material);
        
        // Offset rows for honeycomb pattern
        const xOffset = (j % 2) * (spacing / 2);
        
        hex.position.x = i * spacing + xOffset;
        hex.position.y = j * (spacing * 0.866); // sin(60) * spacing
        hex.position.z = 0;
        
        // Rotate to face camera flat initially
        hex.rotation.x = Math.PI / 2;
        
        // Store original position for wave animation
        hex.userData = { 
            origZ: 0,
            phase: Math.random() * Math.PI * 2 
        };
        
        hexGroup.add(hex);
    }
}

// Tilt the entire hive backward for perspective
hexGroup.rotation.x = -Math.PI / 3;

// --- GEOMETRY: The 5 Pilots (Orbiting Nodes) ---
const orbitGroup = new THREE.Group();
scene.add(orbitGroup);

const pilotColors = [0x9b59b6, 0xe67e22, 0x2ecc71, 0xe74c3c, 0x3498db]; // Vigil, Compass, Custodian, Phoenix, ART
const pilots = [];

pilotColors.forEach((color, index) => {
    const pGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const pMat = new THREE.MeshBasicMaterial({ color: color });
    const pilot = new THREE.Mesh(pGeo, pMat);
    
    // Initial random position on a sphere orbit
    const theta = (index / 5) * Math.PI * 2;
    pilot.position.x = Math.cos(theta) * 8;
    pilot.position.y = Math.sin(theta) * 8;
    pilot.position.z = 5;
    
    // Add a glowing trail (simple line)
    // (Simulated by just the point here for performance)
    
    pilot.userData = { angle: theta, speed: 0.005 + (index * 0.001) };
    pilots.push(pilot);
    orbitGroup.add(pilot);
});

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// --- CAMERA SETUP ---
camera.position.z = 20;

// --- MOUSE INTERACTION ---
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // 1. Animate The Hive (Undulating Wave)
    hexGroup.children.forEach(hex => {
        // Calculate wave based on position and time
        const dist = Math.sqrt(hex.position.x * hex.position.x + hex.position.y * hex.position.y);
        const zOffset = Math.sin(dist * 0.3 - time) * 1.5;
        hex.position.z = zOffset;
    });

    // 2. Rotate the Hive slowly
    hexGroup.rotation.z += 0.001;

    // 3. Animate Pilots Orbiting
    pilots.forEach(pilot => {
        pilot.userData.angle += pilot.userData.speed;
        const radius = 10 + Math.sin(time * 0.5) * 2; // Breathing orbit
        
        pilot.position.x = Math.cos(pilot.userData.angle) * radius;
        pilot.position.y = Math.sin(pilot.userData.angle) * radius;
        pilot.position.z = Math.sin(pilot.userData.angle * 2) * 5; // Bobbing up/down
    });
    
    // Rotate the pilot group against the hive for complexity
    orbitGroup.rotation.y = mouseX * 0.5;
    orbitGroup.rotation.x = mouseY * 0.5;

    // 4. Camera gentle movement
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

animate();

// --- RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
