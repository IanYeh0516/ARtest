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
    if (mediaRecorder && mediaRecorder.state == "recording") {
        console.log("mediaRecorder : "+ mediaRecorder  + " mediaRecorder.state : " + mediaRecorder.state);
        stopRecording();
        button.classList.remove('recording');
        button.classList.add('active'); // 顯示錄影結束狀態

    } else {
        console.log("captureshot")
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

function startRecording(mimeType = "video/mp4") {

    console.log(" strart recording");
    const webcamVideo = document.querySelector("video");
    const canvasWidth = webcamVideo.clientWidth;
    const canvasHeight = webcamVideo.clientHeight;
    let combinedCanvas;
    combinedCanvas = document.createElement("Canvas");
    combinedCanvas.height =canvasHeight ;
    combinedCanvas.width =canvasWidth ;

    const stream = combinedCanvas.captureStream(24);
    mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = function (event) {
        console.log("🎥 Data available:", event.data.size, "bytes");
        if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = function () {
        console.log("🎬 MediaRecorder started" + " media type : " + mimeType);

        const blob = new Blob(recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = generateFilename("recording");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    // updated frame 
    function drawFrame() {
        console.log("Drawing frame...");
        const ctx = combinedCanvas.getContext("2d");
        if (!ctx) {
            console.error("Canvas context could not be retrieved");
            return;
        }

        const webcamFrame = getWebcamCapture(webcamVideo, combinedCanvas.height, combinedCanvas.width);
        const aframeScene = document.querySelector("a-scene");
        const aframeFrame = aframeScene ? getAframeScreenCapture(aframeScene, combinedCanvas.height, combinedCanvas.width) : null;

        if (webcamFrame && aframeFrame) {
            console.log("Frame captured - Webcam & A-Frame");
            ctx.clearRect(0, 0, combinedCanvas.width, combinedCanvas.height);
            ctx.drawImage(webcamFrame, 0, 0);
            ctx.drawImage(aframeFrame, 0, 0);
        } else {
            console.warn("Frame capture failed");
        }

        if (mediaRecorder && mediaRecorder.state === "recording") {
            requestAnimationFrame(drawFrame);
        }
    }

    recordedChunks = [];
    mediaRecorder.start();
    drawFrame();
    console.log("Recording started...");

}



// stop錄影
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        console.log("錄影已停止...");
    }
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
    const webcamVideo = document.querySelector("video");
    const aframeScene = document.querySelector("a-scene");
    if (!webcamVideo || !aframeScene) {
        console.error("找不到 <video> 或 <a-scene>");
        return;
    }
    const canvasWidth = webcamVideo.clientWidth;
    const canvasHeight = webcamVideo.clientHeight;
    // 擷取 Webcam 畫面
    const webcamFrame = getWebcamCapture(webcamVideo, canvasHeight, canvasWidth);
    if (!webcamFrame) {
        console.error("無法擷取 Webcam 畫面");
        return;
    }
    // 擷取 A-Frame 畫面
    const aframeFrame = getAframeScreenCapture(aframeScene, canvasHeight, canvasWidth);
    if (!aframeFrame) {
        console.error("無法擷取 A-Frame 畫面");
        return;
    }
    // 合併畫面
    const mergedCanvas = mergeCanvases(webcamFrame, aframeFrame, canvasHeight, canvasWidth);
    const mergedImage = mergedCanvas.toDataURL("image/png");
    // 產生檔名
    const filename = generateFilename("photo");
    // **自動選擇「下載」或「分享」**
    downloadOrShareImage(mergedImage, filename);
}
// 下載檔案

function downloadOrShareImage(dataUrl, filename) {
      // **檢查是否為行動裝置**
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // **轉換成 Blob**
      fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
              const file = new File([blob], filename, { type: "image/png" });
  
              // **📱 只有「行動裝置」才使用 Web Share API**
              if (isMobile && navigator.share) {
                  navigator.share({
                      title: "分享截圖",
                      text: "這是我的截圖，來看看吧！",
                      files: [file]
                  })
                  .then(() => console.log("成功分享"))
                  .catch(err => console.error("分享失敗:", err));
              } 
              // **💻 桌面版（Windows / macOS）強制下載**
              else {
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  console.log("圖片已下載:", filename);
              }
          })
          .catch(err => console.error("下載 / 分享圖片失敗:", err));
  
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
function generateFilename(sourceType) {
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
    const extension = sourceType === "recording" ? ".mp4" : "png";
    return `${sourceType}_${YYYY}${MM}${DD}_${HH}${mm}${SS}.${extension}`;
}