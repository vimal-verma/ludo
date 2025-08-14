// A simple cache for Audio objects to prevent re-creating them
const soundCache = {};

const getSound = (src) => {
  if (!soundCache[src]) {
    soundCache[src] = new Audio(src);
  }
  return soundCache[src];
};

export const playSound = (soundName) => {
  try {
    const sound = getSound(`/sounds/${soundName}.mp3`);
    sound.currentTime = 0; // Rewind to the start to allow rapid playback
    sound.play();
  } catch (error) {
    console.error(`Error playing sound "${soundName}":`, error);
  }
};