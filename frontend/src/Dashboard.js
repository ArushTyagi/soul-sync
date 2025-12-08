import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  // Get token from localStorage with validation
  const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('🔑 Retrieved token:', token ? `Present (${token.length} chars)` : 'MISSING');
    
    if (!token) {
      setMessage('❌ Please login again - no token found');
      return null;
    }
    
    return token;
  };

  // Load diary entries
  const loadEntries = async () => {
    const token = getToken();
    if (!token) return;

    try {
      console.log('📖 Loading diary entries with token...');
      console.log('Token first 20 chars:', token.substring(0, 20));
      
      const response = await axios.get('http://localhost:5001/api/diary', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Entries loaded successfully:', response.data.entries.length, 'entries');
      setEntries(response.data.entries);
      setMessage('');
    } catch (error) {
      console.log('❌ Error loading entries:', error);
      
      let errorMsg = 'Failed to load entries';
      
      if (error.response) {
        errorMsg += ` - Server: ${error.response.status} ${error.response.data?.message || ''}`;
        console.log('Server error details:', error.response.data);
        
        // If unauthorized, clear token and suggest relogin
        if (error.response.status === 401) {
          errorMsg += ' - Token invalid. Please login again.';
          localStorage.removeItem('token');
        }
      } else if (error.request) {
        errorMsg += ' - No response from server';
      } else {
        errorMsg += ` - ${error.message}`;
      }
      
      setMessage(errorMsg);
    }
  };

  useEffect(() => {
    console.log('🏠 Dashboard mounted, loading entries...');
    loadEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      console.log('💾 Attempting to save entry...');
      
      let response;
      if (editingEntry) {
        response = await axios.put(
          `http://localhost:5001/api/diary/${editingEntry._id}`,
          { title, content },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setMessage('✅ Entry updated successfully!');
      } else {
        response = await axios.post(
          'http://localhost:5001/api/diary',
          { title, content },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setMessage('✅ Entry saved successfully!');
      }

      console.log('✅ Save successful:', response.data);
      resetForm();
      loadEntries();
      
    } catch (error) {
      console.log('❌ Error saving entry:', error);
      let errorMsg = 'Failed to save entry';
      
      if (error.response) {
        errorMsg += ` - ${error.response.data?.message || error.response.status}`;
      }
      
      setMessage(errorMsg);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setShowForm(true);
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const token = getToken();
      if (!token) return;
      
      try {
        await axios.delete(`http://localhost:5001/api/diary/${entryId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setMessage('✅ Entry deleted successfully!');
        loadEntries();
      } catch (error) {
        setMessage('❌ Failed to delete entry');
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📖 My Diary</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Logout
        </button>
      </div>

      {/* Debug Info */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '5px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <strong>Debug Info:</strong><br/>
        • Token: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}<br/>
        • Entries Loaded: {entries.length}<br/>
        • API: http://localhost:5001/api/diary
      </div>

      {/* Rest of your Dashboard UI remains the same */}
      <button 
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginBottom: '20px'
        }}
      >
        {showForm ? 'Cancel' : '+ Add New Entry'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          marginBottom: '20px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>{editingEntry ? 'Edit Entry' : 'Write New Entry'}</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Entry Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <textarea
              placeholder="What's on your mind today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                fontSize: '16px',
                height: '150px',
                resize: 'vertical'
              }}
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              {editingEntry ? 'Update Entry' : 'Save Entry'}
            </button>
            
            {editingEntry && (
              <button 
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px'
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {message && (
        <div style={{
          padding: '10px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      <div>
        <h2>Your Diary Entries</h2>
        
        {entries.length === 0 ? (
          <p>No entries yet. Write your first diary entry!</p>
        ) : (
          entries.map(entry => (
            <div key={entry._id} style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              marginBottom: '15px',
              backgroundColor: 'white',
              position: 'relative'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {entry.title}
              </h3>
              <p style={{ 
                margin: '0 0 10px 0', 
                color: '#666',
                whiteSpace: 'pre-wrap'
              }}>
                {entry.content}
              </p>
              <small style={{ color: '#999' }}>
                {new Date(entry.createdAt).toLocaleDateString()} • 
                {new Date(entry.createdAt).toLocaleTimeString()}
              </small>
              
              <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                <button 
                  onClick={() => handleEdit(entry)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '3px',
                    marginRight: '5px',
                    fontSize: '12px'
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(entry._id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;