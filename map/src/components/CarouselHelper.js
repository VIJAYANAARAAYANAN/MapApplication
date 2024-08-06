import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './carousel.css';

const CarouselComponent = ({ images, sellerUrl }) => {
  const handleImageClick = () => {
    window.open(sellerUrl, '_blank');
  };

  return (
    <Carousel
      showThumbs={false}
      infiniteLoop={true} 
      useKeyboardArrows={true}
      autoPlay={true} 
      interval={1500} 
      transitionTime={500} 
    >
      {images.map((img, index) => (
        <div key={index} onClick={handleImageClick} className="carousel-slide">
          <img src={img} alt={`Product ${index}`} className="carousel-image" />
        </div>
      ))}
    </Carousel>
  );
};

export { CarouselComponent };
