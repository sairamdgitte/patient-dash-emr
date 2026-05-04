// import React, { Component } from 'react';
// import CardList from '../components/CardList';
// import SearchBox from '../components/SearchBox';
// import Scroll from '../components/Scroll';
// import './App.css'; 


// class App extends Component {
//   constructor() {
//     super()
//     this.state = {
//       robots: [],
//       searchfield: ''
//     }
//   }

//   componentDidMount() {
//     fetch('https://sairamdgitte.github.io/Patient-Dash-Build/patient.json')
//       .then(response=> response.json())
//       .then(users => {this.setState({ robots: users})});
//   }

//   onSearchChange = (event) => {
//     this.setState({ searchfield: event.target.value })
//   }

//   render() {
//     const { robots, searchfield } = this.state;
//     const filteredRobots = robots.filter(robot =>{
//       return robot.name.toLowerCase().includes(searchfield.toLowerCase());
//     })
//     return !robots.length ?
//       <h1>Loading</h1> :
//       (
//         <div className='tc'>
//           <h1 className='f1'>Patient Dashboard</h1>
//           <SearchBox searchChange={this.onSearchChange}/>
//           <Scroll>
//             <CardList robots={filteredRobots} />
//           </Scroll>
//         </div>
//       );
//   }
// }

// export default App;


// import React, { Component } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import CardList from '../components/CardList';
// import SearchBox from '../components/SearchBox';
// import Scroll from '../components/Scroll';
// import PatientDetail from '../components/PatientDetail';
// import './App.css';

// class App extends Component {
//   constructor() {
//     super()
//     this.state = {
//       robots: [],
//       searchfield: ''
//     }
//   }

//   componentDidMount() {
//     fetch('https://sairamdgitte.github.io/Patient-Dash-Build/patient.json')
//       .then(response => response.json())
//       .then(users => { this.setState({ robots: users }) });
//   }

//   onSearchChange = (event) => {
//     this.setState({ searchfield: event.target.value })
//   }

//   render() {
//     const { robots, searchfield } = this.state;
//     const filteredRobots = robots.filter(robot => {
//       return robot.name.toLowerCase().includes(searchfield.toLowerCase());
//     })

//     return (
//       <Router>
//         <div className='tc'>
//           <Routes>
//             <Route 
//               path="/" 
//               element={
//                 !robots.length ? 
//                 <h1>Loading</h1> : 
//                 (
//                   <>
//                     <h1 className='f1'>Patient Dashboard</h1>
//                     <SearchBox searchChange={this.onSearchChange} />
//                     <Scroll>
//                       <CardList robots={filteredRobots} />
//                     </Scroll>
//                   </>
//                 )
//               } 
//             />
//             <Route path="/patient/:id" element={<PatientDetail patients={robots} />} />
//           </Routes>
//         </div>
//       </Router>
//     );
//   }
// }

// export default App;


// import React, { Component } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import CardList from '../components/CardList';
// import SearchBox from '../components/SearchBox';
// import Scroll from '../components/Scroll';
// import PatientDetail from '../components/PatientDetail';
// import './App.css';

// class App extends Component {
//   constructor() {
//     super()
//     this.state = {
//       patients: [],  // Changed from robots to patients
//       searchfield: ''
//     }
//   }

//   componentDidMount() {
//   console.log('🔄 Attempting to load enhanced_data.json from public folder...');
  
//   // fetch('Patient-Dash-Build/enhanced_patients.json')
//   fetch('https://sairamdgitte.github.io/Patient-Dash-Build/enhanced_patients.json')
//     .then(response => {
//       console.log('📡 Response status:', response.status);
//       console.log('📡 Response ok:', response.ok);
//       console.log('📡 Response URL:', response.url);
      
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
//       return response.json();
//     })
//     .then(patients => { 
//       console.log('✅ SUCCESS: Loaded enhanced_patients.json');
//       console.log('📊 Patients loaded:', patients.length);
//       console.log('👥 Patient names:', patients.map(p => p.name || p.full_name_for_matching || 'No name'));
      
//       const uniquePatients = [...new Map(patients.map(patient => [patient.id || patient.patient_id, patient])).values()];
//       console.log('🎯 After deduplication:', uniquePatients.length, 'unique patients');
      
//       this.setState({ patients: uniquePatients });
//     })
//     .catch(error => {
//       console.error('❌ FAILED to load enhanced_patients.json:', error);
//       console.log('🔄 Falling back to external data...');
      
//       fetch('https://sairamdgitte.github.io/Patient-Dash-Build/patient.json')
//       // fetch('/patient.json')
//         .then(response => response.json())
//         .then(users => {
//           console.log('📋 Loaded fallback data with', users.length, 'patients');
//           console.log('👥 Fallback patient names:', users.map(u => u.name).slice(0, 5));
          
//           const uniqueUsers = [...new Map(users.map(user => [user.id, user])).values()];
//           this.setState({ patients: uniqueUsers });
//         });
//     });
// }

//   onSearchChange = (event) => {
//     this.setState({ searchfield: event.target.value })
//   }

//   render() {
//     const { patients, searchfield } = this.state;
//     const filteredPatients = patients.filter(patient => {
//       return patient.name.toLowerCase().includes(searchfield.toLowerCase());
//     })

//     return (
//       <Router basename="/Patient-Dash-Build">
//         <div className='tc'>
//           <Routes>
//             <Route 
//               path="/" 
//               element={
//                 !patients.length ? 
//                 <h1>Loading</h1> : 
//                 (
//                   <>
//                     <h1 className='f1'>Patient Dashboard</h1>
//                     <SearchBox searchChange={this.onSearchChange} />
//                     <Scroll>
//                       <CardList patients={filteredPatients} />
//                     </Scroll>
//                   </>
//                 )
//               } 
//             />
//             <Route path="/patient/:id" element={<PatientDetail patients={patients} />} />
//           </Routes>
//         </div>
//       </Router>
//     );
//   }
// }

// export default App;


import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CardList from '../components/CardList';
import SearchBox from '../components/SearchBox';
import Scroll from '../components/Scroll';
import PatientDetail from '../components/PatientDetail';
import './App.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      patients: [],
      searchfield: ''
    }
  }

  componentDidMount() {
    const imageNames = [
      'amira-singh',
      'Carlos-Mendoza',
      'deangelo-howe',
      'Elena-Petrova',
      'Kwame-Boateng',
      'Linh-Tran',
      'mia-leanne-banks',
      'Noah-Johnson',
      'Ravi-Patel',
      'Yasmin-Farah'
    ];

    fetch(process.env.PUBLIC_URL + '/enhanced_patients.json')
      .then(response => response.json())
      .then(patients => {
        const patientsWithImages = patients.map(patient => {
          // Find the matching image filename by comparing names
          const imageName = imageNames.find(img =>
            img.replace(/-/g, ' ').toLowerCase() === patient.name.toLowerCase()
          );

          return {
            ...patient,
            image: imageName
              ? `${process.env.PUBLIC_URL}/images/${imageName}.png`
              : `${process.env.PUBLIC_URL}/images/default.png`
          };
        });

        this.setState({ patients: patientsWithImages });
      })
      .catch(error => {
        console.error('Failed to load enhanced_patients.json:', error);
      });
  }

  onSearchChange = (event) => {
    this.setState({ searchfield: event.target.value })
  }

  render() {
    const { patients, searchfield } = this.state;
    const filteredPatients = patients.filter(patient => {
      return patient.name.toLowerCase().includes(searchfield.toLowerCase());
    })

    return (
      <Router basename="/patient-dash-emr">
        <div className='tc'>
          <Routes>
            <Route
              path="/"
              element={
                !patients.length ?
                <h1>Loading</h1> :
                (
                  <>
                    <h1 className='f1'>Patient Dashboard</h1>
                    <SearchBox searchChange={this.onSearchChange} />
                    <Scroll>
                      <CardList patients={filteredPatients} />
                    </Scroll>
                  </>
                )
              }
            />
            <Route path="/patient/:id" element={<PatientDetail patients={patients} />} />
          </Routes>
        </div>
      </Router>
    );
  }
}

export default App;