import './Category.css'

const CATEGORIES = [
  { id: 'animals', label: 'Animals' },
  { id: 'food', label: 'Food' },
  { id: 'objects', label: 'Objects' },
  { id: 'nature', label: 'Nature' },
]

export default function Category({ onSelect, onBack }) {
  return (
    <main className="start-page">
      <p className="start-kicker">Round setup</p>
      <h1>Pick a category</h1>
      <p className="start-lead">
        Pick one category, or Random mix for 5 words pulled from all four.
      </p>

      <div className="category-grid">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className="category-button"
            onClick={() => onSelect(category.id)}
          >
            {category.label}
          </button>
        ))}
        <button
          type="button"
          className="category-button category-button-mix"
          onClick={() => onSelect('random')}
        >
          Random mix
        </button>
      </div>

      <button type="button" className="start-secondary" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
