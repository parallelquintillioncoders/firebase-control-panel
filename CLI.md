# Firebase Hosting c-Panel — CLI quick guide

Run these commands in PowerShell from this project folder. Node.js 20+ is required.
The CLI uses the same local panel API and Firebase login as the dashboard.
It uploads individual files from a built folder and does not create ZIP files.

## Commands to remember

| Task | Command |
| --- | --- |
| Start panel | `npm start` |
| Check project syntax | `npm run check` |
| Validate website folder | `npm run verify -- FOLDER` |
| Check and upload folder | `npm run upload -- FOLDER PROJECT_ID SITE_ID` |
| Show help | `npm run help` |

The `--` forwards your arguments to the command. Paths with spaces need quotes.
The original `npm run panel -- …` commands still work.

## Start and check the project

```powershell
cd "C:\Users\Infinix\Downloads\firebase-control-panel"
npm run check
npm start
```

Open <http://127.0.0.1:4183>. Keep this terminal running.
If dependencies are missing, run `npm ci` once before starting.
`npm run check` checks JavaScript syntax; it is not a Firebase connection or deployment test.

In a **second terminal**, open the same project folder:

```powershell
cd "C:\Users\Infinix\Downloads\firebase-control-panel"
npm run help
```

Connect Google using **Settings & setup** or **Easy Publish** in the dashboard.
The CLI reuses that server's Firebase connection.

## Find your project and Hosting site

```powershell
npm run projects
npm run sites -- YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` and `YOUR_SITE_ID` below with IDs from these lists, not display names.

## One command to check and upload

```powershell
npm run upload -- "C:\path\to\your-site\dist" YOUR_PROJECT_ID YOUR_SITE_ID
```

This validates the folder and stages its files locally for that site. It replaces the
site's previous staged build, but **does not change the live website**.
For a React/Vue single-page application that needs index.html fallback routing:

```powershell
npm run upload -- "C:\path\to\your-site\dist" YOUR_PROJECT_ID YOUR_SITE_ID --spa
```

Use a folder containing `index.html` at its root. For a framework project, run its
build command in that website's own folder first, then upload the generated output.
Do not upload this control panel's source folder: the panel itself needs Node.js.
The example static website can be checked without an account or server:

```powershell
npm run verify -- .\example-site
```

Checks enforce 2,500 files, 250 MB total, and 120 MB per file. Symbolic links,
unsupported filenames, `.env` files and common private-key files are rejected;
dependency and Git folders are excluded. This is structural validation, not a
complete secret scanner or a check that every website link works.

## Preview, then publish

Create a Firebase preview release of the staged build:

```powershell
npm run preview -- YOUR_PROJECT_ID YOUR_SITE_ID
```

After reviewing your preview, explicitly publish the staged build to production:

```powershell
npm run deploy -- YOUR_PROJECT_ID YOUR_SITE_ID --confirm
```

**Production deployment replaces the selected site's live release.** These commands
start background jobs and return a job ID; they do not wait for successful completion.
Keep the panel server running, then check the result:

```powershell
npm run jobs
npm run logs -- YOUR_JOB_ID
```

Run `logs` again to refresh progress. A successful preview job includes its preview
URL. A failed job includes its status and available logs. You can also inspect jobs
under **Activity logs** in the dashboard.

The panel's existing Hosting configuration behavior still applies: custom redirects,
headers, Functions rewrites and existing Firebase configuration are not automatically
imported. Review the [README limitations](README.md#security-and-honest-limitations).

## Optional configuration

The default local server address is `http://127.0.0.1:4183`.
For a server you started on a different port:

```powershell
$env:PANEL_URL = "http://127.0.0.1:4184"
```

The CLI only accepts local HTTP addresses. If your server is password-protected,
set the same `DASHBOARD_TOKEN` in the CLI terminal. Avoid putting the password in
command arguments or shell history:

```powershell
$panelCredential = Get-Credential -UserName "panel" -Message "Enter your dashboard password"
$env:DASHBOARD_TOKEN = $panelCredential.GetNetworkCredential().Password
npm run projects
Remove-Item Env:\DASHBOARD_TOKEN
$panelCredential = $null
```

This password unlocks the local panel; it is not your Google password.

## Checks that do not create ZIP files

```powershell
npm run check
npm run test:cli
node tests/test-auth-launch.js
```

CLI tests use a mock local server. They do not upload to Firebase, publish a real
site, or change your account. The existing full `npm test` suite includes archive
tests, so use the commands above when avoiding ZIP creation.

## Short request you can send in chat

> Check this project's UI change and upload my build folder to project PROJECT_ID,
> site SITE_ID. Do not publish production and do not create ZIP files.

Include the build folder path. Publishing production is a separate explicit request.
