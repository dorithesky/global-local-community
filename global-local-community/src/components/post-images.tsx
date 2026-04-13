type PostImagesProps = {
  imageUrls?: string[];
  title: string;
  compact?: boolean;
};

export function PostImages({ imageUrls = [], title, compact = false }: PostImagesProps) {
  if (!imageUrls.length) return null;

  return (
    <div className={`mt-4 grid gap-3 ${imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {imageUrls.slice(0, 4).map((imageUrl, index) => (
        <div
          key={`${imageUrl}-${index}`}
          className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${compact ? 'min-h-36 sm:min-h-44' : 'min-h-48 sm:min-h-64'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${title} image ${index + 1}`}
            className={`h-full w-full ${compact ? 'max-h-56 sm:max-h-64' : 'max-h-[24rem] sm:max-h-[32rem]'} object-contain bg-white`}
          />
        </div>
      ))}
    </div>
  );
}
