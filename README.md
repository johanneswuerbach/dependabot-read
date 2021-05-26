# dependabot-read

## Deprecated

GitHub supports now to filter notifications [by author](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/viewing-and-triaging-notifications/managing-notifications-from-your-inbox#supported-queries-for-custom-filters) so you can create a filter like `is:unread author:app/dependabot`, which solves the same use-case, but natively.

## Outdated

Mark dependabot notifications as ready

Usage:

Create a [token](https://github.com/settings/tokens) with `notifications` and `repo` permissions.

Run the script to mark notifications created by `dependabot[bot]` and `dependabot-preview[bot]` as read.

```bash
export GITHUB_TOKEN=MY_TOKEN
npm ci
npm start
```
