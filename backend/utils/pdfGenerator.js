/**
 * Enhanced PDF Generator - Professional Reports
 * Includes: Input Data, Output, Recommendations, Professional Layout
 * Supports: Mental Wellness, Stress Level, Academic Impact
 */

const PDFDocument = require('pdfkit');

exports.generatePredictionReportPDF = async (user, predictionData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Determine prediction type
            const predictionType = predictionData.predictionType === 'mental_wellness' 
                ? 'Mental Wellness' 
                : predictionData.predictionType === 'stress_level'
                ? 'Stress Level'
                : 'Academic Impact';
            
            const score = predictionData.result.prediction;
            const maxScore = predictionData.predictionType === 'mental_wellness' ? 100 
                : predictionData.predictionType === 'stress_level' ? 10 
                : 9;
            
            const reportDate = new Date(predictionData.createdAt);
            const dateString = reportDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // ============= PAGE 1: HEADER & RESULTS =============
            
            // Header with gradient effect
            doc.rect(0, 0, 595, 120).fill('#667eea');
            
            doc.fontSize(36)
               .font('Helvetica-Bold')
               .fillColor('#ffffff')
               .text('WellSync', 50, 35);
            
            doc.fontSize(14)
               .font('Helvetica')
               .fillColor('#ffffff')
               .text('AI-Powered Wellness Analysis Report', 50, 80);

            // Report type badge
            doc.roundedRect(400, 35, 145, 30, 5)
               .fill('#ffffff');
            
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text(predictionType.toUpperCase(), 400, 45, { width: 145, align: 'center' });

            // User Information Section
            let y = 150;
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('REPORT DETAILS', 50, y);
            
            doc.moveTo(50, y + 18).lineTo(545, y + 18).stroke('#e0e0e0');
            
            y += 30;
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#666666')
               .text('Patient Name:', 50, y)
               .font('Helvetica')
               .text(`${user.firstName} ${user.lastName}`, 150, y);
            
            y += 20;
            doc.font('Helvetica-Bold')
               .text('Email:', 50, y)
               .font('Helvetica')
               .text(user.email, 150, y);
            
            y += 20;
            doc.font('Helvetica-Bold')
               .text('Report Date:', 50, y)
               .font('Helvetica')
               .text(dateString, 150, y);
            
            y += 20;
            doc.font('Helvetica-Bold')
               .text('Analysis Type:', 50, y)
               .font('Helvetica')
               .text(predictionType, 150, y);
            
            y += 20;
            doc.font('Helvetica-Bold')
               .text('Model Used:', 50, y)
               .font('Helvetica')
               .text(predictionData.result.modelName || predictionData.result.model_name || 'AI Model', 150, y);

            // Main Score Display
            y += 50;
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('YOUR RESULT', 50, y);
            
            doc.moveTo(50, y + 18).lineTo(545, y + 18).stroke('#e0e0e0');
            
            y += 35;
            doc.roundedRect(50, y, 495, 120, 10)
               .fill('#f8f9fa');
            
            // Score number
            doc.fontSize(72)
               .font('Helvetica-Bold')
               .fillColor(getScoreColor(score, predictionData.predictionType))
               .text(score.toFixed(1), 70, y + 25);
            
            doc.fontSize(24)
               .font('Helvetica')
               .fillColor('#999999')
               .text(`/ ${maxScore}`, 200, y + 55);
            
            // Interpretation
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text(predictionData.result.interpretation, 280, y + 30, {
                   width: 245,
                   align: 'left'
               });
            
            // Category badge for stress
            if (predictionData.predictionType === 'stress_level') {
                const category = getStressCategory(score);
                doc.fontSize(12)
                   .font('Helvetica')
                   .fillColor('#666666')
                   .text(category, 280, y + 85);
            }

            // Progress Bar
            y += 130;
            const barWidth = 450;
            const fillWidth = (barWidth * score / maxScore);
            
            doc.rect(70, y, barWidth, 16)
               .fill('#e0e0e0');
            
            doc.rect(70, y, fillWidth, 16)
               .fill(getScoreColor(score, predictionData.predictionType));
            
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#666666')
               .text(`${((score/maxScore)*100).toFixed(0)}%`, 530, y + 3);

            // ============= PAGE 2: INPUT DATA =============
            
            doc.addPage();
            y = 50;
            
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('INPUT DATA SUMMARY', 50, y);
            
            doc.moveTo(50, y + 25).lineTo(545, y + 25).stroke('#667eea');
            
            y += 40;
            
            // Display input data
            const inputData = predictionData.inputData || predictionData.input || {};
            const inputFields = Object.entries(inputData);
            
            // Create two columns
            const col1X = 50;
            const col2X = 310;
            let currentCol = col1X;
            let colCount = 0;
            
            inputFields.forEach(([key, value]) => {
                const displayKey = formatFieldName(key);
                const displayValue = formatFieldValue(value);
                
                doc.fontSize(9)
                   .font('Helvetica-Bold')
                   .fillColor('#666666')
                   .text(displayKey + ':', currentCol, y);
                
                doc.fontSize(9)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(displayValue, currentCol, y + 12);
                
                y += 30;
                colCount++;
                
                // Switch to second column after half
                if (colCount === Math.ceil(inputFields.length / 2)) {
                    y = 90;
                    currentCol = col2X;
                }
                
                // New page if needed
                if (y > 720) {
                    doc.addPage();
                    y = 50;
                    currentCol = col1X;
                }
            });

            // ============= PAGE 3: ANALYSIS & RECOMMENDATIONS =============
            
            doc.addPage();
            y = 50;
            
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('DETAILED ANALYSIS', 50, y);
            
            doc.moveTo(50, y + 25).lineTo(545, y + 25).stroke('#667eea');
            
            y += 40;
            
            // Interpretation box
            const interpretation = getDetailedInterpretation(predictionData);
            
            doc.roundedRect(50, y, 495, 100, 8)
               .fill('#e8f4f8');
            
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#333333')
               .text(interpretation, 70, y + 20, {
                   width: 455,
                   align: 'left',
                   lineGap: 3
               });
            
            y += 120;
            
            // Recommendations Section
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('PERSONALIZED RECOMMENDATIONS', 50, y);
            
            doc.moveTo(50, y + 25).lineTo(545, y + 25).stroke('#667eea');
            
            y += 40;
            
            const recommendations = getDetailedRecommendations(predictionData);
            
            recommendations.forEach((rec, index) => {
                // Check if we need a new page
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                
                doc.roundedRect(50, y, 495, 70, 8)
                   .stroke('#e0e0e0');
                
                // Number circle
                doc.circle(70, y + 35, 14)
                   .fill('#667eea');
                
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#ffffff')
                   .text((index + 1).toString(), 66, y + 28);
                
                // Recommendation text
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(rec, 100, y + 18, {
                       width: 430,
                       align: 'left',
                       lineGap: 2
                   });
                
                y += 80;
            });

            // ============= FINAL PAGE: DISCLAIMER & FOOTER =============
            
            // Add disclaimer at the bottom of the last page
            if (y > 650) {
                doc.addPage();
                y = 50;
            } else {
                y += 30;
            }
            
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#666666')
               .text('IMPORTANT DISCLAIMER', 50, y);
            
            y += 20;
            
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor('#666666')
               .text(
                   'This report is generated by AI algorithms and is intended for informational purposes only. ' +
                   'It should not be used as a substitute for professional medical advice, diagnosis, or treatment. ' +
                   'If you are experiencing severe stress, anxiety, depression, or other mental health concerns, ' +
                   'please consult with a qualified healthcare professional immediately.',
                   50, y, {
                       width: 495,
                       align: 'justify',
                       lineGap: 2
                   }
               );
            
            // Add footer to last page only (avoid switchToPage issues)
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#999999')
               .text(
                   'WellSync AI-Powered Wellness Analysis | Confidential Report',
                   50, 780,
                   { width: 495, align: 'center' }
               );
            
            doc.text(
                'For recipient use only | wellsync.lk@gmail.com | © 2026 WellSync',
                50, 795,
                { width: 495, align: 'center' }
            );

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

// Helper Functions

function getScoreColor(score, type) {
    if (type === 'mental_wellness') {
        if (score >= 80) return '#28a745'; // Green
        if (score >= 70) return '#17a2b8'; // Cyan
        if (score >= 60) return '#ffc107'; // Yellow
        return '#dc3545'; // Red
    } else if (type === 'stress_level') {
        if (score >= 8) return '#dc3545'; // Red - Very High
        if (score >= 6) return '#fd7e14'; // Orange - High
        if (score >= 3) return '#ffc107'; // Yellow - Moderate
        return '#28a745'; // Green - Low
    } else { // academic_impact
        if (score >= 7) return '#dc3545'; // Red - High risk
        if (score >= 5) return '#ffc107'; // Yellow - Moderate
        return '#28a745'; // Green - Low risk
    }
}

function getStressCategory(score) {
    if (score >= 8) return 'Very High Stress';
    if (score >= 6) return 'High Stress';
    if (score >= 3) return 'Moderate Stress';
    return 'Low Stress';
}

function formatFieldName(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace(/0 10/g, '(0-10)')
        .replace(/1 5/g, '(1-5)')
        .replace(/0 100/g, '(0-100)');
}

function formatFieldValue(value) {
    if (typeof value === 'number') {
        return value.toFixed(2);
    }
    return String(value);
}

function getDetailedInterpretation(predictionData) {
    const score = predictionData.result.prediction;
    const type = predictionData.predictionType;
    
    if (type === 'mental_wellness') {
        if (score >= 80) {
            return 'Excellent! Your mental wellness score indicates that you are maintaining very healthy lifestyle habits. ' +
                   'Your current patterns of sleep, exercise, screen time management, and social engagement are working well for you. ' +
                   'Continue these positive behaviors to maintain your high level of wellbeing.';
        } else if (score >= 70) {
            return 'Good work! Your mental wellness is in a healthy range, though there is room for improvement. ' +
                   'Consider focusing on areas like sleep quality, exercise frequency, or stress management to enhance your overall wellbeing further. ' +
                   'Small adjustments to your daily routine could yield significant benefits.';
        } else if (score >= 60) {
            return 'Your mental wellness score suggests that several lifestyle factors need attention. ' +
                   'Focus on improving sleep habits, increasing physical activity, reducing excessive screen time, and managing stress more effectively. ' +
                   'These changes can significantly improve your mental and physical health.';
        } else {
            return 'Your score indicates that multiple lifestyle factors may be significantly impacting your wellbeing. ' +
                   'We strongly recommend making comprehensive changes to your daily routines, including sleep, exercise, screen time, and stress management. ' +
                   'Consider seeking support from a mental health professional for personalized guidance.';
        }
    } else if (type === 'stress_level') {
        if (score >= 8) {
            return 'URGENT: Your stress levels are critically high. This level of chronic stress can have serious impacts on your physical and mental health. ' +
                   'We strongly recommend seeking professional mental health support immediately. ' +
                   'Implement stress-reduction techniques, prioritize rest, and consider speaking with a counselor or therapist about your stressors.';
        } else if (score >= 6) {
            return 'Your stress levels are elevated and concerning. Prolonged high stress can negatively affect your health, relationships, and productivity. ' +
                   'Take immediate action to reduce stressors in your life. Focus on improving sleep, practicing relaxation techniques, and seeking support. ' +
                   'Consider professional counseling if stress persists.';
        } else if (score >= 3) {
            return 'Your stress levels are moderate and manageable but require monitoring. ' +
                   'You are experiencing normal stress levels that most people encounter, but it\'s important to prevent escalation. ' +
                   'Maintain healthy habits, practice stress management techniques regularly, and ensure adequate rest and social support.';
        } else {
            return 'Excellent stress management! Your stress levels are low and well-controlled. ' +
                   'You are effectively managing life\'s challenges and maintaining good mental health. ' +
                   'Continue your current healthy lifestyle practices and stress management techniques to maintain this positive state.';
        }
    } else { // academic_impact
        if (score >= 7) {
            return 'High Risk Alert: Your social media usage patterns suggest a significant addiction that is likely impacting your academic performance substantially. ' +
                   'Immediate intervention is recommended. Set strict usage limits, use app blockers during study times, and consider seeking academic counseling. ' +
                   'Your educational success may depend on changing these digital habits now.';
        } else if (score >= 5) {
            return 'Moderate Risk: Your social media usage shows signs of interfering with your academic commitments. ' +
                   'While not critical, these patterns could lead to declining performance if not addressed. ' +
                   'Implement time management strategies, set daily usage limits, and create phone-free study environments.';
        } else {
            return 'Low Risk: Your social media usage appears balanced and healthy relative to your academic commitments. ' +
                   'You are successfully managing digital engagement alongside your studies. ' +
                   'Continue maintaining these good boundaries and time management practices.';
        }
    }
}

function getDetailedRecommendations(predictionData) {
    const score = predictionData.result.prediction;
    const type = predictionData.predictionType;
    
    // Use AI model recommendations if available
    if (predictionData.result.recommendations && Array.isArray(predictionData.result.recommendations)) {
        return predictionData.result.recommendations;
    }
    
    const recs = [];
    
    if (type === 'mental_wellness') {
        if (score >= 70) {
            recs.push(
                'Continue your excellent sleep schedule: Maintain 7-9 hours of quality sleep each night with consistent bedtimes.',
                'Enhance your exercise routine: Aim for 150+ minutes of moderate aerobic activity per week, plus strength training twice weekly.',
                'Optimize screen time: Keep recreational screen use under 3 hours daily, with no screens 1 hour before bedtime.',
                'Strengthen social connections: Schedule regular quality time with friends and family, at least 10-15 hours weekly.',
                'Practice daily mindfulness: Dedicate 10-15 minutes to meditation, deep breathing, or journaling to maintain mental clarity.'
            );
        } else {
            recs.push(
                'Establish a consistent sleep routine: Set a regular bedtime, create a relaxing pre-sleep ritual, and aim for 7-9 hours nightly.',
                'Start a gentle exercise program: Begin with 30 minutes of walking or light activity 3-4 times per week, gradually increasing intensity.',
                'Reduce screen time significantly: Limit total daily screen use to 8 hours or less, taking 5-minute breaks every hour.',
                'Increase social engagement: Reach out to friends and family regularly, join social groups or clubs that interest you.',
                'Seek professional support: Consider consulting with a mental health professional or wellness coach for personalized guidance.',
                'Practice stress reduction: Learn and apply relaxation techniques such as progressive muscle relaxation or guided meditation.'
            );
        }
    } else if (type === 'stress_level') {
        if (score >= 8) {
            recs.push(
                'URGENT: Seek professional mental health support immediately from a licensed therapist or counselor.',
                'Practice emergency stress relief: Use deep breathing exercises (4-7-8 technique) multiple times daily, especially when feeling overwhelmed.',
                'Prioritize restorative sleep: Aim for 8-9 hours of sleep nightly. Create a dark, quiet, cool sleeping environment.',
                'Eliminate non-essential stressors: Review your commitments and temporarily remove or delegate tasks where possible.',
                'Take frequent breaks: Step away from work/study every 45-60 minutes for at least 5-10 minutes of movement or relaxation.',
                'Reduce screen exposure: Limit screen time to essential activities only, especially avoiding screens 2 hours before bed.',
                'Engage in gentle physical activity: Even a 10-minute walk can reduce stress hormones significantly.',
                'Connect with support systems: Talk to trusted friends, family members, or join a support group to share your experiences.'
            );
        } else if (score >= 6) {
            recs.push(
                'Implement daily stress management: Practice meditation, yoga, or progressive muscle relaxation for 15-20 minutes daily.',
                'Improve sleep quality and duration: Establish a calming bedtime routine and aim for 7-9 hours of quality sleep.',
                'Reduce screen time: Cut back screen use by 1-2 hours daily, particularly avoiding screens before bedtime.',
                'Create regular work breaks: Use the Pomodoro Technique (25 minutes work, 5 minutes break) to prevent stress buildup.',
                'Exercise regularly: Engage in moderate aerobic exercise for 30-45 minutes, 4-5 times per week.',
                'Consider professional counseling: Speaking with a therapist can provide valuable stress management strategies.'
            );
        } else if (score >= 3) {
            recs.push(
                'Continue monitoring stress levels: Keep a stress journal to identify patterns and triggers.',
                'Maintain healthy sleep habits: Stick to your 7-9 hour sleep schedule with consistent times.',
                'Keep up regular exercise: Continue your current physical activity routine to manage stress naturally.',
                'Practice weekly mindfulness: Dedicate time each week to meditation, yoga, or other relaxation practices.',
                'Balance work and leisure: Ensure you have adequate time for hobbies, socializing, and relaxation.'
            );
        } else {
            recs.push(
                'Excellent work! Continue your current stress management practices that are working so well.',
                'Maintain your healthy lifestyle habits: Keep up your good sleep, exercise, and work-life balance.',
                'Stay proactive: Continue using stress management techniques even when stress is low to build resilience.',
                'Support others: Share your successful stress management strategies with friends or family who may be struggling.',
                'Keep building resilience: Try new stress management techniques to expand your coping toolkit for future challenges.'
            );
        }
    } else { // academic_impact
        if (score >= 7) {
            recs.push(
                'Set strict time limits: Use built-in app timers to limit social media to maximum 1-2 hours per day.',
                'Install app blockers: Use tools like Freedom, Cold Turkey, or Forest during study hours to prevent access.',
                'Create phone-free study zones: Physically remove your phone from your study area, keeping it in another room.',
                'Schedule specific social media times: Allow yourself designated 15-minute social media breaks, but only after completing study goals.',
                'Seek academic support: Meet with academic advisors or tutors to develop better study strategies.',
                'Consider professional help: Talk to a counselor about developing healthier digital habits and addressing potential addiction.',
                'Delete or disable the most addictive apps: Remove apps that consume most of your time for at least 30 days.',
                'Find offline alternatives: Replace scrolling time with in-person social activities, reading, or hobbies.'
            );
        } else if (score >= 5) {
            recs.push(
                'Limit daily usage: Set a goal of 2-3 hours maximum social media use per day using screen time tracking.',
                'Disable notifications: Turn off all non-essential notifications during study hours and before bed.',
                'Use productivity techniques: Apply the Pomodoro method (25 min focus, 5 min break) with phone kept away.',
                'Schedule social media time: Choose specific times for checking social media rather than constant checking.',
                'Track your usage: Use apps to monitor your daily usage and set weekly reduction goals.'
            );
        } else {
            recs.push(
                'Maintain your healthy habits: Continue your balanced approach to social media and academics.',
                'Stay aware: Keep monitoring your usage patterns to ensure they remain balanced.',
                'Use Do Not Disturb: Continue using focus modes during critical study or work periods.',
                'Be a role model: Share your strategies with peers who may struggle with social media balance.'
            );
        }
    }
    
    return recs;
}

module.exports = exports;
