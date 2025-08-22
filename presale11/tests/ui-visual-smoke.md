# UI Visual Smoke Checklist

This is a lightweight manual smoke checklist to compare rendered UI against the design until automated snapshots are added.

Areas to check:
1. TokenList header line: title, 5 tips pills, bell button (hover/focus states)
2. TokenList search capsule and SunSwap capsule + 3 circle buttons
3. TokenList card: round logo badge, green gain pill, market cap rail with white handle, contract capsule with copy
4. LaunchRWA top controls: 4-dots menu, Launch RWA pill, fundraising capsule
5. LaunchRWA main card: background image + dark overlay, top-right circle arrow button, bottom pager dots

Expected colors reference: variables in src/tron/styles/variables.css

Note: run `npm run serve` and navigate to the HomePage to verify. Prefer mobile viewport ~390x844 for closer parity with design.

