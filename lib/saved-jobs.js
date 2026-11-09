
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_FILE = fileURLToPath(
  new URL("../saved-jobs.json", import.meta.url)
);

export async function getSavedJobs(filePath = DEFAULT_FILE) {
  try {
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function saveJob(jobId, filePath = DEFAULT_FILE) {
  const savedJobs = await getSavedJobs(filePath);

  if (!savedJobs.includes(jobId)) {
    savedJobs.push(jobId);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(savedJobs, null, 2));
  }

  return savedJobs;
}

export async function removeSavedJob(jobId, filePath = DEFAULT_FILE) {
  const savedJobs = await getSavedJobs(filePath);
  const updatedJobs = savedJobs.filter((id) => id !== jobId);

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(updatedJobs, null, 2));

  return updatedJobs;
}
