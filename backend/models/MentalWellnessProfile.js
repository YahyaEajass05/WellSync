/**
 * Mental Wellness Profile Model
 * Extended profile for mental wellness tracking
 */

const mongoose = require('mongoose');

const mentalWellnessProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    occupation: {
        type: String,
        required: [true, 'Occupation is required'],
        trim: true
    },
    workMode: {
        type: String,
        enum: ['Remote', 'Hybrid', 'Office', 'Self-employed', 'Student'],
        required: [true, 'Work mode is required']
    },
    stressLevel: {
        type: Number,
        min: [0, 'Stress level must be at least 0'],
        max: [10, 'Stress level cannot exceed 10'],
        required: true
    },
    productivity: {
        type: Number,
        min: [0, 'Productivity must be at least 0'],
        max: [100, 'Productivity cannot exceed 100'],
        required: true
    },
    exerciseMinutesPerWeek: {
        type: Number,
        min: [0, 'Exercise minutes must be positive'],
        default: 0
    },
    socialHoursPerWeek: {
        type: Number,
        min: [0, 'Social hours must be positive'],
        default: 0
    },
    hasChronicConditions: {
        type: Boolean,
        default: false
    },
    chronicConditions: [{
        type: String,
        trim: true
    }],
    isSeeingTherapist: {
        type: Boolean,
        default: false
    },
    medicationUsage: {
        type: String,
        enum: ['None', 'Occasional', 'Regular', 'Prefer not to say'],
        default: 'None'
    },
    lastAssessmentDate: Date,
    profileCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for wellness score category
mentalWellnessProfileSchema.virtual('stressCategory').get(function() {
    if (this.stressLevel <= 3) return 'Low';
    if (this.stressLevel <= 6) return 'Moderate';
    if (this.stressLevel <= 8) return 'High';
    return 'Very High';
});

// Virtual for productivity category
mentalWellnessProfileSchema.virtual('productivityCategory').get(function() {
    if (this.productivity >= 80) return 'Excellent';
    if (this.productivity >= 60) return 'Good';
    if (this.productivity >= 40) return 'Average';
    return 'Below Average';
});

// Virtual for exercise category
mentalWellnessProfileSchema.virtual('exerciseCategory').get(function() {
    const minutes = this.exerciseMinutesPerWeek;
    if (minutes >= 150) return 'Excellent'; // WHO recommendation
    if (minutes >= 75) return 'Good';
    if (minutes >= 30) return 'Fair';
    return 'Low';
});

// Method to calculate wellness readiness score
mentalWellnessProfileSchema.methods.calculateReadinessScore = function() {
    let score = 0;
    
    // Stress level (inverse - lower is better)
    score += (10 - this.stressLevel) * 10; // max 100
    
    // Productivity
    score += this.productivity; // max 100
    
    // Exercise (minutes per week)
    score += Math.min((this.exerciseMinutesPerWeek / 150) * 100, 100); // max 100
    
    // Social hours (optimal is 7-14 hours per week)
    if (this.socialHoursPerWeek >= 7 && this.socialHoursPerWeek <= 14) {
        score += 100;
    } else if (this.socialHoursPerWeek < 7) {
        score += (this.socialHoursPerWeek / 7) * 100;
    } else {
        score += Math.max(100 - ((this.socialHoursPerWeek - 14) * 5), 0);
    }
    
    return Math.round(score / 4); // Average of 4 metrics
};

// Static method to get profile with user data
mentalWellnessProfileSchema.statics.getProfileWithUser = async function(userId) {
    return await this.findOne({ user: userId }).populate('user', 'firstName lastName email profile');
};

// Pre-save middleware to update profileCompleted status
mentalWellnessProfileSchema.pre('save', function(next) {
    const requiredFields = [
        'occupation', 'workMode', 'stressLevel', 
        'productivity', 'exerciseMinutesPerWeek', 'socialHoursPerWeek'
    ];
    
    this.profileCompleted = requiredFields.every(field => 
        this[field] !== undefined && this[field] !== null && this[field] !== ''
    );
    
    next();
});

module.exports = mongoose.model('MentalWellnessProfile', mentalWellnessProfileSchema);
