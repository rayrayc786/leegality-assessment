import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../utils/api';
import { RatingStars } from './ProductCard';
import { ArrowLeft } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Selected product details
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive gallery main image state
  const [selectedImage, setSelectedImage] = useState('');

  // Load the current product detail by ID
  useEffect(() => {
    async function loadProductDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        } else {
          setSelectedImage(data.thumbnail);
        }
      } catch (err) {
        setError('Product details could not be retrieved.');
      } finally {
        setLoading(false);
      }
    }
    loadProductDetail();
  }, [id]);

  const handleBack = (e) => {
    e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="state-container" style={{ padding: '8rem 2rem' }}>
        <div className="shimmer" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1.5rem' }} />
        <div className="shimmer" style={{ width: '250px', height: '24px', borderRadius: '4px', marginBottom: '0.75rem' }} />
        <div className="shimmer" style={{ width: '150px', height: '16px', borderRadius: '4px' }} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="state-container">
        <h3 className="state-title">Unable to Find Product</h3>
        <p className="state-desc">{error || 'The requested product does not exist.'}</p>
        <button className="state-action-btn" onClick={() => navigate('/')}>
          Return to Storefront
        </button>
      </div>
    );
  }

  const {
    title,
    description,
    price,
    rating,
    brand,
    category,
    images,
    reviews
  } = product;

  return (
    <div className="detail-container">
      <div className="detail-grid">
        {/* Left Column: Back button & Image Gallery */}
        <div className="detail-left-col">
          <a href="/" onClick={handleBack} className="detail-back-btn" id="back-button">
            <ArrowLeft size={16} />
            Back
          </a>

          <div className="detail-main-image-wrapper">
            <img src={selectedImage} alt={title} className="detail-main-img" />
          </div>
          
          {images && images.length > 1 && (
            <div className="detail-thumbnail-row">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`detail-thumb-card ${selectedImage === imgUrl ? 'active' : ''}`}
                  onClick={() => setSelectedImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="detail-thumb-img" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specifications, Description & Reviews */}
        <div className="detail-right-col">
          <h1 className="detail-product-title">{title}</h1>
          
          {/* Price & Rating */}
          <div className="detail-price-rating-line">
            <span className="detail-price-text">${Math.round(price)}</span>
            <RatingStars rating={rating} />
          </div>

          {/* Meta Details */}
          <div className="detail-meta-text-list">
            <div className="detail-meta-text-item">
              <span className="label">Brand:</span>
              <span className="value">{brand || 'Generic'}</span>
            </div>
            <div className="detail-meta-text-item">
              <span className="label">Category:</span>
              <span className="value" style={{ textTransform: 'capitalize' }}>
                {category}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="detail-text-section">
            <h3 className="detail-section-heading">Description</h3>
            <p className="detail-section-body">{description}</p>
          </div>

          {/* Reviews Section */}
          {reviews && reviews.length > 0 && (
            <div className="detail-text-section">
              <h3 className="detail-section-heading">Reviews</h3>
              <div className="detail-reviews-list">
                {reviews.map((rev, index) => (
                  <div key={index} className="detail-review-item">
                    <div className="detail-review-header-line">
                      <span className="detail-reviewer-name">{rev.reviewerName}</span>
                      <RatingStars rating={rev.rating} />
                    </div>
                    <p className="detail-review-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
