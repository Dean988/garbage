let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let startButton = document.getElementById('startButton');
let stopButton = document.getElementById('stopButton');
let status = document.getElementById('status');
let model = null;
let isDetecting = false;

// Material classification mapping
const materialClassification = {
    // Common household items and their classification
    'bottle': 'PLASTIC',
    'cup': 'PLASTIC',
    'wine glass': 'GLASS',
    'bottle': 'GLASS',
    'paper': 'PAPER',
    'book': 'PAPER',
    'newspaper': 'PAPER',
    'cardboard': 'CARDBOARD',
    'box': 'CARDBOARD',
    'can': 'METAL',
    'fork': 'METAL',
    'knife': 'METAL',
    'spoon': 'METAL',
    'bowl': 'GLASS',
    'banana': 'BIODEGRADABLE',
    'apple': 'BIODEGRADABLE',
    'orange': 'BIODEGRADABLE',
    'carrot': 'BIODEGRADABLE',
    'food': 'BIODEGRADABLE'
};

// Material colors
const materialColors = {
    'BIODEGRADABLE': '#4CAF50',
    'PAPER': '#2196F3',
    'METAL': '#FFC107',
    'CARDBOARD': '#795548',
    'GLASS': '#9C27B0',
    'PLASTIC': '#F44336',
    'UNKNOWN': '#9E9E9E'
};

// Check browser compatibility
function checkBrowserCompatibility() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Il tuo browser non supporta l\'accesso alla webcam. Prova con Chrome, Firefox o Edge aggiornati.');
    }
}

// Initialize the webcam
async function initWebcam() {
    try {
        checkBrowserCompatibility();
        status.textContent = 'Richiesta accesso alla webcam...';
        
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment'
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve).catch(e => {
                    throw new Error('Impossibile avviare la riproduzione video: ' + e.message);
                });
            };
        });

        status.textContent = 'Webcam inizializzata con successo';
        console.log('Webcam ready');
    } catch (error) {
        let errorMessage = 'Errore di accesso alla webcam: ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage += 'Permesso negato. Per favore, consenti l\'accesso alla webcam nelle impostazioni del browser.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'Nessuna webcam trovata. Assicurati che la webcam sia collegata e funzionante.';
        } else if (error.name === 'NotReadableError') {
            errorMessage += 'La webcam è già in uso da un\'altra applicazione o non è accessibile.';
        } else {
            errorMessage += error.message;
        }
        
        status.textContent = errorMessage;
        status.style.color = '#ff0000';
        console.error('Webcam error:', error);
    }
}

// Classify material based on detected object
function classifyMaterial(detectedClass) {
    return materialClassification[detectedClass.toLowerCase()] || 'UNKNOWN';
}

// Draw detection boxes and labels
function drawDetections(detections) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    detections.forEach(detection => {
        const [x, y, width, height] = detection.bbox;
        const material = classifyMaterial(detection.class);
        const color = materialColors[material];
        
        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Draw background for label
        ctx.fillStyle = color;
        const labelText = `${material} (${Math.round(detection.score * 100)}%)`;
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillRect(x - 2, y - 25, textWidth + 10, 25);
        
        // Draw label text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(labelText, x + 3, y - 7);
    });
}

// Load the COCO-SSD model
async function loadModel() {
    try {
        status.textContent = 'Caricamento modello...';
        model = await cocoSsd.load();
        status.textContent = 'Modello caricato con successo';
        startButton.disabled = false;
    } catch (error) {
        status.textContent = 'Errore caricamento modello: ' + error.message;
        console.error('Error loading model:', error);
    }
}

// Perform object detection
async function detectObjects() {
    if (!isDetecting) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
        const detections = await model.detect(video);
        drawDetections(detections);
        requestAnimationFrame(detectObjects);
    } catch (error) {
        console.error('Detection error:', error);
        status.textContent = 'Errore durante il rilevamento';
        stopDetection();
    }
}

// Start detection
function startDetection() {
    isDetecting = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    status.textContent = 'Rilevamento in corso...';
    detectObjects();
}

// Stop detection
function stopDetection() {
    isDetecting = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    status.textContent = 'Rilevamento fermato';
}

// Event listeners
startButton.addEventListener('click', startDetection);
stopButton.addEventListener('click', stopDetection);

// Initialize the application
async function init() {
    try {
        status.textContent = 'Inizializzazione...';
        await initWebcam();
        await loadModel();
    } catch (error) {
        status.textContent = 'Errore durante l\'inizializzazione: ' + error.message;
        status.style.color = '#ff0000';
        console.error('Initialization error:', error);
    }
}

// Start the application
init(); 