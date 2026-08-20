# My Social Circle Map

A dependency-free interactive social circle map for visualizing different kinds of relationships and groups.

## Run locally

Open `index.html` in a browser, or serve the folder with any static file server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Current features

- Eight pastel relationship rings, ordered from Primary Groups to Gesellschaft
- Pre-existing people orbiting their assigned rings with smooth variable-speed motion
- Live connectors from `ME` to the closest person in each ring
- Add-person form with ring assignment, main-person connector selection, notes, and local portrait uploads
- Clickable people with a focused ring and an information card containing their portrait, relationship, group, and context
- Responsive layout for desktop and mobile screens

## GitHub Pages preview

Every push to `main` automatically deploys the site through GitHub Actions. Once the first workflow run completes, the public preview is available at:

https://bensaccountidk.github.io/MSCM-Ucsp-1/

The current prototype is a static client-side experience. People added through the form are saved in the browser's local storage; there is no shared backend yet.

## Deployment

Every push to `main` automatically deploys the site through GitHub Actions using `.github/workflows/deploy-pages.yml`.
