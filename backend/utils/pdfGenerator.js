/**
 * PDF Generator Utility - Enhanced Version
 * Generates beautiful, detailed PDF reports for predictions
 * Version 2.0 - Improved layout with no overlapping
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate Prediction Report PDF with enhanced layout
 * @param {Object} user - User data
 * @param {Object} predictionData - Prediction data
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generatePredictionReportPDF = async (user, predictionData) => {
    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 40, bottom: 40, left: 40, right: 40 },
                bufferPages: true,
                info: {
                    Title: 'WellSync Prediction Report',
                    Author: 'WellSync',
                    Subject: 'AI-Powered Wellness Analysis',
                    Creator: 'WellSync Platform'
                }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Constants
            const pageWidth = 595; // A4 width in points
            const pageHeight = 842; // A4 height in points
            const margin = 40;
            const contentWidth = pageWidth - (margin * 2);
            
            const predictionType = predictionData.predictionType === 'mental_wellness' 
                ? 'Mental Wellness' 
                : 'Academic Impact';
            
            const score = predictionData.result.prediction;
            const maxScore = predictionData.predictionType === 'mental_wellness' ? 100 : 10;
            const reportDate = new Date(predictionData.createdAt);
            const reportId = `WS-${reportDate.getTime().toString().slice(-8)}`;

            // ===============================
            // PAGE 1: HEADER & MAIN RESULTS
            // ===============================
            
            // Header Background
            doc.rect(0, 0, pageWidth, 120)
               .fill('#667eea');

            // Logo/Icon
            doc.fontSize(48)
               .fillColor('#ffffff')
               .text('🎯', margin, 25);

            // Title
            doc.fontSize(28)
               .font('Helvetica-Bold')
               .fillColor('#ffffff')
               .text('WellSync', margin + 70, 28);

            doc.fontSize(14)
               .font('Helvetica')
               .fillColor('#f0f0f0')
               .text('AI-Powered Wellness Analysis', margin + 70, 62);

            // Report ID
            doc.fontSize(9)
               .fillColor('#e0e0e0')
               .text(`Report ID: ${reportId}`, margin + 70, 82);

            // Date (right aligned)
            const dateString = reportDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const timeString = reportDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#ffffff')
               .text('Report Generated:', pageWidth - margin - 150, 35, {
                   width: 150,
                   align: 'right'
               });
            
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor('#e0e0e0')
               .text(dateString, pageWidth - margin - 150, 50, {
                   width: 150,
                   align: 'right'
               })
               .text(timeString, pageWidth - margin - 150, 65, {
                   width: 150,
                   align: 'right'
               });

            let yPos = 140;

            // User Information Section
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('REPORT FOR:', margin, yPos);

            yPos += 20;

            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text(`${user.firstName} ${user.lastName}`, margin, yPos);

            yPos += 18;

            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#666666')
               .text(user.email, margin, yPos);

            // Report Type Badge (right side)
            doc.roundedRect(pageWidth - margin - 160, 140, 160, 35, 5)
               .fillAndStroke('#667eea', '#667eea');
            
            doc.fontSize(13)
               .font('Helvetica-Bold')
               .fillColor('#ffffff')
               .text(predictionType.toUpperCase(), pageWidth - margin - 155, 150, {
                   width: 150,
                   align: 'center'
               });

            yPos += 40;

            // Divider line
            doc.moveTo(margin, yPos)
               .lineTo(pageWidth - margin, yPos)
               .stroke('#e0e0e0');

            yPos += 25;

            // ===============================
            // SCORE SECTION (LARGE & PROMINENT)
            // ===============================
            
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('YOUR SCORE', margin, yPos);

            yPos += 30;

            // Score Box
            const scoreBoxHeight = 140;
            doc.roundedRect(margin, yPos, contentWidth, scoreBoxHeight, 10)
               .fillAndStroke('#f8f9fa', '#e0e0e0');

            // Giant Score Number
            doc.fontSize(72)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text(score.toFixed(1), margin + 30, yPos + 30);

            // Max Score
            doc.fontSize(28)
               .font('Helvetica')
               .fillColor('#999999')
               .text(`/ ${maxScore}`, margin + 160, yPos + 60);

            // Interpretation (right side of score box)
            const interpretationText = predictionData.result.interpretation;
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text(interpretationText, margin + 250, yPos + 40, {
                   width: contentWidth - 220,
                   align: 'left'
               });

            // Score bar at bottom of box
            const barY = yPos + scoreBoxHeight - 30;
            const barWidth = contentWidth - 60;
            const scorePercentage = (score / maxScore) * 100;
            const fillWidth = (barWidth * scorePercentage) / 100;

            // Determine color based on score
            let barColor = '#667eea';
            if (predictionData.predictionType === 'mental_wellness') {
                if (score >= 80) barColor = '#28a745';
                else if (score >= 70) barColor = '#667eea';
                else if (score >= 60) barColor = '#ffc107';
                else barColor = '#dc3545';
            } else {
                if (score >= 7) barColor = '#dc3545';
                else if (score >= 5) barColor = '#ffc107';
                else if (score >= 4) barColor = '#667eea';
                else barColor = '#28a745';
            }

            // Background bar
            doc.roundedRect(margin + 30, barY, barWidth, 15, 7)
               .fill('#e0e0e0');

            // Filled bar
            if (fillWidth > 0) {
                doc.roundedRect(margin + 30, barY, fillWidth, 15, 7)
                   .fill(barColor);
            }

            // Percentage text
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#666666')
               .text(`${scorePercentage.toFixed(0)}%`, margin + 30 + barWidth + 10, barY + 3);

            yPos += scoreBoxHeight + 30;

            // ===============================
            // MODEL & ANALYSIS DETAILS
            // ===============================
            
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('ANALYSIS DETAILS', margin, yPos);

            yPos += 25;

            // Simplified Analysis Details Box (Removed technical metrics)
            const detailsBoxHeight = 60;
            doc.roundedRect(margin, yPos, contentWidth, detailsBoxHeight, 8)
               .fillAndStroke('#ffffff', '#e0e0e0');

            let detailY = yPos + 20;

            // Analysis Date Only
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('Analysis Date:', margin + 20, detailY);

            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#333333')
               .text(`${dateString} at ${timeString}`, margin + 180, detailY);

            yPos += detailsBoxHeight + 30;

            // Check if we need a new page
            if (yPos > pageHeight - 150) {
                doc.addPage();
                yPos = margin;
            }

            // ===============================
            // SCORE INTERPRETATION
            // ===============================
            
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('WHAT DOES THIS SCORE MEAN?', margin, yPos);

            yPos += 25;

            const interpretationBox = getScoreInterpretation(predictionData);
            
            doc.roundedRect(margin, yPos, contentWidth, interpretationBox.height, 8)
               .fillAndStroke('#f0f7ff', '#667eea');

            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#333333')
               .text(interpretationBox.text, margin + 20, yPos + 20, {
                   width: contentWidth - 40,
                   align: 'left',
                   lineGap: 5
               });

            yPos += interpretationBox.height + 30;

            // ===============================
            // PAGE 2: RECOMMENDATIONS
            // ===============================
            
            if (yPos > pageHeight - 250) {
                doc.addPage();
                yPos = margin;
            }

            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('PERSONALIZED RECOMMENDATIONS', margin, yPos);

            yPos += 25;

            const recommendations = getDetailedRecommendations(predictionData);
            
            recommendations.forEach((rec, index) => {
                if (yPos > pageHeight - 100) {
                    doc.addPage();
                    yPos = margin;
                }

                // Recommendation box
                const recHeight = 70;
                doc.roundedRect(margin, yPos, contentWidth, recHeight, 8)
                   .fillAndStroke('#ffffff', '#e0e0e0');

                // Number badge
                doc.circle(margin + 20, yPos + 35, 15)
                   .fillAndStroke('#667eea', '#667eea');

                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#ffffff')
                   .text((index + 1).toString(), margin + 15, yPos + 28);

                // Icon
                doc.fontSize(20)
                   .fillColor('#667eea')
                   .text(rec.icon, margin + 50, yPos + 20);

                // Recommendation text
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(rec.text, margin + 80, yPos + 15, {
                       width: contentWidth - 100,
                       align: 'left'
                   });

                yPos += recHeight + 15;
            });

            // INPUT DATA SUMMARY SECTION REMOVED FOR CLEANER REPORT

            // ===============================
            // FOOTER
            // ===============================
            
            const footerY = pageHeight - 60;
            
            doc.moveTo(margin, footerY)
               .lineTo(pageWidth - margin, footerY)
               .stroke('#e0e0e0');

            doc.fontSize(9)
               .font('Helvetica')
               .fillColor('#999999')
               .text('This report is generated by WellSync AI-powered analysis system.', margin, footerY + 10, {
                   width: contentWidth,
                   align: 'center'
               });

            doc.fontSize(9)
               .fillColor('#999999')
               .text('For questions or support, contact: support@wellsync.com', margin, footerY + 25, {
                   width: contentWidth,
                   align: 'center'
               });

            doc.fontSize(8)
               .fillColor('#cccccc')
               .text('(c) 2026 WellSync. All rights reserved. Confidential Report', margin, footerY + 40, {
                   width: contentWidth,
                   align: 'center'
               });

            // Add page numbers
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                   .font('Helvetica')
                   .fillColor('#999999')
                   .text(`Page ${i + 1} of ${pages.count}`, margin, footerY + 40, {
                       width: contentWidth,
                       align: 'right'
                   });
            }

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Get score interpretation text
 */
function getScoreInterpretation(predictionData) {
    const score = predictionData.result.prediction;
    let text = '';
    let height = 80;

    if (predictionData.predictionType === 'mental_wellness') {
        if (score >= 80) {
            text = 'Excellent! Your mental wellness score indicates you are maintaining a very healthy lifestyle. Your habits around sleep, exercise, screen time, and social interaction are well-balanced. Continue these positive patterns to maintain your well-being.';
            height = 90;
        } else if (score >= 70) {
            text = 'Good! Your mental wellness score shows you are generally doing well, but there is room for improvement. Consider focusing on areas where you scored lower, such as sleep quality, exercise frequency, or reducing screen time to further enhance your well-being.';
            height = 100;
        } else if (score >= 60) {
            text = 'Moderate. Your score suggests that while some aspects of your lifestyle are positive, there are significant areas that need attention. Focus on improving sleep, increasing physical activity, and managing stress levels. Small, consistent changes can lead to meaningful improvements.';
            height = 110;
        } else {
            text = 'Below Average. Your mental wellness score indicates that several lifestyle factors may be negatively impacting your well-being. Consider making significant changes to your daily routines, particularly around sleep, exercise, and screen time. Professional support may be beneficial.';
            height = 110;
        }
    } else {
        // Academic Impact
        if (score >= 7) {
            text = 'High Risk. Your score indicates a high level of social media dependency that is likely impacting your academic performance. Immediate action is recommended, including setting strict usage limits, removing apps during study time, and seeking academic support or counseling.';
            height = 110;
        } else if (score >= 5) {
            text = 'Moderate Risk. Your social media usage is showing signs of interfering with your academic life. Consider implementing app blockers, scheduling specific times for social media, and creating phone-free study zones to improve focus and productivity.';
            height = 100;
        } else if (score >= 4) {
            text = 'Low to Moderate Risk. While your social media usage is relatively balanced, there\'s potential for it to become problematic. Be mindful of your usage patterns and ensure academics remain your priority. Maintain boundaries and self-awareness.';
            height = 100;
        } else {
            text = 'Low Risk. Your social media usage appears healthy and balanced with your academic commitments. You demonstrate good self-control and time management. Continue maintaining these healthy boundaries between social media and academic responsibilities.';
            height = 90;
        }
    }

    return { text, height };
}

/**
 * Get detailed recommendations
 */
function getDetailedRecommendations(predictionData) {
    const recommendations = [];
    const score = predictionData.result.prediction;

    if (predictionData.predictionType === 'mental_wellness') {
        if (score >= 80) {
            recommendations.push(
                { icon: '✅', text: 'Excellent! Continue your current healthy lifestyle habits and routines. Your balance is working well.' },
                { icon: '🎯', text: 'Maintain your regular exercise schedule and sleep routines to sustain your high wellness score.' },
                { icon: '🌟', text: 'Consider mentoring others or sharing your wellness practices to help friends and colleagues improve their habits.' }
            );
        } else if (score >= 70) {
            recommendations.push(
                { icon: '💪', text: 'Increase physical activity to 150+ minutes per week. Even light activities like walking can make a significant difference.' },
                { icon: '😴', text: 'Improve sleep quality by maintaining a consistent bedtime, avoiding screens 1 hour before sleep, and creating a dark, cool sleeping environment.' },
                { icon: '📱', text: 'Reduce recreational screen time to under 3 hours daily. Use apps like Digital Wellbeing or Screen Time to track and limit usage.' },
                { icon: '🧘', text: 'Incorporate stress-management techniques like meditation, deep breathing, or yoga for 10-15 minutes daily.' }
            );
        } else if (score >= 60) {
            recommendations.push(
                { icon: '🏃', text: 'Start with 30 minutes of exercise 3-4 times per week. Begin with activities you enjoy like walking, swimming, or cycling.' },
                { icon: '😴', text: 'Prioritize 7-8 hours of sleep nightly. Create a relaxing bedtime routine and avoid caffeine after 2 PM.' },
                { icon: '📵', text: 'Limit total screen time to 8 hours or less. Take regular breaks using the 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds).' },
                { icon: '🤝', text: 'Increase social interaction to 10+ hours per week through activities with friends, family, or community groups.' },
                { icon: '🧘', text: 'Practice stress reduction through meditation apps like Headspace or Calm, or try journaling to process daily stressors.' }
            );
        } else {
            recommendations.push(
                { icon: '🆘', text: 'Consider consulting a mental health professional for personalized guidance and support.' },
                { icon: '🏃', text: 'Start with light exercise like 15-minute daily walks. Gradually increase duration and intensity as you build the habit.' },
                { icon: '😴', text: 'Make sleep your top priority. Aim for consistent sleep and wake times, even on weekends. Remove all screens from the bedroom.' },
                { icon: '📱', text: 'Drastically reduce screen time, especially before bed. Consider a digital detox weekend to reset your habits.' },
                { icon: '🤝', text: 'Reach out to friends and family. Social connection is crucial for mental health - schedule regular meetups or calls.' }
            );
        }
    } else {
        // Academic Impact
        if (score >= 7) {
            recommendations.push(
                { icon: '⚠️', text: 'Limit social media to 1-2 hours per day maximum. Use app blockers like Freedom, Forest, or Cold Turkey during study time.' },
                { icon: '📚', text: 'Create dedicated study zones with zero phone access. Leave your phone in another room or use a timed lock box.' },
                { icon: '👥', text: 'Seek academic counseling or join study groups to rebuild focus and accountability. Don\'t hesitate to ask for help.' },
                { icon: '⏰', text: 'Schedule specific 15-minute breaks for social media after completing study blocks. Use the Pomodoro Technique (25 min study, 5 min break).' },
                { icon: '🔔', text: 'Turn off all non-essential notifications. Consider a "dumb phone" for the semester or use grayscale mode to reduce appeal.' }
            );
        } else if (score >= 5) {
            recommendations.push(
                { icon: '⏰', text: 'Set daily time limits for each social media app (30-45 minutes total). Most phones have built-in digital wellbeing features.' },
                { icon: '📖', text: 'Use website blockers during study hours. Extensions like StayFocusd (Chrome) or LeechBlock (Firefox) work well.' },
                { icon: '🎯', text: 'Schedule specific times for checking social media (e.g., lunch and after dinner only). Batch your usage instead of constant checking.' },
                { icon: '📱', text: 'Keep your phone out of reach during classes and study sessions. The physical distance reduces temptation significantly.' }
            );
        } else if (score >= 4) {
            recommendations.push(
                { icon: '✅', text: 'Good balance! Continue maintaining healthy boundaries between social media and academics.' },
                { icon: '📱', text: 'Turn off non-essential push notifications to minimize distractions and maintain focus during study time.' },
                { icon: '🎓', text: 'Keep prioritizing your academic goals. Your current time management is working - don\'t let it slip.' },
                { icon: '⏰', text: 'Consider using "Do Not Disturb" mode during critical study periods or exams to eliminate all temptations.' }
            );
        } else {
            recommendations.push(
                { icon: '🌟', text: 'Excellent! You demonstrate strong self-control and healthy social media habits. Your academic focus is impressive.' },
                { icon: '📚', text: 'Continue balancing academics and social media effectively. Your approach serves as a great model for others.' },
                { icon: '👍', text: 'Consider sharing your time management strategies with peers who struggle with social media addiction.' },
                { icon: '🎯', text: 'Maintain your current routines and boundaries. Your disciplined approach is yielding positive academic results.' }
            );
        }
    }

    return recommendations;
}

// Input data summary function removed - cleaner report without detailed input listing

/**
 * Save PDF to file (for testing)
 */
exports.savePDFToFile = async (pdfBuffer, filename) => {
    const filePath = path.join(__dirname, '..', 'temp', filename);
    const tempDir = path.join(__dirname, '..', 'temp');
    
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(filePath, pdfBuffer);
    return filePath;
};

module.exports = exports;
