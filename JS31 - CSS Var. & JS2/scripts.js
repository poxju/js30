const inputs = document.querySelectorAll(".options input");

function handleUpdate() {
  const suffix = this.dataset.sizing || "";
  document.documentElement.style.setProperty(
    `--${this.name}`,
    this.value + suffix
  );
}

inputs.forEach((input) => input.addEventListener("change", handleUpdate));
inputs.forEach((input) => input.addEventListener("mousemove", handleUpdate));

const downloadBtn = document.getElementById("downloadBtn");
const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("click", function () {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";

  document.body.appendChild(fileInput);

  fileInput.click();

  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) {
      const selectedFile = fileInput.files[0];
      const objectURL = URL.createObjectURL(selectedFile);
      const img = document.getElementById("sourceImage");
      img.src = objectURL;

      img.onload = function () {
        URL.revokeObjectURL(objectURL);
      };
    }
    document.body.removeChild(fileInput);
  });
});

downloadBtn.addEventListener("click", function () {
  const img = document.getElementById("sourceImage");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const styles = getComputedStyle(img);
  const padding = parseInt(styles.paddingLeft);
  const blur = parseFloat(styles.filter.match(/blur\(([^)]+)\)/)?.[1] || "0px");
  const backgroundColor = styles.backgroundColor;

  const width = img.naturalWidth;
  const height = img.naturalHeight;
  canvas.width = width + padding * 2;
  canvas.height = height + padding * 2;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (blur > 0) {
    ctx.filter = `blur(${blur})`;
  }

  ctx.drawImage(img, padding, padding, width, height);

  const link = document.createElement("a");
  link.download = "modified-image.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
