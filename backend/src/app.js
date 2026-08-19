const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);

// Routes
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/colleges');
const studentRoutes = require('./routes/students');
const placementRoutes = require('./routes/placements');
const companyRoutes = require('./routes/companies');
const predictionRoutes = require('./routes/predictions');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log('Server running on port ' + PORT);
  console.log('API URL: http://localhost:' + PORT + '/api');
  console.log('AI Service URL: http://localhost:' + PORT + '/api/ai');
  
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('Make sure PostgreSQL is running and database exists');
  }
});

module.exports = app;
