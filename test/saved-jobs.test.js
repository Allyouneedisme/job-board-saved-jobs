
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  getSavedJobs,
  saveJob,
  removeSavedJob
} from "../lib/saved-jobs.js";

async function createTempFile() {
  const folder = await mkdtemp(join(tmpdir(), "saved-jobs-"));
  return {
    folder,
    filePath: join(folder, "saved-jobs.json")
  };
}

test("returns an empty array when no saved jobs exist", async () => {
  const { folder, filePath } = await createTempFile();

  try {
    const result = await getSavedJobs(filePath);
    assert.deepEqual(result, []);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});

test("saves a job ID", async () => {
  const { folder, filePath } = await createTempFile();

  try {
    const result = await saveJob("j1", filePath);
    assert.deepEqual(result, ["j1"]);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});

test("does not save duplicate job IDs", async () => {
  const { folder, filePath } = await createTempFile();

  try {
    await saveJob("j1", filePath);
    const result = await saveJob("j1", filePath);

    assert.deepEqual(result, ["j1"]);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});

test("removes a saved job ID", async () => {
  const { folder, filePath } = await createTempFile();

  try {
    await saveJob("j1", filePath);
    await saveJob("j2", filePath);

    const result = await removeSavedJob("j1", filePath);

    assert.deepEqual(result, ["j2"]);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});

test("keeps saved jobs in the JSON file", async () => {
  const { folder, filePath } = await createTempFile();

  try {
    await saveJob("j1", filePath);

    const fileContents = await readFile(filePath, "utf8");

    assert.deepEqual(JSON.parse(fileContents), ["j1"]);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});
