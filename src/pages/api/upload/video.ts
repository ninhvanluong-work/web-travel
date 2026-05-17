import { createHash } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

interface UploadCredentials {
  videoId: string;
  libraryId: string;
  expirationTime: number;
  signature: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadCredentials | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY;
  const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;

  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    return res.status(500).json({ error: 'Bunny Stream not configured' });
  }

  const { title } = req.body as { title?: string };

  const createRes = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      AccessKey: BUNNY_API_KEY,
    },
    body: JSON.stringify({ title: title ?? 'Untitled Video' }),
  });

  if (!createRes.ok) {
    return res.status(500).json({ error: 'Failed to create Bunny video' });
  }

  const video = (await createRes.json()) as { guid: string };

  const expirationTime = Math.floor(Date.now() / 1000) + 86400;
  const signature = createHash('sha256')
    .update(`${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${video.guid}`)
    .digest('hex');

  return res.status(200).json({
    videoId: video.guid,
    libraryId: BUNNY_LIBRARY_ID,
    expirationTime,
    signature,
  });
}
