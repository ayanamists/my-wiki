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
  return isHighlight ? (
    <div className={clsx(styles.reply, isHighlight && styles.highlight)}>
      <div className={styles.replyHeader}>
        <img src={authorAvatar} className={styles.avatar} />
        <div>
          <strong>{authorName}</strong> · <span>{pubTime}</span> · <span>{pubLocation}</span>
          {upvotes > 0 && <span className={styles.upvotes}>👍 {upvotes}</span>}
        </div>
      </div>
      <div className={styles.replyBody}>{children}</div>
    </div>
  ) : null;
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
