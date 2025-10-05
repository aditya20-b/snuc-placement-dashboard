# SSN Placement Data Import Summary

## Overview
Successfully imported SSN placement data from `raw_data/SSN Placement Data - Sheet1.csv` into the database.

## Import Statistics

**Total CSV Rows:** 51
**Filtered Rows:** 7 (only "SNU Included" and "SNU Company")
**Successfully Imported:** 7 jobs
**Failed:** 0

## Filter Criteria

Only jobs with the following status values were imported:
- ✅ **SNU Included**
- ✅ **SNU Company**

Excluded status values:
- ❌ **SNU Not Included**
- ❌ **Before Merger**

## Imported Jobs

| Company | Title | CTC | Type | Category | Status |
|---------|-------|-----|------|----------|--------|
| Prodapt | Software Engineer | 4.00 LPA - 8.00 LPA | FTE | OTHER | OPEN |
| Poshmark | Software Development | 10.00 LPW | INTERN_PLUS_FTE | SUPER_DREAM | CLOSED |
| Kyndryl | Infrastructure Specialists | 5.20 LPA | FTE | OTHER | IN_PROGRESS |
| LTIMindtree | Graduate Engineer Trainee | 4.05 LPA | FTE | OTHER | IN_PROGRESS |
| Cprime | Apprentice + Full time Employment | 6.00 LPA | INTERN_PLUS_FTE | DREAM | CLOSED |
| Presidio | Associate Engineer | 10.00 LPA | INTERN_PLUS_FTE | SUPER_DREAM | IN_PROGRESS |
| Encora Innovation labs | Software Developer | 6.00 LPA | FTE | DREAM | IN_PROGRESS |

## Data Mapping

### CSV → Database Schema

The import script automatically mapped CSV columns to the database schema:

| CSV Column | Database Field | Notes |
|------------|---------------|-------|
| Company | `company` | Direct mapping |
| Title | `title` | Direct mapping |
| CTC | `ctc` | Preserved as-is |
| Stipend | `stipend` | Preserved as-is |
| Type | `type` | Mapped to JobType enum |
| Status (column 9) | `status` | Mapped to JobStatus enum |
| Apply By | `applyBy` | Parsed to DateTime |
| Date Of Visit | `dateOfVisit` | Parsed to DateTime |
| Target Branch | `eligibilityBranches` | E.g., "CSE/IT" |

### Intelligent Mapping

**1. Job Type Mapping (CSV → JobType Enum)**
- "Full Time" → `FTE`
- "Intern + Full Time" → `INTERN_PLUS_FTE`
- "Intern Leads To Full Time" → `INTERN_LEADS_TO_FTE`
- "Summer Intern" → `SUMMER_INTERN`
- "Regular Intern" → `REGULAR_INTERN`

**2. Job Status Mapping (CSV → JobStatus Enum)**
- "Open For Applications" → `OPEN`
- "In Progress" → `IN_PROGRESS`
- "Closed For Applications" → `CLOSED`

**3. Automatic Category Assignment (Based on CTC)**
- **MARQUE:** 20+ LPA
- **SUPER_DREAM:** 10-20 LPA (e.g., Poshmark, Presidio)
- **DREAM:** 6-10 LPA (e.g., Cprime, Encora)
- **OTHER:** 4-6 LPA (e.g., Prodapt, Kyndryl, LTIMindtree)
- **REGULAR:** 0-3.9 LPA

**4. Date Parsing**
The script intelligently parses various date formats:
- "6 Oct 2025 by 09:00" → Oct 6, 2025
- "15th Oct 2025" → Oct 15, 2025
- Automatically strips ordinal indicators (st, nd, rd, th)

## How to Re-run the Import

If you need to import SSN data again:

```bash
# Run the import script
pnpm import-ssn-jobs

# Or specify a custom CSV path
pnpm tsx scripts/import-ssn-jobs.ts path/to/custom.csv
```

## Script Location

**Import Script:** `scripts/import-ssn-jobs.ts`
**Package.json Command:** `import-ssn-jobs`

## Notes

1. **Duplicate Status Columns:** The CSV has two "Status" columns:
   - Column 3: SNU inclusion status (used for filtering)
   - Column 9: Application status (mapped to job status)

2. **Data Quality:**
   - All 7 jobs imported successfully with no errors
   - Date fields were correctly parsed
   - CTC categories were automatically assigned
   - Job types were correctly mapped

3. **Missing Data:**
   - Some jobs have no "Date of Visit" (set to null)
   - Location field not present in CSV (null)
   - Link field not present in CSV (null)

4. **Future Imports:**
   - The script is designed to handle the SSN CSV format
   - It will automatically filter for "SNU Included" and "SNU Company"
   - You can modify the script if column names or format changes

## Verification

The imported jobs are now visible in:
- **Jobs Page:** http://localhost:3001/jobs
- **Admin Panel:** http://localhost:3001/admin (Jobs Management tab)
- **API Endpoint:** http://localhost:3001/api/jobs

All jobs include proper categorization, status tracking, and eligibility information based on the source data.
