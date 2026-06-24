import { useEffect, type ComponentType } from "react";
import {
  Activity,
  Clock,
  Gauge,
  GitPullRequest,
  Moon,
  Users,
  type LucideProps,
} from "lucide-react";
import metricsSnapshot from "../../fixtures/repo-dashboard/engineering-metrics.json";
import styles from "../../styles/dashboard.module.css";

type TimedMetric = {
  averageHours: number | null;
  medianHours: number | null;
  sampleSize: number;
};

type RateMetric = {
  rate: number | null;
  numerator: number;
  denominator: number;
};

type BusFactorHotspot = {
  contributor: string;
  reviews: number;
  share: number | null;
};

type WeeklyMetric = {
  week: string;
  label: string;
  startDate: string;
  endDate: string;
  prCycleTime: TimedMetric;
  leadTimeForChanges: TimedMetric;
  reviewLatency: TimedMetric;
  pipelinePassRate: RateMetric;
  afterHoursCommitRate: RateMetric;
  busFactorHotspots: BusFactorHotspot[];
};

type PullRequestMetric = {
  number: number;
  title: string;
  url: string;
  state: string;
  author: string;
  createdAt: string;
  mergedAt: string | null;
  reviewCount: number;
  cycleTimeHours: number | null;
  leadTimeForChangesHours: number | null;
  reviewLatencyHours: number | null;
};

type DashboardSnapshot = {
  generatedAt: string;
  repository: {
    nameWithOwner: string;
    url: string;
    defaultBranch: string | null;
  };
  definitions: Record<string, string>;
  summary: {
    pullRequestsAnalyzed: number;
    mergedPullRequests: number;
    reviewSubmissions: number;
    completedWorkflowRuns: number;
    commitsAnalyzed: number;
    prCycleTime: TimedMetric;
    leadTimeForChanges: TimedMetric;
    reviewLatency: TimedMetric;
    pipelinePassRate: RateMetric;
    afterHoursCommitRate: RateMetric;
    highestWeeklyReviewShare: number | null;
  };
  weekly: WeeklyMetric[];
  pullRequests: PullRequestMetric[];
};

type IconComponent = ComponentType<LucideProps>;

type SeriesPoint = {
  label: string;
  value: number | null;
  sampleSize: number;
};

const snapshot = metricsSnapshot as DashboardSnapshot;

const timeMetrics = [
  {
    key: "prCycleTime",
    title: "PR Cycle Time",
    description: "Created to merged, by merge week",
    color: "blue",
    points: snapshot.weekly.map((week) => ({
      label: week.week,
      value: week.prCycleTime.averageHours,
      sampleSize: week.prCycleTime.sampleSize,
    })),
  },
  {
    key: "leadTimeForChanges",
    title: "Lead Time For Changes",
    description: "First PR commit to merge",
    color: "green",
    points: snapshot.weekly.map((week) => ({
      label: week.week,
      value: week.leadTimeForChanges.averageHours,
      sampleSize: week.leadTimeForChanges.sampleSize,
    })),
  },
  {
    key: "reviewLatency",
    title: "Review Latency",
    description: "Opened to first non-author review",
    color: "amber",
    points: snapshot.weekly.map((week) => ({
      label: week.week,
      value: week.reviewLatency.averageHours,
      sampleSize: week.reviewLatency.sampleSize,
    })),
  },
] as const;

const rateMetrics = [
  {
    key: "pipelinePassRate",
    title: "Pipeline Pass Rate",
    description: "Successful completed workflow runs",
    color: "violet",
    points: snapshot.weekly.map((week) => ({
      label: week.week,
      value: week.pipelinePassRate.rate,
      sampleSize: week.pipelinePassRate.denominator,
    })),
  },
  {
    key: "afterHoursCommitRate",
    title: "After-Hours Work",
    description: "Commits authored at or after 18:00",
    color: "red",
    points: snapshot.weekly.map((week) => ({
      label: week.week,
      value: week.afterHoursCommitRate.rate,
      sampleSize: week.afterHoursCommitRate.denominator,
    })),
  },
] as const;

export function EngineeringDashboard() {
  useEffect(() => {
    document.title = `${snapshot.repository.nameWithOwner} engineering metrics`;
  }, []);

  return (
    <main className={styles.dashboardShell}>
      <div className={styles.dashboardPage}>
        <header className={styles.dashboardHeader}>
          <div>
            <p className={styles.eyebrow}>Engineering Metrics</p>
            <h1>{snapshot.repository.nameWithOwner}</h1>
          </div>
          <dl className={styles.headerMeta} aria-label="Dashboard metadata">
            <div>
              <dt>Generated</dt>
              <dd>{formatDateTime(snapshot.generatedAt)}</dd>
            </div>
            <div>
              <dt>Default branch</dt>
              <dd>{snapshot.repository.defaultBranch ?? "n/a"}</dd>
            </div>
          </dl>
        </header>

        <section className={styles.summaryGrid} aria-label="Repository summary">
          <SummaryCard
            icon={GitPullRequest}
            label="Merged PRs"
            value={snapshot.summary.mergedPullRequests.toString()}
            detail={`${snapshot.summary.pullRequestsAnalyzed} PRs analyzed`}
          />
          <SummaryCard
            icon={Clock}
            label="Avg PR Cycle"
            value={formatDuration(snapshot.summary.prCycleTime.averageHours)}
            detail={`${snapshot.summary.prCycleTime.sampleSize} merged PRs`}
          />
          <SummaryCard
            icon={Activity}
            label="Avg Lead Time"
            value={formatDuration(snapshot.summary.leadTimeForChanges.averageHours)}
            detail={`${snapshot.summary.leadTimeForChanges.sampleSize} PRs with commits`}
          />
          <SummaryCard
            icon={Gauge}
            label="Pipeline Pass"
            value={formatPercent(snapshot.summary.pipelinePassRate.rate)}
            detail={`${snapshot.summary.pipelinePassRate.numerator}/${snapshot.summary.pipelinePassRate.denominator} runs passed`}
          />
          <SummaryCard
            icon={Users}
            label="Review Hotspot"
            value={formatPercent(snapshot.summary.highestWeeklyReviewShare)}
            detail="highest weekly review share"
          />
          <SummaryCard
            icon={Moon}
            label="After Hours"
            value={formatPercent(snapshot.summary.afterHoursCommitRate.rate)}
            detail={`${snapshot.summary.afterHoursCommitRate.numerator}/${snapshot.summary.afterHoursCommitRate.denominator} commits`}
          />
        </section>

        <section className={styles.chartGrid} aria-label="Weekly trends">
          {timeMetrics.map((metricItem) => (
            <TrendPanel
              key={metricItem.key}
              color={metricItem.color}
              description={metricItem.description}
              formatValue={formatDuration}
              points={metricItem.points}
              title={metricItem.title}
            />
          ))}
          {rateMetrics.map((metricItem) => (
            <TrendPanel
              key={metricItem.key}
              color={metricItem.color}
              description={metricItem.description}
              formatValue={formatPercent}
              points={metricItem.points}
              title={metricItem.title}
            />
          ))}
        </section>

        <section className={styles.twoColumnLayout}>
          <div className={styles.panel}>
            <PanelHeader
              title="Bus-Factor Hotspots"
              description="% share of review submissions by contributor each week"
            />
            <div className={styles.hotspotStack}>
              {snapshot.weekly.map((week) => (
                <ReviewShareWeek key={week.week} week={week} />
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <PanelHeader
              title="Metric Definitions"
              description="Generated from GitHub API data and local git history"
            />
            <dl className={styles.definitionList}>
              {Object.entries(snapshot.definitions).map(([key, value]) => (
                <div key={key}>
                  <dt>{definitionLabel(key)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={styles.panel}>
          <PanelHeader
            title="Weekly Metrics"
            description="One row per ISO week in the generated snapshot"
          />
          <div className={styles.tableScroller}>
            <table className={styles.metricsTable}>
              <thead>
                <tr>
                  <th scope="col">Week</th>
                  <th scope="col">PR cycle</th>
                  <th scope="col">Lead time</th>
                  <th scope="col">Review latency</th>
                  <th scope="col">Pipeline pass</th>
                  <th scope="col">After hours</th>
                  <th scope="col">Top reviewer share</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.weekly.map((week) => (
                  <tr key={week.week}>
                    <th scope="row">
                      <span>{week.week}</span>
                      <small>{week.label}</small>
                    </th>
                    <td>{metricWithSample(week.prCycleTime)}</td>
                    <td>{metricWithSample(week.leadTimeForChanges)}</td>
                    <td>{metricWithSample(week.reviewLatency)}</td>
                    <td>{rateWithSample(week.pipelinePassRate)}</td>
                    <td>{rateWithSample(week.afterHoursCommitRate)}</td>
                    <td>
                      {week.busFactorHotspots[0]
                        ? `${week.busFactorHotspots[0].contributor} (${formatPercent(
                            week.busFactorHotspots[0].share,
                          )})`
                        : "n/a"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <PanelHeader
            title="Merged PR Detail"
            description="Latest pull requests included in cycle-time and lead-time calculations"
          />
          <div className={styles.tableScroller}>
            <table className={styles.metricsTable}>
              <thead>
                <tr>
                  <th scope="col">PR</th>
                  <th scope="col">Author</th>
                  <th scope="col">State</th>
                  <th scope="col">Cycle</th>
                  <th scope="col">Lead</th>
                  <th scope="col">Review latency</th>
                  <th scope="col">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.pullRequests
                  .filter((pullRequest) => pullRequest.mergedAt)
                  .slice(0, 12)
                  .map((pullRequest) => (
                    <tr key={pullRequest.number}>
                      <th scope="row">
                        <a href={pullRequest.url}>
                          #{pullRequest.number} {pullRequest.title}
                        </a>
                      </th>
                      <td>{pullRequest.author}</td>
                      <td>{pullRequest.state}</td>
                      <td>{formatDuration(pullRequest.cycleTimeHours)}</td>
                      <td>{formatDuration(pullRequest.leadTimeForChangesHours)}</td>
                      <td>{formatDuration(pullRequest.reviewLatencyHours)}</td>
                      <td>{pullRequest.reviewCount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <article className={styles.summaryCard}>
      <span className={styles.summaryIcon}>
        <Icon aria-hidden focusable={false} size={18} strokeWidth={2} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function PanelHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <header className={styles.panelHeader}>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

function TrendPanel({
  color,
  description,
  formatValue,
  points,
  title,
}: {
  color: string;
  description: string;
  formatValue: (value: number | null) => string;
  points: SeriesPoint[];
  title: string;
}) {
  return (
    <section className={styles.panel}>
      <PanelHeader title={title} description={description} />
      <WeeklyBars
        color={color}
        formatValue={formatValue}
        points={points}
        title={title}
      />
    </section>
  );
}

function WeeklyBars({
  color,
  formatValue,
  points,
  title,
}: {
  color: string;
  formatValue: (value: number | null) => string;
  points: SeriesPoint[];
  title: string;
}) {
  const numericValues = points
    .map((point) => point.value)
    .filter((value): value is number => Number.isFinite(value));
  const max = Math.max(...numericValues, 1);

  return (
    <div
      aria-label={`${title} by week`}
      className={styles.weeklyBars}
      role="img"
    >
      {points.map((point) => {
        const height = point.value === null ? 0 : Math.max(6, (point.value / max) * 100);

        return (
          <div className={styles.barColumn} key={point.label}>
            <div className={styles.barFrame}>
              <span
                className={`${styles.bar} ${styles[`bar_${color}`]}`}
                style={{ height: `${height}%` }}
              />
            </div>
            <strong>{formatValue(point.value)}</strong>
            <span>{point.label}</span>
            <small>{point.sampleSize > 0 ? `n=${point.sampleSize}` : "n/a"}</small>
          </div>
        );
      })}
    </div>
  );
}

function ReviewShareWeek({ week }: { week: WeeklyMetric }) {
  return (
    <section className={styles.hotspotWeek}>
      <h3>
        <span>{week.week}</span>
        <small>{week.label}</small>
      </h3>
      {week.busFactorHotspots.length > 0 ? (
        <div className={styles.reviewBars}>
          {week.busFactorHotspots.map((reviewer) => (
            <div className={styles.reviewBarRow} key={reviewer.contributor}>
              <div className={styles.reviewBarLabel}>
                <span>{reviewer.contributor}</span>
                <strong>{formatPercent(reviewer.share)}</strong>
              </div>
              <div className={styles.reviewBarTrack}>
                <span style={{ width: `${(reviewer.share ?? 0) * 100}%` }} />
              </div>
              <small>{reviewer.reviews} reviews</small>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>No review submissions recorded.</p>
      )}
    </section>
  );
}

function formatDuration(hours: number | null) {
  if (hours === null) {
    return "n/a";
  }

  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }

  if (hours < 24) {
    return `${hours.toFixed(hours < 10 ? 1 : 0)}h`;
  }

  return `${(hours / 24).toFixed(1)}d`;
}

function formatPercent(rate: number | null) {
  if (rate === null) {
    return "n/a";
  }

  return `${(rate * 100).toFixed(rate > 0 && rate < 0.1 ? 1 : 0)}%`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function metricWithSample(metricItem: TimedMetric) {
  if (metricItem.sampleSize === 0) {
    return "n/a";
  }

  return `${formatDuration(metricItem.averageHours)} avg, ${formatDuration(
    metricItem.medianHours,
  )} median`;
}

function rateWithSample(metricItem: RateMetric) {
  if (metricItem.denominator === 0) {
    return "n/a";
  }

  return `${formatPercent(metricItem.rate)} (${metricItem.numerator}/${metricItem.denominator})`;
}

function definitionLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
