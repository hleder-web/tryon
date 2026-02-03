import type { VercelRequest, VercelResponse } from '@vercel/node'
import { JWT } from 'google-auth-library'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userImageUrl, garmentImageUrl } = req.body

    if (!userImageUrl || !garmentImageUrl) {
      return res.status(400).json({
        error: 'userImageUrl e garmentImageUrl são obrigatórios',
      })
    }

    // 🔐 Google Auth
    const serviceAccount = JSON.parse(
      process.env.GCP_SERVICE_ACCOUNT_JSON as string
    )

    const client = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })

    const accessTokenResponse = await client.getAccessToken()
    const token = accessTokenResponse.token

    if (!token) {
      throw new Error('Failed to obtain access token')
    }

    // 🎯 ENDPOINT CORRETO DO VIRTUAL TRY-ON
    const endpoint = `https://${process.env.GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.GCP_PROJECT_ID}/locations/${process.env.GCP_LOCATION}/publishers/google/models/imagegeneration@virtual-try-on:predict`

    const vertexResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            personImage: {
              gcsUri: userImageUrl,
            },
            garmentImage: {
              gcsUri: garmentImageUrl,
            },
          },
        ],
      }),
    })

    const text = await vertexResponse.text()

    // 🔍 Se não for JSON, mostramos o HTML pra debug
    if (!vertexResponse.ok) {
      return res.status(vertexResponse.status).json({
        error: 'Vertex error',
        status: vertexResponse.status,
        rawResponse: text.slice(0, 500),
      })
    }

    return res.status(200).json(JSON.parse(text))
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({
      error: 'Vertex AI request failed',
      details: err.message,
    })
  }
}