import { toast } from 'react-hot-toast'; // Ya jo bhi tum toast library use kar rahe ho
import { playSound } from './soundHalper';

export const triggerToast = (message, type = 'success') => {
  if (type === 'success') {
    toast.success(message);
    playSound('bongo'); // Success par bongo bajao
  } else {
    toast.error(message);
    // playSound('error'); // Error par error sound bajao
    playSound('bongo'); // Error par error sound bajao
  }
};