# Launchpad Easy Publish — Firebase Hosting Manager V4

A cPanel-style local app with a **beginner-friendly 4-step publishing guide** and a separate advanced dashboard. Manages **classic Firebase Hosting** sites, not Firebase App Hosting.

## Appearance and language

The new flame/C logo is used throughout the panel. **Flame**, the orange/yellow
logo palette, is the default; choose **Classic** in the top bar for the original
purple palette. Light/dark mode is independent of the color theme and also has a
toggle inside Easy Publish.

The top-bar language selector supports English, Spanish, Russian, French, German,
Portuguese, Arabic (with right-to-left layout), and Simplified Chinese. Navigation,
primary controls, page headings, and setup labels use local translations.
Technical diagnostics, server messages, project names, IDs and URLs retain their
original content; some detailed technical help remains in English.

Theme, display mode and language are saved locally in this browser. If browser
storage is unavailable, the selected preferences apply for the current visit.
The account avatar opens account details and a shortcut to Settings. The Workspace
breadcrumb returns to Overview.

## Short CLI commands

See [CLI.md](CLI.md) for setup, checking a build folder, uploading without ZIPs,
previewing, publishing, and checking deployment logs.

```powershell
npm run check
npm start
```

In a second terminal, use `npm run help`. To validate and upload a built
folder without publishing: `npm run upload -- "C:\path\to\dist" PROJECT_ID SITE_ID`.

## Start on Windows (no commands)

1. Install [Node.js 20+](https://nodejs.org/) once, only if it is not already installed.
2. Extract the folder.
3. Inside the `firebase-control-panel` folder, **double-click `START-HERE.bat`**.
4. On first launch, it automatically installs the dashboard and Firebase CLI. Wait for setup to finish.
5. Once the local server starts, Chrome/default browser opens **http://127.0.0.1:4183** automatically.
6. Follow the **Easy Publish** guide: **Connect Google → Select/Create a website → Upload ZIP/folder → Preview & Publish**.

Keep the starter window open while working or deploying. There is **no need to type `firebase login`, `npm install`, `npm start`, or edit PATH**.

## Start on macOS (no commands)

1. Install [Node.js 20+](https://nodejs.org/) or via Homebrew (`brew install node`).
2. Inside the `firebase-control-panel` folder, **double-click `START-HERE-MAC.command`** (or `start-mac.command`).
3. It auto-detects Node (Apple Silicon / Intel Homebrew, NVM, standard Unix paths), installs dependencies on first launch, and opens **http://127.0.0.1:4183** in your browser automatically.
4. Keep the Terminal window open while using Launchpad.

## Start on Linux

1. Ensure Node.js 20+ is installed.
2. In terminal, run: `./start-linux.sh`.
3. Open **http://127.0.0.1:4183** in your browser.

## Terms, Privacy and Local Storage

Launchpad includes dedicated **Terms & conditions** and **Privacy & local storage** modals accessible from the footer on any screen. All builds, uploads, and deployment histories remain private on your local machine. Firebase account access communicates with Google through the official Firebase CLI. No external advertising trackers or analytics are installed.

### What Google sign-in means

Launchpad starts the **official Firebase CLI login** in an interactive Windows sign-in window. Google's browser sign-in opens as part of that process. Choose the Google account that owns your Firebase project and approve access. The sign-in flow requests fresh Firebase authorization and skips the optional Gemini/CLI usage prompts. The window closes automatically after successful sign-in. Google may identify the official authorization client as “Firebase CLI”; this is the connection used to access your Firebase projects and Hosting sites. Launchpad checks login status and loads authorized projects/sites. You never enter your Google password into the Launchpad panel.

**Google approval cannot be automated away.** V4 now starts a **visible PowerShell sign-in window using `Start-Process` and checks the Windows launch result** instead of silently assuming it opened. If your Windows security settings block popups, click **Sign-in window not appearing? Use browser sign-in here** right inside the Easy Publish wizard, then click **Open Google login** and paste the one-time code Google provides. Google account/project/Hosting permissions are required.

## Publishing a website

- Choose an **existing Firebase Hosting site** or create one in the wizard. Creating a real Firebase project or site requires suitable Google permissions and may be subject to quotas or other Google rules.
- Upload the prepared **static website** ZIP or directory containing `index.html` at its website root. A React/Vite/Vue app should be built first; upload its output `dist` or `build` folder, not raw source code.
- View the **local preview**. A shareable Firebase Hosting preview channel link can also be created, without changing production.
- Use **Publish website** only after verifying the selected **live URL**. The panel shows confirmation with that URL before production deployment. Each deployment targets only the selected Hosting site.
- Background deployment jobs and detailed CLI logs are visible in the advanced dashboard. Keep the server running.

## Advanced dashboard

The **Open full dashboard** button gives access to website listing, multiple Firebase projects, files, release previews, production deployments, activity logs, errors and project/site creation. All API operations use the *locally installed* `firebase-tools` package, not a global Windows PATH entry.

## Security and honest limitations

- This is a **local Node.js app**, not a static HTML-only Firebase uploader or a standalone Windows `.exe`.
- Default localhost port is **4183**, separate from v2's 4173; old and new dashboard windows won't get mixed up.
- Do not expose the local server publicly without stronger security, HTTPS, network controls and setting a sufficiently long `DASHBOARD_TOKEN`. The server rejects non-local binding with weak/no token.
- Authorization remains in the official Firebase CLI's local credential storage for that OS user. Do not share credentials or authorization links/codes.
- Local preview responses use a restrictive browser sandbox. Upload only website content you trust.
- Existing Firebase Hosting rules involving redirects, headers, functions, and rewrites are **not inherited** when a new temporary per-site config is generated. The SPA setting generates a catch-all rewrite; review complicated sites before deployment.
- No GitHub source-code build, Firestore, Functions, Cloud Run or App Hosting manager is included.
- A real Firebase account login and remote deployment cannot be validated without your own Google authorization. Browser/UI checks and code syntax checks are not proof of remote publishing.

## Troubleshooting

| What happened | What to do |
|---|---|
| Node.js not found | Install Node.js LTS from nodejs.org and double-click START-HERE again. |
| Browser didn't open | Manually visit http://127.0.0.1:4183 after the starter says the server is ready. |
| Google sign-in window doesn't appear | Click **Sign-in window not appearing? Use browser sign-in here** under Connect Google. Start browser sign-in, open the official Google link and enter the authorization code. |
| No websites found | Check the signed-in account, project permissions or use Create website in step 2. |
| Website ZIP rejected | Ensure the ZIP or folder has `index.html` at its website root; upload built output. |
| Deploy failed | Full dashboard → Activity logs; inspect the job error and check Hosting permissions. |
| Port 4183 busy | Close other V4 launcher windows and retry. |

## Project layout

```text
firebase-control-panel/
  START-HERE.bat          <-- double-click on Windows
  start-windows.bat       <-- called by START-HERE.bat
  START-HERE-MAC.command  <-- double-click on macOS
  start-mac.command       <-- called by START-HERE-MAC.command
  start-linux.sh
  package.json
  public/
    index.html
    styles.css            <-- advanced dashboard styling
    app.js                <-- advanced dashboard logic
    easy-setup.css        <-- new beginner wizard styling
    easy-setup.js         <-- new beginner workflow
  server/
    index.js              <-- REST API, protected uploads and deployments
    auth.js               <-- Google CLI connection
    firebase-cli.js       <-- project-local Firebase CLI wrapper
    stage.js              <-- validates/stages website builds
    store.js              <-- local job history
  scripts/login-windows.ps1
  scripts/launch-login-windows.ps1
  example-site/           <-- safe small demo build
  .env.example
  README.md
  HINDI-START.txt
```

Official docs: https://firebase.google.com/docs/cli and https://firebase.google.com/docs/hosting

## V4 sign-in correction

The previous backend spawned `powershell.exe` detached with ignored standard handles and said **window opened** without waiting for Windows to confirm. This is unreliable on Windows. V4 uses a dedicated `Start-Process` launcher, checks its exit code and child PID, and displays errors in the UI. The alternative browser-code flow is now available **inside the guided setup**, not buried in advanced settings. The launcher can confirm the Windows process was started, but it cannot guarantee Chrome itself will be permitted to open on every corporate machine.

## Download a website (V4 update)

In Easy Publish, choose a project and website in step 2, then click **Download live website ZIP** or **Download uploaded ZIP**. In the full dashboard, click **Download** on a website card to open these options.

- **Live ZIP** uses your signed-in Firebase account to list the active release, downloads its public static files, and verifies their gzip SHA256 hashes. It does not publish or modify the website. A changed release, inaccessible file, redirect to another domain, custom compression, or routing that hides a file causes a clear error rather than an incomplete ZIP. Limits: 2500 files, 250 MB, ten minutes.
- **Uploaded ZIP** exports the latest locally staged build exactly, with website files at the ZIP root. It can differ from the current live site and is unavailable until you upload a build on this computer.
- Neither download reconstructs original React/Vue source, server code, Functions, Firestore data, secrets, or Hosting configuration. Keep the original project separately. Live recovery requires access to the Hosting API and publicly accessible file URLs.

The live downloader uses the bundled Firebase CLI authentication internals; keep the supplied package-lock.json and use npm ci for reproducible installation.

## Log out (V4 update)

Click **Log out** in either screen header. Confirmation explains that all Firebase CLI accounts on this computer will be disconnected, including other CLI sessions. It clears the dashboard cookie and returns to sign-in. Live sites and saved uploads are retained. Close separate Google sign-in windows first; wait for deployments/downloads to finish. Service-account or FIREBASE_TOKEN environment authentication must be removed from the server environment followed by a restart; the panel reports this instead of claiming logout succeeded.

## Checks

Run `npm run check` and `npm test`. Download tests use isolated temporary data and simulated Firebase responses; they do not deploy, sign out your real account, or alter live websites.

## Updating an existing V4 installation

Close the running Launchpad server window first. Extract this ZIP and copy the contents of its firebase-control-panel folder into your existing V4 firebase-control-panel folder, replacing matching program files. Keep your existing data and node_modules folders. Start START-HERE.bat again, then refresh the browser. The original V4 Windows launcher and Google login scripts are retained.

Alternatively, extract to a separate folder for a clean installation. Locally uploaded builds remain in the old installation's data folder unless you copy it into the new installation while both servers are stopped.

## Reserved Firebase URL download fix

Live downloads omit paths under /__/ because Firebase serves reserved runtime responses there, hiding any uploaded file at the same path. When omissions occur, the ZIP includes LAUNCHPAD-EXPORT-NOTES.txt (with a unique prefix if that filename already exists) listing all omitted paths. Normal static files still require hash verification. This export is not a complete original deployment backup. Firebase Hosting supplies its runtime URLs; local previews or other hosts may need SDK/configuration setup.
