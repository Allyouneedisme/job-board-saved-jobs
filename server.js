
// A small job board: a JSON API and one page.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { loadJobs, searchJobs, findJob } from "./lib/jobs.js";

import {
  getSavedJobs,
  saveJob,
  removeSavedJob
} from "./lib/saved-jobs.js";

const PORT = Number(process.env.PORT ?? 3000);

// Send JSON responses to the client
function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8"
  });

  res.end(JSON.stringify(body));
}

// Read JSON data sent by the client
async function readJsonBody(req) {
  let body = "";

  for await (const chunk of req) {
    body += chunk.toString();
  }

  return JSON.parse(body);
}

export function createApp() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");

      // GET: Retrieve and search available jobs
      if (req.method === "GET" && url.pathname === "/api/jobs") {
        const jobs = await loadJobs();

        return sendJson(
          res,
          200,
          searchJobs(jobs, url.searchParams.get("q"))
        );
      }

      // GET: Retrieve all saved jobs
      if (req.method === "GET" && url.pathname === "/api/saved") {
        const jobs = await loadJobs();
        const savedIds = await getSavedJobs();

        const savedJobs = jobs.filter(job =>
          savedIds.includes(job.id)
        );

        return sendJson(res, 200, savedJobs);
      }

      // POST: Save a job
      if (req.method === "POST" && url.pathname === "/api/saved") {
        let body;

        try {
          body = await readJsonBody(req);
        } catch {
          return sendJson(res, 400, {
            error: "Invalid JSON request body"
          });
        }

        const jobId = body?.jobId;

        if (typeof jobId !== "string" || !jobId.trim()) {
          return sendJson(res, 400, {
            error: "A valid jobId is required"
          });
        }

        const jobs = await loadJobs();
        const job = findJob(jobs, jobId);

        if (!job) {
          return sendJson(res, 404, {
            error: "Job not found"
          });
        }

        const existingIds = await getSavedJobs();
        const alreadySaved = existingIds.includes(jobId);

        await saveJob(jobId);

        return sendJson(res, alreadySaved ? 200 : 201, {
          message: alreadySaved ? "Job already saved" : "Job saved successfully",
          jobId
        });
      }

      // DELETE: Remove a saved job
      const deleteMatch = url.pathname.match(/^\/api\/saved\/([^/]+)$/);

      if (req.method === "DELETE" && deleteMatch) {
        let jobId;

        try {
          jobId = decodeURIComponent(deleteMatch[1]);
        } catch {
          return sendJson(res, 400, {
            error: "Invalid job ID"
          });
        }

        const jobs = await loadJobs();

        if (!findJob(jobs, jobId)) {
          return sendJson(res, 404, {
            error: "Job not found"
          });
        }

        const existingIds = await getSavedJobs();

        if (!existingIds.includes(jobId)) {
          return sendJson(res, 404, {
            error: "Job is not in your saved list"
          });
        }

        await removeSavedJob(jobId);

        return sendJson(res, 200, {
          message: "Job removed successfully",
          jobId
        });
      }

      // Serve the webpage and frontend JavaScript
      if (
        req.method === "GET" &&
        (url.pathname === "/" || url.pathname === "/app.js")
      ) {
        const file = url.pathname === "/" ? "index.html" : "app.js";

        const type = file.endsWith(".html")
          ? "text/html"
          : "text/javascript";

        const fileBody = await readFile(
          new URL(`./public/${file}`, import.meta.url)
        );

        res.writeHead(200, {
          "content-type": `${type}; charset=utf-8`
        });

        return res.end(fileBody);
      }

      // Unknown routes
      return sendJson(res, 404, {
        error: "Not found"
      });

    } catch (err) {
      console.error(err);

      if (!res.headersSent) {
        return sendJson(res, 500, {
          error: "Something went wrong"
        });
      }

      res.end();
    }
  });
}

// Start the server directly using npm start
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  createApp().listen(PORT, () => {
    console.log(`Job board on http://localhost:${PORT}`);
  });
}
