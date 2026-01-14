/**
 * Mental Health Assessment Model
 * Stores mental health evaluation results for students
 */

const mongoose = require('mongoose');

const mentalHealthAssessmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    mentalHealthScore: {
        type: Number,
        required: [true, 'Mental health score is required'],
        min: [0, 'Score must be at least 0'],
        max: [10, 'Score cannot exceed 10']
    },
    sleepHoursPerNight: {
        type: Number,
        required: true,
        min: 0,
        max: 24
    },
    assessmentType: {
        type: String,
        enum: ['Self-Assessment', 'Clinical', 'Survey', 'Screening', 'Other'],
        default: 'Self-Assessment'
    },
    anxietyLevel: {
        type: Number,
        min: 0,
        max: 10
    },
    depressionLevel: {
        type: Number,
        min: 0,
        max: 10
    },
    stressLevel: {
        type: Number,
        min: 0,
        max: 10
    },
    notes: {
        type: String,
        maxlength: 1000
    }
}, {
    timestamps: true
});

// Compound index
mentalHealthAssessmentSchema.index({ student: 1, date: -1 });

module.exports = mongoose.model('MentalHealthAssessment', mentalHealthAssessmentSchema);
