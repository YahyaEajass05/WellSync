/**
 * Student Profile Model
 * Extended profile for students (academic context)
 */

const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    studentId: {
        type: String,
        trim: true,
        sparse: true // Allows multiple null values but unique if provided
    },
    academicLevel: {
        type: String,
        enum: ['High School', 'Bachelor', 'Master', 'PhD', 'Other'],
        required: [true, 'Academic level is required']
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    institution: {
        type: String,
        trim: true
    },
    major: {
        type: String,
        trim: true
    },
    yearOfStudy: {
        type: Number,
        min: 1,
        max: 10
    },
    enrollmentYear: {
        type: Number,
        min: 2000,
        max: 2100
    },
    expectedGraduationYear: {
        type: Number,
        min: 2000,
        max: 2100
    },
    gpa: {
        type: Number,
        min: [0, 'GPA must be at least 0'],
        max: [4.0, 'GPA cannot exceed 4.0']
    },
    relationshipStatus: {
        type: String,
        enum: ['Single', 'In a relationship', 'Married', 'Prefer not to say'],
        default: 'Prefer not to say'
    },
    livingArrangement: {
        type: String,
        enum: ['On-campus', 'Off-campus alone', 'Off-campus with roommates', 'With family', 'Other'],
        default: 'Other'
    },
    partTimeJob: {
        type: Boolean,
        default: false
    },
    hoursWorkedPerWeek: {
        type: Number,
        min: 0,
        max: 40,
        default: 0
    },
    financialStress: {
        type: String,
        enum: ['None', 'Low', 'Moderate', 'High', 'Very High'],
        default: 'None'
    },
    studyHoursPerWeek: {
        type: Number,
        min: 0,
        default: 0
    },
    attendanceRate: {
        type: Number,
        min: 0,
        max: 100
    },
    extracurricularActivities: [{
        type: String,
        trim: true
    }],
    academicGoals: [{
        type: String,
        trim: true
    }],
    profileCompleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for academic standing
studentProfileSchema.virtual('academicStanding').get(function() {
    if (!this.gpa) return 'Not Available';
    if (this.gpa >= 3.7) return 'Excellent';
    if (this.gpa >= 3.3) return 'Good';
    if (this.gpa >= 2.7) return 'Average';
    if (this.gpa >= 2.0) return 'Below Average';
    return 'At Risk';
});

// Virtual for years in program
studentProfileSchema.virtual('yearsInProgram').get(function() {
    if (!this.enrollmentYear) return null;
    return new Date().getFullYear() - this.enrollmentYear;
});

// Virtual for work-study balance
studentProfileSchema.virtual('workStudyBalance').get(function() {
    const totalHours = this.studyHoursPerWeek + this.hoursWorkedPerWeek;
    if (totalHours > 60) return 'Overloaded';
    if (totalHours > 40) return 'Busy';
    if (totalHours > 20) return 'Balanced';
    return 'Light';
});

// Method to calculate academic risk score
studentProfileSchema.methods.calculateAcademicRisk = function() {
    let riskScore = 0;
    
    // Low GPA increases risk
    if (this.gpa && this.gpa < 2.5) riskScore += 30;
    else if (this.gpa && this.gpa < 3.0) riskScore += 15;
    
    // High work hours increase risk
    if (this.hoursWorkedPerWeek > 20) riskScore += 20;
    else if (this.hoursWorkedPerWeek > 15) riskScore += 10;
    
    // Financial stress increases risk
    const stressMap = { 'None': 0, 'Low': 5, 'Moderate': 15, 'High': 25, 'Very High': 35 };
    riskScore += stressMap[this.financialStress] || 0;
    
    // Low study hours increase risk
    if (this.studyHoursPerWeek < 10) riskScore += 20;
    else if (this.studyHoursPerWeek < 20) riskScore += 10;
    
    // Poor attendance increases risk
    if (this.attendanceRate && this.attendanceRate < 70) riskScore += 25;
    else if (this.attendanceRate && this.attendanceRate < 85) riskScore += 15;
    
    return Math.min(riskScore, 100);
};

// Method to get student summary
studentProfileSchema.methods.getSummary = function() {
    return {
        id: this._id,
        academicLevel: this.academicLevel,
        academicStanding: this.academicStanding,
        yearsInProgram: this.yearsInProgram,
        workStudyBalance: this.workStudyBalance,
        riskScore: this.calculateAcademicRisk(),
        profileCompleted: this.profileCompleted
    };
};

// Static method to get profile with user data
studentProfileSchema.statics.getProfileWithUser = async function(userId) {
    return await this.findOne({ user: userId }).populate('user', 'firstName lastName email profile');
};

// Static method to get students by academic level
studentProfileSchema.statics.getByAcademicLevel = async function(academicLevel) {
    return await this.find({ academicLevel, isActive: true }).populate('user', 'firstName lastName email');
};

// Pre-save middleware to update profileCompleted status
studentProfileSchema.pre('save', function(next) {
    const requiredFields = [
        'academicLevel', 'country', 'relationshipStatus'
    ];
    
    this.profileCompleted = requiredFields.every(field => 
        this[field] !== undefined && this[field] !== null && this[field] !== ''
    );
    
    next();
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
