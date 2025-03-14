'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Database, SquareArrowOutUpRight, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import nextConfig from '@/next.config.mjs';
import { useUser } from '@/lib/UserContext'


export default function MongoDBViewer() {
    const [collections, setCollections] = useState([])
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [documents, setDocuments] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalDocuments, setTotalDocuments] = useState(0)
    const itemsPerPage = 10

    const { token } = useUser();

    useEffect(() => {
        // Fetch all collections
        if(typeof window !== 'undefined'){
            axios.get(nextConfig.env.API_URL + '/collections', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    const collectionList = response.data.map(collection => collection.name); // Extract collection names and put them in a list
                    setCollections(collectionList);
                })
                .catch(error => {
                    console.error('Error fetching collections:', error)
                })
        }
    }, [token])

    useEffect(() => {
        if (selectedCollection) {
            // Fetch documents of the selected collection
            axios.get(nextConfig.env.API_URL + `/collections/${selectedCollection}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    page: currentPage,
                    pageSize: itemsPerPage
                }
            })
            .then(response => {
                setDocuments(response.data.documents)
                setTotalDocuments(response.data.totalDocuments)
            })
            .catch(error => {
                console.error('Error fetching documents:', error)
            })
        }
    }, [selectedCollection, currentPage, itemsPerPage, token])

    const handleCollectionClick = (collection) => {
        setSelectedCollection(collection)
        setCurrentPage(1)
    }

    const handleSearch = (event) => {
        setSearchTerm(event.target.value)
        setCurrentPage(1)
    }

    const handleExport = (coll, format = 'json') => {
        axios.get(nextConfig.env.API_URL + `/collections/${coll}/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                const docs = response.data.documents;
                if (format === 'json') {
                    // Create a Blob object containing the data in JSON format
                    const blob = new Blob([JSON.stringify(docs, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${coll}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                } else if (format === 'csv') {
                    // Convert JSON data to CSV format
                    if (Array.isArray(docs) && docs.length > 0) {
                        const allKeys = new Set(docs.flatMap(doc => Object.keys(doc))); // Get all keys from all documents, not just the first one
                        const headers = Array.from(allKeys).join(',');
                        const rows = docs.map(row => 
                            Array.from(allKeys).map(key => row[key] !== undefined ? row[key] : '').join(',') // Fill in empty values with an empty string
                        ).join('\n');
                        const csvContent = `${headers}\n${rows}`; // Combine headers and rows
                        const blob = new Blob([csvContent], { type: 'text/csv' }); // Convert to blob
                        const url = URL.createObjectURL(blob); // Create a URL for the blob
                        const link = document.createElement('a'); // Create a link element
                        link.href = url; // Set the link's href attribute to the URL
                        link.download = `${coll}.csv`; // Set the download attribute to the collection name
                        link.click(); // Simulate a click on the link
                        URL.revokeObjectURL(url);
                    } else {
                        console.error('No data available for CSV export.');
                    }
                }
            })
            .catch(error => {
                console.error('Error exporting collection:', error);
            });
    };

    const handleDelete = (id) => {
        // Handle delete document
    }
    // Search for collections
    const filteredCollections = collections.filter(collection =>
        collection.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Search for documents
    const filteredDocuments = selectedCollection
        ? documents.filter(doc =>
                JSON.stringify(doc).toLowerCase().includes(searchTerm.toLowerCase())
            )
        : []

    const totalPages = Math.ceil(totalDocuments / itemsPerPage)


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Collection Viewer</h1>
            <div className="mb-4">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search collections or documents..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-10 dark:bg-gray-700 dark:text-white"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:bg-gray-700" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1">
                    <h2 className="text-xl font-semibold mb-2 dark:text-white">Collections</h2>
                    <ul className="space-y-2">
                        {filteredCollections.map(collection => (
                            <li key={collection}>
                                <Button
                                    variant={selectedCollection === collection ? "default" : "unselected"}
                                    className={`w-full justify-start dark:bg-gray-700 dark:text-white hover:cursor-pointer ${selectedCollection === collection ? "bg-black text-white" : "hover:bg-gray-200"}`}
                                    onClick={() => handleCollectionClick(collection)}
                                >
                                    <Database className="mr-2 h-4 w-4" />
                                    {collection}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-span-1 md:col-span-3">
                    {selectedCollection && (
                        <>
                            <div className="flex justify-between items-center mb-4 dark:text-white">
                                <h2 className="text-xl font-semibold">{selectedCollection}</h2>
                                <div className="flex space-x-2">
                                    <Button onClick={() => handleExport(selectedCollection, 'json')}>
                                        <SquareArrowOutUpRight className="mr-2 h-4 w-4" />
                                        Export JSON
                                    </Button>
                                    <Button onClick={() => handleExport(selectedCollection, 'csv')}>
                                        <SquareArrowOutUpRight className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {filteredDocuments.map(doc => (
                                    <div key={doc.id} className="bg-gray-200 p-4 rounded-lg dark:bg-gray-700 dark:text-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <pre className="text-sm overflow-x-auto">
                                                {JSON.stringify(doc, null, 2)}
                                            </pre>
                                            <div className="flex space-x-2">
                                                <Button className="dark:bg-gray-800" variant="outline" size="sm" onClick={() => handleEdit(doc.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="bg-blue-600 text-white"
                                >
                                    Previous
                                </Button>
                                <div>
                                    <input
                                        type="number"
                                        value={currentPage}
                                        onChange={(e) => {
                                            const page = Math.max(1, Math.min(Number(e.target.value), totalPages));
                                            setCurrentPage(page);
                                        }}
                                        className="w-12 rounded text-center border-none focus:outline-none hover:border-gray-800 hover:bg-white hover:border-solid"
                                    />
                                    <span>
                                        of {totalPages}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="bg-blue-600 text-white"
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
