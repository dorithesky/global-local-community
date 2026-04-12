type PostImagesProps = {
  imageUrls?: string[];
  title: string;
};

export function PostImages({ imageUrls = [], title }: PostImagesProps) {
  if (!imageUrls.length) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {imageUrls.slice(0, 4).map((imageUrl, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${imageUrl}-${index}`}
          src={imageUrl}
          alt={`${title} image ${index + 1}`}
          className="h-56 w-full rounded-2xl border border-slate-200 object-cover"
        />
      ))}
    </div>
  );
}
