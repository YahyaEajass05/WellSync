/**
 * Prediction Model
 * Stores prediction history for users
 */

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    predictionType: {
        type: String,
        enum: ['mental_wellness', 'academic_impact'],
        required: true,
        index: true
    },
    inputData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    result: {
        prediction: {
            type: Number,
            required: true
        },
        interpretation: String,
        modelName: String,
        confidenceMetrics: {
            modelR2Score: Number,
            modelMAE: Number
        },
        inputFeaturesProcessed: Number
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        processingTime: Number, // in milliseconds
        apiVersion: String
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient queries
predictionSchema.index({ user: 1, createdAt: -1 });
predictionSchema.index({ user: 1, predictionType: 1 });
predictionSchema.index({ createdAt: -1 });

// Virtual for prediction age
predictionSchema.virtual('predictionAge').get(function() {
    const days = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
});

// Static method to get user statistics
predictionSchema.statics.getUserStats = async function(userId) {
    // Convert userId to ObjectId
    const objectId = mongoose.Types.ObjectId.isValid(userId) 
        ? (typeof userId === 'string' ? mongoose.Types.ObjectId(userId) : userId)
        : userId;
    
    const stats = await this.aggregate([
        { $match: { user: objectId } },
        {
            $group: {
                _id: '$predictionType',
                count: { $sum: 1 },
                averagePrediction: { $avg: '$result.prediction' },
                minPrediction: { $min: '$result.prediction' },
                maxPrediction: { $max: '$result.prediction' },
                latestPrediction: { $max: '$createdAt' },
                firstPrediction: { $min: '$createdAt' }
            }
        }
    ]);
    
    return stats;
};

// Static method to get prediction trends
predictionSchema.statics.getPredictionTrends = async function(userId, predictionType, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const trends = await this.find({
        user: userId,
        predictionType: predictionType,
        createdAt: { $gte: startDate }
    })
    .select('result.prediction createdAt')
    .sort({ createdAt: 1 })
    .lean();
    
    return trends;
};

module.exports = mongoose.model('Prediction', predictionSchema);
