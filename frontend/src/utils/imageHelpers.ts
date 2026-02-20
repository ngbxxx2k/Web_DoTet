/**
 * Separates existing URL strings from new File objects.
 * Used for processing hybrid image arrays before submission.
 */
export const processImages = (images: (string | File)[]) => {
  const kept_urls: string[] = [];
  const new_files: File[] = [];

  images.forEach((img) => {
    if (typeof img === "string") {
      kept_urls.push(img);
    } else if (img instanceof File) {
      new_files.push(img);
    }
  });

  return { kept_urls, new_files };
};
