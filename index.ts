import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { ActivityListNotificationsForAuthenticatedUserResponseData } from "@octokit/types"

interface Notification {
  id: string;
  subject: {
    url: string
    title: string
  }
}

const markAsRead = async  (octokit: Octokit, notification: Notification, logDetails?: string): Promise<boolean> => {
  console.log(`Marking as read: ${notification.subject.title}${logDetails}`)
  await octokit.activity.markThreadAsRead({ thread_id: parseInt(notification.id, 10) })

  return true
}

const ignoredUsers = ['dependabot[bot]', 'dependabot-preview[bot]']
const ignoreReleasesInOrg = 'contentful'

const maybeMarkPullRequestAsRead = async (octokit: Octokit, notification: Notification): Promise<boolean> => {
  const prResp = await octokit.request(`GET ${notification.subject.url}`) as RestEndpointMethodTypes["pulls"]["get"]["response"]
  const { data: pr } = prResp

  if (!ignoredUsers.includes(pr.user.login)) {
    return false
  }

  return markAsRead(octokit, notification, ` by ${pr.user.login}`)
}

const init = async () => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const options = octokit.activity.listNotificationsForAuthenticatedUser
  let rerun = true

  while (rerun) {
    rerun = false
    for await (const notificationsResponse of octokit.paginate.iterator(options)) {
      const markAsReadPromises = []
      for (const notification of notificationsResponse.data) {
        if (notification.subject.type == 'PullRequest') {
          markAsReadPromises.push(maybeMarkPullRequestAsRead(octokit, notification))
        }

        if (notification.subject.type == 'Release' && notification.subject.url.includes(`repos/${ignoreReleasesInOrg}/`)) {
          markAsReadPromises.push(markAsRead(octokit, notification, ' ignored release'))
        }
      }
      const result = await Promise.all(markAsReadPromises)

      // We need to rerun as notifictions can shift pages while we mark others as read
      rerun = !!result.find((read) => read)
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
