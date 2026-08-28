# Upload this folder to GitHub

This is a safe snapshot of the Questlog project. Create a new empty repository on GitHub, then upload the contents of this folder (not this folder's parent directory).

## Safe to upload

All files in this folder are safe to upload, including `.env.example`. It contains placeholders only.

## Do not upload from your working project

- `.env` — real keys and secrets
- `node_modules` — installed packages; run `npm install` instead
- Any credentials, exports, or personal screenshots you add later

## Keeping this snapshot current

This folder is a snapshot. When you make future changes in the main project, re-run `REFRESH_UPLOAD_SNAPSHOT.ps1` from the project root before uploading again.
