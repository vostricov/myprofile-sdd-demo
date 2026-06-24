#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, "..");
const repoRoot = run("git", ["rev-parse", "--show-toplevel"], {
  cwd: frontendRoot,
}).trim();

const dashboardTimeZone = process.env.DASHBOARD_TIMEZONE ?? "Europe/Chisinau";
const afterHoursStart = Number.parseInt(
  process.env.AFTER_HOURS_START ?? "18",
  10,
);

if (!Number.isFinite(afterHoursStart) || afterHoursStart < 0 || afterHoursStart > 23) {
  throw new Error("AFTER_HOURS_START must be an hour from 0 through 23.");
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;
const outputPath = path.join(
  frontendRoot,
  "src",
  "fixtures",
  "repo-dashboard",
  "engineering-metrics.json",
);

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function runJson(command, args, options = {}) {
  return JSON.parse(run(command, args, options));
}

function ghJson(args) {
  return runJson("gh", args, { cwd: repoRoot });
}

function ghPaginated(endpoint) {
  const pages = ghJson(["api", "--paginate", "--slurp", endpoint]);
  return pages.flatMap((page) => {
    if (Array.isArray(page)) {
      return page;
    }

    const firstArray = Object.values(page).find(Array.isArray);
    return firstArray ?? [];
  });
}

function numberOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function round(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function hoursBetween(start, end) {
  if (!start || !end) {
    return null;
  }

  const duration = new Date(end).getTime() - new Date(start).getTime();
  return duration >= 0 ? duration / MS_PER_HOUR : null;
}

function localParts(dateInput) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: dashboardTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(dateInput));

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function localYmd(dateInput) {
  const parts = localParts(dateInput);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function localHour(dateInput) {
  return Number.parseInt(localParts(dateInput).hour, 10);
}

function dateFromYmd(ymd) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function ymdFromDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function startOfIsoWeek(date) {
  const day = date.getUTCDay() || 7;
  return addDays(date, 1 - day);
}

function isoWeekKey(weekStart) {
  const thursday = addDays(weekStart, 3);
  const isoYear = thursday.getUTCFullYear();
  const firstThursday = addDays(
    startOfIsoWeek(new Date(Date.UTC(isoYear, 0, 4))),
    3,
  );
  const weekNumber =
    Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY)) +
    1;

  return `${isoYear}-W${String(weekNumber).padStart(2, "0")}`;
}

function formatWeekLabel(weekStart, weekEnd) {
  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(weekStart);
  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(weekEnd);

  return `${startLabel}-${endLabel}`;
}

function weekInfo(dateInput) {
  const localDate = dateFromYmd(localYmd(dateInput));
  const weekStart = startOfIsoWeek(localDate);
  const weekEnd = addDays(weekStart, 6);

  return {
    key: isoWeekKey(weekStart),
    startDate: ymdFromDate(weekStart),
    endDate: ymdFromDate(weekEnd),
    label: formatWeekLabel(weekStart, weekEnd),
  };
}

function createBucket(info) {
  return {
    week: info.key,
    label: info.label,
    startDate: info.startDate,
    endDate: info.endDate,
    prCycleTimeHours: [],
    leadTimeForChangesHours: [],
    reviewLatencyHours: [],
    pipeline: {
      passed: 0,
      total: 0,
    },
    afterHoursCommits: {
      afterHours: 0,
      total: 0,
    },
    reviewsByContributor: new Map(),
  };
}

function ensureBucket(buckets, info) {
  if (!buckets.has(info.key)) {
    buckets.set(info.key, createBucket(info));
  }

  return buckets.get(info.key);
}

function metric(values) {
  const filtered = values.filter(Number.isFinite).sort((a, b) => a - b);

  if (filtered.length === 0) {
    return {
      averageHours: null,
      medianHours: null,
      sampleSize: 0,
    };
  }

  const midpoint = Math.floor(filtered.length / 2);
  const median =
    filtered.length % 2 === 0
      ? (filtered[midpoint - 1] + filtered[midpoint]) / 2
      : filtered[midpoint];
  const average = filtered.reduce((sum, value) => sum + value, 0) / filtered.length;

  return {
    averageHours: round(average),
    medianHours: round(median),
    sampleSize: filtered.length,
  };
}

function rate(numerator, denominator) {
  return {
    rate: denominator > 0 ? round(numerator / denominator, 3) : null,
    numerator,
    denominator,
  };
}

function firstDate(items, getDate) {
  return items
    .map(getDate)
    .filter(Boolean)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
}

function firstNonAuthorReview(reviews, authorLogin) {
  return reviews
    .filter((review) => review.submitted_at && review.user?.login !== authorLogin)
    .sort(
      (a, b) =>
        new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime(),
    )[0];
}

function isApplicableWorkflowConclusion(conclusion) {
  return !["cancelled", "neutral", "skipped"].includes(conclusion);
}

function reviewContributorName(review) {
  if (!review.user?.login) {
    return "unknown";
  }

  return review.user.type === "Bot"
    ? `${review.user.login} (bot)`
    : review.user.login;
}

function parseGitCommits() {
  const output = run(
    "git",
    ["log", "--all", "--date=iso-strict", "--pretty=format:%H%x09%aI%x09%an%x09%s"],
    { cwd: repoRoot },
  ).trim();

  if (!output) {
    return [];
  }

  return output.split("\n").map((line) => {
    const [sha, authoredAt, authorName, ...subjectParts] = line.split("\t");

    return {
      sha,
      authoredAt,
      authorName,
      subject: subjectParts.join("\t"),
    };
  });
}

const repo = ghJson(["repo", "view", "--json", "nameWithOwner,defaultBranchRef,url"]);
const [owner, repoName] = repo.nameWithOwner.split("/");
const pulls = ghPaginated(`repos/${owner}/${repoName}/pulls?state=all&per_page=100`);
const workflowRuns = ghPaginated(
  `repos/${owner}/${repoName}/actions/runs?per_page=100`,
);
const gitCommits = parseGitCommits();
const buckets = new Map();
const pullRequestRows = [];
const allCycleTimes = [];
const allLeadTimes = [];
const allReviewLatencies = [];
let reviewSubmissionCount = 0;

for (const pull of pulls) {
  const reviews = ghPaginated(
    `repos/${owner}/${repoName}/pulls/${pull.number}/reviews?per_page=100`,
  );
  const commits = ghPaginated(
    `repos/${owner}/${repoName}/pulls/${pull.number}/commits?per_page=100`,
  );
  const firstCommitAt = firstDate(commits, (commit) => commit.commit?.author?.date);
  const firstReview = firstNonAuthorReview(reviews, pull.user?.login);
  const cycleTimeHours = hoursBetween(pull.created_at, pull.merged_at);
  const leadTimeHours = hoursBetween(firstCommitAt, pull.merged_at);
  const reviewLatencyHours = hoursBetween(pull.created_at, firstReview?.submitted_at);

  for (const review of reviews) {
    if (!review.submitted_at) {
      continue;
    }

    reviewSubmissionCount += 1;
    const bucket = ensureBucket(buckets, weekInfo(review.submitted_at));
    const contributor = reviewContributorName(review);
    bucket.reviewsByContributor.set(
      contributor,
      (bucket.reviewsByContributor.get(contributor) ?? 0) + 1,
    );
  }

  if (pull.merged_at) {
    const bucket = ensureBucket(buckets, weekInfo(pull.merged_at));

    if (Number.isFinite(cycleTimeHours)) {
      bucket.prCycleTimeHours.push(cycleTimeHours);
      allCycleTimes.push(cycleTimeHours);
    }

    if (Number.isFinite(leadTimeHours)) {
      bucket.leadTimeForChangesHours.push(leadTimeHours);
      allLeadTimes.push(leadTimeHours);
    }

    if (Number.isFinite(reviewLatencyHours)) {
      bucket.reviewLatencyHours.push(reviewLatencyHours);
      allReviewLatencies.push(reviewLatencyHours);
    }
  }

  pullRequestRows.push({
    number: pull.number,
    title: pull.title,
    url: pull.html_url,
    state: pull.merged_at ? "merged" : pull.state,
    author: pull.user?.login ?? "unknown",
    createdAt: pull.created_at,
    mergedAt: pull.merged_at,
    firstCommitAt,
    firstReviewAt: firstReview?.submitted_at ?? null,
    reviewCount: reviews.length,
    cycleTimeHours: round(numberOrNull(cycleTimeHours)),
    leadTimeForChangesHours: round(numberOrNull(leadTimeHours)),
    reviewLatencyHours: round(numberOrNull(reviewLatencyHours)),
  });
}

for (const runItem of workflowRuns) {
  if (runItem.status !== "completed" || !runItem.conclusion) {
    continue;
  }

  if (!isApplicableWorkflowConclusion(runItem.conclusion)) {
    continue;
  }

  const bucket = ensureBucket(buckets, weekInfo(runItem.created_at));
  bucket.pipeline.total += 1;

  if (runItem.conclusion === "success") {
    bucket.pipeline.passed += 1;
  }
}

for (const commit of gitCommits) {
  if (!commit.authoredAt) {
    continue;
  }

  const bucket = ensureBucket(buckets, weekInfo(commit.authoredAt));
  bucket.afterHoursCommits.total += 1;

  if (localHour(commit.authoredAt) >= afterHoursStart) {
    bucket.afterHoursCommits.afterHours += 1;
  }
}

const weekly = [...buckets.values()]
  .sort((a, b) => a.startDate.localeCompare(b.startDate))
  .map((bucket) => {
    const reviewTotal = [...bucket.reviewsByContributor.values()].reduce(
      (sum, value) => sum + value,
      0,
    );
    const busFactorHotspots = [...bucket.reviewsByContributor.entries()]
      .map(([contributor, reviews]) => ({
        contributor,
        reviews,
        share: reviewTotal > 0 ? round(reviews / reviewTotal, 3) : null,
      }))
      .sort((a, b) => b.reviews - a.reviews || a.contributor.localeCompare(b.contributor));

    return {
      week: bucket.week,
      label: bucket.label,
      startDate: bucket.startDate,
      endDate: bucket.endDate,
      prCycleTime: metric(bucket.prCycleTimeHours),
      leadTimeForChanges: metric(bucket.leadTimeForChangesHours),
      reviewLatency: metric(bucket.reviewLatencyHours),
      pipelinePassRate: rate(bucket.pipeline.passed, bucket.pipeline.total),
      afterHoursCommitRate: rate(
        bucket.afterHoursCommits.afterHours,
        bucket.afterHoursCommits.total,
      ),
      busFactorHotspots,
    };
  });

const completedWorkflowRuns = workflowRuns.filter(
  (runItem) =>
    runItem.status === "completed" &&
    runItem.conclusion &&
    isApplicableWorkflowConclusion(runItem.conclusion),
);
const successfulWorkflowRuns = completedWorkflowRuns.filter(
  (runItem) => runItem.conclusion === "success",
);
const afterHoursCommitCount = weekly.reduce(
  (sum, week) => sum + week.afterHoursCommitRate.numerator,
  0,
);
const totalCommitCount = weekly.reduce(
  (sum, week) => sum + week.afterHoursCommitRate.denominator,
  0,
);
const topWeeklyReviewShare = weekly.reduce(
  (max, week) => Math.max(max, week.busFactorHotspots[0]?.share ?? 0),
  0,
);

const snapshot = {
  generatedAt: new Date().toISOString(),
  repository: {
    nameWithOwner: repo.nameWithOwner,
    url: repo.url,
    defaultBranch: repo.defaultBranchRef?.name ?? null,
  },
  definitions: {
    weekGrouping: `ISO weeks, grouped in ${dashboardTimeZone}.`,
    prCycleTime:
      "Merged PR created_at to merged_at, grouped by merge week.",
    leadTimeForChanges:
      "Earliest PR commit author timestamp to PR merged_at, grouped by merge week.",
    reviewLatency:
      "PR created_at to first non-author review submitted_at, grouped by merge week for merged PRs.",
    pipelinePassRate:
      "Successful completed GitHub Actions workflow runs divided by completed applicable runs; cancelled, neutral, and skipped runs are excluded.",
    busFactorHotspots:
      "Share of GitHub review submissions by reviewer within the week, including bot accounts when they submit reviews.",
    afterHoursWork: `Share of local git commits authored at or after ${String(afterHoursStart).padStart(
      2,
      "0",
    )}:00 in ${dashboardTimeZone}.`,
  },
  summary: {
    pullRequestsAnalyzed: pulls.length,
    mergedPullRequests: pulls.filter((pull) => pull.merged_at).length,
    reviewSubmissions: reviewSubmissionCount,
    completedWorkflowRuns: completedWorkflowRuns.length,
    commitsAnalyzed: gitCommits.length,
    prCycleTime: metric(allCycleTimes),
    leadTimeForChanges: metric(allLeadTimes),
    reviewLatency: metric(allReviewLatencies),
    pipelinePassRate: rate(successfulWorkflowRuns.length, completedWorkflowRuns.length),
    afterHoursCommitRate: rate(afterHoursCommitCount, totalCommitCount),
    highestWeeklyReviewShare: round(topWeeklyReviewShare, 3),
  },
  weekly,
  pullRequests: pullRequestRows.sort((a, b) => b.number - a.number),
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
