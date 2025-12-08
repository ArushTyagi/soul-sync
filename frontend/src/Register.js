import React, { useState } from 'react';
import axios from 'axios';

function Register({ onLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        username: username,
        email: email,
        password: password
      });
      
      setMessage('✅ Registration successful!');
      setRegisterSuccess(true);
      console.log('Server response:', response.data);
      
    } catch (error) {
      setMessage('❌ Registration failed: ' + error.message);
      console.log('Error:', error);
    }
  };

  const goToDashboard = () => {
    onLogin(); // This will redirect to dashboard
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>📝 Diary App - Register</h2>
      
      {!registerSuccess ? (
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          
          <button 
            type="submit"
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none' 
            }}
          >
            Register
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <h3>✅ Registration Successful!</h3>
            <p>Your account has been created.</p>
          </div>
          
          <button 
            onClick={goToDashboard}
            style={{ 
              padding: '12px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          >
            🚀 Go to My Diary
          </button>
        </div>
      )}
      
      {message && !registerSuccess && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default Register;