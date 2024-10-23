"use client"

import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import ChartCard from './ChartCard'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import axios from 'axios'

const ResponsiveGridLayout = WidthProvider(Responsive)
const LOCAL_STORAGE_KEY = 'dashboard-layouts'

const ChartCardComponent = ({ projectId }) => {
    const [layouts, setLayouts] = useState({ lg: [], xs: [] })
    const [graphs, setGraphs] = useState([])
    const [color, setColor] = useState("#3b82f6");


    // Fetching graphs from API and updating the layout
    const fetchGraphs = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/graphs/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const data = res.data
            setGraphs(data)

            // Map the graphs to layouts for different breakpoints
            const newLayouts = {
                lg: data.map((graph, index) => ({
                    i: graph._id, x: (index % 2) * 6, y: Math.floor(index / 2) * 2, w: 6, h: 2, minW: 3, minH: 2
                })),
                xs: data.map((graph, index) => ({
                    i: graph._id, x: 0, y: index * 2, w: 2, h: 2, minW: 2, minH: 2
                }))
            }
            setLayouts(prevLayouts => ({
                ...prevLayouts,
                lg: newLayouts.lg, // Only update the lg and xs layout, retain others
                xs: newLayouts.xs
            }))
        } catch (error) {
            console.error('Failed to fetch graphs:', error)
        }
    }

    // Fetch graphs on component mount or when projectId changes
    useEffect(() => {
        fetchGraphs()
    }, [projectId])

    // Layout change handler to update local storage and state
    const onLayoutChange = (layout, allLayouts) => {
        setLayouts(allLayouts)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allLayouts))
    }

    const handleDelete = (id) => {
        const updatedLayouts = { ...layouts }
        for (const breakpoint in updatedLayouts) {
            updatedLayouts[breakpoint] = updatedLayouts[breakpoint].filter(item => item.i !== id)
        }
        setLayouts(updatedLayouts)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLayouts)) // Update local storage
        fetchGraphs()  // Refresh the graphs after deletion
    }

    const handleEdit = (id) => {
        console.log(`Edit item ${id}`)
    }

    function generateColor() {
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        setColor('#' + randomColor);
    }
    generateColor();

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layouts}   // Use layouts from state
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={150}
            onLayoutChange={onLayoutChange}   // Dynamically handle layout changes
            isDraggable={true}
            isResizable={true}
            draggableHandle=".drag-handle"
            draggableCancel=".no-drag"
            resizeHandles={['se']}
        >
            {graphs.map((graph, index) => (
                <div key={graph._id} data-grid={layouts.lg.find(l => l.i === graph._id) || { x: (index % 2) * 6, y: Math.floor(index / 2) * 2, w: 6, h: 2 }}>
                    <ChartCard
                        id={graph._id}
                        title={graph.name}
                        color=color
                        chartType={graph.type}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                </div>
            ))}
        </ResponsiveGridLayout>
    )
}

export default ChartCardComponent
