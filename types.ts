
export enum AnimationStyle {
  CLASSIC_ANIME = "Classic 90s Anime",
  PIXAR_3D = "3D Animation (Pixar Style)",
  AMERICAN_CARTOON = "American Cartoon (Looney Tunes Style)",
  GRAPHIC_NOVEL = "Graphic Novel (Bold lines, flat shading)",
}

export interface StyleOption {
  id: AnimationStyle;
  name: string;
  thumbnail: string;
}
