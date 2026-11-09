# Job Board with Saved Jobs

A small job board application built with Node.js. Users can browse job listings, search for jobs, save interesting listings, and remove jobs from their saved list.

## Features

- View available job listings.
- Search jobs by title, company, or location.
- Save a job to a personal saved list.
- View all saved jobs.
- Remove jobs from the saved list.
- Prevent duplicate saved entries.
- Validate job IDs and return clear errors for invalid requests.
- Persist saved jobs in a JSON file.
- Automated tests using Node.js's built-in test runner.

## Tech Stack

- Node.js
- JavaScript (ES Modules)
- HTML and CSS
- Node.js HTTP module
- JSON file storage
- Node.js built-in test runner

No external npm packages are required.

## Getting Started

### Requirements

- Node.js 20 or later
- Git

### Run the application

Clone the repository:

```bash
git clone https://github.com/Allyouneedisme/job-board-saved-jobs.git
```

Move into the project directory:

```bash
cd job-board-saved-jobs
```

Start the server:

```bash
npm start
```

Open the application in your browser:

```text
http://localhost:3000
```

## Running Tests

Run the automated tests with:

```bash
npm test
```

The tests cover job loading and searching, job lookup, saving jobs, preventing duplicates, removing saved jobs, and persistence.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/jobs` | Retrieve job listings |
| GET | `/api/jobs?q=developer` | Search job listings |
| GET | `/api/saved` | Retrieve saved jobs |
| POST | `/api/saved` | Save a job |
| DELETE | `/api/saved/:jobId` | Remove a saved job |

### Save a job

Request:

```json
{
  "jobId": "j1"
}
```

Endpoint:

```text
POST /api/saved
```

### Remove a saved job

Example:

```text
DELETE /api/saved/j1
```

## Implementation Decisions

I used a JSON file to store saved job IDs instead of introducing a database for this small assignment.

This keeps the application simple, avoids external dependencies, and allows saved jobs to remain available after restarting the server.

The saved-jobs logic is kept in a separate module so that file operations are not mixed with HTTP request handling.

## Possible Improvements

- Replace JSON file storage with a database.
- Add user accounts and individual saved-job lists.
- Add pagination for larger job listings.
- Add more API and integration tests.
- Improve error handling for concurrent file updates.

## AI Assistance

I used ChatGPT as a learning and debugging assistant during development. It helped me understand the requirements, work through implementation issues, and review parts of the code.

I manually integrated the changes, ran the application, and worked through the testing and debugging process to understand how the implementation works.
