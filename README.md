# CampusPlacement AI

CampusPlacement AI is a college placement-management, analytics, reporting, and AI-assistance platform. It allows a super administrator to manage colleges and college administrators, allows a college administrator/TPO to manage student and placement data, and provides a read-only parent/student view for a selected college.

## Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Repository Structure](#repository-structure)
4. [Roles And Access](#roles-and-access)
5. [Application Sections](#application-sections)
6. [Data Flow](#data-flow)
7. [Prerequisites](#prerequisites)
8. [Installation](#installation)
9. [Environment Configuration](#environment-configuration)
10. [Running The Services](#running-the-services)
11. [Database](#database)
12. [Backend API](#backend-api)
13. [AI Service API](#ai-service-api)
14. [Student Data Fields](#student-data-fields)
15. [Reports And Imports](#reports-and-imports)
16. [Security And Access Rules](#security-and-access-rules)
17. [Validation And Troubleshooting](#validation-and-troubleshooting)
18. [Known Limitations](#known-limitations)

## System Overview

The project is split into three services:

```text
React/Vite frontend :3000
				|
				v
Express backend API :5000
				|
				+--> PostgreSQL database :5432
				|
				+--> Python AI service :8001
```

The frontend does not connect directly to PostgreSQL or the Python AI service. The backend owns authentication, database access, authorization, reporting, and the proxy connection to the AI service.

## Technology Stack

### Frontend

- React 18
- Vite 5
- React Router 6
- Axios
- Chart.js and `react-chartjs-2`
- Recharts
- React Icons
- React Hot Toast
- Framer Motion
- Papa Parse for CSV import
- ExcelJS and XLSX for spreadsheet export/import support
- jsPDF and jsPDF AutoTable for PDF reports
- File Saver
- Tailwind CSS, PostCSS, and Autoprefixer are included in the package configuration

### Backend

- Node.js
- Express
- Sequelize ORM
- PostgreSQL through `pg` and `pg-hstore`
- JWT authentication with `jsonwebtoken`
- Password hashing with `bcryptjs`
- Joi request validation
- Helmet security headers
- CORS
- Compression
- Express Rate Limit
- Multer for uploaded files
- Nodemailer for email flows
- Winston logging
- ExcelJS for reports

### AI Service

- Python 3.12 is used by the Docker image; Python 3.13+ may also work locally when compatible wheels are available
- Standard-library `http.server`
- pandas
- NumPy
- scikit-learn
- joblib
- pypdf for PDF text extraction
- A serialized scikit-learn pipeline at `ai-service/models/placement_model.joblib`

### Database

- PostgreSQL
- Sequelize models and associations
- `backend/sync.js` uses `sequelize.sync({ alter: true })` to create/update tables without intentionally dropping existing data

## Repository Structure

```text
campusplacement-ai/
|-- frontend/
|   |-- src/
|   |   |-- components/       Shared UI, layouts, authentication, prediction widgets
|   |   |-- context/          Shared student, placement, dashboard state
|   |   |-- pages/            Routed application pages
|   |   |-- services/         Axios API clients
|   |   |-- App.jsx           Frontend routes
|   |   `-- main.jsx          React entry point
|   |-- package.json
|   `-- vite.config.js
|-- backend/
|   |-- src/
|   |   |-- app.js            Express application and route registration
|   |   |-- config/            Database and JWT configuration
|   |   |-- controllers/       Request handlers and business logic
|   |   |-- middleware/        Auth, validation, error handling
|   |   |-- models/            Sequelize models and associations
|   |   |-- routes/            API route definitions
|   |   `-- services/          AI proxy and supporting services
|   |-- sync.js                Safe schema synchronization and super-admin bootstrap
|   |-- package.json
|   `-- .env                   Local environment values; do not commit secrets
|-- ai-service/
|   |-- app.py                 Python HTTP server
|   |-- models/                ML model wrapper and serialized model
|   |-- requirements.txt
|   |-- Dockerfile
|   `-- train.py               Model training script
|-- database/
|   |-- migrations/            Migration placeholders
|   `-- seed/                  Seed directory
|-- docker-compose.yml         AI service container definition
`-- README.md
```

## Roles And Access

### Super Admin

The super admin is the platform-level administrator.

Capabilities:

- View all colleges.
- Review college registration requests.
- Approve or reject colleges.
- Create and manage college admin accounts.
- Reset admin passwords.
- Delete admin accounts.
- View platform-level college statistics.

Routes:

- `/super-admin/colleges`
- `/super-admin/admins`
- `/super-admin/requests`
- `/super-admin/stats`

### College Admin / TPO

The college admin is scoped to one `college_id`.

Capabilities:

- View the selected college's dashboard and analytics.
- Add, edit, and delete students.
- Import students from CSV.
- Manage placement and offer data.
- Run AI Predictions.
- Run What-If simulations.
- Review at-risk students.
- Use Trend Forecast.
- Use Skill Gap Analyzer.
- Use Company Match.
- Analyze resumes.
- Generate reports and exports.

All admin-created student records are assigned to the admin's college by the backend. The client must not be trusted to change this scope.

### Parent / Student View

The current UI represents this as a guest, view-only flow rather than a fully provisioned account flow.

Capabilities:

- Select one active college at entry.
- View only that college's student and placement analytics.
- View Placement Overview.
- View Package Distribution.
- View Branch Analytics.
- View Company Analytics.
- View Multiple Offers.
- View Career Paths.
- View Student Profiles.

Restrictions:

- No student creation, editing, deletion, or CSV upload.
- No AI prediction administration tools.
- No college dropdown inside the application after selection.
- No switching between colleges without logging out and returning to the initial college-selection screen.

The selected college ID is stored in browser storage as `collegeId` and is used for view-only requests.

### Registered `parent` And `student` User Roles

The Sequelize `User` model includes `parent` and `student` role values. The current login UI primarily exposes the no-login Parent/Student path, which behaves as a selected-college guest view. If real parent/student accounts are enabled later, they should be assigned a valid `users.college_id` and restricted to that college on the server.

## Application Sections

### Placement Overview

Route: `/app/dashboard`

Displays:

- Total students.
- Placed, unplaced, and at-risk counts.
- Placement percentage.
- Average and highest package.
- Five-year trend chart.
- Monthly Placement Progress.
- Branch-wise placement chart.
- Career path distribution.

The monthly chart uses `placements.offer_date` grouped into the July-to-June academic year. If no dated placement records exist, the current placed-student count is placed in the current academic-month bucket so the chart is not blank.

### Package Distribution

Route: `/app/packages`

Uses placed student records and package values to display:

- Total offers.
- Average package.
- Median package.
- Highest package.
- Package ranges.
- Company-wise package analysis.

### Branch Analytics

Route: `/app/branches`

Uses student branch, placement status, and package values to display:

- Branch placement rate.
- Branch average package.
- Branch ranking.
- Total, placed, and unplaced students by branch.

### Company Analytics

Route: `/app/companies`

Uses placed student company values to display:

- Companies represented.
- Selected students.
- Conversion-style metrics.
- Company recruitment funnel.

Some application totals are estimated in the current UI because the student schema does not contain a complete applications/shortlists table for every company.

### Multiple Offers

Route: `/app/offers`

Uses placement records grouped by `student_id` to display:

- Students with one offer.
- Students with two offers.
- Students with three offers.
- Students with four or more offers.
- Offer distribution.
- Package versus offer count.

### Career Paths

Route: `/app/career`

Uses the student `career_path` field. Supported values are:

- `placed`
- `higher_studies`
- `entrepreneurship`
- `govt_exam_prep`
- `other`

Admins assign the career path when adding or editing a student. CSV import also supports a Career Path column. Existing records without a value fall back to `placed` when their placement status is placed, otherwise `other`.

### Student Profiles

Route: `/app/students`

Displays college-scoped student cards with:

- Name and roll number.
- Branch and batch.
- CGPA.
- Placement status.
- Company and package.
- Highest offer.
- Search and branch/status filtering.

### Student Management

Route: `/app/student-management`

Admin-only data-management surface for:

- Adding students.
- Editing students.
- Deleting students.
- CSV bulk import.
- Career path assignment.
- Skills entry.
- Placement status, company, package, and academic fields.

The skills field accepts comma-separated values, for example:

```text
Data Structures, DBMS, Communication, React
```

### Reports

Route: `/app/reports`

Provides report and export workflows for student and placement information. The frontend includes PDF, Excel, and CSV-related dependencies.

### AI Predictions

Route: `/app/prediction`

The AI Predictions page contains these tabs:

#### Placement Predictor

- Selects a student from the database.
- Loads that student's profile values.
- Sends the profile to the backend.
- Backend calls the Python `/predict` endpoint.
- Displays probability, risk label, recommendations, and suitable companies.

#### What-If Simulator

- Selects a database student.
- Uses the current profile as the baseline.
- Sends a current profile and an improved profile to the AI service.
- Compares the resulting probabilities.
- The improved scenario raises CGPA to at least 8.0, coding score to at least 700, and internships to at least 1.

#### At-Risk Detection

Risk thresholds:

- Probability below 40: High Risk.
- Probability from 40 through 69: Medium Risk.
- Probability 70 or above: Low Risk.

Placed students are treated as Low Risk with a 90% probability when no stored prediction is available. Other students use their stored prediction or a profile-based fallback using CGPA, coding, internships, attendance, projects, communication, and branch.

#### Trend Forecast

- Uses the selected college's student and placement data.
- Calculates current placement rate.
- Calculates average package from placed students.
- Projects the next placement rate.
- Calculates expected recruiters.

#### Skill Gap Analyzer

- Selects a database student.
- Loads saved skills.
- Allows additional manual skills.
- Supports comma-separated manual entry.
- Matches skills case-insensitively.
- Compares skills with target-company requirements.
- Returns missing skills and a learning plan through the AI service.

Supported target companies include Google, Amazon, Microsoft, TCS, and Infosys.

#### Company Match

- Selects a database student.
- Uses CGPA, coding score, internships, communication, and saved skill count.
- Returns best-fit and stretch-company recommendations.

#### Resume Analyzer

- Accepts a PDF upload.
- Backend forwards the PDF bytes to the AI service.
- AI service extracts text with `pypdf`.
- ATS score and missing keywords are calculated from detected resume content.

## Data Flow

### Authentication

```text
Login form
	-> POST /api/auth/login
	-> AdminAccount or User lookup
	-> JWT returned
	-> frontend stores token, role, and collegeId
```

### College Admin Student Creation

```text
Admin form or CSV
	-> POST /api/students or POST /api/students/bulk
	-> requireAdmin middleware
	-> backend assigns req.user.college_id
	-> Student row saved in PostgreSQL
```

### Parent/Student College View

```text
College selection
	-> localStorage.collegeId
	-> GET /api/students?college_id=<selected college>
	-> backend filters by college_id
	-> view-only analytics render the returned records
```

### AI Prediction

```text
Database student
	-> frontend predictor
	-> POST /api/predictions/placement
	-> backend POST http://localhost:8001/predict
	-> placement_model.joblib
	-> probability and recommendations
```

## Prerequisites

Install the following before setup:

- Git
- Node.js 18 or newer
- npm
- Python 3.12 recommended for parity with Docker
- PostgreSQL 14 or newer
- Optional: Docker Desktop and Docker Compose

Verify installations:

```powershell
node --version
npm --version
python --version
psql --version
docker --version
```

## Installation

Clone or open the project, then install dependencies in each service.

### Frontend dependencies

```powershell
cd frontend
npm install
```

### Backend dependencies

```powershell
cd ..\backend
npm install
```

### AI service dependencies

```powershell
cd ..\ai-service
python -m pip install -r requirements.txt
```

### PostgreSQL database

Create a database named `campusplacement`, or use another name and update the backend environment variables:

```sql
CREATE DATABASE campusplacement;
```

## Environment Configuration

Create or update `backend/.env` locally. Do not copy real passwords, SMTP credentials, or JWT secrets into README files or Git.

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=campusplacement
DB_USER=postgres
DB_PASSWORD=your-postgres-password

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
AI_SERVICE_URL=http://127.0.0.1:8001

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@example.com
EMAIL_REPLY_TO=your-email@example.com

SUPER_ADMIN_EMAIL=superadmin@campusplacement.ai
SUPER_ADMIN_PASSWORD=change-this-password
```

The frontend defaults to:

```text
http://localhost:5000/api
```

If a different backend URL is needed, create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

The AI service binds to all interfaces by default for server use:

```env
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8001
```

Use `localhost`, not `0.0.0.0`, in a browser URL. `0.0.0.0` is a bind address, not a client destination.

## Running The Services

Start PostgreSQL first.

### Terminal 1: AI service

```powershell
cd ai-service
python app.py
```

Expected output:

```text
AI service running on http://0.0.0.0:8001
```

Verify it from another terminal:

```powershell
Invoke-RestMethod http://localhost:8001/health
```

### Terminal 2: Backend

```powershell
cd backend
npm run sync
npm run dev
```

The sync command creates missing tables/columns using Sequelize alter synchronization and creates the default super-admin when absent. It is intended for local development. Review production migration strategy before using `alter: true` in production.

Expected backend URLs:

```text
Frontend API: http://localhost:5000/api
Health check: http://localhost:5000/api/health
```

### Terminal 3: Frontend

```powershell
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production frontend preview

```powershell
cd frontend
npm run build
npm run preview
```

### Docker AI service

The root Compose file currently starts only the AI service:

```powershell
docker compose up --build ai-service
```

PostgreSQL, backend, and frontend still need to be installed/run separately unless the Compose configuration is expanded.

## Database

Important Sequelize models include:

- `College`: registered colleges, approval state, profile information.
- `AdminAccount`: college admin credentials and college scope.
- `User`: super-admin and user-role accounts.
- `Student`: student profile, academic metrics, placement status, career path, skills, college scope.
- `Placement`: offers, dates, package, status, company, and college scope.
- `Company`: recruiter/company information.

Important Student fields:

- `roll_number`
- `name`
- `email`
- `phone`
- `branch`
- `batch`
- `cgpa`
- `attendance_percentage`
- `coding_score`
- `communication_score`
- `projects_count`
- `internships_count`
- `company`
- `package`
- `placement_status`
- `predicted_probability`
- `highest_offer`
- `career_path`
- `skills`
- `college_id`
- `created_by`

The database migration SQL files are currently placeholders. For local development, use `npm run sync` from `backend`. Existing data should be backed up before schema changes.

## Backend API

Base URL:

```text
http://localhost:5000/api
```

### Authentication

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/contact-super-admin`

### Colleges

- `GET /colleges`
- `GET /colleges/:id`
- `POST /colleges`
- `PUT /colleges/:id`
- `DELETE /colleges/:id`
- `POST /colleges/register`
- `PUT /colleges/approve/:id`
- `PUT /colleges/reject/:id`
- `GET /colleges/requests`
- `GET /colleges/requests/pending`
- `GET /colleges/admins`
- `POST /colleges/admins`
- `PUT /colleges/admins/:id/reset-password`
- `DELETE /colleges/admins/:id`

### Students

- `GET /students`
- `GET /students/:id`
- `GET /students/college/:collegeId`
- `GET /students/stats`
- `POST /students`
- `POST /students/bulk`
- `PUT /students/:id`
- `DELETE /students/:id`

### Placements and companies

- `GET /placements`
- `GET /placements/stats`
- `POST /placements`
- `PUT /placements/:id`
- `DELETE /placements/:id`
- `GET /companies`
- `GET /companies/:id`
- `GET /companies/stats`
- `POST /companies`
- `PUT /companies/:id`
- `DELETE /companies/:id`

### Dashboard

- `GET /dashboard/stats`
- `GET /dashboard/trends`

### Predictions

- `POST /predictions/placement`
- `POST /predictions/skill-gap`
- `POST /predictions/resume`
- `GET /predictions/companies/:studentId?`
- `GET /predictions/at-risk/:collegeId?`
- `GET /predictions/forecast/:collegeId?`

Prediction routes require admin authorization in the current backend.

## AI Service API

Base URL:

```text
http://localhost:8001
```

### Health

```http
GET /health
```

### Placement prediction

```http
POST /predict
Content-Type: application/json
```

Example body:

```json
{
	"profile": {
		"cgpa": 8.2,
		"coding": 700,
		"internships": 1,
		"attendance": 85,
		"projects": 3,
		"communication": 75,
		"branch": "cse",
		"selectedSkills": ["Data Structures", "DBMS"]
	}
}
```

### Skill gap

```http
POST /skill-gap
Content-Type: application/json
```

```json
{
	"company": "tcs",
	"selectedSkills": ["Communication", "DBMS"]
}
```

### Resume analysis

```http
POST /resume
Content-Type: application/json
```

The backend sends the original filename and the uploaded PDF as `contentBase64`. The AI service extracts text with `pypdf`.

## Reports And Imports

CSV student import supports common column names for:

- Name
- Roll Number
- Branch
- CGPA
- Placement Status
- Career Path
- Skills
- Company
- Package
- Email
- Phone
- Batch

Skills and career paths are stored as part of the student record. Use comma-separated skills in CSV files and in the admin form.

Example:

```csv
Name,Roll Number,Branch,CGPA,Placement Status,Career Path,Skills,Company,Package
Example Student,CS101,CSE,8.2,placed,placed,"Data Structures, DBMS, Communication",TCS,7
```

## Security And Access Rules

- Passwords are hashed with bcrypt.
- JWT tokens are used for authenticated API requests.
- Admin student writes are scoped to the authenticated admin's `college_id`.
- Parent/student selected-college views are read-only.
- Helmet, CORS, compression, request validation, and rate limiting are enabled.
- Development API rate limit is higher than production to support local navigation; production uses the stricter limit.
- Do not commit database passwords, SMTP passwords, JWT secrets, or generated credentials.
- Rotate any credentials that have previously been committed to `backend/.env`.
- Use a production secret manager and a real migration strategy before deployment.

## Validation And Troubleshooting

### Check backend

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

### Check AI service

```powershell
Invoke-RestMethod http://localhost:8001/health
```

### `ModuleNotFoundError: No module named 'joblib'`

Install AI dependencies from the AI service directory:

```powershell
cd ai-service
python -m pip install -r requirements.txt
```

### `ERR_ADDRESS_INVALID` for `http://0.0.0.0:8001`

Open `http://localhost:8001/health` instead. `0.0.0.0` is only used by the server to bind to interfaces.

### `cd ai-service` fails inside the AI service directory

If the prompt already ends with `...\campusplacement-ai\ai-service>`, run:

```powershell
python app.py
```

Do not run `cd ai-service` a second time.

### All sections show empty data

Check:

1. Backend is running on port 5000.
2. PostgreSQL is running.
3. The selected `collegeId` matches the student records' `college_id`.
4. The AI service is not being used as the database source; it only receives backend profile data.
5. Browser storage is not stale. Log out and select the college again.
6. The API has not returned HTTP 429. Restart the backend if a previous development session exhausted the rate limit.

### Monthly chart is empty

Monthly historical values require `placements.offer_date`. When a college has no dated placement records, the dashboard places the current placed count in the current academic-month bucket as a fallback.

### Risk detection marks everyone high risk

Students with no stored prediction use the profile fallback. Placed students are classified as low risk. For better non-placed classification, populate CGPA, coding score, internships, attendance, projects, communication, branch, and optionally run the placement predictor.

### AI prediction returns unavailable

Confirm:

```powershell
Invoke-RestMethod http://localhost:8001/health
```

Then verify `AI_SERVICE_URL=http://127.0.0.1:8001` or `http://localhost:8001` in the backend environment and restart the backend.

## Known Limitations

- The current parent/student UI is a selected-college guest view; fully provisioned parent/student accounts are not the primary login path.
- Historical monthly placement trends are only as accurate as `offer_date` data.
- Some analytics such as application totals use derived or estimated values because a complete application/shortlist data model is not present everywhere.
- Resume analysis is keyword-based PDF text extraction, not a full semantic resume-ranking model.
- Skill-gap company requirements are currently defined in code for a fixed company set.
- Some career trend history remains illustrative; current career distribution uses stored `career_path` values.
- Database SQL migrations and seed files are incomplete placeholders; local setup relies on Sequelize sync.
- Docker Compose currently starts only the AI service.
- No comprehensive automated test suite is currently configured in the package scripts.

## Development Checks

Run the available checks before sharing changes:

```powershell
cd backend
node --check src/app.js
node --check src/controllers/predictionController.js

cd ..\frontend
npm run build

cd ..\ai-service
python -m py_compile app.py
```

## License

The repository currently declares the ISC license in the frontend package metadata. Confirm the intended project license before public distribution.
# placement-analytics
