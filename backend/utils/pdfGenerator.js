/**
 * PDF Generator
 * Generates prediction report PDFs for Mental Wellness, Stress Level, and Academic Impact
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

            // Page 1: Header & Results

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

            // Page 2: Input Data
            
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

            // Page 3: Analysis & Recommendations
            
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

            // Final Page: Disclaimer & Footer
            
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
    
    // Use AI model recommendations if available (stress level from AI)
    if (type === 'stress_level' && predictionData.result.recommendations && 
        Array.isArray(predictionData.result.recommendations) && 
        predictionData.result.recommendations.length > 0) {
        return predictionData.result.recommendations;
    }
    
    const recs = [];
    
    if (type === 'mental_wellness') {
        if (score >= 80) {
            // EXCELLENT (80-100)
            recs.push(
                'EXCELLENT WELLNESS - Score: ' + score.toFixed(1) + '/100',
                'Sleep Optimization: Your sleep is great! Continue maintaining 7-9 hours with a consistent schedule. Try adding relaxation techniques like gentle stretching or reading before bed to further enhance sleep quality.',
                'Exercise Excellence: Maintain your 150+ minutes/week of aerobic activity. Add variety with swimming, cycling, or yoga to prevent workout monotony and challenge different muscle groups.',
                'Screen Time Management: Your screen habits are excellent. Continue limiting recreational screen use to under 3 hours daily. Explore digital detox weekends periodically to recharge.',
                'Social Connection: Keep nurturing your relationships. Schedule regular meaningful activities with friends and family. Consider mentoring others or joining community volunteer groups.',
                'Mindfulness Practice: You\'re thriving! Deepen your practice with advanced meditation techniques like body scan or loving-kindness meditation for 15-20 minutes daily.',
                'Nutrition & Hydration: Complement your wellness by eating a balanced diet rich in omega-3s, antioxidants, and staying hydrated with 8+ glasses of water daily.',
                'Goal Setting: Set new wellness challenges - maybe a 5K run, a new sport, or a creative hobby to keep growing and stimulated.'
            );
        } else if (score >= 70) {
            // GOOD (70-79)
            recs.push(
                'GOOD WELLNESS - Score: ' + score.toFixed(1) + '/100',
                'Sleep Improvement: You\'re doing well but aim for consistent 7-9 hours. Set a fixed bedtime alarm and create a wind-down routine: dim lights 30 minutes before bed and avoid caffeine after 2 PM.',
                'Exercise Boost: Increase to 150 minutes/week of moderate aerobic exercise. Try brisk walking, swimming, or cycling. Add 2 strength training sessions weekly to boost mood and energy.',
                'Screen Time Reduction: Cut leisure screen time by 30 minutes daily. Replace with outdoor activities, reading, or in-person socializing. Use app timers to enforce limits.',
                'Stress Management: Introduce 10-minute daily meditation using apps like Headspace or Calm. Practice box breathing (4 counts in, hold, out, hold) when feeling overwhelmed.',
                'Social Enhancement: Schedule at least one meaningful social activity weekly. Reconnect with someone you\'ve lost touch with. Quality over quantity in relationships matters most.',
                'Productivity Optimization: Use the Pomodoro technique (25 min focus, 5 min break) to improve study/work efficiency and reduce mental fatigue.',
                'Wellness Tracking: Start a wellness journal to track sleep, mood, exercise, and social time to identify patterns and areas for improvement.'
            );
        } else if (score >= 60) {
            // BELOW AVERAGE (60-69)
            recs.push(
                'BELOW AVERAGE WELLNESS - Score: ' + score.toFixed(1) + '/100 - Action Needed',
                'Sleep Priority: Sleep deprivation is likely affecting your wellness. Create a strict sleep schedule, eliminate all screens 1 hour before bed, keep your bedroom cool (65-68°F), and use blackout curtains for better sleep quality.',
                'Exercise Start: Begin with just 20-30 minutes of walking 3 times per week. Exercise releases endorphins that directly improve mental wellness. Even short walks after meals make a significant difference.',
                'Screen Time Intervention: Immediately reduce screen time by 1-2 hours daily. Set app usage limits on your phone. Replace screen time with outdoor activities, reading, or face-to-face interactions.',
                'Stress Reduction: Practice deep breathing for 5 minutes, 3 times daily. Download a free meditation app and commit to 10 minutes daily. Identify your top 3 stressors and create action plans for each.',
                'Social Reconnection: Social isolation worsens wellness scores. Commit to at least 2 meaningful social interactions weekly - coffee with a friend, a club activity, or family dinner.',
                'Professional Support: Consider consulting with a campus counselor, life coach, or therapist. Many offer free or low-cost sessions for students. Professional guidance can accelerate your wellness improvement.',
                'Nutrition Focus: Improve your diet by adding more fruits, vegetables, and whole grains. Reduce processed foods, sugar, and excessive caffeine. Proper nutrition directly supports mental wellness.'
            );
        } else {
            // POOR (below 60)
            recs.push(
                'POOR WELLNESS - Score: ' + score.toFixed(1) + '/100 - Immediate Action Required',
                'URGENT - Seek Professional Help: Please consult with a mental health professional, campus counselor, or your doctor as soon as possible. Your score indicates multiple lifestyle factors significantly impacting your wellbeing.',
                'Emergency Sleep Protocol: Your sleep needs immediate attention. Set a non-negotiable sleep schedule (same time every night). Remove all electronics from your bedroom. Use a sleep tracker app to monitor and improve quality.',
                'Gentle Exercise Start: Even 10 minutes of walking daily can begin improving your mood through endorphin release. Start small - a walk around the block after breakfast or dinner. Gradually build to 30 minutes daily.',
                'Digital Detox: Drastically reduce screen time. Try a 24-hour digital detox this weekend. Delete social media apps temporarily. Replace screen time with nature walks, journaling, or creative activities.',
                'Immediate Stress Relief: Your stress levels need urgent attention. Practice 4-7-8 breathing immediately when stressed (inhale 4s, hold 7s, exhale 8s). Consider calling a mental health helpline for immediate support.',
                'Rebuild Social Connections: Isolation compounds poor wellness scores. Reach out to at least one trusted person today - a friend, family member, or counselor. Connection is vital for recovery.',
                'Lifestyle Overhaul: Create a comprehensive wellness plan with small, daily goals. Track water intake (8 glasses), meals (3 balanced meals), sleep (7-9 hours), and movement (10+ minutes). Use a habit tracking app.',
                'Campus Resources: Utilize available resources - student wellness centers, peer support groups, academic advisors, and mental health services. You don\'t have to navigate this alone.'
            );
        }
    } else if (type === 'stress_level') {
        if (score >= 8) {
            // VERY HIGH STRESS (8-10)
            recs.push(
                'VERY HIGH STRESS - Score: ' + score.toFixed(1) + '/10 - URGENT ATTENTION NEEDED',
                'Seek Immediate Professional Help: Contact a mental health professional, therapist, or counselor TODAY. Very high stress can cause serious physical and mental health complications. Many campuses offer same-day crisis counseling.',
                'Emergency Breathing Technique: Practice 4-7-8 breathing immediately: inhale through nose for 4 counts, hold for 7 counts, exhale through mouth for 8 counts. Repeat 4 times. Do this every hour.',
                'Radical Schedule Reduction: Identify and immediately drop or delegate non-essential commitments. Your health comes first. Talk to professors about extensions or accommodations if needed.',
                'Restorative Sleep Protocol: Aim for 8-9 hours regardless of workload. Sleep deprivation multiplies stress effects. Create a sleep sanctuary: dark, cool, quiet, and screen-free environment.',
                'Physical Movement Now: Even a 10-minute walk significantly reduces cortisol (stress hormone) levels. Step outside immediately when feeling overwhelmed. Nature exposure reduces stress by 20-30%.',
                'Remove Digital Stressors: Mute or delete social media apps temporarily. Turn off all news notifications. Limit screen time to essential activities only. Set phone to Do Not Disturb mode.',
                'Build Support Network: Call or message a trusted person RIGHT NOW. Don\'t face this alone. Consider joining a peer support group or stress management workshop at your institution.',
                'Crisis Resources: If stress feels overwhelming, contact the Student Wellness Center, National Mental Health Helpline (1-800-950-6264), or Crisis Text Line (text HOME to 741741) for immediate support.'
            );
        } else if (score >= 6) {
            // HIGH STRESS (6-7)
            recs.push(
                'HIGH STRESS - Score: ' + score.toFixed(1) + '/10 - Action Required',
                'Professional Support: Schedule an appointment with a counselor or therapist this week. High stress needs professional management strategies tailored to your specific situation and stressors.',
                'Daily Mindfulness Practice: Commit to 15-20 minutes of meditation daily using apps like Headspace, Calm, or Insight Timer. Research shows consistent meditation reduces stress hormones by up to 30%.',
                'Sleep Quality Focus: Establish a strict 7-9 hour sleep schedule. Create a 30-minute wind-down routine: reduce lighting, do light stretching, practice gratitude journaling, and avoid screens.',
                'Regular Exercise: Aim for 30-45 minutes of moderate aerobic exercise 4-5 times weekly. Exercise is scientifically proven to be as effective as medication for mild-moderate stress and anxiety.',
                'Pomodoro Work Technique: Work in focused 25-minute intervals with 5-minute breaks. After 4 cycles, take a 30-minute break. This prevents stress accumulation and maintains productivity.',
                'Limit Stimulants: Reduce caffeine intake (max 2 cups coffee/day), avoid energy drinks, and eliminate alcohol which worsens anxiety and sleep quality despite initial relaxation sensation.',
                'Nature Therapy: Spend at least 20-30 minutes outdoors daily. Research shows nature exposure significantly reduces cortisol levels and improves mood within minutes of being in green spaces.'
            );
        } else if (score >= 3) {
            // MODERATE STRESS (3-5)
            recs.push(
                'MODERATE STRESS - Score: ' + score.toFixed(1) + '/10 - Monitor and Manage',
                'Stress Journaling: Keep a daily stress journal. Note stress triggers, intensity (1-10), and what helped reduce it. This awareness helps identify patterns and develop targeted coping strategies.',
                'Consistent Sleep Schedule: Maintain your 7-9 hours with consistent wake times even on weekends. Irregular sleep patterns increase cortisol levels and worsen stress responses.',
                'Regular Physical Activity: Ensure 150 minutes of moderate exercise weekly. Your current activity is helping - keep it consistent. Try adding yoga or tai chi for combined physical and mental benefits.',
                'Mindfulness Integration: Practice 10-minute mindfulness meditation daily. Try mindful eating, mindful walking, or brief breathing exercises between tasks to maintain your stress at manageable levels.',
                'Social Balance: Ensure adequate social connection. Plan one enjoyable social activity weekly. Strong social connections are the #1 predictor of stress resilience and mental wellness.',
                'Time Management: Use a weekly planner to balance responsibilities. Prioritize tasks using the Eisenhower matrix (urgent/important grid) to reduce overwhelm and increase sense of control.',
                'Preventive Self-Care: Schedule weekly self-care activities - hobbies, relaxation, or leisure. Prevention is easier than treatment when it comes to stress management.'
            );
        } else {
            // LOW STRESS (0-2)
            recs.push(
                'LOW STRESS - Score: ' + score.toFixed(1) + '/10 - Excellent Stress Management!',
                'Celebrate and Maintain: Your stress management is exemplary! Identify exactly what\'s working (sleep quality, exercise, social support, time management) and consciously maintain these practices.',
                'Build Stress Resilience: Use this low-stress period to strengthen your coping toolkit. Learn advanced techniques like progressive muscle relaxation or biofeedback to handle future stressors.',
                'Share Your Strategies: Consider sharing your successful stress management approaches with peers, younger students, or through student wellness groups. Teaching reinforces your own practices.',
                'Set Growth Goals: With stress well-managed, focus energy on personal and academic growth. Pursue a new skill, physical challenge, or meaningful project that brings purpose and fulfillment.',
                'Maintain Healthy Routines: Continue your good sleep hygiene, exercise habits, and social connections. These are the foundations of your excellent stress resilience.',
                'Proactive Planning: Identify upcoming potential stressors (exams, projects, transitions) and create proactive plans to maintain your low stress levels during challenging periods.',
                'Wellness Leadership: You\'re in an excellent position to model and promote mental wellness. Consider peer mentoring, wellness advocacy, or supporting friends who may be struggling.'
            );
        }
    } else { // academic_impact
        if (score >= 7) {
            // HIGH RISK (7-9)
            recs.push(
                'HIGH ADDICTION RISK - Score: ' + score.toFixed(1) + '/9 - Immediate Intervention Required',
                'Emergency Digital Intervention: Delete or temporarily deactivate the top 2-3 most addictive social media apps from your phone TODAY. Research shows a 30-day break significantly resets dopamine patterns.',
                'Strict App Time Limits: Use Screen Time (iOS) or Digital Wellbeing (Android) to set hard limits of 30-60 minutes maximum total social media daily. Enable downtime during study hours (e.g., 8am-6pm).',
                'Phone-Free Study Environment: Place your phone in another room or a locked drawer during all study sessions. Purchase a cheap digital clock so you don\'t need your phone to check time.',
                'Academic Recovery Plan: Meet with your academic advisor or counselor this week to assess academic damage and create a recovery plan. Explore options for grade appeals, incomplete grades, or additional support.',
                'Replace Digital Habits: Fill social media time with in-person activities: campus clubs, sports teams, study groups, volunteer work, or creative hobbies. These provide the social connection social media simulates.',
                'Professional Digital Wellness Counseling: Seek guidance from a counselor specializing in digital addiction or behavioral health. Many campuses offer free counseling services that address technology addiction.',
                'Accountability Partner: Ask a trusted friend or family member to help monitor and support your digital reduction goals. Share your screen time reports with them weekly for accountability.',
                'Reward Progress: Create a reward system for hitting daily screen time goals. After 1 week under target: a favorite meal. After 2 weeks: a special activity. After 1 month: a meaningful reward.'
            );
        } else if (score >= 5) {
            // MODERATE RISK (5-6)
            recs.push(
                'MODERATE ADDICTION RISK - Score: ' + score.toFixed(1) + '/9 - Reduction Needed',
                'Set Daily Usage Caps: Implement a maximum 2-3 hours total social media daily. Use app timers and check your weekly Screen Time or Digital Wellbeing report every Sunday to track progress.',
                'Notification Audit: Turn off ALL non-essential notifications immediately. Keep only calls and messages from close contacts. Each notification interrupts 23 minutes of focused work on average.',
                'Structured Study Blocks: Use the Pomodoro technique - 25 minutes focused work with phone face-down in another room, then 5 minutes break. Social media during break only after completing the block.',
                'Designated Social Media Hours: Limit checking to 3 specific times daily (e.g., 8am, 12pm, 6pm) for maximum 20-30 minutes each. Avoid first thing in the morning and before bed.',
                'Study Space Optimization: Create a dedicated, phone-free study space. Research shows even phone visibility (face-down on desk) reduces cognitive capacity by occupying background mental resources.',
                'Track Academic Impact: Compare your grades/performance before and after implementing limits. Seeing concrete academic improvement provides powerful motivation to maintain reduced usage.',
                'Offline Social Activities: Replace 30 minutes of daily scrolling with in-person activities - campus events, sports, clubs, or coffee with friends. Real connection is more fulfilling than digital.',
                'App Replacement Strategy: For each social app you reduce, substitute a productive app - a language learning app, podcast, audiobook, or creative tool for the same time slot.'
            );
        } else {
            // LOW RISK (2-4)
            recs.push(
                'LOW ADDICTION RISK - Score: ' + score.toFixed(1) + '/9 - Healthy Digital Balance',
                'Maintain Your Balance: Excellent job managing social media alongside academics! Continue your current approach of setting boundaries between digital engagement and study time.',
                'Awareness Monitoring: Do a monthly check-in of your screen time reports. Catching upward trends early is much easier than reversing established addiction patterns.',
                'Optimize Study Effectiveness: Since your digital habits are healthy, focus on optimizing study techniques - spaced repetition, active recall, and interleaved practice for maximum academic performance.',
                'Strategic Social Media Use: Use social media as a purposeful tool - for academic networking, research, joining study groups, or following educational content rather than passive scrolling.',
                'Digital Focus Tools: Explore productivity apps like Forest (gamifies phone-free focus), Freedom (website blocker), or Notion (organized note-taking) to further enhance your academic performance.',
                'Share Your Success: Consider sharing your effective study and digital balance strategies with peers or through student wellness programs. Your approach could benefit many struggling students.',
                'Future-Proofing: As coursework intensifies, proactively plan how to maintain your healthy balance. Having strategies ready before stress peaks prevents reactive overuse of social media as an escape.'
            );
        }
    }
    
    return recs;
}

/**
 * Generate Weekly Wellness Report PDF
 * Includes: Prediction history, trends, recommendations, and summary
 */
exports.generateWeeklyWellnessReportPDF = async (user, weeklyData, predictions) => {
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

            const reportDate = new Date();
            const dateString = reportDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Calculate week range
            const weekStart = new Date(reportDate);
            weekStart.setDate(weekStart.getDate() - 7);
            const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${reportDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

            // Page 1: Header & Summary

            // Header with gradient
            doc.rect(0, 0, 595, 120).fill('#667eea');
            
            doc.fontSize(36)
               .font('Helvetica-Bold')
               .fillColor('#ffffff')
               .text('WellSync', 50, 35);
            
            doc.fontSize(14)
               .font('Helvetica')
               .fillColor('#ffffff')
               .text('Weekly Wellness Report', 50, 80);

            // Date badge
            doc.roundedRect(380, 35, 165, 30, 5)
               .fill('#ffffff');
            
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text(weekRange, 380, 45, { width: 165, align: 'center' });

            // User Information
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
               .text('Name:', 50, y)
               .font('Helvetica')
               .text(`${user.firstName} ${user.lastName}`, 150, y);
            
            y += 20;
            doc.font('Helvetica-Bold')
               .text('Email:', 50, y)
               .font('Helvetica')
               .text(user.email, 150, y);
            
            y += 20;
            doc.font('Helvetica-Bold')
               .text('Report Period:', 50, y)
               .font('Helvetica')
               .text(weekRange, 150, y);
            
            y += 20;
            doc.font('Helvetica-Bold')
               .text('Generated:', 50, y)
               .font('Helvetica')
               .text(dateString, 150, y);

            // Weekly Summary
            y += 50;
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('WEEKLY SUMMARY', 50, y);
            
            doc.moveTo(50, y + 20).lineTo(545, y + 20).stroke('#e0e0e0');
            
            y += 35;
            
            doc.roundedRect(50, y, 495, 80, 10)
               .fill('#f8f9fa');
            
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#333333')
               .text(weeklyData.summary || 'Your weekly wellness summary.', 70, y + 20, {
                   width: 455,
                   align: 'left',
                   lineGap: 3
               });

            // Stats Cards
            y += 100;
            
            if (weeklyData.hasData && weeklyData.stats) {
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#333333')
                   .text('YOUR WEEKLY METRICS', 50, y);
                
                doc.moveTo(50, y + 20).lineTo(545, y + 20).stroke('#e0e0e0');
                
                y += 40;
                
                const stats = weeklyData.stats;
                const cardWidth = 155;
                const cardHeight = 100;
                const cardSpacing = 15;
                
                let cardX = 50;
                let cardIndex = 0;
                
                // Mental Wellness Card
                if (stats.mentalWellness !== null && stats.mentalWellness !== undefined) {
                    const color = stats.mentalWellness >= 75 ? '#28a745' : stats.mentalWellness >= 60 ? '#17a2b8' : '#ffc107';
                    
                    doc.roundedRect(cardX, y, cardWidth, cardHeight, 8)
                       .fill(color);
                    
                    doc.fontSize(10)
                       .font('Helvetica-Bold')
                       .fillColor('#ffffff')
                       .text('Mental Wellness', cardX + 10, y + 15, { width: cardWidth - 20, align: 'center' });
                    
                    doc.fontSize(36)
                       .font('Helvetica-Bold')
                       .fillColor('#ffffff')
                       .text(stats.mentalWellness.toFixed(1), cardX + 10, y + 35, { width: cardWidth - 20, align: 'center' });
                    
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#ffffff')
                       .text('/ 100', cardX + 10, y + 75, { width: cardWidth - 20, align: 'center' });
                    
                    cardX += cardWidth + cardSpacing;
                    cardIndex++;
                }
                
                // Stress Level Card
                if (stats.stress !== null && stats.stress !== undefined) {
                    const color = stats.stress >= 7 ? '#dc3545' : stats.stress >= 4 ? '#ffc107' : '#28a745';
                    
                    doc.roundedRect(cardX, y, cardWidth, cardHeight, 8)
                       .fill(color);
                    
                    doc.fontSize(10)
                       .font('Helvetica-Bold')
                       .fillColor('#ffffff')
                       .text('Stress Level', cardX + 10, y + 15, { width: cardWidth - 20, align: 'center' });
                    
                    doc.fontSize(36)
                       .font('Helvetica-Bold')
                       .fillColor('#ffffff')
                       .text(stats.stress.toFixed(1), cardX + 10, y + 35, { width: cardWidth - 20, align: 'center' });
                    
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#ffffff')
                       .text('/ 10', cardX + 10, y + 75, { width: cardWidth - 20, align: 'center' });
                    
                    cardX += cardWidth + cardSpacing;
                    cardIndex++;
                }
                
                // Academic Impact Card
                if (stats.academic !== null && stats.academic !== undefined) {
                    const color = stats.academic >= 6 ? '#dc3545' : stats.academic >= 4 ? '#ffc107' : '#28a745';
                    
                    doc.roundedRect(cardX, y, cardWidth, cardHeight, 8)
                       .fill(color);
                    
                    doc.fontSize(10)
                       .font('Helvetica-Bold')
                       .fillColor('#ffffff')
                       .text('Digital Wellness', cardX + 10, y + 15, { width: cardWidth - 20, align: 'center' });
                    
                    doc.fontSize(36)
                       .font('Helvetica-Bold')
                       .fillColor('#ffffff')
                       .text(stats.academic.toFixed(1), cardX + 10, y + 35, { width: cardWidth - 20, align: 'center' });
                    
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#ffffff')
                       .text('/ 9', cardX + 10, y + 75, { width: cardWidth - 20, align: 'center' });
                }
                
                y += cardHeight + 20;
                
                // Total predictions badge
                doc.fontSize(9)
                   .font('Helvetica')
                   .fillColor('#666666')
                   .text(`Based on ${stats.totalPredictions} prediction${stats.totalPredictions !== 1 ? 's' : ''} this period`, 50, y, {
                       width: 495,
                       align: 'center'
                   });
            }

            // Page 2: Prediction History
            
            doc.addPage();
            y = 50;
            
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('PREDICTION HISTORY', 50, y);
            
            doc.moveTo(50, y + 25).lineTo(545, y + 25).stroke('#667eea');
            
            y += 40;
            
            if (predictions && predictions.length > 0) {
                // Sort predictions by date (most recent first)
                const sortedPredictions = predictions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                sortedPredictions.forEach((pred, index) => {
                    // Check if we need a new page
                    if (y > 700) {
                        doc.addPage();
                        y = 50;
                    }
                    
                    const predType = pred.predictionType === 'mental_wellness' ? 'Mental Wellness' 
                        : pred.predictionType === 'stress_level' ? 'Stress Level' 
                        : 'Academic Impact';
                    
                    const predDate = new Date(pred.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const score = pred.result.prediction;
                    const maxScore = pred.predictionType === 'mental_wellness' ? 100 
                        : pred.predictionType === 'stress_level' ? 10 
                        : 9;
                    
                    // Prediction card
                    doc.roundedRect(50, y, 495, 90, 8)
                       .stroke('#e0e0e0');
                    
                    // Type badge
                    const badgeColor = pred.predictionType === 'mental_wellness' ? '#17a2b8'
                        : pred.predictionType === 'stress_level' ? '#fd7e14'
                        : '#6f42c1';
                    
                    doc.roundedRect(60, y + 10, 120, 20, 5)
                       .fill(badgeColor);
                    
                    doc.fontSize(9)
                       .font('Helvetica-Bold')
                       .fillColor('#ffffff')
                       .text(predType, 60, y + 15, { width: 120, align: 'center' });
                    
                    // Date
                    doc.fontSize(8)
                       .font('Helvetica')
                       .fillColor('#999999')
                       .text(predDate, 60, y + 37);
                    
                    // Score
                    doc.fontSize(32)
                       .font('Helvetica-Bold')
                       .fillColor(getScoreColor(score, pred.predictionType))
                       .text(score.toFixed(1), 220, y + 25);
                    
                    doc.fontSize(16)
                       .font('Helvetica')
                       .fillColor('#999999')
                       .text(`/ ${maxScore}`, 290, y + 37);
                    
                    // Interpretation
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#333333')
                       .text(pred.result.interpretation || 'Analysis complete', 350, y + 30, {
                           width: 180,
                           align: 'left'
                       });
                    
                    // Progress bar
                    const barY = y + 65;
                    const barWidth = 470;
                    const fillWidth = (barWidth * score / maxScore);
                    
                    doc.rect(60, barY, barWidth, 8)
                       .fill('#e0e0e0');
                    
                    doc.rect(60, barY, fillWidth, 8)
                       .fill(getScoreColor(score, pred.predictionType));
                    
                    y += 100;
                });
            } else {
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#666666')
                   .text('No predictions recorded during this period.', 50, y, {
                       width: 495,
                       align: 'center'
                   });
            }

            // Page 3: Recommendations
            
            doc.addPage();
            y = 50;
            
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('PERSONALIZED RECOMMENDATIONS', 50, y);
            
            doc.moveTo(50, y + 25).lineTo(545, y + 25).stroke('#667eea');
            
            y += 40;
            
            if (weeklyData.recommendations && weeklyData.recommendations.length > 0) {
                weeklyData.recommendations.forEach((rec, index) => {
                    // Check if we need a new page
                    if (y > 680) {
                        doc.addPage();
                        y = 50;
                    }
                    
                    const priority = rec.priority || 'Medium';
                    const category = rec.category || 'Wellness';
                    const tip = rec.tip || rec;
                    
                    // Priority color
                    const priorityColor = priority === 'High' ? '#dc3545' 
                        : priority === 'Medium' ? '#ffc107' 
                        : '#28a745';
                    
                    doc.roundedRect(50, y, 495, 90, 8)
                       .stroke('#e0e0e0');
                    
                    // Priority badge
                    doc.roundedRect(60, y + 10, 80, 18, 5)
                       .fill(priorityColor);
                    
                    doc.fontSize(8)
                       .font('Helvetica-Bold')
                       .fillColor('#ffffff')
                       .text(priority.toUpperCase(), 60, y + 14, { width: 80, align: 'center' });
                    
                    // Category
                    doc.fontSize(11)
                       .font('Helvetica-Bold')
                       .fillColor('#667eea')
                       .text(category, 150, y + 12);
                    
                    // Recommendation text
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#333333')
                       .text(tip, 60, y + 40, {
                           width: 470,
                           align: 'left',
                           lineGap: 2
                       });
                    
                    y += 100;
                });
            } else {
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#666666')
                   .text('Continue maintaining your healthy wellness habits!', 50, y, {
                       width: 495,
                       align: 'center'
                   });
            }

            // Page 4: Wellness Tips & Footer
            
            doc.addPage();
            y = 50;
            
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor('#667eea')
               .text('QUICK WELLNESS TIPS', 50, y);
            
            doc.moveTo(50, y + 25).lineTo(545, y + 25).stroke('#667eea');
            
            y += 40;
            
            const wellnessTips = [
                'Set Achievable Goals: Break large wellness goals into smaller, manageable daily or weekly targets.',
                'Track Your Progress: Use the WellSync app regularly to monitor your wellness journey and identify patterns.',
                'Be Consistent: Small daily habits compound into major improvements over time - consistency beats intensity.',
                'Prioritize Sleep: Quality sleep (7-9 hours) is the foundation of mental and physical health.',
                'Move More: Even 10 minutes of daily physical activity can significantly improve mood and energy.',
                'Practice Mindfulness: Take 5 minutes daily for deep breathing, meditation, or simply being present.',
                'Stay Connected: Regular social interaction is crucial for mental wellbeing and stress management.',
                'Set Boundaries: Learn to say no to commitments that drain your energy or compromise your wellness.',
                'Stay Hydrated: Drink 8 glasses of water daily - dehydration affects mood, energy, and cognition.',
                'Celebrate Progress: Acknowledge and celebrate small victories on your wellness journey.'
            ];
            
            wellnessTips.forEach((tip, index) => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                
                // Add bullet point
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#667eea')
                   .text('•', 55, y);
                
                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(tip, 70, y, {
                       width: 460,
                       align: 'left',
                       lineGap: 2
                   });
                
                y += 35;
            });

            // Motivation quote
            y += 20;
            if (y > 650) {
                doc.addPage();
                y = 50;
            }
            
            doc.roundedRect(50, y, 495, 80, 10)
               .fill('#e8f4f8');
            
            doc.fontSize(14)
               .font('Helvetica-BoldOblique')
               .fillColor('#667eea')
               .text('"Your wellness journey is unique. Progress, not perfection."', 70, y + 25, {
                   width: 455,
                   align: 'center',
                   lineGap: 3
               });

            // Disclaimer
            y += 100;
            
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#666666')
               .text('IMPORTANT DISCLAIMER', 50, y);
            
            y += 20;
            
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor('#666666')
               .text(
                   'This weekly wellness report is generated by AI algorithms and is intended for informational and motivational purposes only. ' +
                   'It should not be used as a substitute for professional medical advice, diagnosis, or treatment. ' +
                   'If you are experiencing severe stress, anxiety, depression, or other mental health concerns, ' +
                   'please consult with a qualified healthcare professional immediately. ' +
                   'The recommendations provided are general wellness suggestions and may not be suitable for all individuals.',
                   50, y, {
                       width: 495,
                       align: 'justify',
                       lineGap: 2
                   }
               );

            // Footer
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#999999')
               .text(
                   'WellSync Weekly Wellness Report | Confidential',
                   50, 780,
                   { width: 495, align: 'center' }
               );
            
            doc.text(
                `Generated on ${dateString} | wellsync.lk@gmail.com | © 2026 WellSync`,
                50, 795,
                { width: 495, align: 'center' }
            );

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = exports;
