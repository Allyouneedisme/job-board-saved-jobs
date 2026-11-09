
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { createApp } from "../server.js";

const savedFile = fileURLToPath(
  new URL("../saved-jobs.json", import.meta.url)
);

let originalSavedData;
let fileExisted = true;
let server;
let baseUrl;

before(async () => {
  // Keep a backup of the user's existing saved jobs.
  try {
    originalSavedData = await readFile(savedFile, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    fileExisted = false;
  }

  // Start tests with an empty saved list.
  await writeFile(savedFile, "[]");

  server = createApp();

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  // Restore the saved jobs file exactly as it was.
  if (fileExisted) {
    await writeFile(savedFile, originalSavedData);
  } else {
    await rm(savedFile, { force: true });
  }
});

test("GET /api/jobs returns job listings", async () => {
  const response = await fetch(`${baseUrl}/api/jobs`);
  const jobs = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(jobs));
  assert.ok(jobs.length > 0);
});

test("POST /api/saved saves a valid job", async () => {
  const response = await fetch(`${baseUrl}/api/saved`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: "j1" })
  });

  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.jobId, "j1");
});

test("POST /api/saved prevents duplicate jobs", async () => {
  const response = await fetch(`${baseUrl}/api/saved`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: "j1" })
  });

  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.message, "Job already saved");
});

test("GET /api/saved returns saved job details", async () => {
  const response = await fetch(`${baseUrl}/api/saved`);
  const jobs = await response.json();

  assert.equal(response.status, 200);
  assert.ok(jobs.some((job) => job.id === "j1"));
});

test("POST /api/saved rejects an unknown job ID", async () => {
  const response = await fetch(`${baseUrl}/api/saved`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: "unknown-job" })
  });

  assert.equal(response.status, 404);
});

test("POST /api/saved rejects invalid JSON", async () => {
  const response = await fetch(`${baseUrl}/api/saved`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ invalid json"
  });

  assert.equal(response.status, 400);
});

test("DELETE /api/saved/:jobId removes a saved job", async () => {
  const response = await fetch(`${baseUrl}/api/saved/j1`, {
    method: "DELETE"
  });

  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.jobId, "j1");
});
