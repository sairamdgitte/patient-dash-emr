// import React from 'react';

// const Card = ({ name, gender, allergy, condition, id }) => {
//   return (
//     <div className='tc grow bg-light-green br3 pa3 ma2 dib bw2 shadow-5'>
//       <img alt='robots' src={`https://robohash.org/${id}?size=200x200`} />
//       <div>
//         <h2>{name}</h2>
//         <p>{gender}</p>
//         <p>{allergy}</p>
//         <p>{condition}</p>
//       </div>
//     </div>
//   );
// }

// export default Card;


// import React from 'react';

// const Card = ({ name, gender, allergy, condition, id }) => {
//   // Generate a consistent seed (name + id + gender for variety)
//   const seed = `${name}-${gender}`;
  
//   // Pravatar ensures consistency with the same seed
//   const imgSrc = `https://i.pravatar.cc/200?u=${encodeURIComponent(seed)}`;

//   return (
//     <div className="tc grow bg-light-green br3 pa3 ma2 dib bw2 shadow-5">
//       <img alt="profile" src={imgSrc} style={{ borderRadius: '50%' }} />
//       <div>
//         <h2>{name}</h2>
//         <p>{gender}</p>
//         <p>{allergy}</p>
//         <p>{condition}</p>
//       </div>
//     </div>
//   );
// };

// export default Card;



// import React from 'react';
// import { Link } from 'react-router-dom';

// const Card = ({ name, gender, allergy, condition, id }) => {
//   // Generate a consistent seed (name + id + gender for variety)
//   const seed = `${name}-${gender}`;
  
//   // Pravatar ensures consistency with the same seed
//   const imgSrc = `https://i.pravatar.cc/200?u=${encodeURIComponent(seed)}`;

//   return (
//     <Link to={`/patient/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
//       <div className="tc grow bg-light-green br3 pa3 ma2 dib bw2 shadow-5">
//         <img alt="profile" src={imgSrc} style={{ borderRadius: '50%' }} />
//         <div>
//           <h2>{name}</h2>
//           <p>Gender: {gender}</p>
//           <p>Allergy: {allergy}</p>
//           <p>Condition: {condition}</p>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default Card;

// import React from 'react';
// import { Link } from 'react-router-dom';

// const Card = ({ name, gender, allergy, condition, id }) => {
//   // Normalize gender value
//   const normalizedGender = gender?.toString().toLowerCase();

//   const imgSrc = `https://randomuser.me/api/portraits/${
//     normalizedGender === 'male' || normalizedGender === 'm' ? 'men' : 'women'
//   }/${id % 100}.jpg`;

//   return (
//     <Link to={`/patient/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
//       <div className="tc grow bg-light-green br3 pa3 ma2 dib bw2 shadow-5">
//         <img alt="profile" src={imgSrc} style={{ borderRadius: '50%' }} />
//         <div>
//           <h2>{name}</h2>
//           <p>Gender: {gender}</p>
//           <p>Allergy: {allergy}</p>
//           <p>Condition: {condition}</p>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default Card;



import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Card = ({ name, gender, allergy, condition, id }) => {
  const [imgSrc, setImgSrc] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
  // Replace with this:
const imageMap = {
  'amira singh': 'amira-singh',
  'carlos mendoza': 'Carlos-Mendoza',
  'deangelo howe': 'deangelo-howe',
  'elena petrova': 'Elena-Petrova',
  'kwame boateng': 'Kwame-Boateng',
  'linh tran': 'Linh-Tran',
  'mia leanne banks': 'mia-leanne-banks',
  'noah johnson': 'Noah-Johnson',
  'ravi patel': 'Ravi-Patel',
  'yasmin farah': 'Yasmin-Farah'
};
const mappedName = imageMap[name.toLowerCase()];
const localImagePath = mappedName 
? `${process.env.PUBLIC_URL}/images/${mappedName}.png`
: null;
  
  const img = new Image();
  img.onload = () => {
    setImgSrc(localImagePath);
    setImageError(false);
  };
  img.onerror = () => {
    const fallbackSrc = `https://randomuser.me/api/portraits/${
      gender?.toString().toLowerCase() === 'male' || gender?.toString().toLowerCase() === 'm' ? 'men' : 'women'
    }/${id % 100}.png`;
    setImgSrc(fallbackSrc);
    setImageError(true);
  };
  img.src = localImagePath;
}, [name, gender, id]);

  

  return (
    <Link to={`/patient/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="tc grow bg-light-green br3 pa3 ma2 dib bw2 shadow-5">
        {imgSrc && (
          <img 
            alt={`${name} profile`} 
            src={imgSrc} 
            style={{ 
              borderRadius: '50%', 
              width: '120px', 
              height: '120px',
              objectFit: 'cover'
            }} 
          />
        )}
        <div>
          <h2>{name}</h2>
          <p>Gender: {gender}</p>
          <p>Allergy: {allergy}</p>
          <p>Condition: {condition}</p>
          {imageError && <p className="f7 gray">⚠️ Default profile image</p>}
        </div>
      </div>
    </Link>
  );
};

export default Card;


