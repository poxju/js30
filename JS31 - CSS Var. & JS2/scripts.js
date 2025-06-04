const inputs = document.querySelectorAll(".options input");
const tabs = document.querySelectorAll(".tab");

function handleUpdate() {
  const suffix = this.dataset.sizing || "";
  document.documentElement.style.setProperty(
    `--${this.name}`,
    this.value + suffix
  );
}

inputs.forEach((input) => input.addEventListener("change", handleUpdate));
inputs.forEach((input) => input.addEventListener("mousemove", handleUpdate));

function toggleTab() {
  tabs.forEach((tab) => tab.classList.remove("active"));

  this.classList.toggle("active");
}

tabs.forEach((tab) =>
  tab.querySelector("h3").addEventListener("click", function () {
    const parentTab = this.parentElement;
    if (parentTab.classList.contains("active")) {
      parentTab.classList.remove("active");
    } else {
      tabs.forEach((t) => t.classList.remove("active"));
      parentTab.classList.add("active");
    }
  })
);

document.getElementById("uploadBtn").addEventListener("click", function () {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById("sourceImage").src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
});

document.getElementById("downloadBtn").addEventListener("click", function () {
  const img = document.getElementById("sourceImage");
  const rootStyle = getComputedStyle(document.documentElement);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const spacing = parseInt(rootStyle.getPropertyValue('--spacing').trim() || '10px');
  canvas.width = img.naturalWidth + (spacing * 2);
  canvas.height = img.naturalHeight + (spacing * 2);
  
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const blur = parseFloat(rootStyle.getPropertyValue('--blur').trim() || '0px');
  const hue = parseFloat(rootStyle.getPropertyValue('--hue').trim() || '0deg');
  const grayscale = parseFloat(rootStyle.getPropertyValue('--grayscale').trim() || '0%') / 100;
  const saturate = parseFloat(rootStyle.getPropertyValue('--saturate').trim() || '1');
  const invert = parseFloat(rootStyle.getPropertyValue('--invert').trim() || '0%') / 100;
  
  if (blur > 0) ctx.filter = `blur(${blur}px)`;
  
  ctx.drawImage(img, spacing, spacing, img.naturalWidth, img.naturalHeight);
  
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;
  
  if (grayscale > 0) {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = data[i] * (1 - grayscale) + avg * grayscale;
      data[i + 1] = data[i + 1] * (1 - grayscale) + avg * grayscale;
      data[i + 2] = data[i + 2] * (1 - grayscale) + avg * grayscale;
    }
  }
  
  if (invert > 0) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * (1 - invert) + (255 - data[i]) * invert;
      data[i + 1] = data[i + 1] * (1 - invert) + (255 - data[i + 1]) * invert;
      data[i + 2] = data[i + 2] * (1 - invert) + (255 - data[i + 2]) * invert;
    }
  }
  
  if (saturate !== 1) {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg + (data[i] - avg) * saturate;
      data[i + 1] = avg + (data[i + 1] - avg) * saturate;
      data[i + 2] = avg + (data[i + 2] - avg) * saturate;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  if (hue > 0) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.filter = `hue-rotate(${hue}deg)`;
    tempCtx.drawImage(canvas, 0, 0);
    canvas = tempCanvas;
  }
  
  const link = document.createElement("a");
  link.download = "filtered-image.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

tabs[0].classList.add("active");
