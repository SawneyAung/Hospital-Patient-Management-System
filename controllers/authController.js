const { users } = require('../data/dummyDatabase');

const handleLogin = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return res.render('login', { error: 'Invalid username or password' });

  if (user.role === 'admin') return res.redirect('/admin/dashboard');
  if (user.role === 'doctor') return res.redirect('/doctor/dashboard');
  return res.render('login', { error: 'Unknown user role' });
};

module.exports = { handleLogin };
