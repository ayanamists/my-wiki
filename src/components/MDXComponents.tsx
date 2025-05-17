import React from 'react';
import { ForumImage, ImageGallery } from './Forum';

// MDX component for single images
export function ForumMDXImage(props) {
  return <ForumImage {...props} />;
}

// MDX component for image galleries
export function ForumMDXGallery({ images }) {
  // Parse the images prop if it's passed as a string from MDX
  const parsedImages = typeof images === 'string' 
    ? JSON.parse(images) 
    : images;
    
  return <ImageGallery images={parsedImages} />;
}

// Export all MDX components
const MDXComponents = {
  ForumImage: ForumMDXImage,
  ImageGallery: ForumMDXGallery,
};

export default MDXComponents;
