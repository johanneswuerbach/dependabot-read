# dependabot-read

Mark dependabot notifications as ready

Usage:

Create a [token](https://github.com/settings/tokens) with `notifications` and `repo` permissions.

Run the script to mark notifications created by `dependabot[bot]` and `dependabot-preview[bot]` as read.

```bash
export GITHUB_TOKEN=MY_TOKEN
npm ci
npm start
```
