/**
 * Email Templates
 * HTML templates for various email types
 */

const getEmailTemplate = (type, data) => {
    const baseStyle = `
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .highlight { background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        </style>
    `;

    const templates = {
        welcome: `
            <!DOCTYPE html>
            <html>
            <head>${baseStyle}</head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to WellSync!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName},</h2>
                        <p>Welcome to WellSync - Your personal mental wellness and academic impact analyzer!</p>
                        <p>We're excited to have you on board. With WellSync, you can:</p>
                        <ul>
                            <li>📊 Get personalized mental wellness predictions</li>
                            <li>🎓 Analyze social media impact on academic performance</li>
                            <li>📈 Track your wellness trends over time</li>
                            <li>💡 Receive actionable insights for better health</li>
                        </ul>
                        <div class="highlight">
                            <p><strong>Your verification code is:</strong></p>
                            <h1 style="text-align: center; font-size: 48px; letter-spacing: 10px; color: #667eea; margin: 20px 0;">${data.verificationCode}</h1>
                            <p style="text-align: center; color: #666;">Enter this code to verify your email address</p>
                        </div>
                        <p><strong>This code will expire in 15 minutes.</strong></p>
                        <p>If you didn't create this account, please ignore this email.</p>
                        <p>Best regards,<br>The WellSync Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        
        emailVerification: `
            <!DOCTYPE html>
            <html>
            <head>${baseStyle}</head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✉️ Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName},</h2>
                        <p>Thank you for signing up with WellSync!</p>
                        <p>Please use this code to verify your email address:</p>
                        <div class="highlight">
                            <h1 style="text-align: center; font-size: 48px; letter-spacing: 10px; color: #667eea; margin: 20px 0;">${data.verificationCode}</h1>
                            <p style="text-align: center; color: #666;">Enter this code in the app to verify your account</p>
                        </div>
                        <p><strong>This code will expire in 15 minutes.</strong></p>
                        <p>If you didn't request this verification, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        
        passwordReset: `
            <!DOCTYPE html>
            <html>
            <head>${baseStyle}</head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Reset Your Password</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName},</h2>
                        <p>We received a request to reset your password for your WellSync account.</p>
                        <p>Use this code to reset your password:</p>
                        <div class="highlight">
                            <h1 style="text-align: center; font-size: 48px; letter-spacing: 10px; color: #667eea; margin: 20px 0;">${data.resetCode}</h1>
                            <p style="text-align: center; color: #666;">Enter this code to reset your password</p>
                        </div>
                        <p><strong>This code will expire in 15 minutes.</strong></p>
                        <p><strong>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</strong></p>
                        <p>Your password will not be changed until you use this code.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        
        predictionReport: `
            <!DOCTYPE html>
            <html>
            <head>${baseStyle}</head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📊 Your ${data.predictionType} Report</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName},</h2>
                        <p>Here's your latest prediction report from WellSync:</p>
                        <div class="highlight">
                            <h3>Prediction Result: ${data.prediction}</h3>
                            <p><strong>Interpretation:</strong> ${data.interpretation}</p>
                            <p><strong>Model Used:</strong> ${data.modelName}</p>
                            <p><strong>Date:</strong> ${data.date}</p>
                        </div>
                        <p><strong>What does this mean?</strong></p>
                        <p>${data.recommendations}</p>
                        <a href="${data.dashboardLink}" class="button">View Full Dashboard</a>
                        <p>Keep tracking your wellness journey with WellSync!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        
        accountActivation: `
            <!DOCTYPE html>
            <html>
            <head>${baseStyle}</head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Account Activated!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.firstName},</h2>
                        <p>Great news! Your WellSync account has been successfully activated.</p>
                        <p>You can now access all features:</p>
                        <ul>
                            <li>Mental Wellness Predictions</li>
                            <li>Academic Impact Analysis</li>
                            <li>Historical Data & Trends</li>
                            <li>Personalized Recommendations</li>
                        </ul>
                        <a href="${data.loginLink}" class="button">Login to Your Account</a>
                        <p>Start your wellness journey today!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WellSync. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return templates[type] || templates.welcome;
};

module.exports = { getEmailTemplate };
