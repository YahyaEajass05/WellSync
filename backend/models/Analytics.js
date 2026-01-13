/**
 * Analytics Model
 * Stores aggregated analytics data
 */

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    periodDate: {
        type: Date,
        required: true,
        index: true
    },
    metrics: {
        totalPredictions: {
            type: Number,
            default: 0
        },
        mentalWellness: {
            count: { type: Number, default: 0 },
            average: { type: Number, default: 0 },
            min: { type: Number },
            max: { type: Number },
            trend: { type: String, enum: ['improving', 'declining', 'stable', 'insufficient_data'], default: 'insufficient_data' }
        },
        academicImpact: {
            count: { type: Number, default: 0 },
            average: { type: Number, default: 0 },
            min: { type: Number },
            max: { type: Number },
            trend: { type: String, enum: ['improving', 'declining', 'stable', 'insufficient_data'], default: 'insufficient_data' }
        },
        engagement: {
            activedays: { type: Number, default: 0 },
            favoritePredictions: { type: Number, default: 0 },
            emailsSent: { type: Number, default: 0 }
        }
    },
    insights: [{
        type: {
            type: String,
            enum: ['achievement', 'warning', 'tip', 'milestone']
        },
        message: String,
        severity: {
            type: String,
            enum: ['info', 'warning', 'critical']
        }
    }]
}, {
    timestamps: true
});

// Compound indexes
analyticsSchema.index({ user: 1, period: 1, periodDate: -1 });
analyticsSchema.index({ periodDate: 1 });

// Static method to update or create analytics
analyticsSchema.statics.updateAnalytics = async function(userId, period, periodDate, metrics) {
    return await this.findOneAndUpdate(
        { user: userId, period, periodDate },
        { $set: { metrics } },
        { upsert: true, new: true }
    );
};

// Static method to get analytics for period
analyticsSchema.statics.getAnalytics = async function(userId, period, startDate, endDate) {
    return await this.find({
        user: userId,
        period,
        periodDate: { $gte: startDate, $lte: endDate }
    }).sort({ periodDate: 1 });
};

// Static method to calculate trend
analyticsSchema.statics.calculateTrend = function(currentAvg, previousAvg, threshold = 2) {
    if (!previousAvg || !currentAvg) return 'insufficient_data';
    
    const difference = currentAvg - previousAvg;
    const percentChange = (difference / previousAvg) * 100;
    
    if (Math.abs(percentChange) < threshold) return 'stable';
    return percentChange > 0 ? 'improving' : 'declining';
};

module.exports = mongoose.model('Analytics', analyticsSchema);
