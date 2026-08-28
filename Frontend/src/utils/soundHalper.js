// src/utils/soundHelper.js
export const playSound = (soundType) => {
  const sounds = {
    // success: "/sounds/success.mp3", // Agar success ke liye alag sound hai
    bongo: "/sounds/short_bongo.mp3",
    // error: "/sounds/error.mp3"
  };

//   const audio = new Audio(sounds[soundType] || sounds.bongo);
const audio = new Audio(sounds.bongo);
  audio.volume = 0.5;
  audio.play().catch((e) => console.log("Sound blocked by browser policy"));
};