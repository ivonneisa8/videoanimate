
import { AnimationStyle } from './types';
import type { StyleOption } from './types';

export const ANIMATION_STYLES: StyleOption[] = [
  {
    id: AnimationStyle.CLASSIC_ANIME,
    name: "Classic Anime",
    thumbnail: "https://picsum.photos/seed/anime/200/200",
  },
  {
    id: AnimationStyle.PIXAR_3D,
    name: "Pixar Style 3D",
    thumbnail: "https://picsum.photos/seed/pixar/200/200",
  },
  {
    id: AnimationStyle.AMERICAN_CARTOON,
    name: "Looney Toons",
    thumbnail: "https://picsum.photos/seed/looney/200/200",
  },
  {
    id: AnimationStyle.GRAPHIC_NOVEL,
    name: "Graphic Novel",
    thumbnail: "https://picsum.photos/seed/novel/200/200",
  },
];

export const LOADING_MESSAGES: string[] = [
  "Warming up the animation cells...",
  "Analyzing video frames...",
  "Identifying subjects and actions...",
  "Sketching the keyframes...",
  "Applying the selected animation style...",
  "Inking the outlines...",
  "Adding color and shading...",
  "Rendering the final video...",
  "This can take a few minutes, please wait...",
  "Finalizing the masterpiece...",
  "Almost there, polishing the details...",
];
