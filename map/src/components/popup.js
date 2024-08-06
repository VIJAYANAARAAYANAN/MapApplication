import React from 'react';
import './popup.css'; // CSS file for styling

const OutsidePopupComponent = ({ seller, onClose }) => {
  if (!seller) return null;

  const imageRows = [];
  for (let i = 0; i < seller.product_images.length; i += 3) {
    imageRows.push(
      <div className="image-row" key={i}>
        {seller.product_images.slice(i, i + 3).map((image, index) => (
          <img src={image} alt={`Product ${i + index + 1}`} key={index} className="popup-image" />
        ))}
      </div>
    );
  }

  return (
    <div className="outside-popup">
      <button
        className="popup-close-button"
        onClick={onClose}
      >
        X
      </button>
      <h2>{seller.seller_name}</h2>
      <p>Total Products: {seller.product_count}</p>
      <p>City: {seller.seller_city}</p>
      <p>Pincode: {seller.seller_pincode}</p>
      <div className="image-grid">
        {imageRows}
      </div>
      <a href={seller.seller_url} target="_blank" rel="noopener noreferrer" className="see-more-link">See More</a>
    </div>
  );
};

export default OutsidePopupComponent;
