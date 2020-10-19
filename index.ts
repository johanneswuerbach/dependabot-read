import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

const ignoredUsers = ['dependabot[bot]', 'dependabot-preview[bot]']

const init = async () => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const options = octokit.activity.listNotificationsForAuthenticatedUser

  for await (const notificationsResponse of octokit.paginate.iterator(options)) {
    for (const notification of notificationsResponse.data) {
      if (notification.subject.type != 'PullRequest') {
        continue
      }

      const pr = await octokit.request(`GET ${notification.subject.url}`) as RestEndpointMethodTypes["pulls"]["get"]["response"]

      if (!ignoredUsers.includes(pr.data.user.login)) {
        continue
      }

      console.log(`Marking as read: ${notification.subject.title} by ${pr.data.user.login}`)
      await octokit.activity.markThreadAsRead({ thread_id: parseInt(notification.id, 10) })
    }
  }
}

try {
  init().catch((e) => {
    console.error(e)
    process.exit(1)
  })
} catch (e) {
  console.error(e)
  process.exit(1)
}
