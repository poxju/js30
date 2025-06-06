const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');
const toggle = player.querySelector('.toggle');
const skipButtons = player.querySelectorAll('[data-skip]');
const ranges = player.querySelectorAll('.player__slider');
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const ambilightToggle = document.querySelector('.ambilight-toggle');

let ambilightMode = 0;

function togglePlay() {
  const method = video.paused ? 'play' : 'pause';
  video[method]();
}

function updateButton() {
  const icon = this.paused ? '►' : '❚ ❚';
  toggle.textContent = icon;
}

function skip() {
  video.currentTime += parseFloat(this.dataset.skip);
}

function handleRangeUpdate() {
  video[this.name] = this.value;
}

function handleProgress() {
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.flexBasis = `${percent}%`;
  
  if (Math.floor(video.currentTime * 4) % 4 === 0) {
    updateBackgroundFromVideo();
  }
}

function scrub(e) {
  const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
  video.currentTime = scrubTime;
}

function updateBackgroundFromVideo() {
  if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    console.log('Video not ready yet');
    return;
  }
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    switch(ambilightMode) {
      case 0: 
        player.style.boxShadow = 'none';
        break;
        
      case 1: 
        player.style.boxShadow = '0 0 50px 20px rgba(255, 0, 0, 0.7)';
        break;
        
      case 2:
        const topData = ctx.getImageData(0, 0, canvas.width, 10).data;
        const rightData = ctx.getImageData(canvas.width - 10, 0, 10, canvas.height).data;
        const bottomData = ctx.getImageData(0, canvas.height - 10, canvas.width, 10).data;
        const leftData = ctx.getImageData(0, 0, 10, canvas.height).data;
        
        const allEdgesData = [
          ...topData, ...rightData, ...bottomData, ...leftData
        ];
        
        const avgColor = getAverageColor(allEdgesData);
        if (avgColor) {
          const vibrantColor = makeVibrant(avgColor);
          player.style.boxShadow = `0 0 50px 20px rgba(${vibrantColor.r}, ${vibrantColor.g}, ${vibrantColor.b}, 0.7)`;
        }
        break;
    }
    
  } catch (e) {
    console.error('Error creating ambient lighting:', e);
    
    if (ambilightMode === 1) {
      player.style.boxShadow = '0 0 50px 20px rgba(255, 0, 0, 0.7)';
    } else if (ambilightMode === 2) {
      const hue = (video.currentTime * 5) % 360;
      player.style.boxShadow = `0 0 50px 20px hsla(${hue}, 70%, 50%, 0.7)`;
    } else {
      player.style.boxShadow = 'none';
    }
  }
}

function makeVibrant(color) {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  
  if (max === min) {
    return { r: 76, g: 175, b: 220 };
  }
  
  const enhancedColor = {
    r: color.r === max ? Math.min(255, color.r * 1.2) : color.r === min ? color.r * 0.8 : color.r,
    g: color.g === max ? Math.min(255, color.g * 1.2) : color.g === min ? color.g * 0.8 : color.g,
    b: color.b === max ? Math.min(255, color.b * 1.2) : color.b === min ? color.b * 0.8 : color.b
  };
  
  return {
    r: Math.floor(enhancedColor.r),
    g: Math.floor(enhancedColor.g),
    b: Math.floor(enhancedColor.b)
  };
}

function getAverageColor(data) {
  let r = 0, g = 0, b = 0;
  let pixelCount = 0;
  
  for (let i = 0; i < data.length; i += 80) {
    if (data[i] < 10 && data[i+1] < 10 && data[i+2] < 10) continue;
    
    r += data[i];
    g += data[i+1];
    b += data[i+2];
    pixelCount++;
  }
  
  if (pixelCount === 0) return null;
  
  return {
    r: Math.floor(r / pixelCount),
    g: Math.floor(g / pixelCount),
    b: Math.floor(b / pixelCount)
  };
}

function cleanup() {
  clearInterval(bgUpdateInterval);
}

function toggleAmbilightMode() {
  ambilightMode = (ambilightMode + 1) % 3;
  updateAmbilightButtonLabel();
  updateBackgroundFromVideo(); 
}

function updateAmbilightButtonLabel() {
  const labels = ['❌', '🔴', '🌈'];
  const titles = [
    'No light', 
    'Red light only', 
    'Ambilight'
  ];
  ambilightToggle.textContent = labels[ambilightMode];
  ambilightToggle.title = titles[ambilightMode];
}

ambilightToggle.addEventListener('click', toggleAmbilightMode);
video.addEventListener('play', updateBackgroundFromVideo);
video.addEventListener('seeking', updateBackgroundFromVideo);
video.addEventListener('loadeddata', updateBackgroundFromVideo);

progress.addEventListener('mouseup', () => mousedown = false);
progress.addEventListener('mousedown', () => mousedown = true);
progress.addEventListener('mousemove', (e) => mousedown && scrub(e));
progress.addEventListener('click', scrub);

let mousedown = false;
ranges.forEach(range => range.addEventListener('mousemove', handleRangeUpdate));
ranges.forEach(range => range.addEventListener('change', handleRangeUpdate));
skipButtons.forEach(button => button.addEventListener('click', skip));
toggle.addEventListener('click', togglePlay);
video.addEventListener('timeupdate', handleProgress);
video.addEventListener('pause', updateButton);
video.addEventListener('play', updateButton);
video.addEventListener('click', togglePlay);

updateAmbilightButtonLabel();

const bgUpdateInterval = setInterval(updateBackgroundFromVideo, 1000);

window.addEventListener('beforeunload', cleanup);
//# sourceMappingURL=scripts.js.map