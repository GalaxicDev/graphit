"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
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
    const layoutsInitialized = useRef(false) // Prevents double initialization in Next.js
    const fetchRef = useRef(false)

    useEffect(() => {
        // Load layout from localStorage if it exists and is not initialized
        if (!layoutsInitialized.current) {
            const savedLayouts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
            console.log('savedLayouts:', savedLayouts)
            if (savedLayouts) {
                setLayouts(savedLayouts)
            }
            layoutsInitialized.current = true
        }

        // Fetch graph data from the database
        const fetchGraphs = async () => {
            if (fetchRef.current) return;
            fetchRef.current = true;

            try {
                const res = await axios.get(process.env.API_URL + `/graphs/project/${projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                const data = res.data;
                setGraphs(data)

                // Initialize layout positions if no saved layout is present
                if (!layoutsInitialized.current) {
                    const defaultLayouts = {
                        lg: data.map((graph, index) => ({
                            i: graph._id,
                            x: (index % 2) * 6,
                            y: Math.floor(index / 2) * 2,
                            w: 6,
                            h: 2,
                        })),
                        xs: data.map((graph, index) => ({
                            i: graph._id,
                            x: 0,
                            y: index * 2,
                            w: 2,
                            h: 2,
                        }))
                    }
                    setLayouts(defaultLayouts)
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultLayouts))
                }
            } catch (error) {
                console.error('Failed to fetch graphs:', error)
            }
        }

        fetchGraphs()
    }, [projectId])

    // Save layout to localStorage whenever it changes
    useEffect(() => {
        if (layoutsInitialized.current) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layouts))
            console.log('updated layouts:', layouts)
        }
    }, [layouts])

    // Update layout state on drag or resize stop
    const onDragStop = useCallback((layout, allLayouts) => {
        setLayouts(allLayouts)
    }, [])

    const onResizeStop = useCallback((layout, allLayouts) => {
        setLayouts(allLayouts)
    }, [])

    const handleDelete = (id) => {
        const updatedLayouts = { ...layouts }
        for (const breakpoint in updatedLayouts) {
            updatedLayouts[breakpoint] = updatedLayouts[breakpoint].filter(item => item.i !== id)
        }
        setLayouts(updatedLayouts)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLayouts))
    }

    const handleEdit = (id) => {
        console.log(`Edit item ${id}`)
    }

    console.log(graphs.map(graph => graph.collection))

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={150}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            isDraggable={true}
            isResizable={true}
            draggableHandle=".drag-handle"
            draggableCancel=".no-drag"
            resizeHandles={['se']}
        >
            {graphs.map((graph) => (
                <div key={graph._id} data-grid={{
                    i: graph._id,
                    x: layouts.lg?.find(item => item.i === graph._id)?.x || 0,
                    y: layouts.lg?.find(item => item.i === graph._id)?.y || 0,
                    w: layouts.lg?.find(item => item.i === graph._id)?.w || 6,
                    h: layouts.lg?.find(item => item.i === graph._id)?.h || 2,
                }}>
                    <ChartCard
                        id={graph._id}
                        graph={graph}
                        title={graph.name}
                        color="#3b82f6"
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
