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
        <h1>Hello</h1>
        <h1>Hello</h1>
        <h1>Hello</h1>
        <h1>Hello</h1>
        <h1>Hello</h1>
        <h1>Hello</h1>
    </div>
  );
};

export default OutsidePopupComponent;
