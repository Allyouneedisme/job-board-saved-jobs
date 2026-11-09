
const jobsList = document.getElementById("jobsList");
const savedJobsList = document.getElementById("savedJobsList");
const messageElement = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const jobsCount = document.getElementById("jobsCount");
const savedCount = document.getElementById("savedCount");

// Send requests to the backend API
async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Display success and error messages
function showMessage(message, type = "success") {
  messageElement.textContent = message;
  messageElement.className = type;
}

// Create a job card safely using DOM elements
function createJobCard(job, isSaved = false) {
  const card = document.createElement("article");
  card.className = "job-card";

  const title = document.createElement("h3");
  title.textContent = job.title;

  const company = document.createElement("p");
  company.className = "company";
  company.textContent = job.company;

  const details = document.createElement("div");
  details.className = "job-details";

  const location = document.createElement("span");
  location.textContent = job.location;

  const jobType = document.createElement("span");
  jobType.textContent = "Internship";

  details.append(location, jobType);

  const footer = document.createElement("div");
  footer.className = "job-footer";

  const stipend = document.createElement("span");
  stipend.className = "stipend";
  stipend.textContent = `₹${Number(job.stipend).toLocaleString("en-IN")} / month`;

  const button = document.createElement("button");

  if (isSaved) {
    button.textContent = "Remove";
    button.className = "remove-btn";

    button.addEventListener("click", () => removeJob(job.id));
  } else {
    button.textContent = "Save Job";
    button.className = "save-btn";

    button.addEventListener("click", () => saveJob(job.id));
  }

  footer.append(stipend, button);
  card.append(title, company, details, footer);

  return card;
}

// Display all available jobs
function displayJobs(jobs, savedJobIds) {
  jobsList.replaceChildren();

  jobsCount.textContent = `${jobs.length} opportunities`;

  if (jobs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No jobs match your search.";
    jobsList.appendChild(empty);
    return;
  }

  jobs.forEach((job) => {
    const card = createJobCard(
      job,
      savedJobIds.includes(job.id)
    );

    if (savedJobIds.includes(job.id)) {
      const button = card.querySelector("button");
      button.disabled = true;
      button.textContent = "Already Saved";
      button.className = "save-btn";
    }

    jobsList.appendChild(card);
  });
}

// Display saved jobs
function displaySavedJobs(jobs) {
  savedJobsList.replaceChildren();

  savedCount.textContent = `${jobs.length} saved`;

  if (jobs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No saved jobs yet. Save a job to see it here.";
    savedJobsList.appendChild(empty);
    return;
  }

  jobs.forEach((job) => {
    savedJobsList.appendChild(createJobCard(job, true));
  });
}

// Save a job through the POST API
async function saveJob(jobId) {
  try {
    await apiRequest("/api/saved", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ jobId })
    });

    showMessage("Job saved successfully!");
    await loadData();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Remove a job through the DELETE API
async function removeJob(jobId) {
  try {
    await apiRequest(
      `/api/saved/${encodeURIComponent(jobId)}`,
      { method: "DELETE" }
    );

    showMessage("Job removed successfully!");
    await loadData();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Load available jobs and saved jobs
async function loadData() {
  try {
    const query = searchInput.value.trim();

    const [jobs, savedJobs] = await Promise.all([
      apiRequest(`/api/jobs?q=${encodeURIComponent(query)}`),
      apiRequest("/api/saved")
    ]);

    const savedJobIds = savedJobs.map((job) => job.id);

    displayJobs(jobs, savedJobIds);
    displaySavedJobs(savedJobs);

  } catch (error) {
    showMessage(error.message, "error");

    jobsList.textContent = "Unable to load available jobs.";
    savedJobsList.textContent = "Unable to load saved jobs.";
  }
}

// Search as the user types
searchInput.addEventListener("input", loadData);

// Load data when the page opens
loadData();
