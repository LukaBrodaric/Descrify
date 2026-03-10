"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Wand2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { propertyFormSchema, PropertyFormSchema } from "@/lib/validation";
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  INTERIOR_STYLES,
  AMENITIES,
  GeneratedOutput,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";

interface PropertyFormProps {
  remainingGenerations: number;
  usedGenerations: number;
  onGenerationComplete: (data: GeneratedOutput, remaining: number, used: number) => void;
}

const EXAMPLE_DATA: Partial<PropertyFormSchema> = {
  propertyType: "Villa",
  listingType: "Vacation rental",
  location: "Malinska, Krk Island, Croatia",
  propertySize: 180,
  bedrooms: 4,
  bathrooms: 3,
  maxGuests: 8,
  distanceToSea: "200m",
  distanceToCityCenter: "500m",
  nearbyAttractions: "Beach, Marina, Old Town",
  amenities: ["Pool", "Sea view", "Terrace", "Modern kitchen", "Fast WiFi", "Air conditioning"],
  locationHighlights: "Peaceful location with stunning sea views, close to beaches and restaurants",
  yearBuilt: "2020",
  interiorStyle: "modern",
  specialHighlights: "Newly built modern villa with infinity pool",
  additionalDetails: "Perfect for families or groups seeking a luxurious getaway",
};

export function PropertyForm({ remainingGenerations, usedGenerations, onGenerationComplete }: PropertyFormProps) {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PropertyFormSchema>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      propertyType: "Apartment",
      listingType: "For sale",
      location: "",
      propertySize: undefined,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: undefined,
      distanceToSea: "",
      distanceToCityCenter: "",
      nearbyAttractions: "",
      amenities: [],
      locationHighlights: "",
      yearBuilt: "",
      interiorStyle: undefined,
      specialHighlights: "",
      additionalDetails: "",
    },
  });

  const listingType = watch("listingType");
  const selectedAmenities = watch("amenities") || [];

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      en: { Apartment: "Apartment", House: "House", Villa: "Villa", Studio: "Studio", Land: "Land" },
      hr: { Apartment: "Stan", House: "Kuća", Villa: "Vila", Studio: "Apartman", Land: "Zemljište" }
    };
    return labels[language][type] || type;
  };

  const getListingTypeLabel = (type: string) => {
    return type === "For sale" ? (language === "hr" ? "Prodaja" : "For sale") : 
           type === "Vacation rental" ? (language === "hr" ? "Turistički najam" : "Vacation rental") : type;
  };

  const getAmenityLabel = (amenity: string) => {
    const labels: Record<string, Record<string, string>> = {
      en: { Pool: "Pool", Balcony: "Balcony", Terrace: "Terrace", Garden: "Garden", Parking: "Parking", "Sea view": "Sea view", "Air conditioning": "Air conditioning", "Modern kitchen": "Modern kitchen", "BBQ area": "BBQ area", "Private entrance": "Private entrance", "Pet friendly": "Pet friendly", "Fast WiFi": "Fast WiFi" },
      hr: { Pool: "Bazen", Balcony: "Balkon", Terrace: "Terasa", Garden: "Vrt", Parking: "Parking", "Sea view": "Pogled na more", "Air conditioning": "Klima uređaj", "Modern kitchen": "Moderna kuhinja", "BBQ area": "Roštilj", "Private entrance": "Privatni ulaz", "Pet friendly": "Dozvoljeni kućni ljubimci", "Fast WiFi": "Brzi WiFi" }
    };
    return labels[language][amenity] || amenity;
  };

  const getInteriorStyleLabel = (style: string) => {
    const labels: Record<string, Record<string, string>> = {
      en: { modern: "Modern", luxury: "Luxury", rustic: "Rustic", minimalist: "Minimalist" },
      hr: { modern: "Moderno", luxury: "Luksuzno", rustic: "Rustikalno", minimalist: "Minimalistički" }
    };
    return labels[language][style] || style;
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 3) {
      setError(language === "hr" ? "Maksimalno 3 slike dozvoljeno" : "Maximum 3 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError(language === "hr" ? "Dozvoljeni su samo JPG, PNG i WebP formati" : "Only JPG, PNG and WebP images are allowed");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(language === "hr" ? "Svaka slika mora biti manja od 5MB" : "Each image must be less than 5MB");
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  }, [images.length, language]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const toggleAmenity = useCallback((amenity: string) => {
    const current = selectedAmenities || [];
    if (current.includes(amenity as any)) {
      setValue(
        "amenities",
        current.filter((a: any) => a !== amenity) as any
      );
    } else {
      setValue("amenities", [...current, amenity] as any);
    }
  }, [selectedAmenities, setValue]);

  const fillExample = useCallback(() => {
    reset(EXAMPLE_DATA as any);
  }, [reset]);

  const onSubmit = async (data: PropertyFormSchema) => {
    if (remainingGenerations <= 0) {
      setError(t('limitReached'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === "amenities" && Array.isArray(value)) {
          value.forEach((v) => formData.append("amenities", v));
        } else if (value !== undefined && value !== "") {
          formData.append(key, String(value));
        }
      });

      images.forEach((file) => {
        formData.append("images", file);
      });

      formData.append("language", language);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || (language === "hr" ? "Neuspješno generiranje opisa" : "Failed to generate description"));
        return;
      }

      onGenerationComplete(result.data, result.remainingGenerations, result.usedGenerations);
    } catch (err) {
      setError(t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            {t('basicInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('propertyType')} required error={errors.propertyType?.message}>
              <Select {...register("propertyType")} error={!!errors.propertyType}>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getPropertyTypeLabel(type)}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label={t('listingType')} required error={errors.listingType?.message}>
              <Select {...register("listingType")} error={!!errors.listingType}>
                {LISTING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getListingTypeLabel(type)}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label={t('location')} required error={errors.location?.message}>
            <Input
              {...register("location")}
              placeholder={t('locationPlaceholder')}
              error={!!errors.location}
            />
          </FormField>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label={t('propertySize')} required error={errors.propertySize?.message}>
              <Input
                {...register("propertySize")}
                type="number"
                min="1"
                placeholder="m²"
                error={!!errors.propertySize}
              />
            </FormField>

            <FormField label={t('bedrooms')} error={errors.bedrooms?.message}>
              <Input
                {...register("bedrooms")}
                type="number"
                min="0"
                error={!!errors.bedrooms}
              />
            </FormField>

            <FormField label={t('bathrooms')} error={errors.bathrooms?.message}>
              <Input
                {...register("bathrooms")}
                type="number"
                min="0"
                error={!!errors.bathrooms}
              />
            </FormField>

            {listingType === "Vacation rental" && (
              <FormField label={t('maxGuests')} required error={errors.maxGuests?.message}>
                <Input
                  {...register("maxGuests")}
                  type="number"
                  min="1"
                  max="50"
                  error={!!errors.maxGuests}
                />
              </FormField>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            {t('locationAmenities')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label={t('distanceToSea')} error={errors.distanceToSea?.message}>
              <Input {...register("distanceToSea")} placeholder={t('distanceToSeaPlaceholder')} />
            </FormField>

            <FormField label={t('distanceToCityCenter')} error={errors.distanceToCityCenter?.message}>
              <Input {...register("distanceToCityCenter")} placeholder={t('distanceToCityCenterPlaceholder')} />
            </FormField>

            <FormField label={t('nearbyAttractions')} error={errors.nearbyAttractions?.message}>
              <Input {...register("nearbyAttractions")} placeholder={t('nearbyAttractionsPlaceholder')} />
            </FormField>
          </div>

          <FormField label={t('locationHighlights')} error={errors.locationHighlights?.message}>
            <Textarea
              {...register("locationHighlights")}
              placeholder={t('locationHighlightsPlaceholder')}
            />
          </FormField>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">{t('amenities')}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMENITIES.map((amenity) => (
                <Checkbox
                  key={amenity}
                  label={getAmenityLabel(amenity)}
                  checked={selectedAmenities.includes(amenity as any)}
                  onChange={() => toggleAmenity(amenity)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            {t('additionalDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('yearBuilt')} error={errors.yearBuilt?.message}>
              <Input {...register("yearBuilt")} placeholder={t('yearBuiltPlaceholder')} />
            </FormField>

            <FormField label={t('interiorStyle')} error={errors.interiorStyle?.message}>
              <Select {...register("interiorStyle")}>
                <option value="">{t('interiorStylePlaceholder')}</option>
                {INTERIOR_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {getInteriorStyleLabel(style)}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label={t('specialHighlights')} error={errors.specialHighlights?.message}>
            <Input
              {...register("specialHighlights")}
              placeholder={t('specialHighlightsPlaceholder')}
            />
          </FormField>

          <FormField label={t('additionalDetailsLabel')} error={errors.additionalDetails?.message}>
            <Textarea
              {...register("additionalDetails")}
              placeholder={t('additionalDetailsPlaceholder')}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-indigo-400" />
            {t('images')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={images.length >= 3}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">
                {t('dropImages')}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('imageFormats')}
              </p>
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-slate-800">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-slate-900/80 rounded-full hover:bg-red-500/80 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" disabled={isLoading || remainingGenerations <= 0} className="flex-1 h-12">
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('generating')}
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              {t('generate')}
            </>
          )}
        </Button>

        <Button type="button" variant="secondary" onClick={fillExample}>
          <Sparkles className="h-4 w-4" />
          {t('fillExample')}
        </Button>

        <Button type="button" variant="ghost" onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" />
          {t('reset')}
        </Button>
      </div>

      <p className="text-center text-sm text-slate-500">
        {usedGenerations} {t('generationsUsed')}
      </p>
    </form>
  );
}

import { translations } from "@/lib/translations";
