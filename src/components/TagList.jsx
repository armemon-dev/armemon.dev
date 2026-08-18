export default function TagList({ tags }) {
  return <ul className="tag-list" role="list" aria-label="Technologies">{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
}
