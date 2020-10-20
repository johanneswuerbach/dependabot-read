import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { ActivityListNotificationsForAuthenticatedUserResponseData } from "@octokit/types"

interface Notification {
  id: string;
  subject: {
    url: string
    title: string
  }
}

const ignoredUsers = ['dependabot[bot]', 'dependabot-preview[bot]']

const maybeMarkAsRead = async (octokit: Octokit, notification: Notification): Promise<void> => {
  const prResp = await octokit.request(`GET ${notification.subject.url}`) as RestEndpointMethodTypes["pulls"]["get"]["response"]
  const { data: pr } = prResp

  if (!ignoredUsers.includes(pr.user.login)) {
    return
  }

  console.log(`Marking as read: ${notification.subject.title} by ${pr.user.login}`)
  await octokit.activity.markThreadAsRead({ thread_id: parseInt(notification.id, 10) })
}

const init = async () => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const options = octokit.activity.listNotificationsForAuthenticatedUser

  for await (const notificationsResponse of octokit.paginate.iterator(options)) {
    const markAsReadPromises = []
    for (const notification of notificationsResponse.data) {
      if (notification.subject.type != 'PullRequest') {
        continue
      }

      markAsReadPromises.push(maybeMarkAsRead(octokit, notification))
    }
    await Promise.all(markAsReadPromises)
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
