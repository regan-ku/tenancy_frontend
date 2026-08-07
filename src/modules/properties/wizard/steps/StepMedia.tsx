"use client";

import React, { useState, useEffect } from "react";
import { usePropertyWizardStore } from "@/store/propertyWizard.store";
import { useMediaUpload, UploadTask } from "@/hooks/useMediaUpload";
import MediaUploadZone from "@/components/properties/wizard/MediaUploadZone";
import { propertiesApi } from "@/api/properties.api";

export default function StepMedia() {
  const { propertyId, formData } = usePropertyWizardStore();
  
  const { isUploading, progress, results, resultsCategory, uploadCategory, activeCategory } = useMediaUpload(propertyId);

  const [propertyMedia, setPropertyMedia] = useState<UploadTask[]>([]);
  const [unitGroupMedia, setUnitGroupMedia] = useState<Record<string, UploadTask[]>>({});
  const [ownershipDocs, setOwnershipDocs] = useState<UploadTask[]>([]);

  const [isPropertyMediaUploaded, setIsPropertyMediaUploaded] = useState(false);
  const [uploadedUnitGroups, setUploadedUnitGroups] = useState<Set<string>>(new Set());
  const [isDocsUploaded, setIsDocsUploaded] = useState(false);

  const [propertyCoverCount, setPropertyCoverCount] = useState(0);
  const [propertyGalleryCount, setPropertyGalleryCount] = useState(0);
  
  const [unitGroupCoverCounts, setUnitGroupCoverCounts] = useState<Record<string, number>>({});
  const [unitGroupGalleryCounts, setUnitGroupGalleryCounts] = useState<Record<string, number>>({});
  
  const [docsCount, setDocsCount] = useState(0);
  
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  useEffect(() => {
    const fetchExistingMedia = async () => {
      if (!propertyId) return;
      setIsLoadingExisting(true);
      try {
        const mediaResponse = await propertiesApi.getPropertyMedia(propertyId);
        const allMedia = mediaResponse.results || [];

        const propertyDetails = await propertiesApi.getProperty(propertyId);
        const propertyCoverUrl = propertyDetails.cover_photo;

        const ugResponse = await propertiesApi.getUnitGroups(propertyId);
        const unitGroups = ugResponse.results || [];
        const ugCoverUrls: Record<number, string> = {};
        unitGroups.forEach(ug => {
          if (ug.id && ug.cover_photo) ugCoverUrls[ug.id] = ug.cover_photo;
        });

        const getFileName = (url: string | null | undefined) => {
          if (!url) return "";
          return url.split('/').pop()?.split('?')[0] || "";
        };

        const mappedMedia: UploadTask[] = allMedia.map(m => {
          const fileUrl = m.file || m.url || "";
          const mediaFileName = getFileName(fileUrl);
          const propCoverFileName = getFileName(propertyCoverUrl);
          const ugCoverFileName = m.unit_group ? getFileName(ugCoverUrls[m.unit_group]) : "";

          let isCover = false;
          if (!m.unit_group && propCoverFileName && mediaFileName === propCoverFileName) {
            isCover = true;
          } else if (m.unit_group && ugCoverFileName && mediaFileName === ugCoverFileName) {
            isCover = true;
          }

          return {
            id: String(m.id),
            serverId: m.id,
            url: fileUrl,
            media_type: m.media_type,
            caption: m.caption || "",
            is_cover: isCover,
            unit_group_id: m.unit_group,
            isUploaded: true,
          };
        });

        const propCover = mappedMedia.find(m => !m.unit_group_id && m.is_cover);
        const propGallery = mappedMedia.filter(m => !m.unit_group_id && !m.is_cover && m.media_type !== 'document');
        
        setPropertyCoverCount(propCover ? 1 : 0);
        setPropertyGalleryCount(propGallery.length);
        if (propCover || propGallery.length > 0) setIsPropertyMediaUploaded(true);

        const ownershipDocsList = mappedMedia.filter(m => m.media_type === 'document' && !m.unit_group_id);
        setDocsCount(ownershipDocsList.length);
        if (ownershipDocsList.length > 0) setIsDocsUploaded(true);

        const initialUgCoverCounts: Record<string, number> = {};
        const initialUgGalleryCounts: Record<string, number> = {};
        const initialUploadedUgs = new Set<string>();

        const groups = formData.unit_groups.length > 0 ? formData.unit_groups : unitGroups;

        groups.forEach(ug => {
          if (ug.id) {
            // ✅ FIX: Force string conversion for dictionary keys and Sets
            const ugIdStr = String(ug.id); 
            
            const ugCover = mappedMedia.find(m => m.unit_group_id === ug.id && m.is_cover);
            const ugGallery = mappedMedia.filter(m => m.unit_group_id === ug.id && !m.is_cover);
            
            initialUgCoverCounts[ugIdStr] = ugCover ? 1 : 0;
            initialUgGalleryCounts[ugIdStr] = ugGallery.length;
            
            if (ugCover || ugGallery.length > 0) {
              initialUploadedUgs.add(ugIdStr);
            }
          }
        });
        
        setUnitGroupCoverCounts(initialUgCoverCounts);
        setUnitGroupGalleryCounts(initialUgGalleryCounts);
        setUploadedUnitGroups(initialUploadedUgs);

      } catch (e) {
        console.error("Failed to fetch existing media", e);
      } finally {
        setIsLoadingExisting(false);
      }
    };

    fetchExistingMedia();
  }, [propertyId]);

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

  const handleUploadPropertyMedia = async () => {
    if (propertyMedia.length === 0) return;
    
    const coverTasks = propertyMedia.filter(t => t.is_cover);
    const galleryTasks = propertyMedia.filter(t => !t.is_cover);
    
    const summary = await uploadCategory('property_media', propertyMedia);
    
    if (summary.successCount > 0 || summary.aborted) {
      const successfulFileNames = summary.results.filter(r => r.success).map(r => r.fileName);
      
      const successfulCovers = coverTasks.filter(t => successfulFileNames.includes(t.file?.name || "")).length;
      const successfulGalleries = galleryTasks.filter(t => successfulFileNames.includes(t.file?.name || "")).length;
      
      setPropertyCoverCount(prev => prev + successfulCovers);
      setPropertyGalleryCount(prev => prev + successfulGalleries);
      
      const remainingTasks = propertyMedia.filter(t => !successfulFileNames.includes(t.file?.name || ""));
      setPropertyMedia(remainingTasks);
      
      if (remainingTasks.length === 0) setIsPropertyMediaUploaded(true);
    }
  };

  const handleUploadUnitGroupMedia = async (ugId: string) => {
    const tasks = unitGroupMedia[ugId] || [];
    if (tasks.length === 0) return;
    
    const coverTasks = tasks.filter(t => t.is_cover);
    const galleryTasks = tasks.filter(t => !t.is_cover);
    
    const summary = await uploadCategory(`ug_${ugId}`, tasks);
    
    if (summary.successCount > 0 || summary.aborted) {
      const successfulFileNames = summary.results.filter(r => r.success).map(r => r.fileName);
      
      const successfulCovers = coverTasks.filter(t => successfulFileNames.includes(t.file?.name || "")).length;
      const successfulGalleries = galleryTasks.filter(t => successfulFileNames.includes(t.file?.name || "")).length;
      
      setUnitGroupCoverCounts(prev => ({ ...prev, [ugId]: (prev[ugId] || 0) + successfulCovers }));
      setUnitGroupGalleryCounts(prev => ({ ...prev, [ugId]: (prev[ugId] || 0) + successfulGalleries }));
      
      const remainingTasks = tasks.filter(t => !successfulFileNames.includes(t.file?.name || ""));
      setUnitGroupMedia(prev => ({ ...prev, [ugId]: remainingTasks }));
      
      if (remainingTasks.length === 0) setUploadedUnitGroups((prev) => new Set(prev).add(ugId));
    }
  };

  const handleUploadDocs = async () => {
    if (ownershipDocs.length === 0) return;
    const summary = await uploadCategory('ownership_docs', ownershipDocs);
    
    if (summary.successCount > 0 || summary.aborted) {
      const successfulFileNames = summary.results.filter(r => r.success).map(r => r.fileName);
      const successfulDocs = ownershipDocs.filter(t => successfulFileNames.includes(t.file?.name || "")).length;
      
      setDocsCount(prev => prev + successfulDocs);
      
      const remainingTasks = ownershipDocs.filter(t => !successfulFileNames.includes(t.file?.name || ""));
      setOwnershipDocs(remainingTasks);
      
      if (remainingTasks.length === 0) setIsDocsUploaded(true);
    }
  };

  const handleEditPropertyMedia = () => setIsPropertyMediaUploaded(false);
  const handleEditUnitGroupMedia = (ugId: string) => {
    setUploadedUnitGroups((prev) => {
      const newSet = new Set(prev);
      newSet.delete(ugId);
      return newSet;
    });
  };
  const handleEditDocs = () => setIsDocsUploaded(false);

  if (isLoadingExisting) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">Media & Ownership Documents</h2>
        <p className="text-slate-500">Upload property visuals and mandatory legal documents. You can promote any gallery photo to be the cover.</p>
      </div>

      {/* 1. Main Property Media */}
      <section className="space-y-4 p-5 bg-white border border-slate-200 rounded-xl">
        <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">🏠 Main Property Media</h3>
        
        <MediaUploadZone
          categoryId="property_media_cover"
          activeCategory={activeCategory}
          resultsCategory={resultsCategory}
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
          uploadedCount={propertyCoverCount}
          onEdit={handleEditPropertyMedia}
          progress={progress}
          isUploading={isUploading}
          results={results}
        />

        <MediaUploadZone
          categoryId="property_media_gallery"
          activeCategory={activeCategory}
          resultsCategory={resultsCategory}
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
          uploadedCount={propertyGalleryCount}
          onEdit={handleEditPropertyMedia}
          progress={progress}
          isUploading={isUploading}
          results={results}
        />

        {!isPropertyMediaUploaded && propertyMedia.length > 0 && (
          <button
            onClick={handleUploadPropertyMedia}
            disabled={isUploading}
            className="w-full btn-primary py-2 text-sm font-semibold disabled:opacity-70"
          >
            {isUploading && activeCategory === 'property_media' ? `Uploading... ${progress}%` : "Upload Property Media"}
          </button>
        )}
      </section>

      {/* 2. Dynamic Unit Group Media Sections */}
      {formData.unit_groups.length > 0 && (
        <section className="space-y-6 p-5 bg-white border border-slate-200 rounded-xl">
          <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">🏢 Unit Group Media</h3>
          {formData.unit_groups.map((ug) => {
            // ✅ FIX: Force string conversion for safe dictionary/set access
            const ugIdStr = String(ug.id!);
            const isUploaded = uploadedUnitGroups.has(ugIdStr);
            const tasks = unitGroupMedia[ugIdStr] || [];
            const catId = `ug_${ugIdStr}`;
            
            return (
              <div key={ug.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                <h4 className="font-semibold text-slate-700 mb-3">{ug.name} ({ug.unit_type.replace(/_/g, " ")})</h4>
                
                <div className="mb-3">
                  <MediaUploadZone
                    categoryId={`${catId}_cover`}
                    activeCategory={activeCategory}
                    resultsCategory={resultsCategory}
                    title="Unit Group Cover Photo"
                    accept="image/*"
                    tasks={tasks.filter(t => t.is_cover)}
                    onUpdate={(newTasks) => {
                      const nonCovers = tasks.filter(t => !t.is_cover);
                      const marked = newTasks.map(t => ({ ...t, is_cover: true, unit_group_id: Number(ugIdStr) }));
                      setUnitGroupMedia(prev => ({ ...prev, [ugIdStr]: [...marked, ...nonCovers] }));
                    }}
                    maxFiles={1}
                    isUploaded={isUploaded}
                    uploadedCount={unitGroupCoverCounts[ugIdStr] || 0}
                    onEdit={() => handleEditUnitGroupMedia(ugIdStr)}
                    progress={progress}
                    isUploading={isUploading}
                    results={results}
                  />
                </div>

                <div className="mb-3">
                  <MediaUploadZone
                    categoryId={`${catId}_gallery`}
                    activeCategory={activeCategory}
                    resultsCategory={resultsCategory}
                    title="Unit Group Gallery"
                    tasks={tasks.filter(t => !t.is_cover)}
                    onUpdate={(newTasks) => {
                      const covers = tasks.filter(t => t.is_cover);
                      const marked = newTasks.map(t => ({ ...t, is_cover: false, unit_group_id: Number(ugIdStr) }));
                      setUnitGroupMedia(prev => ({ ...prev, [ugIdStr]: [...covers, ...marked] }));
                    }}
                    maxFiles={10}
                    onSetAsCover={(task) => handleSetUnitGroupCover(ugIdStr, task)}
                    isUploaded={isUploaded}
                    uploadedCount={unitGroupGalleryCounts[ugIdStr] || 0}
                    onEdit={() => handleEditUnitGroupMedia(ugIdStr)}
                    progress={progress}
                    isUploading={isUploading}
                    results={results}
                  />
                </div>

                {!isUploaded && tasks.length > 0 && (
                  <button
                    onClick={() => handleUploadUnitGroupMedia(ugIdStr)}
                    disabled={isUploading}
                    className="w-full md:w-auto px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-70"
                  >
                    {isUploading && activeCategory === catId ? `Uploading... ${progress}%` : `Upload ${ug.name} Media`}
                  </button>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* 3. MANDATORY: Ownership & Legal Documents */}
      <section className="space-y-4 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
        <div>
          <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">📜 Proof of Ownership & Legal Documents (MUST)</h3>
          <p className="text-sm text-amber-700 mt-1">Title deeds, land rates, KRA compliance, or business registration certificates.</p>
        </div>
        
        <MediaUploadZone
          categoryId="ownership_docs"
          activeCategory={activeCategory}
          resultsCategory={resultsCategory}
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
          results={results}
        />

        {!isDocsUploaded && ownershipDocs.length > 0 && (
          <button
            onClick={handleUploadDocs}
            disabled={isUploading}
            className="w-full btn-primary py-2 text-sm font-semibold disabled:opacity-70 bg-amber-600 hover:bg-amber-700"
          >
            {isUploading && activeCategory === 'ownership_docs' ? `Uploading Documents... ${progress}%` : "Upload Mandatory Documents"}
          </button>
        )}
      </section>
    </div>
  );
}