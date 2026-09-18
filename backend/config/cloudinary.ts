import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = (buffer: Buffer, originalName: string) => new Promise<{
  secure_url: string;
  public_id: string;
}>((resolve, reject) => {
  const upload = cloudinary.uploader.upload_stream(
    {
      folder: "forgetrack/field-reports",
      resource_type: "image",
      public_id: originalName.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 80),
    },
    (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Cloudinary did not return an upload result"));
        return;
      }
      resolve({ secure_url: result.secure_url, public_id: result.public_id });
    },
  );

  upload.end(buffer);
});