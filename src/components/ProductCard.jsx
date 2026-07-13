import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

/**
 * Visual-only fractional stars rendering inline with rating text
 */
export function RatingStars({ rating }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const decimal = rating % 1;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} className="star-icon filled" />);
    } else if (i === fullStars + 1 && decimal > 0) {
      const percent = Math.round(decimal * 100);
      const gradId = `grad-${percent}-${Math.floor(Math.random() * 10000)}`;
      stars.push(
        <span key={i} style={{ display: 'inline-flex', position: 'relative', width: '14px', height: '14px' }}>
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset={`${percent}%`} stopColor="var(--accent-gold)" />
                <stop offset={`${percent}%`} stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
          </svg>
          <Star className="star-icon" style={{ fill: `url(#${gradId})`, color: 'var(--accent-gold)' }} />
        </span>
      );
    } else {
      stars.push(<Star key={i} className="star-icon" />);
    }
  }

  return (
    <div className="rating-container-inline">
      <div className="rating-stars">{stars}</div>
      <span className="rating-num-paren">({rating.toFixed(1)})</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { id, title, thumbnail, price, rating } = product;

  return (
    <Link to={`/product/${id}`} className="product-card" id={`product-card-${id}`}>
      <div className="card-img-wrapper">
        <img
          src={thumbnail}
          alt={title}
          className="product-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/300x300/f3f4f6/374151?text=No+Image';
          }}
        />
      </div>
      <div className="card-info">
        <h3 className="card-title" title={title}>
          {title}
        </h3>
        <div className="card-price-rating-row">
          <span className="price-current">${Math.round(price)}</span>
          <RatingStars rating={rating} />
        </div>
      </div>
    </Link>
  );
}
