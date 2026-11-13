import { Link } from 'react-router'
/**
 * A section's heading with its "See all" link. The link's full name for screen readers includes the section
 * ("See all school sets"), because a page full of plain "See all" links is meaningless when listed on its own.
 */
export function SectionHeader({ id, title, seeAllHref, seeAllWhat }: {
  id: string
  title: string
  seeAllHref: string
  seeAllWhat: string
}) {
  return (
    <div className="section-header">
      <h2 id={id}>{title}</h2>
      <Link to={seeAllHref} className="see-all">
        See all{' '}<span className="visually-hidden">{seeAllWhat}</span>
      </Link>
    </div>
  )
}
