import Image from "next/image";

export function CustomerAvatar({
  url,
  name,
  size = 56,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-surface-muted"
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image
          src={url}
          alt={`${name}の写真`}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted">
          {name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}
