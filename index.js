let isModelLoaded = false;
let labeledFaceDescriptors = null;

async function loadLabeledImages() {
    const labels = ['jame'];
    try {
        const labeledFaceDescriptors = await Promise.all(
            labels.map(async label => {
                const descriptions = [];
                for(let i = 1; i <= 2; i++) {
                    const response = await fetch(`./faces/${label}/${i}.jpg`);
                    const blob = await response.blob();
                    const img = await faceapi.bufferToImage(blob);
                    
                    const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptor();
                    
                    if (detection) {
                        descriptions.push(detection.descriptor);
                    }
                }
                
                if (descriptions.length > 0) {
                    return new faceapi.LabeledFaceDescriptors(label, descriptions);
                }
            })
        );

        return labeledFaceDescriptors.filter(desc => desc !== undefined);
    } catch (error) {
        console.error('Error loading labeled images:', error);
        return [];
    }
}

async function loadModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
        await faceapi.nets.faceExpressionNet.loadFromUri('./models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('./models');
        
        isModelLoaded = true;
        document.getElementById('status').textContent = 'กำลังโหลดข้อมูลใบหน้า...';
        
        labeledFaceDescriptors = await loadLabeledImages();
        
        if (labeledFaceDescriptors.length === 0) {
            document.getElementById('status').textContent = 'ไม่พบข้อมูลใบหน้าอ้างอิง แต่ยังสามารถตรวจจับใบหน้าได้';
        } else {
            document.getElementById('status').textContent = 'โหลดโมเดลเสร็จแล้ว กำลังเปิดกล้อง...';
        }
        
        startVideo();
    } catch (err) {
        document.getElementById('status').textContent = 'เกิดข้อผิดพลาดในการโหลดโมเดล: ' + err.message;
        console.error('Error loading models:', err);
    }
}

function startVideo() {
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ 
        video: {
            width: 720,
            height: 560
        }
    })
    .then(stream => {
        video.srcObject = stream;
        document.getElementById('status').textContent = 'กำลังตรวจจับใบหน้า...';
    })
    .catch(err => {
        document.getElementById('status').textContent = 'ไม่สามารถเข้าถึงกล้องได้: ' + err.message;
        console.error('Error accessing camera:', err);
    });

    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.querySelector('.video-container').appendChild(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

        setInterval(async () => {
            if (!isModelLoaded) return;

            const detections = await faceapi.detectAllFaces(
                video, 
                new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            
            const results = resizedDetections.map(d => 
                faceMatcher.findBestMatch(d.descriptor)
            );

            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, { 
                    label: result.toString(),
                    boxColor: result.distance < 0.6 ? 'green' : 'red'
                });
                drawBox.draw(canvas);
            });

            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            document.getElementById('status').textContent = 
                `ตรวจพบใบหน้า ${detections.length} ใบหน้า`;
        }, 100);
    });
}

window.addEventListener('load', loadModels); 