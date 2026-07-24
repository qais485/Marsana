export default function ProductTags({ tags = [] }) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-surface-900">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="px-3 py-1 bg-surface-100 text-surface-700 text-sm rounded-full"
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}
