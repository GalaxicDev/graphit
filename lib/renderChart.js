import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, PieChart, Pie, Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis, CartesianGrid, Tooltip, Legend, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const isISODate = !isNaN(Date.parse(label));
        const displayLabel = isISODate ? format(new Date(label), "MMM dd, yyyy HH:mm") : label;
        return (
            <div className="bg-white dark:bg-gray-800 border dark:text-white border-gray-300 dark:border-gray-700 shadow-lg rounded-lg p-3">
            <p className="text-gray-700 dark:text-gray-100 font-semibold mb-1">{displayLabel}</p>
            {payload.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>{item.name}</span>
                <span style={{ color: item.color }} className="font-medium">{item.value}</span>
                </div>
            ))}
            </div>
        );
    }
    return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const formatXAxis = (tickItem) => {
    if (typeof tickItem === "number" && tickItem.toString().length === 10) {
        return format(new Date(tickItem * 1000), "MMM dd, yyyy");
    }

    if (typeof tickItem === "string" && !isNaN(Date.parse(tickItem))) {
        return format(new Date(tickItem), "MMM dd, yyyy");
    }
    return tickItem;
}

export const renderChart = ({ chartType, elements, graphData, options, availableKeys }) => {
    if (!chartType || !elements?.length || !graphData?.length) {
        return <p>No data available for rendering the chart.</p>;
    }

    if (!["Line", "Bar", "Area", "Scatter", "Pie"].includes(chartType)) {
        return <p>Invalid chart type.</p>;
    }


    const yMin = options.yRange.min;
    const yMax = options.yRange.max;

    const yAxisDomain =
        yMin !== undefined && yMin !== "" && yMax !== undefined && yMax !== ""
            ? [yMin, yMax]
            : yMin !== undefined && yMin !== ""
                ? [yMin, "auto"]
                : yMax !== undefined && yMax !== ""
                    ? [0, yMax]
                    : [0, "auto"];

    const filteredGraphData = graphData.filter((data) =>
        elements.every((element) => {
            const value = data[element.yAxisKey];
            return (
                (yMin === undefined || yMin === "" || value >= yMin) &&
                (yMax === undefined || yMax === "" || value <= yMax)
            );
        })
    );

    console.log('filteredGraphData:', filteredGraphData);
    

    switch (chartType) {
        case 'Line':
            return (
                <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={filteredGraphData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={elements[0].xAxisKey} tickFormatter={formatXAxis} />
                        <YAxis domain={yAxisDomain} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {elements.map((element, index) => (
                            <Line
                                key={index}
                                type={element.curved ? "monotone" : "linear"}
                                dataKey={element.yAxisKey}
                                stroke={element.color}
                                strokeWidth={element.thickness}
                                dot={element.showDots ? { r: element.dotSize } : false}
                                strokeDasharray={element.dotted ? "3 3" : ""}
                                name={element.name || element.yAxisKey}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            );

        case 'Bar':
            return (
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={filteredGraphData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={elements[0].xAxisKey} />
                        <YAxis domain={yAxisDomain} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {elements.map((element, index) => (
                            <Bar key={index} dataKey={element.yAxisKey} fill={element.color} name={element.name || element.yAxisKey} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            );

        case 'Area':
            return (
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={filteredGraphData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={elements[0].xAxisKey} />
                        <YAxis domain={yAxisDomain} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {elements.map((element, index) => (
                            <Area
                                key={index}
                                type={element.curved ? "monotone" : "linear"}
                                dataKey={element.yAxisKey}
                                stroke={element.color}
                                fill={element.color}
                                strokeWidth={element.thickness}
                                dot={element.showDots ? { r: element.dotSize } : false}
                                strokeDasharray={element.dotted ? "3 3" : ""}
                                name={element.name || element.yAxisKey}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            );

            case 'Scatter':
                return (
                    <ResponsiveContainer width="100%" height={200}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                type="number"
                                dataKey={elements[0].xAxisKey} 
                                tickFormatter={formatXAxis} 
                                name={elements[0].xAxisKey} 
                            />
                            <YAxis 
                                type="number" 
                                dataKey={elements[0].yAxisKey} 
                                name={elements[0].yAxisKey} 
                                domain={yAxisDomain}
                            />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                            <Legend />
                            {elements.map((element, index) => (
                                <Scatter 
                                    key={index} 
                                    name={element.name || element.yAxisKey} 
                                    data={filteredGraphData} 
                                    fill={element.color} 
                                />
                            ))}
                        </ScatterChart>
                    </ResponsiveContainer>
                );
            

                case 'Pie':
    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {elements.map((element, index) => {
                    // Dynamically generate pieItems from filteredGraphData
                    const pieItems = element.pieItems.map((item) => {
                        const value = filteredGraphData[0][item.value]; // Map the value key to the actual value in filteredGraphData
                        return {
                            name: item.name,
                            value: value !== undefined ? value : 0, // Fallback to 0 if value is undefined
                            color: item.color || element.color, // Use item-specific color or fallback to element color
                        };
                    });

                    console.log(`Pie Items for Element ${index}:`, pieItems); // Debugging output

                    if (!pieItems || pieItems.length === 0) {
                        console.warn(`No data for Pie Chart element at index ${index}`);
                        return null; // Skip rendering if no data
                    }

                    return (
                        <Pie
                            key={index}
                            data={pieItems} // Use the dynamically generated pieItems
                            dataKey="value" // The key for the value in each pie item
                            nameKey="name" // The key for the name in each pie item
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={40} // Add innerRadius for a donut-style chart (optional)
                            label={(entry) => `${entry.name}: ${entry.value}`} // Display name and value in labels
                            labelLine={false}
                            fill={element.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`} // Fallback to element color or random color
                        >
                            {pieItems.map((item, idx) => (
                                <Cell
                                    key={`cell-${idx}`}
                                    fill={item.color || element.color ||`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Use item-specific color, fallback to element color, or random color
                                />
                            ))}
                        </Pie>
                    );
                })}
            </PieChart>
        </ResponsiveContainer>
    );

        default:
            return null;
    }
};