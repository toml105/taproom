// Tap the one that doesn't belong. Each set has exactly one clear odd item.
export interface OddSet {
  items: [string, string, string, string]
  odd: number
}

export const ODD_ONE_OUT: OddSet[] = [
  { items: ['Mercury', 'Venus', 'Mars', 'Moon'], odd: 3 },
  { items: ['Guitar', 'Violin', 'Trumpet', 'Cello'], odd: 2 },
  { items: ['Lion', 'Tiger', 'Leopard', 'Wolf'], odd: 3 },
  { items: ['Carrot', 'Potato', 'Apple', 'Onion'], odd: 2 },
  { items: ['Whale', 'Dolphin', 'Seal', 'Shark'], odd: 3 },
  { items: ['Paris', 'London', 'Tokyo', 'Sydney'], odd: 3 },
  { items: ['Gold', 'Silver', 'Iron', 'Diamond'], odd: 3 },
  { items: ['Spring', 'Summer', 'Monday', 'Winter'], odd: 2 },
  { items: ['Snake', 'Lizard', 'Frog', 'Crocodile'], odd: 2 },
  { items: ['Sun', 'Moon', 'Star', 'Cloud'], odd: 3 },
  { items: ['Rose', 'Tulip', 'Oak', 'Daisy'], odd: 2 },
  { items: ['Apple', 'Microsoft', 'Google', 'Ferrari'], odd: 3 },
  { items: ['Square', 'Rectangle', 'Triangle', 'Circle'], odd: 3 },
  { items: ['January', 'March', 'Friday', 'July'], odd: 2 },
  { items: ['Cobra', 'Python', 'Viper', 'Eel'], odd: 3 },
  { items: ['Soccer', 'Tennis', 'Chess', 'Hockey'], odd: 2 },
  { items: ['Red', 'Blue', 'Green', 'Circle'], odd: 3 },
  { items: ['Triangle', 'Square', 'Pentagon', 'Cube'], odd: 3 },
  { items: ['Eagle', 'Hawk', 'Penguin', 'Falcon'], odd: 2 },
  { items: ['Copper', 'Bronze', 'Oxygen', 'Zinc'], odd: 2 },
  { items: ['Earth', 'Jupiter', 'Saturn', 'Sun'], odd: 3 },
  { items: ['Banana', 'Lemon', 'Corn', 'Lime'], odd: 3 },
  { items: ['Hammer', 'Saw', 'Drill', 'Pillow'], odd: 3 },
  { items: ['Heart', 'Spade', 'Diamond', 'Anchor'], odd: 3 },
]
