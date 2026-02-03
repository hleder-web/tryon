import type { VercelRequest, VercelResponse } from '@vercel/node'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

const MODEL =
  'cuuupid/idm-vton:COLE_AQUI_O_VERSION_ID_DO_MODELO'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userImageBase64, garmentImageUrl } = req.body

  if (!userImageBase64 || !garmentImageUrl) {
    return res.status(400).json({ error: 'Missing params' })
  }

  try {
    const output = await replicate.run(MODEL, {
      input: {
        person_image: userImageBase64,
        garment_image: garmentImageUrl,
      },
    })

    const resultImageUrl = Array.isArray(output) ? output[0] : output

    return res.status(200).json({ resultImageUrl })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Try-on failed' })
  }
}
