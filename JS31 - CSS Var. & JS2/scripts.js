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

// Tab functionality
function toggleTab() {
  // Close all tabs
  tabs.forEach((tab) => tab.classList.remove("active"));

  // Open the clicked tab
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

// Upload functionality
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

// Download functionality
document.getElementById("downloadBtn").addEventListener("click", function () {
  const canvas = document.createElement("canvas");
  const img = document.getElementById("sourceImage");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  // Apply CSS filters to canvas
  const computedStyle = getComputedStyle(img);
  ctx.filter = computedStyle.filter;

  ctx.drawImage(img, 0, 0);

  // Convert to dataURL and download
  const link = document.createElement("a");
  link.download = "filtered-image.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// Initialize - open the first tab by default
tabs[0].classList.add("active");
