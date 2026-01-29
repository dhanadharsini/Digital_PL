import axios from 'axios';

const testLogin = async () => {
  try {
    console.log('Testing admin login...');
    console.log('URL: http://localhost:5000/api/auth/login');
    console.log('');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@hostel.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Login Successful!');
    console.log('');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
  } catch (error) {
    console.error('❌ Login Failed!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Full error:', error.response?.data);
  }
};

testLogin();