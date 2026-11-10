import { readFile } from "node:fs/promises";
import path from "node:path";

// Serve admin uploads created after a production server starts. Only normalized
// UUID-named WebP files from the dedicated product directory can be read.
export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/.test(
      file,
    )
  )
    return new Response("Not found", { status: 404 });
  try {
    const image = await readFile(
      path.join(process.cwd(), "public", "uploads", "products", file),
    );
    return new Response(image, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
