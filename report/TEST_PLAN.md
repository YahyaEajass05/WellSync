# WellSync — Test Plan & Test Cases

**Project:** WellSync AI-Powered Mental Wellness & Academic Performance Prediction System
**Version:** 1.0.0
**Prepared By:** QA Team
**Date:** 2026-02-20
**Total Test Cases:** 50

---

## 1. Introduction

This document outlines the complete test plan and 50 individual test cases for the WellSync platform. The platform is a three-tier system consisting of:

- **Frontend:** Next.js 14 (TypeScript) — User Interface
- **Backend:** Node.js / Express.js REST API — Business Logic
- **AI Service:** FastAPI (Python) — Machine Learning Predictions

Testing covers functional correctness, input validation, authentication & authorization, AI prediction accuracy, UI behavior, error handling, and edge cases.

---

## 2. Scope of Testing

| Module | Coverage |
|---|---|
| Authentication (Register, Login, Verify, Reset) | ✅ Included |
| User Profile & Settings | ✅ Included |
| Mental Wellness Prediction | ✅ Included |
| Stress Level Prediction | ✅ Included |
| Academic Impact Prediction | ✅ Included |
| Admin Dashboard & User Management | ✅ Included |
| Notifications & Broadcast | ✅ Included |
| Analytics | ✅ Included |
| AI Service Endpoints | ✅ Included |
| Email Notifications | ✅ Included |

---

## 3. Test Environment

| Component | Details |
|---|---|
| Frontend URL | http://localhost:3000 |
| Backend URL | http://localhost:5000 |
| AI Service URL | http://localhost:8000 |
| Database | MongoDB (local or Atlas) |
| Browser | Google Chrome (latest) |
| OS | Windows 11 |

---

## 4. Test Categories

| # | Category | Test Cases |
|---|---|---|
| A | Authentication & Authorization | TC-001 to TC-010 |
| B | Mental Wellness Prediction | TC-011 to TC-018 |
| C | Stress Level Prediction | TC-019 to TC-024 |
| D | Academic Impact Prediction | TC-025 to TC-030 |
| E | User Profile & Settings | TC-031 to TC-036 |
| F | Admin Panel | TC-037 to TC-043 |
| G | Notifications & Analytics | TC-044 to TC-047 |
| H | AI Service & Edge Cases | TC-048 to TC-050 |

---

## 5. Test Cases

---

### CATEGORY A — Authentication & Authorization

---

#### TC-001: Successful User Registration

| Field | Details |
|---|---|
| **Test ID** | TC-001 |
| **Test Case** | Successful User Registration |
| **Test Description** | Verify that a new user can register with valid credentials including first name, last name, email, and a password meeting complexity requirements. The system should create the account, send a welcome email with a 6-digit verification code, and return a JWT token. |
| **Components Involved** | Frontend: `/register` page · Backend: `POST /api/auth/register` · `authController.register` · `User` model · `emailService.sendWelcomeEmail` |
| **Test Steps** | 1. Navigate to http://localhost:3000/register · 2. Enter First Name: "John" · 3. Enter Last Name: "Doe" · 4. Enter Email: "johndoe@example.com" · 5. Enter Password: "Test@1234" · 6. Enter Confirm Password: "Test@1234" · 7. Click "Create Account" |
| **Expected Result** | ✅ Account created successfully · ✅ Toast: "Account created successfully! Please verify your email." · ✅ Redirected to `/verify-email` · ✅ Welcome email sent with 6-digit code · ✅ JWT token stored in localStorage · ✅ HTTP 201 response with `{ success: true, data: { user, token } }` |
| **Screenshot** | _(Attach screenshot of successful registration confirmation and redirect to verify-email page)_ |

---

#### TC-002: Registration with Duplicate Email

| Field | Details |
|---|---|
| **Test ID** | TC-002 |
| **Test Case** | Registration with Already Registered Email |
| **Test Description** | Verify that attempting to register with an email address that already exists in the system is rejected with a clear error message. No duplicate accounts should be created. |
| **Components Involved** | Frontend: `/register` page · Backend: `POST /api/auth/register` · `authController.register` · `User` model (unique email index) |
| **Test Steps** | 1. Navigate to `/register` · 2. Enter details with an already-registered email (e.g., "johndoe@example.com") · 3. Fill all other valid fields · 4. Click "Create Account" |
| **Expected Result** | ✅ Registration rejected · ✅ Toast error: "User already exists with this email" · ✅ HTTP 400 response · ✅ No duplicate user created in database · ✅ User remains on register page |
| **Screenshot** | _(Attach screenshot of error toast message on the registration page)_ |

---

#### TC-003: Registration with Weak Password

| Field | Details |
|---|---|
| **Test ID** | TC-003 |
| **Test Case** | Registration with Password Not Meeting Complexity Requirements |
| **Test Description** | Verify that passwords not meeting complexity rules (min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit) are rejected with field-level validation errors before the API is even called. |
| **Components Involved** | Frontend: `/register` page · Zod validation schema · Backend: `registerValidation` middleware |
| **Test Steps** | 1. Navigate to `/register` · 2. Enter First Name: "John", Last Name: "Doe", Email: "test@example.com" · 3. Enter Password: "password" (no uppercase, no digit) · 4. Enter Confirm Password: "password" · 5. Click "Create Account" |
| **Expected Result** | ✅ Inline field validation error shown: "Password must be at least 8 characters" · ✅ No API call made · ✅ HTTP 400 if bypassed to API: `{ errors: [{ field: "password", message: "..." }] }` · ✅ Account not created |
| **Screenshot** | _(Attach screenshot showing the inline password validation error in red below the field)_ |

---

#### TC-004: Successful User Login

| Field | Details |
|---|---|
| **Test ID** | TC-004 |
| **Test Case** | Successful Login with Valid Credentials |
| **Test Description** | Verify that a registered and active user can log in with correct email and password. The system should return a JWT access token, a refresh token, and redirect to the appropriate dashboard based on role. |
| **Components Involved** | Frontend: `/login` page · Backend: `POST /api/auth/login` · `authController.login` · `User` model (`comparePassword`, `isLocked`) |
| **Test Steps** | 1. Navigate to `/login` · 2. Enter registered email: "johndoe@example.com" · 3. Enter correct password: "Test@1234" · 4. Click "Sign In" |
| **Expected Result** | ✅ Login successful · ✅ Toast: "Welcome back, John!" · ✅ Regular user redirected to `/dashboard` · ✅ Admin user redirected to `/admin` · ✅ JWT token and user object saved in localStorage · ✅ HTTP 200 with `{ success: true, data: { user, token, refreshToken } }` |
| **Screenshot** | _(Attach screenshot of successful login redirect to dashboard with welcome toast)_ |

---

#### TC-005: Login with Incorrect Password

| Field | Details |
|---|---|
| **Test ID** | TC-005 |
| **Test Case** | Login Attempt with Wrong Password |
| **Test Description** | Verify that logging in with an incorrect password is rejected with a generic error message (no information leakage about whether the email or password is wrong). After 5 failed attempts, the account should be temporarily locked for 30 minutes. |
| **Components Involved** | Frontend: `/login` page · Backend: `POST /api/auth/login` · `authController.login` · `User.incLoginAttempts()` · `User.isLocked()` |
| **Test Steps** | 1. Navigate to `/login` · 2. Enter valid email: "johndoe@example.com" · 3. Enter wrong password: "WrongPass123" · 4. Click "Sign In" |
| **Expected Result** | ✅ Login rejected · ✅ Toast error: "Invalid credentials" · ✅ HTTP 401 response · ✅ `loginAttempts` counter incremented in DB · ✅ After 5 failed attempts: HTTP 423 "Account temporarily locked" |
| **Screenshot** | _(Attach screenshot of failed login error toast and account lockout message after 5 attempts)_ |

---

#### TC-006: Email Verification with Valid Code

| Field | Details |
|---|---|
| **Test ID** | TC-006 |
| **Test Case** | Email Verification with Correct 6-Digit Code |
| **Test Description** | Verify that a newly registered user can verify their email address by submitting the correct 6-digit code sent to their email. After verification, `isEmailVerified` should be set to `true` and the user redirected to login. |
| **Components Involved** | Frontend: `/verify-email` page · Backend: `POST /api/auth/verify-email` · `authController.verifyEmail` · `emailService.sendAccountActivationEmail` · `notificationService` |
| **Test Steps** | 1. Register a new account · 2. Navigate to `/verify-email` · 3. Check inbox for 6-digit code · 4. Enter the code in the input field · 5. Click "Verify Email" |
| **Expected Result** | ✅ Email verified successfully · ✅ Green banner: "Email Verified! Redirecting to login page..." · ✅ Auto-redirect to `/login?verified=true` after 2 seconds · ✅ Login page shows: "Email verified successfully! You can now log in." · ✅ `isEmailVerified = true` in database · ✅ Account activation email sent |
| **Screenshot** | _(Attach screenshot of the green success banner on verify-email page and the verified message on login page)_ |

---

#### TC-007: Password Reset Flow (End-to-End)

| Field | Details |
|---|---|
| **Test ID** | TC-007 |
| **Test Case** | Complete Password Reset Flow |
| **Test Description** | Verify the full password reset flow: requesting a reset code, receiving the email, entering the code with a new password, and successfully logging in with the new password. Reset codes expire after 15 minutes. |
| **Components Involved** | Frontend: `/forgot-password` · `/reset-password` · Backend: `POST /api/auth/forgot-password` · `POST /api/auth/reset-password` · `emailService.sendPasswordResetEmail` |
| **Test Steps** | 1. Navigate to `/forgot-password` · 2. Enter registered email · 3. Click "Send Reset Code" · 4. Check inbox for 6-digit code · 5. Navigate to `/reset-password` · 6. Enter email, code, new password "NewPass@5678", confirm · 7. Click "Reset Password" |
| **Expected Result** | ✅ Reset email sent: "Password reset code sent to your email" · ✅ Reset page shows success: "Password Reset Successful!" · ✅ Auto-redirect to `/login?reset=true` · ✅ Login shows: "Password reset successfully! Please log in with your new password." · ✅ Login with new password succeeds · ✅ Old password no longer works |
| **Screenshot** | _(Attach screenshots: forgot-password success screen, reset-password success screen, and login with reset=true banner)_ |

---

#### TC-008: Accessing Protected Route Without Token

| Field | Details |
|---|---|
| **Test ID** | TC-008 |
| **Test Case** | Unauthorized Access to Protected Dashboard Route |
| **Test Description** | Verify that unauthenticated users cannot access protected dashboard routes. The system should redirect to the login page. API calls without a valid JWT should return HTTP 401. |
| **Components Involved** | Frontend: Dashboard layout auth guard · Backend: `protect` middleware (`auth.js`) · `GET /api/users/dashboard` |
| **Test Steps** | 1. Clear localStorage (remove token) · 2. Directly navigate to http://localhost:3000/dashboard · 3. Also test API: send `GET /api/users/dashboard` without Authorization header |
| **Expected Result** | ✅ Frontend: Redirected to `/login` · ✅ API: HTTP 401 `{ success: false, error: "Not authorized to access this route" }` · ✅ No dashboard data exposed · ✅ No sensitive user information leaked |
| **Screenshot** | _(Attach screenshot of redirect to login page when accessing /dashboard without authentication)_ |

---

#### TC-009: Admin-Only Route Access by Regular User

| Field | Details |
|---|---|
| **Test ID** | TC-009 |
| **Test Case** | Regular User Attempting to Access Admin-Only Endpoint |
| **Test Description** | Verify that a regular user (role: "user") cannot access admin-only endpoints. The `authorize('admin')` middleware should reject the request with HTTP 403 even with a valid JWT token. |
| **Components Involved** | Backend: `protect` middleware · `authorize('admin')` middleware · `GET /api/admin/users` · `GET /api/admin/dashboard` |
| **Test Steps** | 1. Log in as a regular user and obtain JWT token · 2. Send `GET /api/admin/users` with `Authorization: Bearer {userToken}` · 3. Send `GET /api/admin/dashboard` with same token |
| **Expected Result** | ✅ HTTP 403 `{ success: false, error: "User role not authorized", message: "User role user is not authorized to access this route" }` · ✅ No admin data returned · ✅ Admin pages on frontend redirect or show error |
| **Screenshot** | _(Attach screenshot of 403 Forbidden response in API client and admin page access denied in browser)_ |

---

#### TC-010: Auth Rate Limiting on Login Endpoint

| Field | Details |
|---|---|
| **Test ID** | TC-010 |
| **Test Case** | Rate Limiting on Authentication Endpoint |
| **Test Description** | Verify that the `authLimiter` rate limiter blocks excessive failed login attempts. The limiter allows 5 failed requests per 15 minutes per IP. Successful logins do not count toward the limit (`skipSuccessfulRequests: true`). |
| **Components Involved** | Backend: `rateLimiter.js` (`authLimiter`) · `POST /api/auth/login` |
| **Test Steps** | 1. Send 5 POST requests to `/api/auth/login` with wrong credentials · 2. Send a 6th request with wrong credentials · 3. Also verify that a successful login between failed attempts does not reset the failed count |
| **Expected Result** | ✅ First 5 failed attempts: HTTP 401 "Invalid credentials" · ✅ 6th failed attempt: HTTP 429 with rate limit error message · ✅ Response headers include `Retry-After` · ✅ Successful requests are not counted (skip successful) |
| **Screenshot** | _(Attach screenshot of HTTP 429 response after exceeding rate limit)_ |

---

### CATEGORY B — Mental Wellness Prediction

---

#### TC-011: Successful Mental Wellness Prediction

| Field | Details |
|---|---|
| **Test ID** | TC-011 |
| **Test Case** | Successful Mental Wellness Prediction with Valid Inputs |
| **Test Description** | Verify that a logged-in user can submit valid mental wellness data and receive a prediction score (0–100) with interpretation, model name, and confidence metrics. The prediction should be saved to the database. |
| **Components Involved** | Frontend: `/predictions/mental-wellness` · Backend: `POST /api/predictions/mental-wellness` · `predictionController` · `aiService.predictMentalWellness` · AI: `POST /predict/mental-wellness` · `Prediction` model |
| **Test Steps** | 1. Log in as regular user · 2. Navigate to `/predictions/mental-wellness` · 3. Fill form: Age=25, Gender=Male, Occupation=Student, Work Mode=Remote, Screen Time=6, Work Screen=3, Leisure Screen=2, Sleep=7, Sleep Quality=4, Stress=4, Productivity=75, Exercise=150, Social=10 · 4. Click "Get Prediction" |
| **Expected Result** | ✅ Prediction score displayed (0–100 range) · ✅ Interpretation label shown (Excellent/Good/Fair/Needs Attention) · ✅ Colored progress bar rendered · ✅ Model name and analysis date displayed · ✅ Action buttons visible: View Recommendations, Email Report, Download PDF · ✅ Prediction saved to DB · ✅ In-app notification created · ✅ HTTP 201 response |
| **Screenshot** | _(Attach screenshot of the results card showing score, progress bar, interpretation, and action buttons)_ |

---

#### TC-012: Mental Wellness Prediction — Load Example Data

| Field | Details |
|---|---|
| **Test ID** | TC-012 |
| **Test Case** | Load Example Data Button on Mental Wellness Form |
| **Test Description** | Verify that clicking "Load Example" fetches pre-filled valid data from the AI service and populates all form fields correctly, allowing the user to submit without manual input. |
| **Components Involved** | Frontend: `/predictions/mental-wellness` · Backend: `GET /api/predictions/examples/mental_wellness` · AI: `GET /examples/mental-wellness` |
| **Test Steps** | 1. Navigate to `/predictions/mental-wellness` · 2. Click "Load Example" button · 3. Observe form field population · 4. Click "Get Prediction" |
| **Expected Result** | ✅ Toast: "Example data loaded!" · ✅ All form fields populated with valid example values · ✅ Form submits successfully · ✅ Prediction result displayed · ✅ No validation errors triggered |
| **Screenshot** | _(Attach screenshot of form with all fields auto-filled after clicking Load Example)_ |

---

#### TC-013: Mental Wellness — Cross-field Screen Time Validation

| Field | Details |
|---|---|
| **Test ID** | TC-013 |
| **Test Case** | Screen Time Cross-Field Validation (Work + Leisure Exceeds Total) |
| **Test Description** | Verify that the frontend blocks submission when Work Screen Time or Leisure Screen Time exceeds Total Screen Time. This is a cross-field custom validation not covered by HTML min/max attributes. |
| **Components Involved** | Frontend: `/predictions/mental-wellness` (custom cross-field validation logic) · AI: `POST /predict/mental-wellness` (also validates individually) |
| **Test Steps** | 1. Navigate to `/predictions/mental-wellness` · 2. Set Total Screen Time = 5 hours · 3. Set Work Screen Time = 6 hours (exceeds total) · 4. Click "Get Prediction" |
| **Expected Result** | ✅ Toast error: "Work + Leisure screen time cannot exceed Total screen time" · ✅ Form not submitted · ✅ No API call made · ✅ User remains on form page |
| **Screenshot** | _(Attach screenshot of the error toast when work screen time exceeds total screen time)_ |

---

#### TC-014: Mental Wellness Prediction — Boundary Age Values

| Field | Details |
|---|---|
| **Test ID** | TC-014 |
| **Test Case** | Mental Wellness Prediction with Boundary Age Values |
| **Test Description** | Verify that the minimum (18) and maximum (100) age values are accepted, while values outside this range (17, 101) are rejected by backend validation middleware. |
| **Components Involved** | Backend: `mentalWellnessValidation` middleware · `POST /api/predictions/mental-wellness` · AI: `POST /predict/mental-wellness` (age `ge=18, le=100`) |
| **Test Steps** | 1. Submit prediction with Age=18 (all other fields valid) · 2. Submit prediction with Age=100 · 3. Submit prediction with Age=17 · 4. Submit prediction with Age=101 |
| **Expected Result** | ✅ Age=18: Accepted, prediction returned · ✅ Age=100: Accepted, prediction returned · ✅ Age=17: HTTP 400 validation error · ✅ Age=101: HTTP 400 validation error |
| **Screenshot** | _(Attach screenshot of validation error for age=17 and successful result for age=18)_ |

---

#### TC-015: Mental Wellness — Email Report Feature

| Field | Details |
|---|---|
| **Test ID** | TC-015 |
| **Test Case** | Send Mental Wellness Prediction Report via Email |
| **Test Description** | Verify that after a successful prediction, clicking "Email Report" sends the prediction report as a PDF attachment to the user's registered email address. The button should show a loading state and confirm success. |
| **Components Involved** | Frontend: Email Report button · Backend: `POST /api/predictions/:id/email` · `emailService.sendPredictionReportEmail` · `pdfGenerator` · `emailLimiter` (3 per hour) |
| **Test Steps** | 1. Complete a mental wellness prediction · 2. Click "Email Report" button · 3. Check user's email inbox |
| **Expected Result** | ✅ Button shows spinner "Sending..." while processing · ✅ Toast: "Report sent to your email!" · ✅ Email received with subject "Your Mental Wellness Report - WellSync" · ✅ PDF attachment included · ✅ HTTP 200 response · ✅ Email rate limit: 3 emails per hour enforced |
| **Screenshot** | _(Attach screenshot of success toast and received email in inbox with PDF attachment)_ |

---

#### TC-016: Mental Wellness — Download PDF Report

| Field | Details |
|---|---|
| **Test ID** | TC-016 |
| **Test Case** | Download Mental Wellness Prediction Report as PDF |
| **Test Description** | Verify that clicking "Download PDF" generates and downloads a PDF report of the prediction to the user's device with the correct filename format. |
| **Components Involved** | Frontend: Download PDF button (blob URL) · Backend: `GET /api/predictions/:id/pdf` · `pdfGenerator.generatePredictionReportPDF` |
| **Test Steps** | 1. Complete a mental wellness prediction · 2. Click "Download PDF" button · 3. Check browser downloads |
| **Expected Result** | ✅ PDF file downloaded automatically · ✅ Filename format: `Mental_Wellness_Report_YYYY-MM-DD.pdf` · ✅ PDF contains user name, prediction score, interpretation, and date · ✅ HTTP 200 with `Content-Type: application/pdf` |
| **Screenshot** | _(Attach screenshot of browser download bar showing the downloaded PDF filename)_ |

---

#### TC-017: Mental Wellness — View Recommendations Modal

| Field | Details |
|---|---|
| **Test ID** | TC-017 |
| **Test Case** | View Personalised Recommendations After Mental Wellness Prediction |
| **Test Description** | Verify that clicking "View Recommendations" opens a modal overlay with score-appropriate recommendations. High scores (≥80) should show maintenance tips; low scores (<60) should show improvement suggestions. |
| **Components Involved** | Frontend: `/predictions/mental-wellness` recommendations modal · Score-based recommendation logic |
| **Test Steps** | 1. Complete a prediction with result score ≥ 80 · 2. Click "View Recommendations" · 3. Observe recommendations · 4. Click "X" to close · 5. Repeat with a score < 60 |
| **Expected Result** | ✅ Modal overlay opens with sticky header showing score · ✅ Score ≥ 80: Shows maintenance/positive recommendations · ✅ Score < 60: Shows improvement recommendations · ✅ Modal closes on "X" or "Close" button · ✅ Background scrolling disabled while modal open |
| **Screenshot** | _(Attach screenshot of the recommendations modal with numbered list of suggestions)_ |

---

#### TC-018: Mental Wellness — Prediction History

| Field | Details |
|---|---|
| **Test ID** | TC-018 |
| **Test Case** | View Prediction History After Multiple Submissions |
| **Test Description** | Verify that after submitting multiple mental wellness predictions, the user can navigate to prediction history and see all past records with scores, interpretation, and timestamps, with correct pagination. |
| **Components Involved** | Frontend: `/predictions` history page · Backend: `GET /api/predictions?type=mental_wellness` · `Prediction` model (indexed on user + createdAt) |
| **Test Steps** | 1. Submit at least 3 mental wellness predictions · 2. Click "View History" button · 3. Observe prediction list · 4. Navigate to `/predictions` directly |
| **Expected Result** | ✅ All predictions listed in descending date order · ✅ Each row shows: type icon, score, interpretation, date · ✅ Pagination controls visible if > 20 records · ✅ Filter by type working · ✅ HTTP 200 with `{ predictions: [...], total, page, pages }` |
| **Screenshot** | _(Attach screenshot of the predictions history list page showing multiple entries)_ |

---

### CATEGORY C — Stress Level Prediction

---

#### TC-019: Successful Stress Level Prediction

| Field | Details |
|---|---|
| **Test ID** | TC-019 |
| **Test Case** | Successful Stress Level Prediction with Valid Inputs |
| **Test Description** | Verify that a logged-in user can submit valid stress level data and receive a predicted stress score (0–10) with a category label (Low/Moderate/High/Very High), personalized recommendations, and a high-stress alert when score ≥ 6. |
| **Components Involved** | Frontend: `/predictions/stress` · Backend: `POST /api/predictions/stress-level` · `aiService.predictStressLevel` · AI: `POST /predict/stress` · `Prediction` model |
| **Test Steps** | 1. Navigate to `/predictions/stress` · 2. Fill form: Age=28, Gender=Female, Occupation=Software Engineer, Work Mode=Hybrid, Screen Time=9, Work Screen=6, Leisure Screen=2, Sleep=6, Sleep Quality=2, Productivity=50, Exercise=60, Social=3, Mental Wellness Index=55 · 3. Click "Get Prediction" |
| **Expected Result** | ✅ Stress score displayed (0–10 range) · ✅ Category label: Low/Moderate/High/Very High · ✅ Progress bar rendered (width = score/10 × 100%) · ✅ If score ≥ 6: Red alert box "High Stress Detected — Consider seeking professional support" · ✅ Personalized recommendations list shown · ✅ HTTP 201 · ✅ Prediction saved to DB |
| **Screenshot** | _(Attach screenshot of stress prediction results with high stress alert box and recommendations)_ |

---

#### TC-020: Stress Prediction — High Stress Alert Trigger

| Field | Details |
|---|---|
| **Test ID** | TC-020 |
| **Test Case** | High Stress Alert Displayed When Score ≥ 6 |
| **Test Description** | Verify that the red alert banner "High Stress Detected" appears only when the predicted stress score is 6 or above, and does not appear for scores below 6. This is a critical UI safety feature. |
| **Components Involved** | Frontend: `/predictions/stress` result rendering logic · Score threshold: ≥ 6 = High Stress alert |
| **Test Steps** | 1. Submit stress prediction with inputs likely to yield score ≥ 6 (high screen time, low sleep, low exercise) · 2. Submit stress prediction with inputs likely to yield score < 6 (good sleep, low stress index, high exercise) · 3. Observe alert box presence |
| **Expected Result** | ✅ Score ≥ 6: Red left-bordered alert box with `AlertCircle` icon visible · ✅ Score < 6: Alert box NOT rendered · ✅ Alert text: "High Stress Detected — Consider seeking professional support…" · ✅ Category label matches score bracket correctly |
| **Screenshot** | _(Attach screenshot showing high stress alert box for high score and its absence for low score)_ |

---

#### TC-021: Stress Prediction — Missing Required Field

| Field | Details |
|---|---|
| **Test ID** | TC-021 |
| **Test Case** | Stress Prediction Rejected When Required Field Is Missing |
| **Test Description** | Verify that omitting the `mental_wellness_index_0_100` field (unique to stress prediction) causes a validation error. This field is required and is not present in the mental wellness form. |
| **Components Involved** | Backend: `stressLevelValidation` middleware · `POST /api/predictions/stress-level` · AI: `POST /predict/stress` (Pydantic validation) |
| **Test Steps** | 1. Send `POST /api/predictions/stress-level` with all valid fields except `mental_wellness_index_0_100` omitted · 2. Observe response |
| **Expected Result** | ✅ HTTP 400 response · ✅ Validation error: field `mental_wellness_index_0_100` is required · ✅ No prediction made · ✅ No record saved to DB |
| **Screenshot** | _(Attach screenshot of API response showing the validation error for missing mental_wellness_index field)_ |

---

#### TC-022: Stress Prediction — Boundary Stress Values

| Field | Details |
|---|---|
| **Test ID** | TC-022 |
| **Test Case** | Stress Prediction Score Category Boundary Verification |
| **Test Description** | Verify that stress score categories are correctly assigned at boundary values: ≤3 = Low, ≤6 = Moderate, ≤8 = High, >8 = Very High. This validates that the AI model interpretation logic and frontend rendering both agree. |
| **Components Involved** | AI: `/predict/stress` score interpretation · Frontend: `/predictions/stress` category label rendering |
| **Test Steps** | 1. Submit inputs designed to produce scores near 3, 6, and 8 · 2. Observe category labels displayed · 3. Cross-reference with score shown |
| **Expected Result** | ✅ Score ≤ 3.0: Label "Low Stress" shown in green · ✅ Score 3.1–6.0: Label "Moderate Stress" in blue/amber · ✅ Score 6.1–8.0: Label "High Stress" in amber/orange · ✅ Score > 8.0: Label "Very High Stress" in red · ✅ High stress alert (≥6) shown/hidden correctly |
| **Screenshot** | _(Attach screenshot showing each category label with appropriate color coding)_ |

---

#### TC-023: Stress Prediction — Rate Limiting

| Field | Details |
|---|---|
| **Test ID** | TC-023 |
| **Test Case** | Prediction Rate Limiter Blocks Excessive Requests |
| **Test Description** | Verify that the `predictionLimiter` allows a maximum of 10 prediction requests per minute. The 11th request within 60 seconds should be blocked with HTTP 429. |
| **Components Involved** | Backend: `rateLimiter.js` (`predictionLimiter`) · `POST /api/predictions/stress-level` |
| **Test Steps** | 1. Send 10 valid `POST /api/predictions/stress-level` requests within 60 seconds · 2. Send an 11th request immediately |
| **Expected Result** | ✅ First 10 requests: HTTP 201 with prediction results · ✅ 11th request: HTTP 429 rate limit error · ✅ Response includes rate limit error message · ✅ Limit resets after 60 seconds |
| **Screenshot** | _(Attach screenshot of HTTP 429 response body for the 11th prediction request)_ |

---

#### TC-024: Stress Prediction — Recommendations Based on Input Factors

| Field | Details |
|---|---|
| **Test ID** | TC-024 |
| **Test Case** | Stress Prediction Recommendations Match Input Risk Factors |
| **Test Description** | Verify that the AI service returns contextually relevant recommendations based on input values. Low sleep hours should trigger a sleep recommendation; low exercise should trigger an exercise recommendation. |
| **Components Involved** | AI: `POST /predict/stress` (recommendation logic) · Frontend: `/predictions/stress` recommendations display |
| **Test Steps** | 1. Submit with `sleep_hours=5` (below 7) and `exercise_minutes_per_week=100` (below 150) · 2. Observe recommendations list |
| **Expected Result** | ✅ Recommendation "Aim for 7-9 hours of sleep per night" appears (sleep_hours < 7) · ✅ Recommendation "Increase physical activity" appears (exercise < 150 min/week) · ✅ Recommendations displayed as a list in green box on frontend · ✅ Recommendation count varies based on risk factors |
| **Screenshot** | _(Attach screenshot of recommendations list showing sleep and exercise suggestions)_ |

---

### CATEGORY D — Academic Impact Prediction

---

#### TC-025: Successful Academic Impact Prediction

| Field | Details |
|---|---|
| **Test ID** | TC-025 |
| **Test Case** | Successful Academic Impact Prediction with Valid Student Data |
| **Test Description** | Verify that a logged-in user can submit valid academic impact data and receive an addiction score (2–9) with risk category label (Low/Moderate/High Risk) and interpretation text. |
| **Components Involved** | Frontend: `/predictions/academic` · Backend: `POST /api/predictions/academic-impact` · `aiService.predictAcademicImpact` · AI: `POST /predict/academic-impact` · `Prediction` model |
| **Test Steps** | 1. Navigate to `/predictions/academic` · 2. Fill form: Age=20, Gender=Male, Academic Level=Bachelor, Country=Sri Lanka, Platform=Instagram, Daily Usage=4, Sleep=7, Mental Health=7, Conflicts=2, Affects Performance=Yes, Relationship=Single · 3. Click "Get Prediction" |
| **Expected Result** | ✅ Addiction score displayed (2–9 range) · ✅ Risk category: Low/Moderate/High Risk · ✅ Orange interpretation box shown · ✅ Progress bar rendered: width = ((score-2)/7) × 100% · ✅ HTTP 201 · ✅ Prediction saved to DB · ✅ Milestone notification if 10th/25th/50th/100th prediction |
| **Screenshot** | _(Attach screenshot of academic impact results card with addiction score, risk label, and progress bar)_ |

---

#### TC-026: Academic Impact — Age Range Validation (17–30)

| Field | Details |
|---|---|
| **Test ID** | TC-026 |
| **Test Case** | Academic Impact Prediction Age Validation (17–30 Range) |
| **Test Description** | Verify that the academic impact prediction enforces a stricter age range (17–30) compared to other predictions (18–100). Age=16 and Age=31 should be rejected while Age=17 and Age=30 should be accepted. |
| **Components Involved** | Backend: `academicImpactValidation` middleware · `POST /api/predictions/academic-impact` · AI: `POST /predict/academic-impact` (age `ge=17, le=30`) |
| **Test Steps** | 1. Submit with Age=17 (min boundary) · 2. Submit with Age=30 (max boundary) · 3. Submit with Age=16 · 4. Submit with Age=31 |
| **Expected Result** | ✅ Age=17: Accepted, prediction returned · ✅ Age=30: Accepted, prediction returned · ✅ Age=16: HTTP 400 validation error · ✅ Age=31: HTTP 400 validation error · ✅ Error message clearly states the valid age range |
| **Screenshot** | _(Attach screenshot of validation error for age=31 and success response for age=30)_ |

---

#### TC-027: Academic Impact — High Risk Score Alert

| Field | Details |
|---|---|
| **Test ID** | TC-027 |
| **Test Case** | Academic Impact High Risk Score Display |
| **Test Description** | Verify that a high addiction score (≥7) triggers the "High Risk" label with appropriate red/orange color coding and the most intensive set of recommendations in the modal (8 items with strict controls). |
| **Components Involved** | Frontend: `/predictions/academic` result rendering · Recommendations modal (score ≥ 7 branch) |
| **Test Steps** | 1. Submit academic prediction with high-risk inputs: high daily usage (6h), many conflicts (5), affects performance = Yes, poor mental health score (3) · 2. Observe risk label and color · 3. Click "View Recommendations" |
| **Expected Result** | ✅ Score ≥ 7: Label "High Risk" in red/orange · ✅ Progress bar filled proportionally · ✅ Recommendations modal shows 8 items with strict usage control suggestions · ✅ Score < 5: Shows "Low Risk" in green with 4 maintenance items |
| **Screenshot** | _(Attach screenshot of high risk label and recommendations modal with 8 items for high addiction score)_ |

---

#### TC-028: Academic Impact — Social Media Platform Selection

| Field | Details |
|---|---|
| **Test ID** | TC-028 |
| **Test Case** | Academic Impact Prediction with Different Social Media Platforms |
| **Test Description** | Verify that selecting different social media platforms (Instagram, TikTok, YouTube, Facebook, Twitter, Snapchat, Other) produces different prediction scores, as the AI model encodes "popular platforms" as a risk factor. |
| **Components Involved** | Frontend: `/predictions/academic` platform dropdown · AI: `POST /predict/academic-impact` (`uses_popular_platform` feature engineering) |
| **Test Steps** | 1. Submit identical form twice: once with Platform=Instagram, once with Platform=YouTube · 2. Note the prediction scores · 3. Try Platform=Other |
| **Expected Result** | ✅ All platform values accepted without validation error · ✅ Popular platforms (Instagram, TikTok, Snapchat, Facebook, Twitter) produce higher risk scores · ✅ "Other" platform treated as non-popular (lower risk factor) · ✅ Each submission returns HTTP 201 |
| **Screenshot** | _(Attach screenshot showing two different prediction scores for Instagram vs YouTube with same other inputs)_ |

---

#### TC-029: Academic Impact — Affects Academic Performance Field

| Field | Details |
|---|---|
| **Test ID** | TC-029 |
| **Test Case** | Academic Impact — 'Affects Academic Performance' Yes/No Field |
| **Test Description** | Verify that the `affects_academic_performance` field accepts only "Yes" or "No" values at the backend validation level. The AI service processes this case-insensitively, so both "Yes" and "yes" should work at the AI level. |
| **Components Involved** | Backend: `academicImpactValidation` (enum: Yes/No) · AI: `POST /predict/academic-impact` (case-insensitive `.str.lower()` preprocessing) |
| **Test Steps** | 1. Submit with `affects_academic_performance = "Yes"` · 2. Submit with `affects_academic_performance = "No"` · 3. Try submitting with `affects_academic_performance = "Maybe"` |
| **Expected Result** | ✅ "Yes": Accepted, higher addiction risk predicted · ✅ "No": Accepted, lower risk score · ✅ "Maybe": HTTP 400 validation error from backend validator · ✅ Case sensitivity handled at AI preprocessing level |
| **Screenshot** | _(Attach screenshot of validation error for invalid value and successful result for Yes/No)_ |

---

#### TC-030: Academic Impact — Prediction Trend Tracking

| Field | Details |
|---|---|
| **Test ID** | TC-030 |
| **Test Case** | Academic Impact Prediction Trend Over Time |
| **Test Description** | Verify that the trend endpoint returns a time-series of academic impact scores for the past 30 days, and that the dashboard correctly reflects changes in average academic impact score across multiple submissions. |
| **Components Involved** | Backend: `GET /api/predictions/trends/academic_impact` · `Prediction.getPredictionTrends()` · Frontend: `/dashboard` latest prediction card |
| **Test Steps** | 1. Submit 3+ academic impact predictions on different days · 2. Call `GET /api/predictions/trends/academic_impact?days=30` · 3. Navigate to dashboard and observe Academic Impact card |
| **Expected Result** | ✅ Trend endpoint returns array of `{ score, date }` objects · ✅ Data sorted chronologically · ✅ Dashboard shows latest academic impact score · ✅ Period reported as "30 days" · ✅ HTTP 200 with `{ type, period, trends: [...] }` |
| **Screenshot** | _(Attach screenshot of dashboard academic impact card and trends API response)_ |

---

### CATEGORY E — User Profile & Settings

---

#### TC-031: Update Personal Information in Profile

| Field | Details |
|---|---|
| **Test ID** | TC-031 |
| **Test Case** | Successfully Update User Personal Information |
| **Test Description** | Verify that a logged-in user can update their first name, last name, age, gender, and phone number from the Settings page. Changes should persist after page refresh. |
| **Components Involved** | Frontend: `/settings` Personal Info tab · Backend: `PUT /api/users/profile` · `userController.updateProfile` · `updateProfileValidation` middleware · `User` model |
| **Test Steps** | 1. Navigate to `/settings` · 2. Go to "Personal Info" tab · 3. Change First Name to "Jane", Last Name to "Smith", Age to 25, Gender to "Female" · 4. Click Save · 5. Refresh the page |
| **Expected Result** | ✅ Green alert: "Personal information updated successfully!" (auto-hides after 4s) · ✅ HTTP 200 `{ success: true, data: { user } }` · ✅ Changes persist after refresh · ✅ Dashboard welcome message updates to "Welcome back, Jane!" |
| **Screenshot** | _(Attach screenshot of the success alert after saving personal information)_ |

---

#### TC-032: Change Password Successfully

| Field | Details |
|---|---|
| **Test ID** | TC-032 |
| **Test Case** | Successfully Change Account Password |
| **Test Description** | Verify that a user can change their password from the Settings page by providing the correct current password and a new password meeting complexity requirements. The old password should no longer work after the change. |
| **Components Involved** | Frontend: `/settings` Password tab · Backend: `PUT /api/auth/change-password` · `changePasswordValidation` · `User.comparePassword()` · bcrypt re-hashing |
| **Test Steps** | 1. Navigate to `/settings` > Password tab · 2. Enter Current Password: "Test@1234" · 3. Enter New Password: "NewPass@5678" · 4. Enter Confirm Password: "NewPass@5678" · 5. Click Save · 6. Attempt login with old password |
| **Expected Result** | ✅ Success alert shown · ✅ HTTP 200 `{ success: true, message: "Password changed successfully" }` · ✅ In-app notification created for password change · ✅ Login with old password fails (HTTP 401) · ✅ Login with new password succeeds |
| **Screenshot** | _(Attach screenshot of success message after password change and failed login with old password)_ |

---

#### TC-033: Theme Preference — Dark/Light/System Mode

| Field | Details |
|---|---|
| **Test ID** | TC-033 |
| **Test Case** | Save and Apply Theme Preference |
| **Test Description** | Verify that selecting a theme (Light/Dark/System) in Settings and saving it applies the theme immediately via next-themes and persists the preference to the database. |
| **Components Involved** | Frontend: `/settings` Preferences tab · `useTheme` from `next-themes` · Backend: `PUT /api/users/profile` with `preferences.theme` · MongoDB dot notation update |
| **Test Steps** | 1. Navigate to `/settings` > Preferences tab · 2. Click "Dark" theme card · 3. Click "Save Theme" · 4. Observe page theme change · 5. Refresh and re-visit settings |
| **Expected Result** | ✅ Selected theme card highlighted with `border-primary` · ✅ Dark mode applied to entire UI immediately · ✅ Success alert shown (auto-hides after 3s) · ✅ Preference saved to DB (`preferences.theme = "dark"`) · ✅ Theme persists after page refresh |
| **Screenshot** | _(Attach screenshot showing dark mode applied to the settings page after selecting Dark theme)_ |

---

#### TC-034: Log Daily Screen Time

| Field | Details |
|---|---|
| **Test ID** | TC-034 |
| **Test Case** | Successfully Log Daily Screen Time |
| **Test Description** | Verify that a user can log their daily screen time (total hours, work hours, leisure hours, mood, health flags) and view the entry in the weekly history table. Only one log per day is allowed. |
| **Components Involved** | Frontend: `/profile` Screen Time tab · Backend: `POST /api/profile/screen-time` · `ScreenTimeLog` model (unique user+date constraint) |
| **Test Steps** | 1. Navigate to `/profile` > Screen Time tab · 2. Enter Total Screen Time=7, Work Screen=4, Leisure Screen=2 · 3. Select Mood=Good · 4. Click "Log Screen Time" · 5. Attempt to log again for the same day |
| **Expected Result** | ✅ Screen time logged successfully · ✅ Entry appears in weekly history table · ✅ Colors: >8h=red, >5h=amber · ✅ Second log for same day: Error (duplicate user+date) · ✅ Weekly average updates |
| **Screenshot** | _(Attach screenshot of the weekly history table showing the new screen time entry)_ |

---

#### TC-035: Wellness Profile Setup

| Field | Details |
|---|---|
| **Test ID** | TC-035 |
| **Test Case** | Create and Save Mental Wellness Profile |
| **Test Description** | Verify that a user can set up their Mental Wellness Profile with occupation, work mode, stress level, productivity, exercise, and social hours. After saving, the profile completion status and readiness score should update on the Overview tab. |
| **Components Involved** | Frontend: `/profile` Wellness Profile tab · Backend: `PUT /api/profile/wellness` · `MentalWellnessProfile` model · `calculateReadinessScore()` |
| **Test Steps** | 1. Navigate to `/profile` > Wellness Profile tab · 2. Select Occupation=Student, Work Mode=Remote · 3. Set Stress Level=4, Productivity=75 · 4. Set Exercise=150, Social Hours=8 · 5. Click Save · 6. Switch to Overview tab |
| **Expected Result** | ✅ Green "Wellness profile saved successfully!" message · ✅ Overview tab shows wellness profile as "Complete" · ✅ Readiness Score and Stress Category displayed · ✅ `profileCompleted = true` in DB · ✅ Readiness score calculated correctly |
| **Screenshot** | _(Attach screenshot of the overview tab showing wellness profile complete with readiness score)_ |

---

#### TC-036: Account Deletion with Password Confirmation

| Field | Details |
|---|---|
| **Test ID** | TC-036 |
| **Test Case** | Delete User Account with Correct Password |
| **Test Description** | Verify that a user can delete their account from the Settings Danger Zone tab. The system should require password confirmation and then permanently delete the user document and all associated predictions. |
| **Components Involved** | Frontend: `/settings` Danger Zone tab · Backend: `DELETE /api/users/account` · `userController` · `Prediction.deleteMany({ user })` |
| **Test Steps** | 1. Navigate to `/settings` > Danger Zone tab · 2. Click "Delete Account" · 3. Enter correct password in confirmation dialog · 4. Confirm deletion · 5. Attempt to log in with deleted credentials |
| **Expected Result** | ✅ Confirmation dialog shown before deletion · ✅ Account deleted with HTTP 200 · ✅ All predictions for that user deleted from DB · ✅ JWT token invalidated (user no longer exists) · ✅ Login attempt after deletion: HTTP 401 "Invalid credentials" · ✅ Redirected to home/login page |
| **Screenshot** | _(Attach screenshot of confirmation dialog and subsequent redirect after account deletion)_ |

---

### CATEGORY F — Admin Panel

---

#### TC-037: Admin Dashboard Overview Data

| Field | Details |
|---|---|
| **Test ID** | TC-037 |
| **Test Case** | Admin Dashboard Displays Accurate System-Wide Statistics |
| **Test Description** | Verify that the admin dashboard correctly aggregates and displays system-wide statistics including total users, active users, new users this week, total predictions, prediction type breakdown, and chart data. |
| **Components Involved** | Frontend: `/admin` dashboard · Backend: `GET /api/admin/dashboard` · `adminController.getDashboard` · MongoDB aggregation pipelines |
| **Test Steps** | 1. Log in as admin (role=admin) · 2. Navigate to `/admin` · 3. Observe stats cards and charts |
| **Expected Result** | ✅ 4 stats cards: Total Users, Total Predictions, Avg Mental Wellness, Predictions by Type · ✅ User Growth chart (30-day line chart) · ✅ Wellness Trend chart · ✅ Stress Distribution chart · ✅ Activity Heatmap · ✅ All data accurate to DB state · ✅ HTTP 200 `{ success: true, data: { users, predictions, charts } }` |
| **Screenshot** | _(Attach screenshot of the admin dashboard showing all stats cards and charts populated with data)_ |

---

#### TC-038: Admin User Management — Search and Filter

| Field | Details |
|---|---|
| **Test ID** | TC-038 |
| **Test Case** | Admin User List — Search by Name/Email and Filter by Role |
| **Test Description** | Verify that the admin user management table supports searching users by name or email (regex match) and filtering by role (user/admin) and status (active/inactive) with correct result sets. |
| **Components Involved** | Frontend: `/admin` user table with search/filter · Backend: `GET /api/admin/users?search=&role=&verified=&active=` · `adminController.getUsers` |
| **Test Steps** | 1. Navigate to `/admin` · 2. Type "john" in search box · 3. Select Role filter "Admin" · 4. Observe filtered results · 5. Clear filters |
| **Expected Result** | ✅ Search matches users by firstName, lastName, or email (case-insensitive regex) · ✅ Role filter returns only users/admins · ✅ Results update in real-time · ✅ "No users found" empty state shown when no matches · ✅ Pagination resets to page 1 on filter change |
| **Screenshot** | _(Attach screenshot of filtered user table showing search results for "john")_ |

---

#### TC-039: Admin — Promote/Demote User Role

| Field | Details |
|---|---|
| **Test ID** | TC-039 |
| **Test Case** | Admin Promotes Regular User to Admin Role |
| **Test Description** | Verify that an admin can promote a regular user to admin role and demote an admin to regular user. The system admin account (`admin@wellsync.lk`) must be protected from role changes. |
| **Components Involved** | Frontend: `/admin` user table "Promote/Demote" button · Backend: `PUT /api/admin/users/:id/role` · `adminController.updateUserRole` · `User.isSystemAdminAccount()` |
| **Test Steps** | 1. Navigate to `/admin` · 2. Find a regular user · 3. Click "Promote to Admin" · 4. Verify role change · 5. Try to change role of system admin account |
| **Expected Result** | ✅ Regular user promoted: role badge changes to "Admin" · ✅ HTTP 200 `{ success: true, data: { user } }` · ✅ Demote works: Admin → User · ✅ System admin account: HTTP 403 "Cannot modify system administrator" · ✅ Button disabled on system admin rows |
| **Screenshot** | _(Attach screenshot of role badge changing from "User" to "Admin" after promotion)_ |

---

#### TC-040: Admin — Activate/Deactivate User Account

| Field | Details |
|---|---|
| **Test ID** | TC-040 |
| **Test Case** | Admin Deactivates a User Account |
| **Test Description** | Verify that an admin can deactivate a user account. A deactivated user should receive HTTP 401 on their next API request even with a valid JWT token. Reactivation should restore access. |
| **Components Involved** | Frontend: `/admin` user table status toggle · Backend: `PUT /api/admin/users/:id/status` · `protect` middleware (`isActive` check) · `User` model |
| **Test Steps** | 1. Log in as admin · 2. Find an active user in the table · 3. Click "Deactivate" · 4. As that user, make any authenticated API request · 5. Reactivate and retry |
| **Expected Result** | ✅ Status badge changes to "Inactive" · ✅ HTTP 200 "User deactivated successfully" · ✅ Deactivated user's API calls return HTTP 401 "Account deactivated" · ✅ Reactivation restores access immediately · ✅ System admin cannot be deactivated (HTTP 403) |
| **Screenshot** | _(Attach screenshot of inactive status badge and the 401 response when deactivated user tries to access API)_ |

---

#### TC-041: Admin — Delete User and Associated Data

| Field | Details |
|---|---|
| **Test ID** | TC-041 |
| **Test Case** | Admin Deletes User Account and All Associated Data |
| **Test Description** | Verify that when an admin deletes a user, all associated data (predictions, notifications) is also permanently deleted from the database. The admin cannot delete their own account or the system admin account. |
| **Components Involved** | Frontend: `/admin` delete button + `ConfirmationDialog` · Backend: `DELETE /api/admin/users/:id` · `adminController.deleteUser` · `Prediction.deleteMany` · `Notification.deleteMany` |
| **Test Steps** | 1. Navigate to `/admin` · 2. Click trash icon on a user row · 3. Confirm in the dialog · 4. Check DB for user, predictions, and notifications · 5. Attempt self-deletion |
| **Expected Result** | ✅ Confirmation dialog: "Are you sure you want to delete {firstName lastName}?" · ✅ User deleted: HTTP 200 · ✅ All user predictions deleted from DB · ✅ All user notifications deleted from DB · ✅ Self-deletion attempt: HTTP 400 "Cannot delete your own account" · ✅ System admin deletion: HTTP 403 |
| **Screenshot** | _(Attach screenshot of the confirmation dialog and empty user table after deletion)_ |

---

#### TC-042: Admin — Broadcast Notification to All Users

| Field | Details |
|---|---|
| **Test ID** | TC-042 |
| **Test Case** | Admin Sends Broadcast Notification with Email to All Active Users |
| **Test Description** | Verify that an admin can send a broadcast notification with title, message, and priority to all active verified users. With `sendEmail=true`, emails are sent in batches of 10 and both in-app notifications and emails are delivered. |
| **Components Involved** | Frontend: `/admin/broadcast` · Backend: `POST /api/admin/broadcast` · `adminController.sendBroadcast` · `Notification.insertMany` · `emailService.sendBroadcastEmail` |
| **Test Steps** | 1. Navigate to `/admin/broadcast` · 2. Enter Title: "System Maintenance", Message: "Scheduled downtime on Sunday 2am–4am.", Priority: High · 3. Enable "Send Email" toggle · 4. Click "Send Notification + Email to All Users" |
| **Expected Result** | ✅ Button shows spinner while sending · ✅ Toast: "Broadcast sent! X users notified." · ✅ Result box shows: recipients count, emails sent, emails failed · ✅ All active verified users receive in-app notification · ✅ Broadcast email received in user inboxes · ✅ HTTP 200 with delivery stats |
| **Screenshot** | _(Attach screenshot of the broadcast result card showing recipient count and email delivery stats)_ |

---

#### TC-043: Admin — View User Prediction Details

| Field | Details |
|---|---|
| **Test ID** | TC-043 |
| **Test Case** | Admin Views Individual User Details and Prediction History |
| **Test Description** | Verify that an admin can navigate to a specific user's detail page showing their personal info, account status, and the last 5 predictions with scores and dates. User's correct full name (firstName + lastName) should display, not "N/A". |
| **Components Involved** | Frontend: `/admin/users/[id]` · Backend: `GET /api/admin/users/:id` · `adminController.getUserById` · `Prediction` model (last 5) |
| **Test Steps** | 1. Navigate to `/admin` · 2. Click "View Details" on any user row · 3. Observe user information card · 4. Observe recent predictions list |
| **Expected Result** | ✅ Full name shown: "John Doe" (not "N/A") · ✅ Email, joined date, last login displayed · ✅ Role and status badges shown correctly · ✅ Total predictions count shown · ✅ Last 5 predictions listed with type, date, score · ✅ Promote/Deactivate/Delete buttons functional · ✅ System admin buttons disabled for protected accounts |
| **Screenshot** | _(Attach screenshot of user details page showing full name, status badges, and recent predictions list)_ |

---

### CATEGORY G — Notifications & Analytics

---

#### TC-044: In-App Notification Bell and Unread Count

| Field | Details |
|---|---|
| **Test ID** | TC-044 |
| **Test Case** | Notification Bell Shows Correct Unread Count |
| **Test Description** | Verify that after receiving a prediction completion notification, the notification bell in the navbar displays the correct unread count badge. Marking notifications as read should update the badge. |
| **Components Involved** | Frontend: Navbar notification bell · Backend: `GET /api/notifications/unread-count` · `PUT /api/notifications/mark-all-read` · `Notification` model |
| **Test Steps** | 1. Submit a new prediction (triggers notification) · 2. Observe notification bell badge count · 3. Open notifications panel · 4. Click "Mark All Read" · 5. Observe badge count |
| **Expected Result** | ✅ Badge shows unread count after prediction · ✅ Notifications listed with type icon, title, message · ✅ "Mark All Read" clears badge to 0 · ✅ Read notifications no longer bold/highlighted · ✅ HTTP 200 `{ unreadCount: 0 }` after marking read |
| **Screenshot** | _(Attach screenshot of notification bell with badge count and the notifications panel open)_ |

---

#### TC-045: Analytics Dashboard — Weekly vs Monthly View

| Field | Details |
|---|---|
| **Test ID** | TC-045 |
| **Test Case** | Analytics Page Switches Between Weekly and Monthly Period |
| **Test Description** | Verify that the analytics dashboard correctly generates and displays metrics for both Weekly and Monthly periods. Switching periods triggers a new analytics generation request and updates all stat cards and insights. |
| **Components Involved** | Frontend: `/analytics` period toggle · Backend: `POST /api/analytics/generate` with `period` · `GET /api/analytics/weekly` · `GET /api/analytics/monthly` · `Analytics` model |
| **Test Steps** | 1. Navigate to `/analytics` · 2. Click "Weekly" button · 3. Observe stats cards · 4. Click "Monthly" button · 5. Observe stats update · 6. Click "Refresh" button |
| **Expected Result** | ✅ Weekly: shows last 7 days of prediction data · ✅ Monthly: shows last 30 days of prediction data · ✅ Per-type cards show: avg score, count, min, max, trend indicator · ✅ AI Insights panel populated · ✅ Refresh button triggers new generation · ✅ Loading skeleton shown during fetch |
| **Screenshot** | _(Attach screenshot of analytics page showing Weekly vs Monthly stat cards with different values)_ |

---

#### TC-046: AI-Generated Wellness Insights

| Field | Details |
|---|---|
| **Test ID** | TC-046 |
| **Test Case** | AI Insights Generated Based on Prediction History |
| **Test Description** | Verify that the Analytics page generates meaningful AI insights based on the user's prediction history. Critical insights (low wellness, high stress) should appear in red; positive insights in green. |
| **Components Involved** | Frontend: `/analytics` insights panel · Backend: `GET /api/analytics/insights` · `analyticsController.generateInsights` |
| **Test Steps** | 1. Submit multiple predictions of each type · 2. Navigate to `/analytics` · 3. Observe the AI Insights panel |
| **Expected Result** | ✅ Insight cards shown with colored left border (red=critical, yellow=warning, blue=info, green=positive) · ✅ Each insight has: title, message, recommendation · ✅ Critical insight for low wellness (avg < 50) · ✅ Total insight count displayed · ✅ Empty state CTA shown if no predictions exist |
| **Screenshot** | _(Attach screenshot of the AI Insights panel with multiple insight cards showing different severity colors)_ |

---

#### TC-047: Milestone Notification After 10 Predictions

| Field | Details |
|---|---|
| **Test ID** | TC-047 |
| **Test Case** | Milestone Notification Triggered After 10th Prediction |
| **Test Description** | Verify that when a user's total prediction count reaches a milestone (10, 25, 50, 100, 250), a "Milestone Reached" in-app notification is automatically created and appears in the notification panel. |
| **Components Involved** | Backend: `predictionController` (milestone check after save) · `notificationService.notifyMilestoneReached` · `Notification` model (`milestone_reached` type) · Frontend: notification bell |
| **Test Steps** | 1. Ensure user has 9 total predictions in DB · 2. Submit one more prediction (any type) · 3. Check notification bell |
| **Expected Result** | ✅ New notification appears: type `milestone_reached` · ✅ Title contains "10 Predictions" milestone message · ✅ Unread count increments · ✅ No duplicate milestone notification for same count · ✅ Milestone check runs at counts: 10, 25, 50, 100, 250 |
| **Screenshot** | _(Attach screenshot of the milestone notification in the notification panel after the 10th prediction)_ |

---

### CATEGORY H — AI Service & Edge Cases

---

#### TC-048: AI Service Health Check Endpoint

| Field | Details |
|---|---|
| **Test ID** | TC-048 |
| **Test Case** | AI Service Health Check Returns Model Status |
| **Test Description** | Verify that the AI service health endpoint returns a healthy status with the loaded state of all three ML models (mental wellness, academic impact, stress). If the stress model file is missing, it should still start but report the stress model as unavailable. |
| **Components Involved** | AI: `GET /health` · `model_loader.py` · FastAPI startup event · `stress_model.pkl`, `best_model.pkl` |
| **Test Steps** | 1. Ensure AI service is running (`uvicorn api.main:app --port 8000`) · 2. Send `GET http://localhost:8000/health` · 3. Verify model statuses in response |
| **Expected Result** | ✅ HTTP 200 `{ "status": "healthy", "models": { "mental_wellness": true, "academic_impact": true, "stress": true/false } }` · ✅ All three model statuses reported · ✅ If stress model file missing: `"stress": false` but service still running · ✅ Root endpoint `GET /` lists docs URLs |
| **Screenshot** | _(Attach screenshot of the /health API response showing all model statuses as true)_ |

---

#### TC-049: AI Service — Invalid Input Values Rejected (422)

| Field | Details |
|---|---|
| **Test ID** | TC-049 |
| **Test Case** | AI Service Rejects Out-of-Range Input Values with HTTP 422 |
| **Test Description** | Verify that the FastAPI AI service independently validates input fields using Pydantic constraints and returns HTTP 422 with descriptive error details for out-of-range values, even if the backend validator is bypassed. |
| **Components Involved** | AI: `POST /predict/mental-wellness` · `MentalWellnessInput` Pydantic schema · FastAPI validation |
| **Test Steps** | 1. Send `POST http://localhost:8000/predict/mental-wellness` directly with `sleep_quality_1_5=0` (below min=1) · 2. Send with `stress_level_0_10=11` (above max=10) · 3. Send with `screen_time_hours=25` (above max=24) · 4. Send with `work_screen_hours=10` when `screen_time_hours=5` (cross-field) |
| **Expected Result** | ✅ `sleep_quality_1_5=0`: HTTP 422 with field validation error · ✅ `stress_level_0_10=11`: HTTP 422 · ✅ `screen_time_hours=25`: HTTP 422 · ✅ `work_screen_hours > screen_time_hours`: HTTP 422 "Screen time component cannot exceed total screen time" · ✅ All errors include field name and constraint description |
| **Screenshot** | _(Attach screenshot of HTTP 422 response body with Pydantic validation error details)_ |

---

#### TC-050: End-to-End Full User Journey

| Field | Details |
|---|---|
| **Test ID** | TC-050 |
| **Test Case** | Complete End-to-End User Journey (Register → Verify → Predict → Report → Admin View) |
| **Test Description** | Verify the complete user journey from registration through email verification, making all three prediction types, downloading a PDF report, and an admin viewing the new user's data — validating that all three tiers (Frontend, Backend, AI Service) work together correctly. |
| **Components Involved** | All three tiers: Frontend (all auth + prediction pages) · Backend (all routes) · AI Service (all prediction endpoints) · MongoDB · Email service |
| **Test Steps** | 1. Register new account · 2. Verify email with code · 3. Log in · 4. Submit mental wellness prediction → download PDF · 5. Submit stress level prediction → email report · 6. Submit academic impact prediction · 7. View dashboard stats · 8. Open analytics · 9. Check notifications · 10. Log in as admin → view new user's details and predictions |
| **Expected Result** | ✅ All 3 predictions return valid scores in correct ranges · ✅ PDF downloaded with correct filename · ✅ Email report received with PDF attachment · ✅ Dashboard shows all 3 latest predictions · ✅ Analytics shows data for all 3 types · ✅ Notifications panel shows prediction + milestone notifications · ✅ Admin can see new user + all 3 predictions in user detail page · ✅ All API responses return `{ success: true }` format · ✅ No console errors or unhandled exceptions |
| **Screenshot** | _(Attach screenshots: dashboard with all 3 prediction cards filled, email inbox with report, admin user details page)_ |

---

## 6. Test Summary

| Category | Total TCs | Pass | Fail | Blocked |
|---|---|---|---|---|
| A — Authentication & Authorization | 10 | — | — | — |
| B — Mental Wellness Prediction | 8 | — | — | — |
| C — Stress Level Prediction | 6 | — | — | — |
| D — Academic Impact Prediction | 6 | — | — | — |
| E — User Profile & Settings | 6 | — | — | — |
| F — Admin Panel | 7 | — | — | — |
| G — Notifications & Analytics | 4 | — | — | — |
| H — AI Service & Edge Cases | 3 | — | — | — |
| **TOTAL** | **50** | **—** | **—** | **—** |

---

## 7. Entry and Exit Criteria

### Entry Criteria
- All three services are running (Frontend :3000, Backend :5000, AI :8000)
- MongoDB is connected and seeded with admin account
- `.env` files configured with valid SMTP, JWT secrets, and AI service URL
- AI models are trained and saved in `ai/models/` directory

### Exit Criteria
- All 50 test cases executed
- 100% of Critical (authentication, prediction) test cases pass
- No P1/P2 bugs open
- PDF generation and email delivery confirmed working
- All API responses follow `{ success: true/false, data/error }` format

---

## 8. Defect Severity Classification

| Severity | Description | Examples |
|---|---|---|
| **P1 - Critical** | System unusable, data loss, security breach | Login broken, predictions not saving, JWT not verified |
| **P2 - High** | Major feature broken, no workaround | PDF download fails, admin cannot delete users, email not sent |
| **P3 - Medium** | Feature works with workaround | Wrong score color, missing pagination, theme not persisting |
| **P4 - Low** | Cosmetic, minor UX issue | Typo in label, minor alignment issue, loading state missing |

---

## 9. Tools Used for Testing

| Tool | Purpose |
|---|---|
| Google Chrome DevTools | Frontend inspection, network requests, console errors |
| Postman / Thunder Client | API endpoint testing |
| MongoDB Compass | Database verification |
| Ethereal Email | Email delivery testing in development |
| Jest | Backend unit and integration tests |
| pytest | AI service endpoint tests |
| ESLint | Frontend static analysis |

---

*Document End — WellSync Test Plan v1.0 | 50 Test Cases | Prepared: 2026-02-20*

