# Automation Audit Lab (isolated synthetic pages)

This lab audits visible UI element types on a **local synthetic fixture**. It intentionally does not interact with answer controls, drag elements, connect nodes, or submit tasks, and it does not target live educational sites.

## Run
1. Install Node.js 20+.
2. `npm install`
3. `npx playwright install chromium`
4. Terminal A: `npm run serve`
5. Terminal B: `npm run audit`

The audit writes:
- `artifacts/report.json` — element inventory and counts
- `artifacts/page.png` — page screenshot

Override the local URL only to another owned, explicitly authorized test fixture:
`LAB_URL=http://127.0.0.1:4173 npm run audit`
