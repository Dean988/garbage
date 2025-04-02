let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let startButton = document.getElementById('startButton');
let stopButton = document.getElementById('stopButton');
let captureButton = document.getElementById('captureButton');
let status = document.getElementById('status');
let cameraOverlay = document.getElementById('cameraOverlay');
let cocoModel = null;
let roboflowModel = null;
let currentModel = null;
let isDetecting = false;

// Confidence threshold (0.0 to 1.0)
const CONFIDENCE_THRESHOLD = 0.4;

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
    'PLASTIC': '#F44336'
};

// Model selection elements
const cocoModelButton = document.getElementById('cocoModel');
const roboflowModelButton = document.getElementById('roboflowModel');

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
    
    // Filter detections based on confidence threshold and known classifications
    const filteredDetections = detections.filter(detection => {
        const material = classifyMaterial(detection.class);
        return detection.score >= CONFIDENCE_THRESHOLD && material !== 'UNKNOWN';
    });
    
    filteredDetections.forEach(detection => {
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

    // Update status with number of detections
    if (filteredDetections.length > 0) {
        status.textContent = `Rilevati ${filteredDetections.length} oggetti riciclabili`;
    } else {
        status.textContent = 'Nessun oggetto riciclabile rilevato';
    }
}

// Load the COCO-SSD model
async function loadCocoModel() {
    try {
        status.textContent = 'Caricamento modello COCO-SSD...';
        cocoModel = await cocoSsd.load();
        status.textContent = 'Modello COCO-SSD caricato con successo';
        return true;
    } catch (error) {
        status.textContent = 'Errore caricamento modello COCO-SSD: ' + error.message;
        console.error('Error loading COCO-SSD model:', error);
        return false;
    }
}

// Load the Roboflow model
async function loadRoboflowModel() {
    try {
        status.textContent = 'Caricamento modello Roboflow...';
        roboflowModel = new RoboflowModel();
        status.textContent = 'Modello Roboflow caricato con successo';
        return true;
    } catch (error) {
        status.textContent = 'Errore caricamento modello Roboflow: ' + error.message;
        console.error('Error loading Roboflow model:', error);
        return false;
    }
}

// Perform object detection
async function detectObjects() {
    if (!isDetecting) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
        let detections;
        if (currentModel === cocoModel) {
            detections = await cocoModel.detect(video);
            drawDetections(detections);
            requestAnimationFrame(detectObjects);
        } else {
            // For Roboflow, we don't do continuous detection
            status.textContent = 'Per il modello Roboflow, usa il pulsante "Scatta Foto" per catturare un\'immagine';
            stopDetection();
        }
    } catch (error) {
        console.error('Detection error:', error);
        status.textContent = `Errore durante il rilevamento: ${error.message}`;
        stopDetection();
    }
}

// Capture and process photo for Roboflow
async function captureAndDetect() {
    try {
        // Show camera overlay
        cameraOverlay.classList.add('active');
        status.textContent = 'Prepara a scattare una bella foto!';
        
        // Wait for 2 seconds to let the user prepare
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Hide overlay and process
        cameraOverlay.classList.remove('active');
        status.textContent = 'Elaborazione immagine...';
        
        // Draw current video frame to canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get the image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Perform detection
        const detections = await roboflowModel.detect(imageData);
        drawDetections(detections);
        
        status.textContent = 'Rilevamento completato. Clicca "Scatta Foto" per una nuova analisi.';
    } catch (error) {
        console.error('Photo detection error:', error);
        status.textContent = `Errore durante l'elaborazione: ${error.message}`;
        cameraOverlay.classList.remove('active');
    }
}

// Start detection
function startDetection() {
    if (!currentModel) {
        status.textContent = 'Seleziona un modello prima di iniziare';
        return;
    }
    
    if (currentModel === roboflowModel) {
        status.textContent = 'Il modello Roboflow richiede l\'acquisizione di una foto. Usa il pulsante "Scatta Foto".';
        return;
    }
    
    isDetecting = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    captureButton.style.display = 'none';
    status.textContent = 'Rilevamento in corso...';
    detectObjects();
}

// Stop detection
function stopDetection() {
    isDetecting = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    if (currentModel === roboflowModel) {
        captureButton.style.display = 'inline-flex';
    }
    status.textContent = 'Rilevamento fermato';
}

// Switch model
async function switchModel(modelType) {
    stopDetection();
    cameraOverlay.classList.remove('active');
    
    if (modelType === 'coco') {
        cocoModelButton.classList.add('active');
        roboflowModelButton.classList.remove('active');
        currentModel = cocoModel;
        captureButton.style.display = 'none';
        status.textContent = 'Modello COCO-SSD selezionato. Usa "Start Detection" per il rilevamento in tempo reale.';
    } else {
        cocoModelButton.classList.remove('active');
        roboflowModelButton.classList.add('active');
        currentModel = roboflowModel;
        captureButton.style.display = 'inline-flex';
        status.textContent = 'Modello Roboflow selezionato. Usa "Scatta Foto" per catturare e analizzare un\'immagine.';
    }
}

// Event listeners
startButton.addEventListener('click', startDetection);
stopButton.addEventListener('click', stopDetection);
captureButton.addEventListener('click', captureAndDetect);
cocoModelButton.addEventListener('click', () => switchModel('coco'));
roboflowModelButton.addEventListener('click', () => switchModel('roboflow'));

// Initialize the application
async function init() {
    try {
        status.textContent = 'Inizializzazione...';
        await initWebcam();
        
        // Load both models
        const cocoLoaded = await loadCocoModel();
        const roboflowLoaded = await loadRoboflowModel();
        
        if (cocoLoaded && roboflowLoaded) {
            // Default to COCO-SSD model
            currentModel = cocoModel;
            status.textContent = 'Pronto per il rilevamento';
            startButton.disabled = false;
        } else {
            status.textContent = 'Errore durante il caricamento dei modelli';
            status.style.color = '#ff0000';
        }
    } catch (error) {
        status.textContent = 'Errore durante l\'inizializzazione: ' + error.message;
        status.style.color = '#ff0000';
        console.error('Initialization error:', error);
    }
}

// Start the application
init(); 