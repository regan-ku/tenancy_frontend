"use client";

import { useState } from "react";
import { propertiesApi } from "@/api/properties.api";

export interface UploadTask {
  id: string;
  file: File;
  media_type: "image" | "video" | "floor_plan" | "document" | "virtual_tour";
  caption?: string;
  is_cover?: boolean;
  unit_group_id?: number | null; // ✅ Now holds the REAL Database ID of the UnitGroup
}

export interface UploadResult {
  success: boolean;
  fileName: string;
  error?: string;
}

export const useMediaUpload = (propertyId: number | null) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<UploadResult[]>([]);

  const executeUploads = async (tasks: UploadTask[]) => {
    if (!propertyId) {
      setResults([
        { success: false, fileName: "System", error: "Property ID missing." },
      ]);
      return false;
    }

    setIsUploading(true);
    setResults([]);

    const totalTasks = tasks.length;
    setProgress({ current: 0, total: totalTasks });
    let allSuccessful = true;
    let currentProgress = 0;

    // ✅ Categorize tasks into 3 distinct buckets
    const propertyCover = tasks.find((t) => t.is_cover && !t.unit_group_id);
    const unitGroupCovers = tasks.filter((t) => t.is_cover && t.unit_group_id);
    const galleryAndDocs = tasks.filter((t) => !t.is_cover);

    // 1. Upload Property Cover (PATCH Property)
    if (propertyCover) {
      try {
        currentProgress++;
        setProgress({ current: currentProgress, total: totalTasks });
        const formData = new FormData();
        formData.append("cover_photo", propertyCover.file);
        await propertiesApi.updateProperty(propertyId, formData);
        setResults((prev) => [
          ...prev,
          { success: true, fileName: propertyCover.file.name },
        ]);
      } catch (error: any) {
        allSuccessful = false;
        setResults((prev) => [
          ...prev,
          {
            success: false,
            fileName: propertyCover.file.name,
            error: "Property cover upload failed",
          },
        ]);
      }
    }

    // 2. Upload Unit Group Covers (PATCH UnitGroup)
    for (const ugCover of unitGroupCovers) {
      try {
        currentProgress++;
        setProgress({ current: currentProgress, total: totalTasks });
        const formData = new FormData();
        formData.append("cover_photo", ugCover.file);

        // ✅ Uses the real DB ID from the UnitGroup
        await propertiesApi.updateUnitGroup(
          propertyId,
          ugCover.unit_group_id!,
          formData,
        );

        setResults((prev) => [
          ...prev,
          { success: true, fileName: ugCover.file.name },
        ]);
      } catch (error: any) {
        allSuccessful = false;
        setResults((prev) => [
          ...prev,
          {
            success: false,
            fileName: ugCover.file.name,
            error: "Unit group cover upload failed",
          },
        ]);
      }
    }

    // 3. Upload Gallery Media & Documents (POST PropertyMedia)
    for (const item of galleryAndDocs) {
      try {
        currentProgress++;
        setProgress({ current: currentProgress, total: totalTasks });
        const formData = new FormData();

        formData.append("property_ref", String(propertyId));
        formData.append("file", item.file);
        formData.append("media_type", item.media_type);

        if (item.caption) formData.append("caption", item.caption);

        // ✅ NEW: If this gallery item belongs to a Unit Group, link it!
        if (item.unit_group_id) {
          formData.append("unit_group", String(item.unit_group_id));
        }

        await propertiesApi.uploadPropertyMedia(propertyId, formData);
        setResults((prev) => [
          ...prev,
          { success: true, fileName: item.file.name },
        ]);
      } catch (error: any) {
        allSuccessful = false;
        const errorMsg =
          error.response?.data?.file?.[0] ||
          error.response?.data?.property_ref?.[0] ||
          error.response?.data?.unit_group?.[0] ||
          error.response?.data?.detail ||
          "Upload failed";

        setResults((prev) => [
          ...prev,
          { success: false, fileName: item.file.name, error: errorMsg },
        ]);
      }
    }

    setIsUploading(false);
    return allSuccessful;
  };

  return { isUploading, progress, results, executeUploads };
};
