import { useEffect, useMemo, useState } from 'react'
import { Pencil, Star } from 'lucide-react'
import { BottomNav, PrimaryButton, ScreenHeader, StatusMessage } from '../../shared/components/MobileUi'
import { listCustomerReviews, type CustomerReview } from './member2.service'

// Member 2 owns review browsing; Member 4 owns writing verified booking reviews.
export function Member2CustomerReviewsScreen({ onBack, onNavigate }: {
  onBack: () => void; onNavigate: (screen: string) => void
}) {
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('recent')
  useEffect(() => {
    let active = true
    void listCustomerReviews().then(items => { if (active) setReviews(items) })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Unable to load reviews.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const sortedReviews = useMemo(() => [...reviews].sort((a, b) =>
    sort === 'highest' ? b.rating - a.rating : sort === 'lowest' ? a.rating - b.rating :
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [reviews, sort])
  const average = reviews.length ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1) : '—'
  return <div className="m1-page"><ScreenHeader title="Customer Reviews" onBack={onBack}/>
    <main className="m1-scroll member2-screen">
      {loading ? <StatusMessage>Loading customer reviews…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage> : <>
        <section className="member2-review-summary" aria-label="Customer rating summary">
          <div><strong>{average}</strong><span className="member2-review-stars" aria-label={`${average} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map(value => <Star key={value} size={16} fill={value <= Math.round(Number(average)) ? 'currentColor' : 'none'}/>)}</span>
            <small>{reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}</small></div>
          <div className="member2-rating-breakdown">{[5, 4, 3, 2, 1].map(value => {
            const count = reviews.filter(item => item.rating === value).length
            return <div key={value}><span>{value} star</span><div className="member2-rating-track"><span style={{ width: `${reviews.length ? count / reviews.length * 100 : 0}%` }}/></div><small>{count}</small></div>
          })}</div>
        </section>
        <div className="member2-review-heading"><h2>Recent Reviews</h2><label><span className="member2-visually-hidden">Sort reviews</span>
          <select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Most Recent</option><option value="highest">Highest Rated</option><option value="lowest">Lowest Rated</option></select></label></div>
        {reviews.length === 200 && <p className="m1-muted">Showing the latest 200 reviews. The summary covers these reviews.</p>}
        {sortedReviews.length ? sortedReviews.map(review => <article className="member2-card member2-customer-review" key={review.id}>
          <div className="member2-review-author"><span className="m1-mini-avatar">{review.reviewer_name.slice(0, 1)}</span>
            <div><strong>{review.reviewer_name}</strong><small>{new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium' }).format(new Date(review.created_at))}</small></div>
            <span className="member2-review-stars" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map(value => <Star key={value} size={14} fill={value <= review.rating ? 'currentColor' : 'none'}/>)}</span></div>
          <small className="member2-review-provider">Service by {review.provider_name}</small><p>{review.comment}</p>
        </article>) : <section className="member2-card"><h2>No reviews yet</h2><p>Reviews from completed appointments will appear here.</p></section>}
      </>}
      <div className="member2-review-write"><p>Open a completed booking to rate your provider.</p>
        <PrimaryButton onClick={() => onNavigate('bookings')}><Pencil size={17}/> Write a Review</PrimaryButton></div>
    </main><BottomNav kind="customer" current="profile" onNavigate={onNavigate}/></div>
}
