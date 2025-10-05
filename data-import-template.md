# Data Import Guide

This guide explains how to format your data for import into the Placement Dashboard.

## 📊 Data You Have

### 1. Student Data (300 students)
- name, email, class, phoneno, cgpa

### 2. Job Postings
- Company, Title, Status, Target Branch, Apply By, Type, CTC, Stipend, Date Of Visit

### 3. Historical Placement Data
- Companies visited, students placed, package info

---

## 🗂️ CSV Templates

### Template 1: Jobs Import (`jobs.csv`)

**Required Columns:**
- `company` - Company name (e.g., "Amazon")
- `title` - Job title (e.g., "Software Development Engineer Internship")
- `type` - One of: `INTERNSHIP`, `FTE`, `BOTH`
- `category` - One of: `DREAM`, `SUPER_DREAM`, `CORE`, `OTHER`
- `status` - One of: `OPEN`, `IN_PROGRESS`, `CLOSED`

**Optional Columns:**
- `ctc` - e.g., "19.17 LPA" or "4.00 LPA - 8.00 LPA"
- `stipend` - e.g., "max 110000/month" or "min 40000/month"
- `applyBy` - Format: `YYYY-MM-DD` (e.g., "2025-10-06")
- `eligibility` - e.g., "CSE/IT/ECE/EEE" or "CGPA >= 7.0"
- `location` - e.g., "Bangalore, Remote"
- `link` - Application link URL
- `description` - Job description (can be multi-line)

**Field Mapping from Your Data:**

| Your Field | Our Field | Transformation |
|------------|-----------|----------------|
| Company | company | Direct copy |
| Title | title | Direct copy |
| Type | type | "Intern Leads To Full Time" → `BOTH`<br>"Full Time" → `FTE`<br>"Internship" → `INTERNSHIP` |
| Status | status | "Open For Applications" → `OPEN`<br>"In Progress" → `IN_PROGRESS`<br>"Closed" → `CLOSED` |
| Apply By | applyBy | Convert "6 Oct 2025 by 09:00" → "2025-10-06" |
| CTC | ctc | Direct copy (e.g., "19.17 LPA") |
| Stipend | stipend | Direct copy (e.g., "max 110000/month") |
| Target Branch | eligibility | Direct copy (e.g., "CSE/IT/ECE/EEE") |
| - | category | Infer from CTC:<br>CTC >= 15 LPA → `DREAM`<br>CTC >= 10 LPA → `SUPER_DREAM`<br>CTC >= 5 LPA → `CORE`<br>Otherwise → `OTHER` |

**Example `jobs.csv`:**

```csv
company,title,type,category,status,ctc,stipend,applyBy,eligibility,location,link,description
Amazon,Software Development Engineer Internship,BOTH,DREAM,OPEN,19.17 LPA,max 110000/month,2025-10-06,CSE/IT/ECE/EEE,Bangalore,"","SDE intern with PPO opportunity"
Prodapt,Software Engineer,FTE,CORE,OPEN,4.00 LPA - 8.00 LPA,,2025-10-06,CSE/IT,Multiple locations,"",""
Siemens,AI Development Intern,BOTH,CORE,OPEN,5.00 LPA+,min 40000/month,2025-10-03,CSE/IT,Remote,"",""
McKinsey & Company,Junior Capabilities and Insights Analyst,BOTH,SUPER_DREAM,OPEN,12.00 LPA,max 75000/month,2025-10-02,CSE/IT/ECE/EEE,Asia,"",""
Oracle Financial Services Software Limited (OFSS),Associate Consultant,FTE,CORE,OPEN,6.62 LPA,,2025-09-29,CSE/IT/ECE/EEE,Bangalore,"",""
```

---

### Template 2: Events Import (`events.csv`)

**Required Columns:**
- `title` - Event title (e.g., "Amazon Campus Drive")
- `startTime` - Format: `YYYY-MM-DD HH:MM` (e.g., "2025-10-15 10:00")
- `endTime` - Format: `YYYY-MM-DD HH:MM` (e.g., "2025-10-15 17:00")
- `category` - One of: `PLACEMENT`, `EXAM`, `INFO_SESSION`, `OA`, `INTERVIEW`, `DEADLINE`, `OTHER`

**Optional Columns:**
- `description` - Event description
- `link` - Event link (Zoom, Teams, etc.)

**Field Mapping from Your Data:**

| Your Field | Our Field | Transformation |
|------------|-----------|----------------|
| Date Of Visit | startTime/endTime | "15th Oct 2025" → "2025-10-15 10:00" and "2025-10-15 17:00" |
| Company + " Campus Drive" | title | "Amazon Campus Drive" |
| - | category | Default to `PLACEMENT` for company visits |

**Example `events.csv`:**

```csv
title,description,startTime,endTime,category,link
Amazon Campus Drive,Pre-placement talk and online assessment,2025-10-15 10:00,2025-10-15 17:00,PLACEMENT,
Prodapt Campus Drive,Technical rounds and HR interview,2025-10-08 09:00,2025-10-08 18:00,PLACEMENT,
Amazon Application Deadline,Last date to apply for Amazon SDE Internship,2025-10-06 09:00,2025-10-06 09:00,DEADLINE,
McKinsey Application Deadline,Last date to apply for McKinsey Analyst role,2025-10-02 23:59,2025-10-02 23:59,DEADLINE,
```

---

## 🔧 Import Scripts

I'll create a bulk import script for you.

### Usage:

1. **Prepare your CSV files** following the templates above
2. **Place them in a `data/` folder** in the project root
3. **Run the import script:**
   ```bash
   pnpm import-jobs data/jobs.csv
   pnpm import-events data/events.csv
   ```

---

## 📝 Notes on Student Data

Your student data (name, email, class, phoneno, cgpa) is valuable but we don't currently have a `Student` model in the database. Here are your options:

### Option 1: Add Student Model (Recommended for Full Tracking)
If you want to track which students applied to which jobs, you'll need:
- Add `Student` model to Prisma schema
- Add `Application` model to track student-job relationships
- This enables features like:
  - "Who applied to Amazon?"
  - "What's the average CGPA of placed students?"
  - Student-specific dashboards

### Option 2: Use Tracker with LocalStorage (Current Implementation)
- Students track their own applications locally
- No need to modify database
- Privacy-friendly (no central tracking)

### Option 3: Store Student CSV for Reference Only
- Keep student data in a separate file
- Use it for eligibility checks manually
- No database changes needed

**Would you like me to add a Student model and tracking system?**

---

## 🎯 Recommended Next Steps

1. **Prepare `jobs.csv`** with your 5 current job postings (and any others)
2. **Prepare `events.csv`** with campus visit dates and application deadlines
3. **Run import scripts** (I'll create these next)
4. **Test the dashboard** to see jobs and events populated
5. **Decide on student tracking** (do you want Option 1, 2, or 3 above?)

Let me know which data files you'd like to prepare first, and I can help format them correctly!
