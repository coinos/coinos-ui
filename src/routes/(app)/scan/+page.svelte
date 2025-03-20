<script>
  import { back } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";
  import { BarcodeDetector } from "barcode-detector/ponyfill";
  import { camera } from "$lib/store";

  let resizing = $state();
  let resize = () => {
    if (resizing) clearTimeout(resizing);
    resizing = setTimeout(initialize, 1000);
  };

  let videoEl;
  let canvasEl;
  let barcodeDetector;
  let scanningFrameId;
  let cameras = [];
  let detectionResult = null;

  let isIOS = $state();
  let scanningStarted = $state();

  async function getCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      cameras = devices.filter((device) => device.kind === "videoinput");

      if (!$camera && cameras.length > 0) {
        $camera = cameras[0].deviceId;
      }
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  }

  async function startCamera(deviceId) {
    stopCameraStream();
    detectionResult = null;
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

  function scanLoop() {
    if (!videoEl.videoWidth || !videoEl.videoHeight) {
      scanningFrameId = requestAnimationFrame(scanLoop);
      return;
    }

    const context = canvasEl.getContext("2d");
    if (!context) return;

    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    barcodeDetector
      .detect(canvasEl)
      .then((barcodes) => {
        if (barcodes.length > 0) {
          handleDetection(barcodes[0]);
          return;
        }
      })
      .catch((err) => {
        console.error("Detection error:", err);
      });

    if (!detectionResult) {
      scanningFrameId = requestAnimationFrame(scanLoop);
    }
  }

  async function onCameraChange(event) {
    $camera = event.target.value;
    await startCamera($camera);
    videoEl.addEventListener("loadeddata", () => {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      scanLoop();
    });
  }

  async function restart() {
    detectionResult = null;
    await startCamera($camera);
    videoEl.addEventListener("loadeddata", () => {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      scanLoop();
    });
  }

  function startScanning() {
    scanningStarted = true;
    stopCameraStream();
    detectionResult = null;
    const constraints = $camera
      ? { video: { deviceId: { ideal: $camera } } }
      : { video: { facingMode: "environment" } };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        videoEl.srcObject = stream;
        return videoEl.play();
      })
      .then(() => {
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        scanLoop();
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
      });
  }

  let initialize = async () => {
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
    await getCameraDevices();
    if (!isIOS) startScanning();
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

    {#if cameras.length > 1}
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
    {/if}

    {scanningStarted}
    {#if !scanningStarted}
      <div class="flex justify-center">
        <button class="btn !w-auto" onclick={startScanning}>
          Start Scanning
        </button>
      </div>
    {/if}
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
