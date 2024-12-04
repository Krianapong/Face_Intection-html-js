let isModelLoaded = false;

async function loadModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
        await faceapi.nets.faceExpressionNet.loadFromUri('./models');
        
        isModelLoaded = true;
        document.getElementById('status').textContent = 'โหลดโมเดลเสร็จแล้ว กำลังเปิดกล้อง...';
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

        setInterval(async () => {
            if (!isModelLoaded) return;

            const detections = await faceapi.detectAllFaces(
                video, 
                new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            
            // วาดกรอบใบหน้า
            faceapi.draw.drawDetections(canvas, resizedDetections);
            // วาดจุด landmarks
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            // แสดงการแสดงออกทางสีหน้า
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            // อัพเดทสถานะ
            document.getElementById('status').textContent = 
                `ตรวจพบใบหน้า ${detections.length} ใบหน้า`;
        }, 100);
    });
}

window.addEventListener('load', loadModels); 