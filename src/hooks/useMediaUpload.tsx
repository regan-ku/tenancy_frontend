"use client";

import { useState } from "react";
import { propertiesApi } from "@/api/properties.api";

export interface UploadTask {
  id: string;
  file?: File; // Optional: undefined if already uploaded
  url?: string; // The URL of the uploaded file
  serverId?: number; // The database ID of the media record
  media_type: "image" | "video" | "floor_plan" | "document" | "virtual_tour";
  caption?: string;
  is_cover?: boolean;
  unit_group_id?: number | null;
  isUploaded?: boolean; // Flag to distinguish staged vs uploaded
}

export interface UploadResult {
  success: boolean;
  fileName: string;
  error?: string;
}

export interface UploadSummary {
  successCount: number;
  failedCount: number;
  results: UploadResult[];
  aborted: boolean; 
}

export const useMediaUpload = (propertyId: number | null) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [resultsCategory, setResultsCategory] = useState<string | null>(null);
  const [results, setResults] = useState<UploadResult[]>([]);

  const uploadCategory = async (categoryId: string, tasks: UploadTask[]): Promise<UploadSummary> => {
    if (!propertyId || tasks.length === 0) {
      return { successCount: 0, failedCount: 0, results: [], aborted: false };
    }

    setIsUploading(true);
    setActiveCategory(categoryId);
    setResultsCategory(categoryId);
    setProgress(0);
    setResults([]);
    
    let successCount = 0;
    let failedCount = 0;
    const newResults: UploadResult[] = [];
    const total = tasks.length;
    let aborted = false;

    for (let i = 0; i < total; i++) {
      const item = tasks[i];
      
      // Skip if it's already uploaded (serverId exists)
      if (item.serverId) {
        successCount++;
        newResults.push({ success: true, fileName: item.caption || "Existing File" });
        continue;
      }

      try {
        const formData = new FormData();

        if (item.is_cover && !item.unit_group_id && item.file) {
          formData.append("cover_photo", item.file);
          await propertiesApi.updateProperty(propertyId, formData);
        } else if (item.is_cover && item.unit_group_id && item.file) {
          formData.append("cover_photo", item.file);
          await propertiesApi.updateUnitGroup(propertyId, item.unit_group_id, formData);
        } else if (item.file) {
          formData.append("property_ref", String(propertyId));
          formData.append("file", item.file);
          formData.append("media_type", item.media_type);
          
          if (item.caption) formData.append("caption", item.caption);
          if (item.unit_group_id) formData.append("unit_group", String(item.unit_group_id));
          
          await propertiesApi.uploadPropertyMedia(propertyId, formData);
        }

        successCount++;
        newResults.push({ success: true, fileName: item.file?.name || "File" });
      } catch (error: any) {
        failedCount++;
        
        const errorMsg =
          error.response?.data?.file?.[0] ||
          error.response?.data?.cover_photo?.[0] ||
          error.response?.data?.property_ref?.[0] ||
          error.response?.data?.unit_group?.[0] ||
          error.response?.data?.detail ||
          "Upload failed";
          
        newResults.push({ success: false, fileName: item.file?.name || "File", error: errorMsg });
        
        aborted = true;
        break; 
      }
      
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setIsUploading(false);
    setActiveCategory(null);
    setResults(newResults);
    
    return { successCount, failedCount, results: newResults, aborted };
  };

  return { 
    isUploading, 
    progress, 
    results, 
    resultsCategory,
    uploadCategory, 
    activeCategory 
  };
};