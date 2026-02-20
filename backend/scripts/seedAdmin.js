/**
 * WellSync Admin Seed Script
 * Creates the default admin account if it doesn't already exist.
 *
 * Usage:
 *   node backend/scripts/seedAdmin.js
 *   (from the project root)
 *
 *   OR from inside backend/:
 *   node scripts/seedAdmin.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Inline minimal User model so the script is self-contained ─────────────────
const userSchema = new mongoose.Schema(
  {
    firstName:            { type: String, required: true, trim: true },
    lastName:             { type: String, required: true, trim: true },
    email:                { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:             { type: String, required: true, minlength: 8, select: false },
    role:                 { type: String, enum: ['user', 'admin'], default: 'user' },
    isEmailVerified:      { type: Boolean, default: false },
    isActive:             { type: Boolean, default: true },
    isSystemAdmin:        { type: Boolean, default: false },
    profile: {
      age:         Number,
      gender:      { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
      occupation:  String,
      country:     String,
      phoneNumber: String,
      avatar:      String,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push:  { type: Boolean, default: true },
      },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    },
    lastLogin:        Date,
    loginAttempts:    { type: Number, default: 0 },
    lockUntil:        Date,
    emailVerificationCode:   { type: String, select: false },
    emailVerificationExpire: Date,
    passwordResetCode:       { type: String, select: false },
    passwordResetExpire:     Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Re-use the same hashing logic as the real model
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// Use existing model if already registered (avoids OverwriteModelError when imported)
const User = mongoose.models.User || mongoose.model('User', userSchema);

// ── Admin credentials ─────────────────────────────────────────────────────────
const ADMIN = {
  firstName:       'WellSync',
  lastName:        'Admin',
  email:           'admin@wellsync.lk',          // stored lowercase
  password:        'Admin@123',
  role:            'admin',
  isEmailVerified: true,                          // admin doesn't need email verification
  isActive:        true,
  isSystemAdmin:   true,                          // mark as protected system admin
  profile: {
    age:        30,
    gender:     'Prefer not to say',
    occupation: 'System Administrator',
    country:    'Sri Lanka',
  },
  preferences: {
    notifications: { email: true, push: true },
    theme: 'auto',
  },
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('\n❌  MONGODB_URI is not set in your .env file.');
    console.error('    Copy .env.example → backend/.env and fill in the values.\n');
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('  WellSync — Admin Seed Script');
  console.log('═'.repeat(60));
  console.log(`\n📡 Connecting to MongoDB…`);

  await mongoose.connect(uri);
  console.log(`✅ Connected to: ${mongoose.connection.host} / ${mongoose.connection.name}`);

  // Check if admin already exists (case-insensitive)
  const existing = await User.findOne({ email: ADMIN.email });

  if (existing) {
    if (existing.role !== 'admin' || !existing.isSystemAdmin) {
      // Exists as regular user → promote to admin and mark as system admin
      existing.role            = 'admin';
      existing.isEmailVerified = true;
      existing.isActive        = true;
      // Note: isSystemAdmin is immutable in the model, but we can set it here on first save
      if (!existing.isSystemAdmin) {
        existing.isSystemAdmin = true;
      }
      await existing.save();
      console.log(`\n⬆️  Existing user "${existing.email}" promoted to system admin role.`);
    } else {
      console.log(`\n✅ System admin account already exists — no changes made.`);
      console.log(`   Email       : ${existing.email}`);
      console.log(`   Role        : ${existing.role}`);
      console.log(`   System Admin: ${existing.isSystemAdmin}`);
    }
  } else {
    // Create fresh admin account
    const admin = new User(ADMIN);
    await admin.save();

    console.log('\n🎉 Admin account created successfully!');
    console.log('─'.repeat(40));
    console.log(`   Name     : ${admin.firstName} ${admin.lastName}`);
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Password : Admin@123`);
    console.log(`   Role     : ${admin.role}`);
    console.log(`   Verified : ${admin.isEmailVerified}`);
    console.log(`   Country  : ${admin.profile.country}`);
    console.log('─'.repeat(40));
    console.log('\n⚠️  Remember to change the password after first login!\n');
  }

  await mongoose.connection.close();
  console.log('🔌 Database connection closed.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Seed script failed:', err.message);
  mongoose.connection.close();
  process.exit(1);
});
