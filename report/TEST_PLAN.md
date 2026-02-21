# WellSync Test Plan

**Project:** WellSync AI-Powered Mental Wellness and Academic Performance Prediction System
**Version:** 1.0.0
**Prepared By:** QA Team
**Date:** 2026-02-20
**Total Test Cases:** 50

---

## 1. Introduction

This document outlines the test plan and 50 test cases for the WellSync platform, covering the Frontend (Next.js), Backend (Node.js/Express), and AI Service (FastAPI/Python).

---

## 2. Scope of Testing

| Module | Status |
|---|---|
| Authentication | Included |
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
| Database | MongoDB |
| Browser | Google Chrome |
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

### Category A â€” Authentication and Authorization

---

#### TC-001

| Field | Details |
|---|---|
| **Test ID** | TC-001 |
| **Test Case** | Successful User Registration |
| **Test Description** | Verify a new user can register with valid credentials and receive a JWT token and welcome email. |
| **Components Involved** | /register page Â· POST /api/auth/register Â· User model Â· emailService |
| **Test Steps** | 1. Go to /register. 2. Enter valid name, email, and password. 3. Click Create Account. |
| **Expected Result** | Account created. Redirected to /verify-email. Welcome email sent. HTTP 201 returned. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-002

| Field | Details |
|---|---|
| **Test ID** | TC-002 |
| **Test Case** | Registration with Duplicate Email |
| **Test Description** | Verify that registering with an existing email is rejected and no duplicate account is created. |
| **Components Involved** | /register page Â· POST /api/auth/register Â· User model |
| **Test Steps** | 1. Go to /register. 2. Enter an already-registered email. 3. Click Create Account. |
| **Expected Result** | Error toast: "User already exists." HTTP 400. No duplicate user in DB. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-003

| Field | Details |
|---|---|
| **Test ID** | TC-003 |
| **Test Case** | Registration with Weak Password |
| **Test Description** | Verify passwords that do not meet complexity rules are rejected with inline validation errors. |
| **Components Involved** | /register page Â· Zod schema Â· registerValidation middleware |
| **Test Steps** | 1. Go to /register. 2. Enter password: "password" (no uppercase, no digit). 3. Click Create Account. |
| **Expected Result** | Inline error shown below the field. No API call made. Account not created. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-004

| Field | Details |
|---|---|
| **Test ID** | TC-004 |
| **Test Case** | Successful Login |
| **Test Description** | Verify a registered user can log in and is redirected to the correct dashboard based on role. |
| **Components Involved** | /login page Â· POST /api/auth/login Â· authController |
| **Test Steps** | 1. Go to /login. 2. Enter valid email and password. 3. Click Sign In. |
| **Expected Result** | Login successful. User redirected to /dashboard (or /admin for admin). JWT stored in localStorage. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-005

| Field | Details |
|---|---|
| **Test ID** | TC-005 |
| **Test Case** | Login with Wrong Password |
| **Test Description** | Verify wrong password returns a generic error. After 5 failed attempts the account is locked for 30 minutes. |
| **Components Involved** | /login page Â· POST /api/auth/login Â· User.incLoginAttempts |
| **Test Steps** | 1. Go to /login. 2. Enter valid email and wrong password. 3. Repeat 5 times. |
| **Expected Result** | HTTP 401 "Invalid credentials." After 5 attempts: HTTP 423 "Account temporarily locked." |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-006

| Field | Details |
|---|---|
| **Test ID** | TC-006 |
| **Test Case** | Email Verification with Valid Code |
| **Test Description** | Verify a newly registered user can verify their email using the 6-digit code sent to their inbox. |
| **Components Involved** | /verify-email page Â· POST /api/auth/verify-email Â· emailService |
| **Test Steps** | 1. Register an account. 2. Go to /verify-email. 3. Enter the 6-digit code. 4. Click Verify Email. |
| **Expected Result** | Email verified. Redirected to /login?verified=true. isEmailVerified = true in DB. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-007

| Field | Details |
|---|---|
| **Test ID** | TC-007 |
| **Test Case** | Password Reset Flow |
| **Test Description** | Verify a user can request a reset code, submit it with a new password, and log in successfully. |
| **Components Involved** | /forgot-password Â· /reset-password Â· POST /api/auth/forgot-password Â· POST /api/auth/reset-password |
| **Test Steps** | 1. Go to /forgot-password. 2. Enter email and click Send Reset Code. 3. Enter code and new password on /reset-password. 4. Click Reset Password. |
| **Expected Result** | Reset email sent. Password changed. Redirected to /login?reset=true. Old password no longer works. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-008

| Field | Details |
|---|---|
| **Test ID** | TC-008 |
| **Test Case** | Unauthorized Access to Protected Route |
| **Test Description** | Verify unauthenticated users are redirected to login and API calls without a token return HTTP 401. |
| **Components Involved** | Dashboard auth guard Â· protect middleware Â· GET /api/users/dashboard |
| **Test Steps** | 1. Clear localStorage. 2. Navigate to /dashboard. 3. Send GET /api/users/dashboard without token. |
| **Expected Result** | Frontend redirects to /login. API returns HTTP 401 "Not authorized." |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-009

| Field | Details |
|---|---|
| **Test ID** | TC-009 |
| **Test Case** | Regular User Accessing Admin Endpoint |
| **Test Description** | Verify a regular user with a valid JWT cannot access admin-only endpoints and receives HTTP 403. |
| **Components Involved** | protect middleware Â· authorize('admin') Â· GET /api/admin/users |
| **Test Steps** | 1. Log in as regular user. 2. Send GET /api/admin/users with user token. |
| **Expected Result** | HTTP 403 "User role not authorized." No admin data returned. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-010

| Field | Details |
|---|---|
| **Test ID** | TC-010 |
| **Test Case** | Rate Limiting on Login Endpoint |
| **Test Description** | Verify the auth rate limiter blocks excessive failed login attempts after 5 failures per 15 minutes. |
| **Components Involved** | authLimiter Â· POST /api/auth/login |
| **Test Steps** | 1. Send 5 wrong-credential login requests. 2. Send a 6th request immediately. |
| **Expected Result** | First 5: HTTP 401. 6th attempt: HTTP 429 with Retry-After header. |
| **Screenshot** | _(Attach screenshot)_ |

---

### Category B â€” Mental Wellness Prediction

---

#### TC-011

| Field | Details |
|---|---|
| **Test ID** | TC-011 |
| **Test Case** | Successful Mental Wellness Prediction |
| **Test Description** | Verify a logged-in user can submit valid data and receive a wellness score (0-100) with interpretation and action buttons. |
| **Components Involved** | /predictions/mental-wellness Â· POST /api/predictions/mental-wellness Â· AI: POST /predict/mental-wellness |
| **Test Steps** | 1. Log in and go to /predictions/mental-wellness. 2. Fill all fields with valid data. 3. Click Get Prediction. |
| **Expected Result** | Score (0-100) displayed with interpretation label, progress bar, and action buttons. Prediction saved. HTTP 201. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-012

| Field | Details |
|---|---|
| **Test ID** | TC-012 |
| **Test Case** | Load Example Data |
| **Test Description** | Verify clicking Load Example populates all form fields with valid data from the AI service. |
| **Components Involved** | /predictions/mental-wellness Â· GET /api/predictions/examples/mental_wellness Â· AI: GET /examples/mental-wellness |
| **Test Steps** | 1. Go to /predictions/mental-wellness. 2. Click Load Example. 3. Click Get Prediction. |
| **Expected Result** | All fields auto-filled. Prediction returned successfully. No validation errors. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-013

| Field | Details |
|---|---|
| **Test ID** | TC-013 |
| **Test Case** | Screen Time Cross-Field Validation |
| **Test Description** | Verify the form blocks submission when Work or Leisure screen time exceeds Total screen time. |
| **Components Involved** | /predictions/mental-wellness Â· frontend cross-field validation |
| **Test Steps** | 1. Set Total Screen Time = 5. 2. Set Work Screen Time = 6. 3. Click Get Prediction. |
| **Expected Result** | Error toast: "Work + Leisure screen time cannot exceed Total screen time." Form not submitted. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-014

| Field | Details |
|---|---|
| **Test ID** | TC-014 |
| **Test Case** | Age Boundary Validation |
| **Test Description** | Verify age values at the boundaries (18 and 100) are accepted, while values outside (17 and 101) are rejected. |
| **Components Involved** | mentalWellnessValidation middleware Â· POST /api/predictions/mental-wellness |
| **Test Steps** | 1. Submit with Age=18. 2. Submit with Age=100. 3. Submit with Age=17. 4. Submit with Age=101. |
| **Expected Result** | Age 18 and 100: accepted. Age 17 and 101: HTTP 400 validation error. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-015

| Field | Details |
|---|---|
| **Test ID** | TC-015 |
| **Test Case** | Email Prediction Report |
| **Test Description** | Verify clicking Email Report sends the prediction as a PDF attachment to the user's email. |
| **Components Involved** | POST /api/predictions/:id/email Â· emailService Â· pdfGenerator Â· emailLimiter |
| **Test Steps** | 1. Complete a prediction. 2. Click Email Report. 3. Check inbox. |
| **Expected Result** | Email received with PDF attachment. Toast: "Report sent to your email!" HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-016

| Field | Details |
|---|---|
| **Test ID** | TC-016 |
| **Test Case** | Download PDF Report |
| **Test Description** | Verify clicking Download PDF generates and downloads a correctly named PDF file. |
| **Components Involved** | GET /api/predictions/:id/pdf Â· pdfGenerator |
| **Test Steps** | 1. Complete a prediction. 2. Click Download PDF. 3. Check downloads folder. |
| **Expected Result** | PDF downloaded with filename Mental_Wellness_Report_YYYY-MM-DD.pdf. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-017

| Field | Details |
|---|---|
| **Test ID** | TC-017 |
| **Test Case** | View Recommendations Modal |
| **Test Description** | Verify clicking View Recommendations opens a modal with score-appropriate suggestions. |
| **Components Involved** | /predictions/mental-wellness Â· recommendations modal |
| **Test Steps** | 1. Complete a prediction with score >= 80. 2. Click View Recommendations. 3. Repeat with score < 60. |
| **Expected Result** | Modal opens with relevant recommendations. Closes on X or Close button. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-018

| Field | Details |
|---|---|
| **Test ID** | TC-018 |
| **Test Case** | View Prediction History |
| **Test Description** | Verify users can view all past predictions with score, interpretation, and date in the history page. |
| **Components Involved** | /predictions Â· GET /api/predictions Â· Prediction model |
| **Test Steps** | 1. Submit 3 predictions. 2. Click View History. |
| **Expected Result** | All predictions listed in descending order with pagination. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

### Category C â€” Stress Level Prediction

---

#### TC-019

| Field | Details |
|---|---|
| **Test ID** | TC-019 |
| **Test Case** | Successful Stress Level Prediction |
| **Test Description** | Verify a user can submit valid data and receive a stress score (0-10) with category label and recommendations. |
| **Components Involved** | /predictions/stress Â· POST /api/predictions/stress-level Â· AI: POST /predict/stress |
| **Test Steps** | 1. Go to /predictions/stress. 2. Fill all fields. 3. Click Get Prediction. |
| **Expected Result** | Score (0-10) with category label and recommendations displayed. HTTP 201. Prediction saved. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-020

| Field | Details |
|---|---|
| **Test ID** | TC-020 |
| **Test Case** | High Stress Alert for Score 6 or Above |
| **Test Description** | Verify the red High Stress alert appears only when the predicted score is 6 or above. |
| **Components Involved** | /predictions/stress Â· result rendering |
| **Test Steps** | 1. Submit with high-risk inputs. 2. Submit with low-risk inputs. 3. Compare alert visibility. |
| **Expected Result** | Score >= 6: Red alert "High Stress Detected" shown. Score < 6: Alert not shown. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-021

| Field | Details |
|---|---|
| **Test ID** | TC-021 |
| **Test Case** | Missing Required Field Rejected |
| **Test Description** | Verify that omitting mental_wellness_index_0_100, unique to stress prediction, returns a validation error. |
| **Components Involved** | stressLevelValidation middleware Â· POST /api/predictions/stress-level |
| **Test Steps** | 1. Send POST /api/predictions/stress-level without mental_wellness_index_0_100. |
| **Expected Result** | HTTP 400. Validation error for missing field. No record saved. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-022

| Field | Details |
|---|---|
| **Test ID** | TC-022 |
| **Test Case** | Stress Score Category Boundaries |
| **Test Description** | Verify category labels are assigned correctly: Low (<=3), Moderate (<=6), High (<=8), Very High (>8). |
| **Components Involved** | AI: /predict/stress Â· /predictions/stress label rendering |
| **Test Steps** | 1. Submit inputs targeting scores near 3, 6, and 8. 2. Observe labels. |
| **Expected Result** | Each score displays the correct category label in the correct color. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-023

| Field | Details |
|---|---|
| **Test ID** | TC-023 |
| **Test Case** | Prediction Rate Limit |
| **Test Description** | Verify the prediction limiter allows 10 requests per minute and blocks the 11th with HTTP 429. |
| **Components Involved** | predictionLimiter Â· POST /api/predictions/stress-level |
| **Test Steps** | 1. Send 10 valid requests within 60 seconds. 2. Send an 11th immediately. |
| **Expected Result** | First 10: HTTP 201. 11th: HTTP 429. Limit resets after 60 seconds. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-024

| Field | Details |
|---|---|
| **Test ID** | TC-024 |
| **Test Case** | Recommendations Based on Input Risk Factors |
| **Test Description** | Verify the AI returns relevant recommendations based on inputs (low sleep triggers sleep tip, low exercise triggers exercise tip). |
| **Components Involved** | AI: POST /predict/stress Â· /predictions/stress recommendations |
| **Test Steps** | 1. Submit with sleep_hours=5 and exercise=100. 2. Read recommendations. |
| **Expected Result** | Sleep and exercise recommendations appear in the list. |
| **Screenshot** | _(Attach screenshot)_ |

---

### Category D â€” Academic Impact Prediction

---

#### TC-025

| Field | Details |
|---|---|
| **Test ID** | TC-025 |
| **Test Case** | Successful Academic Impact Prediction |
| **Test Description** | Verify a user can submit valid student data and receive an addiction score (2-9) with a risk label. |
| **Components Involved** | /predictions/academic Â· POST /api/predictions/academic-impact Â· AI: POST /predict/academic-impact |
| **Test Steps** | 1. Go to /predictions/academic. 2. Fill all fields. 3. Click Get Prediction. |
| **Expected Result** | Addiction score (2-9) with Low/Moderate/High Risk label and progress bar. HTTP 201. |
| **Screenshot** | _(Attach screenshot)_ |

---

### Category D (continued)

---

#### TC-026

| Field | Details |
|---|---|
| **Test ID** | TC-026 |
| **Test Case** | Age Range Validation |
| **Test Description** | Age 17 and 30 accepted; 16 and 31 rejected. |
| **Components Involved** | academicImpactValidation · POST /api/predictions/academic-impact |
| **Test Steps** | 1. Submit with age=17. 2. Submit with age=30. 3. Submit with age=16. 4. Submit with age=31. |
| **Expected Result** | Age 17 and 30 accepted. Age 16 and 31 return HTTP 400. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-027

| Field | Details |
|---|---|
| **Test ID** | TC-027 |
| **Test Case** | High Addiction Risk Display |
| **Test Description** | Score above 7 shows red High Risk alert; score 5 or below shows no alert. |
| **Components Involved** | /predictions/academic · result rendering |
| **Test Steps** | 1. Submit with heavy social media inputs. 2. Submit with low-risk inputs. 3. Compare results. |
| **Expected Result** | Score > 7: red High Risk alert shown. Score <= 5: no alert. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-028

| Field | Details |
|---|---|
| **Test ID** | TC-028 |
| **Test Case** | Social Media Platform Selection |
| **Test Description** | All platform options are selectable and submitted correctly. |
| **Components Involved** | /predictions/academic · academicImpactValidation |
| **Test Steps** | 1. Select each platform. 2. Submit form. 3. Check API payload. |
| **Expected Result** | Each platform accepted. Correct value received by API. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-029

| Field | Details |
|---|---|
| **Test ID** | TC-029 |
| **Test Case** | Conflicts with Studies Toggle |
| **Test Description** | Selecting Yes produces a higher risk score than No. |
| **Components Involved** | /predictions/academic · AI: POST /predict/academic-impact |
| **Test Steps** | 1. Submit with conflicts_with_studies=Yes. 2. Submit same data with No. 3. Compare scores. |
| **Expected Result** | Yes yields higher score. Both values accepted without errors. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-030

| Field | Details |
|---|---|
| **Test ID** | TC-030 |
| **Test Case** | Academic Prediction Trend Tracking |
| **Test Description** | Multiple predictions appear on dashboard trend chart in chronological order. |
| **Components Involved** | /dashboard · GET /api/users/dashboard · Analytics model |
| **Test Steps** | 1. Submit 3 academic predictions. 2. View dashboard trends. |
| **Expected Result** | Trend chart shows all 3 entries in order. Dashboard stats updated. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

### Category E — User Profile and Settings

---

#### TC-031

| Field | Details |
|---|---|
| **Test ID** | TC-031 |
| **Test Case** | Update Personal Information |
| **Test Description** | User can update first name, last name, age, gender, and institution; changes persist after reload. |
| **Components Involved** | /profile · PUT /api/users/profile · User model |
| **Test Steps** | 1. Go to /profile. 2. Edit name and institution. 3. Save. 4. Reload. |
| **Expected Result** | Updated values shown after reload. HTTP 200. DB record updated. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-032

| Field | Details |
|---|---|
| **Test ID** | TC-032 |
| **Test Case** | Change Password |
| **Test Description** | User can change password; old password no longer works after change. |
| **Components Involved** | /settings · PUT /api/users/password · User model |
| **Test Steps** | 1. Go to /settings. 2. Enter current and new password. 3. Save. 4. Log out and try old password. |
| **Expected Result** | Password updated. Old password rejected. New password accepted. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-033

| Field | Details |
|---|---|
| **Test ID** | TC-033 |
| **Test Case** | Theme Preference (Light / Dark / System) |
| **Test Description** | Selecting a theme applies it immediately and persists after reload. |
| **Components Involved** | /settings · PUT /api/users/profile · useTheme (next-themes) · userController |
| **Test Steps** | 1. Go to /settings Preferences tab. 2. Select Dark. 3. Save. 4. Reload. |
| **Expected Result** | Dark theme applied and persists. DB preference updated. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-034

| Field | Details |
|---|---|
| **Test ID** | TC-034 |
| **Test Case** | Log Screen Time Activity |
| **Test Description** | User can log a screen time entry with category, duration, and date. |
| **Components Involved** | /profile · POST /api/profile/screen-time · ScreenTimeLog model |
| **Test Steps** | 1. Go to /profile Screen Time tab. 2. Enter duration, category, and date. 3. Click Log Activity. |
| **Expected Result** | Entry appears in list. HTTP 201. Record saved to DB. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-035

| Field | Details |
|---|---|
| **Test ID** | TC-035 |
| **Test Case** | Update Mental Wellness Profile |
| **Test Description** | User can save wellness details including sleep, exercise, and social media hours. |
| **Components Involved** | /profile · PUT /api/profile/wellness · MentalWellnessProfile model |
| **Test Steps** | 1. Go to /profile Wellness tab. 2. Enter sleep, exercise, and social media values. 3. Save. |
| **Expected Result** | Values saved. Form repopulated on reload. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-036

| Field | Details |
|---|---|
| **Test ID** | TC-036 |
| **Test Case** | Account Deletion |
| **Test Description** | User can permanently delete their account after confirming with password; all data removed. |
| **Components Involved** | /settings · DELETE /api/users/account · cascading delete |
| **Test Steps** | 1. Go to /settings. 2. Click Delete Account. 3. Enter password. 4. Confirm. |
| **Expected Result** | Account deleted. Redirected to /. User and predictions removed from DB. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

### Category F — Admin Panel

---

#### TC-037

| Field | Details |
|---|---|
| **Test ID** | TC-037 |
| **Test Case** | Admin Dashboard Statistics |
| **Test Description** | Admin dashboard shows correct total users, active users, predictions, and new registrations. |
| **Components Involved** | /admin · GET /api/admin/analytics · Analytics model |
| **Test Steps** | 1. Log in as admin. 2. Go to /admin. 3. Observe stats cards. |
| **Expected Result** | Correct counts displayed. Charts render without errors. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-038

| Field | Details |
|---|---|
| **Test ID** | TC-038 |
| **Test Case** | Search and Filter Users |
| **Test Description** | Admin can search users by name or email and filter by role or status. |
| **Components Involved** | /admin/users · GET /api/admin/users · adminController |
| **Test Steps** | 1. Go to /admin/users. 2. Type name in search box. 3. Apply role filter. |
| **Expected Result** | Only matching users shown. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-039

| Field | Details |
|---|---|
| **Test ID** | TC-039 |
| **Test Case** | Promote User to Admin |
| **Test Description** | Admin can change a user role to admin; promoted user gains admin access. |
| **Components Involved** | /admin/users/[id] · PUT /api/admin/users/:id · adminController |
| **Test Steps** | 1. Open user details. 2. Change role to Admin. 3. Save. 4. Log in as that user. |
| **Expected Result** | Role updated. User can access /admin. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-040

| Field | Details |
|---|---|
| **Test ID** | TC-040 |
| **Test Case** | Deactivate and Reactivate User |
| **Test Description** | Deactivating a user blocks their login; reactivating restores access. |
| **Components Involved** | /admin/users/[id] · PUT /api/admin/users/:id/status · authController |
| **Test Steps** | 1. Deactivate user. 2. Attempt login. 3. Reactivate. 4. Attempt login again. |
| **Expected Result** | Deactivated: HTTP 403. Reactivated: login succeeds. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-041

| Field | Details |
|---|---|
| **Test ID** | TC-041 |
| **Test Case** | Delete User with Confirmation |
| **Test Description** | Admin can delete a user; all predictions for that user are also removed. |
| **Components Involved** | /admin/users/[id] · DELETE /api/admin/users/:id · adminController |
| **Test Steps** | 1. Open user details. 2. Click Delete User. 3. Confirm in dialog. |
| **Expected Result** | User removed. Redirected to /admin/users. Predictions deleted. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-042

| Field | Details |
|---|---|
| **Test ID** | TC-042 |
| **Test Case** | Broadcast Notification to All Users |
| **Test Description** | Admin broadcast appears in all users notification lists. |
| **Components Involved** | /admin/broadcast · POST /api/admin/broadcast · notificationService |
| **Test Steps** | 1. Go to /admin/broadcast. 2. Enter title and message. 3. Send. 4. Log in as regular user and check notifications. |
| **Expected Result** | Notification visible for all users. Unread badge increments. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-043

| Field | Details |
|---|---|
| **Test ID** | TC-043 |
| **Test Case** | Admin User Details Shows Correct Name |
| **Test Description** | Admin user details page displays firstName + lastName correctly, not N/A. |
| **Components Involved** | /admin/users/[id] · GET /api/admin/users/:id |
| **Test Steps** | 1. Log in as admin. 2. Open /admin/users/[id] for a known user. |
| **Expected Result** | Full name shown correctly. No N/A displayed. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

### Category G — Notifications and Analytics

---

#### TC-044

| Field | Details |
|---|---|
| **Test ID** | TC-044 |
| **Test Case** | Notification Bell Unread Count |
| **Test Description** | Bell badge shows correct unread count and clears after marking all as read. |
| **Components Involved** | Navbar · GET /api/notifications · PUT /api/notifications/read-all |
| **Test Steps** | 1. Trigger 3 notifications. 2. Observe badge. 3. Click Mark All Read. |
| **Expected Result** | Badge shows 3. After marking read: badge disappears. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-045

| Field | Details |
|---|---|
| **Test ID** | TC-045 |
| **Test Case** | Weekly and Monthly Analytics |
| **Test Description** | Analytics page shows prediction counts and wellness trends for weekly and monthly periods. |
| **Components Involved** | /analytics · GET /api/analytics · recharts |
| **Test Steps** | 1. Go to /analytics. 2. Switch between Weekly and Monthly tabs. |
| **Expected Result** | Charts render with correct data for each period. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-046

| Field | Details |
|---|---|
| **Test ID** | TC-046 |
| **Test Case** | AI Insights on Analytics Page |
| **Test Description** | Analytics page shows personalised insights based on prediction trends. |
| **Components Involved** | /analytics · GET /api/analytics/insights · analyticsController |
| **Test Steps** | 1. Submit at least 5 predictions. 2. Go to /analytics. 3. View Insights section. |
| **Expected Result** | At least 3 personalised insights shown. HTTP 200. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-047

| Field | Details |
|---|---|
| **Test ID** | TC-047 |
| **Test Case** | Milestone Notification at 5 Predictions |
| **Test Description** | A milestone notification is auto-generated when a user reaches 5 predictions. |
| **Components Involved** | predictionController · notificationService · Notification model |
| **Test Steps** | 1. Submit predictions until count reaches 5. 2. Check notifications. |
| **Expected Result** | Notification "You have made 5 predictions!" appears. Unread badge increments. |
| **Screenshot** | _(Attach screenshot)_ |

---

### Category H — AI Service and Edge Cases

---

#### TC-048

| Field | Details |
|---|---|
| **Test ID** | TC-048 |
| **Test Case** | AI Service Health Check |
| **Test Description** | FastAPI health endpoint returns status healthy with model availability. |
| **Components Involved** | FastAPI · GET /health |
| **Test Steps** | 1. Send GET http://localhost:8000/health. |
| **Expected Result** | HTTP 200. Response includes status: healthy and all three model flags as true. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-049

| Field | Details |
|---|---|
| **Test ID** | TC-049 |
| **Test Case** | AI Service Pydantic Validation |
| **Test Description** | Invalid data types return HTTP 422 with field-level error details. |
| **Components Involved** | FastAPI · Pydantic validators · POST /predict/mental-wellness |
| **Test Steps** | 1. Send POST /predict/mental-wellness with age="abc" and screen_time=-1. |
| **Expected Result** | HTTP 422. Each invalid field listed with error reason. No prediction returned. |
| **Screenshot** | _(Attach screenshot)_ |

---

#### TC-050

| Field | Details |
|---|---|
| **Test ID** | TC-050 |
| **Test Case** | End-to-End User Journey |
| **Test Description** | New user registers, verifies email, logs in, runs all three predictions, views dashboard, and logs out. |
| **Components Involved** | All prediction endpoints · authController · dashboard · emailService |
| **Test Steps** | 1. Register. 2. Verify email. 3. Log in. 4. Submit mental wellness prediction. 5. Submit stress prediction. 6. Submit academic prediction. 7. View dashboard. 8. Log out. |
| **Expected Result** | All steps complete without errors. Dashboard shows all 3 predictions. Logout clears session. |
| **Screenshot** | _(Attach screenshot)_ |

---

## 6. Test Summary

| Category | Total | Pass | Fail | Blocked |
|---|---|---|---|---|
| A — Authentication | 10 | | | |
| B — Mental Wellness | 8 | | | |
| C — Stress Level | 6 | | | |
| D — Academic Impact | 6 | | | |
| E — Profile and Settings | 6 | | | |
| F — Admin Panel | 7 | | | |
| G — Notifications and Analytics | 4 | | | |
| H — AI Service and Edge Cases | 3 | | | |
| **Total** | **50** | | | |

---

## 7. Entry and Exit Criteria

### Entry Criteria
- All three services (Frontend, Backend, AI) are running.
- Database is seeded with at least one admin account.
- Test environment variables are configured.

### Exit Criteria
- All 50 test cases executed.
- No critical (P1) defects remaining open.
- Pass rate of 90% or above achieved.

---

## 8. Defect Severity Levels

| Level | Label | Description |
|---|---|---|
| P1 | Critical | System crash or complete feature failure. |
| P2 | High | Major feature broken with no workaround. |
| P3 | Medium | Feature works but with incorrect behaviour. |
| P4 | Low | Minor UI or cosmetic issue. |

---

*Document prepared for WellSync v1.0.0 — ICBT Campus, 2026*
