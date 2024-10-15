import React, { useContext, useEffect, useState } from 'react';
import './ReviewForm.css';
import { ImStarEmpty } from "react-icons/im";
import { TiStarFullOutline } from "react-icons/ti";
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import Comments from '../Comments/Comments';

const ReviewForm = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const { user } = useContext(AuthContext);
  const [myReviews, setMyReviews] = useState([]);
  const { isLoggedIn } = useContext(AuthContext);
  const { language } = useContext(AuthContext);
  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('rating', rating);
      formData.append('comment', comment);
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post('http://localhost:5000/api/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);

      // Fetch reviews again to get the updated list including the new comment
      fetchReviews();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/getreviews');
      if (response.status !== 200) {
        throw new Error('Failed to fetch reviews');
      }
      const data = response.data;
      console.log('Fetched reviews:', data);
      setMyReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  return (
    <section className='aaaa'>
      <div className='divpricecard'>
        <h3 className="h3pricecard">  {language === 'en' ? "Write Your Review"
          : language === 'fr' ? "Partagez votre expérience "
            : "شارك تجربتك"}</h3>
      </div>
      <form onSubmit={handleSubmit} className="review-form">
        <label htmlFor="rating" className="form-label">
          {language === 'en' ? "rating :"
            : language === 'fr' ? "rating :  "
              : "تقييم :"}
          <div id="rating" className="rating-stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleStarClick(value)}
                className='btnstar'
              >
                {value <= rating ? <TiStarFullOutline className='stars' /> : <ImStarEmpty className='stars' />}
              </button>
            ))}
          </div>
        </label>

        <label htmlFor="comment" className="form-label">
          {language === 'en' ? "comment :"
            : language === 'fr' ? "Commentaire :  "
              : "تعليق :"}
          <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} className="form-textarea" />
        </label>
        <label htmlFor="image" className="form-label">
          {language === 'en' ? "image :"
            : language === 'fr' ? "image :  "
              : "صورة :"}
          <input type="file" id="image" onChange={handleImageChange} className="form-input" />
        </label>

        {isLoggedIn ? <button className='herobtn' type="submit"> {language === 'en' ? "submit :"
          : language === 'fr' ? "Valider :  "
            : "إرسال :"}  </button> :
          <div> <p className='loginfirst'>    {language === 'en' ? "YOU NEED TO LOGIN FIRST :"
            : language === 'fr' ? "VOUS DEVEZ D'ABORD VOUS CONNECTER  "
              : "یجب عليك تسجيل الدخول أولاً"}</p>
            <button className='herobtn2' type="submit"> {language === 'en' ? "submit :"
              : language === 'fr' ? "Valider :  "
                : "إرسال :"}</button></div>}
      </form>
      <div className='divpricecard'>
        <h3 className="h3pricecard">  {language === 'en' ? "Clients Reviews"
          : language === 'fr' ? "Avis des clients  "
            : "مراجعات العملاء "} </h3>
      </div>
      <div className='scrollzz'>
        {myReviews.map((review) => (
          <Comments className='scrollzz' key={review._id} name={review.name} rating={review.rating} comment={review.comment} image={review.image} />
        ))}
      </div>
    </section>
  );
};

export default ReviewForm;
