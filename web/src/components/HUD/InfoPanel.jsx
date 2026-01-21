import React from 'react';

export default function InfoPanel({ selectedObject }) {
  const isVisible = !!selectedObject;

  // We need to parse the object data to display it safely
  // Since the original code used `object.toHTML()`, we might want to preserve that logic 
  // or refactor SimObject.toHTML to return data instead of HTML string.
  // For now, let's use dangerouslySetInnerHTML if we want to reuse the existing `toHTML`.
  // Ideally, we should refactor SimObject later.
  
  const content = selectedObject ? selectedObject.toHTML() : '';

  return (
    <div 
      id="info-panel" 
      className="container" 
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
      dangerouslySetInnerHTML={{ __html: content }}
    >
    </div>
  );
}
