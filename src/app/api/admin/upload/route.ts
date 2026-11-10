import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { authorizedAdmin, validOrigin } from "../security";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_FILE_BYTES + 64 * 1024;
const MAX_PIXELS = 20_000_000;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedFormats = new Set(["jpeg", "png", "webp"]);

export async function POST(request: Request) {
  if (!(await authorizedAdmin()))
    return NextResponse.json(
      { error: "Sign in to upload product images." },
      { status: 401 },
    );
  if (!validOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
    return NextResponse.json(
      { error: "Choose a JPG, PNG or WebP file." },
      { status: 400 },
    );
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES)
    return NextResponse.json(
      { error: "Images must be 5 MB or smaller." },
      { status: 413 },
    );

  let file: FormDataEntryValue | null;
  try {
    // Bound the whole multipart stream, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader)
      return NextResponse.json(
        { error: "No image was received." },
        { status: 400 },
      );
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Images must be 5 MB or smaller." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": request.headers.get("content-type")! },
    }).formData();
    file = form.get("image");
  } catch {
    return NextResponse.json(
      { error: "The image upload could not be read. Choose the file again." },
      { status: 400 },
    );
  }
  if (!(file instanceof File) || !file.size)
    return NextResponse.json(
      { error: "Choose an image file to upload." },
      { status: 400 },
    );
  if (file.size > MAX_FILE_BYTES)
    return NextResponse.json(
      { error: "Images must be 5 MB or smaller." },
      { status: 413 },
    );
  if (!allowedTypes.has(file.type))
    return NextResponse.json(
      { error: "Only JPG, PNG and WebP images are supported." },
      { status: 400 },
    );

  let output: Buffer;
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: MAX_PIXELS,
      failOn: "error",
    });
    const metadata = await image.metadata();
    if (
      !metadata.format ||
      !allowedFormats.has(metadata.format) ||
      (metadata.pages ?? 1) > 1
    )
      return NextResponse.json(
        { error: "Use a single, non-animated JPG, PNG or WebP image." },
        { status: 400 },
      );
    // Decode fully, orient correctly and write a fresh image without EXIF metadata.
    output = await image
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 86 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      {
        error:
          "This image is damaged, unsupported or larger than 20 megapixels. Try a smaller JPG, PNG or WebP.",
      },
      { status: 400 },
    );
  }
  try {
    const filename = `${randomUUID()}.webp`;
    const directory = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), output, { flag: "wx" });
    return NextResponse.json(
      { path: `/uploads/products/${filename}` },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "The image could not be saved. Check that product upload storage is writable.",
      },
      { status: 500 },
    );
  }
}
