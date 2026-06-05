// Finish the common saying. Options are seed-shuffled at play time.
export interface SayingQ {
  start: string
  options: [string, string, string, string]
  answer: number
}

export const SAYINGS: SayingQ[] = [
  { start: 'The early bird catches the…', options: ['worm', 'fish', 'sun', 'train'], answer: 0 },
  { start: 'When in Rome, do as the…', options: ['Romans do', 'locals say', 'kings rule', 'gods wish'], answer: 0 },
  { start: 'A picture is worth a thousand…', options: ['words', 'dreams', 'miles', 'coins'], answer: 0 },
  { start: "Don't count your chickens before they…", options: ['hatch', 'fly', 'crow', 'sleep'], answer: 0 },
  { start: 'Actions speak louder than…', options: ['words', 'drums', 'thoughts', 'money'], answer: 0 },
  { start: 'The grass is always greener on the other…', options: ['side', 'hill', 'farm', 'field'], answer: 0 },
  { start: 'Curiosity killed the…', options: ['cat', 'dog', 'mouse', 'bird'], answer: 0 },
  { start: 'Every cloud has a silver…', options: ['lining', 'rain', 'sky', 'edge'], answer: 0 },
  { start: 'An apple a day keeps the … away', options: ['doctor', 'dentist', 'winter', 'blues'], answer: 0 },
  { start: "Don't put all your eggs in one…", options: ['basket', 'nest', 'bag', 'box'], answer: 0 },
  { start: "You can't judge a book by its…", options: ['cover', 'title', 'weight', 'price'], answer: 0 },
  { start: 'Birds of a feather flock…', options: ['together', 'south', 'high', 'away'], answer: 0 },
  { start: 'The pen is mightier than the…', options: ['sword', 'shield', 'crown', 'fist'], answer: 0 },
  { start: 'All that glitters is not…', options: ['gold', 'silver', 'real', 'mine'], answer: 0 },
  { start: "Rome wasn't built in a…", options: ['day', 'year', 'week', 'hurry'], answer: 0 },
  { start: 'Better late than…', options: ['never', 'sorry', 'early', 'gone'], answer: 0 },
  { start: 'Practice makes…', options: ['perfect', 'progress', 'masters', 'sense'], answer: 0 },
  { start: "Two wrongs don't make a…", options: ['right', 'left', 'pair', 'deal'], answer: 0 },
  { start: 'When the going gets tough, the tough get…', options: ['going', 'lucky', 'loud', 'paid'], answer: 0 },
  { start: 'A penny saved is a penny…', options: ['earned', 'spent', 'lost', 'found'], answer: 0 },
  { start: 'The apple doesn’t fall far from the…', options: ['tree', 'ground', 'branch', 'orchard'], answer: 0 },
  { start: 'Honesty is the best…', options: ['policy', 'virtue', 'habit', 'reward'], answer: 0 },
  { start: 'Beauty is in the eye of the…', options: ['beholder', 'artist', 'dreamer', 'lover'], answer: 0 },
  { start: 'Necessity is the mother of…', options: ['invention', 'patience', 'reason', 'progress'], answer: 0 },
  { start: 'Out of sight, out of…', options: ['mind', 'reach', 'time', 'luck'], answer: 0 },
  { start: 'A friend in need is a friend…', options: ['indeed', 'forever', 'nearby', 'in deed'], answer: 0 },
  { start: 'Don’t bite the hand that…', options: ['feeds you', 'helps you', 'holds you', 'guides you'], answer: 0 },
  { start: 'The squeaky wheel gets the…', options: ['grease', 'blame', 'fix', 'attention'], answer: 0 },
  { start: 'You reap what you…', options: ['sow', 'grow', 'plant', 'earn'], answer: 0 },
  { start: 'Too many cooks spoil the…', options: ['broth', 'meal', 'kitchen', 'stew'], answer: 0 },
  { start: 'Where there’s smoke, there’s…', options: ['fire', 'trouble', 'heat', 'danger'], answer: 0 },
  { start: 'Absence makes the heart grow…', options: ['fonder', 'colder', 'weaker', 'wiser'], answer: 0 },
  { start: 'A watched pot never…', options: ['boils', 'cooks', 'whistles', 'cools'], answer: 0 },
  { start: 'Fortune favours the…', options: ['bold', 'patient', 'wise', 'rich'], answer: 0 },
  { start: 'Strike while the iron is…', options: ['hot', 'soft', 'ready', 'glowing'], answer: 0 },
  { start: 'Look before you…', options: ['leap', 'run', 'fall', 'jump'], answer: 0 },
]
