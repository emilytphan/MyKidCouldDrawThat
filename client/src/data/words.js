export const WORDS = [
  { text: 'cat', category: 'animals' },
  { text: 'dog', category: 'animals' },
  { text: 'fish', category: 'animals' },
  { text: 'bird', category: 'animals' },
  { text: 'frog', category: 'animals' },
  { text: 'snake', category: 'animals' },
  { text: 'pig', category: 'animals' },
  { text: 'cow', category: 'animals' },
  { text: 'duck', category: 'animals' },
  { text: 'owl', category: 'animals' },
  { text: 'pizza', category: 'food' },
  { text: 'apple', category: 'food' },
  { text: 'banana', category: 'food' },
  { text: 'cake', category: 'food' },
  { text: 'cookie', category: 'food' },
  { text: 'carrot', category: 'food' },
  { text: 'grape', category: 'food' },
  { text: 'corn', category: 'food' },
  { text: 'bread', category: 'food' },
  { text: 'donut', category: 'food' },
  { text: 'house', category: 'objects' },
  { text: 'car', category: 'objects' },
  { text: 'ball', category: 'objects' },
  { text: 'cup', category: 'objects' },
  { text: 'chair', category: 'objects' },
  { text: 'hat', category: 'objects' },
  { text: 'book', category: 'objects' },
  { text: 'key', category: 'objects' },
  { text: 'lamp', category: 'objects' },
  { text: 'clock', category: 'objects' },
  { text: 'sun', category: 'nature' },
  { text: 'moon', category: 'nature' },
  { text: 'tree', category: 'nature' },
  { text: 'flower', category: 'nature' },
  { text: 'cloud', category: 'nature' },
  { text: 'leaf', category: 'nature' },
  { text: 'mountain', category: 'nature' },
  { text: 'river', category: 'nature' },
  { text: 'grass', category: 'nature' },
  { text: 'cactus', category: 'nature' },
]

function shuffle(list) {
  const next = [...list]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function pickWords(category, count = 5) {
  if (category === 'random') {
    const groups = {}
    for (const word of WORDS) {
      if (!groups[word.category]) groups[word.category] = []
      groups[word.category].push(word)
    }

    const picked = []
    const leftover = []

    for (const group of Object.values(groups)) {
      const shuffledGroup = shuffle(group)
      picked.push(shuffledGroup[0])
      leftover.push(...shuffledGroup.slice(1))
    }

    const mixed = [...shuffle(picked), ...shuffle(leftover)]
    return mixed.slice(0, count)
  }

  return shuffle(WORDS.filter((word) => word.category === category)).slice(
    0,
    count,
  )
}
