import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductSpecifications({ specifications = {} }) {
  const sections = Object.entries(specifications);
  const [expandedSections, setExpandedSections] = useState(
    sections.reduce((acc, [section]) => ({ ...acc, [section]: true }), {})
  );

  useEffect(() => {
    setExpandedSections(
      Object.keys(specifications).reduce((acc, section) => ({ ...acc, [section]: true }), {})
    );
  }, [specifications]);

  if (sections.length === 0) return null;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Specifications</h3>
      <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
        {sections.map(([section, specs]) => (
          <div key={section}>
            <button
              onClick={() => toggleSection(section)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">{section}</span>
              {expandedSections[section] ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections[section] && (
              <div className="px-4 py-2">
                {specs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-500">{spec.name}</span>
                    <span className="text-sm text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
