# Shop Story — outreach impact report

Open **index.html** in a browser, or publish that file to GitHub Pages. This is the single dashboard deliverable. No installation, Excel connection, or server is required. The HTML contains the full-workbook numbers, tables, charts and initial cost scenario before any JavaScript runs, so file previews and script-blocked browsers can show the report. Controls enable after successful interactive initialization in a browser. Shop and month filters update the results. The cost calculator is an illustrative editable plan. The print button uses the browser's print dialog, where you can save a PDF. Export buttons download the selected service results and the cost scenario.

## Observed results

The export covers March 1, 2025–September 30, 2026 across **14 shops**. Results are attributed associations, not proven incremental revenue or causal lift.

| Measure | Result |
| --- | ---: |
| Source contact rows | 378,338 |
| Exact duplicate rows removed | 907 |
| Remaining contact records | 377,431 |
| Unique revenue-service tasks | 173,105 |
| Tasks credited with a qualifying RO | 25,136 |
| Observed task conversion | 14.5% |
| Mature-cohort task conversion | 15.4% (24,002 / 155,365) |
| Qualifying unique opened ROs | 29,643 |
| Uniquely priced, qualifying posted ROs | 23,145 |
| Verified attributed revenue | $19,078,870.65 |
| Unique shop + appointment IDs, all services | 36,262 |

There are **6,498 qualifying visits with no counted posted revenue**: 1,391 were not posted by the export cutoff, and 5,107 lack an independently identifiable RO amount. They count as visits, but contribute zero dollars. This is deliberately conservative accounting; the workbook is insufficient to establish a complete deduplicated revenue total. An RO-level posted-revenue export would resolve the missing amounts.

## Counting and attribution

- Contact records are deduplicated by all 24 source columns. Different timestamps remain different attempts; no attempt is assumed to be a connected conversation. The Human field is preserved separately in the monthly data.
- Every repair order is identified by **shop + RO ID**. Every appointment is identified by **shop + appointment ID**. A unique task is **shop + Task ID**. IDs reused in different shops stay separate.
- An RO needs a known opening date and an explicitly linked eligible contact dated from 0 through 30 calendar days before opening. Contacts after opening do not qualify. Same-day contacts qualify because RO timestamps are not available.
- The latest eligible revenue-service contact receives the RO's sole credit. A tie is resolved by task ID and source order. A more recent relationship contact does not invalidate an earlier eligible revenue contact, but receives no revenue credit itself.
- Each qualifying RO counts once as a visit, even if multiple tasks or services link to it. One task can produce multiple visits; it counts once as converted. A task shared across source services is grouped under its latest revenue contact's service for task conversion.
- Only posted ROs on or before September 30, 2026 receive revenue. An amount is usable when at least one row lists that RO as the only posted RO, and every individually identifiable amount agrees. A zero amount is valid. Conflicting amounts would be excluded; none were found.
- A row's combined multi-RO dollar total is never divided arbitrarily or added on top of individual RO amounts. Multi-RO orders can still obtain revenue if another singleton row identifies their individual amount.
- Missing opening dates, opening dates after the export cutoff, and contacts outside the window do not receive visit/revenue credit. There are 2,074 IDs missing an opening date, 725 future opening dates, and zero IDs excluded solely because all linked contacts are outside the 30-day window. There are 15,386 IDs with only eligible non-revenue contacts.
- Appointment IDs count once globally per shop and are assigned to the latest linked contact/service month. Appointment dates and direct appointment-to-RO links are missing; appointments are not treated as verified arrivals or as the numerator of a conversion claim. Date-filtered appointment totals are attribution buckets, not bookings that occurred in that month.

## Revenue exclusions and service scope

The requested four services receive **no revenue attribution**: Next Day Satisfaction, Returning Lost Customer, Returning Lost Vehicle, and Welcome New Customer. They are shown separately as relationship activity.

Eligible revenue services are Oil Change Reminder (standard/synthetic/diesel grouped), Pre-Book Oil Change, Service Overdue, Warranty Inspection, State Inspection, Pre-Book State Inspection, BG Services (fuel/brakes/cooling reminders grouped), Reservation No Show, Retention Re-Engage, No Recent Visits, Reopened Missed Sale, and Welcome New Vehicle. **Welcome New Vehicle is included** because the request excluded Welcome New Customer, not Welcome New Vehicle; that distinction is also disclosed inside the dashboard.

Unassigned contacts, General Follow-up, General Service, Visit In Progress, and Pre-Book BG tasks are treated as administrative/non-revenue activity. They contribute contact and appointment totals but no revenue credit, consistent with the exclusions shown in the supplied conversion report. This is an explicit analysis choice, not an assertion that those contacts have no value.

## Dates and conversion

The accounting cutoff is the latest contact date in this export, September 30, 2026; it is not today's date. RO openings/postings beyond it are excluded even if a linked row mentions them.

Calendar charts use actual event months: contacts use contact dates, visits use RO opening dates, and revenue uses posting dates. Tasks and their conversion status are assigned to the last revenue contact month. Filtering March visits alongside March contacts compares calendar activity, not a single conversion cohort.

Observed conversion = converted unique revenue tasks / all unique revenue tasks in the selected latest-contact cohorts. Mature conversion restricts both numerator and denominator to tasks whose last contact date is at least 30 calendar days before the export cutoff. This exposes incomplete follow-up without using an assumed maturity uplift. Longer-running tasks can still have a converted RO from an earlier contact; this is task-level observed conversion.

As of October 26, 2026, the original mixed-shop tenure chart has been replaced by links to three separate size-comparison pages: small.html (under 200 cars/month), medium.html (200 to under 400), and large.html (400+). The user approved these thresholds. The original 14-shop revenue, service, and conversion views remain based on the original contact export; the size comparisons are independent of those filters and totals.

Size-page source: the workbook's "past numbers" sheet, column A shop, B month, D reported Total BDC Visits, and G car count. First appearance is the first active calendar month, as specified by the user. It may be a partial launch month. A fixed shop size is assigned from the median of at least three valid car-count months. Counts must be positive integers with a valid nonnegative integer BDC visit total no larger than car count. A missing or zero car count is not a usable size observation. Most counts begin September 2025, so size is based on observed volume and can be measured after the visit months being compared; it is not a pre-program baseline.

Each size page defaults to the first 12 months, with 6- and 24-month choices. A shop must have one valid visit record for every month from launch through the selected horizon. All bars use the same set of shops; each bar is total reported BDC visits at that tenure month divided by the included shop count. Shops with duplicate month records, gaps, invalid visits, insufficient follow-up, or fewer than three valid car-count observations are excluded. Legitimate zero visits count as zero. No missing month is imputed. First-year eligibility at this build: 1 small, 9 medium, 14 large shops. Small samples are explicitly labeled. Complete records cannot independently verify operation for the entire month or consistent historical reporting definitions.

Car-count comparison policy (approved October 23, 2026): Hughes Motors Auto Repair is excluded from all size comparisons because the user confirmed that its processes make car-count reporting unreliable. Its activity may remain elsewhere. Cordell's Tomah MN and WI are kept separate and excluded pending confirmation that they identify the same location and its true start month. Months with visits above reported cars are excluded from size assignment and retained in the embedded raw data for review. The historical BDC visit totals are reported aggregates, not RO-level deduplicated visits under the main report's 30-day attribution rules. They are not added to main-report visits or revenue. Seasonal effects, later size classification, service mix, and outreach volume remain uncontrolled; no causal lift or predictive ramp is claimed.

Rebuild with package-report.ps1, which extracts the sheet by name using build-size-data.ps1, renders all three populated standalone pages with render-size-pages.cjs, and rebuilds index.html. verify-size-pages.cjs checks fixed samples, reconciliation to source monthly totals, group thresholds, exclusions, static content, page links, and interactive period changes. Upload all four root HTML files together to the existing GitHub Pages folder. This local build does not update GitHub automatically.

The workbook contains outbound contact records. It does not independently identify texts, a no-contact control group, customer acquisition cost, or incremental revenue. No text-specific results, causal uplift, testimonial, or retention recovery claim is invented.

## Cost calculator

Starting service selections, contact volumes, service fees, the $999 program base, and the $699 CRM estimate come from the supplied pricing screenshot. All are editable assumptions, **not confirmed current pricing**. Pre-Book Oil Change starts at 63 contacts and $625, as pictured; no universal per-call price is imposed.

The initial eight-service scenario totals **930 contacts and $6,623 per month**, matching the screenshot. The calculator uses historical full-export **unique qualifying visits / contact attempts** for each selected revenue service. Next Day Satisfaction has zero modeled revenue visits. Shop/date filters affect evidence views, while the calculator retains the full-export benchmark.

Modeled revenue = modeled visits × entered average repair order. Revenue multiple = modeled revenue / total plan cost. Gross profit after plan cost = modeled revenue × entered gross margin − total plan cost. Break-even visits = rounded-up total cost / (ARO × margin). A zero ARO or margin produces an unavailable break-even result. Six-month numbers assume constant monthly activity; no startup ramp or guaranteed lift is applied.

## Files and verification

- **index.html** — standalone interactive and printable dashboard, ready for GitHub Pages.
- **Shop Story Monthly Data.csv** — aggregated shop/service/month data, without customer identifiers or phone numbers.
- **Shop Story RO Ledger.csv** — one row per unique shop + RO, with qualifying contact, credited service/task, counted dollars, and inclusion/exclusion reason.
- **Shop Story Reconciliation.json** — workbook-wide audit totals.
- **dashboard/dist/** — editable HTML/CSS/JavaScript source.
- **build-data.ps1**, **analyze.cs**, **inspect.ps1** — workbook extraction and accounting implementation.
- **package-report.ps1** — rebuilds standalone HTML and exports after changes.
- **verify-analysis.ps1**, **verify-dashboard.cjs** — regression and reconciliation checks.

Accounting tests passed for duplicate rows, identical IDs across shops, the four revenue exclusions, 30/31-day boundaries, latest eligible contact attribution, unresolved multi-RO amounts, and future-date exclusion. Dashboard logic checks passed for full-workbook reconciliation, initial output, shop/date filters, mature-cohort display, selected service fees, and zero-margin calculations. Browser rendering and PDF pagination have not been visually verified in this environment. The dashboard is delivered locally; hosted publication was unavailable because the environment lacks Git, which the Sites source-publication workflow requires.

Prepared October 14, 2026, using the workbook and supplied reference screenshots.
