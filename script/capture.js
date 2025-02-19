let mediaRecorder;
let recordedChunks = [];
let recordingTimeout;

const button = document.getElementById('screenshot-button');

// 按下滑鼠
button.addEventListener('mousedown', function () {
    button.classList.add('recording'); // 按下按鈕，變紅色
    recordingTimeout = setTimeout(() => {
        startRecording();
    }, 1000); // 長按 1 秒開始錄影
});

//滑鼠釋放
button.addEventListener('mouseup', function () {
    clearTimeout(recordingTimeout);
    if (mediaRecorder && mediaRecorder.state === "recording") {
        stopRecording();
        button.classList.remove('recording');
        button.classList.add('active'); // 顯示錄影結束狀態

    } else {
        captureScreenshot();
        button.classList.remove('recording');
        button.classList.add('active'); // 單擊後觸發狀態
    }
});

//hover
button.addEventListener('mouseleave', function () {
    clearTimeout(recordingTimeout);
    if (mediaRecorder && mediaRecorder.state === "recording") {
        stopRecording();
    }
    button.classList.remove('recording'); // 避免錄影狀態卡住
    button.classList.add('active');
});
function startRecording() {
    // console.log(" 錄影開始 ");
    // const canvas = document.querySelector('canvas');
    // if (!canvas) {
    //     console.error("找不到 A-Frame 的 canvas");
    //     return;
    // }

    // const stream = canvas.captureStream();
    // recordedChunks = [];

    // const options = { mimeType: "video/mp4" };
    // mediaRecorder = new MediaRecorder(stream, options);

    // mediaRecorder.ondataavailable = function(event) {
    //     if (event.data.size > 0) {
    //         recordedChunks.push(event.data);
    //     }

    //     console.log("current states : "+ mediaRecorder.state); 
    // };

    // mediaRecorder.onstop = function() {
    //     const blob = new Blob(recordedChunks, { type: "video/mp4" });
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement("a");
    //     document.body.appendChild(a);
    //     a.style.display = "none";
    //     a.href = url;
    //     a.download = "capture.mp4";
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    // };

    // mediaRecorder.start();
    // console.log("錄影已開始...");
}
// stop錄影
function stopRecording() {
    // if (mediaRecorder && mediaRecorder.state === "recording") {
    //     mediaRecorder.stop();
    //     console.log("錄影已停止...");
    // }
}


// 攝影機畫面擷取
function getWebcamCapture(video,height,width) {
    if (!video) {
        console.error("can't find the webcam.");
        return null;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // 繪製 <video> 畫面
    ctx.drawImage(video, 0, 0, width, height);
    return canvas;
}
// aframe攝影機畫面擷取
function getAframeScreenCapture(video,height,width) {

    if (!video) {
        console.error("can't find the webcam.");
        return null;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    video.components.screenshot.data.width = width;
    video.components.screenshot.data.height = height;
    const screenshotCanvas = video.components.screenshot.getCanvas("perspective");
    const ctx = canvas.getContext("2d");
    // 繪製 <video> 畫面
    ctx.drawImage(screenshotCanvas, 0, 0, width, height);
    return canvas;
}
// 拍攝主要功能
function captureScreenshot() {
    const webcamvideo = document.querySelector("video");
    const aframe = document.querySelector('a-scene');
    const canvasWidth = webcamvideo.clientWidth;
    const canvasHeight = webcamvideo.clientHeight;
    const webcam =  getWebcamCapture(webcamvideo,canvasHeight,canvasWidth);
    const aframescreen = getAframeScreenCapture(aframe,canvasHeight,canvasWidth);
    // combine 
    const mergedImage = mergeCanvases(webcam,aframescreen,canvasHeight,canvasWidth).toDataURL("image/png");
    const filename = ""
    downloadImage(mergedImage, generateFilename("photo"));;
}
// 下載檔案

function downloadImage(dataUrl, filename) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;

    if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")) {
        window.open(dataUrl, "_blank"); // iOS 需要手動點擊下載
    } else {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
// 整合照片 
function mergeCanvases(baseFrame,topFrame,height,width){
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseFrame, 0, 0, width, height);
    ctx.drawImage(topFrame, 0, 0, width, height);
    return canvas;
}
// fileName
function generateFilename(sourceType = "photo") {
    // 拍照模式 or 錄影模式 
    // photo or recording
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const DD = String(now.getDate()).padStart(2, "0");
    const HH = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const SS = String(now.getSeconds()).padStart(2, "0");
    //photo_20250219_143045.png
    return `${sourceType}_${YYYY}${MM}${DD}_${HH}${mm}${SS}.png`;
}