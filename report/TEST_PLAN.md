# WellSync Test Plan

**Project:** WellSync AI-Powered Mental Wellness and Academic Performance Prediction System
**Version:** 1.0.0
**Prepared By:** QA Team
**Date:** 2026-02-20
**Total Test Cases:** 50

---

## 1. Introduction

This document outlines the test plan and 50 test cases for the WellSync platform. The platform consists of three tiers:

- **Frontend:** Next.js 14 (TypeScript) — User Interface
- **Backend:** Node.js / Express.js REST API — Business Logic
- **AI Service:** FastAPI (Python) — Machine Learning Predictions

Testing covers functional correctness, input validation, authentication and authorization, AI prediction accuracy, UI behavior, error handling, and edge cases.

---

## 2. Scope of Testing

| Module | Status |
|---|---|
| Authentication (Register, Login, Verify, Reset) | Included |
| User Profile and Settings | Included |
| Mental Wellness Prediction | Included |
| Stress Level Prediction | Included |
| Academic Impact Prediction | Included |
| Admin Dashboard and User Management | Included |
| Notifications and Broadcast | Included |
| Analytics | Included |
| AI Service Endpoints | Included |
| Email Notifications | Included |

---

## 3. Test Environment

| Component | Details |
|---|---|
| Frontend URL | http://localhost:3000 |
| Backend URL | http://localhost:5000 |
| AI Service URL | http://localhost:8000 |
| Database | MongoDB (local or Atlas) |
| Browser | Google Chrome (latest) |
| Operating System | Windows 11 |

---

## 4. Test Categories

| Category | Title | Test Cases |
|---|---|---|
| A | Authentication and Authorization | TC-001 to TC-010 |
| B | Mental Wellness Prediction | TC-011 to TC-018 |
| C | Stress Level Prediction | TC-019 to TC-024 |
| D | Academic Impact Prediction | TC-025 to TC-030 |
| E | User Profile and Settings | TC-031 to TC-036 |
| F | Admin Panel | TC-037 to TC-043 |
| G | Notifications and Analytics | TC-044 to TC-047 |
| H | AI Service and Edge Cases | TC-048 to TC-050 |

---

## 5. Test Cases

---

### Category A — Authentication and Authorization

---

#### TC-001

| Field | Details |
|---|---|
| **Test ID** | TC-001 |
| **Test Case** | Successful User Registration |
| **Test Description** | Verify that a new user can register with valid credentials. The system should create the account, send a welcome email with a 6-digit verification code, and return a JWT token. |
| **Components Involved** | Frontend: /register · Backend: POST /api/auth/register · authController.register · User model · emailService.sendWelcomeEmail |
| **Test Steps** | 1. Navigate to /register. 2. Enter First Name: John, Last Name: Doe, Email: johndoe@example.com. 3. Enter Password: Test@1234 and Confirm Password: Test@1234. 4. Click Create Account. |
| **Expected Result** | Account created successfully. Toast notification: "Account created successfully! Please verify your email." Redirected to /verify-email. Welcome email sent with 6-digit code. JWT token stored in localStorage. HTTP 201 response with success: true. |
| **Screenshot** | _(Attach screenshot of successful registration and redirect to verify-email page)_ |

---

#### TC-002

| Field | Details |
|---|---|
| **Test ID** | TC-002 |
| **Test Case** | Registration with Duplicate Email |
| **Test Description** | Verify that registering with an email that already exists is rejected with a clear error message. No duplicate accounts should be created. |
| **Components Involved** | Frontend: /register · Backend: POST /api/auth/register · authController.register · User model (unique email index) |
| **Test Steps** | 1. Navigate to /register. 2. Enter an already-registered email (e.g., johndoe@example.com). 3. Fill all other valid fields. 4. Click Create Account. |
| **Expected Result** | Registration rejected. Toast error: "User already exists with this email." HTTP 400 response. No duplicate user created in database. User remains on register page. |
| **Screenshot** | _(Attach screenshot of error toast message on the registration page)_ |

---

#### TC-003

| Field | Details |
|---|---|
| **Test ID** | TC-003 |
| **Test Case** | Registration with Weak Password |
| **Test Description** | Verify that passwords not meeting complexity rules (minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit) are rejected with inline validation errors. |
| **Components Involved** | Frontend: /register · Zod validation schema · Backend: registerValidation middleware |
| **Test Steps** | 1. Navigate to /register. 2. Enter valid name and email. 3. Enter Password: password (no uppercase, no digit). 4. Click Create Account. |
| **Expected Result** | Inline validation error shown below the field. No API call made. HTTP 400 if bypassed to API with validation error details. Account not created. |
| **Screenshot** | _(Attach screenshot showing the inline password validation error below the field)_ |

---

#### TC-004

| Field | Details |
|---|---|
| **Test ID** | TC-004 |
| **Test Case** | Successful Login with Valid Credentials |
| **Test Description** | Verify that a registered and active user can log in with correct email and password. The system should return a JWT access token and redirect to the appropriate dashboard based on role. |
| **Components Involved** | Frontend: /login · Backend: POST /api/auth/login · authController.login · User model (comparePassword, isLocked) |
| **Test Steps** | 1. Navigate to /login. 2. Enter email: johndoe@example.com and password: Test@1234. 3. Click Sign In. |
| **Expected Result** | Login successful. Toast: "Welcome back, John!" Regular user redirected to /dashboard. Admin user redirected to /admin. JWT token and user object saved in localStorage. HTTP 200 with token and refreshToken. |
| **Screenshot** | _(Attach screenshot of successful login redirect to dashboard)_ |

---

#### TC-005

| Field | Details |
|---|---|
| **Test ID** | TC-005 |
| **Test Case** | Login with Incorrect Password |
| **Test Description** | Verify that an incorrect password is rejected with a generic error. After 5 failed attempts, the account is temporarily locked for 30 minutes. |
| **Components Involved** | Frontend: /login · Backend: POST /api/auth/login · authController.login · User.incLoginAttempts · User.isLocked |
| **Test Steps** | 1. Navigate to /login. 2. Enter a valid email and wrong password: WrongPass123. 3. Click Sign In. 4. Repeat 5 times. |
| **Expected Result** | Login rejected. Toast error: "Invalid credentials." HTTP 401. loginAttempts counter incremented in DB. After 5 failed attempts: HTTP 423 "Account temporarily locked." |
| **Screenshot** | _(Attach screenshot of failed login toast and account lockout message after 5 attempts)_ |

---

#### TC-006

| Field | Details |
|---|---|
| **Test ID** | TC-006 |
| **Test Case** | Email Verification with Correct 6-Digit Code |
| **Test Description** | Verify that a newly registered user can verify their email by submitting the correct 6-digit code. After verification, isEmailVerified is set to true and the user is redirected to login. |
| **Components Involved** | Frontend: /verify-email · Backend: POST /api/auth/verify-email · authController.verifyEmail · emailService.sendAccountActivationEmail · notificationService |
| **Test Steps** | 1. Register a new account. 2. Navigate to /verify-email. 3. Enter the 6-digit code from the inbox. 4. Click Verify Email. |
| **Expected Result** | Email verified. Green banner: "Email Verified! Redirecting to login page..." Auto-redirect to /login?verified=true after 2 seconds. Login page shows verified message. isEmailVerified = true in database. Account activation email sent. |
| **Screenshot** | _(Attach screenshot of the green success banner on verify-email page)_ |

---

#### TC-007

| Field | Details |
|---|---|
| **Test ID** | TC-007 |
| **Test Case** | Complete Password Reset Flow |
| **Test Description** | Verify the full password reset flow: requesting a reset code via email, submitting the code with a new password, and logging in successfully with the new password. |
| **Components Involved** | Frontend: /forgot-password · /reset-password · Backend: POST /api/auth/forgot-password · POST /api/auth/reset-password · emailService.sendPasswordResetEmail |
| **Test Steps** | 1. Navigate to /forgot-password. 2. Enter registered email and click Send Reset Code. 3. Check inbox for 6-digit code. 4. Navigate to /reset-password. 5. Enter email, code, new password: NewPass@5678, and confirm. 6. Click Reset Password. |
| **Expected Result** | Reset email sent successfully. Reset page shows: "Password Reset Successful!" Auto-redirect to /login?reset=true. Login with new password succeeds. Old password no longer works. |
| **Screenshot** | _(Attach screenshots of forgot-password success screen and reset-password success screen)_ |

---

#### TC-008

| Field | Details |
|---|---|
| **Test ID** | TC-008 |
| **Test Case** | Unauthorized Access to Protected Route |
| **Test Description** | Verify that unauthenticated users cannot access protected dashboard routes. The system should redirect to login. API calls without a valid JWT should return HTTP 401. |
| **Components Involved** | Frontend: Dashboard layout auth guard · Backend: protect middleware (auth.js) · GET /api/users/dashboard |
| **Test Steps** | 1. Clear localStorage to remove the token. 2. Navigate directly to http://localhost:3000/dashboard. 3. Send GET /api/users/dashboard without Authorization header. |
| **Expected Result** | Frontend redirects to /login. API returns HTTP 401: "Not authorized to access this route." No dashboard data exposed. |
| **Screenshot** | _(Attach screenshot of redirect to login when accessing /dashboard without authentication)_ |

---

#### TC-009

| Field | Details |
|---|---|
| **Test ID** | TC-009 |
| **Test Case** | Regular User Accessing Admin-Only Endpoint |
| **Test Description** | Verify that a regular user with a valid JWT cannot access admin-only endpoints. The authorize middleware should reject with HTTP 403. |
| **Components Involved** | Backend: protect middleware · authorize('admin') middleware · GET /api/admin/users · GET /api/admin/dashboard |
| **Test Steps** | 1. Log in as a regular user and obtain JWT token. 2. Send GET /api/admin/users with Authorization: Bearer token. 3. Send GET /api/admin/dashboard with the same token. |
| **Expected Result** | HTTP 403: "User role not authorized." No admin data returned. Admin pages on the frontend show an access denied error. |
| **Screenshot** | _(Attach screenshot of 403 Forbidden response in API client)_ |

---

#### TC-010

| Field | Details |
|---|---|
| **Test ID** | TC-010 |
| **Test Case** | Rate Limiting on Login Endpoint |
| **Test Description** | Verify that the authLimiter blocks excessive failed login attempts. The limiter allows 5 failed requests per 15 minutes per IP. Successful logins do not count toward the limit. |
| **Components Involved** | Backend: rateLimiter.js (authLimiter) · POST /api/auth/login |
| **Test Steps** | 1. Send 5 POST requests to /api/auth/login with wrong credentials. 2. Send a 6th request with wrong credentials immediately. |
| **Expected Result** | First 5 failed attempts: HTTP 401 "Invalid credentials." 6th attempt: HTTP 429 with rate limit message. Response headers include Retry-After. Successful logins are not counted toward the limit. |
| **Screenshot** | _(Attach screenshot of HTTP 429 response after exceeding the rate limit)_ |

---

### Category B — Mental Wellness Prediction

---

#### TC-011

| Field | Details |
|---|---|
| **Test ID** | TC-011 |
| **Test Case** | Successful Mental Wellness Prediction |
| **Test Description** | Verify that a logged-in user can submit valid mental wellness data and receive a prediction score (0-100) with interpretation, model name, and confidence metrics. The prediction is saved to the database. |
| **Components Involved** | Frontend: /predictions/mental-wellness · Backend: POST /api/predictions/mental-wellness · predictionController · aiService.predictMentalWellness · AI: POST /predict/mental-wellness · Prediction model |
| **Test Steps** | 1. Log in and navigate to /predictions/mental-wellness. 2. Fill form: Age=25, Gender=Male, Occupation=Student, Work Mode=Remote, Screen Time=6, Work Screen=3, Leisure Screen=2, Sleep=7, Sleep Quality=4, Stress=4, Productivity=75, Exercise=150, Social=10. 3. Click Get Prediction. |
| **Expected Result** | Prediction score displayed (0-100 range). Interpretation label shown. Colored progress bar rendered. Model name and analysis date displayed. Action buttons visible: View Recommendations, Email Report, Download PDF. Prediction saved to DB. In-app notification created. HTTP 201 response. |
| **Screenshot** | _(Attach screenshot of the results card showing score, progress bar, and action buttons)_ |

---

#### TC-012

| Field | Details |
|---|---|
| **Test ID** | TC-012 |
| **Test Case** | Load Example Data on Mental Wellness Form |
| **Test Description** | Verify that clicking Load Example fetches pre-filled valid data from the AI service and populates all form fields, allowing submission without manual input. |
| **Components Involved** | Frontend: /predictions/mental-wellness · Backend: GET /api/predictions/examples/mental_wellness · AI: GET /examples/mental-wellness |
| **Test Steps** | 1. Navigate to /predictions/mental-wellness. 2. Click Load Example. 3. Observe field population. 4. Click Get Prediction. |
| **Expected Result** | Toast: "Example data loaded!" All form fields populated with valid values. Form submits successfully. Prediction result displayed. No validation errors triggered. |
| **Screenshot** | _(Attach screenshot of form with all fields auto-filled after clicking Load Example)_ |

---

#### TC-013

| Field | Details |
|---|---|
| **Test ID** | TC-013 |
| **Test Case** | Screen Time Cross-Field Validation |
| **Test Description** | Verify that the frontend blocks submission when Work Screen Time or Leisure Screen Time exceeds Total Screen Time. This is a custom cross-field validation. |
| **Components Involved** | Frontend: /predictions/mental-wellness (cross-field validation logic) · AI: POST /predict/mental-wellness |
| **Test Steps** | 1. Navigate to /predictions/mental-wellness. 2. Set Total Screen Time = 5. 3. Set Work Screen Time = 6. 4. Click Get Prediction. |
| **Expected Result** | Toast error: "Work + Leisure screen time cannot exceed Total screen time." Form not submitted. No API call made. User remains on the form page. |
| **Screenshot** | _(Attach screenshot of the error toast for exceeded screen time)_ |

---

#### TC-014

| Field | Details |
|---|---|
| **Test ID** | TC-014 |
| **Test Case** | Mental Wellness Prediction with Boundary Age Values |
| **Test Description** | Verify that age values at the boundaries (18 and 100) are accepted, while values outside the range (17 and 101) are rejected by backend validation. |
| **Components Involved** | Backend: mentalWellnessValidation middleware · POST /api/predictions/mental-wellness · AI: POST /predict/mental-wellness |
| **Test Steps** | 1. Submit with Age=18. 2. Submit with Age=100. 3. Submit with Age=17. 4. Submit with Age=101. |
| **Expected Result** | Age=18: Accepted, prediction returned. Age=100: Accepted, prediction returned. Age=17: HTTP 400 validation error. Age=101: HTTP 400 validation error. |
| **Screenshot** | _(Attach screenshot of validation error for age=17 and successful result for age=18)_ |

---

#### TC-015

| Field | Details |
|---|---|
| **Test ID** | TC-015 |
| **Test Case** | Send Prediction Report via Email |
| **Test Description** | Verify that clicking Email Report sends the prediction as a PDF attachment to the user's registered email. The button shows a loading state and confirms success with a toast. |
| **Components Involved** | Frontend: Email Report button · Backend: POST /api/predictions/:id/email · emailService.sendPredictionReportEmail · pdfGenerator · emailLimiter (3 per hour) |
| **Test Steps** | 1. Complete a mental wellness prediction. 2. Click Email Report. 3. Check the user's email inbox. |
| **Expected Result** | Button shows "Sending..." while processing. Toast: "Report sent to your email!" Email received with subject "Your Mental Wellness Report - WellSync." PDF attachment included. HTTP 200 response. |
| **Screenshot** | _(Attach screenshot of success toast and received email with PDF attachment)_ |

---

#### TC-016

| Field | Details |
|---|---|
| **Test ID** | TC-016 |
| **Test Case** | Download Prediction Report as PDF |
| **Test Description** | Verify that clicking Download PDF generates and downloads a PDF file with the correct filename format to the user's device. |
| **Components Involved** | Frontend: Download PDF button · Backend: GET /api/predictions/:id/pdf · pdfGenerator.generatePredictionReportPDF |
| **Test Steps** | 1. Complete a mental wellness prediction. 2. Click Download PDF. 3. Check browser downloads. |
| **Expected Result** | PDF file downloaded automatically. Filename format: Mental_Wellness_Report_YYYY-MM-DD.pdf. PDF contains user name, score, interpretation, and date. HTTP 200 with Content-Type: application/pdf. |
| **Screenshot** | _(Attach screenshot of browser download bar showing the PDF filename)_ |

---

#### TC-017

| Field | Details |
|---|---|
| **Test ID** | TC-017 |
| **Test Case** | View Recommendations Modal |
| **Test Description** | Verify that clicking View Recommendations opens a modal with score-appropriate recommendations. High scores show maintenance tips; low scores show improvement suggestions. |
| **Components Involved** | Frontend: /predictions/mental-wellness recommendations modal · Score-based recommendation logic |
| **Test Steps** | 1. Complete a prediction with score >= 80. 2. Click View Recommendations. 3. Read recommendations. 4. Click X to close. 5. Repeat with a score below 60. |
| **Expected Result** | Modal opens with score in header. Score >= 80 shows maintenance recommendations. Score < 60 shows improvement recommendations. Modal closes on X or Close button. |
| **Screenshot** | _(Attach screenshot of the recommendations modal with numbered list)_ |

---

#### TC-018

| Field | Details |
|---|---|
| **Test ID** | TC-018 |
| **Test Case** | View Prediction History |
| **Test Description** | Verify that after submitting multiple predictions, the user can view all past records in the history page with correct scores, interpretations, timestamps, and pagination. |
| **Components Involved** | Frontend: /predictions history page · Backend: GET /api/predictions?type=mental_wellness · Prediction model |
| **Test Steps** | 1. Submit at least 3 predictions. 2. Click View History. 3. Observe the prediction list. |
| **Expected Result** | All predictions listed in descending date order. Each row shows type, score, interpretation, and date. Pagination controls visible if over 20 records. Filter by type working. HTTP 200 with paginated response. |
| **Screenshot** | _(Attach screenshot of the predictions history page showing multiple entries)_ |

---

### Category C — Stress Level Prediction

---

#### TC-019

| Field | Details |
|---|---|
| **Test ID** | TC-019 |
| **Test Case** | Successful Stress Level Prediction |
| **Test Description** | Verify that a logged-in user can submit valid stress data and receive a predicted score (0-10) with a category label (Low/Moderate/High/Very High) and personalized recommendations. |
| **Components Involved** | Frontend: /predictions/stress · Backend: POST /api/predictions/stress-level · aiService.predictStressLevel · AI: POST /predict/stress · Prediction model |
| **Test Steps** | 1. Navigate to /predictions/stress. 2. Fill form: Age=28, Gender=Female, Occupation=Software Engineer, Work Mode=Hybrid, Screen Time=9, Work Screen=6, Leisure Screen=2, Sleep=6, Sleep Quality=2, Productivity=50, Exercise=60, Social=3, Mental Wellness Index=55. 3. Click Get Prediction. |
| **Expected Result** | Stress score displayed (0-10 range). Category label shown: Low/Moderate/High/Very High. Progress bar rendered. If score >= 6: red alert box "High Stress Detected." Recommendations list displayed. HTTP 201. Prediction saved to DB. |
| **Screenshot** | _(Attach screenshot of stress prediction results with high stress alert and recommendations)_ |

---

#### TC-020

| Field | Details |
|---|---|
| **Test ID** | TC-020 |
| **Test Case** | High Stress Alert Displayed When Score is 6 or Above |
| **Test Description** | Verify that the red alert banner appears only when the predicted stress score is 6 or above and does not appear for scores below 6. This is a critical UI safety feature. |
| **Components Involved** | Frontend: /predictions/stress result rendering · Score threshold >= 6 triggers high stress alert |
| **Test Steps** | 1. Submit stress prediction with high-risk inputs (high screen time, low sleep, low exercise). 2. Submit stress prediction with low-risk inputs (good sleep, high exercise). 3. Observe presence or absence of the alert box. |
| **Expected Result** | Score >= 6: Red left-bordered alert box visible with text "High Stress Detected." Score < 6: Alert box not rendered. Category label color matches score bracket. |
| **Screenshot** | _(Attach screenshot showing high stress alert for high score and no alert for low score)_ |

---

#### TC-021

| Field | Details |
|---|---|
| **Test ID** | TC-021 |
| **Test Case** | Stress Prediction Rejected When Required Field is Missing |
| **Test Description** | Verify that omitting the mental_wellness_index_0_100 field, which is unique to the stress prediction form, causes a validation error from the backend. |
| **Components Involved** | Backend: stressLevelValidation middleware · POST /api/predictions/stress-level · AI: POST /predict/stress (Pydantic validation) |
| **Test Steps** | 1. Send POST /api/predictions/stress-level with all valid fields except mental_wellness_index_0_100 omitted. 2. Observe the response. |
| **Expected Result** | HTTP 400 response. Validation error states that mental_wellness_index_0_100 is required. No prediction made. No record saved to DB. |
| **Screenshot** | _(Attach screenshot of API response showing the validation error for the missing field)_ |

---

#### TC-022

| Field | Details |
|---|---|
| **Test ID** | TC-022 |
| **Test Case** | Stress Score Category Boundary Verification |
| **Test Description** | Verify that stress score categories are correctly assigned at boundary values: score <= 3 is Low, <= 6 is Moderate, <= 8 is High, and above 8 is Very High. |
| **Components Involved** | AI: /predict/stress score interpretation · Frontend: /predictions/stress category label rendering |
| **Test Steps** | 1. Submit inputs designed to produce scores near 3, 6, and 8. 2. Observe the category labels displayed. 3. Cross-reference with the score shown. |
| **Expected Result** | Score <= 3: Label "Low Stress" shown in green. Score 3.1-6.0: "Moderate Stress" in amber. Score 6.1-8.0: "High Stress" in orange. Score > 8: "Very High Stress" in red. High stress alert shown at 6 and above. |
| **Screenshot** | _(Attach screenshot showing each category label with appropriate color coding)_ |

---

#### TC-023

| Field | Details |
|---|---|
| **Test ID** | TC-023 |
| **Test Case** | Prediction Rate Limiter Blocks Excessive Requests |
| **Test Description** | Verify that the predictionLimiter allows a maximum of 10 prediction requests per minute. The 11th request within 60 seconds is blocked with HTTP 429. |
| **Components Involved** | Backend: rateLimiter.js (predictionLimiter) · POST /api/predictions/stress-level |
| **Test Steps** | 1. Send 10 valid POST /api/predictions/stress-level requests within 60 seconds. 2. Send an 11th request immediately. |
| **Expected Result** | First 10 requests: HTTP 201 with prediction results. 11th request: HTTP 429 rate limit error. Rate limit resets after 60 seconds. |
| **Screenshot** | _(Attach screenshot of HTTP 429 response for the 11th prediction request)_ |

---

#### TC-024

| Field | Details |
|---|---|
| **Test ID** | TC-024 |
| **Test Case** | Stress Recommendations Match Input Risk Factors |
| **Test Description** | Verify that the AI service returns contextually relevant recommendations based on input values. Low sleep hours should trigger a sleep recommendation and low exercise should trigger an exercise recommendation. |
| **Components Involved** | AI: POST /predict/stress recommendation logic · Frontend: /predictions/stress recommendations display |
| **Test Steps** | 1. Submit with sleep_hours=5 (below 7) and exercise_minutes_per_week=100 (below 150). 2. Observe the recommendations list. |
| **Expected Result** | Recommendation "Aim for 7-9 hours of sleep per night" appears. Recommendation "Increase physical activity" appears. Recommendations displayed as a list. Count varies based on risk factors. |
| **Screenshot** | _(Attach screenshot of recommendations list showing sleep and exercise suggestions)_ |

---

### Category D — Academic Impact Prediction

---

#### TC-025

| Field | Details |
|---|---|
| **Test ID** | TC-025 |
| **Test Case** | Successful Academic Impact Prediction |
| **Test Description** | Verify that a logged-in user can submit valid academic data and receive an addiction score (2-9) with a risk category label and interpretation text. |
| **Components Involved** | Frontend: /predictions/academic · Backend: POST /api/predictions/academic-impact · aiService.predictAcademicImpact · AI: POST /predict/academic-impact · Prediction model |
| **Test Steps** | 1. Navigate to /predictions/academic. 2. Fill form: Age=20, Gender=Male, Academic Level=Bachelor, Country=Sri Lanka, Platform=Instagram, Daily Usage=4, Sleep=7, Mental Health=7, Conflicts=2, Affects Performance=Yes, Relationship=Single. 3. Click Get Prediction. |
| **Expected Result** | Addiction score displayed (2-9 range). Risk category shown: Low/Moderate/High Risk. Orange interpretation box visible. Progress bar rendered. HTTP 201. Prediction saved to DB. |
| **Screenshot** | _(Attach screenshot of academic impact results with addiction score, risk label, and progress bar)_ |

---

#### TC-026

| Field | Details |
|---|---|
| **Test ID** | TC-026 |
| **Test Case** | Academic Impact Age Range Validation (17-30) |
| **Test Description** | Verify that the academic impact prediction enforces an age range of 17-30, which is stricter than other prediction types. Values outside this range must be rejected. |
| **Components Involved** | Backend: academicImpactValidation middleware · POST /api/predictions/academic-impact · AI: POST /predict/academic-impact |
| **Test Steps** | 1. Submit with Age=17 (minimum boundary). 2. Submit with Age=30 (maximum boundary). 3. Submit with Age=16. 4. Submit with Age=31. |
| **Expected Result** | Age=17: Accepted, prediction returned. Age=30: Accepted, prediction returned. Age=16: HTTP 400 validation error. Age=31: HTTP 400 validation error. |
| **Screenshot** | _(Attach screenshot of validation error for age=31 and success response for age=30)_ |

---

#### TC-027

| Field | Details |
|---|---|
| **Test ID** | TC-027 |
| **Test Case** | Academic Impact High Risk Score Display |
| **Test Description** | Verify that a high addiction score of 7 or above triggers the High Risk label with red color coding and the most intensive recommendation set in the modal. |
| **Components Involved** | Frontend: /predictions/academic result rendering · Recommendations modal (score >= 7 branch) |
| **Test Steps** | 1. Submit with high-risk inputs: daily usage=6h, conflicts=5, affects performance=Yes, mental health score=3. 2. Observe the risk label and color. 3. Click View Recommendations. |
| **Expected Result** | Score >= 7: Label "High Risk" displayed in red. Recommendations modal shows 8 items with strict usage control suggestions. Score < 5: Shows "Low Risk" in green with 4 maintenance items. |
| **Screenshot** | _(Attach screenshot of High Risk label and recommendations modal for a high addiction score)_ |

---

#### TC-028

| Field | Details |
|---|---|
| **Test ID** | TC-028 |
| **Test Case** | Academic Impact Prediction with Different Social Media Platforms |
| **Test Description** | Verify that selecting different social media platforms produces different scores. The AI model treats popular platforms (Instagram, TikTok, Snapchat, Facebook, Twitter) as a higher risk factor. |
| **Components Involved** | Frontend: /predictions/academic platform dropdown · AI: POST /predict/academic-impact (uses_popular_platform feature) |
| **Test Steps** | 1. Submit identical form with Platform=Instagram. 2. Submit identical form with Platform=YouTube. 3. Compare the two scores. |
| **Expected Result** | All platform values accepted without error. Popular platforms produce higher risk scores. YouTube and Other are treated as non-popular with a lower risk factor. Each submission returns HTTP 201. |
| **Screenshot** | _(Attach screenshot showing two different scores for Instagram vs YouTube with identical other inputs)_ |

---

#### TC-029

| Field | Details |
|---|---|
| **Test ID** | TC-029 |
| **Test Case** | Affects Academic Performance Field Validation |
| **Test Description** | Verify that the affects_academic_performance field accepts only Yes or No at the backend validation level. Any other value must be rejected with HTTP 400. |
| **Components Involved** | Backend: academicImpactValidation (enum: Yes/No) · AI: POST /predict/academic-impact (case-insensitive preprocessing) |
| **Test Steps** | 1. Submit with affects_academic_performance = Yes. 2. Submit with affects_academic_performance = No. 3. Submit with affects_academic_performance = Maybe. |
| **Expected Result** | Yes: Accepted, higher addiction risk predicted. No: Accepted, lower risk score. Maybe: HTTP 400 validation error from backend. |
| **Screenshot** | _(Attach screenshot of validation error for an invalid value and successful result for Yes)_ |

---

#### TC-030

| Field | Details |
|---|---|
| **Test ID** | TC-030 |
| **Test Case** | Academic Impact Prediction Trend Over Time |
| **Test Description** | Verify that the trend endpoint returns a time-series of academic impact scores for the past 30 days and that the dashboard reflects the latest academic impact score. |
| **Components Involved** | Backend: GET /api/predictions/trends/academic_impact · Prediction.getPredictionTrends · Frontend: /dashboard latest prediction card |
| **Test Steps** | 1. Submit 3 or more academic impact predictions. 2. Call GET /api/predictions/trends/academic_impact?days=30. 3. Navigate to the dashboard and observe the Academic Impact card. |
| **Expected Result** | Trend endpoint returns an array of score and date objects sorted chronologically. Dashboard shows the latest academic impact score. HTTP 200 with type, period, and trends in response. |
| **Screenshot** | _(Attach screenshot of the dashboard academic impact card and the trends API response)_ |

---

### Category E — User Profile and Settings

---

#### TC-031

| Field | Details |
|---|---|
| **Test ID** | TC-031 |
| **Test Case** | Update Personal Information |
| **Test Description** | Verify that a logged-in user can update their first name, last name, age, and gender from the Settings page. Changes should persist after a page refresh. |
| **Components Involved** | Frontend: /settings Personal Info tab · Backend: PUT /api/users/profile · userController.updateProfile · updateProfileValidation · User model |
| **Test Steps** | 1. Navigate to /settings. 2. Go to the Personal Info tab. 3. Change First Name to Jane, Last Name to Smith, Age to 25, Gender to Female. 4. Click Save. 5. Refresh the page. |
| **Expected Result** | Alert: "Personal information updated successfully!" (auto-hides after 4 seconds). HTTP 200 with updated user object. Changes persist after refresh. Dashboard welcome message reflects the new name. |
| **Screenshot** | _(Attach screenshot of the success alert after saving personal information)_ |

---

#### TC-032

| Field | Details |
|---|---|
| **Test ID** | TC-032 |
| **Test Case** | Change Account Password |
| **Test Description** | Verify that a user can change their password by providing the correct current password and a new password meeting complexity requirements. The old password must no longer work after the change. |
| **Components Involved** | Frontend: /settings Password tab · Backend: PUT /api/auth/change-password · changePasswordValidation · User.comparePassword · bcrypt re-hashing |
| **Test Steps** | 1. Navigate to /settings > Password tab. 2. Enter Current Password: Test@1234. 3. Enter New Password: NewPass@5678 and confirm. 4. Click Save. 5. Attempt login with the old password. |
| **Expected Result** | Success alert shown. HTTP 200: "Password changed successfully." In-app notification created. Login with old password fails (HTTP 401). Login with new password succeeds. |
| **Screenshot** | _(Attach screenshot of the success alert and failed login attempt with the old password)_ |

---

#### TC-033

| Field | Details |
|---|---|
| **Test ID** | TC-033 |
| **Test Case** | Save and Apply Theme Preference |
| **Test Description** | Verify that selecting a theme (Light, Dark, or System) and saving it applies the theme immediately and persists the preference to the database. |
| **Components Involved** | Frontend: /settings Preferences tab · useTheme from next-themes · Backend: PUT /api/users/profile with preferences.theme · MongoDB dot notation update |
| **Test Steps** | 1. Navigate to /settings > Preferences tab. 2. Click the Dark theme card. 3. Click Save Theme. 4. Observe the page theme. 5. Refresh and re-visit settings. |
| **Expected Result** | Selected theme card highlighted. Dark mode applied to the entire UI immediately. Success alert shown. Preference saved to DB as preferences.theme = dark. Theme persists after page refresh. |
| **Screenshot** | _(Attach screenshot of dark mode applied after selecting the Dark theme card)_ |

---

#### TC-034

| Field | Details |
|---|---|
| **Test ID** | TC-034 |
| **Test Case** | Log Daily Screen Time |
| **Test Description** | Verify that a user can log daily screen time with total, work, and leisure hours, and view the entry in the weekly history table. Only one log per day is permitted. |
| **Components Involved** | Frontend: /profile Screen Time tab · Backend: POST /api/profile/screen-time · ScreenTimeLog model (unique user and date constraint) |
| **Test Steps** | 1. Navigate to /profile > Screen Time tab. 2. Enter Total Screen Time=7, Work Screen=4, Leisure Screen=2, Mood=Good. 3. Click Log Screen Time. 4. Attempt to log again for the same day. |
| **Expected Result** | Screen time logged successfully. Entry appears in the weekly history table. Hours above 8 shown in red, above 5 in amber. Second log for the same day returns a duplicate error. Weekly average updates. |
| **Screenshot** | _(Attach screenshot of the weekly history table showing the new screen time entry)_ |

---

#### TC-035

| Field | Details |
|---|---|
| **Test ID** | TC-035 |
| **Test Case** | Create and Save Mental Wellness Profile |
| **Test Description** | Verify that a user can set up their Mental Wellness Profile and that the completion status and readiness score update on the Overview tab after saving. |
| **Components Involved** | Frontend: /profile Wellness Profile tab · Backend: PUT /api/profile/wellness · MentalWellnessProfile model · calculateReadinessScore |
| **Test Steps** | 1. Navigate to /profile > Wellness Profile tab. 2. Select Occupation=Student, Work Mode=Remote. 3. Set Stress Level=4, Productivity=75, Exercise=150, Social Hours=8. 4. Click Save. 5. Switch to the Overview tab. |
| **Expected Result** | Message: "Wellness profile saved successfully!" Overview tab shows wellness profile as Complete. Readiness Score and Stress Category displayed. profileCompleted = true in DB. |
| **Screenshot** | _(Attach screenshot of the Overview tab showing the wellness profile as complete with readiness score)_ |

---

#### TC-036

| Field | Details |
|---|---|
| **Test ID** | TC-036 |
| **Test Case** | Delete User Account with Password Confirmation |
| **Test Description** | Verify that a user can delete their account from the Danger Zone tab. The system requires password confirmation and then permanently deletes the user and all associated predictions. |
| **Components Involved** | Frontend: /settings Danger Zone tab · Backend: DELETE /api/users/account · userController · Prediction.deleteMany |
| **Test Steps** | 1. Navigate to /settings > Danger Zone tab. 2. Click Delete Account. 3. Enter the correct password in the confirmation dialog. 4. Confirm deletion. 5. Attempt to log in with the deleted credentials. |
| **Expected Result** | Confirmation dialog shown. Account deleted with HTTP 200. All user predictions deleted from DB. Login attempt after deletion returns HTTP 401. Redirected to the home or login page. |
| **Screenshot** | _(Attach screenshot of the confirmation dialog and redirect after account deletion)_ |

---

### Category F — Admin Panel

---

#### TC-037

| Field | Details |
|---|---|
| **Test ID** | TC-037 |
| **Test Case** | Admin Dashboard Displays System-Wide Statistics |
| **Test Description** | Verify that the admin dashboard correctly aggregates and displays system-wide statistics including total users, active users, total predictions, type breakdown, and chart data. |
| **Components Involved** | Frontend: /admin · Backend: GET /api/admin/dashboard · adminController.getDashboard · MongoDB aggregation pipelines |
| **Test Steps** | 1. Log in as admin. 2. Navigate to /admin. 3. Observe the stats cards and charts. |
| **Expected Result** | Stats cards show Total Users, Total Predictions, Avg Mental Wellness, and Predictions by Type. User Growth chart, Wellness Trend chart, Stress Distribution chart, and Activity Heatmap all rendered. All data matches the database state. HTTP 200. |
| **Screenshot** | _(Attach screenshot of the admin dashboard with all stats cards and charts populated)_ |

---

#### TC-038

| Field | Details |
|---|---|
| **Test ID** | TC-038 |
| **Test Case** | Admin User List Search and Filter |
| **Test Description** | Verify that the admin user table supports searching by name or email and filtering by role and status with correct result sets. |
| **Components Involved** | Frontend: /admin user table · Backend: GET /api/admin/users with search, role, verified, active query params · adminController.getUsers |
| **Test Steps** | 1. Navigate to /admin. 2. Type "john" in the search box. 3. Select Role filter "Admin." 4. Observe filtered results. 5. Clear filters. |
| **Expected Result** | Search matches by firstName, lastName, or email using case-insensitive regex. Role filter returns only the selected role. Empty state shown when no matches. Pagination resets to page 1 on filter change. |
| **Screenshot** | _(Attach screenshot of the filtered user table showing results for the search term "john")_ |

---

#### TC-039

| Field | Details |
|---|---|
| **Test ID** | TC-039 |
| **Test Case** | Admin Promotes and Demotes User Role |
| **Test Description** | Verify that an admin can promote a regular user to admin role and demote an admin back to user. The system admin account must be protected from any role changes. |
| **Components Involved** | Frontend: /admin user table Promote/Demote button · Backend: PUT /api/admin/users/:id/role · adminController.updateUserRole · User.isSystemAdminAccount |
| **Test Steps** | 1. Navigate to /admin. 2. Find a regular user and click Promote to Admin. 3. Verify the role badge changes. 4. Click Demote to User. 5. Attempt to change the system admin role. |
| **Expected Result** | Regular user promoted: role badge changes to Admin. HTTP 200 returned. Demote reverses the change. System admin account: HTTP 403. Promote/Demote button disabled for system admin rows. |
| **Screenshot** | _(Attach screenshot of the role badge changing from User to Admin after promotion)_ |

---

#### TC-040

| Field | Details |
|---|---|
| **Test ID** | TC-040 |
| **Test Case** | Admin Deactivates a User Account |
| **Test Description** | Verify that an admin can deactivate a user account. A deactivated user receives HTTP 401 on any authenticated request even with a valid JWT. Reactivation restores access. |
| **Components Involved** | Frontend: /admin status toggle · Backend: PUT /api/admin/users/:id/status · protect middleware (isActive check) · User model |
| **Test Steps** | 1. Log in as admin and find an active user. 2. Click Deactivate. 3. As the deactivated user, make any authenticated API request. 4. Reactivate and retry. |
| **Expected Result** | Status badge changes to Inactive. HTTP 200: "User deactivated successfully." Deactivated user's API calls return HTTP 401 "Account deactivated." Reactivation restores access immediately. System admin cannot be deactivated (HTTP 403). |
| **Screenshot** | _(Attach screenshot of the Inactive badge and the 401 response for a deactivated user)_ |

---

#### TC-041

| Field | Details |
|---|---|
| **Test ID** | TC-041 |
| **Test Case** | Admin Deletes User and All Associated Data |
| **Test Description** | Verify that deleting a user from the admin panel also permanently deletes all their predictions and notifications. Admin cannot delete their own account or the system admin account. |
| **Components Involved** | Frontend: /admin delete button and ConfirmationDialog · Backend: DELETE /api/admin/users/:id · adminController.deleteUser · Prediction.deleteMany · Notification.deleteMany |
| **Test Steps** | 1. Click the delete icon on a user row. 2. Confirm in the dialog. 3. Check the database for the user's predictions and notifications. 4. Attempt to delete your own admin account. |
| **Expected Result** | Confirmation dialog appears. User deleted: HTTP 200. All user predictions deleted from DB. All user notifications deleted from DB. Self-deletion returns HTTP 400. System admin deletion returns HTTP 403. |
| **Screenshot** | _(Attach screenshot of the confirmation dialog and user no longer appearing in the table after deletion)_ |

---

#### TC-042

| Field | Details |
|---|---|
| **Test ID** | TC-042 |
| **Test Case** | Admin Sends Broadcast Notification to All Users |
| **Test Description** | Verify that an admin can send a broadcast notification with title, message, and priority to all active verified users. With email enabled, emails are sent and both in-app notifications and emails are delivered. |
| **Components Involved** | Frontend: /admin/broadcast · Backend: POST /api/admin/broadcast · adminController.sendBroadcast · Notification.insertMany · emailService.sendBroadcastEmail |
| **Test Steps** | 1. Navigate to /admin/broadcast. 2. Enter Title: System Maintenance, Message: Scheduled downtime on Sunday 2am to 4am, Priority: High. 3. Enable the Send Email toggle. 4. Click Send Notification to All Users. |
| **Expected Result** | Button shows loading state while sending. Toast confirms broadcast sent with recipient count. Result box shows recipients, emails sent, and emails failed. All active verified users receive an in-app notification. Broadcast emails received in user inboxes. HTTP 200 with delivery stats. |
| **Screenshot** | _(Attach screenshot of the broadcast result card showing recipient and email delivery counts)_ |

---

#### TC-043

| Field | Details |
|---|---|
| **Test ID** | TC-043 |
| **Test Case** | Admin Views User Details and Prediction History |
| **Test Description** | Verify that an admin can view a specific user's detail page with their correct full name, account status, and the last 5 predictions with scores and dates. |
| **Components Involved** | Frontend: /admin/users/[id] · Backend: GET /api/admin/users/:id · adminController.getUserById · Prediction model (last 5) |
| **Test Steps** | 1. Navigate to /admin. 2. Click View Details on a user row. 3. Observe the user information card. 4. Observe the recent predictions list. |
| **Expected Result** | Full name shown correctly as firstName + lastName (not N/A). Email, joined date, and last login displayed. Role and status badges shown. Total predictions count shown. Last 5 predictions listed with type, date, and score. System admin protection buttons are disabled. |
| **Screenshot** | _(Attach screenshot of the user detail page showing full name, status badges, and recent predictions)_ |

---

### Category G — Notifications and Analytics

---

#### TC-044

| Field | Details |
|---|---|
| **Test ID** | TC-044 |
| **Test Case** | Notification Bell Shows Correct Unread Count |
| **Test Description** | Verify that after a prediction notification is created, the notification bell displays the correct unread count. Marking all as read should clear the badge. |
| **Components Involved** | Frontend: Navbar notification bell · Backend: GET /api/notifications/unread-count · PUT /api/notifications/mark-all-read · Notification model |
| **Test Steps** | 1. Submit a new prediction to trigger a notification. 2. Observe the notification bell badge. 3. Open the notifications panel. 4. Click Mark All Read. 5. Observe the badge. |
| **Expected Result** | Badge shows the correct unread count after prediction. Notifications listed with type icon, title, and message. Mark All Read clears the badge to 0. Read notifications no longer highlighted. |
| **Screenshot** | _(Attach screenshot of the notification bell with badge count and the open notifications panel)_ |

---

#### TC-045

| Field | Details |
|---|---|
| **Test ID** | TC-045 |
| **Test Case** | Analytics Page Switches Between Weekly and Monthly Period |
| **Test Description** | Verify that the analytics dashboard correctly generates and displays metrics for both Weekly and Monthly periods and that all stat cards update when the period is switched. |
| **Components Involved** | Frontend: /analytics period toggle · Backend: POST /api/analytics/generate · GET /api/analytics/weekly · GET /api/analytics/monthly · Analytics model |
| **Test Steps** | 1. Navigate to /analytics. 2. Click Weekly. 3. Observe the stat cards. 4. Click Monthly. 5. Observe the updated stats. 6. Click Refresh. |
| **Expected Result** | Weekly shows last 7 days of data. Monthly shows last 30 days of data. Per-type cards show average score, count, min, max, and trend indicator. AI Insights panel populated. Refresh triggers a new analytics generation. |
| **Screenshot** | _(Attach screenshot of the analytics page showing Weekly and Monthly stat cards)_ |

---

#### TC-046

| Field | Details |
|---|---|
| **Test ID** | TC-046 |
| **Test Case** | AI Insights Generated from Prediction History |
| **Test Description** | Verify that the Analytics page generates meaningful insights based on the user's prediction history. Critical insights appear in red and positive insights appear in green. |
| **Components Involved** | Frontend: /analytics insights panel · Backend: GET /api/analytics/insights · analyticsController.generateInsights |
| **Test Steps** | 1. Submit multiple predictions of each type. 2. Navigate to /analytics. 3. Observe the AI Insights panel. |
| **Expected Result** | Insight cards shown with color-coded left borders (red=critical, yellow=warning, blue=info, green=positive). Each insight shows a title, message, and recommendation. Empty state with CTA shown if no predictions exist. |
| **Screenshot** | _(Attach screenshot of the AI Insights panel with multiple cards showing different severity colors)_ |

---

#### TC-047

| Field | Details |
|---|---|
| **Test ID** | TC-047 |
| **Test Case** | Milestone Notification After 10th Prediction |
| **Test Description** | Verify that when a user's total prediction count reaches a milestone (10, 25, 50, 100, 250), a Milestone Reached in-app notification is automatically created and shown in the panel. |
| **Components Involved** | Backend: predictionController milestone check · notificationService.notifyMilestoneReached · Notification model · Frontend: notification bell |
| **Test Steps** | 1. Ensure the user has 9 total predictions. 2. Submit one more prediction of any type. 3. Check the notification bell. |
| **Expected Result** | New notification of type milestone_reached appears. Title includes the milestone count. Unread count increments. No duplicate notification created for the same count. |
| **Screenshot** | _(Attach screenshot of the milestone notification in the panel after the 10th prediction)_ |

---

### Category H — AI Service and Edge Cases

---

#### TC-048

| Field | Details |
|---|---|
| **Test ID** | TC-048 |
| **Test Case** | AI Service Health Check Returns Model Status |
| **Test Description** | Verify that the AI service health endpoint returns a healthy status with the loaded state of all three ML models. If the stress model file is missing, the service still starts but reports that model as unavailable. |
| **Components Involved** | AI: GET /health · model_loader.py · FastAPI startup event · stress_model.pkl · best_model.pkl |
| **Test Steps** | 1. Ensure the AI service is running on port 8000. 2. Send GET http://localhost:8000/health. 3. Verify model statuses in the response. |
| **Expected Result** | HTTP 200 with status: healthy. Response includes loaded state for mental_wellness, academic_impact, and stress models. If stress model file is missing, stress shows false but service remains running. |
| **Screenshot** | _(Attach screenshot of the /health API response showing all model statuses)_ |

---

#### TC-049

| Field | Details |
|---|---|
| **Test ID** | TC-049 |
| **Test Case** | AI Service Rejects Out-of-Range Input Values |
| **Test Description** | Verify that the FastAPI AI service validates input fields using Pydantic and returns HTTP 422 with descriptive errors for out-of-range values, even if the backend validator is bypassed. |
| **Components Involved** | AI: POST /predict/mental-wellness · MentalWellnessInput Pydantic schema · FastAPI validation |
| **Test Steps** | 1. Send POST to /predict/mental-wellness with sleep_quality_1_5=0 (below min of 1). 2. Send with stress_level_0_10=11 (above max of 10). 3. Send with screen_time_hours=25 (above max of 24). 4. Send with work_screen_hours=10 when screen_time_hours=5 (cross-field violation). |
| **Expected Result** | sleep_quality_1_5=0: HTTP 422 with field validation error. stress_level_0_10=11: HTTP 422. screen_time_hours=25: HTTP 422. work_screen_hours exceeding screen_time_hours: HTTP 422 with message "Screen time component cannot exceed total screen time." All errors include field name and constraint details. |
| **Screenshot** | _(Attach screenshot of the HTTP 422 response body with Pydantic validation error details)_ |

---

#### TC-050

| Field | Details |
|---|---|
| **Test ID** | TC-050 |
| **Test Case** | Complete End-to-End User Journey |
| **Test Description** | Verify the full user journey from registration through email verification, all three prediction types, PDF download, email report, and an admin viewing the new user's data. All three tiers must work together correctly. |
| **Components Involved** | All tiers: Frontend (auth and prediction pages) · Backend (all routes) · AI Service (all prediction endpoints) · MongoDB · Email service |
| **Test Steps** | 1. Register a new account. 2. Verify email with the code. 3. Log in. 4. Submit a mental wellness prediction and download PDF. 5. Submit a stress level prediction and email the report. 6. Submit an academic impact prediction. 7. View the dashboard stats. 8. Open the analytics page. 9. Check the notifications panel. 10. Log in as admin and view the new user's details and predictions. |
| **Expected Result** | All 3 predictions return valid scores within correct ranges. PDF downloaded with the correct filename. Email report received with PDF attachment. Dashboard shows all 3 latest prediction cards. Analytics shows data for all 3 types. Notifications panel shows prediction and milestone notifications. Admin user detail page shows all 3 predictions with correct user name. All API responses follow the success: true format. No console errors. |
| **Screenshot** | _(Attach screenshots of the dashboard with all 3 prediction cards, the email inbox, and the admin user detail page)_ |

---

## 6. Test Summary

| Category | Total | Pass | Fail | Blocked |
|---|---|---|---|---|
| A — Authentication and Authorization | 10 | | | |
| B — Mental Wellness Prediction | 8 | | | |
| C — Stress Level Prediction | 6 | | | |
| D — Academic Impact Prediction | 6 | | | |
| E — User Profile and Settings | 6 | | | |
| F — Admin Panel | 7 | | | |
| G — Notifications and Analytics | 4 | | | |
| H — AI Service and Edge Cases | 3 | | | |
| **Total** | **50** | | | |

---

## 7. Entry and Exit Criteria

### Entry Criteria

- All three services are running (Frontend on port 3000, Backend on port 5000, AI Service on port 8000)
- MongoDB is connected and seeded with the admin account
- Environment files are configured with valid SMTP credentials, JWT secrets, and AI service URL
- AI models are trained and saved in the ai/models directory

### Exit Criteria

- All 50 test cases have been executed
- All authentication and prediction test cases pass
- No critical or high severity defects remain open
- PDF generation and email delivery are confirmed working
- All API responses follow the standard success/error format

---

## 8. Defect Severity Classification

| Severity | Description | Examples |
|---|---|---|
| P1 - Critical | System unusable, data loss, or security breach | Login broken, predictions not saving, JWT not verified |
| P2 - High | Major feature broken with no workaround | PDF download fails, admin cannot delete users, email not sent |
| P3 - Medium | Feature works but with a workaround | Wrong score color, missing pagination, theme not persisting |
| P4 - Low | Cosmetic or minor UX issue | Typo in label, minor alignment issue, missing loading state |

---

## 9. Tools Used

| Tool | Purpose |
|---|---|
| Google Chrome DevTools | Frontend inspection, network requests, console errors |
| Postman / Thunder Client | API endpoint testing |
| MongoDB Compass | Database state verification |
| Ethereal Email | Email delivery testing in development |
| Jest | Backend unit and integration tests |
| pytest | AI service endpoint tests |
| ESLint | Frontend static code analysis |

---

*WellSync Test Plan v1.0 | 50 Test Cases | Date: 2026-02-20*

