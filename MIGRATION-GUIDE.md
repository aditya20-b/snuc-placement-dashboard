# Migration Guide - Haveloc-Inspired Features

## ⚠️ **IMPORTANT: Read Before Running db:push**

This migration adds extensive new features inspired by the Haveloc portal. Running `pnpm db:push` will modify your database schema significantly.

### **What's Being Added:**

#### **1. Enhanced Job Model**
New fields added to existing `Job` table:
- `aboutCompany` - Company description
- `dateOfVisit` - Campus visit date
- `hiringStartsOn` - When hiring process begins
- `modeOfVisit` - PHYSICAL/ONLINE/HYBRID
- **Eligibility Criteria:**
  - `minCGPA` - Minimum CGPA requirement
  - `min10thPercentage` - 10th grade minimum
  - `min12thPercentage` - 12th grade minimum
  - `minDiplomaPercentage` - Diploma minimum
  - `minSemPercentage` - Semester minimum
  - `maxCurrentArrears` - Max current backlogs allowed
  - `maxHistoryArrears` - Max history of backlogs
  - `genderRequirement` - MALE/FEMALE/BOTH/ANY
  - `eligibilityBranches` - e.g., "CSE/IT/ECE"
  - `otherEligibility` - Additional criteria
- **Point of Contact:**
  - `pocName` - Contact person name
  - `pocEmail` - Contact email
  - `pocPhone` - Contact phone
- `notAppliedPointsDeduct` - Penalty points

#### **2. New Tables**
- `JobWorkflowStage` - Hiring process stages (PPT, Test, GD, Interview, Offer)
- `JobAttachment` - File uploads (JD, company docs, etc.)
- `JobNotice` - Job-specific announcements
- `JobLog` - Activity tracking

#### **3. Updated Enums**
- `JobType`: Now includes SUMMER_INTERN, REGULAR_INTERN, INTERN_PLUS_FTE, INTERN_LEADS_TO_FTE
- `JobCategory`: Now includes MARQUE (20L+), DREAM (6-10L), SUPER_DREAM (10-20L), REGULAR (0-3.9L)
- New: `GenderRequirement`, `ModeOfVisit`

---

## 🔧 **Migration Steps**

### **Step 1: Backup Your Data (If You Have Existing Jobs)**
```bash
# Export existing jobs to CSV
pnpm db:studio
# In Prisma Studio: Select all jobs → Export
```

### **Step 2: Run Database Migration**
```bash
pnpm db:push
```

**Expected output:**
```
Warnings:
⚠️ You are about to add the following fields to the `jobs` table:
  - aboutCompany
  - dateOfVisit
  - hiringStartsOn
  ... (and many more)

⚠️ You are about to create the following tables:
  - job_workflow_stages
  - job_attachments
  - job_notices
  - job_logs

? Do you want to continue? › (y/N)
```

Type `y` to continue.

### **Step 3: Verify Migration**
```bash
pnpm db:studio
```

Check that:
- ✅ `jobs` table has new columns
- ✅ New tables are created
- ✅ Existing job data is preserved (with new fields as NULL)

---

## 📊 **New Features Available**

### **1. Enhanced Job Details Page**
Jobs now show:
- **Details Tab**: All job info with eligibility criteria
- **POC Tab**: Contact person information
- **Notice Tab**: Job-specific announcements
- **Logs Tab**: Activity history

### **2. Detailed Eligibility Display**
Jobs show eligibility in table format:
| 10th | 12th | Diploma | Sem | Max Current Arrears | Max History Arrears |
|------|------|---------|-----|---------------------|---------------------|
| 60%  | 60%  | 60%     | -   | 0                   | -                   |

### **3. Hiring Workflow**
Each job can have custom stages:
1. Pre Placement Talk
2. Online Test
3. Group Discussion
4. Technical + HR Interview
5. Offer Rollout

### **4. File Attachments**
Admins can upload:
- Job descriptions (PDF)
- Company presentations
- Additional documents

### **5. Enhanced Stats**
Dashboard now shows:
- Jobs by category (Marque, Dream, Super Dream, Regular)
- Top 50/100/150/200 average CTC
- Highest paid ever

---

## 🎯 **Updated CSV Import Format**

The `jobs.csv` format now supports many more fields:

### **Required Fields** (unchanged):
- company, title, type, category, status

### **New Optional Fields**:
```csv
company,title,type,category,status,ctc,stipend,applyBy,
aboutCompany,dateOfVisit,hiringStartsOn,modeOfVisit,
minCGPA,min10thPercentage,min12thPercentage,minDiplomaPercentage,
maxCurrentArrears,maxHistoryArrears,genderRequirement,eligibilityBranches,
pocName,pocEmail,pocPhone
```

### **Example Enhanced Job Entry**:
```csv
Amazon,SDE Internship,INTERN_LEADS_TO_FTE,SUPER_DREAM,OPEN,19.17 LPA,max 110000/month,2025-10-06,
"Leading cloud computing company",2025-10-15,2025-10-08,PHYSICAL,
7.0,60,60,60,
0,0,ANY,"CSE/IT/ECE/EEE",
"John Doe",john@amazon.com,+91-1234567890
```

---

## 🔄 **Updating Existing Components**

After migration, you'll need to update:

1. **Job Form** (`components/admin/job-form.tsx`)
   - Add tabs: Details, Eligibility, POC, Workflow
   - Forms for all new fields

2. **Job Modal** (`components/jobs/job-modal.tsx`)
   - Add tabs: Details, POC, Notice, Logs
   - Display eligibility table
   - Show workflow stages

3. **Jobs API** (`app/api/jobs/route.ts`)
   - Update to handle new fields
   - Add endpoints for attachments/notices/logs

4. **Dashboard Stats** (`app/api/stats/route.ts`)
   - Calculate category breakdown by CTC ranges
   - Compute Top 50/100/150/200 averages

---

## ⚠️ **Breaking Changes**

1. **JobType enum values changed:**
   - Old: `INTERNSHIP`, `FTE`, `BOTH`
   - New: `SUMMER_INTERN`, `REGULAR_INTERN`, `INTERNSHIP`, `FTE`, `INTERN_PLUS_FTE`, `INTERN_LEADS_TO_FTE`, `BOTH`

   **Action**: Existing jobs with old types will need to be updated

2. **JobCategory enum values changed:**
   - Old: `DREAM`, `SUPER_DREAM`, `CORE`, `OTHER`
   - New: `MARQUE`, `DREAM`, `SUPER_DREAM`, `REGULAR`, `CORE`, `OTHER`

   **Action**: Update job categories based on CTC ranges

---

## 📝 **Post-Migration Tasks**

1. **Update existing jobs** with new categories:
   ```typescript
   // In Prisma Studio or via script:
   // CTC >= 20 LPA → MARQUE
   // CTC 10-20 LPA → SUPER_DREAM
   // CTC 6-10 LPA → DREAM
   // CTC 0-3.9 LPA → REGULAR
   ```

2. **Add workflow stages** to jobs:
   - Go to admin panel
   - Edit each job
   - Add hiring workflow stages

3. **Set eligibility criteria** for jobs:
   - CGPA, percentage requirements
   - Arrears limits
   - Gender requirements

4. **Add POC information** for active jobs

---

## 🚀 **Ready to Migrate?**

```bash
# 1. Backup (if needed)
pnpm db:studio

# 2. Run migration
pnpm db:push

# 3. Verify
pnpm db:studio

# 4. Start dev server
pnpm dev
```

After migration, your placement dashboard will have all the features from Haveloc portal! 🎉

---

## ❓ **Questions or Issues?**

If you encounter any issues:
1. Check Prisma Studio for schema changes
2. Review migration warnings
3. Verify environment variables are set
4. Check server logs for errors

**Need to rollback?** You'll need to manually reverse changes or restore from backup.
