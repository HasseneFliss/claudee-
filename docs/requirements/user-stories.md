# User Stories

## Summary

Banking backend system focused specifically on loan management and customer onboarding. Includes loan applications, approvals, tracking, and customer verification processes. Does not include broader banking features like payments, accounts, or transactions as these were not specified in the requirements.

## Stories

### US-001: Submit Loan Application

**Priority:** critical
**Story Points:** 8

**Description:**
As a bank customer, I want to submit a loan application through the mobile/web app, so that I can request financing for my needs

**Acceptance Criteria:**
- [ ] Customer can fill out loan application form with required information
- [ ] Application data is validated and stored in the system
- [ ] Customer receives confirmation of successful submission
- [ ] Application is assigned a unique tracking number

### US-002: Customer Onboarding Process

**Priority:** critical
**Story Points:** 13

**Description:**
As a bank customer, I want to complete the onboarding process, so that I can become a verified customer and access loan services

**Acceptance Criteria:**
- [ ] Customer can provide personal information and documents
- [ ] System validates customer information
- [ ] Customer onboarding status is tracked
- [ ] Completed onboarding enables access to loan applications

### US-003: Customer Identity Verification

**Priority:** critical
**Story Points:** 13

**Description:**
As a bank customer, I want to complete identity verification, so that my account can be approved for loan services

**Acceptance Criteria:**
- [ ] Customer can upload required identity documents
- [ ] System validates document authenticity
- [ ] Verification status is updated in customer profile
- [ ] Customer is notified of verification results

### US-004: Loan Application Review and Approval

**Priority:** critical
**Story Points:** 8

**Description:**
As a bank system, I need to process loan applications for approval or denial, so that customers receive decisions on their loan requests

**Acceptance Criteria:**
- [ ] System can retrieve submitted loan applications
- [ ] Application status can be updated to approved or denied
- [ ] Approval decisions are stored with timestamp and reason
- [ ] Customer is notified of the decision

### US-005: Track Loan Application Status

**Priority:** high
**Story Points:** 5

**Description:**
As a bank customer, I want to track my loan application status, so that I know the current state of my application

**Acceptance Criteria:**
- [ ] Customer can view current status of their loan applications
- [ ] Status includes stages like submitted, under review, approved, denied
- [ ] Customer can see application history and updates
- [ ] Status information is real-time and accurate

### US-006: Loan Portfolio Management

**Priority:** high
**Story Points:** 5

**Description:**
As a bank customer, I want to view my approved loans, so that I can track my active loan obligations

**Acceptance Criteria:**
- [ ] Customer can view list of approved/active loans
- [ ] Loan details include amount, terms, and payment schedule
- [ ] Customer can access loan documents and agreements
- [ ] Loan status is kept up to date

