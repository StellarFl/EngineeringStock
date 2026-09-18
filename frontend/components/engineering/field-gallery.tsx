"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AppIcon, icons } from "@/components/ui/app-icon";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getFieldGallery, uploadFieldGallery, type FieldGalleryPhoto } from "@/api-services/services/engineering.service";

type GalleryCategory = "safety" | "equipment" | "damage" | "installation" | "cabling" | "other";
interface GalleryImage extends FieldGalleryPhoto { category: GalleryCategory; location: string; }
interface SelectedFile {
  file: File;
  previewUrl: string;
}
const categories: Array<{ value: GalleryCategory; label: string }> = [
  { value: "safety", label: "Safety" }, { value: "equipment", label: "Equipment" },
  { value: "damage", label: "Damage" }, { value: "installation", label: "Installation" },
  { value: "cabling", label: "Cabling" }, { value: "other", label: "Other" },
];

export function FieldGallery() {
  const fileInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [category, setCategory] = useState<GalleryCategory>("equipment");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const loadGallery = async () => {
    try {
      const response = await getFieldGallery();
      setImages(response.data.flatMap((visit) => visit.photos.map((photo) => ({
        ...photo, category: (photo.issueType as GalleryCategory) || "other", location: photo.site?.name || "Unassigned",
      }))));
    } catch (loadError) { setError(getApiErrorMessage(loadError)); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { void loadGallery(); }, []);
  const visibleImages = useMemo(() => images.filter((image) => {
    const matchesCategory = filter === "all" || image.category === filter;
    const matchesLocation = !locationFilter.trim() || image.location.toLowerCase().includes(locationFilter.trim().toLowerCase());
    return matchesCategory && matchesLocation;
  }), [filter, images, locationFilter]);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const files = selectedFiles.map((selected) => selected.file);
    if (!files.length || !location.trim()) { setError("Choose at least one image and add its site or location."); return; }
    setError(""); setIsUploading(true);
    try {
      await uploadFieldGallery({ files, category, location, note });
      await loadGallery();
      formRef.current?.reset();
      setSelectedFiles((current) => {
        current.forEach((selected) => URL.revokeObjectURL(selected.previewUrl));
        return [];
      });
      setLocation(""); setNote("");
    } catch (uploadError) { setError(getApiErrorMessage(uploadError)); }
    finally { setIsUploading(false); }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles((current) => {
      current.forEach((selected) => URL.revokeObjectURL(selected.previewUrl));
      return Array.from(event.target.files || [])
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    });
    if (event.target.files?.length) setError("");
  };

  const clearSelectedFiles = () => {
    setSelectedFiles((current) => {
      current.forEach((selected) => URL.revokeObjectURL(selected.previewUrl));
      return [];
    });
    if (fileInput.current) fileInput.current.value = "";
  };
  return (
    <section className="space-y-7">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h1 className="text-3xl font-semibold tracking-tight text-ink-950">Field gallery</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">Keep site evidence together by location and issue type. Images are stored securely for the whole team.</p></div><span className="text-sm tabular-nums text-ink-500">{images.length} {images.length === 1 ? "photo" : "photos"}</span></header>
      <form ref={formRef} onSubmit={handleUpload} className="border border-ink-200 bg-white p-5 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.55)]">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_1fr]">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-brand-300 bg-brand-50/50 px-5 text-center transition-colors hover:bg-brand-50"><AppIcon name={icons.plus} className="size-5 text-brand-700" /><span className="mt-2 text-sm font-semibold text-ink-900">Choose site photos</span><span className="mt-1 text-xs text-ink-500">JPG, PNG, or HEIC up to 4 MB each</span><input ref={fileInput} type="file" accept="image/*" multiple onChange={handleFileChange} className="sr-only" /></label>
          <label className="space-y-2 text-sm font-medium text-ink-700">Category<select value={category} onChange={(event) => setCategory(event.target.value as GalleryCategory)} className="mt-1 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm font-normal text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">{categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="space-y-2 text-sm font-medium text-ink-700">Site or location<input required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Lagos tower 04" className="mt-1 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm font-normal text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" /></label>
        </div>
        {selectedFiles.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{selectedFiles.map((selected) => <div key={`${selected.file.name}-${selected.file.lastModified}`} className="group relative overflow-hidden border border-ink-200 bg-ink-50"><img src={selected.previewUrl} alt={`Preview of ${selected.file.name}`} className="aspect-4/3 w-full object-cover" /><button type="button" onClick={clearSelectedFiles} className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-ink-700 shadow-sm hover:bg-white" aria-label="Clear selected previews"><AppIcon name={icons.close} className="size-4" /></button><p className="truncate px-2 py-2 text-xs text-ink-600">{selected.file.name}</p></div>)}</div>}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note for this batch" className="h-10 min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" /><button disabled={isUploading} type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"><AppIcon name={icons.plus} className="size-4" /> {isUploading ? "Uploading..." : "Add to gallery"}</button></div>
        {error && <p role="alert" className="mt-3 text-sm font-medium text-danger-600">{error}</p>}
      </form>
      <div className="flex flex-col gap-3 border-b border-ink-200 pb-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2">{[{ value: "all", label: "All photos" }, ...categories].map((option) => <button key={option.value} type="button" onClick={() => setFilter(option.value as GalleryCategory | "all")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${filter === option.value ? "bg-ink-950 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200"}`}>{option.label}</button>)}</div><input value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Filter by location" className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-500" /></div>
      {isLoading ? <div className="border border-ink-200 bg-white px-6 py-16 text-center text-sm text-ink-500">Loading gallery...</div> : visibleImages.length === 0 ? <div className="border border-dashed border-ink-300 bg-white px-6 py-16 text-center"><AppIcon name={icons.history} className="mx-auto size-7 text-ink-300" /><h2 className="mt-4 font-semibold text-ink-900">No photos in this view</h2><p className="mt-2 text-sm text-ink-500">Upload your first site image above, or clear the filters.</p></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleImages.map((image) => <article key={image.id} className="group overflow-hidden border border-ink-200 bg-white"><div className="relative aspect-4/3 overflow-hidden bg-ink-100"><img src={image.storageUrl} alt={`${image.category} at ${image.location}`} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /><span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] font-semibold capitalize text-white">{image.category}</span></div><div className="space-y-2 p-4"><div className="flex items-start justify-between gap-3"><h2 className="truncate text-sm font-semibold text-ink-900">{image.originalName}</h2><span className="shrink-0 text-xs text-ink-400">{image.capturedAt ? new Date(image.capturedAt).toLocaleDateString() : "-"}</span></div><p className="flex items-center gap-1.5 text-xs font-medium text-brand-700"><AppIcon name={icons.compass} className="size-3.5" />{image.location}</p>{image.notes && <p className="text-xs leading-5 text-ink-500">{image.notes}</p>}</div></article>)}</div>}
    </section>
  );
}
