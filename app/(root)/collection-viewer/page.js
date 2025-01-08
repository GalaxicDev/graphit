'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Database, Download, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'


export default function MongoDBViewer() {
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [documents, setDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    // Fetch all collections
    axios.get(process.env.API_URL + '/collections', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        const collectionList = response.data.map(collection => collection.name); // Extract collection names and put them in a list
        setCollections(collectionList);
      })
      .catch(error => {
        console.error('Error fetching collections:', error)
      })
  }, [])

  useEffect(() => {
    if (selectedCollection) {
      // Fetch documents of the selected collection
      axios.get(process.env.API_URL + `/collections/${selectedCollection}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
  }, [selectedCollection, currentPage, itemsPerPage])

  const handleCollectionClick = (collection) => {
    setSelectedCollection(collection)
    setCurrentPage(1)
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const handleExport = () => {
    alert(`Exporting ${selectedCollection} data...`)
  }

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
                  variant={selectedCollection === collection ? "default" : "outline"}
                  className="w-full justify-start"
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedCollection}</h2>
                <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="space-y-4">
                {filteredDocuments.map(doc => (
                  <div key={doc.id} className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(doc, null, 2)}
                      </pre>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(doc.id)}>
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
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
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
