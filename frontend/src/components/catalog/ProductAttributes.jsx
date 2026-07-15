export default function ProductAttributes({ attributes = [] }) {
  if (attributes.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Attributes</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {attributes.map((attr) => (
          <div key={attr.id} className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">{attr.attribute_name}</span>
            <span className="text-sm font-medium text-gray-900">{attr.attribute_value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
