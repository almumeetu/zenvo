'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon, Check, Loader2, RefreshCw } from 'lucide-react';
import { uploadImageToStorage } from '@/lib/supabase';

interface ImageDropzoneProps {
  initialValue?: string;
  onChange?: (url: string) => void;
  name?: string;
  label?: string;
}

export function ImageDropzone({
  initialValue = '',
  onChange,
  name = 'image',
  label = 'Product Image',
}: ImageDropzoneProps) {
  const [imagePreview, setImagePreview] = useState<string>(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [customUrl, setCustomUrl] = useState(initialValue);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (url: string) => {
    setImagePreview(url);
    setCustomUrl(url);
    if (onChange) onChange(url);
  };

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    // 1. Create immediate local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleUpdate(result);
    };
    reader.readAsDataURL(file);

    // 2. Attempt Supabase upload if available
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const uploadRes = await uploadImageToStorage(file, `products/${fileName}`);
      if (uploadRes?.publicUrl) {
        handleUpdate(uploadRes.publicUrl);
      }
    } catch (err: any) {
      console.warn('Supabase storage upload bypassed, using local asset/preview:', err?.message || err);
      // We keep the Base64/local URL from FileReader so it continues to work seamlessly!
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setImagePreview('');
    setCustomUrl('');
    if (onChange) onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zenvo-text-muted flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-zenvo-primary" />
          {label}
        </label>
        <div className="flex items-center gap-1 bg-zenvo-surface p-0.5 rounded-lg border border-zenvo-border text-[10px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all ${
              mode === 'upload' ? 'bg-zenvo-primary text-white shadow-sm' : 'text-zenvo-text-muted hover:text-zenvo-text'
            }`}
          >
            Drag & Drop
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all ${
              mode === 'url' ? 'bg-zenvo-primary text-white shadow-sm' : 'text-zenvo-text-muted hover:text-zenvo-text'
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Hidden input to pass value into form data */}
      <input type="hidden" name={name} value={imagePreview} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {imagePreview ? (
        <div className="relative rounded-2xl border-2 border-zenvo-primary/40 bg-zenvo-surface/80 p-3 overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-zenvo-bg border border-zenvo-border shrink-0 shadow-inner flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Product Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600';
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin text-zenvo-primary mb-1" />
                  <span className="text-[9px] font-bold">Uploading...</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5 text-zenvo-success text-xs font-bold">
                <Check className="w-4 h-4" /> Image Ready
              </div>
              <p className="text-[11px] text-zenvo-text-secondary truncate font-mono bg-zenvo-bg/80 px-2.5 py-1 rounded-lg border border-zenvo-border">
                {imagePreview.startsWith('data:') ? 'Local Image (Base64 ready)' : imagePreview}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-zenvo-surface border border-zenvo-border hover:border-zenvo-primary text-xs font-bold text-zenvo-text hover:text-zenvo-primary transition-all flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Change File
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-lg bg-zenvo-error-soft/30 border border-zenvo-error/20 text-zenvo-error hover:bg-zenvo-error hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : mode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-6 text-center flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-zenvo-primary bg-zenvo-primary-soft/40 scale-[1.01]'
              : 'border-zenvo-border hover:border-zenvo-primary-border bg-zenvo-surface/40 hover:bg-zenvo-surface'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-zenvo-primary-soft flex items-center justify-center border border-zenvo-primary-border/40 text-zenvo-primary shadow-sm group-hover:scale-105 transition-transform">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-zenvo-primary" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-zenvo-text">
              <span className="text-zenvo-primary">Click to upload</span> or drag and drop image
            </p>
            <p className="text-[10px] text-zenvo-text-muted mt-0.5">
              PNG, JPG, WEBP, or SVG (Recommended 600x600 px)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 text-zenvo-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or /play-store.jpeg"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zenvo-surface border border-zenvo-border text-xs text-zenvo-text focus:outline-none focus:border-zenvo-primary-border"
              />
            </div>
            <button
              type="button"
              onClick={() => handleUpdate(customUrl)}
              disabled={!customUrl.trim()}
              className="px-4 py-2.5 rounded-xl bg-zenvo-primary text-white text-xs font-bold uppercase hover:brightness-110 disabled:opacity-50 transition-all shrink-0"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-[10px] font-bold text-zenvo-error">{uploadError}</p>
      )}
    </div>
  );
}
