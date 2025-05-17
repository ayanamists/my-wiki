import React from 'react';
import clsx from 'clsx';
import styles from './Forum.module.css';

export function Forum({
  groupName,
  groupUrl,
  archivedAt,
  children,
}: {
  groupName: string;
  groupUrl: string;
  archivedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.forum}>
      <div className={styles.header}>
        <h1>{groupName}</h1>
        <a href={groupUrl} target="_blank" rel="noreferrer">
          访问小组
        </a>
        <span className={styles.archivedAt}>归档于 {new Date(archivedAt).toLocaleString()}</span>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export function Post({
  id,
  title,
  url,
  pubTime,
  highlightUserId,
  children,
}: {
  id: string;
  title: string;
  url: string;
  pubTime: string;
  highlightUserId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.post}>
      <h2 className={styles.postTitle}>
        <a href={url} target="_blank" rel="noreferrer">
          {title}
        </a>
      </h2>
      <div className={styles.metadata}>发表于 {pubTime}</div>
      <HighlightProvider highlightUserId={highlightUserId}>
        <div className={styles.postBody}>{children}</div>
      </HighlightProvider>
    </div>
  );
}

export function Reply({
  id,
  authorId,
  authorName,
  authorAvatar,
  pubTime,
  pubLocation,
  upvotes,
  children,
}: {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  pubTime: string;
  pubLocation: string;
  upvotes: number;
  children: React.ReactNode;
}) {
  const highlight = React.useContext(HighlightUserContext);
  const isHighlight = highlight === authorId;
  return (
    <div className={clsx(styles.reply, isHighlight && styles.highlight)}>
      <div className={styles.replyHeader}>
        <img src={authorAvatar} className={styles.avatar} />
        <div>
          <strong>{authorName}</strong> · <span>{pubTime}</span> · <span>{pubLocation}</span>
          {upvotes > 0 && <span className={styles.upvotes}>👍 {upvotes}</span>}
        </div>
      </div>
      <div className={styles.replyBody}>{children}</div>
    </div>);
}

// Image component for better layout
export function ForumImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt?: string;
  caption?: string;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.imageContainer}>
      <div 
        className={clsx(
          styles.imageWrapper, 
          isExpanded && styles.expanded,
          !isLoaded && styles.loading
        )}
      >
        <img 
          src={src} 
          alt={alt || caption || 'Forum image'} 
          onClick={toggleExpand}
          onLoad={() => setIsLoaded(true)}
          className={styles.forumImage}
        />
        {!isLoaded && <div className={styles.imagePlaceholder}>Loading image...</div>}
      </div>
      {caption && <div className={styles.imageCaption}>{caption}</div>}
      <button 
        className={styles.expandButton} 
        onClick={toggleExpand}
        aria-label={isExpanded ? "Collapse image" : "Expand image"}
      >
        {isExpanded ? '收起图片' : '展开图片'}
      </button>
    </div>
  );
}

// Gallery component for multiple images
export function ImageGallery({
  images,
}: {
  images: Array<{src: string; alt?: string; caption?: string}>;
}) {
  return (
    <div className={styles.gallery}>
      {images.map((image, index) => (
        <ForumImage 
          key={index} 
          src={image.src} 
          alt={image.alt} 
          caption={image.caption} 
        />
      ))}
    </div>
  );
}

// context 传递 highlightUserId
const HighlightUserContext = React.createContext<string | undefined>(undefined);

export function HighlightProvider({
  highlightUserId,
  children,
}: {
  highlightUserId?: string;
  children: React.ReactNode;
}) {
  return (
    <HighlightUserContext.Provider value={highlightUserId}>
      {children}
    </HighlightUserContext.Provider>
  );
}
