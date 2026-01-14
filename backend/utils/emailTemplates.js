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
                            <p style="margin: 0; color: #856404;"><strong>⏰ Important:</strong> This code will expire in 15 minutes for your security.</p>
                        </div>
                        
                        <p style="margin-top: 25px;">If you didn't create this account, please ignore this email or contact our support team.</p>
                        
                        <p style="margin-top: 30px; color: #667eea; font-weight: 600;">Best regards,<br>The WellSync Team 💜</p>
                    </div>
                    <div class="footer">
                        <p style="font-weight: 600; color: #333; margin-bottom: 15px;">Stay Connected</p>
                        <div class="social-links">
                            <a href="#" title="Facebook">📘</a>
                            <a href="#" title="Twitter">🐦</a>
                            <a href="#" title="Instagram">📷</a>
                            <a href="#" title="LinkedIn">💼</a>
                        </div>
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                            You received this email because you signed up for WellSync.<br>
                            Need help? Contact us at support@wellsync.com
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
                            <p style="margin: 0; color: #856404;"><strong>⏰ Hurry!</strong> This code will expire in 15 minutes.</p>
                        </div>
                        
                        <p style="margin-top: 25px;">If you didn't request this verification, you can safely ignore this email.</p>
                        
                        <p style="margin-top: 30px; color: #667eea; font-weight: 600;">Best regards,<br>The WellSync Team 💜</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                            Need help? Contact us at support@wellsync.com
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
                            <p style="margin: 0; color: #856404;"><strong>⏰ Time Sensitive:</strong> This code will expire in 15 minutes for security reasons.</p>
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
                            For security concerns, contact us at security@wellsync.com
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
            </head>
            <body style="margin: 0; padding: 20px; background: #f0f2f5;">
                <div class="container">
                    <div class="header">
                        <div class="icon-wrapper">📊</div>
                        <h1>Your ${data.predictionType} Report</h1>
                        <p style="margin-top: 10px; font-size: 16px; opacity: 0.95;">AI-Powered Insights Ready</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName}! 👋</h2>
                        <p>Great news! Your latest prediction analysis is complete. Here are your personalized insights:</p>
                        
                        <div class="score-display">
                            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your Score</p>
                            <div class="score-number">${data.prediction}</div>
                            <div class="progress-bar" style="width: 80%; margin: 20px auto;">
                                <div class="progress-fill" style="width: ${Math.min(parseFloat(data.prediction) * 10, 100)}%;"></div>
                            </div>
                            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">${data.interpretation}</p>
                        </div>
                        
                        <div class="info-card">
                            <h3>📈 Analysis Details</h3>
                            <p><strong>Model Used:</strong> ${data.modelName}</p>
                            <p><strong>Analysis Date:</strong> ${data.date}</p>
                            <p><strong>Prediction Type:</strong> ${data.predictionType}</p>
                        </div>
                        
                        <div class="info-card">
                            <h3>💡 Recommendations</h3>
                            <p>${data.recommendations}</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${data.dashboardLink}" class="button">View Full Dashboard →</a>
                        </div>
                        
                        <p style="text-align: center; color: #666; margin-top: 25px;">Keep tracking your wellness journey with WellSync! 🌟</p>
                        
                        <p style="margin-top: 30px; color: #667eea; font-weight: 600;">Keep thriving,<br>The WellSync Team 💜</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px; color: #999;">
                            Want to improve your score? Visit your dashboard for personalized tips.
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
                            Questions? Check our help center or contact support@wellsync.com
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
