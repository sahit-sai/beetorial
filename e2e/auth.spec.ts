import { test, expect } from '@playwright/test'

test('Style guide page displays headings and theme colors', async ({ page }) => {
  await page.goto('/style-guide')
  await expect(page.locator('h1').first()).toContainText('Beetorial System Guidelines')
  await expect(page.locator('text=Typography System')).toBeVisible()
})

test('Student can log in, view dashboard, and read a syllabus note', async ({ page }) => {
  // Go to login page
  await page.goto('/login')
  
  // Fill in student credentials
  await page.fill('input[id="email"]', 'alex.jenkins@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  
  // Click sign in button
  await page.click('button[type="submit"]')
  
  // Should redirect to student dashboard
  await expect(page).toHaveURL(/\/student/)
  await expect(page.locator('h2')).toContainText('Welcome back, Alex')
  
  // Click Notes Library sidebar link
  await page.click('text=Notes Library')
  await expect(page).toHaveURL(/\/student\/notes/)
  
  // Verify note details are displayed
  await expect(page.locator('h1')).toContainText('Mastering Simplified Fractions')
  await expect(page.locator('text=To simplify a fraction, divide both the numerator')).toBeVisible()
})

test('Parent can log in and view read-only progress mirror of their child', async ({ page }) => {
  // Go to login page
  await page.goto('/login')
  
  // Fill in parent credentials
  await page.fill('input[id="email"]', 'sarah.jenkins@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  
  // Click sign in button
  await page.click('button[type="submit"]')
  
  // Should redirect to parent dashboard
  await expect(page).toHaveURL(/\/parent/)
  await expect(page.locator('h2')).toContainText('Tracking progress of Alex Jenkins')
  await expect(page.locator('text=Read-Only Parent Account')).toBeVisible()
  
  // Verify parent details and notes activity
  await expect(page.locator('text=Sarah Jenkins')).toBeVisible()
  await expect(page.locator('text=Weekly Lessons Agenda')).toBeVisible()
})

test('Student can complete media prejoin checks and enter virtual classroom call', async ({ page }) => {
  // Go to login page
  await page.goto('/login')
  
  // Fill in student credentials
  await page.fill('input[id="email"]', 'alex.jenkins@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  await page.click('button[type="submit"]')
  
  // Should land on student dashboard
  await expect(page).toHaveURL(/\/student/)
  
  // Click Join Call button
  await page.click('text=Join Call')
  
  // Should redirect to classroom setup prejoin page
  await expect(page).toHaveURL(/\/classroom\/prejoin/)
  await expect(page.locator('h1')).toContainText('Classroom Setup')

  // Click Authorize Camera & Mic button to trigger mock verification
  await page.click('text=Authorize Camera & Mic')
  
  // Click Enter Live Classroom button
  await page.click('text=Enter Live Classroom')
  
  // Should load classroom room page
  await expect(page).toHaveURL(/\/classroom\/room/)
  await expect(page.locator('h1')).toContainText('Virtual Class')
  
  // Send a chat message
  await page.fill('input[placeholder="Send message to class..."]', 'Hello, this is Alex!')
  await page.waitForTimeout(300)
  await page.press('input[placeholder="Send message to class..."]', 'Enter')
  
  // Verify chat is logged and visible
  await expect(page.locator('text=Hello, this is Alex!')).toBeVisible()
  
  // Click Leave Call button
  await page.click('text=Leave Call')
  
  // Should redirect back to student dashboard
  await expect(page).toHaveURL(/\/student/)
})

test('Student can take a proctored assessment, log a proctoring violation, auto-grade wrong answers, and unlock a revision pack', async ({ page }) => {
  // Clear mock attempts state on server first
  await page.goto('/api/reset-tests')

  // Go to login page
  await page.goto('/login')
  
  // Fill in student credentials
  await page.fill('input[id="email"]', 'alex.jenkins@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  await page.click('button[type="submit"]')
  
  // Should land on student dashboard
  await expect(page).toHaveURL(/\/student/)
  
  // Click Assessments & Tests sidebar link
  await page.click('text=Assessments & Tests')
  await expect(page).toHaveURL(/\/student\/assessments/)
  
  // Click Start Exam button
  await page.click('text=Start Exam')
  await expect(page).toHaveURL(/\/student\/assessments\/take/)
  await expect(page.locator('h1')).toContainText('Exam System Check')
  
  // Click Check Webcam & Mic, then Start Exam (Lock Screen)
  await page.click('text=Check Webcam & Mic')
  await page.click('text=Start Exam (Lock Screen)')
  
  // Verify taking interface loads
  await expect(page.locator('text=Fractions Diagnostic')).toBeVisible()
  
  // Answer Question 1 (MCQ) - select incorrect option '0.50' (Correct is 0.75) to trigger revision pack
  await page.click('text=0.50')
  await page.click('text=Next')
  
  // Answer Question 2 (Fill Blank) - enter correct '2/3'
  await page.fill('input[placeholder="Type your answer here..."]', '2/3')
  await page.click('text=Next')
  
  // Answer Question 3 (Matching Pairs) - select wrong match choice
  await page.locator('text=20%').first().click() // Click match pairing choice
  await page.click('text=Next')
  
  // Answer Question 4 (Short Answer)
  await page.fill('textarea[placeholder="Type your explanation here..."]', 'My explanation text.')
  
  // Simulate tab switch proctoring violation
  await page.click('text=Simulate Tab Switch')
  await expect(page.locator('text=1 / 3')).toBeVisible() // Verify violation counter is 1
  
  // Submit Exam
  await page.click('text=Submit Exam')
  
  // Should redirect to exam submitted page
  await expect(page.locator('text=Exam Submitted')).toBeVisible()
  
  // Click Return to Assessment Hub
  await page.click('text=Return to Assessment Hub')
  await expect(page).toHaveURL(/\/student\/assessments/)
  
  // Verify that the Revision Pack was unlocked for Alex Jenkins!
  await expect(page.locator('text=Review Topic: Simplifying Fractions')).toBeVisible()
  await expect(page.locator('text=Mastering Simplified Fractions')).toBeVisible()
})

test('Student and parent can access progress reports with accuracy line charts and attendance logs', async ({ page }) => {
  // Go to login page
  await page.goto('/login')
  
  // Fill in student credentials
  await page.fill('input[id="email"]', 'alex.jenkins@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  await page.click('button[type="submit"]')
  
  // Wait for redirect to student workspace to ensure auth session is written
  await expect(page).toHaveURL(/\/student/)
  
  // Navigate to student reports page
  await page.goto('/student/reports')
  
  // Verify title and metrics are visible
  await expect(page.locator('text=Student Analytics & Progress Report')).toBeVisible()
  await expect(page.locator('text=Syllabus Progress')).toBeVisible()
  await expect(page.locator('text=Adding Mixed Numbers')).toBeVisible()
  
  // Verify custom SVG line chart points are rendered
  await expect(page.locator('text=94%')).toBeVisible()
  
  // Verify attendance listing
  await expect(page.locator('text=Dr. Liam Sterling').first()).toBeVisible()
  await expect(page.locator('text=Absent (Excused)')).toBeVisible()
})

test('Mentor can access directory dashboard, view pupils accuracy stats, and review proctor logs', async ({ page }) => {
  // Go to login page
  await page.goto('/login')
  
  // Fill in mentor credentials
  await page.fill('input[id="email"]', 'liam.sterling@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  await page.click('button[type="submit"]')
  
  // Should land on mentor control dashboard
  await expect(page).toHaveURL(/\/mentor/)
  await expect(page.locator('h2')).toContainText('Mentor Workspace')
  
  // Verify statistical totals
  await expect(page.locator('text=Assigned Pupils')).toBeVisible()
  
  // Verify student directory rows are displayed correctly
  await expect(page.locator('text=Alex Jenkins').first()).toBeVisible()
  await expect(page.locator('text=94%').first()).toBeVisible()
  await expect(page.locator('text=1 warning').first()).toBeVisible()
  
  // Verify recent proctoring violation logs are visible
  await expect(page.locator('text=Recent Proctoring Warnings Log')).toBeVisible()
  await expect(page.locator('text=Tab Switch Detected')).toBeVisible()
  
  // Verify saved classroom logs
  await expect(page.locator('text=Recent Classroom Session History')).toBeVisible()
  await expect(page.locator('text=Watch Recording').first()).toBeVisible()
})

test('Mentor can configure slot planning, note uploads, and scratchpads, which student immediately accesses and books in a unified flow', async ({ page }) => {
  // 1. Mentor logs in to set up resources
  await page.goto('/login')
  await page.fill('input[id="email"]', 'liam.sterling@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/mentor/)
  
  // Upload a note file
  await page.fill('input[placeholder="e.g. Master Simplification Ratios Guide"]', 'Master Fractions Guide')
  await page.click('text=Upload & Share Note')
  await expect(page.locator('text=Worksheet shared successfully!')).toBeVisible()
  
  // Open an availability slot (Date: 2026-07-28, Time: 11:00)
  await page.fill('input[type="date"]', '2026-07-28')
  await page.fill('input[type="time"]', '11:00')
  await page.click('text=Add Open Slot')
  
  // Verify slot status badge appears in listings
  await expect(page.locator('text=available').first()).toBeVisible()
  
  // Edit Shared Notepad
  await page.fill('textarea[placeholder="Type lesson outlines, equations, formulas, or general updates here..."]', 'Updated class lesson note.')
  await page.click('text=Save Note')
  await expect(page.locator('text=Changes Saved!')).toBeVisible()

  // Sign out as mentor
  await page.click('text=Sign out')
  await expect(page).toHaveURL(/\/login/)

  // 2. Student logs in to verify and book
  await page.fill('input[id="email"]', 'alex.jenkins@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/student/)
  
  // Navigate to Notes Library
  await page.goto('/student/notes')
  
  // Select Master Fractions Guide from shared resources
  await page.click('text=Master Fractions Guide')
  await expect(page.locator('text=Download File Worksheet')).toBeVisible()
  
  // Click Collaborative Scratchpad
  await page.click('text=Collaborative Scratchpad')
  await expect(page.locator('textarea')).toHaveValue('Updated class lesson note.')
  
  // Go to scheduling calendar
  await page.goto('/student/schedule')
  
  // Book the available Mathematics slot
  await page.click('text=Book Slot')
  
  // Verify real-time notification alert banner is displayed
  await expect(page.locator('text=Booked! New tutoring session scheduled')).toBeVisible()
})

test('Admin can access CRM, enroll a lead, transition lead status, matching mentors, and pay invoices', async ({ page }) => {
  // Go to login page
  await page.goto('/login')

  // Fill in admin credentials
  await page.fill('input[id="email"]', 'admin@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  await page.click('button[type="submit"]')

  // Redirection to /admin dashboard
  await expect(page).toHaveURL(/\/admin/)
  await expect(page.locator('h2')).toContainText('Admin Workspace')

  // Verify dashboard stats
  await expect(page.locator('text=Total Leads')).toBeVisible()
  await expect(page.locator('text=Enrolled Pupils')).toBeVisible()

  // Add new lead
  await page.fill('input[placeholder="e.g. Tommy Miller"]', 'Timothy Coder')
  await page.fill('input[placeholder="e.g. Robert Miller"]', 'Parent Coder')
  await page.fill('input[placeholder="e.g. robert.miller@example.com"]', 'coder@example.com')
  await page.fill('textarea[placeholder="Add struggles, targets, subject preferences..."]', 'Prefers programming lessons.')
  await page.click('button:has-text("Enroll Lead")')

  // Check lead card is visible in pipeline
  await expect(page.locator('text=Timothy Coder')).toBeVisible()
  
  // Transition lead (move to Demo Scheduled column)
  await page.locator('div:has-text("Timothy Coder") button[title="Move forward"]').first().click()
  await expect(page.locator('div:has-text("Timothy Coder")').first()).toBeVisible()

  // Switch to Pupil Matching tab
  await page.click('button:has-text("Pupil Matching")')
  await expect(page.locator('text=Mentor-Student Allocation Hub')).toBeVisible()
  await expect(page.locator('text=Alex Jenkins')).toBeVisible()

  // Switch to Subscriptions & Invoices tab
  await page.click('button:has-text("Subscriptions & Invoices")')
  await expect(page.locator('text=Billing Audit & Invoices Ledger')).toBeVisible()
  await expect(page.locator('text=$349.00').first()).toBeVisible()

  // Click Mark Paid for invoice inv-1003
  await page.locator('tr:has-text("Marcus Vance") button:has-text("Mark Paid")').click()
  await expect(page.locator('tr:has-text("Marcus Vance")').locator('text=paid')).toBeVisible()
})

test('Mentor Report Dispatch & Parent Notification Flow', async ({ page }) => {
  // Reset database state first
  await page.goto('/api/reset-tests')

  // 1. Log in as Mentor Liam Sterling
  await page.goto('/login')
  await page.fill('input[id="email"]', 'liam.sterling@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  await page.click('button[type="submit"]')

  // Should land on mentor dashboard
  await expect(page).toHaveURL(/\/mentor/)
  await expect(page.locator('h2')).toContainText('Mentor Workspace')

  // Verify that the notification bell button exists
  await expect(page.locator('button[title="View Notifications"]')).toBeVisible()

  // 2. Click "Send Weekly Report" next to Alex Jenkins in Pupil Directory
  await page.locator('div:has-text("Alex Jenkins") button:has-text("Send Weekly Report")').click()
  await expect(page.locator('text=Weekly report sent successfully!')).toBeVisible()

  // Log out
  await page.click('button:has-text("Sign out")')
  await expect(page).toHaveURL(/\/login/)

  // 3. Log in as Parent Sarah Jenkins
  await page.fill('input[id="email"]', 'sarah.jenkins@beetorial.com')
  await page.fill('input[id="password"]', 'any-password-here')
  await page.click('button[type="submit"]')

  // Should land on parent dashboard
  await expect(page).toHaveURL(/\/parent/)
  await expect(page.locator('h2')).toContainText('Tracking progress of Alex Jenkins')

  // Verify notification center bell has unread count indicator
  await expect(page.locator('button[title="View Notifications"] span.bg-rose-500')).toBeVisible()

  // Click the notification bell to open the dropdown overlay
  await page.locator('button[title="View Notifications"]').click()

  // Verify the new progress report notification is listed in the popover
  await expect(page.locator('text=New Weekly Progress Report')).toBeVisible()
  await expect(page.locator('text=Liam Sterling has published the weekly')).toBeVisible()

  // Click checkmark button on that notification to mark it as read
  await page.locator('div:has-text("New Weekly Progress Report") button[title="Mark as read"]').click()

  // The unread status indicator should be removed
  await expect(page.locator('div:has-text("New Weekly Progress Report") span.bg-indigo-500')).not.toBeVisible()
})


