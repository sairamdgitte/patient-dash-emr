import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

const PatientDetail = ({ patients }) => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState('');

  // Hardcoded phone numbers for demo
  const PATIENT_PHONE = "61490192036";
  const HOST_PHONE = "61414005070";

  // Webhook URLs
  const INSTANT_CONNECT_WEBHOOK = "https://hooks.au.webexconnect.io/events/G3M7VZ5STN";
  const AI_SUMMARY_WEBHOOK = "https://hooks.au.webexconnect.io/events/LHLVF8UJTQ";

  // Convert the string ID to a number
  const patientId = parseInt(id, 10);

  // Find the patient with numeric ID
  const patient = patients.find(p => p.id === patientId);


  // Helper functions
  const getMedicationStatus = (medication) => {
    if (medication.includes('active-')) return { status: 'Active', color: 'green' };
    if (medication.includes('completed-')) return { status: 'Completed', color: 'blue' };
    if (medication.includes('previous-use-')) return { status: 'Previous', color: 'gray' };
    return { status: 'Unknown', color: 'yellow' };
  };

  const getConditionSeverity = (condition) => {
    const severeConditions = ['coronary-syndrome', 'lymphoma', 'bipolar'];
    const moderateConditions = ['fever', 'aci'];
    if (severeConditions.includes(condition)) return { severity: 'Severe', color: 'red' };
    if (moderateConditions.includes(condition)) return { severity: 'Moderate', color: 'orange' };
    return { severity: 'Mild', color: 'green' };
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // ============================================
  // WEBHOOK 1: Webex Instant Connect
  // ============================================
  const initiateInstantConnect = async () => {
    setIsInitiatingCall(true);
    setShowCallModal(true);
    setCallStatus('Initiating Webex Instant Connect...');

    try {
      await fetch(INSTANT_CONNECT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patient.name,
          patientMobile: PATIENT_PHONE,
          hostMobile: HOST_PHONE
        })
      });
      setCallStatus('Webex Instant Connect initiated successfully! Both parties will receive a connection request shortly.');
    } catch (error) {
      console.error('Error initiating Instant Connect:', error);
      setCallStatus('Failed to initiate Webex Instant Connect. Please try again.');
    } finally {
      setIsInitiatingCall(false);
    }
  };

  // ============================================
  // AI Summary Generation (using InferenceClient)
  // ============================================
  const generatePatientSummary = async () => {
    setIsGeneratingSummary(true);
    setShowAiSummary(true);

    try {
      const prompt = `
        Please provide a concise medical summary for this patient:
        
        Patient: ${patient.name}
        Gender: ${patient.Gender}
        Age: ${age} years
        Date of Birth: ${patient['D.O.B']}
        
        Medical Conditions: ${patient.conditions?.join(', ') || 'None'}
        Allergies: ${patient.allergies?.join(', ') || 'None known'}
        Current Medications: ${patient.medications?.filter(med => med.includes('active-')).map(med => med.replace('active-', '')).join(', ') || 'None'}
        Previous Medications: ${patient.medications?.filter(med => med.includes('completed-') || med.includes('previous-use-')).map(med => med.replace(/(completed-|previous-use-)/, '')).join(', ') || 'None'}
        
        Recent Clinical Observations: 
        ${patient.observations?.slice(0, 10).map(obs => 
          `- ${obs.type}: ${obs.value} ${obs.unit} (Reference: ${obs.reference_range}) on ${obs.date}`
        ).join('\n') || 'None available'}
        
        Please provide a 3-4 sentence clinical summary focusing on:
        1. Key health status and risk factors
        2. Notable observations or trends
        3. Potential areas for clinical attention
        4. Overall health assessment
        
        Keep it professional and concise for medical practitioners.
      `;

      const response = await fetch(
        "https://sairam17-patient-summary-api.hf.space/gradio_api/call/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: [prompt] })
        }
      );
      const { event_id } = await response.json();

      const resultResponse = await fetch(
        `https://sairam17-patient-summary-api.hf.space/gradio_api/call/predict/${event_id}`
      );
      const text = await resultResponse.text();
      const lines = text.split('\n').filter(l => l.startsWith('data:'));
      const lastData = JSON.parse(lines[lines.length - 1].replace('data: ', ''));
      setAiSummary(lastData[0]);
      
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setAiSummary("Unable to generate AI summary at this time.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Generate timeline from existing data
  const timelineData = useMemo(() => {
    if (!patient) return [];

    const timeline = [];

    if (patient.observations) {
      patient.observations.forEach(obs => {
        timeline.push({
          date: obs.date,
          type: 'observation',
          observation: `${obs.type}: ${obs.value} ${obs.unit}`,
          medication: obs.medication_context,
          description: `Recorded ${obs.type} measurement`
        });
      });
    }

    if (patient.medications) {
      patient.medications.forEach(med => {
        const { status } = getMedicationStatus(med);
        const medName = med.replace(/(active-|completed-|previous-use-)/, '');
        timeline.push({
          date: patient.observations?.[0]?.date || patient['D.O.B'] || '2020-01-01',
          type: 'medication',
          medication: med,
          description: `${status} medication: ${medName}`,
          status: status
        });
      });
    }

    if (patient.conditions) {
      patient.conditions.forEach(condition => {
        const { severity } = getConditionSeverity(condition);
        timeline.push({
          date: patient.observations?.[0]?.date || patient['D.O.B'] || '2020-01-01',
          type: 'condition',
          condition: condition,
          description: `Diagnosed with ${condition.toUpperCase()} (${severity})`,
          severity: severity
        });
      });
    }

    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [patient]);

  if (!patient) {
    return (
      <div className="tc pa4">
        <h2>Patient not found: {id}</h2>
        <Link to="/" className="back-button-premium">← Back to Dashboard</Link>
      </div>
    );
  }

  // Image mapping for correct case-sensitive filenames
  const imageMap = {
    'amira singh': 'amira-singh',
    'carlos mendoza': 'Carlos-Mendoza',
    'elena petrova': 'Elena-Petrova',
    'kwame boateng': 'Kwame-Boateng',
    'linh tran': 'Linh-Tran',
    'noah johnson': 'Noah-Johnson',
    'ravi patel': 'Ravi-Patel',
    'yasmin farah': 'Yasmin-Farah'
  };
  const mappedName = imageMap[patient.name.toLowerCase()];
  const imgSrc = mappedName
    ? `${process.env.PUBLIC_URL}/images/${mappedName}.png`
    : `https://randomuser.me/api/portraits/${patient.Gender === 'Male' ? 'men' : 'women'}/${patient.id % 100}.png`;

  const age = patient['D.O.B'] ? calculateAge(patient['D.O.B']) : 'Unknown';

  return (
    <div className="patient-detail-container pa4">
      <Link to="/" className="back-button-premium">
        ← Back to Dashboard
      </Link>

      {/* Premium Patient Header */}
      <div className="patient-header-premium flex items-center">
        <img
          alt="profile"
          src={imgSrc}
          className="patient-avatar mr4"
        />
        <div className="flex-auto">
          <h1 className="patient-name-premium">{patient.name}</h1>
          <div className="patient-meta-premium">
            <div className="meta-item">
              <strong>Gender:</strong> {patient.Gender} {patient.Gender === 'Male' ? '👨' : patient.Gender === 'Female' ? '👩' : '⚧'}
            </div>
            <div className="meta-item">
              <strong>Age:</strong> {age} years
            </div>
            <div className="meta-item">
              <strong>Date of Birth:</strong> {patient['D.O.B']}
            </div>
            <div className="meta-item">
              <strong>Patient ID:</strong> {patient.id}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={initiateInstantConnect}
            disabled={isInitiatingCall}
            className="ai-summary-button"
            style={{
              background: 'linear-gradient(135deg, #00bceb, #0076d5)',
              position: 'relative',
              zIndex: 10
            }}
          >
            {isInitiatingCall ? '🔄 Connecting...' : '📞 Instant Connect'}
          </button>

          <button
            onClick={generatePatientSummary}
            disabled={isGeneratingSummary}
            className="ai-summary-button"
            style={{
              position: 'relative',
              zIndex: 10
            }}
          >
            {isGeneratingSummary ? '🔄 Generating...' : '🤖 AI Summary'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{patient.allergies?.length || 0}</div>
          <div className="stat-label">Allergies</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{patient.conditions?.length || 0}</div>
          <div className="stat-label">Conditions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{patient.medications?.length || 0}</div>
          <div className="stat-label">Medications</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{patient.observations?.length || 0}</div>
          <div className="stat-label">Observations</div>
        </div>
      </div>

      {/* Premium Tabs */}
      <div className="premium-tabs">
        {['overview', 'medications', 'observations', 'timeline'].map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid-2col">
            {/* Allergies Card */}
            <div className="premium-card">
              <h3 className="f3 mb3 flex items-center">
                <span className="mr2">⚠️</span> Allergies
              </h3>
              {patient.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, index) => (
                    <div key={index} className={`status-badge ${
                      allergy === 'noneknown' ? 'badge-mild' : 'badge-severe'
                    }`}>
                      {allergy === 'noneknown' ? 'No Known Allergies' : allergy}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="i gray">No allergy data available</p>
              )}
            </div>

            {/* Conditions Card */}
            <div className="premium-card">
              <h3 className="f3 mb3 flex items-center">
                <span className="mr2">🏥</span> Medical Conditions
              </h3>
              {patient.conditions?.length > 0 ? (
                <div className="space-y-2">
                  {patient.conditions.map((condition, index) => {
                    const { severity } = getConditionSeverity(condition);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{condition.toUpperCase()}</span>
                        <span className={`status-badge ${
                          severity === 'Severe' ? 'badge-severe' :
                          severity === 'Moderate' ? 'badge-moderate' : 'badge-mild'
                        }`}>
                          {severity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="i gray">No condition data available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="premium-card">
            <h3 className="f3 mb3 flex items-center">
              <span className="mr2">💊</span> Medications
            </h3>
            {patient.medications?.length > 0 ? (
              <div className="grid-3col">
                {patient.medications.map((medication, index) => {
                  const { status } = getMedicationStatus(medication);
                  const medName = medication.replace(/(active-|completed-|previous-use-)/, '');
                  return (
                    <div key={index} className="premium-card">
                      <div className="flex justify-between items-center mb-2">
                        <strong className="f5">{medName}</strong>
                        <span className={`status-badge ${
                          status === 'Active' ? 'badge-active' :
                          status === 'Completed' ? 'badge-completed' : 'badge-previous'
                        }`}>
                          {status}
                        </span>
                      </div>
                      <div className="f6 text-gray-600">
                        {status === 'Active' && '🟢 Currently taking'}
                        {status === 'Completed' && '🔵 Treatment completed'}
                        {status === 'Previous' && '⚪ Previously used'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="i gray">No medication data available</p>
            )}
          </div>
        )}

        {activeTab === 'observations' && (
          <div className="premium-card">
            <h3 className="f3 mb3 flex items-center">
              <span className="mr2">🔬</span> Clinical Observations
            </h3>
            {patient.observations?.length > 0 ? (
              <div className="grid-3col">
                {patient.observations.map((observation, index) => (
                  <div key={index} className="premium-card text-center">
                    <div className="f6 text-gray-600 mb-1">{observation.type}</div>
                    <div className="f4 font-bold mb-2 text-gray-800">
                      {observation.value} {observation.unit}
                    </div>
                    <div className="f7 text-gray-500 mb-1">
                      Ref: {observation.reference_range}
                    </div>
                    <div className="f7 text-gray-500">
                      Date: {observation.date}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="i gray">No observation data available</p>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="premium-card">
            <h3 className="f3 mb3 flex items-center">
              <span className="mr2">📅</span> Medical Timeline
            </h3>
            {timelineData.length > 0 ? (
              <div className="timeline">
                {timelineData.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className={`timeline-dot ${event.type}`}></div>
                    <div className={`timeline-content ${event.type}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="f5 font-bold">{event.date}</div>
                        <div className={`status-badge ${
                          event.type === 'observation' ? 'badge-active' :
                          event.type === 'medication' ? 'badge-completed' : 'badge-moderate'
                        }`}>
                          {event.type.toUpperCase()}
                        </div>
                      </div>
                      <div className="f5 mb-2">{event.description}</div>
                      <div className="flex flex-wrap gap-2 f6 text-gray-600">
                        {event.observation && <span>🩺 {event.observation}</span>}
                        {event.medication && <span>💊 {event.medication.replace(/(active-|completed-|previous-use-)/, '')}</span>}
                        {event.condition && <span>🏥 {event.condition.toUpperCase()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="i gray">No timeline data available</p>
            )}
          </div>
        )}
      </div>

      {/* Instant Connect Modal */}
      {showCallModal && (
        <div className="ai-modal-overlay">
          <div className="ai-modal">
            <div className="flex justify-between items-center mb-4">
              <h3 className="f3 ma0">📞 Webex Instant Connect</h3>
              <button
                onClick={() => setShowCallModal(false)}
                className="f4 bn bg-transparent gray pointer"
              >
                ×
              </button>
            </div>
            {isInitiatingCall ? (
              <div className="tc pv4">
                <div className="f4 mb3">Initiating secure connection...</div>
                <div className="spinner"></div>
                <div className="f6 gray mt3">Connecting patient and provider</div>
              </div>
            ) : (
              <div>
                <div className="f5 lh-copy mb3 pa3 br3" style={{ background: '#f0fdf4' }}>
                  {callStatus}
                </div>
                <div className="f6 gray mb3">
                  <div className="mb2"><strong>Patient:</strong> {patient.name}</div>
                  <div className="mb2"><strong>Patient Phone:</strong> {PATIENT_PHONE}</div>
                  <div className="mb2"><strong>Host Phone:</strong> {HOST_PHONE}</div>
                </div>
                <button
                  onClick={() => setShowCallModal(false)}
                  className="ai-summary-button"
                  style={{ width: '100%', background: 'linear-gradient(135deg, #00bceb, #0076d5)' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Summary Modal with Close + Send to Patient buttons */}
      {showAiSummary && (
        <div className="ai-modal-overlay">
          <div className="ai-modal">
            <div className="flex justify-between items-center mb-4">
              <h3 className="f3 ma0">🤖 AI Patient Summary</h3>
              <button
                onClick={() => setShowAiSummary(false)}
                className="f4 bn bg-transparent gray pointer"
              >
                ×
              </button>
            </div>
            {isGeneratingSummary ? (
              <div className="tc pv4">
                <div className="f4 mb3">Generating AI summary...</div>
                <div className="spinner"></div>
                <div className="f6 gray mt3">This may take a few moments</div>
              </div>
            ) : (
              <div>
                <div className="f5 lh-copy mb4" style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  {aiSummary}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setShowAiSummary(false)}
                    className="ai-summary-button"
                    style={{ flex: 1, background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await fetch(AI_SUMMARY_WEBHOOK, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            patientName: patient.name,
                            patientMobile: PATIENT_PHONE,
                            patientSummary: aiSummary
                          })
                        });
                        alert('Summary sent to patient successfully!');
                      } catch (err) {
                        console.error('Failed to send summary:', err);
                        alert('Failed to send summary. Please try again.');
                      }
                    }}
                    className="ai-summary-button"
                    style={{ flex: 1, background: 'linear-gradient(135deg, #00bceb, #0076d5)' }}
                  >
                    📩 Send to Patient
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
