import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// User Schema (matching your User model)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB successfully!');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log('');

    // Check if admin already exists
    console.log('Checking for existing admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@hostel.com' });
    
    if (existingAdmin) {
      console.log('⚠ Admin user already exists!');
      console.log('Deleting existing admin to create a fresh one...');
      await User.deleteOne({ email: 'admin@hostel.com' });
      console.log('✓ Existing admin deleted');
      console.log('');
    }

    // Hash password using bcryptjs
    console.log('Creating new admin user...');
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    console.log('✓ Password hashed successfully');
    console.log('');

    // Create admin user
    const admin = await User.create({
      email: 'admin@hostel.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('Admin Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Email:    admin@hostel.com');
    console.log('Password: admin123');
    console.log('Role:     admin');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('User ID:', admin._id);
    console.log('');

    // Verify the password works
    console.log('Verifying password...');
    const isMatch = await bcrypt.compare('admin123', admin.password);
    console.log('Password verification:', isMatch ? '✓ SUCCESS' : '✗ FAILED');
    console.log('');

    if (isMatch) {
      console.log('✅ You can now login with these credentials!');
    } else {
      console.log('⚠ Warning: Password verification failed. Please try again.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('Duplicate key error. Try deleting the existing admin first.');
    }
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('Database connection closed.');
    process.exit(0);
  }
};

// Run the function
createAdmin();