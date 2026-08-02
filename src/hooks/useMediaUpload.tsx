"use client";

import { useState } from "react";
import { propertiesApi } from "@/api/properties.api";

export interface UploadTask {
  id: string;
  file: File;
  media_type: "image" | "video" | "floor_plan" | "document" | "virtual_tour";
  caption?: string;
  is_cover?: boolean;
  unit_group_id?: number | null;
}

export interface UploadResult {
  success: boolean;
  fileName: string;
  error?: string;
}

// ✅ NEW: Returns a detailed summary of the upload batch
export interface UploadSummary {
  successCount: number;
  failedCount: number;
  results: UploadResult[];
}

export const useMediaUpload = (propertyId: number | null) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadResult[]>([]);

  const uploadCategory = async (tasks: UploadTask[]): Promise<UploadSummary> => {
    if (!propertyId || tasks.length === 0) {
      return { successCount: 0, failedCount: 0, results: [] };
    }

    setIsUploading(true);
    setProgress(0);
    setResults([]);
    
    let successCount = 0;
    let failedCount = 0;
    const newResults: UploadResult[] = [];
    const total = tasks.length;

    for (let i = 0; i < total; i++) {
      const item = tasks[i];
      try {
        const formData = new FormData();

        if (item.is_cover && !item.unit_group_id) {
          formData.append("cover_photo", item.file);
          await propertiesApi.updateProperty(propertyId, formData);
        } else if (item.is_cover && item.unit_group_id) {
          formData.append("cover_photo", item.file);
          await propertiesApi.updateUnitGroup(propertyId, item.unit_group_id, formData);
        } else {
          formData.append("property_ref", String(propertyId));
          formData.append("file", item.file);
          formData.append("media_type", item.media_type);
          
          if (item.caption) formData.append("caption", item.caption);
          if (item.unit_group_id) formData.append("unit_group", String(item.unit_group_id));
          
          await propertiesApi.uploadPropertyMedia(propertyId, formData);
        }

        successCount++;
        newResults.push({ success: true, fileName: item.file.name });
      } catch (error: any) {
        failedCount++;
        
        // ✅ Extract the most specific error message from the backend
        const errorMsg =
          error.response?.data?.file?.[0] ||
          error.response?.data?.property_ref?.[0] ||
          error.response?.data?.unit_group?.[0] ||
          error.response?.data?.detail ||
          "Upload failed";
          
        newResults.push({ success: false, fileName: item.file.name, error: errorMsg });
      }
      
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setIsUploading(false);
    setResults(newResults);
    
    return { successCount, failedCount, results: newResults };
  };

  return { isUploading, progress, results, uploadCategory };
};