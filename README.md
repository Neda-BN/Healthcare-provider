# 🏥 Healthcare Provider Survey Management System

A complete web application for healthcare providers to create and manage municipality surveys, view dashboards, and run comparative analyses.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![SQLite](https://img.shields.io/badge/SQLite-local-lightgrey)

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Demo Checklist (Quick Start)](#-demo-checklist-quick-start)
3. [Step-by-Step Installation for Non-Developers](#-step-by-step-installation-for-non-developers)
4. [Demo Credentials](#-demo-credentials)
5. [Using the Application](#-using-the-application)
6. [Email System Demo](#-email-system-demo)
7. [Project Structure](#-project-structure)
8. [Production Deployment](#-production-deployment)
9. [Privacy & Security Notes](#-privacy--security-notes)

---

## ✨ Features

- **Survey Management**: Create, edit, and send surveys to municipality contacts
- **Question Builder**: Drag-and-drop interface to create survey templates
- **Email Integration**: Send surveys via email and parse replies automatically
- **Municipality Management**: Create municipalities and manage email recipient lists
- **Email List Upload**: Upload CSV, XLSX, or TXT files with email recipients
- **Dashboards**: Real-time analytics with charts and statistics
- **Municipality Comparison**: Compare performance across multiple municipalities
- **Export**: CSV export for survey data
- **Role-Based Access**: Admin and Caregiver user roles
- **Swedish Language**: Survey questions based on Nordic Care Index

---

## 🚀 Demo Checklist (Quick Start)

Follow these 6 steps to run the demo on a fresh machine:

### ✅ Step 1: Install Node.js

If you don't have Node.js installed:

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS version** (18.x or newer)
3. Run the installer and follow the prompts
4. Restart your terminal after installation

Verify installation by opening a terminal and running:
```bash
node --version
```
You should see something like `v18.x.x` or higher.

### ✅ Step 2: Download/Clone the Project

If you received a ZIP file, extract it. Otherwise, clone from GitHub:
```bash
git clone <repository-url>
cd healthcare-provider-surveys
```

### ✅ Step 3: Install Dependencies

Open a terminal in the project folder and run:
```bash
npm install
```
This will take 1-2 minutes to download all required packages.

### ✅ Step 4: Set Up the Database

Run the database migration to create all tables:
```bash
npx prisma migrate dev --name init
```
When prompted for a name, you can press Enter to accept the default.

### ✅ Step 5: Seed Demo Data

Load the demo municipalities, surveys, and users:
```bash
npm run seed
```
You'll see a summary of what was created.

### ✅ Step 6: Start the Application

```bash
npm run dev
```
Open your browser and go to: **http://localhost:3000**

🎉 **Done!** The app is now running with demo data.

---

## 📖 Step-by-Step Installation for Non-Developers

### Prerequisites

You need:
- A computer running Windows, macOS, or Linux
- Internet connection (for installation)
- 500MB free disk space

### Installing Node.js (Detailed)

#### On Windows:
1. Visit [nodejs.org](https://nodejs.org)
2. Click the big green button for "LTS" version
3. Run the downloaded `.msi` file
4. Click "Next" through all steps (accept defaults)
5. Check "Automatically install necessary tools" when asked
6. Click "Install" and wait for completion
7. Open **Command Prompt** or **PowerShell**

#### On macOS:
1. Visit [nodejs.org](https://nodejs.org)
2. Click the big green button for "LTS" version
3. Run the downloaded `.pkg` file
4. Follow the installer steps
5. Open **Terminal** (search in Spotlight)

#### On Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Verify Node.js Installation

Open your terminal and type:
```bash
node --version
npm --version
```

Both commands should return version numbers. If you see an error, try restarting your terminal.

### Setting Up the Project

1. **Open Terminal/Command Prompt**

2. **Navigate to the project folder**:
   ```bash
   cd /path/to/healthcare-provider-surveys
   ```
   Or on Windows: Right-click in the folder and select "Open in Terminal"

3. **Install packages**:
   ```bash
   npm install
   ```
   Wait for this to complete (may take 1-3 minutes)

4. **Create environment file**:
   ```bash
   cp .env.example .env
   ```
   Or on Windows:
   ```bash
   copy .env.example .env
   ```

5. **Initialize database**:
   ```bash
   npx prisma migrate dev --name init
   ```
   Press Enter when prompted

6. **Load demo data**:
   ```bash
   npm run seed
   ```

7. **Start the app**:
   ```bash
   npm run dev
   ```

8. **Open in browser**: Go to http://localhost:3000

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@healthcare-provider.se | admin123 |
| Caregiver | caregiver@healthcare-provider.se | caregiver123 |

---

## 📱 Using the Application

### Dashboard
The main dashboard shows:
- Total surveys sent
- Response rates
- Average scores by category
- Recent comments from municipalities
- Monthly trends chart

### Sending a Survey
1. Click **"Send Survey"** button in the top bar
2. Select a survey template
3. Choose one or more municipalities
4. Add additional email recipients (optional)
5. Click **Send**

### Viewing Municipality Details
1. Use the municipality dropdown in the top bar
2. Or navigate to **Municipalities** in the sidebar
3. Click on any municipality to see their dashboard

### Comparing Municipalities
1. Go to **Analysis** → **Compare** in the sidebar
2. Select 2-4 municipalities to compare
3. View side-by-side charts and statistics
4. Click **Export CSV** to download data

### Managing Municipalities (Admin Only)
1. Go to **Municipalities** → **Manage** in the sidebar
2. Click **Add Municipality** to create a new one
3. Enter the municipality name and optional description
4. Click **Create Municipality**

### Uploading Email Recipients
1. Go to **Municipalities** → **Manage**
2. Find the municipality in the list
3. Click the **Upload** icon (↑) next to it
4. Select a file (CSV, XLSX, or TXT)
5. The system will automatically extract valid email addresses
6. Review the preview and click **Save**

#### Supported File Formats
- **CSV**: Comma-separated values with emails in any column
- **XLSX/XLS**: Excel files with emails in any column/sheet
- **TXT**: Plain text with one email per line or mixed content

#### Example File Structures

**CSV Example (emails.csv)**:
```csv
Name,Email,Department
John Doe,john.doe@municipality.se,Social Services
Jane Smith,jane.smith@municipality.se,Healthcare
```

**TXT Example (emails.txt)**:
```
contact@municipality.se
healthcare@municipality.se
social@municipality.se
```

**Excel Example**: Any spreadsheet with email addresses in one or more columns.

The system will:
- Automatically detect email addresses in any column
- Remove duplicates
- Trim whitespace
- Validate email format
- Show you a preview before saving

### Sending Surveys with Email Lists
1. Go to **Surveys** → **Send Survey**
2. Select municipalities (the email count is shown next to each)
3. Click on **Recipients** to expand and see all loaded emails
4. Optionally add or remove individual emails
5. Click **Send** to send to all recipients

When multiple municipalities are selected:
- Email lists are automatically merged
- Duplicates are removed
- Total count is displayed

### Question Builder
1. Go to **New internal survey** → **Question builder**
2. View existing questions or add new ones
3. Drag to reorder questions
4. Click **Preview** to see how the survey looks
5. Click **Save Template** to save changes

---

## 📧 Email System Demo

The demo uses **Maildev** to capture emails locally (no real emails are sent).

### Setting Up the Email Demo

#### 1. Start Maildev (in a separate terminal)
```bash
npm run maildev
```

#### 2. Open Maildev UI
Go to: **http://localhost:1080**

This shows all emails sent by the application.

#### 3. Send a Test Survey
1. Log into the app
2. Click **Send Survey**
3. Select a municipality and send
4. Check Maildev to see the email

#### 4. Simulate a Reply
In a new terminal, run:
```bash
npm run demo:reply
```

This simulates a municipality replying to the survey with ratings.

### How Email Replies Work

**Production Setup**:
- Configure SendGrid, Mailgun, or Mailjet SMTP settings
- Set up inbound email webhook to `/api/inbound-email`
- Replies to surveys are automatically parsed

**Reply Format**:
Recipients can reply with ratings like:
```
Q3a: 8
Q4a: 9
Q5a: 7
Kommentar: Personalen är mycket professionell.
```

The system parses these responses automatically.

---

## 📁 Project Structure

```
healthcare-provider-surveys/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Demo data seeding
│   └── dev.db             # SQLite database (created after migrate)
├── scripts/
│   └── simulate-reply.ts  # Email reply simulator
├── src/
│   ├── app/               # Next.js app pages
│   │   ├── (dashboard)/   # Authenticated pages
│   │   ├── api/           # API routes
│   │   └── login/         # Login page
│   ├── components/        # React components
│   │   └── layout/        # Sidebar, TopBar, etc.
│   └── lib/               # Utilities
│       ├── auth.ts        # Authentication
│       ├── email.ts       # Email handling
│       └── prisma.ts      # Database client
├── .env.example           # Environment template
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 🚢 Production Deployment

### Database: Switch to PostgreSQL

1. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Run migration:
   ```bash
   npm run migrate:prod
   ```

### Email: Configure SMTP Provider

Update `.env` with your provider details:

**SendGrid**:
```
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="surveys@yourdomain.com"
```

**Mailgun**:
```
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@yourdomain.com"
SMTP_PASS="your-mailgun-password"
SMTP_FROM="surveys@yourdomain.com"
```

### Inbound Email Webhook

Set up your email provider to forward replies to:
```
POST https://yourdomain.com/api/inbound-email
```

Use the `INBOUND_EMAIL_SECRET` for authentication.

### Deployment Platforms

- **Vercel**: Deploy directly from GitHub (recommended for Next.js)
- **Railway**: Easy PostgreSQL + Node.js hosting
- **Docker**: Use provided Dockerfile (create your own)

---

## 🔒 Privacy & Security Notes

### Important Considerations

1. **Inbound Email Parsing**: Email replies may contain personally identifiable information (PII). Ensure your email handling complies with GDPR and local privacy laws.

2. **Data Storage**: Survey responses are stored in the database. Implement proper backup and data retention policies for production.

3. **Authentication**: The demo uses simple JWT authentication. For production, consider:
   - Adding password reset functionality
   - Implementing multi-factor authentication
   - Using a dedicated auth provider (Auth0, Clerk, etc.)

4. **Secrets**: Never commit `.env` files with real credentials. Use environment variables in your hosting platform.

5. **HTTPS**: Always use HTTPS in production to encrypt data in transit.

### Securing Inbound Email

1. Use a unique webhook secret (`INBOUND_EMAIL_SECRET`)
2. Validate sender addresses
3. Implement rate limiting
4. Log all inbound emails for auditing
5. Sanitize email content before storing

---

## 🧪 Running Tests

```bash
npm run test
```

Tests cover:
- Email parsing functions
- Survey ID extraction
- Response format validation

---

## 🆘 Troubleshooting

### "Command not found: npm"
Node.js is not installed correctly. Reinstall from [nodejs.org](https://nodejs.org).

### "ENOENT: no such file or directory"
You're not in the project folder. Use `cd` to navigate to it.

### "Port 3000 is already in use"
Another application is using port 3000. Either:
- Stop the other application
- Run with a different port: `PORT=3001 npm run dev`

### "Database does not exist"
Run the migration command:
```bash
npx prisma migrate dev --name init
```

### "No demo data"
Run the seed command:
```bash
npm run seed
```

### Email not sending
Make sure Maildev is running:
```bash
npm run maildev
```

---

## 📞 Support

For help with this demo application:
- Email: support@healthcare-provider.se
- Check the in-app Help section

---

## 📄 License

This project is proprietary software. All rights reserved.

---

Built with ❤️ for healthcare quality improvement.

