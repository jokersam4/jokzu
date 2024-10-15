import React, { useState, useEffect } from 'react';
import { ImStarEmpty } from 'react-icons/im';
import { TiStarFullOutline } from 'react-icons/ti';
import './comments.css';

const Comments = ({ name, rating, comment, image }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<TiStarFullOutline key={i} className="stars" />);
      } else {
        stars.push(<ImStarEmpty key={i} className="stars" />);
      }
    }
    return stars;
  };

  useEffect(() => {
    console.log("Image path: " + image);
  }, [image]);

  const imageUrl = image ? `http://localhost:5000/uploads/${image}` : '';

  return (
    <div className="comment">
      <div className="user-info">
        <span className="username">{name}</span>
        <span className="review">{renderStars()}</span>
      </div>
      <div className="comment-text">{comment}</div>
      <div className='imagediv'>
        {image && <img src={imageUrl} alt={`${name}'s avatar`} onClick={() => setIsModalOpen(true)} />}
      </div>
      {isModalOpen && (
        <div className="modal" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content">
            <img src={imageUrl} alt={`${name}'s avatar`} className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;
