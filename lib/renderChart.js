import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, CartesianGrid, Tooltip, Legend, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-lg p-3">
                <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">{label}</p>
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

    if (!["Line", "Bar", "Area", "Scatter", "Pie", "Radar"].includes(chartType)) {
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
                            <Bar key={index} dataKey={element.yAxisKey} fill={element.color} />
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
                        <XAxis dataKey={elements[0].xAxisKey} />
                        <YAxis domain={yAxisDomain} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {elements.map((element, index) => (
                            <Scatter key={index} data={filteredGraphData} fill={element.color} />
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
                        {elements.map((element, index) => (
                            <Pie
                                key={index}
                                data={filteredGraphData}
                                dataKey={element.yAxisKey}
                                nameKey={element.xAxisKey}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill={element.color}
                                label={renderCustomizedLabel}
                                labelLine={false}
                            >
                                {filteredGraphData.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={element.color} />
                                ))}
                            </Pie>
                        ))}
                    </PieChart>
                </ResponsiveContainer>
            );

        case 'Radar':
            return (
                <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={filteredGraphData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey={elements[0].xAxisKey} />
                        <PolarRadiusAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {elements.map((element, index) => (
                            <Radar
                                key={index}
                                dataKey={element.yAxisKey}
                                stroke={element.color}
                                fill={element.color}
                                fillOpacity={0.6}
                            />
                        ))}
                    </RadarChart>
                </ResponsiveContainer>
            );

        default:
            return null;
    }
};