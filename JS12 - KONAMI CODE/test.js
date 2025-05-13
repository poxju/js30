function showPlayer() {
  if (document.getElementById('customPlayer')) return;
  const gifUrl = "https://media.giphy.com/media/4GWgNkOcQeubVjoc5P/giphy.gif";
  const playerHTML = `
    <div id="customPlayer" style="
      position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;
      display:flex;align-items:center;justify-content:center;box-sizing:border-box;">
      <canvas id="gifCanvas" style="max-width:80vw;max-height:80vh;border-radius:16px;box-shadow:0 0 40px rgba(0,0,0,0.4);background:#fff;"></canvas>
      <button onclick="document.getElementById('customPlayer').remove(); clearInterval(window.bgInterval);" style="
        position:absolute;top:20px;right:30px;z-index:10000;font-size:1.2rem;
        padding:8px 16px;border-radius:8px;border:none;background:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);">Kapat</button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', playerHTML);

  let prevRgb = [255, 255, 255];

  fetch(gifUrl)
    .then(res => res.arrayBuffer())
    .then(buff => {
      const gifReader = new GifReader(new Uint8Array(buff));
      const canvas = document.getElementById('gifCanvas');
      const ctx = canvas.getContext('2d');
      canvas.width = gifReader.width;
      canvas.height = gifReader.height;
      const frameImageData = ctx.createImageData(gifReader.width, gifReader.height);
      let i = 0;

      function nextFrame() {
        gifReader.decodeAndBlitFrameRGBA(i, frameImageData.data);
        ctx.putImageData(frameImageData, 0, 0);

        const sampleCount = 10;
        let r = 0, g = 0, b = 0, count = 0;
        for (let s = 0; s < sampleCount; s++) {
          let d = ctx.getImageData(Math.floor(s * (canvas.width - 1) / (sampleCount - 1)), 0, 1, 1).data;
          r += d[0]; g += d[1]; b += d[2]; count++;
          d = ctx.getImageData(Math.floor(s * (canvas.width - 1) / (sampleCount - 1)), canvas.height - 1, 1, 1).data;
          r += d[0]; g += d[1]; b += d[2]; count++;
          d = ctx.getImageData(0, Math.floor(s * (canvas.height - 1) / (sampleCount - 1)), 1, 1).data;
          r += d[0]; g += d[1]; b += d[2]; count++;
          d = ctx.getImageData(canvas.width - 1, Math.floor(s * (canvas.height - 1) / (sampleCount - 1)), 1, 1).data;
          r += d[0]; g += d[1]; b += d[2]; count++;
        }
        const avg = [
          Math.round(r / count),
          Math.round(g / count),
          Math.round(b / count)
        ];

        const smooth = 0.8;
        prevRgb = prevRgb.map((c, idx) => Math.round(c + (avg[idx] - c) * smooth));

        const rgb = `rgb(${prevRgb[0]},${prevRgb[1]},${prevRgb[2]})`;
        document.getElementById('customPlayer').style.background =
          `radial-gradient(circle at center, ${rgb} 30%, #000 100%)`;

        const delay = Math.max(10, gifReader.frameInfo(i).delay * 10);
        i = (i + 1) % gifReader.numFrames();
        window.bgInterval = setTimeout(nextFrame, delay);
      }
      nextFrame();
    });
}