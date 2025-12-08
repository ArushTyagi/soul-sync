import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';  // Correct import
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  return (
    <div className="App">
      <header style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>📖 My Daily Diary</h1>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>
          Write your thoughts, save your memories
        </p>
        
        {isLoggedIn && (
          <button 
            onClick={handleLogout}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '5px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px'
            }}
          >
            Logout
          </button>
        )}
      </header>

      <main style={{ minHeight: '80vh' }}>
        {!isLoggedIn ? (
          <>
            <nav style={{ textAlign: 'center', padding: '20px' }}>
              <button 
                onClick={() => setCurrentPage('login')}
                style={{ 
                  margin: '0 10px', 
                  padding: '10px 20px',
                  backgroundColor: currentPage === 'login' ? '#007bff' : '#f8f9fa',
                  color: currentPage === 'login' ? 'white' : 'black',
                  border: '1px solid #dee2e6',
                  borderRadius: '5px'
                }}
              >
                Login
              </button>
              <button 
                onClick={() => setCurrentPage('register')}
                style={{ 
                  margin: '0 10px', 
                  padding: '10px 20px',
                  backgroundColor: currentPage === 'register' ? '#28a745' : '#f8f9fa', 
                  color: currentPage === 'register' ? 'white' : 'black',
                  border: '1px solid #dee2e6',
                  borderRadius: '5px'
                }}
              >
                Register
              </button>
            </nav>

            {currentPage === 'login' && <Login onLogin={handleLoginSuccess} />}
            {currentPage === 'register' && <Register onLogin={handleLoginSuccess} />}
          </>
        ) : (
          <Dashboard />  // This should render without errors
        )}
      </main>
    </div>
  );
}

export default App;
