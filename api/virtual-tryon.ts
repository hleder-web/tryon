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
        error: 'userImageUrl e garmentImageUrl são obrigatórios'
      })
    }

    // 🔐 Auth Google
    const serviceAccount = JSON.parse(
      process.env.GCP_SERVICE_ACCOUNT_JSON as string
    )
    const client = new JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })
      
      const accessTokenResponse = await client.getAccessToken()
      
      if (!accessTokenResponse.token) {
        throw new Error('Failed to get access token')
      }
      
      const token = accessTokenResponse.token
      

 
    const endpoint = `https://${process.env.GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.GCP_PROJECT_ID}/locations/${process.env.GCP_LOCATION}/publishers/google/models/imagegeneration@002:predict`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: 'virtual try on',
            image: {
              gcsUri: userImageUrl,
            },
            garment: {
              imageUri: garmentImageUrl,
            },
          },
        ],
        parameters: {
          sampleCount: 1,
        },
      }),
    })

    const data = await response.json()

    return res.status(200).json(data)
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({
      error: 'Vertex AI request failed',
      details: err.message,
    })
  }
}
