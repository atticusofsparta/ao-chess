import { Howl } from 'howler';

export const copySound = new Howl({
  src: ['/sounds/trashed.wav'],
  volume: 0.2,
  loop: false,
});

export const menuSound = new Howl({
  src: ['/sounds/menu-sound.wav'],
  volume: 0.2,
  loop: false,
});

export const bloopSound = new Howl({
  src: ['/public/sounds/bloop.wav'],
  volume: 0.01,
});
