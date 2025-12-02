import "./LoadingSkeleton.css"

export const DocumentCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
    <div className="skeleton-body">
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
    </div>
  </div>
)

export const StatCardSkeleton = () => (
  <div className="skeleton-stat">
    <div className="skeleton skeleton-stat-number"></div>
    <div className="skeleton skeleton-stat-label"></div>
  </div>
)

export const TableRowSkeleton = () => (
  <tr className="skeleton-row">
    <td>
      <div className="skeleton skeleton-cell"></div>
    </td>
    <td>
      <div className="skeleton skeleton-cell"></div>
    </td>
    <td>
      <div className="skeleton skeleton-cell"></div>
    </td>
    <td>
      <div className="skeleton skeleton-cell"></div>
    </td>
    <td>
      <div className="skeleton skeleton-cell short"></div>
    </td>
  </tr>
)
