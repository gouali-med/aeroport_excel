import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { parseISO } from 'date-fns';
import './App.css'; // Ensure you have the CSS file for styling

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    ID_BHS: '',
    ID_EDS: '',
    IATA: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the Excel file from the local server
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:5000/excel');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = jsonData[0];
        const rows = jsonData.slice(1).map(row => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index];
            return obj;
          }, {});
        });

        setData(rows);
        setFilteredData(rows); // Initialize filtered data with all rows
      } catch (error) {
        console.error('Error reading the Excel file:', error);
        setError('Failed to load the Excel file. Please ensure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  const applyFilters = () => {
    const { ID_BHS, ID_EDS, IATA, startDate, endDate } = filters;

    const filtered = data.filter(row => {
      const rowDate = parseISO(row.DATE01);
      const isDateInRange = (!startDate || rowDate >= parseISO(startDate)) &&
                           (!endDate || rowDate <= parseISO(endDate));

      const matchesID_BHS = !ID_BHS || row.ID_BHS.toString().includes(ID_BHS);
      const matchesID_EDS = !ID_EDS || row.ID_EDS.toString().includes(ID_EDS);
      const matchesIATA = !IATA || row.IATA.toString().includes(IATA);

      return matchesID_BHS && matchesID_EDS && matchesIATA && isDateInRange;
    });

    setFilteredData(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      ID_BHS: '',
      ID_EDS: '',
      IATA: '',
      startDate: '',
      endDate: ''
    });
    setFilteredData(data); // Reset to the original data
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  return (
    <div className="app">
      <h1>Excel File Filter</h1>

      {/* Loading and error messages */}
      {loading && <p className="loading">Loading data...</p>}
      {error && <p className="error">{error}</p>}

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>ID_BHS: </label>
          <input
            type="text"
            name="ID_BHS"
            value={filters.ID_BHS}
            onChange={handleFilterChange}
            placeholder="Enter ID_BHS"
          />
        </div>
        <div className="filter-group">
          <label>ID_EDS: </label>
          <input
            type="text"
            name="ID_EDS"
            value={filters.ID_EDS}
            onChange={handleFilterChange}
            placeholder="Enter ID_EDS"
          />
        </div>
        <div className="filter-group">
          <label>IATA: </label>
          <input
            type="text"
            name="IATA"
            value={filters.IATA}
            onChange={handleFilterChange}
            placeholder="Enter IATA"
          />
        </div>
        <div className="filter-group">
          <label>Start Date: </label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>End Date: </label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="button-group">
          <button className="apply-button" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="reset-button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Display filtered data in a table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE01</th>
              <th>TIME01</th>
              <th>ID_BHS</th>
              <th>ID_EDS</th>
              <th>IATA</th>
              <th>Decision_EDS</th>
              <th>Decision_EDS_NIVEAU2</th>
              <th>Decision_BHS</th>
              <th>destination</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.ID}</td>
                <td>{row.DATE01}</td>
                <td>{row.TIME01}</td>
                <td>{row.ID_BHS}</td>
                <td>{row.ID_EDS}</td>
                <td>{row.IATA}</td>
                <td>{row.Decision_EDS}</td>
                <td>{row.Decision_EDS_NIVEAU2}</td>
                <td>{row.Decision_BHS}</td>
                <td>{row.destination}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;