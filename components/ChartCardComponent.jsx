import { useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import ChartCard from './ChartCard'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

const initialItems = [
    { id: '1', title: 'User Growth', color: '#3b82f6', chartType: 'line', x: 0, y: 0, w: 6, h: 2, minW: 3, minH: 2 },
    { id: '2', title: 'Revenue by Category', color: '#10b981', chartType: 'bar', x: 6, y: 0, w: 6, h: 2, minW: 3, minH: 2 },
    { id: '3', title: 'Market Share', color: '#f59e0b', chartType: 'pie', x: 0, y: 2, w: 6, h: 2, minW: 3, minH: 2 },
    { id: '4', title: 'Website Traffic', color: '#ef4444', chartType: 'area', x: 6, y: 2, w: 6, h: 2, minW: 3, minH: 2 },
    { id: '5', title: 'Customer Distribution', color: '#8b5cf6', chartType: 'scatter', x: 0, y: 4, w: 6, h: 2, minW: 3, minH: 2 },
]

const ChartCardComponent = () => {
    const [items, setItems] = useState(initialItems)

    const handleDelete = (id) => {
        setItems(items.filter(item => item.id !== id))
    }

    const handleEdit = (id) => {
        console.log(`Edit item ${id}`)
    }

    const handleResize = (id, isFullSize) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, w: isFullSize ? 12 : 6, h: isFullSize ? 4 : 2 } : item
        ))
    }

    const onLayoutChange = (layout) => {
        const newItems = items.map(item => {
            const layoutItem = layout.find(l => l.i === item.id)
            return layoutItem ? { ...item, ...layoutItem } : item
        })
        setItems(newItems)
    }

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: items }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={150}
            onLayoutChange={onLayoutChange}
            isDraggable={true}
            isResizable={false}
            draggableHandle=".drag-handle"  // Only drag when the move button is clicked
            draggableCancel=".no-drag"      // Prevent dragging when other elements are clicked
            resizeHandles={['se']}          // Only allow resizing from the bottom-right corner
        >
            {items.map(item => (
                <div key={item.id} data-grid={{ x: item.x, y: item.y, w: item.w, h: item.h, minW: item.minW, minH: item.minH }}>
                    <ChartCard
                        id={item.id}
                        title={item.title}
                        color={item.color}
                        chartType={item.chartType}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onResize={handleResize}
                    />
                </div>
            ))}
        </ResponsiveGridLayout>

    )
}

export default ChartCardComponent
