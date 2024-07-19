import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import EmployeeTable from './EmployeeTable';
import AutosaveEmployeeTable from './AutosaveEmployeeTable';

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Employee Table</Link>
            </li>
            <li>
              <Link to="/autosave">Autosave Employee Table</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<EmployeeTable />} />
          <Route path="/autosave" element={<AutosaveEmployeeTable />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
