export interface ArtworkData {
  id: string;
  title: string;
  artistId: string;
  category: string;
  priceCents: number;
  image: string;
  description: string;
  createdAt: string;
}

export interface ArtistData {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  specialization: string;
}

export interface InsightData {
  id: string;
  title: string;
  category: string;
  views: number;
  favorites: number;
  revenueCents: number;
}

export function createArtworkList(count = 3): ArtworkData[] {
  const artworks: ArtworkData[] = [
    {
      id: 'art-001',
      title: 'Neon Horizon',
      artistId: 'artist-01',
      category: 'digital-art',
      priceCents: 12_000,
      image: '/artworks/art-001.svg',
      description: 'A vibrant digital landscape where neon lights meet the horizon.',
      createdAt: '2025-09-15T10:00:00Z',
    },
    {
      id: 'art-002',
      title: 'Urban Echoes',
      artistId: 'artist-02',
      category: 'photography',
      priceCents: 8_500,
      image: '/artworks/art-002.svg',
      description: 'Street photography capturing the rhythm of city life.',
      createdAt: '2025-10-01T14:30:00Z',
    },
    {
      id: 'art-003',
      title: 'Crystal Bloom',
      artistId: 'artist-03',
      category: '3d-render',
      priceCents: 25_000,
      image: '/artworks/art-003.svg',
      description: 'A mesmerizing 3D sculpture of crystalline flowers.',
      createdAt: '2025-08-20T09:00:00Z',
    },
    {
      id: 'art-004',
      title: 'Whisper of Wind',
      artistId: 'artist-04',
      category: 'illustration',
      priceCents: 6_500,
      image: '/artworks/art-004.svg',
      description: 'Hand-drawn illustration of leaves dancing in an autumn breeze.',
      createdAt: '2025-11-05T16:00:00Z',
    },
    {
      id: 'art-005',
      title: 'Data Streams',
      artistId: 'artist-01',
      category: 'digital-art',
      priceCents: 18_000,
      image: '/artworks/art-005.svg',
      description: 'Abstract visualization of data flowing through neural networks.',
      createdAt: '2025-07-12T11:00:00Z',
    },
    {
      id: 'art-006',
      title: 'Forgotten Doors',
      artistId: 'artist-02',
      category: 'photography',
      priceCents: 9_200,
      image: '/artworks/art-006.svg',
      description: 'A series exploring abandoned doorways across European cities.',
      createdAt: '2025-12-01T08:00:00Z',
    },
  ];
  return artworks.slice(0, count);
}

export function createArtistList(): ArtistData[] {
  return [
    {
      id: 'artist-01',
      name: 'Maya Chen',
      bio: 'Digital artist exploring the intersection of technology and nature.',
      avatar: '/avatars/avatar-01.svg',
      specialization: 'Digital Art',
    },
    {
      id: 'artist-02',
      name: 'Luca Rossi',
      bio: 'Street photographer capturing urban stories around the world.',
      avatar: '/avatars/avatar-02.svg',
      specialization: 'Photography',
    },
    {
      id: 'artist-03',
      name: 'Ava Park',
      bio: '3D artist creating surreal landscapes and architectural visions.',
      avatar: '/avatars/avatar-03.svg',
      specialization: '3D Rendering',
    },
    {
      id: 'artist-04',
      name: 'Tomás Silva',
      bio: 'Illustrator blending traditional and digital techniques.',
      avatar: '/avatars/avatar-04.svg',
      specialization: 'Illustration',
    },
  ];
}

export function createTestimonialList() {
  return [
    {
      id: 'test-01',
      name: 'Sarah Johnson',
      role: 'Art Collector',
      text: 'Pixelarium transformed how I discover digital art. The curation is exceptional.',
      avatar: '/avatars/avatar-01.svg',
    },
    {
      id: 'test-02',
      name: 'Marcus Wei',
      role: 'Gallery Owner',
      text: 'A game-changer for the digital art world. Clean, professional, impressive.',
      avatar: '/avatars/avatar-02.svg',
    },
  ];
}

export function createInsightList(count = 6): InsightData[] {
  const insights: InsightData[] = [
    { id: 'ins-001', title: 'Neon Horizon',    category: 'digital-art',  views: 4_820, favorites: 312, revenueCents: 9_200 },
    { id: 'ins-002', title: 'Chromatic Drift', category: '3d-render',    views: 3_915, favorites: 268, revenueCents: 14_500 },
    { id: 'ins-003', title: 'Silent Harbour',  category: 'photography',  views: 3_140, favorites: 197, revenueCents: 7_800 },
    { id: 'ins-004', title: 'Paper Lanterns',  category: 'illustration', views: 2_604, favorites: 154, revenueCents: 6_300 },
    { id: 'ins-005', title: 'Iron Bloom',      category: '3d-render',    views: 1_988, favorites: 121, revenueCents: 11_900 },
    { id: 'ins-006', title: 'Dust and Gold',   category: 'photography',  views: 1_476, favorites: 88,  revenueCents: 5_400 },
  ];
  return insights.slice(0, count);
}
