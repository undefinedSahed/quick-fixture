'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiEffect() {
  useEffect(() => {
    const duration = 3500;
    const end = Date.now() + duration;

    const colors = ['#f6c90e', '#63b3ed', '#9f7aea', '#f6ad55', '#48bb78', '#ffffff'];

    // Initial burst
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5, x: 0.5 },
      colors,
      startVelocity: 45,
      gravity: 0.9,
      ticks: 300,
    });

    // Side cannons
    const leftCannon = confetti.create(undefined, { resize: true });
    const rightCannon = confetti.create(undefined, { resize: true });

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      leftCannon({
        particleCount: 20,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
        startVelocity: 40,
        gravity: 0.85,
      });
      rightCannon({
        particleCount: 20,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
        startVelocity: 40,
        gravity: 0.85,
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return null;
}
