# Student Model & Data Import Summary

## 🎯 Overview

Successfully created a comprehensive Student management system with placement tracking capabilities.

## 📊 Database Schema Updates

### New Models Added

#### 1. **Student Model**
Tracks student information, academic details, and placement status.

```prisma
model Student {
  // Personal Information
  name, rollNumber (unique), email, mobile

  // Academic Details
  department, batch, section, cgpa
  historyOfArrears, currentArrears

  // Placement Status
  placementStatus: OPTED_IN | OPTED_OUT | HIGHER_STUDIES | PLACED | PLACED_FINAL
  canSitForMore: boolean

  // Current/Final Placement
  finalPlacedCompany, finalPlacedJobTitle, finalPlacedCTC, finalPlacedJobType, finalPlacedDate

  // Relations
  placements: StudentPlacement[]
}
```

#### 2. **StudentPlacement Model**
Tracks all placement offers received by students (allows tracking multiple offers).

```prisma
model StudentPlacement {
  studentId, jobId
  company, jobTitle, ctc, stipend, jobType
  offerDate, offerStatus (PENDING/ACCEPTED/REJECTED)
  isAccepted: boolean
  notes
}
```

#### 3. **PlacementStatus Enum**
- `OPTED_IN`: Student is participating in placements
- `OPTED_OUT`: Student is not participating
- `HIGHER_STUDIES`: Student opted for higher studies
- `PLACED`: Student placed (can sit for <=2x CTC if current CTC <=6L)
- `PLACED_FINAL`: Student placed and not eligible for more

### Placement Eligibility Rule

**Important Business Logic**:
- If student is placed with CTC **≤ 6 LPA**, they can sit for companies offering **≤ 2x their current CTC**
- Field `canSitForMore` tracks this eligibility
- When CTC > 6 LPA or student accepts an offer > 2x, status becomes `PLACED_FINAL`

## 📥 Data Import Results

### SSN Job Data Import

**Source**: `raw_data/SSN Placement Data - Sheet1.csv`

| Metric | Count |
|--------|-------|
| Total CSV Rows | 51 |
| Filtered (SNU Included + SNU Company) | 7 |
| Successfully Imported | 7 |
| Failed | 0 |

**Filter Criteria**:
- ✅ **SNU Included**
- ✅ **SNU Company**
- ❌ **SNU Not Included** (excluded)
- ❌ **Before Merger** (excluded)

**Imported Jobs**:
1. **Prodapt** - Software Engineer (4-8 LPA, OTHER, OPEN)
2. **Poshmark** - Software Development (10 LPW, SUPER_DREAM, CLOSED)
3. **Kyndryl** - Infrastructure Specialists (5.2 LPA, OTHER, IN_PROGRESS)
4. **LTIMindtree** - Graduate Engineer Trainee (4.05 LPA, OTHER, IN_PROGRESS)
5. **Cprime** - Apprentice + Full time Employment (6 LPA, DREAM, CLOSED)
6. **Presidio** - Associate Engineer (10 LPA, SUPER_DREAM, IN_PROGRESS)
7. **Encora Innovation labs** - Software Developer (6 LPA, DREAM, IN_PROGRESS)

### Student Data Import

**Source**: `raw_data/BTech AIDS (A) 2026 batch(BTech AIDS (A) 2026 batch).csv`

| Metric | Count |
|--------|-------|
| Valid Student Rows | 63 |
| Successfully Imported | 63 |
| Skipped (Duplicates) | 0 |
| Failed | 0 |

**Student Details**:
- **Department**: BTech AIDS
- **Section**: A
- **Batch**: 2022-2026
- **Default Status**: OPTED_IN
- **Eligibility**: canSitForMore = true

**Sample Imported Students**:
- A KESHAV (22110172) - CGPA: 9.101
- ADVIKA LAKSHMAN (22110112) - CGPA: 8.938
- LAKSHANIKA S (22110120) - CGPA: 9.054
- MADHESH HARIHARRAN S (22110025) - CGPA: 8.512

## 🛠️ Import Scripts

### 1. SSN Jobs Import
```bash
pnpm import-ssn-jobs

# Or specify custom path
pnpm tsx scripts/import-ssn-jobs.ts path/to/custom.csv
```

**Features**:
- Auto-filters for "SNU Included" and "SNU Company" status
- Intelligent job type mapping (Intern + Full Time → INTERN_PLUS_FTE)
- Automatic CTC-based category assignment (MARQUE/SUPER_DREAM/DREAM/OTHER/REGULAR)
- Smart date parsing (handles "6 Oct 2025 by 09:00" and "15th Oct 2025" formats)
- Duplicate header detection and handling

### 2. Student Data Import
```bash
pnpm import-students "raw_data/BTech AIDS (A) 2026 batch(BTech AIDS (A) 2026 batch).csv"
```

**Features**:
- Auto-detects header row (skips institutional headers)
- Extracts section from filename (e.g., "(A)" → section = "A")
- Parses batch from roll number (22110172 → 2022-2026)
- Handles missing/null CGPA and arrears data gracefully
- Duplicate prevention (checks rollNumber uniqueness)
- Auto-determines department from filename and CSV data

## 📁 Available Data Files

### Student CSVs (All in `raw_data/`)
1. `BTech AIDS (A) 2026 batch(BTech AIDS (A) 2026 batch).csv` ✅ **IMPORTED**
2. `BTech AIDS (B) 2026 batch 1(BTech AIDS (B) 2026 batch).csv`
3. `BTech CSE Cyber Security 2026 batch(BTech CSE (CS) 2026 batch).csv`
4. `BTech CSE IoT (A) 2026 batch(BTech CSE IoT (A) 2026 batch).csv`
5. `BTech CSE IoT (B) 2026 batch(BTech CSE IoT (B) 2026 batch).csv`

### To Import All Students

```bash
# Import all sections
pnpm import-students "raw_data/BTech AIDS (B) 2026 batch 1(BTech AIDS (B) 2026 batch).csv"
pnpm import-students "raw_data/BTech CSE Cyber Security 2026 batch(BTech CSE (CS) 2026 batch).csv"
pnpm import-students "raw_data/BTech CSE IoT (A) 2026 batch(BTech CSE IoT (A) 2026 batch).csv"
pnpm import-students "raw_data/BTech CSE IoT (B) 2026 batch(BTech CSE IoT (B) 2026 batch).csv"
```

## 🎯 Next Steps

### Admin UI Features Needed

1. **Students Management Tab** in Admin Panel
   - List all students with filters (department, section, batch, placement status)
   - Search by name/roll number
   - Edit student details (email, mobile, CGPA)
   - Update placement status (OPTED_IN/OPTED_OUT/HIGHER_STUDIES)

2. **Placement Mapping**
   - Mark student as placed (select job, enter CTC/details)
   - Auto-calculate `canSitForMore` based on CTC (≤6L rule)
   - Track multiple offers per student
   - Accept/reject offers
   - Auto-update status to PLACED_FINAL when appropriate

3. **Eligibility Checker**
   - View which students are eligible for a specific job
   - Filter by CGPA, arrears, department, placement status
   - Bulk actions (mark as applied, shortlisted, etc.)

4. **Analytics Dashboard**
   - Placement statistics (placed vs not placed)
   - Department-wise placement breakdown
   - Average CTC by department
   - Top recruiting companies

## 📊 Current Database State

| Entity | Count |
|--------|-------|
| Jobs | 7 |
| Events | 0 |
| Students | 63 |
| Student Placements | 0 |

**Students by Status**:
- OPTED_IN: 63
- OPTED_OUT: 0
- HIGHER_STUDIES: 0
- PLACED: 0
- PLACED_FINAL: 0

All imported students are currently marked as `OPTED_IN` and `canSitForMore = true`.

## 🔗 API Endpoints (To Be Created)

- `GET /api/students` - List students with filters
- `GET /api/students/[id]` - Get student details
- `PUT /api/students/[id]` - Update student info
- `POST /api/students/[id]/placements` - Add placement offer
- `PUT /api/students/[id]/placements/[placementId]` - Accept/reject offer
- `GET /api/students/[id]/eligibility` - Check job eligibility
- `GET /api/students/stats` - Placement analytics

##  Database Schema Location

**File**: `prisma/schema.prisma`
**Last Updated**: Added Student and StudentPlacement models with placement eligibility logic

Run `pnpm db:studio` to view all data in Prisma Studio GUI.
