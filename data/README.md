# Data Import Instructions

## 🚀 Quick Start

### 1. Prepare Your CSV Files

Use the sample files provided as templates:
- `jobs-sample.csv` - Example job listings
- `events-sample.csv` - Example events

Copy these files and rename them to create your own:
```bash
cp jobs-sample.csv jobs.csv
cp events-sample.csv events.csv
```

Then edit `jobs.csv` and `events.csv` with your actual data.

### 2. Import Jobs

```bash
pnpm import-jobs data/jobs.csv
```

Expected output:
```
📂 Reading CSV file: data/jobs.csv
📊 Parsing CSV data...
✅ Found 5 jobs to import

✅ [1/5] Imported: Amazon - Software Development Engineer Internship
✅ [2/5] Imported: Prodapt - Software Engineer
...

📊 Import Summary:
   ✅ Successfully imported: 5
   ❌ Failed: 0
   📝 Total rows: 5
```

### 3. Import Events

```bash
pnpm import-events data/events.csv
```

### 4. Verify in Database

```bash
pnpm db:studio
```

This opens Prisma Studio where you can view all imported data.

---

## 📋 Detailed CSV Format Guide

### Jobs CSV Format

**Required columns:**
- `company` - Company name
- `title` - Job title
- `type` - One of: `INTERNSHIP`, `FTE`, `BOTH`
- `category` - One of: `DREAM`, `SUPER_DREAM`, `CORE`, `OTHER`
- `status` - One of: `OPEN`, `IN_PROGRESS`, `CLOSED`

**Optional columns:**
- `ctc` - e.g., "19.17 LPA" or "4-8 LPA"
- `stipend` - e.g., "max 110000/month"
- `applyBy` - Format: `YYYY-MM-DD` (e.g., "2025-10-06")
- `eligibility` - e.g., "CSE/IT/ECE/EEE" or "CGPA >= 7.0"
- `location` - e.g., "Bangalore, Remote"
- `link` - Application URL
- `description` - Job description

**Category Guidelines:**
- `DREAM`: CTC >= 15 LPA
- `SUPER_DREAM`: CTC >= 10 LPA
- `CORE`: CTC >= 5 LPA
- `OTHER`: < 5 LPA or non-technical roles

### Events CSV Format

**Required columns:**
- `title` - Event name
- `startTime` - Format: `YYYY-MM-DD HH:MM` (e.g., "2025-10-15 10:00")
- `endTime` - Format: `YYYY-MM-DD HH:MM`
- `category` - One of: `PLACEMENT`, `EXAM`, `INFO_SESSION`, `OA`, `INTERVIEW`, `DEADLINE`, `OTHER`

**Optional columns:**
- `description` - Event details
- `link` - Meeting link (Zoom, Teams, etc.)

**Category Guide:**
- `PLACEMENT` - Campus drives, company visits
- `DEADLINE` - Application deadlines
- `OA` - Online assessments
- `INTERVIEW` - Interview rounds
- `INFO_SESSION` - Pre-placement talks
- `EXAM` - Written tests

---

## 🔄 Converting Your Data

### From Your Format to Our Format

**Your job data has:**
```
Company | Title | Status | Target Branch | Apply By | Type | CTC | Stipend | Date Of Visit
```

**Map it to our CSV:**

| Your Column | Our Column | Notes |
|-------------|------------|-------|
| Company | `company` | Direct copy |
| Title | `title` | Direct copy |
| Type | `type` | "Intern Leads To Full Time" → `BOTH`<br>"Full Time" → `FTE`<br>"Internship" → `INTERNSHIP` |
| Status | `status` | "Open For Applications" → `OPEN` |
| Apply By | `applyBy` | Convert "6 Oct 2025" → "2025-10-06" |
| CTC | `ctc` | Direct copy |
| Stipend | `stipend` | Direct copy |
| Target Branch | `eligibility` | Direct copy |
| Date Of Visit | → Create Event | See events CSV |

**Example conversion:**

Your data:
```
Amazon | Software Development Engineer Internship | SNU Not Included | CSE/IT/ECE/EEE | 6 Oct 2025 by 09:00 | Intern Leads To Full Time | 19.17 LPA | max 110000/month | Open For Applications | 15th Oct 2025
```

Our jobs.csv:
```csv
company,title,type,category,status,ctc,stipend,applyBy,eligibility
Amazon,Software Development Engineer Internship,BOTH,DREAM,OPEN,19.17 LPA,max 110000/month,2025-10-06,CSE/IT/ECE/EEE
```

Our events.csv:
```csv
title,description,startTime,endTime,category
Amazon Campus Drive,Pre-placement talk and assessments,2025-10-15 10:00,2025-10-15 17:00,PLACEMENT
Amazon Application Deadline,Last date to apply,2025-10-06 09:00,2025-10-06 09:00,DEADLINE
```

---

## ⚠️ Common Issues

### Issue: "Invalid type" error
**Solution:** Check that `type` column uses exactly: `INTERNSHIP`, `FTE`, or `BOTH` (all caps)

### Issue: "Invalid date format" error
**Solution:** Use format `YYYY-MM-DD` for dates, e.g., "2025-10-06" not "6 Oct 2025"

### Issue: CSV parsing errors
**Solution:**
- Ensure no extra commas in description fields
- Use quotes around fields with commas: `"Bangalore, Remote"`
- Save file as UTF-8 encoding

### Issue: Missing required fields
**Solution:** Verify all required columns are present and filled

---

## 🎯 Next Steps After Import

1. **View the dashboard:**
   ```bash
   pnpm dev
   ```
   Visit http://localhost:3000/dashboard

2. **Check jobs page:**
   Visit http://localhost:3000/jobs

3. **Check calendar:**
   Visit http://localhost:3000/calendar

4. **Admin panel:**
   - Login at http://localhost:3000/sign-in
   - Manage jobs and events at http://localhost:3000/admin

---

## 📞 Need Help?

- Check `data-import-template.md` for detailed documentation
- View `jobs-sample.csv` and `events-sample.csv` for examples
- Run `pnpm db:studio` to inspect database directly
