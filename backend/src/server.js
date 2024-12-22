const app = require('./app');
const connectDB = require('./db');

const dotenv = require('dotenv');
dotenv.config({
  path: './.env'
});

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
