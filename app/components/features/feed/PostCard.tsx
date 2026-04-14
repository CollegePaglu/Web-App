"use client";

interface PostCardProps {
  author: string;
  authorAvatar?: string;
  timeAgo: string;
  content: string;
  imageUrl?: string;
  likes: string;
  comments: string;
}

export default function PostCard({
  author,
  authorAvatar,
  timeAgo,
  content,
  imageUrl,
  likes,
  comments,
}: PostCardProps) {
  return (
    <article
      className="cp-card overflow-hidden flex flex-col group"
      style={{ background: "var(--cp-surface)" }}
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{ background: "var(--cp-surface-2)" }}
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={author}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-sm font-bold"
                style={{ color: "var(--cp-primary)" }}
              >
                {author[0]}
              </div>
            )}
          </div>
          <div>
            <h4
              className="font-bold text-sm"
              style={{ color: "var(--cp-text)" }}
            >
              {author}
            </h4>
            <p
              className="text-[10px]"
              style={{ color: "var(--cp-muted)" }}
            >
              {timeAgo}
            </p>
          </div>
        </div>
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--cp-muted)" }}
        >
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pb-4">
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--cp-text)" }}
        >
          {content}
        </p>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={imageUrl}
            alt="Post media"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
          />
        </div>
      )}

      {/* Actions */}
      <div
        className="p-4 flex items-center gap-6"
        style={{ borderTop: "1px solid var(--cp-border)" }}
      >
        <button
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: "var(--cp-muted)" }}
        >
          <span className="material-symbols-outlined text-lg">thumb_up</span>
          <span
            className="text-xs font-bold"
            style={{ color: "var(--cp-text)" }}
          >
            {likes}
          </span>
        </button>
        <button
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: "var(--cp-muted)" }}
        >
          <span className="material-symbols-outlined text-lg">chat</span>
          <span
            className="text-xs font-bold"
            style={{ color: "var(--cp-text)" }}
          >
            {comments}
          </span>
        </button>
        <button
          className="flex items-center gap-1.5 ml-auto transition-colors"
          style={{ color: "var(--cp-muted)" }}
        >
          <span className="material-symbols-outlined text-lg">share</span>
        </button>
      </div>
    </article>
  );
}