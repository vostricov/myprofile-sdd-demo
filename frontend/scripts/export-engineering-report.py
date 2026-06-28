#!/usr/bin/env python3
import json
import os
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape


FRONTEND_ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = (
    FRONTEND_ROOT
    / "src"
    / "fixtures"
    / "repo-dashboard"
    / "engineering-metrics.json"
)
REPORTS_DIR = FRONTEND_ROOT / "reports"


def parse_iso(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def report_date(snapshot):
    generated_at = parse_iso(snapshot["generatedAt"]) or datetime.now(timezone.utc)
    return generated_at.date().isoformat()


def format_hours(value):
    if value is None:
        return "n/a"
    if value < 1:
        return f"{round(value * 60)}m"
    if value < 24:
        return f"{value:.1f}h" if value < 10 else f"{value:.0f}h"
    return f"{value / 24:.1f}d"


def format_percent(value):
    if value is None:
        return "n/a"
    return f"{value * 100:.1f}%" if 0 < value < 0.1 else f"{value * 100:.0f}%"


def metric_summary(metric):
    if metric["sampleSize"] == 0:
        return "n/a"
    return (
        f"{format_hours(metric['averageHours'])} avg, "
        f"{format_hours(metric['medianHours'])} median, n={metric['sampleSize']}"
    )


def rate_summary(rate):
    if rate["denominator"] == 0:
        return "n/a"
    return f"{format_percent(rate['rate'])} ({rate['numerator']}/{rate['denominator']})"


def md_table(headers, rows):
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(markdown_cell(value) for value in row) + " |")
    return "\n".join(lines)


def markdown_cell(value):
    if value is None:
        return "n/a"
    return str(value).replace("|", "\\|").replace("\n", " ")


def build_markdown(snapshot):
    summary = snapshot["summary"]
    weekly_rows = []
    for week in snapshot["weekly"]:
        top = week["busFactorHotspots"][0] if week["busFactorHotspots"] else None
        weekly_rows.append(
            [
                week["week"],
                week["label"],
                metric_summary(week["prCycleTime"]),
                metric_summary(week["leadTimeForChanges"]),
                metric_summary(week["reviewLatency"]),
                rate_summary(week["pipelinePassRate"]),
                rate_summary(week["afterHoursCommitRate"]),
                (
                    f"{top['contributor']} ({format_percent(top['share'])})"
                    if top
                    else "n/a"
                ),
            ]
        )

    performance_rows = []
    for week in snapshot["weekly"]:
        for contributor in week["contributors"]:
            performance_rows.append(
                [
                    week["week"],
                    week["label"],
                    contributor["contributor"],
                    contributor["activities"],
                    contributor["commits"],
                    contributor["reviews"],
                    contributor["additions"],
                    contributor["deletions"],
                ]
            )

    review_rows = []
    for week in snapshot["weekly"]:
        for reviewer in week["busFactorHotspots"]:
            review_rows.append(
                [
                    week["week"],
                    reviewer["contributor"],
                    reviewer["reviews"],
                    format_percent(reviewer["share"]),
                ]
            )

    pr_rows = []
    for pull_request in snapshot["pullRequests"]:
        if not pull_request["mergedAt"]:
            continue
        pr_rows.append(
            [
                f"#{pull_request['number']}",
                pull_request["title"],
                pull_request["author"],
                pull_request["reviewCount"],
                format_hours(pull_request["cycleTimeHours"]),
                format_hours(pull_request["leadTimeForChangesHours"]),
                format_hours(pull_request["reviewLatencyHours"]),
                pull_request["url"],
            ]
        )

    definition_rows = [
        [definition_label(key), value]
        for key, value in snapshot["definitions"].items()
    ]

    lines = [
        f"# Engineering Metrics Report - {snapshot['repository']['nameWithOwner']}",
        "",
        f"Generated: {snapshot['generatedAt']}",
        f"Repository: {snapshot['repository']['url']}",
        f"Default branch: {snapshot['repository']['defaultBranch'] or 'n/a'}",
        "",
        "## Summary",
        "",
        md_table(
            ["Metric", "Value"],
            [
                ["Pull requests analyzed", summary["pullRequestsAnalyzed"]],
                ["Merged pull requests", summary["mergedPullRequests"]],
                ["Review submissions", summary["reviewSubmissions"]],
                ["Completed workflow runs", summary["completedWorkflowRuns"]],
                ["Commits analyzed", summary["commitsAnalyzed"]],
                ["Active contributors", len(summary["contributors"])],
                ["PR cycle time", metric_summary(summary["prCycleTime"])],
                ["Lead time for changes", metric_summary(summary["leadTimeForChanges"])],
                ["Review latency", metric_summary(summary["reviewLatency"])],
                ["Pipeline pass rate", rate_summary(summary["pipelinePassRate"])],
                ["After-hours work", rate_summary(summary["afterHoursCommitRate"])],
                [
                    "Highest weekly review share",
                    format_percent(summary["highestWeeklyReviewShare"]),
                ],
            ],
        ),
        "",
        "## Weekly Metrics",
        "",
        md_table(
            [
                "Week",
                "Range",
                "PR cycle",
                "Lead time",
                "Review latency",
                "Pipeline pass",
                "After hours",
                "Top reviewer share",
            ],
            weekly_rows,
        ),
        "",
        "## Individual Performance",
        "",
        md_table(
            [
                "Week",
                "Range",
                "Contributor",
                "Activities",
                "Commits",
                "Reviews",
                "Added lines",
                "Deleted lines",
            ],
            performance_rows,
        ),
        "",
        "## Bus-Factor Review Shares",
        "",
        md_table(["Week", "Contributor", "Reviews", "Share"], review_rows),
        "",
        "## Merged PR Detail",
        "",
        md_table(
            [
                "PR",
                "Title",
                "Author",
                "Reviews",
                "Cycle",
                "Lead",
                "Review latency",
                "URL",
            ],
            pr_rows,
        ),
        "",
        "## Metric Definitions",
        "",
        md_table(["Metric", "Definition"], definition_rows),
        "",
    ]
    return "\n".join(lines)


def definition_label(key):
    label = []
    for char in key:
        if char.isupper():
            label.append(" ")
        label.append(char)
    return "".join(label).strip().capitalize()


def xlsx_col(index):
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def xlsx_cell(row_index, col_index, value, style=0):
    ref = f"{xlsx_col(col_index)}{row_index}"
    style_attr = f' s="{style}"' if style else ""
    if value is None:
        return f'<c r="{ref}"{style_attr}/>'
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return f'<c r="{ref}"{style_attr}><v>{value}</v></c>'
    return (
        f'<c r="{ref}" t="inlineStr"{style_attr}>'
        f"<is><t>{escape(str(value))}</t></is></c>"
    )


def xlsx_row(row_index, values, style_by_col=None):
    style_by_col = style_by_col or {}
    cells = [
        xlsx_cell(row_index, col_index, value, style_by_col.get(col_index, 0))
        for col_index, value in enumerate(values, start=1)
    ]
    return f'<row r="{row_index}">{"".join(cells)}</row>'


def sheet_xml(rows, column_widths):
    max_row = len(rows)
    max_col = max((len(row[0]) for row in rows), default=1)
    cols = "".join(
        f'<col min="{index}" max="{index}" width="{width}" customWidth="1"/>'
        for index, width in enumerate(column_widths, start=1)
    )
    sheet_rows = []
    for row_index, (values, styles) in enumerate(rows, start=1):
        sheet_rows.append(xlsx_row(row_index, values, styles))
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:{xlsx_col(max_col)}{max_row}"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft"/>
    </sheetView>
  </sheetViews>
  <cols>{cols}</cols>
  <sheetData>{''.join(sheet_rows)}</sheetData>
</worksheet>'''


def styles_xml():
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="11"/><color rgb="FF17212B"/><name val="Aptos"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font>
    <font><b/><sz val="16"/><color rgb="FF17212B"/><name val="Aptos Display"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left/><right/><top/><bottom style="thin"><color rgb="FFD8DEE6"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="5">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
    <xf numFmtId="10" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>'''


def build_workbook_sheets(snapshot):
    summary = snapshot["summary"]
    summary_rows = [
        ([f"Engineering Metrics Report - {snapshot['repository']['nameWithOwner']}"], {1: 2}),
        (["Generated", snapshot["generatedAt"]], {1: 3, 2: 3}),
        (["Repository", snapshot["repository"]["url"]], {1: 3, 2: 3}),
        (["Default branch", snapshot["repository"]["defaultBranch"] or "n/a"], {1: 3, 2: 3}),
        ([], {}),
        (["Metric", "Value", "Detail"], {1: 1, 2: 1, 3: 1}),
        (["Pull requests analyzed", summary["pullRequestsAnalyzed"], ""], {}),
        (["Merged PRs", summary["mergedPullRequests"], ""], {}),
        (["Review submissions", summary["reviewSubmissions"], ""], {}),
        (["Completed workflow runs", summary["completedWorkflowRuns"], ""], {}),
        (["Commits analyzed", summary["commitsAnalyzed"], ""], {}),
        (["Active contributors", len(summary["contributors"]), ""], {}),
        (
            [
                "PR cycle time",
                summary["prCycleTime"]["averageHours"],
                metric_summary(summary["prCycleTime"]),
            ],
            {},
        ),
        (
            [
                "Lead time for changes",
                summary["leadTimeForChanges"]["averageHours"],
                metric_summary(summary["leadTimeForChanges"]),
            ],
            {},
        ),
        (
            [
                "Review latency",
                summary["reviewLatency"]["averageHours"],
                metric_summary(summary["reviewLatency"]),
            ],
            {},
        ),
        (
            [
                "Pipeline pass rate",
                summary["pipelinePassRate"]["rate"],
                rate_summary(summary["pipelinePassRate"]),
            ],
            {2: 4},
        ),
        (
            [
                "After-hours work",
                summary["afterHoursCommitRate"]["rate"],
                rate_summary(summary["afterHoursCommitRate"]),
            ],
            {2: 4},
        ),
        (
            [
                "Highest weekly review share",
                summary["highestWeeklyReviewShare"],
                "Highest single-contributor weekly review share",
            ],
            {2: 4},
        ),
    ]

    weekly_rows = [
        (
            [
                "Week",
                "Range",
                "PR cycle avg h",
                "PR cycle median h",
                "PR n",
                "Lead avg h",
                "Lead median h",
                "Lead n",
                "Review avg h",
                "Review median h",
                "Review n",
                "Pipeline pass %",
                "Passed",
                "Runs",
                "After-hours %",
                "After-hours commits",
                "Commits",
                "Top reviewer",
                "Top reviewer share",
            ],
            {index: 1 for index in range(1, 20)},
        )
    ]
    for week in snapshot["weekly"]:
        top = week["busFactorHotspots"][0] if week["busFactorHotspots"] else {}
        weekly_rows.append(
            (
                [
                    week["week"],
                    week["label"],
                    week["prCycleTime"]["averageHours"],
                    week["prCycleTime"]["medianHours"],
                    week["prCycleTime"]["sampleSize"],
                    week["leadTimeForChanges"]["averageHours"],
                    week["leadTimeForChanges"]["medianHours"],
                    week["leadTimeForChanges"]["sampleSize"],
                    week["reviewLatency"]["averageHours"],
                    week["reviewLatency"]["medianHours"],
                    week["reviewLatency"]["sampleSize"],
                    week["pipelinePassRate"]["rate"],
                    week["pipelinePassRate"]["numerator"],
                    week["pipelinePassRate"]["denominator"],
                    week["afterHoursCommitRate"]["rate"],
                    week["afterHoursCommitRate"]["numerator"],
                    week["afterHoursCommitRate"]["denominator"],
                    top.get("contributor", "n/a"),
                    top.get("share"),
                ],
                {12: 4, 15: 4, 19: 4},
            )
        )

    contributor_rows = [
        (
            [
                "Week",
                "Range",
                "Contributor",
                "Activities",
                "Commits",
                "Reviews",
                "Added lines",
                "Deleted lines",
            ],
            {index: 1 for index in range(1, 9)},
        )
    ]
    for week in snapshot["weekly"]:
        for contributor in week["contributors"]:
            contributor_rows.append(
                (
                    [
                        week["week"],
                        week["label"],
                        contributor["contributor"],
                        contributor["activities"],
                        contributor["commits"],
                        contributor["reviews"],
                        contributor["additions"],
                        contributor["deletions"],
                    ],
                    {},
                )
            )

    review_rows = [
        (["Week", "Range", "Contributor", "Reviews", "Share"], {i: 1 for i in range(1, 6)})
    ]
    for week in snapshot["weekly"]:
        for reviewer in week["busFactorHotspots"]:
            review_rows.append(
                (
                    [
                        week["week"],
                        week["label"],
                        reviewer["contributor"],
                        reviewer["reviews"],
                        reviewer["share"],
                    ],
                    {5: 4},
                )
            )

    pr_rows = [
        (
            [
                "PR",
                "Title",
                "State",
                "Author",
                "Created",
                "Merged",
                "Reviews",
                "Cycle h",
                "Lead h",
                "Review latency h",
                "URL",
            ],
            {index: 1 for index in range(1, 12)},
        )
    ]
    for pull_request in snapshot["pullRequests"]:
        pr_rows.append(
            (
                [
                    pull_request["number"],
                    pull_request["title"],
                    pull_request["state"],
                    pull_request["author"],
                    pull_request["createdAt"],
                    pull_request["mergedAt"] or "",
                    pull_request["reviewCount"],
                    pull_request["cycleTimeHours"],
                    pull_request["leadTimeForChangesHours"],
                    pull_request["reviewLatencyHours"],
                    pull_request["url"],
                ],
                {},
            )
        )

    definition_rows = [
        (["Metric", "Definition"], {1: 1, 2: 1}),
        *[
            ([definition_label(key), value], {})
            for key, value in snapshot["definitions"].items()
        ],
    ]

    return [
        ("Summary", summary_rows, [34, 18, 56]),
        ("Weekly Metrics", weekly_rows, [13, 22, 14, 16, 10, 12, 14, 10, 13, 15, 10, 14, 10, 10, 13, 18, 10, 32, 16]),
        ("Individual Perf", contributor_rows, [13, 22, 34, 12, 10, 10, 14, 14]),
        ("Review Shares", review_rows, [13, 22, 36, 12, 12]),
        ("PR Detail", pr_rows, [8, 58, 12, 20, 24, 24, 10, 10, 10, 16, 72]),
        ("Definitions", definition_rows, [28, 110]),
    ]


def write_xlsx(snapshot, output_path):
    sheets = build_workbook_sheets(snapshot)
    content_type_overrides = [
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
    ]
    for index in range(1, len(sheets) + 1):
        content_type_overrides.append(
            f'<Override PartName="/xl/worksheets/sheet{index}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        )

    workbook_sheets = []
    workbook_rels = []
    for index, (name, _, _) in enumerate(sheets, start=1):
        workbook_sheets.append(
            f'<sheet name="{escape(name)}" sheetId="{index}" r:id="rId{index}"/>'
        )
        workbook_rels.append(
            f'<Relationship Id="rId{index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{index}.xml"/>'
        )
    workbook_rels.append(
        f'<Relationship Id="rId{len(sheets) + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    )

    generated_at = snapshot["generatedAt"]

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(
            "[Content_Types].xml",
            f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  {''.join(content_type_overrides)}
</Types>''',
        )
        archive.writestr(
            "_rels/.rels",
            '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>''',
        )
        archive.writestr(
            "docProps/core.xml",
            f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:title>Engineering Metrics Report</dc:title>
  <dc:creator>Codex</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">{escape(generated_at)}</dcterms:created>
</cp:coreProperties>''',
        )
        archive.writestr(
            "docProps/app.xml",
            f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Codex</Application>
  <Sheets>{len(sheets)}</Sheets>
</Properties>''',
        )
        archive.writestr(
            "xl/workbook.xml",
            f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>{''.join(workbook_sheets)}</sheets>
</workbook>''',
        )
        archive.writestr(
            "xl/_rels/workbook.xml.rels",
            f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{''.join(workbook_rels)}</Relationships>''',
        )
        archive.writestr("xl/styles.xml", styles_xml())
        for index, (_, rows, widths) in enumerate(sheets, start=1):
            archive.writestr(f"xl/worksheets/sheet{index}.xml", sheet_xml(rows, widths))


def copy_latest(source_path, latest_path):
    latest_path.write_bytes(source_path.read_bytes())


def main():
    snapshot = json.loads(SNAPSHOT_PATH.read_text())
    output_date = report_date(snapshot)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    md_path = REPORTS_DIR / f"engineering-metrics-report-{output_date}.md"
    xlsx_path = REPORTS_DIR / f"engineering-metrics-report-{output_date}.xlsx"
    latest_md_path = REPORTS_DIR / "engineering-metrics-report-latest.md"
    latest_xlsx_path = REPORTS_DIR / "engineering-metrics-report-latest.xlsx"

    md_path.write_text(build_markdown(snapshot), encoding="utf-8")
    write_xlsx(snapshot, xlsx_path)
    copy_latest(md_path, latest_md_path)
    copy_latest(xlsx_path, latest_xlsx_path)

    print(
        json.dumps(
            {
                "markdown": str(md_path),
                "xlsx": str(xlsx_path),
                "latestMarkdown": str(latest_md_path),
                "latestXlsx": str(latest_xlsx_path),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
