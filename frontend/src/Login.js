import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🔐 Attempting login...');
      
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email: email,
        password: password
      });
      
      console.log('✅ Login response:', response.data);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('🔑 Token stored in localStorage:', response.data.token.substring(0, 20) + '...');
      } else {
        console.log('❌ No token in response');
      }
      
      setMessage('✅ Login successful!');
      setLoginSuccess(true);
      
    } catch (error) {
      console.log('❌ Login error:', error);
      setMessage('❌ Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const goToDashboard = () => {
    console.log('🚀 Redirecting to dashboard...');
    console.log('Current token:', localStorage.getItem('token'));
    onLogin();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>📝 Diary App - Login</h2>
      
      {/* Debug Info */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '5px',
        marginBottom: '20px',
        fontSize: '12px'
      }}>
        <strong>Debug:</strong> Token in storage: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}
      </div>
      
      {!loginSuccess ? (
        <form onSubmit={handleLogin}>
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
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none' 
            }}
          >
            Login
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
            <h3>✅ Login Successful!</h3>
            <p>Token stored: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
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
      
      {message && !loginSuccess && (
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

export default Login;