/**
 * Simple PDF Generator - Clean, 2-page report
 * No emojis, no encoding issues, no technical details
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

            const predictionType = predictionData.predictionType === 'mental_wellness' 
                ? 'Mental Wellness' 
                : 'Academic Impact';
            
            const score = predictionData.result.prediction;
            const maxScore = predictionData.predictionType === 'mental_wellness' ? 100 : 10;
            const reportDate = new Date(predictionData.createdAt);
            
            const dateString = reportDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Header
            doc.rect(0, 0, 595, 100).fill('#667eea');
            
            doc.fontSize(32)
               .font('Helvetica-Bold')
               .fillColor('#ffffff')
               .text('WellSync', 50, 30);
            
            doc.fontSize(12)
               .font('Helvetica')
               .fillColor('#ffffff')
               .text('Wellness Analysis Report', 50, 70);

            // User info
            let y = 130;
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('REPORT FOR:', 50, y);
            
            y += 20;
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text(`${user.firstName} ${user.lastName}`, 50, y);
            
            y += 20;
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#666666')
               .text(user.email, 50, y);
            
            y += 15;
            doc.fontSize(9)
               .fillColor('#999999')
               .text(`${predictionType} | ${dateString}`, 50, y);

            // Score section
            y += 40;
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('YOUR SCORE', 50, y);
            
            y += 30;
            doc.roundedRect(50, y, 495, 100, 8)
               .stroke('#e0e0e0');
            
            // Large score
            doc.fontSize(60)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text(score.toFixed(1), 70, y + 20);
            
            doc.fontSize(20)
               .font('Helvetica')
               .fillColor('#999999')
               .text(`/ ${maxScore}`, 180, y + 40);
            
            // Interpretation
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text(predictionData.result.interpretation, 250, y + 30, {
                   width: 270,
                   align: 'left'
               });
            
            // Score bar
            y += 110;
            const barWidth = 400;
            const fillWidth = (barWidth * score / maxScore);
            
            doc.rect(70, y, barWidth, 12)
               .fill('#e0e0e0');
            
            let barColor = '#667eea';
            if (predictionData.predictionType === 'mental_wellness') {
                if (score >= 80) barColor = '#28a745';
                else if (score >= 70) barColor = '#667eea';
                else if (score >= 60) barColor = '#ffc107';
                else barColor = '#dc3545';
            }
            
            doc.rect(70, y, fillWidth, 12)
               .fill(barColor);
            
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#666666')
               .text(`${(score/maxScore*100).toFixed(0)}%`, 480, y + 2);

            // Interpretation section
            y += 40;
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('WHAT THIS MEANS', 50, y);
            
            y += 25;
            const interpText = getSimpleInterpretation(predictionData);
            
            doc.roundedRect(50, y, 495, 90, 8)
               .fill('#f0f7ff');
            
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#333333')
               .text(interpText, 70, y + 20, {
                   width: 455,
                   align: 'left'
               });

            // New page for recommendations
            doc.addPage();
            y = 50;
            
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('RECOMMENDATIONS', 50, y);
            
            y += 30;
            const recs = getSimpleRecommendations(predictionData);
            
            recs.forEach((rec, index) => {
                doc.roundedRect(50, y, 495, 60, 8)
                   .stroke('#e0e0e0');
                
                doc.circle(70, y + 30, 12)
                   .fill('#667eea');
                
                doc.fontSize(10)
                   .font('Helvetica-Bold')
                   .fillColor('#ffffff')
                   .text((index + 1).toString(), 66, y + 24);
                
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(rec, 95, y + 15, {
                       width: 430,
                       align: 'left'
                   });
                
                y += 70;
            });

            // Footer
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#999999')
               .text('WellSync - AI-Powered Wellness Analysis', 50, 780, {
                   width: 495,
                   align: 'center'
               });
            
            doc.text('(c) 2026 WellSync. All rights reserved.', 50, 795, {
                   width: 495,
                   align: 'center'
               });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

function getSimpleInterpretation(predictionData) {
    const score = predictionData.result.prediction;
    
    if (predictionData.predictionType === 'mental_wellness') {
        if (score >= 80) return 'Excellent! Your wellness score shows you are maintaining healthy habits. Continue your positive lifestyle patterns.';
        if (score >= 70) return 'Good! You are doing well overall. Focus on improving areas like sleep quality or exercise to enhance your wellness further.';
        if (score >= 60) return 'Moderate. Some lifestyle aspects need attention. Focus on improving sleep, physical activity, and stress management.';
        return 'Below average. Several lifestyle factors may be impacting your well-being. Consider significant changes to daily routines.';
    } else {
        if (score >= 7) return 'High risk. Social media usage is likely impacting academic performance significantly. Immediate action recommended.';
        if (score >= 5) return 'Moderate risk. Usage shows signs of interfering with academics. Implement time limits and app blockers.';
        if (score >= 4) return 'Low to moderate risk. Usage is relatively balanced but maintain awareness and boundaries.';
        return 'Low risk. Healthy social media habits. Continue maintaining good balance with academic commitments.';
    }
}

function getSimpleRecommendations(predictionData) {
    const score = predictionData.result.prediction;
    const recs = [];
    
    if (predictionData.predictionType === 'mental_wellness') {
        if (score >= 70) {
            recs.push(
                'Increase physical activity to 150+ minutes per week with activities you enjoy',
                'Improve sleep quality by maintaining consistent bedtime and avoiding screens before bed',
                'Reduce recreational screen time to under 3 hours daily',
                'Practice stress-management techniques like meditation for 10-15 minutes daily'
            );
        } else {
            recs.push(
                'Start with 30 minutes of exercise 3-4 times per week like walking or cycling',
                'Prioritize 7-8 hours of sleep nightly with a relaxing bedtime routine',
                'Limit total screen time to 8 hours or less with regular breaks',
                'Increase social interaction to 10+ hours per week with friends and family',
                'Consider consulting a wellness professional for personalized guidance'
            );
        }
    } else {
        if (score >= 5) {
            recs.push(
                'Limit social media to 1-2 hours per day maximum using app blockers',
                'Create dedicated study zones with zero phone access',
                'Schedule specific times for social media instead of constant checking',
                'Turn off all non-essential notifications during study hours'
            );
        } else {
            recs.push(
                'Continue maintaining healthy boundaries between social media and academics',
                'Use Do Not Disturb mode during critical study periods',
                'Keep prioritizing academic goals with current time management',
                'Share your successful strategies with peers who may struggle'
            );
        }
    }
    
    return recs;
}

module.exports = exports;
