/**
 * Sleep Record Model
 * Tracks daily sleep patterns and quality
 */

const mongoose = require('mongoose');

const sleepRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    sleepHours: {
        type: Number,
        required: [true, 'Sleep hours are required'],
        min: [0, 'Sleep hours cannot be negative'],
        max: [24, 'Sleep hours cannot exceed 24']
    },
    sleepQuality: {
        type: Number,
        required: [true, 'Sleep quality is required'],
        min: [1, 'Sleep quality must be at least 1'],
        max: [5, 'Sleep quality cannot exceed 5']
    },
    bedtime: {
        type: String, // Format: "HH:MM"
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)']
    },
    wakeTime: {
        type: String, // Format: "HH:MM"
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)']
    },
    sleepInterruptions: {
        type: Number,
        min: 0,
        default: 0
    },
    napDuration: {
        type: Number,
        min: 0,
        default: 0
    },
    caffeine: {
        type: Boolean,
        default: false
    },
    exercise: {
        type: Boolean,
        default: false
    },
    screenBeforeSleep: {
        type: Boolean,
        default: false
    },
    mood: {
        type: String,
        enum: ['very_poor', 'poor', 'neutral', 'good', 'excellent']
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for user and date (unique per day)
sleepRecordSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtual for sleep category
sleepRecordSchema.virtual('sleepCategory').get(function() {
    const hours = this.sleepHours;
    if (hours < 5) return 'Severely Insufficient';
    if (hours < 6) return 'Insufficient';
    if (hours < 7) return 'Below Optimal';
    if (hours <= 9) return 'Optimal';
    return 'Excessive';
});

// Virtual for quality category
sleepRecordSchema.virtual('qualityCategory').get(function() {
    if (this.sleepQuality === 5) return 'Excellent';
    if (this.sleepQuality === 4) return 'Good';
    if (this.sleepQuality === 3) return 'Fair';
    if (this.sleepQuality === 2) return 'Poor';
    return 'Very Poor';
});

// Method to check if sleep is healthy
sleepRecordSchema.methods.isHealthySleep = function() {
    // Sleep is healthy if:
    // 1. Hours are between 7-9 (optimal range)
    // 2. Quality is 3 or higher (fair or better)
    const hours = this.sleepHours || 0;
    const quality = this.sleepQuality || 0;
    
    return hours >= 7 && hours <= 9 && quality >= 3;
};

// Static method to get weekly average
sleepRecordSchema.statics.getWeeklyAverage = async function(userId, weeks = 1) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));
    
    const records = await this.find({
        user: userId,
        date: { $gte: startDate }
    });
    
    if (records.length === 0) return null;
    
    const totalHours = records.reduce((sum, record) => sum + record.sleepHours, 0);
    const totalQuality = records.reduce((sum, record) => sum + record.sleepQuality, 0);
    
    return {
        averageSleepHours: totalHours / records.length,
        averageSleepQuality: totalQuality / records.length,
        daysRecorded: records.length,
        period: `Last ${weeks} week(s)`
    };
};

module.exports = mongoose.model('SleepRecord', sleepRecordSchema);
