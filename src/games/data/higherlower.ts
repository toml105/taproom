// "Higher or Lower" bank. Tap whichever side scores higher on the given metric.
// Values are revealed after each answer. Always "higher value wins".
export interface HLQ {
  metric: string
  a: string
  b: string
  aVal: number
  bVal: number
  unit?: string
}

export const HIGHER_LOWER: HLQ[] = [
  { metric: 'Bigger population', a: 'China', b: 'United States', aVal: 1410, bVal: 333, unit: 'M' },
  { metric: 'Bigger population', a: 'India', b: 'Australia', aVal: 1420, bVal: 26, unit: 'M' },
  { metric: 'Bigger population', a: 'Brazil', b: 'Argentina', aVal: 215, bVal: 46, unit: 'M' },
  { metric: 'Larger area', a: 'Russia', b: 'Canada', aVal: 17.1, bVal: 9.98, unit: 'M km²' },
  { metric: 'Larger area', a: 'Africa', b: 'Europe', aVal: 30.3, bVal: 10.2, unit: 'M km²' },
  { metric: 'Taller', a: 'Mount Everest', b: 'K2', aVal: 8849, bVal: 8611, unit: 'm' },
  { metric: 'Taller', a: 'Giraffe', b: 'Horse', aVal: 5.5, bVal: 1.6, unit: 'm' },
  { metric: 'Faster top speed', a: 'Cheetah', b: 'Usain Bolt', aVal: 110, bVal: 37, unit: 'km/h' },
  { metric: 'Faster', a: 'Light', b: 'Sound', aVal: 299792, bVal: 0.343, unit: 'km/s' },
  { metric: 'Higher boiling point', a: 'Water', b: 'Ethanol', aVal: 100, bVal: 78, unit: '°C' },
  { metric: 'Hotter', a: "Sun's surface", b: 'Lava', aVal: 5500, bVal: 1200, unit: '°C' },
  { metric: 'Larger diameter', a: 'Jupiter', b: 'Earth', aVal: 139820, bVal: 12742, unit: 'km' },
  { metric: 'Farther from the Sun', a: 'Mars', b: 'Earth', aVal: 228, bVal: 150, unit: 'M km' },
  { metric: 'More moons', a: 'Jupiter', b: 'Earth', aVal: 95, bVal: 1 },
  { metric: 'Heavier', a: 'Blue whale', b: 'Elephant', aVal: 150000, bVal: 6000, unit: 'kg' },
  { metric: 'Longer', a: 'A marathon', b: 'A 10K run', aVal: 42, bVal: 10, unit: 'km' },
  { metric: 'More legs', a: 'Spider', b: 'Insect', aVal: 8, bVal: 6 },
  { metric: 'More sides', a: 'Hexagon', b: 'Pentagon', aVal: 6, bVal: 5 },
  { metric: 'More players on the field', a: 'Soccer team', b: 'Basketball team', aVal: 11, bVal: 5 },
  { metric: 'More calories', a: 'A Big Mac', b: 'An apple', aVal: 563, bVal: 95, unit: 'cal' },
  { metric: 'Released more recently', a: 'The iPhone', b: 'Facebook', aVal: 2007, bVal: 2004 },
  { metric: 'Released more recently', a: 'Nintendo 64', b: 'PlayStation 1', aVal: 1996, bVal: 1994 },
  { metric: 'More countries', a: 'Africa', b: 'Europe', aVal: 54, bVal: 44 },
  { metric: 'More teeth', a: 'An adult human', b: 'A child', aVal: 32, bVal: 20 },
  { metric: 'Deeper', a: 'The Pacific Ocean', b: 'A swimming pool', aVal: 4000, bVal: 2, unit: 'm' },
  { metric: 'Longer lifespan', a: 'Giant tortoise', b: 'Dog', aVal: 150, bVal: 13, unit: 'yrs' },
  { metric: 'Bigger population', a: 'Japan', b: 'Canada', aVal: 124, bVal: 39, unit: 'M' },
  { metric: 'Bigger population', a: 'Nigeria', b: 'Germany', aVal: 223, bVal: 84, unit: 'M' },
  { metric: 'Larger area', a: 'Australia', b: 'India', aVal: 7.69, bVal: 3.29, unit: 'M km²' },
  { metric: 'Taller', a: 'Burj Khalifa', b: 'Eiffel Tower', aVal: 828, bVal: 330, unit: 'm' },
  { metric: 'Taller', a: 'Statue of Liberty', b: 'A blue whale (long)', aVal: 93, bVal: 30, unit: 'm' },
  { metric: 'Heavier', a: 'African elephant', b: 'Giraffe', aVal: 6000, bVal: 1200, unit: 'kg' },
  { metric: 'Faster top speed', a: 'Peregrine falcon (dive)', b: 'Cheetah', aVal: 320, bVal: 110, unit: 'km/h' },
  { metric: 'Longer', a: 'The Nile', b: 'The Thames', aVal: 6650, bVal: 346, unit: 'km' },
  { metric: 'Older', a: 'The Great Pyramid', b: 'The Colosseum', aVal: 4500, bVal: 1950, unit: 'yrs' },
  { metric: 'Hotter', a: 'A pizza oven', b: 'Boiling water', aVal: 450, bVal: 100, unit: '°C' },
  { metric: 'More keys', a: 'A piano', b: 'A typical computer keyboard', aVal: 88, bVal: 104 },
  { metric: 'More moons', a: 'Saturn', b: 'Mars', aVal: 146, bVal: 2 },
  { metric: 'Released more recently', a: 'Minecraft', b: 'Tetris', aVal: 2011, bVal: 1984 },
  { metric: 'Released more recently', a: 'The first Toy Story', b: 'The first Jurassic Park', aVal: 1995, bVal: 1993 },
  { metric: 'More expensive on average', a: 'A gram of gold', b: 'A gram of silver', aVal: 65, bVal: 0.8, unit: 'USD' },
  { metric: 'Deeper', a: 'Mariana Trench', b: 'The average ocean', aVal: 10935, bVal: 3700, unit: 'm' },
]
