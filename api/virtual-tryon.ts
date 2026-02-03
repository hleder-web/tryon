import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  return res.status(200).json({
    hasServiceAccount: !!process.env.GCP_SERVICE_ACCOUNT_JSON,
    hasProjectId: !!process.env.GCP_PROJECT_ID,
    location: process.env.GCP_LOCATION,
  })
}
