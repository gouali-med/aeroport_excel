const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// Serve the Excel file
app.get('/excel', (req, res) => {
  const filePath = path.join('C:/Users/Legend wolf/Downloads/generated_excel.xlsx');
  res.sendFile(filePath);
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
});