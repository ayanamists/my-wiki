import React from 'react';
// Import the original MDX components
import MDXComponents from '@theme-original/MDXComponents';
// Import our custom MDX components
import { ForumMDXImage, ForumMDXGallery } from '../components/MDXComponents';

export default {
  // Re-use the default MDX components
  ...MDXComponents,
  // Add our custom MDX components
  ForumImage: ForumMDXImage,
  ImageGallery: ForumMDXGallery,
};
