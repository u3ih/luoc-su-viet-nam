import NextImage, { type ImageProps } from "next/image";

export default function Image({ alt, sizes = "(max-width: 760px) 100vw, 50vw", ...props }: ImageProps & { alt: string }) {
  return <NextImage alt={alt} sizes={sizes} {...props} />;
}
