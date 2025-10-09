import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  type ObjectCannedACL,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: "https://s3.filebase.com",
  credentials: {
    accessKeyId: "87D1271B741FFE6D9AD9",
    secretAccessKey: "6eKRaiDvXD6lVqwdFRmI3X6RuUfCjMg6c1IKBNSy",
  },
  forcePathStyle: true,
});

export async function uploadFileToFilebase(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<{ cid: string; url: string }> {
  const sanitizedName = file.name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-\.]/g, "");

  const fileKey = `uploads/${Date.now()}-${sanitizedName}`;

  const uploadParams = {
    Bucket: "tarah",
    Key: fileKey,
    Body: file,
    ContentType: file.type,
    ACL: "public-read" as ObjectCannedACL,
    CacheControl: "public, max-age=31536000, immutable",
    Metadata: {
      "x-amz-meta-cid": "true",
    },
  };

  try {
    // Create a transform stream to track upload progress
    let uploadedBytes = 0;
    const totalBytes = file.size;

    const progressTrackingStream = new TransformStream({
      transform(chunk, controller) {
        uploadedBytes += chunk.byteLength || chunk.length;
        if (onProgress) {
          const percentage = Math.round((uploadedBytes / totalBytes) * 100);
          onProgress(percentage);
        }
        controller.enqueue(chunk);
      },
    });

    // Pipe the file through our progress tracking stream
    const readableStream = file.stream().pipeThrough(progressTrackingStream);
    uploadParams.Body = readableStream;

    // Step 1: Upload the file
    const uploadCommand = new PutObjectCommand(uploadParams);
    const uploadData = await s3Client.send(uploadCommand);

    // Step 2: Retrieve the object metadata to get the proper CID
    const headCommand = new HeadObjectCommand({
      Bucket: uploadParams.Bucket,
      Key: fileKey,
    });

    const headData = await s3Client.send(headCommand);

    // Get CID from metadata (Filebase-specific)
    const cid =
      headData.Metadata?.["cid"] || headData.Metadata?.["x-amz-meta-cid"];

    if (!cid) {
      // Fallback to ETag if no CID in metadata
      const fallbackCid = uploadData.ETag?.replace(/"/g, "");
      if (!fallbackCid || fallbackCid.length !== 46) {
        throw new Error("Valid CID not found in response");
      }
      console.warn(
        "Using ETag fallback CID - recommend verifying in Filebase dashboard"
      );
      return {
        cid: fallbackCid,
        url: `https://ipfs.filebase.io/ipfs/${fallbackCid}`,
      };
    }

    // Verify CID format (basic check)
    if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^bafybei[A-Za-z0-9]{44}$/.test(cid)) {
      throw new Error(`Invalid CID format: ${cid}`);
    }

    return {
      cid,
      url: `https://ipfs.filebase.io/ipfs/${cid}`,
    };
  } catch (error) {
    console.error("Upload error details:", error);
    throw new Error(
      `File upload failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
