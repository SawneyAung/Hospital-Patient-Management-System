const users = [
    { username: 'admin', password: 'adminpass', role: 'admin' },
    { username: 'drjohn', password: 'johnpass', role: 'doctor' }
  ];
  
  const appointments = [
    { id: 1, patientName: 'John Doe', time: '10:30 AM', doctorName: 'Dr. Smith', reason: 'General Checkup', imageUrl: 'https://via.placeholder.com/60' },
    { id: 2, patientName: 'Jane Roe', time: '11:00 AM', doctorName: 'Dr. Adams', reason: 'Follow-up Visit', imageUrl: 'https://via.placeholder.com/60' },
    { id: 3, patientName: 'Alice Green', time: '11:45 AM', doctorName: 'Dr. Young', reason: 'Consultation', imageUrl: 'https://via.placeholder.com/60' }
  ];
  
  module.exports = { users, appointments };