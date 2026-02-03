export default async function handler({req, res}:any) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  
    return res.status(200).json({
      ok: true,
      message: 'API de try-on no ar 🚀',
      received: req.body || null,
    })
  }