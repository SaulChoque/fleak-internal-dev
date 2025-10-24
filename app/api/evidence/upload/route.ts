import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { attachEvidence, uploadEvidenceBuffer } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const metadataSchema = z.object({
  flakeId: z.string().min(1),
  title: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "File is required" }, { status: 400 });
    }

    const metadata = metadataSchema.parse({
      flakeId: formData.get("flakeId"),
      title: formData.get("title") ?? undefined,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await uploadEvidenceBuffer({
      buffer,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
    });

    await attachEvidence({
      flakeId: metadata.flakeId,
      uploaderFid: session.userFid,
      cid: upload.cid,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: upload.size,
      title: metadata.title,
    });

    return NextResponse.json({ cid: upload.cid, size: upload.size });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid metadata", issues: error.issues }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/evidence/upload error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
