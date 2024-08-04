export interface ICharacter {
  id: number;
  slug: string;
  name: string;
}

export interface IEcho {
  id: number;
  slug: string;
  name: string;
}

export interface IItem {
  id: number;
  slug: string;
  name: string;
}

export interface ITrophy {
  id: number;
  slug: string;
  name: string;
}

export interface IWeapon {
  id: number;
  slug: string;
  name: string;
}

export interface IMapPin {
  id: number;
  type: string;
  lng: number;
  lat: number;
}

export enum CardPoolType {
  'featured-resonator' = 1,
  'featured-weapon' = 2,
  'standard-resonator' = 3,
  'standard-weapon' = 4,
  'beginner' = 5,
  'beginner-choice' = 6,
  'beginner-choice-custom' = 7,
}

export interface IBanner {
  type: CardPoolType;
  name: string;
  thumbnail?: string;
  time?: {
    start: string;
    end: string;
  };
  featured?: string[];
  featuredRare?: string;
  featuredSecondaryRare?: string;
  version?: string;
}
