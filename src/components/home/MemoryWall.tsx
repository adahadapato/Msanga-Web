import type { MockMemory } from '../../mock/homeData'
import { SectionHeader } from './SectionHeader'

/**
 * The Memory Wall: recent photos from your sets. Each has a written caption (what and when) under it, which is what
 * screen readers read, so the picture itself has alt="" (no double reading). Members give that caption when they upload.
 */
export function MemoryWall({ memories }: { memories: MockMemory[] }) {
  return (
    <section className="panel" aria-labelledby="memory-wall-heading">
      <SectionHeader id="memory-wall-heading" title="Memory Wall" seeAllHref="/memories" seeAllWhat="memories" />
      <ul className="memory-grid">
        {memories.map((m) => (
          <li key={m.id}>
            <figure className="memory">
              <img className="memory-picture" src={m.picture} alt="" loading="lazy" />
              <figcaption>{m.caption}, {m.year}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
