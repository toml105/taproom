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
]
