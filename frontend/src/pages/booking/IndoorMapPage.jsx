import { useState } from 'react';
import { FaBuilding, FaLayerGroup } from 'react-icons/fa';
import IndoorMap from '../../components/IndoorMap';
import '../../components/IndoorMap.css';

function IndoorMapPage() {
  const [building, setBuilding] = useState('Innovation Center');
  const [floor, setFloor] = useState('L1');

  return (
    <div className="indoor-map-page-wrapper">
      <div className="map-top-bar">
        <div className="map-title-group">
          <h1>Today's Office</h1>
          <p>{building} • {floor}</p>
        </div>
        <div className="map-controls">
          <div className="map-select-wrapper">
            <FaBuilding style={{ marginRight: '8px', color: '#64748b' }} />
            <select className="map-select" value={building} onChange={(e) => setBuilding(e.target.value)}>
              <option>London HQ</option>
              <option>Colombo Hub</option>
              <option>New York Office</option>
            </select>
          </div>
          <div className="map-select-wrapper">
            <FaLayerGroup style={{ marginRight: '8px', color: '#64748b' }} />
            <select className="map-select" value={floor} onChange={(e) => setFloor(e.target.value)}>
              <option>1st Floor</option>
              <option>2nd Floor</option>
              <option>3rd Floor</option>
            </select>
          </div>
        </div>
      </div>
      
      <IndoorMap />
    </div>
  );
}

export default IndoorMapPage;
