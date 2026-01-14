/**
 * Profile Controller
 * Handles mental wellness and student profile management
 */

const MentalWellnessProfile = require('../models/MentalWellnessProfile');
const StudentProfile = require('../models/StudentProfile');
const ScreenTimeLog = require('../models/ScreenTimeLog');
const SleepRecord = require('../models/SleepRecord');
const SocialMediaUsage = require('../models/SocialMediaUsage');
const MentalHealthAssessment = require('../models/MentalHealthAssessment');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Create or update mental wellness profile
 * @route   POST /api/profiles/mental-wellness
 * @access  Private
 */
exports.createOrUpdateMentalWellnessProfile = asyncHandler(async (req, res) => {
    const profileData = {
        user: req.user.id,
        ...req.body
    };

    const profile = await MentalWellnessProfile.findOneAndUpdate(
        { user: req.user.id },
        profileData,
        { new: true, upsert: true, runValidators: true }
    );

    logger.info(`Mental wellness profile updated for user: ${req.user.email}`);

    // Calculate readiness score
    const readinessScore = profile.calculateReadinessScore();

    res.status(200).json({
        success: true,
        message: 'Mental wellness profile updated successfully',
        data: { 
            profile,
            readinessScore
        }
    });
});

/**
 * @desc    Get mental wellness profile
 * @route   GET /api/profiles/mental-wellness
 * @access  Private
 */
exports.getMentalWellnessProfile = asyncHandler(async (req, res) => {
    const profile = await MentalWellnessProfile.getProfileWithUser(req.user.id);

    if (!profile) {
        return res.status(404).json({
            success: false,
            error: 'Profile not found',
            message: 'Mental wellness profile does not exist'
        });
    }

    res.status(200).json({
        success: true,
        data: { 
            profile,
            readinessScore: profile.calculateReadinessScore()
        }
    });
});

/**
 * @desc    Create or update student profile
 * @route   POST /api/profiles/student
 * @access  Private
 */
exports.createOrUpdateStudentProfile = asyncHandler(async (req, res) => {
    const profileData = {
        user: req.user.id,
        ...req.body
    };

    const profile = await StudentProfile.findOneAndUpdate(
        { user: req.user.id },
        profileData,
        { new: true, upsert: true, runValidators: true }
    );

    logger.info(`Student profile updated for user: ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'Student profile updated successfully',
        data: { 
            profile,
            summary: profile.getSummary()
        }
    });
});

/**
 * @desc    Get student profile
 * @route   GET /api/profiles/student
 * @access  Private
 */
exports.getStudentProfile = asyncHandler(async (req, res) => {
    const profile = await StudentProfile.getProfileWithUser(req.user.id);

    if (!profile) {
        return res.status(404).json({
            success: false,
            error: 'Profile not found',
            message: 'Student profile does not exist'
        });
    }

    res.status(200).json({
        success: true,
        data: { 
            profile,
            summary: profile.getSummary(),
            riskScore: profile.calculateAcademicRisk()
        }
    });
});

/**
 * @desc    Log screen time
 * @route   POST /api/profiles/screen-time
 * @access  Private
 */
exports.logScreenTime = asyncHandler(async (req, res) => {
    const logData = {
        user: req.user.id,
        date: req.body.date || new Date(),
        ...req.body
    };

    // Validate that work + leisure = total (with tolerance)
    if (logData.workScreenHours && logData.leisureScreenHours) {
        const sum = logData.workScreenHours + logData.leisureScreenHours;
        if (Math.abs(sum - logData.screenTimeHours) > 0.5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid data',
                message: 'Work screen hours + Leisure screen hours should equal total screen time'
            });
        }
    }

    const log = await ScreenTimeLog.findOneAndUpdate(
        { user: req.user.id, date: new Date(logData.date).setHours(0, 0, 0, 0) },
        logData,
        { new: true, upsert: true, runValidators: true }
    );

    const warnings = log.getHealthWarnings();

    logger.info(`Screen time logged for user: ${req.user.email} - ${log.screenTimeHours} hours`);

    res.status(200).json({
        success: true,
        message: 'Screen time logged successfully',
        data: { 
            log,
            warnings,
            isExcessive: log.isExcessive()
        }
    });
});

/**
 * @desc    Get screen time logs
 * @route   GET /api/profiles/screen-time
 * @access  Private
 */
exports.getScreenTimeLogs = asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;
    
    try {
        const trends = await ScreenTimeLog.getTrends(req.user.id, parseInt(days));
        const weeklyAverage = await ScreenTimeLog.getWeeklyAverage(req.user.id, Math.ceil(parseInt(days) / 7));
        
        // Stats might fail with ObjectId conversion, handle gracefully
        let stats = null;
        try {
            stats = await ScreenTimeLog.getSummaryStats(req.user.id, parseInt(days));
        } catch (statsError) {
            logger.warn(`Error getting screen time stats: ${statsError.message}`);
            stats = null;
        }

        res.status(200).json({
            success: true,
            data: {
                trends: trends || [],
                stats: stats,
                weeklyAverage: weeklyAverage
            }
        });
    } catch (error) {
        logger.error(`Error getting screen time logs: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Error retrieving screen time logs',
            message: error.message
        });
    }
});

/**
 * @desc    Log sleep record
 * @route   POST /api/profiles/sleep
 * @access  Private
 */
exports.logSleep = asyncHandler(async (req, res) => {
    const sleepData = {
        user: req.user.id,
        date: req.body.date || new Date(),
        ...req.body
    };

    const record = await SleepRecord.findOneAndUpdate(
        { user: req.user.id, date: new Date(sleepData.date).setHours(0, 0, 0, 0) },
        sleepData,
        { new: true, upsert: true, runValidators: true }
    );

    logger.info(`Sleep logged for user: ${req.user.email} - ${record.sleepHours} hours, quality: ${record.sleepQuality}`);

    res.status(200).json({
        success: true,
        message: 'Sleep record logged successfully',
        data: { 
            record,
            isHealthy: record.isHealthySleep()
        }
    });
});

/**
 * @desc    Get sleep records
 * @route   GET /api/profiles/sleep
 * @access  Private
 */
exports.getSleepRecords = asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const records = await SleepRecord.find({
        user: req.user.id,
        date: { $gte: startDate }
    }).sort({ date: -1 });

    const weeklyAverage = await SleepRecord.getWeeklyAverage(req.user.id, Math.ceil(days / 7));

    res.status(200).json({
        success: true,
        data: {
            records,
            weeklyAverage,
            totalRecords: records.length
        }
    });
});

/**
 * @desc    Log social media usage (for students)
 * @route   POST /api/profiles/social-media
 * @access  Private
 */
exports.logSocialMediaUsage = asyncHandler(async (req, res) => {
    // Check if user has student profile
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    
    if (!studentProfile) {
        return res.status(400).json({
            success: false,
            error: 'Student profile required',
            message: 'You must create a student profile before logging social media usage'
        });
    }

    const usageData = {
        student: studentProfile._id,
        date: req.body.date || new Date(),
        ...req.body
    };

    const usage = await SocialMediaUsage.findOneAndUpdate(
        { student: studentProfile._id, date: new Date(usageData.date).setHours(0, 0, 0, 0) },
        usageData,
        { new: true, upsert: true, runValidators: true }
    );

    logger.info(`Social media usage logged for student: ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'Social media usage logged successfully',
        data: { usage }
    });
});

/**
 * @desc    Log mental health assessment (for students)
 * @route   POST /api/profiles/mental-health-assessment
 * @access  Private
 */
exports.logMentalHealthAssessment = asyncHandler(async (req, res) => {
    // Check if user has student profile
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    
    if (!studentProfile) {
        return res.status(400).json({
            success: false,
            error: 'Student profile required',
            message: 'You must create a student profile before logging mental health assessments'
        });
    }

    const assessmentData = {
        student: studentProfile._id,
        date: req.body.date || new Date(),
        ...req.body
    };

    const assessment = await MentalHealthAssessment.create(assessmentData);

    logger.info(`Mental health assessment logged for student: ${req.user.email}`);

    res.status(201).json({
        success: true,
        message: 'Mental health assessment logged successfully',
        data: { assessment }
    });
});

/**
 * @desc    Get complete profile overview
 * @route   GET /api/profiles/overview
 * @access  Private
 */
exports.getProfileOverview = asyncHandler(async (req, res) => {
    const mentalWellnessProfile = await MentalWellnessProfile.findOne({ user: req.user.id });
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    
    // Get recent logs
    const recentScreenTime = await ScreenTimeLog.findOne({ user: req.user.id })
        .sort({ date: -1 });
    const recentSleep = await SleepRecord.findOne({ user: req.user.id })
        .sort({ date: -1 });

    // Get averages
    const screenTimeAverage = await ScreenTimeLog.getWeeklyAverage(req.user.id, 1);
    const sleepAverage = await SleepRecord.getWeeklyAverage(req.user.id, 1);

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: req.user._id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email
            },
            profiles: {
                mentalWellness: mentalWellnessProfile ? {
                    exists: true,
                    completed: mentalWellnessProfile.profileCompleted,
                    readinessScore: mentalWellnessProfile.calculateReadinessScore(),
                    stressCategory: mentalWellnessProfile.stressCategory
                } : { exists: false },
                student: studentProfile ? {
                    exists: true,
                    completed: studentProfile.profileCompleted,
                    academicStanding: studentProfile.academicStanding,
                    riskScore: studentProfile.calculateAcademicRisk()
                } : { exists: false }
            },
            recentActivity: {
                screenTime: recentScreenTime || null,
                sleep: recentSleep || null
            },
            weeklyAverages: {
                screenTime: screenTimeAverage,
                sleep: sleepAverage
            }
        }
    });
});

module.exports = exports;
