// "Closest Call" bank: numeric questions. Everyone guesses; closest is safe,
// furthest off drinks. Mix of exact and ballpark answers.
export interface EstimationQ {
  q: string
  answer: number
  unit?: string
}

export const ESTIMATION: EstimationQ[] = [
  { q: 'How many keys on a standard piano?', answer: 88 },
  { q: 'How many countries are UN members?', answer: 193 },
  { q: 'How many squares on a chessboard?', answer: 64 },
  { q: 'How many cards in a deck (no jokers)?', answer: 52 },
  { q: 'How many bones in the adult human body?', answer: 206 },
  { q: 'How tall is the Eiffel Tower, to the tip?', answer: 330, unit: 'm' },
  { q: 'How many hours are in a week?', answer: 168 },
  { q: 'How many seconds are in an hour?', answer: 3600 },
  { q: 'How many teeth does an adult human usually have?', answer: 32 },
  { q: 'Roughly what % of the human body is water?', answer: 60, unit: '%' },
  { q: 'How many holes on a standard golf course?', answer: 18 },
  { q: 'How many lines are in a sonnet?', answer: 14 },
  { q: 'How many time zones are there in the world?', answer: 24 },
  { q: 'Speed of sound in air, roughly?', answer: 343, unit: 'm/s' },
  { q: 'Water boils at what temperature in Fahrenheit?', answer: 212, unit: '°F' },
  { q: 'How many weeks are in a year?', answer: 52 },
  { q: 'How many zeroes are in one million?', answer: 6 },
  { q: 'How many days in a leap year?', answer: 366 },
  { q: 'How many minutes in a full day?', answer: 1440 },
  { q: 'How many countries are in Africa?', answer: 54 },
  { q: 'How many floors does the Empire State Building have?', answer: 102 },
  { q: 'How many strings on a violin?', answer: 4 },
  { q: 'How many players on a basketball team on court (one side)?', answer: 5 },
  { q: 'How long is a marathon, rounded?', answer: 42, unit: 'km' },
  { q: 'How many wonders of the ancient world were there?', answer: 7 },
  { q: 'How many permanent members are on the UN Security Council?', answer: 5 },
  { q: 'How many legs does a typical insect have?', answer: 6 },
  { q: 'How many millilitres in a litre?', answer: 1000 },
  { q: 'How many degrees in the angles of a triangle, added up?', answer: 180, unit: '°' },
  { q: 'How many moons does Mars have?', answer: 2 },
  { q: 'How many colours in a traditional rainbow?', answer: 7 },
  { q: 'At what age can you usually vote in most countries?', answer: 18 },
  { q: 'How many faces does a cube have?', answer: 6 },
  { q: 'How many calories, roughly, in a Big Mac?', answer: 563, unit: 'cal' },
  { q: 'How many years in a century?', answer: 100 },
  { q: 'How many letters in the English alphabet?', answer: 26 },
]
