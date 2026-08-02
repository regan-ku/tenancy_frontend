"use client";

import React, { useState, useEffect } from "react";
import { usePropertyWizardStore } from "@/store/propertyWizard.store";
import { useMediaUpload, UploadTask } from "@/hooks/useMediaUpload";
import MediaUploadZone from "@/components/properties/wizard/MediaUploadZone";

export default function StepMedia() {
  const { propertyId, formData } = usePropertyWizardStore();
  
  const { isUploading, progress, results, uploadCategory } = useMediaUpload(propertyId);

  const [propertyMedia, setPropertyMedia] = useState<UploadTask[]>([]);
  const [unitGroupMedia, setUnitGroupMedia] = useState<Record<string, UploadTask[]>>({});
  const [ownershipDocs, setOwnershipDocs] = useState<UploadTask[]>([]);

  const [isPropertyMediaUploaded, setIsPropertyMediaUploaded] = useState(false);
  const [uploadedUnitGroups, setUploadedUnitGroups] = useState<Set<string>>(new Set());
  const [isDocsUploaded, setIsDocsUploaded] = useState(false);

  const [propertyMediaCount, setPropertyMediaCount] = useState(0);
  const [docsCount, setDocsCount] = useState(0);
  const [unitGroupCounts, setUnitGroupCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, UploadTask[]> = {};
    formData.unit_groups.forEach((ug) => {
      if (ug.id) initial[ug.id] = [];
    });
    setUnitGroupMedia((prev) => ({ ...initial, ...prev }));
  }, [formData.unit_groups]);

  const handleSetPropertyCover = (task: UploadTask) => {
    const currentCover = propertyMedia.find(t => t.is_cover);
    let galleryItems = propertyMedia.filter(t => !t.is_cover);

    if (currentCover && galleryItems.length < 10) {
      galleryItems.push({ ...currentCover, is_cover: false });
    }
    galleryItems = galleryItems.filter(t => t.id !== task.id);
    const newCover = { ...task, is_cover: true };

    setPropertyMedia([newCover, ...galleryItems]);
  };

  const handleSetUnitGroupCover = (ugId: string, task: UploadTask) => {
    const currentTasks = unitGroupMedia[ugId] || [];
    const currentCover = currentTasks.find(t => t.is_cover);
    let galleryItems = currentTasks.filter(t => !t.is_cover);

    if (currentCover && galleryItems.length < 10) {
      galleryItems.push({ ...currentCover, is_cover: false });
    }
    galleryItems = galleryItems.filter(t => t.id !== task.id);
    const newCover = { ...task, is_cover: true, unit_group_id: Number(ugId) };

    setUnitGroupMedia(prev => ({ ...prev, [ugId]: [newCover, ...galleryItems] }));
  };

  // ✅ UPDATED: Handles partial successes gracefully
  const handleUploadPropertyMedia = async () => {
    if (propertyMedia.length === 0) return;
    
    const summary = await uploadCategory(propertyMedia);
    
    if (summary.successCount > 0) {
      setPropertyMediaCount(prev => prev + summary.successCount);
      
      // Keep ONLY the failed files in the staging area
      const successfulFileNames = summary.results.filter(r => r.success).map(r => r.fileName);
      const failedTasks = propertyMedia.filter(t => !successfulFileNames.includes(t.file.name));
      
      setPropertyMedia(failedTasks);
      
      // If ALL files succeeded, show the "Upload Complete" card
      if (failedTasks.length === 0) {
        setIsPropertyMediaUploaded(true);
      }
    }
  };

  const handleUploadUnitGroupMedia = async (ugId: string) => {
    const tasks = unitGroupMedia[ugId] || [];
    if (tasks.length === 0) return;
    
    const summary = await uploadCategory(tasks);
    
    if (summary.successCount > 0) {
      setUnitGroupCounts(prev => ({
        ...prev,
        [ugId]: (prev[ugId] || 0) + summary.successCount
      }));
      
      const successfulFileNames = summary.results.filter(r => r.success).map(r => r.fileName);
      const failedTasks = tasks.filter(t => !successfulFileNames.includes(t.file.name));
      
      setUnitGroupMedia(prev => ({ ...prev, [ugId]: failedTasks }));
      
      if (failedTasks.length === 0) {
        setUploadedUnitGroups((prev) => new Set(prev).add(ugId));
      }
    }
  };

  const handleUploadDocs = async () => {
    if (ownershipDocs.length === 0) return;
    
    const summary = await uploadCategory(ownershipDocs);
    
    if (summary.successCount > 0) {
      setDocsCount(prev => prev + summary.successCount);
      
      const successfulFileNames = summary.results.filter(r => r.success).map(r => r.fileName);
      const failedTasks = ownershipDocs.filter(t => !successfulFileNames.includes(t.file.name));
      
      setOwnershipDocs(failedTasks);
      
      if (failedTasks.length === 0) {
        setIsDocsUploaded(true);
      }
    }
  };

  const handleEditPropertyMedia = () => {
    setIsPropertyMediaUploaded(false);
  };

  const handleEditUnitGroupMedia = (ugId: string) => {
    setUploadedUnitGroups((prev) => {
      const newSet = new Set(prev);
      newSet.delete(ugId);
      return newSet;
    });
  };

  const handleEditDocs = () => {
    setIsDocsUploaded(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Media & Ownership Documents
        </h2>
        <p className="text-slate-500">
          Upload property visuals and mandatory legal documents. You can promote any gallery photo to be the cover.
        </p>
      </div>

      {/* 1. Main Property Media */}
      <section className="space-y-4 p-5 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
            🏠 Main Property Media
          </h3>
        </div>
        
        <MediaUploadZone
          title="Property Cover Photo (Required)"
          description="This will be the main thumbnail on the marketplace."
          accept="image/*"
          tasks={propertyMedia.filter(t => t.is_cover)}
          onUpdate={(tasks) => {
             const marked = tasks.map(t => ({ ...t, is_cover: true }));
             const gallery = propertyMedia.filter(t => !t.is_cover);
             setPropertyMedia([...marked, ...gallery]);
          }}
          maxFiles={1}
          isUploaded={isPropertyMediaUploaded}
          uploadedCount={propertyMediaCount}
          onEdit={handleEditPropertyMedia}
          progress={progress}
          isUploading={isUploading}
          results={results} // ✅ PASSED FOR SPECIFIC ERROR MESSAGES
        />

        <MediaUploadZone
          title="Property Gallery"
          description="Additional photos, videos, floor plans. Hover to set as cover."
          tasks={propertyMedia.filter(t => !t.is_cover)}
          onUpdate={(tasks) => {
             const cover = propertyMedia.filter(t => t.is_cover);
             const marked = tasks.map(t => ({ ...t, is_cover: false }));
             setPropertyMedia([...cover, ...marked]);
          }}
          maxFiles={10}
          onSetAsCover={handleSetPropertyCover}
          isUploaded={isPropertyMediaUploaded}
          uploadedCount={propertyMediaCount}
          onEdit={handleEditPropertyMedia}
          progress={progress}
          isUploading={isUploading}
          results={results} // ✅ PASSED FOR SPECIFIC ERROR MESSAGES
        />

        {/* Show upload button only if not fully uploaded yet */}
        {!isPropertyMediaUploaded && propertyMedia.length > 0 && (
          <button
            onClick={handleUploadPropertyMedia}
            disabled={isUploading}
            className="w-full btn-primary py-2 text-sm font-semibold disabled:opacity-70"
          >
            {isUploading ? `Uploading... ${progress}%` : "Upload Property Media"}
          </button>
        )}
      </section>

      {/* 2. Dynamic Unit Group Media Sections */}
      {formData.unit_groups.length > 0 && (
        <section className="space-y-6 p-5 bg-white border border-slate-200 rounded-xl">
          <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
            🏢 Unit Group Media
          </h3>
          {formData.unit_groups.map((ug) => {
            const isUploaded = uploadedUnitGroups.has(ug.id!);
            const tasks = unitGroupMedia[ug.id!] || [];
            const count = unitGroupCounts[ug.id!] || 0;
            
            return (
              <div key={ug.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700">
                    {ug.name} ({ug.unit_type.replace(/_/g, " ")})
                  </h4>
                </div>
                
                <div className="mb-3">
                  <MediaUploadZone
                    title="Unit Group Cover Photo"
                    accept="image/*"
                    tasks={tasks.filter(t => t.is_cover)}
                    onUpdate={(newTasks) => {
                      const nonCovers = tasks.filter(t => !t.is_cover);
                      const marked = newTasks.map(t => ({ ...t, is_cover: true, unit_group_id: Number(ug.id) }));
                      setUnitGroupMedia(prev => ({ ...prev, [ug.id!]: [...marked, ...nonCovers] }));
                    }}
                    maxFiles={1}
                    isUploaded={isUploaded}
                    uploadedCount={count}
                    onEdit={() => handleEditUnitGroupMedia(ug.id!)}
                    progress={progress}
                    isUploading={isUploading}
                    results={results} // ✅ PASSED FOR SPECIFIC ERROR MESSAGES
                  />
                </div>

                <div className="mb-3">
                  <MediaUploadZone
                    title="Unit Group Gallery"
                    tasks={tasks.filter(t => !t.is_cover)}
                    onUpdate={(newTasks) => {
                      const covers = tasks.filter(t => t.is_cover);
                      const marked = newTasks.map(t => ({ ...t, is_cover: false, unit_group_id: Number(ug.id) }));
                      setUnitGroupMedia(prev => ({ ...prev, [ug.id!]: [...covers, ...marked] }));
                    }}
                    maxFiles={10}
                    onSetAsCover={(task) => handleSetUnitGroupCover(ug.id!, task)}
                    isUploaded={isUploaded}
                    uploadedCount={count}
                    onEdit={() => handleEditUnitGroupMedia(ug.id!)}
                    progress={progress}
                    isUploading={isUploading}
                    results={results} // ✅ PASSED FOR SPECIFIC ERROR MESSAGES
                  />
                </div>

                {!isUploaded && tasks.length > 0 && (
                  <button
                    onClick={() => handleUploadUnitGroupMedia(ug.id!)}
                    disabled={isUploading}
                    className="w-full md:w-auto px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-70"
                  >
                    {isUploading ? `Uploading... ${progress}%` : `Upload ${ug.name} Media`}
                  </button>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* 3. MANDATORY: Ownership & Legal Documents */}
      <section className="space-y-4 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
              📜 Proof of Ownership & Legal Documents (MUST)
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Title deeds, land rates, KRA compliance, or business registration certificates.
            </p>
          </div>
        </div>
        
        <MediaUploadZone
          title="Upload Documents"
          accept="application/pdf,image/*"
          tasks={ownershipDocs}
          onUpdate={(tasks) => setOwnershipDocs(tasks.map(t => ({ ...t, media_type: "document" as const })))}
          maxFiles={10}
          isUploaded={isDocsUploaded}
          uploadedCount={docsCount}
          onEdit={handleEditDocs}
          progress={progress}
          isUploading={isUploading}
          results={results} // ✅ PASSED FOR SPECIFIC ERROR MESSAGES
        />

        {!isDocsUploaded && ownershipDocs.length > 0 && (
          <button
            onClick={handleUploadDocs}
            disabled={isUploading}
            className="w-full btn-primary py-2 text-sm font-semibold disabled:opacity-70 bg-amber-600 hover:bg-amber-700"
          >
            {isUploading ? `Uploading Documents... ${progress}%` : "Upload Mandatory Documents"}
          </button>
        )}
      </section>

      {/* Wizard Navigation Hint */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Upload your gallery photos first, then hover over them and click <strong>"Set as Cover"</strong> to choose your main thumbnail. Once the required sections show the green success card, you can proceed to the final Publish step.
        </p>
      </div>
    </div>
  );
}