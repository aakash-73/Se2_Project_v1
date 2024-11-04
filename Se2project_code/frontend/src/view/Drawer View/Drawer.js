// Drawer.js
import React from 'react';
import './Drawer.css'; // Make sure you have this CSS file in your project

const Drawer = ({ isOpen, onClose, onOptionSelect }) => {
  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Admin Options</h3>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>
      <ul className="list-group">
        <li className="list-group-item" onClick={() => onOptionSelect('userList')}>User List</li>
        <li className="list-group-item" onClick={() => onOptionSelect('registrationRequests')}>Registration Requests</li>
      </ul>
    </div>
  );
};

export default Drawer;
