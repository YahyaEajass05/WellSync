/**
 * PDF Generator Utility
 * Generates beautiful PDF reports for predictions
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate Prediction Report PDF
 * @param {Object} user - User data
 * @param {Object} predictionData - Prediction data
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generatePredictionReportPDF = async (user, predictionData) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: 'WellSync Prediction Report',
                    Author: 'WellSync',
                    Subject: 'Mental Wellness & Academic Impact Report'
                }
            });

            // Buffer to store PDF
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const predictionType = predictionData.predictionType === 'mental_wellness' 
                ? 'Mental Wellness' 
                : 'Academic Impact';
            
            const score = predictionData.result.prediction;
            const maxScore = predictionData.predictionType === 'mental_wellness' ? 100 : 10;

            // ============= HEADER =============
            // Add gradient background for header (simulated with rectangles)
            doc.rect(0, 0, doc.page.width, 120).fill('#667eea');
            
            // Add logo/icon
            doc.fontSize(48)
               .fillColor('#ffffff')
               .text('🎯', 50, 30);

            // Add title
            doc.fontSize(28)
               .font('Helvetica-Bold')
               .fillColor('#ffffff')
               .text('WellSync', 110, 35);

            doc.fontSize(14)
               .font('Helvetica')
               .fillColor('#f0f0f0')
               .text('AI-Powered Wellness Analysis', 110, 70);

            // Add date
            const reportDate = new Date(predictionData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            doc.fontSize(10)
               .fillColor('#e0e0e0')
               .text(`Report Generated: ${reportDate}`, doc.page.width - 250, 45);

            // ============= USER INFO SECTION =============
            let yPos = 150;

            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('Report For:', 50, yPos);

            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#666666')
               .text(`${user.firstName} ${user.lastName}`, 50, yPos + 20)
               .text(user.email, 50, yPos + 35);

            // Add report type badge
            doc.roundedRect(doc.page.width - 200, yPos, 150, 30, 5)
               .fillAndStroke('#667eea', '#667eea');
            
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#ffffff')
               .text(predictionType, doc.page.width - 195, yPos + 8, {
                   width: 140,
                   align: 'center'
               });

            yPos += 80;

            // ============= SCORE SECTION =============
            // Draw score box with gradient effect
            doc.roundedRect(50, yPos, doc.page.width - 100, 120, 10)
               .fillAndStroke('#f5f7fa', '#e0e0e0');

            // Score label
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('Your Score', 70, yPos + 20);

            // Big score number
            doc.fontSize(60)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text(score.toFixed(1), 70, yPos + 45);

            doc.fontSize(24)
               .font('Helvetica')
               .fillColor('#999999')
               .text(`/ ${maxScore}`, 180, yPos + 65);

            // Score interpretation
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text(predictionData.result.interpretation, 280, yPos + 35, {
                   width: 250,
                   align: 'left'
               });

            // Visual score bar
            const barWidth = 450;
            const barHeight = 15;
            const scorePercentage = (score / maxScore) * 100;
            const fillWidth = (barWidth * scorePercentage) / 100;

            yPos += 130;

            // Background bar
            doc.roundedRect(70, yPos, barWidth, barHeight, 7)
               .fill('#e0e0e0');

            // Filled bar with color based on score
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

            doc.roundedRect(70, yPos, fillWidth, barHeight, 7)
               .fill(barColor);

            yPos += 40;

            // ============= ANALYSIS DETAILS SECTION =============
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('Analysis Details', 50, yPos);

            yPos += 30;

            // Details box
            doc.roundedRect(50, yPos, doc.page.width - 100, 100, 10)
               .fillAndStroke('#ffffff', '#e0e0e0');

            // Model name
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('AI Model:', 70, yPos + 20);

            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#333333')
               .text(predictionData.result.modelName || 'Advanced ML Model', 180, yPos + 20);

            // Accuracy
            if (predictionData.result.confidence) {
                doc.fontSize(11)
                   .font('Helvetica-Bold')
                   .fillColor('#667eea')
                   .text('Model Accuracy:', 70, yPos + 45);

                const r2Score = predictionData.result.confidence.r2Score || 
                               predictionData.result.confidence.model_r2_score || 0.89;
                
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(`${(r2Score * 100).toFixed(1)}% (R² Score: ${r2Score.toFixed(4)})`, 180, yPos + 45);
            }

            // Processing time
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('Analysis Date:', 70, yPos + 70);

            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#333333')
               .text(reportDate, 180, yPos + 70);

            yPos += 130;

            // ============= RECOMMENDATIONS SECTION =============
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('Recommendations', 50, yPos);

            yPos += 30;

            const recommendations = getDetailedRecommendations(predictionData);
            
            recommendations.forEach((rec, index) => {
                // Recommendation box
                doc.roundedRect(50, yPos, doc.page.width - 100, 50, 8)
                   .fillAndStroke('#f8f9fa', '#e0e0e0');

                // Icon
                doc.fontSize(20)
                   .fillColor('#667eea')
                   .text(rec.icon, 65, yPos + 15);

                // Text
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(rec.text, 100, yPos + 10, {
                       width: doc.page.width - 170,
                       align: 'left'
                   });

                yPos += 60;
            });

            // ============= FOOTER =============
            yPos = doc.page.height - 100;

            // Footer separator line
            doc.moveTo(50, yPos)
               .lineTo(doc.page.width - 50, yPos)
               .stroke('#e0e0e0');

            yPos += 15;

            // Footer text
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor('#999999')
               .text('This report is generated by WellSync AI-powered analysis system.', 50, yPos, {
                   width: doc.page.width - 100,
                   align: 'center'
               });

            doc.fontSize(9)
               .fillColor('#999999')
               .text('For questions or support, contact: support@wellsync.com', 50, yPos + 15, {
                   width: doc.page.width - 100,
                   align: 'center'
               });

            doc.fontSize(8)
               .fillColor('#cccccc')
               .text('© 2026 WellSync. All rights reserved.', 50, yPos + 35, {
                   width: doc.page.width - 100,
                   align: 'center'
               });

            // Finalize the PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Get detailed recommendations based on prediction
 */
function getDetailedRecommendations(predictionData) {
    const recommendations = [];

    if (predictionData.predictionType === 'mental_wellness') {
        const score = predictionData.result.prediction;

        if (score >= 80) {
            recommendations.push(
                { icon: '✅', text: 'Excellent! Continue your healthy lifestyle habits.' },
                { icon: '🎯', text: 'Maintain regular exercise and sleep routines.' },
                { icon: '🌟', text: 'Share your wellness practices with others!' }
            );
        } else if (score >= 70) {
            recommendations.push(
                { icon: '💪', text: 'Good progress! Consider increasing physical activity.' },
                { icon: '😴', text: 'Improve sleep quality by maintaining consistent bedtime.' },
                { icon: '📱', text: 'Reduce screen time before bed for better rest.' }
            );
        } else if (score >= 60) {
            recommendations.push(
                { icon: '🏃', text: 'Start with 30 minutes of exercise, 3-4 times per week.' },
                { icon: '😴', text: 'Aim for 7-8 hours of quality sleep each night.' },
                { icon: '📵', text: 'Limit recreational screen time to 2-3 hours daily.' }
            );
        } else {
            recommendations.push(
                { icon: '🆘', text: 'Consider consulting a mental health professional.' },
                { icon: '🏃', text: 'Start with light exercise like walking or yoga.' },
                { icon: '😴', text: 'Prioritize sleep - create a relaxing bedtime routine.' }
            );
        }
    } else {
        // Academic Impact
        const score = predictionData.result.prediction;

        if (score >= 7) {
            recommendations.push(
                { icon: '⚠️', text: 'High addiction risk - limit social media to 1-2 hours daily.' },
                { icon: '📚', text: 'Create dedicated study time without phone access.' },
                { icon: '👥', text: 'Consider academic counseling or support groups.' }
            );
        } else if (score >= 5) {
            recommendations.push(
                { icon: '⏰', text: 'Set daily time limits for social media apps.' },
                { icon: '📖', text: 'Use apps like Forest or Freedom to block distractions.' },
                { icon: '🎯', text: 'Schedule specific times for checking social media.' }
            );
        } else if (score >= 4) {
            recommendations.push(
                { icon: '✅', text: 'Good balance! Maintain your current usage patterns.' },
                { icon: '📱', text: 'Turn off non-essential notifications.' },
                { icon: '🎓', text: 'Keep prioritizing your academic goals.' }
            );
        } else {
            recommendations.push(
                { icon: '🌟', text: 'Excellent! You have healthy social media habits.' },
                { icon: '📚', text: 'Continue balancing academics and social media.' },
                { icon: '👍', text: 'Share your time management tips with peers!' }
            );
        }
    }

    return recommendations;
}

/**
 * Save PDF to file (optional - for debugging)
 */
exports.savePDFToFile = async (pdfBuffer, filename) => {
    const filePath = path.join(__dirname, '..', 'temp', filename);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(filePath, pdfBuffer);
    return filePath;
};

module.exports = exports;
