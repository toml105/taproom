// Group superlatives for the "Most Likely To" vote game. Kept light and
// playful — teasing, never mean or crude.
export interface MostLikelyPrompt {
  id: string
  text: string
}

export const MOST_LIKELY: MostLikelyPrompt[] = [
  { id: 'ml-late', text: 'show up fashionably late to everything' },
  { id: 'ml-karaoke', text: 'commandeer the karaoke microphone' },
  { id: 'ml-trivia', text: 'be a secret trivia genius' },
  { id: 'ml-lost', text: 'get lost on the way to the bathroom' },
  { id: 'ml-snack', text: 'raid the snack table first' },
  { id: 'ml-dance', text: 'start the dancing before anyone else' },
  { id: 'ml-phone', text: 'be glued to their phone all night' },
  { id: 'ml-roadtrip', text: 'plan a spontaneous road trip' },
  { id: 'ml-celeb', text: 'become unexpectedly famous one day' },
  { id: 'ml-round', text: 'buy the next round without being asked' },
  { id: 'ml-pun', text: 'make a terrible pun on purpose' },
  { id: 'ml-survive', text: 'survive the longest in a zombie apocalypse' },
  { id: 'ml-quote', text: 'quote a movie line for every situation' },
  { id: 'ml-nap', text: 'fall asleep on the sofa first' },
  { id: 'ml-cook', text: 'win a cooking competition' },
  { id: 'ml-adventure', text: 'say yes to any wild adventure' },
  { id: 'ml-talk', text: 'talk their way out of a parking ticket' },
  { id: 'ml-playlist', text: 'have the best music playlist' },
  { id: 'ml-gadget', text: 'own the most pointless gadget' },
  { id: 'ml-marathon', text: 'binge a whole series in one sitting' },
  { id: 'ml-plant', text: 'forget to water their plants' },
  { id: 'ml-startup', text: 'launch a startup out of nowhere' },
  { id: 'ml-dare', text: 'accept any dare without thinking' },
  { id: 'ml-host', text: 'host the best dinner party' },
]
