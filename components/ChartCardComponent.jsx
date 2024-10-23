"use client"

import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import ChartCard from './ChartCard'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)
const LOCAL_STORAGE_KEY = 'dashboard-layouts'

const initialItems = [
    { id: '1', title: 'User Growth', color: '#3b82f6', chartType: 'line', x: 0, y: 0, w: 6, h: 2, minW: 3, minH: 2 },
    { id: '2', title: 'Revenue by Category', color: '#10b981', chartType: 'bar', x: 6, y: 0, w: 6, h: 2, minW: 3, minH: 2 },
    { id: '3', title: 'Market Share', color: '#f59e0b', chartType: 'pie', x: 0, y: 2, w: 6, h: 2, minW: 3, minH: 2 },
    { id: '4', title: 'Website Traffic', color: '#ef4444', chartType: 'area', x: 6, y: 2, w: 6, h: 2, minW: 3, minH: 2 },
    { id: '5', title: 'Customer Distribution', color: '#8b5cf6', chartType: 'scatter', x: 0, y: 4, w: 6, h: 2, minW: 3, minH: 2 },
]

// Initial layout structure
const initialLayouts = {
    lg: initialItems.map(item => ({
        i: item.id, x: item.x, y: item.y, w: item.w, h: item.h, minW: item.minW, minH: item.minH
    })),
    xs: initialItems.map(item => ({
        i: item.id, x: 0, y: item.y, w: 2, h: 2, minW: 2, minH: 2 // Compact mobile layout
    }))
}

const ChartCardComponent = () => {
    const [layouts, setLayouts] = useState(initialLayouts)

    // Load saved layouts from localStorage on mount
    useEffect(() => {
        const savedLayouts = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (savedLayouts) {
            setLayouts(JSON.parse(savedLayouts))
        }
    }, [])

    // Save layouts for different breakpoints to localStorage
    const onLayoutChange = (layout, allLayouts) => {
        setLayouts(allLayouts)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allLayouts))
    }

    const handleDelete = (id) => {
        const updatedLayouts = { ...layouts }
        // Remove the item from each layout (lg, xs, etc.)
        for (const breakpoint in updatedLayouts) {
            updatedLayouts[breakpoint] = updatedLayouts[breakpoint].filter(layout => layout.i !== id)
        }
        setLayouts(updatedLayouts)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLayouts)) // Update local storage
    }

    const handleEdit = (id) => {
        console.log(`Edit item ${id}`)
    }

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layouts}   // Pass the layouts object for all breakpoints
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={150}
            onLayoutChange={(layout, allLayouts) => onLayoutChange(layout, allLayouts)}
            isDraggable={true}
            isResizable={true}
            draggableHandle=".drag-handle"
            draggableCancel=".no-drag"
            resizeHandles={['se']}
        >
            {initialItems.map(item => (
                <div key={item.id} data-grid={layouts.lg.find(l => l.i === item.id) || { x: 0, y: 0, w: 6, h: 2 }}>
                    <ChartCard
                        id={item.id}
                        title={item.title}
                        color={item.color}
                        chartType={item.chartType}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                </div>
            ))}
        </ResponsiveGridLayout>
    )
}

export default ChartCardComponent
