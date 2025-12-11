import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StockPOPage from './components/StockPOPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StockPOPage />} />
          <Route path="/stockpo/:poNumber" element={<StockPOPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;