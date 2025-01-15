'use client'

import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const GraphPage = ({ graphID }) => {
    const [graphData, setGraphData] = useState([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      // Fetch graph data
      const fetchGraph = async () => {
          if (fetchRef.current) return;
          fetchRef.current = true;

          try {
              const res = await axios.get(process.env.API_URL + `/graphs/${graphID}`, {
                  headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
              });
              const data = res.data;
              setGraphData(data);

          } catch (error) {
              console.error('Failed to fetch graph data:', error);
          }
      }

      fetchGraph();

    }, [graphID]);

};

export default GraphPage;