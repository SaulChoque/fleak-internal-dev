import { getEnv } from "@/lib/env";

interface PinataUploadResult {
  cid: string;
  size: number;
}

export async function uploadBufferToPinata(options: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}): Promise<PinataUploadResult> {
  const env = getEnv();

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(options.buffer)], { type: options.contentType }),
    options.fileName
  );

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PINATA_JWT}`,
    },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} ${text}`);
  }

  const json = (await response.json()) as { IpfsHash: string; PinSize: number };

  return { cid: json.IpfsHash, size: json.PinSize };
}
