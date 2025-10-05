# Data Import Guide - Placement Dashboard

**Complete guide for adding jobs, events, and placement data to your dashboard**

---

## 📋 **Table of Contents**
1. [Method 1: Admin UI (Recommended for New Users)](#method-1-admin-ui)
2. [Method 2: CSV Bulk Import (Recommended for Existing Data)](#method-2-csv-bulk-import)
3. [Method 3: Direct API Calls (Advanced)](#method-3-api-calls)
4. [Method 4: Prisma Studio (Development)](#method-4-prisma-studio)
5. [Sample Data Templates](#sample-data-templates)

---

## Method 1: Admin UI (Recommended for New Users)

### **Adding Jobs via Admin Dashboard**

**Step 1: Access Admin Panel**
```bash
# 1. Make sure dev server is running
pnpm dev

# 2. Create admin user if you haven't already
pnpm create-admin admin admin123 "Admin User"

# 3. Navigate to admin login
# Open browser: http://localhost:3000/sign-in
# Login with username: admin, password: admin123
```

**Step 2: Navigate to Jobs Section**
1. After login, you'll be at `/admin`
2. Click on the **"Jobs"** tab (second tab)
3. Click **"Add Job"** button (blue button with + icon)

**Step 3: Fill Out Job Form (5 Tabs)**

#### **Tab 1: Basic Info**
Fill in the following required fields:
```
Company Name*: Amazon
Job Title*: SDE Intern
Job Description: Software Development Engineer Intern role...
About Company: Amazon is a Fortune 500 company...
Job Type*: INTERN_LEADS_TO_FTE (select from dropdown)
Job Category*: SUPER_DREAM (select from dropdown)
Status*: OPEN (select from dropdown)
Location: Bangalore, India
CTC: 20 LPA
Stipend: 80000/month
Application Link: https://amazon.jobs/apply/12345
```

**Category Guidelines**:
- `MARQUE`: 20L+ CTC
- `SUPER_DREAM`: 10-20L CTC
- `DREAM`: 6-10L CTC
- `REGULAR`: 3.9-6L CTC
- `CORE`: Core engineering roles
- `OTHER`: Everything else

**Job Types**:
- `SUMMER_INTERN`: Summer internship only
- `REGULAR_INTERN`: Regular internship
- `INTERNSHIP`: General internship
- `FTE`: Full-time employment
- `INTERN_PLUS_FTE`: Both intern and FTE offered
- `INTERN_LEADS_TO_FTE`: Intern converts to FTE
- `BOTH`: Both options available

#### **Tab 2: Eligibility Criteria**
Fill in academic requirements:
```
Min CGPA: 7.0
Min 10th Percentage: 60
Min 12th Percentage: 60
Min Diploma Percentage: (leave blank if not required)
Min Semester Percentage: (leave blank if not required)
Max Current Arrears: 0
Max History Arrears: 0
Gender Requirement: BOTH (or MALE/FEMALE/ANY)
Eligible Branches: CSE, IT, ECE (multiselect dropdown)
Other Eligibility: Must have data structures knowledge
```

#### **Tab 3: Dates & Visit**
```
Apply By*: 2025-10-15 (date picker)
Date of Visit: 2025-10-25 (date picker)
Hiring Starts On: 2025-10-20 (date picker)
Mode of Visit*: PHYSICAL (or ONLINE/HYBRID)
```

#### **Tab 4: Point of Contact (POC)**
```
POC Name: Rahul Sharma
POC Email: rahul.sharma@company.com
POC Phone: +91-9876543210
```

#### **Tab 5: Hiring Workflow**
Add hiring stages in order:
1. Click **"Add Stage"**
2. Enter stage name: "Pre-Placement Talk"
3. Select round type: PRE_PLACEMENT_TALK
4. Click **"Add Stage"** again
5. Enter stage name: "Online Assessment"
6. Select round type: TEST
7. Continue adding stages...

**Available Round Types**:
- PRE_PLACEMENT_TALK
- TEST (Online/Offline)
- GROUP_DISCUSSION
- TECHNICAL_INTERVIEW
- HR_INTERVIEW
- TECHNICAL_PLUS_HR_INTERVIEW

**Step 4: Submit**
- Click **"Create Job"** button at bottom
- Job will be created with automatic activity log entry
- You'll see success message
- Job appears in jobs list

**Step 5: Add Notices (Optional)**
1. Find your job in the admin jobs list
2. Click the **Bell icon** (🔔) in the Actions column
3. In the modal:
   - Enter notice title: "Shortlist Released"
   - Enter content: "Shortlisted candidates check email..."
   - Check "Important Notice" if urgent
   - Click "Add Notice"
4. Notice will appear in job modal for students

**Step 6: Upload Attachments (Optional)**
1. Find your job in the admin jobs list
2. Click the **Paperclip icon** (📎) in the Actions column
3. In the modal:
   - Click "Choose File" or drag & drop
   - Select file (PDF, DOC, DOCX, TXT, JPG, PNG - max 5MB)
   - File uploads automatically
   - Shows in list with download option
4. Students can download from job modal

---

### **Adding Events via Admin Dashboard**

**Step 1: Navigate to Events Section**
1. Go to `/admin`
2. Click on the **"Events"** tab (first tab)
3. Click **"Add Event"** button

**Step 2: Fill Event Form**
```
Title*: Google Pre-Placement Talk
Description: Google will present company overview and job roles
Start Time*: 2025-10-10 10:00 AM (datetime picker)
End Time*: 2025-10-10 12:00 PM (datetime picker)
Category*: PLACEMENT (select from dropdown)
Event Link: https://meet.google.com/abc-defg-hij
```

**Event Categories**:
- `PLACEMENT`: Placement drives
- `EXAM`: Placement tests
- `INFO_SESSION`: Information sessions
- `OA`: Online assessments
- `INTERVIEW`: Interview rounds
- `DEADLINE`: Important deadlines
- `OTHER`: Miscellaneous events

**Step 3: Submit**
- Click **"Create Event"**
- Event appears in calendar and admin list
- Students see it on `/calendar` page

---

## Method 2: CSV Bulk Import (Recommended for Existing Data)

**Use this if you have historical placement data or multiple jobs to add at once**

### **Importing Jobs from CSV**

**Step 1: Prepare CSV File**

Create a CSV file `jobs.csv` with these columns:

```csv
company,title,description,aboutCompany,ctc,stipend,type,category,status,location,link,applyBy,dateOfVisit,hiringStartsOn,modeOfVisit,minCGPA,min10thPercentage,min12thPercentage,minDiplomaPercentage,minSemPercentage,maxCurrentArrears,maxHistoryArrears,genderRequirement,eligibilityBranches,otherEligibility,pocName,pocEmail,pocPhone
Amazon,SDE Intern,Software Development Engineer Intern role,Amazon is a leading tech company,20,80000,INTERN_LEADS_TO_FTE,SUPER_DREAM,OPEN,Bangalore,https://amazon.jobs/123,2025-10-15,2025-10-25,2025-10-20,PHYSICAL,7.0,60,60,,,0,0,BOTH,"CSE,IT,ECE",Must know DSA,Rahul Sharma,rahul@company.com,+91-9876543210
Google,SDE I,Full-time Software Engineer,Google is a tech giant,30,,,FTE,MARQUE,OPEN,Hyderabad,https://google.com/careers/456,2025-10-20,2025-11-05,2025-10-25,HYBRID,7.5,70,70,,,0,0,ANY,"CSE,IT",,Priya Mehta,priya@google.com,+91-9123456789
```

**Field Mappings**:
- **Dates**: Use format `YYYY-MM-DD` (e.g., `2025-10-15`)
- **Numbers**: Use plain numbers without units (e.g., `7.0` for CGPA, `60` for percentage)
- **Enums**: Use UPPERCASE_WITH_UNDERSCORES (e.g., `INTERN_LEADS_TO_FTE`, `SUPER_DREAM`)
- **Arrays**: Use comma-separated values in quotes (e.g., `"CSE,IT,ECE"`)
- **Optional fields**: Leave blank if not needed

**Step 2: Place CSV in data/ folder**
```bash
# Create data directory if it doesn't exist
mkdir -p data

# Move your CSV file
mv jobs.csv data/jobs.csv
```

**Step 3: Run Import Script**
```bash
# Import jobs from CSV
pnpm import-jobs data/jobs.csv

# You'll see output:
# ✅ Importing jobs from data/jobs.csv...
# ✅ Successfully imported job: Amazon - SDE Intern
# ✅ Successfully imported job: Google - SDE I
# ✅ Import complete! 2 jobs imported
```

**Step 4: Verify Import**
```bash
# Open browser
# Go to: http://localhost:3000/jobs
# You should see imported jobs in the table
```

---

### **Importing Events from CSV**

**Step 1: Prepare CSV File**

Create `events.csv`:

```csv
title,description,startTime,endTime,category,link
Google PPT,Google Pre-Placement Talk,2025-10-10T10:00:00,2025-10-10T12:00:00,PLACEMENT,https://meet.google.com/abc
Amazon OA,Amazon Online Assessment,2025-10-15T14:00:00,2025-10-15T16:00:00,OA,https://hackerrank.com/test/123
Interview Round,Technical Interviews,2025-10-20T09:00:00,2025-10-20T18:00:00,INTERVIEW,
Application Deadline,Last date to apply,2025-10-12T23:59:59,2025-10-12T23:59:59,DEADLINE,
```

**Date Format**: Use ISO 8601 format `YYYY-MM-DDTHH:MM:SS`

**Step 2: Import**
```bash
pnpm import-events data/events.csv
```

**Step 3: Verify**
- Go to: http://localhost:3000/calendar
- Events should appear on calendar

---

## Method 3: API Calls (Advanced)

**Use this for programmatic access or custom integrations**

### **Creating a Job via API**

```bash
# Create admin user first
pnpm create-admin admin admin123 "Admin User"

# Login to get auth token (save cookie)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }' \
  -c cookies.txt

# Create job using saved cookie
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "company": "Microsoft",
    "title": "Software Engineer",
    "description": "Full-stack development role",
    "aboutCompany": "Microsoft Corporation",
    "type": "FTE",
    "category": "SUPER_DREAM",
    "status": "OPEN",
    "ctc": "18",
    "stipend": null,
    "location": "Bangalore",
    "link": "https://careers.microsoft.com/apply",
    "applyBy": "2025-10-30T23:59:59Z",
    "dateOfVisit": "2025-11-10T10:00:00Z",
    "hiringStartsOn": "2025-11-05T00:00:00Z",
    "modeOfVisit": "HYBRID",
    "minCGPA": 7.0,
    "min10thPercentage": 60,
    "min12thPercentage": 60,
    "maxCurrentArrears": 0,
    "maxHistoryArrears": 0,
    "genderRequirement": "BOTH",
    "eligibilityBranches": "CSE,IT,ECE",
    "otherEligibility": "Strong problem-solving skills",
    "pocName": "John Doe",
    "pocEmail": "john@microsoft.com",
    "pocPhone": "+91-9999999999",
    "workflowStages": [
      {
        "stageName": "Online Assessment",
        "roundType": "TEST",
        "orderIndex": 0
      },
      {
        "stageName": "Technical Interview",
        "roundType": "TECHNICAL_INTERVIEW",
        "orderIndex": 1
      }
    ]
  }'
```

### **Creating an Event via API**

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Meta Hiring Drive",
    "description": "Meta on-campus placement drive",
    "startTime": "2025-11-15T09:00:00Z",
    "endTime": "2025-11-15T17:00:00Z",
    "category": "PLACEMENT",
    "link": "https://meta.com/careers"
  }'
```

### **Adding Notice to Job**

```bash
# Get job ID from response or database
JOB_ID="clxxx-your-job-id-here"

curl -X POST http://localhost:3000/api/jobs/$JOB_ID/notices \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Shortlist Released",
    "content": "Shortlisted candidates should check their email for interview schedule.",
    "isImportant": true
  }'
```

### **Uploading Attachment to Job**

```bash
JOB_ID="clxxx-your-job-id-here"

curl -X POST http://localhost:3000/api/jobs/$JOB_ID/attachments \
  -H "Content-Type: multipart/form-data" \
  -b cookies.txt \
  -F "file=@/path/to/job-description.pdf"
```

---

## Method 4: Prisma Studio (Development Only)

**Use this for quick database inspection and manual edits during development**

```bash
# Open Prisma Studio
pnpm db:studio

# Opens in browser: http://localhost:5555
```

**In Prisma Studio**:
1. Select **"Job"** model from left sidebar
2. Click **"Add record"** button
3. Fill in fields directly in the UI
4. Click **"Save 1 change"**

**Advantages**:
- See all database tables
- Direct database access
- Good for debugging
- Can edit existing records

**Disadvantages**:
- Manual one-by-one entry
- No validation
- Easy to make mistakes
- Not suitable for production

---

## 📊 Sample Data Templates

### **Complete Job Example (All Fields)**

```json
{
  "company": "De Shaw",
  "title": "Software Development Engineer",
  "description": "Full-stack development with focus on algorithmic trading systems",
  "aboutCompany": "D. E. Shaw is a global investment firm with offices around the world",
  "type": "FTE",
  "category": "MARQUE",
  "status": "OPEN",
  "ctc": "57.3",
  "stipend": null,
  "location": "Mumbai, India",
  "link": "https://deshaw.com/careers/apply",
  "applyBy": "2025-10-25T23:59:59Z",
  "dateOfVisit": "2025-11-10T09:00:00Z",
  "hiringStartsOn": "2025-11-05T00:00:00Z",
  "modeOfVisit": "PHYSICAL",
  "minCGPA": 8.0,
  "min10thPercentage": 80,
  "min12thPercentage": 80,
  "minDiplomaPercentage": null,
  "minSemPercentage": null,
  "maxCurrentArrears": 0,
  "maxHistoryArrears": 0,
  "genderRequirement": "ANY",
  "eligibilityBranches": "CSE,IT",
  "otherEligibility": "Strong mathematics and problem-solving skills required",
  "pocName": "Placement Cell Coordinator",
  "pocEmail": "placements@university.edu",
  "pocPhone": "+91-9876543210",
  "notAppliedPointsDeduct": 5,
  "workflowStages": [
    {
      "stageName": "Pre-Placement Talk",
      "roundType": "PRE_PLACEMENT_TALK",
      "orderIndex": 0
    },
    {
      "stageName": "Online Assessment",
      "roundType": "TEST",
      "orderIndex": 1
    },
    {
      "stageName": "Technical Interview Round 1",
      "roundType": "TECHNICAL_INTERVIEW",
      "orderIndex": 2
    },
    {
      "stageName": "Technical Interview Round 2",
      "roundType": "TECHNICAL_INTERVIEW",
      "orderIndex": 3
    },
    {
      "stageName": "HR Interview",
      "roundType": "HR_INTERVIEW",
      "orderIndex": 4
    }
  ]
}
```

### **Minimal Job Example (Required Fields Only)**

```json
{
  "company": "Startup XYZ",
  "title": "Backend Developer",
  "type": "FTE",
  "category": "REGULAR",
  "status": "OPEN"
}
```

### **Event Example**

```json
{
  "title": "Campus Placement Drive - Day 1",
  "description": "First day of placement season with multiple companies",
  "startTime": "2025-10-15T09:00:00Z",
  "endTime": "2025-10-15T18:00:00Z",
  "category": "PLACEMENT",
  "link": "https://university.edu/placements"
}
```

---

## 🎓 **Adding Historical Placement Data**

**If you want to populate "Highest Paid Ever" and historical stats:**

### **Option 1: Create as Closed Jobs**
```json
{
  "company": "Google",
  "title": "SDE II - 2024 Batch",
  "type": "FTE",
  "category": "MARQUE",
  "status": "CLOSED",
  "ctc": "45",
  "dateOfVisit": "2024-09-15T09:00:00Z"
}
```

### **Option 2: Bulk CSV Import**
Create `historical-placements.csv`:
```csv
company,title,type,category,status,ctc,dateOfVisit
Google,SDE II,FTE,MARQUE,CLOSED,45,2024-09-15
Microsoft,SDE,FTE,SUPER_DREAM,CLOSED,18,2024-09-20
Amazon,SDE Intern,INTERNSHIP,SUPER_DREAM,CLOSED,20,2024-08-10
PayPal,Full Stack Engineer,FTE,MARQUE,CLOSED,37.3,2024-10-05
Citi,Software Engineer,FTE,SUPER_DREAM,CLOSED,18,2024-09-25
```

Import:
```bash
pnpm import-jobs data/historical-placements.csv
```

The "Highest Paid Ever" card on dashboard will automatically show top 5!

---

## ✅ **Verification Checklist**

After importing data:

**Jobs Page** (`/jobs`):
- [ ] Jobs appear in table
- [ ] Search works
- [ ] Status filter works
- [ ] Type filter shows all 7 types
- [ ] Click job opens modal with all tabs

**Job Modal**:
- [ ] Details tab shows eligibility table
- [ ] POC tab shows contact info
- [ ] Attachments tab shows uploaded files
- [ ] Notices tab shows announcements
- [ ] Logs tab shows activity

**Admin Panel** (`/admin`):
- [ ] Jobs appear in admin list
- [ ] Edit button opens filled form
- [ ] Bell icon opens notices manager
- [ ] Paperclip icon opens attachments manager
- [ ] Delete works with confirmation

**Dashboard** (`/dashboard`):
- [ ] Category stats show job counts
- [ ] Highest paid card shows top CTCs
- [ ] Top recruiters show companies

**Calendar** (`/calendar`):
- [ ] Events appear on calendar
- [ ] Category filter works
- [ ] Export buttons work

---

## 🐛 **Troubleshooting**

### **CSV Import Fails**
```
Error: Invalid enum value
```
**Fix**: Check enum values match exactly (UPPERCASE_WITH_UNDERSCORES)

### **Job Doesn't Appear in List**
**Possible causes**:
1. Status filter is set to different value
2. Type filter doesn't match job type
3. Search is active

**Fix**: Reset all filters, check status

### **Can't Upload Attachment**
```
Error: File size exceeds 5MB limit
```
**Fix**: Compress file or use external link instead

### **Authentication Error in API Calls**
```
401 Unauthorized
```
**Fix**: Make sure you're logged in and passing cookie with `-b cookies.txt`

---

## 📚 **Next Steps**

1. **Start with Admin UI** - Add 2-3 test jobs to understand the form
2. **Try CSV Import** - Import your existing placement data
3. **Add Events** - Populate calendar with upcoming events
4. **Upload Attachments** - Add JDs and company documents
5. **Add Notices** - Post important announcements
6. **Test Student View** - Check how everything looks at `/jobs` and `/calendar`
7. **Export Data** - Try CSV/PDF exports to verify data

---

## 💡 **Pro Tips**

1. **Use descriptive job titles**: Include year, batch, or role specifics
2. **Always fill POC info**: Students need contact information
3. **Add workflow stages**: Helps students understand hiring process
4. **Upload JD PDFs**: Students appreciate detailed job descriptions
5. **Mark important notices**: Use checkbox for urgent announcements
6. **Set proper categories**: Affects dashboard stats and student filtering
7. **Fill eligibility carefully**: Students rely on this to check if eligible
8. **Use meaningful CTCs**: Include currency/units in CTC field (e.g., "20 LPA")

---

**Need help?** Check the following files:
- `CURRENT-STATUS.md` - What's working and what's not
- `IMPLEMENTATION-PROGRESS.md` - Detailed feature list
- `HAVELOC-IMPLEMENTATION-PLAN.md` - Full roadmap
- `MIGRATION-GUIDE.md` - Database setup

**Happy importing!** 🚀
