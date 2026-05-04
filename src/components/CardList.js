// import React from 'react';
// import Card from './Card';

// const CardList = ({ robots }) => {
//   return (
//     <div>
//       {
//         robots.map((user, i) => {
//           return (
//             <Card
//               key={i}
//               id={robots[i].id}
//               name={"Name: " + robots[i].name}
//               gender={"Gender: " + robots[i].Gender}
//               allergy={"Allergy: " + robots[i].Allergy}
//               condition={"Condition: " + robots[i].Condition}
//               />
//           );
//         })
//       }
//     </div>
//   );
// }



// const CardList = ({ robots }) => {
//   return (
//     <div>
//       {robots.map((user, i) => {
//         return (
//           <Card
//             key={i}
//             id={user.id}
//             name={user.name}
//             gender={user.Gender}
//             allergy={user.allergy || 'No data'}
//             condition={user.condition || 'No data'}
//           />
//         );
//       })}
//     </div>
//   );
// };

// export default CardList;


// import React from 'react';
// import Card from './Card';

// const CardList = ({ patients }) => {
//   return (
//     <div>
//       {patients.map((patient) => {
//         return (
//           <Card
//             key={patient.id}
//             id={patient.id}
//             name={patient.name}
//             gender={patient.Gender}
//             allergy={patient.allergies && patient.allergies.length > 0 ? patient.allergies[0] : 'No data'}
//             condition={patient.conditions && patient.conditions.length > 0 ? patient.conditions[0] : 'No data'}
//           />
//         );
//       })}
//     </div>
//   );
// };

// export default CardList;


// CardList.js
import React from 'react';
import Card from './Card';

const CardList = ({ patients }) => {
  // Remove duplicates based on patient id
  const uniquePatients = patients.filter((patient, index, self) => 
    index === self.findIndex(p => p.id === patient.id)
  );

  console.log(`CardList: ${patients.length} total, ${uniquePatients.length} unique`);

  return (
    <div>
      {uniquePatients.map((patient) => {
        return (
          <Card
            key={patient.id}
            id={patient.id}
            name={patient.name}
            gender={patient.Gender || patient.gender} // Handle both cases
            allergy={patient.allergies && patient.allergies.length > 0 ? patient.allergies[0] : 'No data'}
            condition={patient.conditions && patient.conditions.length > 0 ? patient.conditions[0] : 'No data'}
          />
        );
      })}
    </div>
  );
};

export default CardList;