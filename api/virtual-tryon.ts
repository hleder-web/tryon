import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler({req, res}:any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  
  try {
    const {
      userImageBase64,
      garmentImageUrl,
      category = "upper_body",
    } = req.body;

    if (!userImageBase64 || !garmentImageUrl) {
      return res.status(400).json({ error: "Missing images" });
    }
    console.log("TOKEN EXISTS?", !!process.env.REPLICATE_API_TOKEN);
    const output = await replicate.run(
      "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
      {
        input: {
          person_image: userImageBase64,
          garment_image: garmentImageUrl,
          category,
          crop: false,
          steps: 30,
          seed: 42,
        },
      }
    );

    // Replicate retorna um array com URLs
    res.status(200).json({
      success: true,
      image: Array.isArray(output) ? output[0] : output,
    });
  } catch (error) {
    console.error("TRYON ERROR:", error);
    res.status(500).json({ error: "Try-on failed" });
  }
}
