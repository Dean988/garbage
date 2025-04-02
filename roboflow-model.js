class RoboflowModel {
    constructor() {
        this.apiKey = "SfylJjmPXCUqfkkAYBxO";
        this.modelUrl = "https://detect.roboflow.com/garbage-classification-3/2";
    }

    async detect(imageData) {
        try {
            // Ensure imageData is in the correct format
            if (!imageData || typeof imageData !== 'string') {
                throw new Error('Invalid image data format');
            }

            // Remove data URL prefix if present
            const base64Data = imageData.includes('base64,') 
                ? imageData.split('base64,')[1] 
                : imageData;

            const formData = new FormData();
            formData.append('file', base64Data);

            const response = await axios({
                method: "POST",
                url: this.modelUrl,
                params: {
                    api_key: this.apiKey
                },
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (!response.data || !response.data.predictions) {
                throw new Error('Invalid response from Roboflow API');
            }

            return response.data.predictions.map(pred => ({
                class: pred.class,
                score: pred.confidence,
                bbox: [
                    pred.x - pred.width / 2,
                    pred.y - pred.height / 2,
                    pred.width,
                    pred.height
                ]
            }));
        } catch (error) {
            console.error('Roboflow detection error:', error);
            if (error.response) {
                console.error('API Response:', error.response.data);
                throw new Error(`Roboflow API error: ${error.response.data.message || 'Unknown error'}`);
            }
            throw new Error(`Detection failed: ${error.message}`);
        }
    }
} 