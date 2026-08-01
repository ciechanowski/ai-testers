export interface Artist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  category: 'digital-art' | 'photography' | '3d-render' | 'illustration';
  priceCents: number;
  image: string;
  description: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

export type ActivityType = 'sale' | 'bid' | 'listing' | 'favorite';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  actorName: string;
  actorAvatar: string;
  artworkId: string;
  artworkTitle: string;
  createdAt: string;
}
