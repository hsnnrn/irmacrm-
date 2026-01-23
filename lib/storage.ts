import { supabase } from "./supabase";
import { translateSupabaseError } from "./utils";

const BUCKET_NAME = "documents";

// Initialize storage bucket (run once in Supabase dashboard or here)
export async function initializeStorage() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 5242880, // 5MB
    });
    if (error) console.error("Bucket creation error:", error);
  }
}

// Upload document file
export async function uploadDocument(
  file: File,
  positionId: string,
  docType: string
): Promise<{ url: string; path: string } | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${positionId}/${docType}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(translateSupabaseError(error));
    }

    // Get public URL (or signed URL if bucket is private)
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) throw error;
    throw new Error(translateSupabaseError(error));
  }
}

// Delete document
export async function deleteDocument(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
}

// Get signed URL for private files (expires in 1 hour)
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Signed URL error:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Signed URL error:", error);
    return null;
  }
}

// Download document
export async function downloadDocument(path: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(path);

    if (error) {
      console.error("Download error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Download error:", error);
    return null;
  }
}

