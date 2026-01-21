import React from 'react';

// Icons
import selectIcon from '/icons/select-color.png';
import bulldozeIcon from '/icons/bulldozer-color.png';
import residentialIcon from '/icons/house-color.png';
import commercialIcon from '/icons/store-color.png';
import industrialIcon from '/icons/factory-color.png';
import roadIcon from '/icons/road-color.png';
import powerPlantIcon from '/icons/power-color.png';
import powerLineIcon from '/icons/power-line-color.png';
import pauseIcon from '/icons/pause-color.png';
import playIcon from '/icons/play-color.png';

const TOOLS = [
  { id: 'select', icon: selectIcon },
  { id: 'bulldoze', icon: bulldozeIcon },
  { id: 'residential', icon: residentialIcon },
  { id: 'commercial', icon: commercialIcon },
  { id: 'industrial', icon: industrialIcon },
  { id: 'road', icon: roadIcon },
  { id: 'power-plant', icon: powerPlantIcon },
  { id: 'power-line', icon: powerLineIcon },
];

export default function Toolbar({ activeTool, onToolSelect, isPaused, onTogglePause, style }) {
  return (
    <div id="ui-toolbar" style={style}>
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          id={`button-${tool.id}`}
          className={`ui-button ${activeTool === tool.id ? 'selected' : ''}`}
          data-type={tool.id}
          onClick={() => onToolSelect(tool.id)}
        >
          <img className="toolbar-icon" src={tool.icon} alt={tool.id} />
        </button>
      ))}
      
      <button id='button-pause' className="ui-button" onClick={onTogglePause}>
        <img 
          id='pause-button-icon' 
          className="toolbar-icon" 
          src={isPaused ? playIcon : pauseIcon} 
          alt={isPaused ? "Play" : "Pause"} 
        />
      </button>
    </div>
  );
}
