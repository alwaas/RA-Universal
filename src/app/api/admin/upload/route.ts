import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth/rbac";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_FORM", message: "Could not parse form data" } },
      { status: 400 }
    );
  }

  // Support single or multiple files
  const fileEntries = formData.getAll("files").concat(formData.getAll("file")) as File[];
  const validFiles = fileEntries.filter((f) => f && typeof f.size === "number" && f.size > 0);

  if (validFiles.length === 0) {
    return NextResponse.json(
      { success: false, error: { code: "NO_FILE", message: "No image file provided" } },
      { status: 400 }
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const isCloudinary = Boolean(cloudName && apiKey && apiSecret);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!isCloudinary && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const uploadedUrls: string[] = [];

  for (const file of validFiles) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TYPE",
            message: `File "${file.name}" is not supported. Only JPEG, PNG, and WEBP images are allowed.`,
          },
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: `File "${file.name}" exceeds the 10 MB limit.`,
          },
        },
        { status: 400 }
      );
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (isCloudinary) {
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "ra_universal_products";
        const signature = crypto
          .createHash("sha1")
          .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
          .digest("hex");

        const uploadForm = new FormData();
        uploadForm.append("file", new Blob([buffer], { type: file.type }));
        uploadForm.append("api_key", apiKey!);
        uploadForm.append("timestamp", String(timestamp));
        uploadForm.append("signature", signature);
        uploadForm.append("folder", folder);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: uploadForm }
        );
        const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };

        if (!res.ok || !data.secure_url) {
          throw new Error(data.error?.message ?? "Cloudinary upload failed");
        }

        uploadedUrls.push(data.secure_url);
      } else {
        const ext = path.extname(file.name) || ".jpg";
        const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
        fs.writeFileSync(path.join(uploadsDir, filename), buffer);
        uploadedUrls.push(`/uploads/${filename}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload processing failed";
      console.error("[Upload] Error:", message);
      return NextResponse.json(
        { success: false, error: { code: "UPLOAD_FAILED", message } },
        { status: 500 }
      );
    }
  }

  const primaryUrl = uploadedUrls[0];

  return NextResponse.json({
    success: true,
    data: {
      status: "ok",
      url: primaryUrl,
      imageUrl: primaryUrl,
      urls: uploadedUrls,
      images: uploadedUrls.map((u) => ({ url: u, imageUrl: u })),
      count: uploadedUrls.length,
      provider: isCloudinary ? "cloudinary" : "server storage",
    },
  });
}
