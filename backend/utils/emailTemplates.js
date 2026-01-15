/**
 * Email Templates
 * HTML templates for various email types
 */

const getEmailTemplate = (type, data) => {
    const baseStyle = `
        <style>
            /* Reset & Base Styles */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background: #f0f2f5;
            }
            
            /* Container */
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            
            /* Animated Header */
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                animation: shine 3s infinite;
            }
            
            @keyframes shine {
                0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            }
            
            .header h1 { 
                font-size: 32px; 
                font-weight: 700; 
                margin: 0;
                position: relative;
                z-index: 1;
                animation: fadeInDown 0.8s ease-out;
            }
            
            @keyframes fadeInDown {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Animated Icon */
            .icon-wrapper {
                font-size: 64px;
                margin-bottom: 20px;
                animation: bounce 2s infinite;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-15px); }
                60% { transform: translateY(-8px); }
            }
            
            /* Content Area */
            .content { 
                background: #ffffff; 
                padding: 40px 30px;
                animation: fadeIn 1s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .content h2 { 
                color: #667eea; 
                margin-bottom: 20px;
                font-size: 24px;
            }
            
            .content p { 
                margin-bottom: 15px; 
                color: #555;
                font-size: 16px;
            }
            
            .content ul {
                list-style: none;
                padding: 0;
                margin: 20px 0;
            }
            
            .content ul li {
                padding: 12px 0;
                padding-left: 30px;
                position: relative;
                animation: slideInLeft 0.6s ease-out backwards;
            }
            
            .content ul li:nth-child(1) { animation-delay: 0.2s; }
            .content ul li:nth-child(2) { animation-delay: 0.4s; }
            .content ul li:nth-child(3) { animation-delay: 0.6s; }
            .content ul li:nth-child(4) { animation-delay: 0.8s; }
            
            @keyframes slideInLeft {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .content ul li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #667eea;
                font-weight: bold;
                font-size: 20px;
            }
            
            /* Animated Button */
            .button { 
                display: inline-block; 
                padding: 16px 40px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important; 
                text-decoration: none; 
                border-radius: 50px; 
                margin: 25px 0;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.2);
                transition: left 0.5s ease;
            }
            
            .button:hover::before {
                left: 100%;
            }
            
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            
            /* Highlight Box with Animation */
            .highlight { 
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                padding: 30px; 
                border-radius: 12px;
                margin: 30px 0;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                animation: scaleIn 0.8s ease-out;
            }
            
            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            /* Code Display */
            .code-box {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                margin: 25px 0;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            .verification-code {
                font-size: 48px;
                font-weight: 800;
                letter-spacing: 15px;
                color: #ffffff;
                text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                font-family: 'Courier New', monospace;
                animation: glow 2s ease-in-out infinite;
            }
            
            @keyframes glow {
                0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3); }
                50% { text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.5); }
            }
            
            .code-label {
                color: rgba(255,255,255,0.9);
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-top: 10px;
            }
            
            /* Stats/Info Cards */
            .info-card {
                background: #ffffff;
                padding: 20px;
                border-radius: 10px;
                margin: 15px 0;
                border-left: 4px solid #667eea;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                transition: all 0.3s ease;
            }
            
            .info-card:hover {
                transform: translateX(5px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .info-card h3 {
                color: #667eea;
                margin-bottom: 10px;
                font-size: 20px;
            }
            
            .info-card p {
                margin: 5px 0;
                color: #666;
            }
            
            /* Score Display */
            .score-display {
                text-align: center;
                padding: 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                margin: 25px 0;
                color: white;
            }
            
            .score-number {
                font-size: 64px;
                font-weight: 800;
                animation: countUp 1.5s ease-out;
            }
            
            @keyframes countUp {
                from { opacity: 0; transform: scale(0.5); }
                to { opacity: 1; transform: scale(1); }
            }
            
            /* Footer */
            .footer { 
                text-align: center; 
                padding: 30px;
                background: #f8f9fa;
                color: #666; 
                font-size: 13px;
                border-top: 1px solid #e0e0e0;
            }
            
            .footer p { 
                margin: 5px 0; 
            }
            
            .social-links {
                margin: 20px 0;
            }
            
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #667eea;
                text-decoration: none;
                font-size: 24px;
                transition: transform 0.3s ease;
            }
            
            .social-links a:hover {
                transform: scale(1.2);
            }
            
            /* Warning/Alert Box */
            .alert-box {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 8px;
                animation: slideInRight 0.6s ease-out;
            }
            
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            /* Success Badge */
            .badge {
                display: inline-block;
                padding: 8px 16px;
                background: #28a745;
                color: white;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                animation: fadeInUp 0.8s ease-out;
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Progress Bar */
            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
                margin: 20px 0;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                animation: progressAnimation 2s ease-out;
            }
            
            @keyframes progressAnimation {
                from { width: 0%; }
            }
            
            /* Responsive Design */
            @media only screen and (max-width: 600px) {
                .container { border-radius: 0; }
                .header h1 { font-size: 24px; }
                .content { padding: 25px 20px; }
                .verification-code { font-size: 36px; letter-spacing: 10px; }
                .score-number { font-size: 48px; }
            }
        </style>
    `;

    const templates = {
        welcome: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${baseStyle}
            </head>
            <body style="margin: 0; padding: 20px; background: #f0f2f5;">
                <div class="container">
                    <div class="header">
                        <div class="icon-wrapper">🎉</div>
                        <h1>Welcome to WellSync!</h1>
                        <p style="margin-top: 10px; font-size: 16px; opacity: 0.95;">Your Journey to Better Wellness Starts Here</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName}! 👋</h2>
                        <p>We're thrilled to have you join the WellSync community! Get ready to take control of your mental wellness and academic success.</p>
                        
                        <p style="font-weight: 600; color: #667eea; margin-top: 25px;">What you can do with WellSync:</p>
                        <ul>
                            <li>📊 Get personalized mental wellness predictions</li>
                            <li>🎓 Analyze social media impact on academic performance</li>
                            <li>📈 Track your wellness trends over time</li>
                            <li>💡 Receive actionable insights for better health</li>
                        </ul>
                        
                        <div class="code-box">
                            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your Verification Code</p>
                            <div class="verification-code">${data.verificationCode}</div>
                            <p class="code-label">Enter this code to activate your account</p>
                        </div>
                        
                        <div class="alert-box">
                            <p style="margin: 0; color: #856404;"><strong>⏰ Important:</strong> This code will expire in 5 minutes for your security.</p>
                        </div>
                        
                        <p style="margin-top: 25px;">If you didn't create this account, please ignore this email or contact our support team.</p>
                        
                        <p style="margin-top: 30px; color: #667eea; font-weight: 600;">Best regards,<br>The WellSync Team 💜</p>
                    </div>
                    <div class="footer">
                        <p style="font-weight: 600; color: #333; margin-bottom: 15px;">Stay Connected</p>
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                            You received this email because you signed up for WellSync.<br>
                            Need help? Contact us at wellsync.lk@gmail.com
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
        
        emailVerification: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${baseStyle}
            </head>
            <body style="margin: 0; padding: 20px; background: #f0f2f5;">
                <div class="container">
                    <div class="header">
                        <div class="icon-wrapper">✉️</div>
                        <h1>Verify Your Email</h1>
                        <p style="margin-top: 10px; font-size: 16px; opacity: 0.95;">One More Step to Get Started</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName}! 👋</h2>
                        <p>Thank you for signing up with WellSync! We're excited to have you on board.</p>
                        <p>To complete your registration and unlock all features, please verify your email address using the code below:</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Verification Code</p>
                            <div class="verification-code">${data.verificationCode}</div>
                            <p class="code-label">Enter this code in the app</p>
                        </div>
                        
                        <div class="alert-box">
                            <p style="margin: 0; color: #856404;"><strong>⏰ Hurry!</strong> This code will expire in 5 minutes.</p>
                        </div>
                        
                        <p style="margin-top: 25px;">If you didn't request this verification, you can safely ignore this email.</p>
                        
                        <p style="margin-top: 30px; color: #667eea; font-weight: 600;">Best regards,<br>The WellSync Team 💜</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                            Need help? Contact us at wellsync.lk@gmail.com
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
        
        passwordReset: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${baseStyle}
            </head>
            <body style="margin: 0; padding: 20px; background: #f0f2f5;">
                <div class="container">
                    <div class="header">
                        <div class="icon-wrapper">🔐</div>
                        <h1>Reset Your Password</h1>
                        <p style="margin-top: 10px; font-size: 16px; opacity: 0.95;">Secure Password Recovery</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName}! 👋</h2>
                        <p>We received a request to reset your password for your WellSync account. No worries, it happens to the best of us!</p>
                        
                        <p style="font-weight: 600; color: #667eea; margin-top: 25px;">Your password reset code:</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Reset Code</p>
                            <div class="verification-code">${data.resetCode}</div>
                            <p class="code-label">Use this code to set a new password</p>
                        </div>
                        
                        <div class="alert-box">
                            <p style="margin: 0; color: #856404;"><strong>⏰ Time Sensitive:</strong> This code will expire in 5 minutes for security reasons.</p>
                        </div>
                        
                        <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 8px;">
                            <p style="margin: 0; color: #0d47a1;"><strong>🛡️ Security Notice:</strong></p>
                            <p style="margin: 10px 0 0 0; color: #0d47a1;">If you didn't request this password reset, please ignore this email or contact our support team immediately. Your password will remain unchanged unless you use this code.</p>
                        </div>
                        
                        <p style="margin-top: 30px; color: #667eea; font-weight: 600;">Stay secure,<br>The WellSync Team 💜</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                            For security concerns, contact us at wellsync.lk@gmail.com
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
        
        predictionReport: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${baseStyle}
                <style>
                    /* Prediction Type Specific Styles */
                    .stress-low { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
                    .stress-moderate { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
                    .stress-high { background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); }
                    .stress-very-high { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
                    
                    .wellness-excellent { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
                    .wellness-good { background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); }
                    .wellness-fair { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
                    .wellness-poor { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
                    
                    .academic-low { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
                    .academic-moderate { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
                    .academic-high { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
                    
                    /* Icon styles for different types */
                    .icon-stress { font-size: 64px; }
                    .icon-wellness { font-size: 64px; }
                    .icon-academic { font-size: 64px; }
                    
                    /* Recommendation List Styles */
                    .recommendation-item {
                        background: #f8f9fa;
                        padding: 15px 20px;
                        margin: 10px 0;
                        border-radius: 8px;
                        border-left: 4px solid #667eea;
                        animation: slideInLeft 0.6s ease-out backwards;
                    }
                    
                    .recommendation-item:nth-child(1) { animation-delay: 0.2s; }
                    .recommendation-item:nth-child(2) { animation-delay: 0.4s; }
                    .recommendation-item:nth-child(3) { animation-delay: 0.6s; }
                    .recommendation-item:nth-child(4) { animation-delay: 0.8s; }
                    .recommendation-item:nth-child(5) { animation-delay: 1.0s; }
                </style>
            </head>
            <body style="margin: 0; padding: 20px; background: #f0f2f5;">
                <div class="container">
                    <div class="header">
                        <div class="icon-wrapper ${data.predictionType === 'Stress Level' ? 'icon-stress' : data.predictionType === 'Mental Wellness' ? 'icon-wellness' : 'icon-academic'}">
                            ${data.predictionType === 'Stress Level' ? '😰' : data.predictionType === 'Mental Wellness' ? '🧠' : '📚'}
                        </div>
                        <h1>Your ${data.predictionType} Report</h1>
                        <p style="margin-top: 10px; font-size: 16px; opacity: 0.95;">AI-Powered Insights Ready</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName}! 👋</h2>
                        <p>Great news! Your latest ${data.predictionType.toLowerCase()} analysis is complete. Here are your personalized insights:</p>
                        
                        <div class="score-display ${
                            data.predictionType === 'Stress Level' 
                                ? (parseFloat(data.prediction) >= 8 ? 'stress-very-high' : parseFloat(data.prediction) >= 6 ? 'stress-high' : parseFloat(data.prediction) >= 3 ? 'stress-moderate' : 'stress-low')
                                : data.predictionType === 'Mental Wellness'
                                ? (parseFloat(data.prediction) >= 80 ? 'wellness-excellent' : parseFloat(data.prediction) >= 70 ? 'wellness-good' : parseFloat(data.prediction) >= 60 ? 'wellness-fair' : 'wellness-poor')
                                : (parseFloat(data.prediction) >= 7 ? 'academic-high' : parseFloat(data.prediction) >= 5 ? 'academic-moderate' : 'academic-low')
                        }">
                            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">
                                ${data.predictionType === 'Stress Level' ? 'Your Stress Level' : data.predictionType === 'Mental Wellness' ? 'Your Wellness Score' : 'Your Addiction Score'}
                            </p>
                            <div class="score-number">${data.prediction}</div>
                            <div class="progress-bar" style="width: 80%; margin: 20px auto;">
                                <div class="progress-fill" style="width: ${
                                    data.predictionType === 'Mental Wellness' 
                                        ? parseFloat(data.prediction) 
                                        : data.predictionType === 'Stress Level'
                                        ? parseFloat(data.prediction) * 10
                                        : parseFloat(data.prediction) * 11.11
                                }%;"></div>
                            </div>
                            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 600; opacity: 0.95;">${data.interpretation}</p>
                        </div>
                        
                        ${data.predictionType === 'Stress Level' ? `
                        <div class="info-card" style="border-left: 4px solid ${
                            parseFloat(data.prediction) >= 8 ? '#ef4444' : 
                            parseFloat(data.prediction) >= 6 ? '#fb923c' : 
                            parseFloat(data.prediction) >= 3 ? '#fbbf24' : '#4ade80'
                        };">
                            <h3>😰 Stress Level Breakdown</h3>
                            <p><strong>Current Level:</strong> ${
                                parseFloat(data.prediction) >= 8 ? 'Very High (8-10) - Immediate Action Needed' : 
                                parseFloat(data.prediction) >= 6 ? 'High (6-7.9) - Take Action Soon' : 
                                parseFloat(data.prediction) >= 3 ? 'Moderate (3-5.9) - Monitor Carefully' : 'Low (0-2.9) - Excellent!'
                            }</p>
                            <p><strong>Risk Assessment:</strong> ${
                                parseFloat(data.prediction) >= 8 ? 'Your stress levels are critically high. Consider professional support.' : 
                                parseFloat(data.prediction) >= 6 ? 'Your stress is elevated and may impact your well-being.' : 
                                parseFloat(data.prediction) >= 3 ? 'Your stress is manageable but keep monitoring it.' : 'Your stress is well-controlled. Great job!'
                            }</p>
                        </div>
                        ` : ''}
                        
                        <div class="info-card">
                            <h3>📈 Analysis Details</h3>
                            <p><strong>Model Used:</strong> ${data.modelName}</p>
                            <p><strong>Analysis Date:</strong> ${data.date}</p>
                            <p><strong>Prediction Type:</strong> ${data.predictionType}</p>
                            ${data.predictionType === 'Stress Level' ? `<p><strong>Category:</strong> ${
                                parseFloat(data.prediction) >= 8 ? '🔴 Very High Stress' : 
                                parseFloat(data.prediction) >= 6 ? '🟠 High Stress' : 
                                parseFloat(data.prediction) >= 3 ? '🟡 Moderate Stress' : '🟢 Low Stress'
                            }</p>` : ''}
                        </div>
                        
                        <div class="info-card" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9;">
                            <h3>💡 Personalized Recommendations</h3>
                            ${(data.recommendationsList && Array.isArray(data.recommendationsList))
                                ? data.recommendationsList.map((rec, index) => `
                                    <div class="recommendation-item">
                                        <strong style="color: #667eea;">${index + 1}.</strong> ${rec}
                                    </div>
                                `).join('') 
                                : `<p>${data.recommendations || 'Continue monitoring your wellness and maintain healthy habits.'}</p>`
                            }
                        </div>
                        
                        ${data.predictionType === 'Stress Level' ? `
                        <div class="alert-box" style="background: #fff3cd; border-left: 4px solid #fbbf24;">
                            <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> If you're experiencing severe stress, anxiety, or depression, please consult with a mental health professional. WellSync predictions are for informational purposes only and not a substitute for professional medical advice.</p>
                        </div>
                        ` : ''}
                        
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
                            <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">📎 Detailed PDF Report Attached</p>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                                Your comprehensive analysis report is attached to this email.<br>
                                Open the PDF for detailed insights, visualizations, and personalized recommendations.
                            </p>
                        </div>
                        
                        <p style="text-align: center; color: #666; margin-top: 25px;">
                            ${data.predictionType === 'Stress Level' 
                                ? 'Take care of your mental health - you deserve it! 🌈' 
                                : 'Keep tracking your wellness journey with WellSync! 🌟'}
                        </p>
                        
                        <p style="margin-top: 30px; color: #667eea; font-weight: 600;">
                            ${data.predictionType === 'Stress Level' ? 'Stay strong' : 'Keep thriving'},<br>The WellSync Team 💜
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                            📧 Check your email attachments for the detailed PDF report.<br>
                            ${data.predictionType === 'Stress Level' ? 'Need support? Visit our resources page or contact a mental health professional.' : 'Questions? Contact us at wellsync.lk@gmail.com'}
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
        
        weeklyWellness: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${baseStyle}
                <style>
                    .priority-high { border-left: 4px solid #dc3545; }
                    .priority-medium { border-left: 4px solid #ffc107; }
                    .priority-low { border-left: 4px solid #28a745; }
                    
                    .stat-card {
                        display: inline-block;
                        width: 150px;
                        padding: 20px;
                        margin: 10px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 12px;
                        text-align: center;
                        color: white;
                    }
                    
                    .stat-number {
                        font-size: 36px;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    
                    .stat-label {
                        font-size: 12px;
                        opacity: 0.9;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                </style>
            </head>
            <body style="margin: 0; padding: 20px; background: #f0f2f5;">
                <div class="container">
                    <div class="header">
                        <div class="icon-wrapper">📊</div>
                        <h1>Weekly Wellness Update</h1>
                        <p style="margin-top: 10px; font-size: 16px; opacity: 0.95;">Your Personalized Health Insights</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName}! 👋</h2>
                        <p>${data.summary}</p>
                        
                        ${data.hasData && data.stats ? `
                        <div style="text-align: center; margin: 30px 0;">
                            <h3 style="color: #667eea; margin-bottom: 20px;">Your Weekly Stats</h3>
                            <div style="display: flex; justify-content: center; flex-wrap: wrap;">
                                ${data.stats.mentalWellness !== null ? `
                                <div class="stat-card">
                                    <div class="stat-label">Mental Wellness</div>
                                    <div class="stat-number">${data.stats.mentalWellness.toFixed(1)}</div>
                                    <div class="stat-label">/ 100</div>
                                </div>
                                ` : ''}
                                
                                ${data.stats.stress !== null ? `
                                <div class="stat-card" style="background: linear-gradient(135deg, ${
                                    data.stats.stress >= 7 ? '#dc3545 0%, #c82333 100%' :
                                    data.stats.stress >= 4 ? '#ffc107 0%, #e0a800 100%' :
                                    '#28a745 0%, #218838 100%'
                                });">
                                    <div class="stat-label">Stress Level</div>
                                    <div class="stat-number">${data.stats.stress.toFixed(1)}</div>
                                    <div class="stat-label">/ 10</div>
                                </div>
                                ` : ''}
                                
                                ${data.stats.academic !== null ? `
                                <div class="stat-card">
                                    <div class="stat-label">Digital Wellness</div>
                                    <div class="stat-number">${data.stats.academic.toFixed(1)}</div>
                                    <div class="stat-label">/ 9</div>
                                </div>
                                ` : ''}
                            </div>
                            <p style="color: #666; margin-top: 20px; font-size: 14px;">
                                Based on ${data.stats.totalPredictions} prediction${data.stats.totalPredictions !== 1 ? 's' : ''} this month
                            </p>
                        </div>
                        ` : ''}
                        
                        <h3 style="color: #667eea; margin-top: 40px;">📌 This Week's Recommendations</h3>
                        
                        ${(data.recommendations && Array.isArray(data.recommendations) ? data.recommendations : []).map((rec, index) => `
                            <div class="info-card priority-${(rec.priority || 'medium').toLowerCase()}" style="margin: 15px 0; animation-delay: ${index * 0.1}s;">
                                <h4 style="color: #667eea; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                    ${rec.category || 'Wellness Tip'}
                                    <span style="float: right; font-size: 10px; padding: 3px 8px; border-radius: 10px; background: ${
                                        rec.priority === 'High' ? '#dc3545' :
                                        rec.priority === 'Medium' ? '#ffc107' :
                                        '#28a745'
                                    }; color: white;">
                                        ${rec.priority || 'Medium'} Priority
                                    </span>
                                </h4>
                                <p style="margin: 10px 0 0 0; color: #333; line-height: 1.6;">${rec.tip || rec}</p>
                            </div>
                        `).join('')}
                        
                        <div class="highlight" style="margin-top: 40px;">
                            <h3 style="color: #667eea; margin: 0 0 15px 0;">💡 Quick Wellness Tips</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li style="margin: 10px 0;">Track your progress - Use the WellSync app regularly to monitor your wellness journey</li>
                                <li style="margin: 10px 0;">Stay consistent - Small daily habits compound into major improvements over time</li>
                                <li style="margin: 10px 0;">Be patient - Real change takes time, usually 21-30 days to form new habits</li>
                                <li style="margin: 10px 0;">Seek support - Don't hesitate to reach out to friends, family, or professionals when needed</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <p style="color: #666; font-size: 14px;">Want more personalized insights?</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
                                View Your Dashboard →
                            </a>
                        </div>
                        
                        <p style="text-align: center; color: #666; margin-top: 30px; font-size: 14px;">
                            Keep up the great work on your wellness journey! 🌟
                        </p>
                        
                        <p style="margin-top: 30px; color: #667eea; font-weight: 600;">Stay well,<br>The WellSync Team 💜</p>
                    </div>
                    <div class="footer">
                        <p style="font-weight: 600; color: #333; margin-bottom: 15px;">Weekly Wellness Update - ${data.date}</p>
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                            You received this email because you're subscribed to WellSync weekly updates.<br>
                            To unsubscribe, update your preferences in your account settings.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
        
        accountActivation: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${baseStyle}
            </head>
            <body style="margin: 0; padding: 20px; background: #f0f2f5;">
                <div class="container">
                    <div class="header">
                        <div class="icon-wrapper">✅</div>
                        <h1>Account Activated!</h1>
                        <p style="margin-top: 10px; font-size: 16px; opacity: 0.95;">You're All Set to Begin</p>
                    </div>
                    <div class="content">
                        <div style="text-align: center; margin: 30px 0;">
                            <span class="badge">ACCOUNT ACTIVE</span>
                        </div>
                        
                        <h2>Congratulations, ${data.firstName}! 🎊</h2>
                        <p>Your WellSync account has been successfully activated! You now have full access to all our powerful features.</p>
                        
                        <p style="font-weight: 600; color: #667eea; margin-top: 25px;">What you can do now:</p>
                        <ul>
                            <li>🧠 Get Mental Wellness Predictions</li>
                            <li>📚 Analyze Academic Impact</li>
                            <li>📊 View Historical Data & Trends</li>
                            <li>💡 Receive Personalized Recommendations</li>
                            <li>📈 Track Your Progress Over Time</li>
                            <li>🎯 Set Wellness Goals</li>
                        </ul>
                        
                        <div class="highlight">
                            <h3 style="color: #667eea; margin: 0 0 15px 0;">🚀 Quick Start Guide</h3>
                            <p style="margin: 8px 0;">1. Login to your account</p>
                            <p style="margin: 8px 0;">2. Complete your profile</p>
                            <p style="margin: 8px 0;">3. Get your first prediction</p>
                            <p style="margin: 8px 0;">4. Explore your personalized dashboard</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${data.loginLink}" class="button">Login to Your Account →</a>
                        </div>
                        
                        <p style="text-align: center; color: #666; margin-top: 25px;">Your wellness journey starts now! 🌟</p>
                        
                        <p style="margin-top: 30px; color: #667eea; font-weight: 600;">Welcome aboard,<br>The WellSync Team 💜</p>
                    </div>
                    <div class="footer">
                        <p style="font-weight: 600; color: #333; margin-bottom: 15px;">Need Help Getting Started?</p>
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                            Questions? Check our help center or contact wellsync.lk@gmail.com
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return templates[type] || templates.welcome;
};

module.exports = { getEmailTemplate };
