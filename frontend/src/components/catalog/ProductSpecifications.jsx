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
    <div className="space-y-2.5 sm:space-y-3">
      <h3 className="text-sm font-medium text-surface-900">Specifications</h3>
      <div className="divide-y divide-surface-100 border border-surface-100 rounded-lg">
        {sections.map(([section, specs]) => (
          <div key={section}>
            <button
              onClick={() => toggleSection(section)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-50 hover:bg-surface-100 transition-colors min-h-[44px]"
            >
              <span className="text-xs sm:text-sm font-medium text-surface-900">{section}</span>
              {expandedSections[section] ? (
                <ChevronUp className="w-4 h-4 text-surface-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-surface-500 flex-shrink-0" />
              )}
            </button>
            {expandedSections[section] && (
              <div className="px-3 sm:px-4 py-2">
                {specs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-surface-50 last:border-0 gap-0.5 sm:gap-0"
                  >
                    <span className="text-xs sm:text-sm text-surface-500">{spec.name}</span>
                    <span className="text-xs sm:text-sm text-surface-900 font-medium sm:font-normal">{spec.value}</span>
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
