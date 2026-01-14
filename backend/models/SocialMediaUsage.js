/**
 * Social Media Usage Model
 * Tracks social media usage patterns for students
 */

const mongoose = require('mongoose');

const socialMediaUsageSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    avgDailyUsageHours: {
        type: Number,
        required: [true, 'Average daily usage is required'],
        min: [0, 'Usage cannot be negative'],
        max: [24, 'Usage cannot exceed 24 hours']
    },
    mostUsedPlatform: {
        type: String,
        required: [true, 'Most used platform is required'],
        enum: ['Instagram', 'Facebook', 'Twitter', 'TikTok', 'Snapchat', 'YouTube', 'LinkedIn', 'Other']
    },
    platformsUsed: [{
        platform: String,
        hoursPerDay: Number
    }],
    conflictsOverSocialMedia: {
        type: Number,
        min: [0, 'Conflicts cannot be negative'],
        max: [5, 'Conflicts cannot exceed 5'],
        default: 0
    },
    affectsAcademicPerformance: {
        type: String,
        enum: ['Yes', 'No', 'Sometimes'],
        default: 'No'
    },
    usagePurpose: [{
        type: String,
        enum: ['Entertainment', 'Networking', 'News', 'Education', 'Communication', 'Other']
    }],
    notes: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Compound index
socialMediaUsageSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('SocialMediaUsage', socialMediaUsageSchema);
