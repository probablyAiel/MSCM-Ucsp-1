# My Social Circle Map

> A small, moving portrait of the people, places, and relationships that shape a life.

My Social Circle Map is a visual school project about seeing relationships as a living system rather than a flat list. Eight pastel rings create a path from the people closest to me to the wider social structures around me:

**Primary Groups** -> **Secondary Groups** -> **Reference Groups** -> **In Groups** -> **Out Groups** -> **Virtual Groups** -> **Gemeinschaft** -> **Gesellschaft**

The map is intentionally personal, quiet, and a little playful. People orbit their place in the circle, connectors find the main person for each group, and every profile can carry its own image and explanation.

## What it does

- Shows eight relationship rings around `ME`
- Animates people smoothly around their assigned rings
- Supports multiple people in the same ring without replacing anyone
- Automatically spaces multiple people around a shared ring with gentle, changing separation
- Connects `ME` to each ring's selected main person, or the closest person when no main person is set
- Opens a focused profile card with a portrait, name, relationship, group, and personal explanation
- Includes a List view directory of everyone in the map, with ring labels and main-person badges
- Lets a person focus independently without moving the other people on that ring
- Adds new people through a password-gated form
- Supports ring selection, main-person selection, personal notes, and portrait uploads
- Saves added people in browser local storage for the current device
- Works as a responsive static website on desktop and mobile

## Run locally

Open `index.html` directly, or start a tiny local server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Add people

Click **Add person** and enter the workspace password when prompted. The current password is `2010`.

The password is a front-end project gate, not real security. Anyone who can inspect the website source can find it. Real privacy would require a server-side authentication system.

## GitHub Pages

Every push to `main` deploys automatically through GitHub Actions.

Live preview: https://bensaccountidk.github.io/MSCM-Ucsp-1/

Deployment workflow: `.github/workflows/deploy-pages.yml`
