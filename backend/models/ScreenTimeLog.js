/**
 * Screen Time Log Model
 * Tracks daily screen time usage patterns
 */

const mongoose = require('mongoose');

const screenTimeLogSchema = new mongoose.Schema({
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
    screenTimeHours: {
        type: Number,
        required: [true, 'Total screen time is required'],
        min: [0, 'Screen time cannot be negative'],
        max: [24, 'Screen time cannot exceed 24 hours']
    },
    workScreenHours: {
        type: Number,
        min: [0, 'Work screen time cannot be negative'],
        max: [24, 'Work screen time cannot exceed 24 hours'],
        default: 0
    },
    leisureScreenHours: {
        type: Number,
        min: [0, 'Leisure screen time cannot be negative'],
        max: [24, 'Leisure screen time cannot exceed 24 hours'],
        default: 0
    },
    deviceTypes: [{
        device: {
            type: String,
            enum: ['smartphone', 'tablet', 'laptop', 'desktop', 'tv', 'other']
        },
        hours: {
            type: Number,
            min: 0
        }
    }],
    appCategories: [{
        category: {
            type: String,
            enum: ['social_media', 'productivity', 'entertainment', 'gaming', 'education', 'other']
        },
        hours: {
            type: Number,
            min: 0
        }
    }],
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    mood: {
        type: String,
        enum: ['very_poor', 'poor', 'neutral', 'good', 'excellent']
    },
    eyeStrain: {
        type: Boolean,
        default: false
    },
    headache: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for user and date (unique per day)
screenTimeLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Index for date range queries
screenTimeLogSchema.index({ user: 1, date: -1 });

// Virtual for screen time category
screenTimeLogSchema.virtual('screenTimeCategory').get(function() {
    const hours = this.screenTimeHours;
    if (hours < 2) return 'Very Low';
    if (hours < 4) return 'Low';
    if (hours < 6) return 'Moderate';
    if (hours < 8) return 'High';
    return 'Very High';
});

// Virtual for work-leisure balance
screenTimeLogSchema.virtual('workLeisureRatio').get(function() {
    if (this.leisureScreenHours === 0) return 'All Work';
    if (this.workScreenHours === 0) return 'All Leisure';
    const ratio = this.workScreenHours / this.leisureScreenHours;
    if (ratio > 2) return 'Work Heavy';
    if (ratio > 0.5) return 'Balanced';
    return 'Leisure Heavy';
});

// Virtual for log age
screenTimeLogSchema.virtual('logAge').get(function() {
    const days = Math.floor((Date.now() - new Date(this.date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
});

// Method to check if screen time is excessive
screenTimeLogSchema.methods.isExcessive = function() {
    return this.screenTimeHours > 8; // More than 8 hours
};

// Method to get health warnings
screenTimeLogSchema.methods.getHealthWarnings = function() {
    const warnings = [];
    
    // Check for excessive total screen time
    if (this.screenTimeHours > 10) {
        warnings.push('Excessive screen time detected (>10 hours)');
    }
    
    // Check for high leisure screen time
    if (this.leisureScreenHours > 5) {
        warnings.push('High leisure screen time (>5 hours)');
    }
    
    // Check for reported physical symptoms
    if (this.eyeStrain) {
        warnings.push('Eye strain reported');
    }
    
    if (this.headache) {
        warnings.push('Headache reported');
    }
    
    // Check for excessive work screen time
    if (this.workScreenHours > 10) {
        warnings.push('Excessive work screen time - consider breaks');
    }
    
    // Always return array (never undefined/null)
    return warnings;
};

// Static method to get weekly average
screenTimeLogSchema.statics.getWeeklyAverage = async function(userId, weeks = 1) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));
    
    const logs = await this.find({
        user: userId,
        date: { $gte: startDate }
    });
    
    if (logs.length === 0) return null;
    
    const totalHours = logs.reduce((sum, log) => sum + log.screenTimeHours, 0);
    const totalWorkHours = logs.reduce((sum, log) => sum + log.workScreenHours, 0);
    const totalLeisureHours = logs.reduce((sum, log) => sum + log.leisureScreenHours, 0);
    
    return {
        averageScreenTime: totalHours / logs.length,
        averageWorkScreen: totalWorkHours / logs.length,
        averageLeisureScreen: totalLeisureHours / logs.length,
        daysLogged: logs.length,
        period: `Last ${weeks} week(s)`
    };
};

// Static method to get screen time trends
screenTimeLogSchema.statics.getTrends = async function(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const trends = await this.find({
        user: userId,
        date: { $gte: startDate }
    })
    .select('date screenTimeHours workScreenHours leisureScreenHours')
    .sort({ date: 1 })
    .lean();
    
    return trends;
};

// Static method to get summary statistics
screenTimeLogSchema.statics.getSummaryStats = async function(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Convert userId to ObjectId properly
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
        ? (typeof userId === 'string' ? mongoose.Types.ObjectId(userId) : userId)
        : userId;
    
    const stats = await this.aggregate([
        {
            $match: {
                user: userObjectId,
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalLogs: { $sum: 1 },
                avgScreenTime: { $avg: '$screenTimeHours' },
                maxScreenTime: { $max: '$screenTimeHours' },
                minScreenTime: { $min: '$screenTimeHours' },
                totalScreenTime: { $sum: '$screenTimeHours' },
                avgWorkScreen: { $avg: '$workScreenHours' },
                avgLeisureScreen: { $avg: '$leisureScreenHours' },
                eyeStrainCount: {
                    $sum: { $cond: ['$eyeStrain', 1, 0] }
                },
                headacheCount: {
                    $sum: { $cond: ['$headache', 1, 0] }
                }
            }
        }
    ]);
    
    return stats.length > 0 ? stats[0] : null;
};

module.exports = mongoose.model('ScreenTimeLog', screenTimeLogSchema);
