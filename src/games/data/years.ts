// Guess the year an event happened. Closest guess wins.
export interface YearQ {
  event: string
  year: number
}

export const YEARS: YearQ[] = [
  { event: 'The first Moon landing', year: 1969 },
  { event: 'The Titanic sank', year: 1912 },
  { event: 'World War II ended', year: 1945 },
  { event: 'The Berlin Wall fell', year: 1989 },
  { event: 'The first iPhone was released', year: 2007 },
  { event: 'US Declaration of Independence', year: 1776 },
  { event: 'First human in space (Yuri Gagarin)', year: 1961 },
  { event: 'The French Revolution began', year: 1789 },
  { event: "The Wright brothers' first flight", year: 1903 },
  { event: 'COVID-19 declared a pandemic', year: 2020 },
  { event: 'The first Star Wars film released', year: 1977 },
  { event: 'Facebook launched', year: 2004 },
  { event: 'The Great Fire of London', year: 1666 },
  { event: 'William Shakespeare died', year: 1616 },
  { event: 'The first modern Olympic Games', year: 1896 },
  { event: 'The telephone was patented (Bell)', year: 1876 },
  { event: 'The World Wide Web was invented', year: 1989 },
  { event: 'The Eiffel Tower was completed', year: 1889 },
  { event: 'The end of World War I', year: 1918 },
  { event: 'The first email was sent', year: 1971 },
  { event: 'Apollo 13 mission', year: 1970 },
  { event: 'The Great Depression began', year: 1929 },
  { event: 'The first text message was sent', year: 1992 },
  { event: 'YouTube was founded', year: 2005 },
]
