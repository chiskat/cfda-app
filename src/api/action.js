import axios from 'axios';

const login = async (loginData) => {
  return await axios.post('/login', loginData);
}

const logout = async () => {
  return await axios.post('/logout')
}

const auth = async () => {
  return await axios.get('/auth');
}

export {
  login,
  logout,
  auth
};