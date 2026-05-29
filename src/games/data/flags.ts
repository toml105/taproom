// Flag emoji -> country. Options are generated (seeded) at play time.
export interface FlagQ {
  flag: string
  country: string
}

export const FLAGS: FlagQ[] = [
  { flag: '🇫🇷', country: 'France' },
  { flag: '🇯🇵', country: 'Japan' },
  { flag: '🇧🇷', country: 'Brazil' },
  { flag: '🇮🇹', country: 'Italy' },
  { flag: '🇩🇪', country: 'Germany' },
  { flag: '🇪🇸', country: 'Spain' },
  { flag: '🇬🇧', country: 'United Kingdom' },
  { flag: '🇺🇸', country: 'United States' },
  { flag: '🇨🇦', country: 'Canada' },
  { flag: '🇦🇺', country: 'Australia' },
  { flag: '🇮🇳', country: 'India' },
  { flag: '🇨🇳', country: 'China' },
  { flag: '🇲🇽', country: 'Mexico' },
  { flag: '🇿🇦', country: 'South Africa' },
  { flag: '🇰🇷', country: 'South Korea' },
  { flag: '🇸🇪', country: 'Sweden' },
  { flag: '🇳🇴', country: 'Norway' },
  { flag: '🇳🇱', country: 'Netherlands' },
  { flag: '🇨🇭', country: 'Switzerland' },
  { flag: '🇬🇷', country: 'Greece' },
  { flag: '🇵🇹', country: 'Portugal' },
  { flag: '🇮🇪', country: 'Ireland' },
  { flag: '🇪🇬', country: 'Egypt' },
  { flag: '🇦🇷', country: 'Argentina' },
  { flag: '🇯🇲', country: 'Jamaica' },
  { flag: '🇰🇪', country: 'Kenya' },
  { flag: '🇹🇷', country: 'Turkey' },
  { flag: '🇹🇭', country: 'Thailand' },
  { flag: '🇵🇱', country: 'Poland' },
]
