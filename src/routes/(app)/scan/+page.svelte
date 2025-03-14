<script>
  import { back } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";
  import { BarcodeDetector } from "barcode-detector/ponyfill";
  import { camera } from "$lib/store";

  let resize = () => {
    if (resizing) clearTimeout(resizing);
    resizing = setTimeout(initialize, 1000);
  };

  let videoEl;
  let canvasEl;
  let barcodeDetector;
  let scanningFrameId;
  let cameras = [];
  let detectionResult = null; // will hold the detected QR code value

  // Enumerate available video input devices
  async function getCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      cameras = devices.filter((device) => device.kind === "videoinput");

      // Check if we're on an iOS device
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (!$camera && cameras.length > 0) {
        if (isIOS) {
          // Prefer a camera labeled "back camera" (without additional qualifiers)
          const backCamera = cameras.find(
            (camera) =>
              camera.label.toLowerCase().includes("back") &&
              !camera.label.toLowerCase().includes("dual") &&
              !camera.label.toLowerCase().includes("wide"),
          );
          $camera = backCamera
            ? backCamera.deviceId
            : cameras[0].deviceId;
        } else {
          // For non-iOS, default to a camera with the environment facing mode
          const envCamera = cameras.find(
            (camera) =>
              camera.label.toLowerCase().includes("back") ||
              camera.label.toLowerCase().includes("env"),
          );
          $camera = envCamera ? envCamera.deviceId : cameras[0].deviceId;
        }
      }
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  }
  // Start the camera stream for a given deviceId
  async function startCamera(deviceId) {
    stopCameraStream();
    detectionResult = null; // reset detection on restart
    try {
      const constraints = deviceId
        ? { video: { deviceId: { exact: deviceId } } }
        : { video: { facingMode: "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoEl.srcObject = stream;
      await videoEl.play();
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }

  // Stop any active video stream and cancel the scanning loop
  function stopCameraStream() {
    if (videoEl && videoEl.srcObject) {
      const stream = videoEl.srcObject;
      if (stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
    if (scanningFrameId) {
      cancelAnimationFrame(scanningFrameId);
    }
  }

  function handleDetection(barcode) {
    detectionResult = barcode.rawValue;
    stopCameraStream();
    goto(`/send/${encodeURIComponent(detectionResult)}`);
  }

  // The scanning loop: draw the video frame onto a hidden canvas and detect QR codes.
  function scanLoop() {
    if (!videoEl.videoWidth || !videoEl.videoHeight) {
      scanningFrameId = requestAnimationFrame(scanLoop);
      return;
    }

    const context = canvasEl.getContext("2d");
    if (!context) return;

    // Ensure canvas dimensions match the video
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    barcodeDetector
      .detect(canvasEl)
      .then((barcodes) => {
        if (barcodes.length > 0) {
          handleDetection(barcodes[0]);
          return; // Stop scanning on detection.
        }
      })
      .catch((err) => {
        console.error("Detection error:", err);
      });

    // Continue scanning if no detection has occurred.
    if (!detectionResult) {
      scanningFrameId = requestAnimationFrame(scanLoop);
    }
  }

  // Handle change of camera selection
  async function onCameraChange(event) {
    $camera = event.target.value;
    await startCamera($camera);
    videoEl.addEventListener("loadeddata", () => {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      scanLoop();
    });
  }

  // Provide a way to restart scanning
  async function restart() {
    detectionResult = null;
    await startCamera($camera);
    videoEl.addEventListener("loadeddata", () => {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      scanLoop();
    });
  }

  let initialize = async () => {
    barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
    await getCameraDevices();
    await startCamera($camera);
    videoEl.addEventListener("loadeddata", () => {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      scanLoop();
    });
  };
  onMount(initialize);

  onDestroy(() => {
    stopCameraStream();
  });
</script>

<svelte:window onresize={resize} />
<div class="flex w-full mb-4 p-4">
  <div class="mx-auto rounded-3xl space-y-5">
    <video
      bind:this={videoEl}
      class="border-4 rounded-3xl border-black max-h-[calc(100vh*0.7)]"
    ></video>
    <canvas bind:this={canvasEl} style="display: none;"></canvas>
    <div class="flex justify-center">
      <button class="btn !w-auto" onclick={back}>Cancel</button>
    </div>
    <div>
      <select
        id="cameraSelect"
        bind:value={$camera}
        onchange={onCameraChange}
      >
        {#each cameras as camera}
          <option value={camera.deviceId}>
            {camera.label || `Camera ${camera.deviceId}`}
          </option>
        {/each}
      </select>
    </div>
  </div>
</div>

<style>
  video {
    width: 100%;
    max-width: 600px;
    border: 4px solid black;
    border-radius: 1rem;
    transform: scale(1);
    transition: transform 0.3s ease-out;
  }
</style>
