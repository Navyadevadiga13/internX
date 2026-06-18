import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cron from 'node-cron';
import mongoSanitize from 'express-mongo-sanitize';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5006;

// CORS configuration for both localhost and internx.io
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5006',
    'https://internx.cc',
    'https://www.internx.cc',

  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(express.json());
app.use(mongoSanitize());
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Only expose company logos publicly
app.use(
  '/uploads/company-logos',
  express.static(join(__dirname, 'uploads', 'company-logos'))
);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Configure mongoose with better connection options
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create default admin after successful connection
    await createDefaultAdmin();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Running without database connection - some features may not work');
  }
};


// Email configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const applicationTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_APP,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// System Settings Schema
const systemSettingsSchema = new mongoose.Schema({
  maxApplicationsPerUser: { type: Number, default: 3 },
  emailNotifications: { type: Boolean, default: true },
  autoApproval: { type: Boolean, default: false },
  maintenanceMode: { type: Boolean, default: false },
  registrationEnabled: { type: Boolean, default: true },
  platformName: { type: String, default: 'InternX' },
  supportEmail: { type: String, default: 'support@internx.io' },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

// User Schema - Enhanced with study abroad option
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  currentCity: {type:String,required:true},
  pinCode: { type: String, required: true },
  futureGoals: String,
  studyPreference: { type: String, required: true, enum: ['India', 'Abroad', 'Both' , 'Work'], default: 'India' },
  section: String,
  higherEducation: String,
  twelfthPU: {
    institution: { type: String, required: false }, 
    passedYear: String,
    percentage: String
  },
  ugDegree: {
  institution: { type: String, required: false }, 
    course: String,
    year: String,
    percentage: String
  },
  pgMasters: {
    institution: String,
    course: String,
    year: String,
    percentage: String
  },
  skills: [String],
  keywords: [String],
  resume: String,
  resumeFilename: String,
  resumeContentType: String,
  profilePicture: String,
  profilePictureFilename: String,
  profilePictureContentType: String,
  applicationCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
currentAcademicStatus: {
  type: String,
  enum: ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Graduated'],
  default: 'Graduated'
}



}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  permissions: [{
    type: String,
    enum: ['users', 'jobs', 'applications', 'analytics', 'settings', 'all']
  }],
  lastLogin: Date
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  domain: { type: String, required: false },
  position: { type: String, required: true },
  salary: { type: String, required: true },
  type: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: false },
  requirements: [String],
  isActive: { type: Boolean, default: true },
  applicationCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  expiryDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  email: { type: String,required: true}
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

//globaljobs
const globalJobSchema = new mongoose.Schema({
  country_name: { type: String, required: true },
  company_name: { type: String, required: true },
   link: { type: String, required: true },
  continents: { type: String, required: true }, 
}, { timestamps: true });

const GlobalJob = mongoose.model('GlobalJob', globalJobSchema);


//company Schema
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  website: { type: String, required: true },
  email: { type: String, required: true ,unique:true},
  contact: { type: String, required: true },
  description: {type:String},
  linkedinUrl: { type: String },
  twitterUrl: { type: String },
  facebookUrl: { type: String },
  instagramUrl: { type: String },
  industry: { type: String },
  isVerified: { type: Boolean, default: false }, // not required, defaults to false
  logoUrl: { type: String ,required:true},
  size: { type: String },
  founded: { type: Number },
  password: { type: String, required: true },
  isDeactivated:{type:Boolean},
    deactivatedAt: { type: Date },
}, { timestamps: true });

const Company=mongoose.model('Company',companySchema);


// Application Schema
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Pending', 'sent', 'undelivered', 'application received', 'received', 'rejected', 'selected'],
    default: 'Pending'
  },
  coverLetter: String,
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  notes: String
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

// Excel File Schema
const excelFileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  jobsCreated: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

const ExcelFile = mongoose.model('ExcelFile', excelFileSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  otp: {
    type: String,
    required: true
  },

  expiresAt: {
    type: Date,
    required: true,
    expires: 0 // MongoDB TTL
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});
const OTP = mongoose.model('OTP', otpSchema);
// Password Reset OTP Schema
const passwordResetOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, default: Date.now, expires: 1500 } // 25 minutes
});

const PasswordResetOTP = mongoose.model('PasswordResetOTP', passwordResetOtpSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'excel') {
      if (file.mimetype.includes('spreadsheet') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
        cb(null, true);
      } else {
        cb(new Error('Only Excel files are allowed'), false);
      }
    } else {
      cb(null, true);
    }
  }
});


const companyLogoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = join(__dirname, 'uploads', 'company-logos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `company-logo-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only (JPG, JPEG, PNG, WEBP)
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.'), false);
  }
};

// Initialize multer for company logos
const uploadCompanyLogo = multer({
  storage: companyLogoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});




// Maintenance mode middleware
const checkMaintenanceMode = async (req, res, next) => {
  try {
    const settings = await SystemSettings.findOne();
    if (settings && settings.maintenanceMode) {
      // Allow admin routes during maintenance
      if (req.path.startsWith('/api/admin')) {
        return next();
      }
      return res.status(503).json({
        message: 'System is currently under maintenance. Please try again later.',
        maintenanceMode: true
      });
    }
    next();
  } catch (error) {
    next();
  }
};

// Registration check middleware
const checkRegistrationEnabled = async (req, res, next) => {
  try {
    const settings = await SystemSettings.findOne();
    if (settings && !settings.registrationEnabled && req.path === '/api/register') {
      return res.status(403).json({
        message: 'New user registration is currently disabled.',
        registrationDisabled: true
      });
    }
    next();
  } catch (error) {
    next();
  }
};

// Apply middleware
app.use(checkMaintenanceMode);
app.use(checkRegistrationEnabled);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

 jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

    if (err) {
     return res.status(403).json({
  message: 'Your session has expired. Please sign in again to continue.'
});
    }
    req.user = user;
    next();
  });
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.admin = user;
    next();
  });
};

// Middleware to authenticate company using JWT
const authenticateCompany = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET );

    if (decoded.type !== 'company') {
      return res.status(403).json({ message: 'Access denied. Company authentication required.' });
    }

    const company = await Company.findById(decoded.id).select('-password');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    req.company = company;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    const settings = await SystemSettings.findOne();
    if (!settings || !settings.emailNotifications) {
      console.log('Email notifications disabled');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create default admin and system settings
const createDefaultAdmin = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, skipping admin creation');
      return;
    }

    const adminExists = await Admin.findOne({
      username: process.env.DEFAULT_ADMIN_USERNAME
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD,
        10
      );

      await Admin.create({
        username: process.env.DEFAULT_ADMIN_USERNAME,
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        permissions: ['all']
      });

      console.log('Default admin created');
    }

    const settingsExists = await SystemSettings.findOne();

    if (!settingsExists) {
      await SystemSettings.create({
        maxApplicationsPerUser: 3,
        emailNotifications: true,
        autoApproval: false,
        maintenanceMode: false,
        registrationEnabled: true
      });

      console.log('Default system settings created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};


// Database connection wrapper for routes
const withDB = (handler) => {
  return async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not available. Please try again later.'
      });
    }
    return handler(req, res, next);
  };
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Get system settings (public)
app.get('/api/system-settings', withDB(async (req, res) => {
  try {
    const settings = await SystemSettings.findOne().select('maintenanceMode registrationEnabled platformName');
    res.json(settings || {
      maintenanceMode: false,
      registrationEnabled: true,
      platformName: 'InternX'
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ message: 'Failed to fetch system settings' });
  }
}));

// Send OTP for registration
app.post('/api/send-otp', withDB(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(200).json({
        message: 'If the request is valid, an OTP has been sent to the email address.'
      });
    }

    const safeEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: safeEmail });

    // If user already exists, return generic response
    if (existingUser) {
      return res.status(200).json({
        message: 'If the request is valid, an OTP has been sent to the email address.'
      });
    }

    const otp = generateOTP();

    // Save OTP
    await OTP.findOneAndUpdate(
      { email: safeEmail },
      {
        email: safeEmail,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    const emailHtml = `
      <div>
        <h2>Welcome to InternX!</h2>
        <p>Your OTP is <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: safeEmail,
      subject: 'InternX - Email Verification OTP',
      html: emailHtml
    });

    return res.status(200).json({
      message: 'If the request is valid, an OTP has been sent to the email address.'
    });

  } catch (error) {
    console.error('SEND OTP ERROR:', error);

    // Always return same response
    return res.status(200).json({
      message: 'If the request is valid, an OTP has been sent to the email address.'
    });
  }
}));

// Send Password Reset OTP
app.post('/api/forgot-password', withDB(async (req, res) => {
  try {
    const { email } = req.body;
if (typeof email !== 'string') {
  return res.status(400).json({
    message: 'Invalid email'
  });
}
const safeEmail = email.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({
  email: safeEmail
});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();

    // Save OTP to database
await PasswordResetOTP.findOneAndUpdate(
  { email: email.toLowerCase().trim() },
  {
    email: email.toLowerCase().trim(),
    otp: String(otp),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  },
  { upsert: true, new: true }
);

    // Send OTP email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>You have requested to reset your password. Your OTP is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #16a34a; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Team InternX</p>
      </div>
    `;

    await sendEmail(email, 'Password Reset OTP - InternX', emailHtml);

    res.json({ message: 'Password reset OTP sent successfully' });
  } catch (error) {
    console.error('Error sending reset OTP:', error);
    res.status(500).json({ message: 'Failed to send reset OTP' });
  }
}));

app.post('/api/verify-otp', withDB(async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (
  typeof email !== 'string' ||
  typeof otp !== 'string'
) {
  return res.status(400).json({
    message: 'Invalid input'
  });
}const safeEmail = email.toLowerCase().trim();
const safeOtp = otp.trim();

const otpRecord = await PasswordResetOTP.findOne({
  email: safeEmail
});

  

    if (!otpRecord) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "Expired OTP" });
    }


    if (String(otpRecord.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}));

// Verify Password Reset OTP and Reset Password
app.post('/api/reset-password', withDB(async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (
  typeof email !== 'string' ||
  typeof otp !== 'string' ||
  typeof newPassword !== 'string'
) {
  return res.status(400).json({
    message: 'Invalid input'
  });
}

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp   = String(otp).trim();

    // Verify OTP (normalize email/otp the same way forgot-password and verify-otp do)
    const otpRecord = await PasswordResetOTP.findOne({ email: normalizedEmail, otp: normalizedOtp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // FIX: findOne above only confirms a matching record exists — it never checked
    // expiry, so an expired OTP could still be used to reset the password. Check it now.
    if (new Date() > otpRecord.expiresAt) {
      await PasswordResetOTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    // Delete OTP after successful reset
    await PasswordResetOTP.deleteOne({ _id: otpRecord._id });

    // Send confirmation email
    const confirmationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Password Reset Successful</h2>
        <p>Dear ${user.name},</p>
        <p>Your password has been successfully reset. You can now log in with your new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
             style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login Now
          </a>
        </div>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>Team InternX</p>
      </div>
    `;

    await sendEmail(user.email, 'Password Reset Successful - InternX', confirmationEmailHtml);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
}));

app.post("/api/company_reset_password", authenticateCompany, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // validate
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // get company id from middleware (adapt if your middleware sets different key)
    // authenticateCompany should set either req.company (doc) or req.companyId (id) — handle both
    const companyId =
      (req.company && (req.company._id || req.company.id)) ||
      req.companyId ||
      req.companyIdFromToken ||
      req.userId;

    if (!companyId) {
      return res.status(401).json({ message: "Unauthorized - company not found in request" });
    }

    // re-fetch company including password
    // if your schema doesn't use select:false this still works; if it does, this ensures password is included
    const company = await Company.findById(companyId).select('+password');

    if (!company) return res.status(404).json({ message: "Company not found" });

    // DEBUG (temporary): uncomment to inspect (remove in production)
    // console.log('company id:', companyId, 'has password?', !!company.password);

    // compare current password -> ensure company.password is defined
    if (!company.password) {
      return res.status(500).json({ message: "Stored password missing for company (internal error)" });
    }

    const isMatch = await bcrypt.compare(currentPassword, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    company.password = hashedPassword;
    // optional: track password change time:
    // company.passwordChangedAt = new Date();
    await company.save();

    return res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Server error while resetting password" });
  }
});

app.post('/api/company-send-otp', withDB(async (req, res) => {
  try {
    const { email } = req.body;
if (typeof email !== 'string') {
  return res.status(400).json({
    message: 'Invalid email'
  });
}
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
const safeEmail = email.trim().toLowerCase();
    // Check if company exists
    const existingCompany = await Company.findOne({
  email: safeEmail
});
    if (!existingCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const otp = generateOTP();

    // Save or update OTP with expiry (e.g., 25 min)
    await OTP.findOneAndUpdate(
      { email },
      { email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true, new: true }
    );

    // Email content for OTP
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">InternX - Company Password Reset OTP</h2>
        <p>Your OTP for password reset is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #16a34a; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail(email, 'InternX - Company Password Reset OTP', emailHtml);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending company OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
}));

app.post('/api/company-forgot-password', withDB(async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (
  typeof email !== 'string' ||
  typeof otp !== 'string' ||
  typeof newPassword !== 'string'
) {
  return res.status(400).json({
    message: 'Invalid input'
  });
}
const safeEmail = email.trim().toLowerCase();

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and newPassword are required' });
    }

    const otpRecord = await OTP.findOne({
  email: safeEmail
});
    if (!otpRecord) return res.status(400).json({ message: 'OTP not found. Please request again.' });

    if (String(otpRecord.otp).trim() !== String(otp).trim()) return res.status(400).json({ message: 'Invalid OTP' });
    if (otpRecord.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired. Please request again.' });

    const company = await Company.findOne({ email });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Hash the new password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    company.password = hashedPassword;
    await company.save();

    await OTP.deleteOne({ email });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Company forgot password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
}));


app.post(
  '/api/add_globaljobs',
  authenticateAdmin,
  withDB(async (req, res) => {
  try {
    console.log('POST /api/globaljobs called with:', req.body);

    const { country_name, company_name, link } = req.body;

    if (!country_name || !company_name || !link) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const newJob = new GlobalJob({ country_name, company_name, link });
    const savedJob = await newJob.save();

    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error adding global job:', error);
    res.status(500).json({ error: 'Failed to add global job' });
  }
}));

// Assuming `authenticateToken` is already defined as in your snippet

app.get('/api/globaljobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await GlobalJob.find().lean(); // .lean() returns plain JS objects
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching global jobs:', error);
    res.status(500).json({ error: 'Failed to fetch global jobs' });
  }
});

app.put('/api/globals/:id', authenticateAdmin, withDB(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Optional: Add validation or sanitization here to ensure only allowed fields are updated

    const globalJob = await GlobalJob.findByIdAndUpdate(id, updateData, { new: true });

    if (!globalJob) {
      return res.status(404).json({ message: 'Global job not found' });
    }

    return res.status(200).json({
      message: 'Global job updated successfully',
      job: globalJob,
    });
  } catch (error) {
    console.error('Error updating global job:', error);
    return res.status(500).json({ message: 'Failed to update global job' });
  }
}));



// company registration
app.post('/api/register_company', uploadCompanyLogo.single('logo'), async (req, res) => {
  try {
    const {
      name,
      location,
      website,
      email,
      contact,
      description,
      linkedinUrl,
      twitterUrl,
      facebookUrl,
      instagramUrl,
      industry,
      size,
      founded,
      password,
      confirmPassword
    } = req.body;

    // Required field validation
    if (!name || !location || !website || !email || !contact || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
// Password strength validation
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

if (!strongPasswordRegex.test(password)) {
  return res.status(400).json({
    message:
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
  });
}

    // Check if email already exists
    const existingCompany = await Company.findOne({ email: email.toLowerCase() });
    if (existingCompany) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get logo URL from uploaded file (if uploaded)
    const logoUrl = req.file ? `/uploads/company-logos/${req.file.filename}` : null;

    // Create and save new company
    const newCompany = new Company({
      name,
      location,
      website,
      email: email.toLowerCase(),
      contact,
      description: description || '',
      linkedinUrl: linkedinUrl || '',
      twitterUrl: twitterUrl || '',
      facebookUrl: facebookUrl || '',
      instagramUrl: instagramUrl || '',
      industry: industry || '',
      logoUrl,
      size: size || '',
      founded: founded || null,
      password: hashedPassword
    });

    const savedCompany = await newCompany.save();

    // Don't send password in response
    const { password: _, ...companyData } = savedCompany.toObject();

    res.status(201).json({
      message: 'Company registered successfully',
      company: companyData
    });

  } catch (error) {
    // Handle duplicate email
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Handle Multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
      }
      return res.status(400).json({ message: error.message });
    }

    // Handle file type errors
    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({ message: error.message });
    }

    console.error('Error registering company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// company login
app.post('/api/login_company', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block login if account is deactivated (temporarily or permanently flagged)
    if (company.isDeactivated) {
      return res.status(403).json({ message: 'Account deactivated. Please contact support.' });
    }

    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: company._id, email: company.email, type: 'company' },
      process.env.JWT_SECRET ,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        location: company.location,
        website: company.website,
        contact: company.contact,
        logoUrl: company.logoUrl,
        size: company.size,
        founded: company.founded
      }
    });
  } catch (error) {
    console.error('Error logging in company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// Get company profile
app.get('/api/company_profile', authenticateCompany, async (req, res) => {
  try {
    const company = req.company;

    res.status(200).json({
      message: 'Profile retrieved successfully',
      company: {
        _id: company._id,
        name: company.name,
        location: company.location,
        website: company.website,
        email: company.email,
        contact: company.contact,
        description: company.description,
        linkedinUrl: company.linkedinUrl,
        twitterUrl: company.twitterUrl,
        facebookUrl: company.facebookUrl,
        instagramUrl: company.instagramUrl,
        industry: company.industry,
        isVerified: company.isVerified,
        logoUrl: company.logoUrl,
        size: company.size,
        founded: company.founded,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update company profile
app.put('/api/company_profile', authenticateCompany, async (req, res) => {
  try {
    const {
      name,
      location,
      website,
      contact,
      description,
      linkedinUrl,
      twitterUrl,
      facebookUrl,
      instagramUrl,
      industry,
      size,
      founded
    } = req.body;

    // Get company ID from authenticated user
    const companyId = req.company._id;

    // Build update object (only include fields that are provided)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (contact !== undefined) updateData.contact = contact;
    if (description !== undefined) updateData.description = description;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl;
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
    if (industry !== undefined) updateData.industry = industry;
    if (size !== undefined) updateData.size = size;
    if (founded !== undefined) updateData.founded = founded;

    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      company: updatedCompany
    });

  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create job - Company version
app.post('/api/add_internships', authenticateCompany, withDB(async (req, res) => {
  try {
    // ✅ Check if company is verified
    if (!req.company.isVerified) {
      return res.status(403).json({ 
        message: 'Only verified companies can post internships. Please complete your profile and wait for admin verification.',
        verified: false
      });
    }

    const jobData = {
      ...req.body,
      company: req.company.name,        // Auto-fill company name
      email: req.company.email,         // Auto-fill company email
      createdBy: req.company._id        // Company ID from token
    };
    
    const job = await Job.create(jobData);
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to post job' });
  }
}));


// Get company's jobs 
app.get('/api/get_internships', authenticateCompany, withDB(async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.company._id }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Jobs fetched successfully', jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}));

// Update job by company
app.put('/api/update_internships/:jobId', authenticateCompany, withDB(async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, createdBy: req.company._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }
    
    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
}));

// Delete job by company
app.delete('/api/delete_internships/:jobId', authenticateCompany, withDB(async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ 
      _id: req.params.jobId, 
      createdBy: req.company._id 
    });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }
    
    res.status(200).json({ message: 'Job deleted successfully', job });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
}));

//get application for company
app.get('/api/get_applications', authenticateCompany, withDB(async (req, res) => {
  try {
    // First, get all jobs posted by this company
    const companyJobs = await Job.find({ createdBy: req.company._id }).select('_id');
    const jobIds = companyJobs.map(job => job._id);

    // Then get all applications for those jobs with user details populated
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company location position')
      .populate('userId', 'name email phone currentCity pinCode skills resume twelfthPU ugDegree pgMasters currentAcademicStatus profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      message: 'Applications fetched successfully', 
      applications,
      totalApplications: applications.length 
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
}));

// Update application status (for companies)
app.patch('/api/update_application_status/:applicationId', authenticateCompany, withDB(async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'sent', 'undelivered', 'application received', 'received', 'rejected', 'selected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find the application and populate jobId to check ownership
    const application = await Application.findById(applicationId).populate('jobId');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify that the job belongs to this company
    if (application.jobId.createdBy.toString() !== req.company._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only update applications for your own jobs' });
    }

    // Update the status
    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = req.company._id;
    
    await application.save();

    res.status(200).json({ 
      message: `Application status updated to ${status}`, 
      application 
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
}));

// Get company stats
app.get('/api/company/stats', authenticateCompany, withDB(async (req, res) => {
  try {
    // Get all jobs posted by this company
    const companyJobs = await Job.find({ createdBy: req.company._id }).select('_id isActive');
    const jobIds = companyJobs.map(job => job._id);

    // Count active jobs
    const totalJobs = companyJobs.length;
    const activeJobs = companyJobs.filter(job => job.isActive).length;

    // Get all applications for company's jobs
    const applications = await Application.find({ jobId: { $in: jobIds } });
    
    // Count applications by status
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'Pending').length;
    const selectedApplications = applications.filter(app => app.status === 'selected').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

    res.status(200).json({
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      selectedApplications,
      rejectedApplications
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
}));

cron.schedule('0 * * * *', async () => {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  try {
    const result = await Company.updateMany(
      {
        isDeactivated: true,
        deactivatedAt: { $lt: twoDaysAgo }
      },
      {
        isDeactivated: false,
        $unset: { deactivatedAt: '' }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`Reactivated ${result.modifiedCount} companies.`);
    }
  } catch (err) {
    console.error('Error in reactivation cron job:', err);
  }
});

// Deactivate account API
app.post('/api/company_deactivate', authenticateCompany, async (req, res) => {
  const companyId = req.company?._id;

  if (!companyId) {
    return res.status(400).json({ message: 'Missing authenticated company id' });
  }

  const { type } = req.body;
  if (!['temporary', 'permanent'].includes(type)) {
    return res.status(400).json({ message: 'Deactivation type must be temporary or permanent' });
  }

  try {
    if (type === 'temporary') {
      await Company.findByIdAndUpdate(companyId, {
        isDeactivated: true,
        deactivatedAt: new Date(),
      });
      return res.json({ message: 'Account temporarily deactivated for 2 days.' });
    } else {
      await Company.findByIdAndDelete(companyId);
      return res.json({ message: 'Account permanently deleted.' });
    }
  } catch (err) {
    console.error('Deactivate account error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// User Registration (Simplified)
app.post('/api/register', withDB(async (req, res) => {
  try {
    // 1. Extract only the required fields
    const { 
      name, 
      email, 
      password, 
      phone, 
      otp, 
      currentCity, 
      pinCode, 
      studyPreference 
    } = req.body;

  // 2. Validate required fields
if (
  !name ||
  !email ||
  !password ||
  !phone ||
  !otp ||
  !currentCity ||
  !pinCode ||
  !studyPreference
) {
  return res.status(400).json({
    message: 'All fields are required'
  });
}

// 3. Verify OTP
const otpRecord = await OTP.findOne({ email, otp });
if (!otpRecord) {
  return res.status(400).json({ message: 'Invalid or expired OTP' });
}
// Check password strength
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

if (!strongPasswordRegex.test(password)) {
  return res.status(400).json({
    message:
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
  });
}
    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user object (Cleaned up)
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      currentCity,
      pinCode,
    studyPreference, // Keeping default just in case
      isVerified: true
    };

    // 6. Save to Database
    const user = await User.create(userData);

    // 7. Delete OTP after successful registration
    await OTP.deleteOne({ email, otp });

    // 8. Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 9. Send welcome email
    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Welcome to InternX, ${name}!</h2>
        <p>Your account has been successfully created.</p>
        <p>Best of luck with your internship search!</p>
        <p>Team InternX</p>
      </div>
    `;

    await sendEmail(email, 'Welcome to InternX!', welcomeEmailHtml);

    // 10. Send Response (Cleaned up user object)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currentCity: user.currentCity,
        pinCode: user.pinCode,
        studyPreference: user.studyPreference
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
}));


// User Login
app.post('/api/login', withDB(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: 'user' },
      process.env.JWT_SECRET ,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currentCity: user.currentCity,
            pinCode:user.pinCode,
        futureGoals: user.futureGoals,
    
        studyPreference: user.studyPreference,
        section: user.section,
        higherEducation: user.higherEducation,
        twelfthPU: user.twelfthPU,
        ugDegree: user.ugDegree,
        pgMasters: user.pgMasters,
        skills: user.skills,
        keywords: user.keywords,
        resume: user.resume ? true : false,
        profilePicture: user.profilePicture ? true : false,
        applicationCount: user.applicationCount,
        currentAcademicStatus: user.currentAcademicStatus
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}));

// Update user profile
app.put('/api/profile', authenticateToken, withDB(async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = { ...req.body };

    // Handle profile picture file conversion to base64
    if (updateData.profilePictureData) {
      updateData.profilePicture = updateData.profilePictureData;
      updateData.profilePictureFilename = updateData.profilePictureFilename;
      updateData.profilePictureContentType = updateData.profilePictureContentType;
      delete updateData.profilePictureData;
    }

    // Handle resume file conversion to base64
    if (updateData.resumeData) {
      updateData.resume = updateData.resumeData;
      updateData.resumeFilename = updateData.resumeFilename;
      updateData.resumeContentType = updateData.resumeContentType;
      delete updateData.resumeData;
    }

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.email;
    delete updateData._id;
    delete updateData.applicationCount;
    delete updateData.isVerified;
    delete updateData.isBlocked;
    delete updateData.otp;
    delete updateData.otpExpiry;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currentCity: user.currentCity,
           pinCode:user.pinCode,
        futureGoals: user.futureGoals,
     
        studyPreference: user.studyPreference,
        section: user.section,
        higherEducation: user.higherEducation,
        twelfthPU: user.twelfthPU,
        ugDegree: user.ugDegree,
        pgMasters: user.pgMasters,
        skills: user.skills,
        currentAcademicStatus: user.currentAcademicStatus,
        keywords: user.keywords,
        resume: user.resume ? true : false,
        profilePicture: user.profilePicture ? true : false,
        applicationCount: user.applicationCount,
        
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}));

// Admin Login
app.post('/api/admin/login', withDB(async (req, res) => {
  try {
    const { username, password } = req.body;
    if (
  typeof username !== 'string' ||
  typeof password !== 'string'
) {
  return res.status(400).json({
    message: 'Invalid credentials'
  });
}
const safeUsername = username.trim();
   const admin = await Admin.findOne({
  username: safeUsername
});
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    const token = jwt.sign(
      { adminId: admin._id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET ,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Admin login failed' });
  }
}));

// add this helper somewhere near the top of your file
function escapeRegExp(str = '') {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.get('/api/jobs', withDB(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      location,
      domain,
      position,
      minSalary,
      maxSalary,
      autocomplete // 👈 add this query param
    } = req.query;

   // ---------- AUTOCOMPLETE MODE ----------
if (String(autocomplete) === 'true') {
  // DOMAIN autocomplete
  if (domain) {
    const q = String(domain || '').trim();
    if (!q) return res.json({ suggestions: [] });

    const safe = escapeRegExp(q);
    const results = await Job.aggregate([
      { $match: { domain: { $regex: safe, $options: 'i' }, isActive: true } },
      { $group: { _id: { $trim: { input: "$domain" } }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, domain: '$_id' } }
    ]);

    const suggestions = (results || []).map(r => r.domain);
    return res.json({ suggestions });
  }

  // LOCATION autocomplete (backwards compatible)
  if (location) {
    const q = String(location || '').trim();
    if (!q) return res.json({ suggestions: [] });

    const safe = escapeRegExp(q);
    const results = await Job.aggregate([
      { $match: { location: { $regex: safe, $options: 'i' }, isActive: true } },
      { $group: { _id: { $trim: { input: "$location" } }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, location: '$_id' } }
    ]);

    const suggestions = (results || []).map(r => r.location);
    return res.json({ suggestions });
  }

  // no param provided
  return res.json({ suggestions: [] });
}


    const now = new Date();
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 12;
    const skip = (parsedPage - 1) * parsedLimit;

    // Base filters (active + not expired)
    const andConditions = [
      { isActive: true },
      {
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          { expiryDate: { $gt: now } }
        ]
      }
    ];

    // Search filter (escape terms)
    if (search && String(search).trim()) {
      const searchTerms = String(search).trim().split(/\s+/);
      if (searchTerms.length === 1) {
        const term = escapeRegExp(searchTerms[0]);
        andConditions.push({
          $or: [
            { title: { $regex: `\\b${term}\\b`, $options: 'i' } },
            { domain: { $regex: `\\b${term}\\b`, $options: 'i' } },
            { title: { $regex: `\\b${term}`, $options: 'i' } },
            { domain: { $regex: `\\b${term}`, $options: 'i' } }
          ]
        });
      } else {
        searchTerms.forEach(rawTerm => {
          const term = escapeRegExp(rawTerm);
          andConditions.push({
            $or: [
              { title: { $regex: `\\b${term}`, $options: 'i' } },
              { domain: { $regex: `\\b${term}`, $options: 'i' } }
            ]
          });
        });
      }
    }

    // Location filter (escape)
    if (location && String(location).trim()) {
      andConditions.push({
        location: {
          $regex: escapeRegExp(String(location).trim()),
          $options: 'i'
        }
      });
    }

    // Domain & Position filters (escape)
    if (domain && String(domain).trim()) {
      andConditions.push({ domain: { $regex: escapeRegExp(String(domain).trim()), $options: 'i' } });
    }

    if (position && String(position).trim()) {
      andConditions.push({ position: { $regex: escapeRegExp(String(position).trim()), $options: 'i' } });
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: { $and: andConditions } },
      { $addFields: { salaryNum: { $convert: { input: "$salary", to: "double", onError: null, onNull: null } } } }
    ];

    // Salary filter
    if (
      (minSalary && !isNaN(Number(minSalary))) ||
      (maxSalary && !isNaN(Number(maxSalary)))
    ) {
      const salaryFilter = {};
      if (minSalary && !isNaN(Number(minSalary))) salaryFilter.$gte = Number(minSalary);
      if (maxSalary && !isNaN(Number(maxSalary))) salaryFilter.$lte = Number(maxSalary);
      pipeline.push({ $match: { salaryNum: salaryFilter } });
    }

    // Sort, skip, and limit
    pipeline.push({ $sort: { featured: -1, createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parsedLimit });

    // Count total jobs (use same andConditions)
    const total = await Job.countDocuments({ $and: andConditions });

    // Execute aggregation
    const jobs = await Job.aggregate(pipeline);

    res.json({
      jobs,
      pagination: {
        current: parsedPage,
        pages: Math.ceil(total / parsedLimit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}));



// Get single job



app.get('/api/jobs/:id', withDB(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Increment view count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Failed to fetch internship' });
  }
}));

// Check if user has applied for a job
app.get('/api/jobs/:id/application-status', authenticateToken, withDB(async (req, res) => {
  try {
    const jobId = String(req.params.id).trim();
   const userId = String(req.user.userId).trim();
if (!jobId || !userId) {
  return res.status(400).json({
    message: 'Invalid request'
  });
}
    const application = await Application.findOne({ jobId, userId });

    res.json({
      hasApplied: !!application,
      status: application ? application.status : null,
      appliedAt: application ? application.appliedAt : null
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({ message: 'Failed to check application status' });
  }
}));


// Get user's applications
app.get('/api/my-applications', authenticateToken, withDB(async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.userId })
      .populate('jobId', 'title company location salary')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
}));

// Enhanced email sending functions with delivery status

const sendCompanyEmail = async (to, subject, html, attachments = []) => {
  try {
    const result = await applicationTransporter.sendMail({
      from: `"InternX" <${process.env.EMAIL_APP}>`,
      to,
      subject,
      html,
      attachments
    });
    return { status: 'sent', messageId: result.messageId, error: null };
  } catch (error) {
    return { status: 'undelivered', messageId: null, error: error.message };
  }
};
const sendUserEmail = async (to, subject, html) => {
  try {
    const result = await applicationTransporter.sendMail({
      from: `"InternX" <${process.env.EMAIL_APP}>`,
      to,
      subject,
      html
    });
    return { status: 'sent', messageId: result.messageId, error: null };
  } catch (error) {
    return { status: 'undelivered', messageId: null, error: error.message };
  }
};
// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

app.post('/api/jobs/:id/apply', authenticateToken, withDB(async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.id;
    const userId = req.user.userId;
if (!mongoose.Types.ObjectId.isValid(userId)) {
  return res.status(400).json({
    message: 'Invalid user ID'
  });
}
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resume) {
      return res.status(400).json({
        message: 'Please upload your resume before applying for internships',
        requiresResume: true
      });
    }
if (!mongoose.Types.ObjectId.isValid(jobId)) {
  return res.status(400).json({
    message: 'Invalid job ID'
  });
}
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Internship not found' });

    const existingApplication = await Application.findOne({
      jobId: new mongoose.Types.ObjectId(jobId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this internship' });
    }

    const settings = await SystemSettings.findOne();
    const maxApplications = settings?.maxApplicationsPerUser || 3;

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

const applicationsTodayCount = await Application.countDocuments({
  userId,
  appliedAt: {
    $gte: startOfDay,
    $lte: endOfDay,
  }
});

if (applicationsTodayCount >= maxApplications) {
  return res.status(400).json({
    message: `You have reached the daily limit of ${maxApplications} applications. Please try again tomorrow.`,
    applicationCountExceeded: true,
    maxApplications,
  });
}


    // Determine the email delivery status based on company email
    let applicationStatus = 'application received';
    let companyEmailStatus = { status: 'application received', message: 'No company email provided' };
    let userEmailStatus = { status: 'not_available', message: 'No user email provided' };

    // 📤 Send email to company
    if (job.email && job.email.trim()) {
      // Validate company email
      if (!isValidEmail(job.email)) {
        applicationStatus = 'undelivered';
        companyEmailStatus = {
          status: 'undelivered',
          message: 'Invalid company email format',
          email: job.email
        };
      } else {
        const companyMailHtml = `
          <div style="font-family: Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#16a34a;">New Application: ${job.title}</h2>
            <p>A new candidate has applied for your internship.</p>
            <div style="background-color:#f3f4f6;padding:20px;margin:20px 0;">
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Phone:</strong> ${user.phone}</p>
              <p><strong>Cover Letter:</strong><br>${coverLetter || ""}</p>
            </div>
            <p>Candidate's resume is attached to this email.</p>
            <p>Best regards,<br/>Team InternX</p>
          </div>
        `;

        let resumeAttachment = null;
        if (user.resume && !user.resume.startsWith('http')) {
          resumeAttachment = {
            filename: user.resumeFilename || 'resume.pdf',
            content: Buffer.from(user.resume, 'base64'),
            encoding: 'base64'
          };
        }

        const emailResult = await sendCompanyEmail(
          job.email,
          `New Application for "${job.title}" via InternX`,
          companyMailHtml,
          resumeAttachment ? [resumeAttachment] : []
        );

        // Set application status based on company email result
        applicationStatus = emailResult.status;

        companyEmailStatus = {
          status: emailResult.status,
          message: emailResult.status === 'sent' ? 'Email sent successfully' : `Failed to send: ${emailResult.error}`,
          email: job.email,
          messageId: emailResult.messageId
        };
      }
    } else {
      // No company email provided or empty email
      applicationStatus = 'application received';
    }

    // Safety check to prevent 'Pending' status
    if (applicationStatus === 'Pending') {
      applicationStatus = 'application received';
    }

    // Create application with the determined status
    const savedApplication = await Application.create({
      jobId,
      userId,
      coverLetter,
      status: applicationStatus,
      appliedAt: new Date()
    });

    await User.findByIdAndUpdate(userId, { $inc: { applicationCount: 1 } });
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // 📩 Send confirmation to user (separate from application status)
    if (user.email) {
      // Validate user email
      if (!isValidEmail(user.email)) {
        userEmailStatus = {
          status: 'undelivered',
          message: 'Invalid user email format',
          email: user.email
        };
      } else {
        const applicationEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Application Submitted Successfully!</h2>
            <p>Dear ${user.name},</p>
            <p>Your application for the following internship has been submitted successfully:</p>
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0;">
              <h3 style="color: #16a34a;">${job.title}</h3>
              <p><strong>Company:</strong> ${job.company}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <p><strong>Applied on:</strong> ${new Date().toLocaleDateString()}</p>
       
            </div>
<p>
 If you do not receive a response within 5 days of submitting your application, please reach out to the organization you have applied to for the internship via email or phone to inquire about the status of your application.<br>
 Below mentioned is the company email: <strong>${job.email}</strong>
</p>


            <p>Applications remaining: ${maxApplications - user.applicationCount - 1}</p>
            <p>Best of luck!</p>
            <p>Team InternX</p>
          </div>
        `;

        const emailResult = await sendUserEmail(
          user.email,
          `Your application for ${job.title} has been received`,
          applicationEmailHtml
        );

        userEmailStatus = {
          status: emailResult.status,
          message: emailResult.status === 'sent' ? 'Confirmation email sent successfully' : `Failed to send: ${emailResult.error}`,
          email: user.email,
          messageId: emailResult.messageId
        };
      }
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationStatus: applicationStatus,
      emailStatus: {
        companyEmail: companyEmailStatus,
        userEmail: userEmailStatus
      },
      applicationsRemaining: maxApplications - user.applicationCount - 1
    });

  } catch (error) {
    console.error('❌ Error applying for internship:', error.message);
    res.status(500).json({ message: 'Failed to apply for internship' });
  }
}));


app.get(
  '/api/resume/:userId',
  authenticateToken,
  withDB(async (req, res) => {
    try {
      const { userId } = req.params;

      // Only allow users to access their own resume
      if (req.user.userId !== userId) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }
if (!mongoose.Types.ObjectId.isValid(userId)) {
  return res.status(400).json({
    message: 'Invalid user ID'
  });
}
      const user = await User.findById(userId);

      if (!user || !user.resume) {
        return res.status(404).json({
          message: 'Resume not found'
        });
      }

      const resumeBuffer = Buffer.from(user.resume, 'base64');

      res.setHeader(
        'Content-Type',
        user.resumeContentType || 'application/pdf'
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${user.resumeFilename || 'resume.pdf'}"`
      );

      res.send(resumeBuffer);

    } catch (error) {
      console.error('Error downloading resume:', error);
      res.status(500).json({
        message: 'Failed to download resume'
      });
    }
  })
);

// Get profile picture
app.get('/api/profile-picture/:userId', withDB(async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    const imageBuffer = Buffer.from(user.profilePicture, 'base64');
    res.setHeader('Content-Type', user.profilePictureContentType || 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).json({ message: 'Failed to fetch profile picture' });
  }
}));


// Get skill suggestions
app.get('/api/skill-suggestions', (req, res) => {
  const skills = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'Kotlin', 'TypeScript', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart', 'Objective-C',

    // Web Development
    'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django',
    'Flask', 'Laravel', 'Spring Boot', 'ASP.NET', 'jQuery', 'Bootstrap', 'Tailwind CSS',
    'Sass', 'Less', 'Webpack', 'Vite', 'Next.js', 'Nuxt.js', 'Svelte',

    // Mobile Development
    'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin',
    'Ionic', 'Cordova', 'Unity', 'Unreal Engine',

    // Database
    'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'SQL Server', 'Redis',
    'Cassandra', 'DynamoDB', 'Firebase', 'Supabase',

    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
    'GitHub', 'GitLab', 'CI/CD', 'Terraform', 'Ansible', 'Linux', 'Ubuntu',

    // Data Science & AI
    'Machine Learning', 'Deep Learning', 'Data Analysis', 'Data Visualization',
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Jupyter',
    'Tableau', 'Power BI', 'Apache Spark', 'Hadoop',

    // Design
    'UI/UX Design', 'Graphic Design', 'Adobe Photoshop', 'Adobe Illustrator',
    'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Canva', 'Blender',

    // Marketing
    'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
    'Email Marketing', 'Google Analytics', 'Facebook Ads', 'Google Ads',
    'Marketing Automation', 'Copywriting', 'Brand Management',

    // Business & Finance
    'Project Management', 'Business Analysis', 'Financial Analysis', 'Excel',
    'PowerPoint', 'Accounting', 'Investment Banking', 'Risk Management',
    'Consulting', 'Strategy', 'Operations', 'Supply Chain',

    // Soft Skills
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
    'Time Management', 'Adaptability', 'Creativity', 'Public Speaking',
    'Negotiation', 'Customer Service', 'Sales',

    // Other Technical
    'Cybersecurity', 'Network Security', 'Blockchain', 'IoT', 'AR/VR',
    'Game Development', 'API Development', 'Microservices', 'Testing',
    'Quality Assurance', 'Technical Writing', 'System Administration'
  ];

  res.json(skills.sort());
});

// Admin Routes

// Get admin dashboard stats
app.get('/api/admin/stats', authenticateAdmin, withDB(async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'Pending' });
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    res.json({
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalUsers,
      blockedUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
}));

// Get all jobs for admin
app.get('/api/admin/jobs', authenticateAdmin, withDB(async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}));

// Create job
app.post('/api/admin/jobs', authenticateAdmin, withDB(async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      createdBy: req.admin.adminId
    };
    const job = await Job.create(jobData);
    res.status(201).json({ message: 'Internship created successfully', job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create internship' });
  }
}));

// Replace location name (case-insensitive)
app.put('/api/admin/jobs/replace_location', authenticateAdmin, async (req, res) => {
  try {
    const { oldLocation, newLocation } = req.body;

    // Validate input
    if (!oldLocation || !newLocation) {
      return res.status(400).json({ message: "Both oldLocation and newLocation are required" });
    }

    // Update all jobs with matching location (case-insensitive)
    const result = await Job.updateMany(
      { location: { $regex: `^${oldLocation}$`, $options: 'i' } }, 
      { $set: { location: newLocation } }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} jobs from "${oldLocation}" to "${newLocation}"`,
      data: result,
    });
  } catch (error) {
    console.error("Error replacing locations:", error);
    res.status(500).json({ success: false, message: "Error replacing locations", error: error.message });
  }
});

// Update internship
app.put('/api/admin/jobs/:id', authenticateAdmin, withDB(async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.json({ message: 'Internship updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update internship' });
  }
}));
// Update jobs
app.put('/api/admin/globals/:id', authenticateAdmin, withDB(async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.json({ message: 'Internship updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update internship' });
  }
}));

//delete job city Name
app.delete('/api/admin/jobs/deletebylocation/:location', authenticateAdmin, async (req, res) => {
  try {
    const location = req.params.location;
    const result = await Job.deleteMany({ location: { $regex: `^${location}$`, $options: 'i' } });
    res.json({ message: `Deleted ${result.deletedCount} jobs in location "${location}"` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting jobs", error });
  }
});



// Delete job
app.delete('/api/admin/jobs/:id', authenticateAdmin, withDB(async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Delete related applications
    await Application.deleteMany({ jobId: req.params.id });

    res.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete internship' });
  }
}));

// Bulk delete jobs
app.post('/api/admin/jobs/bulk-delete', authenticateAdmin, withDB(async (req, res) => {
  try {
    const { jobIds } = req.body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ message: 'Job IDs are required' });
    }

    // Delete jobs
    const deleteResult = await Job.deleteMany({ _id: { $in: jobIds } });

    // Delete related applications
    await Application.deleteMany({ jobId: { $in: jobIds } });

    res.json({
      message: `Successfully deleted ${deleteResult.deletedCount} internships`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting jobs:', error);
    res.status(500).json({ message: 'Failed to delete internships' });
  }
}));

// Bulk upload jobs
app.post('/api/admin/jobs/bulk-upload', authenticateAdmin, upload.single('excel'), withDB(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Excel file is required' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let jobsCreated = 0;
    const errors = [];

    for (const row of data) {
      try {
        const jobData = {
          title: (row.title || row.Title || '').replace(/\s+Intern\s+Intern$/i, ' Intern').trim(),
          company: row.company || row.Company,
          location: row.location || row.Location,
          domain: row.domain || row.Domain,
          position: row.position || row.Position,
          salary: String(row.salary || row.Salary || ''),
          type: row.type || row.Type || 'Full-time',
          duration: row.duration || row.Duration,
          description: row.description || row.Description,
          requirements: (row.requirements || row.Requirements || '').split('\n').filter(req => req.trim()),
          isActive: true,
          createdBy: req.admin.adminId,
          email: row.email || row.Email
        };

        // Validate required fields
        if (!jobData.title || !jobData.company || !jobData.location || !jobData.salary) {
          errors.push(`Row ${data.indexOf(row) + 1}: Missing required fields`);
          continue;
        }

        await Job.create(jobData);
        jobsCreated++;
      } catch (error) {
        errors.push(`Row ${data.indexOf(row) + 1}: ${error.message}`);
      }
    }

    // Save Excel file record
    await ExcelFile.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      jobsCreated,
      uploadedBy: req.admin.adminId
    });

    res.json({
      message: `Successfully created ${jobsCreated} internships`,
      jobsCreated,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ message: 'Failed to upload internships' });
  }
}));


app.delete('/api/admin/excel-files/:id', authenticateAdmin, withDB(async (req, res) => {
  try {
    const excelFileId = req.params.id;
    if (!excelFileId) {
      return res.status(400).json({ message: 'Excel file ID is required' });
    }

    // Find Excel file record
    const excelFile = await ExcelFile.findById(excelFileId).populate('uploadedBy', '_id');
    if (!excelFile) {
      return res.status(404).json({ message: 'Excel file not found' });
    }

    // Find all jobs created by uploader after upload date (createdAt)
    const jobsToDelete = await Job.find({
      createdBy: excelFile.uploadedBy._id,
      createdAt: { $gte: excelFile.createdAt }
    }).select('_id');

    const jobIds = jobsToDelete.map(job => job._id);

    // Delete jobs
    const deleteJobsResult = await Job.deleteMany({ _id: { $in: jobIds } });

    // Delete related applications
    await Application.deleteMany({ jobId: { $in: jobIds } });

    // Delete Excel file record
    await ExcelFile.deleteOne({ _id: excelFileId });

    res.json({
      message: `Successfully deleted Excel file and ${deleteJobsResult.deletedCount} associated jobs`,
      deletedJobsCount: deleteJobsResult.deletedCount
    });
  } catch (error) {
    console.error('Error deleting Excel file and related data:', error);
    res.status(500).json({ message: 'Failed to delete Excel file and related data' });
  }
}));


// Get Excel files
app.get('/api/admin/excel-files', authenticateAdmin, withDB(async (req, res) => {
  try {
    const files = await ExcelFile.find()
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    console.error('Error fetching Excel files:', error);
    res.status(500).json({ message: 'Failed to fetch Excel files' });
  }
}));

// Download Excel file
app.get('/api/admin/excel-files/:id/download', authenticateAdmin, withDB(async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
}));

// Get all applications for admin
app.get('/api/admin/applications', authenticateAdmin, withDB(async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId', 'title company location salary email')
      .populate('userId', 'name email phone skills resume resumeFilename')
      .populate('reviewedBy', 'username')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
}));

// Update application status with email notification
app.put('/api/admin/applications/:id', authenticateAdmin, withDB(async (req, res) => {
  try {
    const { status, notes } = req.body;
    const applicationId = req.params.id;

    const application = await Application.findByIdAndUpdate(
      applicationId,
      {
        status,
        notes,
        reviewedAt: new Date(),
        reviewedBy: req.admin.adminId
      },
      { new: true }
    ).populate('jobId').populate('userId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Send status update email
    const user = application.userId;
    const job = application.jobId;
    const appliedDate = new Date(application.appliedAt).toLocaleDateString();

    let statusMessage = '';
    let statusColor = '';

    switch (status) {
      case 'Accepted':
        statusMessage = 'Your application is currently under review. We will get back to you soon.';
        statusColor = '#3b82f6';
        break;
      case 'Reviewed':
        statusMessage = 'Congratulations! Your application has been accepted. We will contact you with next steps.';
        statusColor = '#16a34a';
        break;
      case 'Rejected':
        statusMessage = 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.';
        statusColor = '#dc2626';
        break;
      default:
        statusMessage = 'Your application status has been updated.';
        statusColor = '#6b7280';
    }

    const statusEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Application Status Update</h2>
        <p>Dear ${user.name},</p>
        <p>We have an update regarding your internship application:</p>
        <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-left: 4px solid ${statusColor};">
          <h3 style="color: ${statusColor}; margin-top: 0;">${job.title}</h3>
          <p><strong>Company:</strong> ${job.company}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>Applied on:</strong> ${appliedDate}</p>
          <p><strong>Current Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
        </div>
        <p>${statusMessage}</p>
        ${status === 'Accepted' ? '<p>Please keep an eye on your email and phone for further communication from our team.</p>' : ''}
        ${status === 'Rejected' ? '<p>We encourage you to apply for other internships that match your skills and interests.</p>' : ''}
        <p>Thank you for using InternX!</p>
        <p>Best regards,<br>Team InternX</p>
      </div>
    `;

    await sendEmail(
      user.email,
      `Application Status Update - ${job.title} at ${job.company}`,
      statusEmailHtml
    );

    res.json({ message: 'Application status updated successfully and email sent' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
}));

// Get all users for admin

app.get('/api/admin/companies', authenticateAdmin, withDB(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  try {
    const [companies, total] = await Promise.all([
      Company.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { password: 0 } } // Exclude password field
      ], { allowDiskUse: true }),
      Company.countDocuments()
    ]);

    res.json({
      companies,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch companies' });
  }
}));


// Toggle company verification status (Admin only)
app.patch('/api/admin/companies/:id/verify', authenticateAdmin, withDB(async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    // Validate input
    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ message: 'isVerified must be a boolean' });
    }

    // Update company verification status
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { isVerified: isVerified },
      { new: true } // Return updated document
    ).select('-password'); // Exclude password from response

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      message: `Company ${isVerified ? 'verified' : 'unverified'} successfully`,
      company: updatedCompany
    });
  } catch (error) {
    console.error('Error updating company verification:', error);
    res.status(500).json({ message: error.message || 'Failed to update verification status' });
  }
}));

// Delete Company Route
app.delete('/api/admin/companies/:id', authenticateAdmin, withDB(async (req, res) => {
  try {
    const companyId = req.params.id;

    // Find and delete the company
    const company = await Company.findByIdAndDelete(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ 
      message: 'Company deleted successfully',
      deletedCompany: {
        _id: company._id,
        companyName: company.companyName,
        email: company.email
      }
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: error.message || 'Failed to delete company' });
  }
}));

app.get('/api/admin/users', authenticateAdmin, withDB(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      User.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { password: 0 } }
      ], { allowDiskUse: true }),
      User.countDocuments()
    ]);

    res.json({
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
}));

// Block/Unblock user
app.put('/api/admin/users/:id/block', authenticateAdmin, withDB(async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user
    });
  } catch (error) {
    console.error('Error updating user block status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
}));




// Download users data with date filter - Enhanced with all user details
app.get('/api/admin/users/download', authenticateAdmin, withDB(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query for date filtering
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.createdAt.$lt = end;
      }
    }

    const users = await User.find(query)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 });

    // Prepare comprehensive data for Excel
    const excelData = users.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Phone': user.phone,
      'Current City': user.currentCity || '',
      'Pin Code': user.pinCode || '',
      'Future Goals': user.futureGoals || '',
      
      'Study Preference': user.studyPreference || '',
      'Section': user.section || '',
      'Higher Education': user.higherEducation || '',
      '12th Institution': user.twelfthPU?.institution || '',
      '12th Year': user.twelfthPU?.passedYear || '',
      '12th Percentage': user.twelfthPU?.percentage || '',
      'UG Institution': user.ugDegree?.institution || '',
      'UG Course': user.ugDegree?.course || '',
      'UG Year': user.ugDegree?.year || '',
      'UG Percentage': user.ugDegree?.percentage || '',
      'PG Institution': user.pgMasters?.institution || '',
      'PG Course': user.pgMasters?.course || '',
      'PG Year': user.pgMasters?.year || '',
      'PG Percentage': user.pgMasters?.percentage || '',
      'Current Academic Status': user.currentAcademicStatus || '',

      'Skills': user.skills?.join(', ') || '',
      'Keywords': user.keywords?.join(', ') || '',
      'Application Count': user.applicationCount || 0,
      'Has Resume': user.resumeFilename ? 'Yes' : 'No',
      'Resume Filename': user.resumeFilename || '',
      'Has Profile Picture': user.profilePictureFilename ? 'Yes' : 'No',
      'Profile Picture Filename': user.profilePictureFilename || '',
      'Is Verified': user.isVerified ? 'Yes' : 'No',
      'Is Blocked': user.isBlocked ? 'Yes' : 'No',
      'Registration Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      'Registration Time': user.createdAt ? new Date(user.createdAt).toLocaleTimeString() : '',
      'Last Updated': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths = [];
    Object.keys(excelData[0] || {}).forEach((key, index) => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key] || '').length)
      );
      colWidths[index] = { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Data');

    // Generate filename with date range
    let filename = 'internx_users_complete_data';
    if (startDate && endDate) {
      filename += `_${startDate}_to_${endDate}`;
    } else if (startDate) {
      filename += `_from_${startDate}`;
    } else if (endDate) {
      filename += `_until_${endDate}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write workbook to response
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);

  } catch (error) {
    console.error('Error downloading users data:', error);
    res.status(500).json({ message: 'Failed to download users data' });
  }
}));

// Get analytics data
app.get('/api/admin/analytics', authenticateAdmin, withDB(async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    const totalUsers = await User.countDocuments();

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Jobs by domain
    const jobsByDomain = await Job.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Monthly registrations
    const monthlyRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Study preferences
    const studyPreferences = await User.aggregate([
      { $group: { _id: '$studyPreference', count: { $sum: 1 } } }
    ]);

    // Top companies by applications
    const topCompanies = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $group: { _id: '$job.company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalJobs,
      activeJobs,
      totalApplications,
      totalUsers,
      applicationsByStatus,
      jobsByDomain,
      monthlyRegistrations,
      studyPreferences,
      topCompanies
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
}));

// Get system settings
app.get('/api/admin/settings', authenticateAdmin, withDB(async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    res.json(settings || {
      maxApplicationsPerUser: 3,
      emailNotifications: true,
      autoApproval: false,
      maintenanceMode: false,
      registrationEnabled: true,
      platformName: 'InternX',
      supportEmail: 'support@internx.io'
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
}));

// Update system settings
app.put('/api/admin/settings', authenticateAdmin, withDB(async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastUpdated: new Date(),
      updatedBy: req.admin.adminId
    };

    const settings = await SystemSettings.findOneAndUpdate(
      {},
      updateData,
      { upsert: true, new: true }
    );

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
}));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
});