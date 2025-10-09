export const downloadPNGFile = async (
  svgStr: string,
  name: string
) => {
  // Create an image element from the SVG string
  const img = new Image();
  img.src = `data:image/svg+xml;base64,${btoa(svgStr)}`;

  // Wait for the image to load
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // Create a canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }

  // Set canvas dimensions to match the image
  canvas.width = img.width;
  canvas.height = img.height;

  // Draw the image onto the canvas
  ctx.drawImage(img, 0, 0);

  // Convert the canvas content to a PNG data URL
  return canvas.toDataURL("image/png");

  // Create a download link for the PNG file
  const alink = document.createElement("a");
  alink.style.display = "none";
  alink.download = name.endsWith(".png") ? name : `${name}.png`; // Ensure the file has a .png extension
  alink.href = pngUrl;

  // Append the link to the document and trigger the download
  document.body.appendChild(alink);
  alink.click();

  // Clean up
  document.body.removeChild(alink);
};

export const downloadLinkFile = (link: string, name: string) => {
  // const blob = new Blob([str], { type: "image/svg+xml" })
  // const href = URL.createObjectURL(blob)
  const alink = document.createElement("a");
  alink.style.display = "none";
  alink.download = name; // Download file name
  alink.href = link;
  document.body.appendChild(alink);
  alink.click();
  document.body.removeChild(alink); // Download complete remove element
  URL.revokeObjectURL(link); // Release the blob object
};
