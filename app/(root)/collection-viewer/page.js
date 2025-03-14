'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Database, SquareArrowOutUpRight, Edit, Trash2, Ellipsis } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
    if (typeof window !== 'undefined') {
      axios.get(nextConfig.env.API_URL + '/collections', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => {
          const collectionList = response.data.map(collection => collection.name)
          setCollections(collectionList)
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

  const handleExport = () => {
    alert(`Exporting ${selectedCollection} data...`)
  }

  const handleDelete = (id) => {
    // Handle delete document
  }

  const handleDropdownOptionClick = (option, collection) => {
    if (option === 'changeDisplayName') {

      // open the modal to change the display name
      


      alert(`Change alias for ${collection}`)
    } else if (option === 'copyFullName') {
      navigator.clipboard.writeText(collection)
      alert(`Copied full name: ${collection}`)
    }
  }

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
      <Input
        type="text"
        placeholder="Search collections or documents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 dark:bg-gray-700 dark:text-white"
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Collections</h2>
          <ul className="space-y-2">
            {filteredCollections.map(collection => (
              <li key={collection} className="relative">
                <div
                  className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer dark:bg-gray-700 dark:text-white ${selectedCollection === collection ? 'bg-blue-200 dark:bg-blue-500' : ''}`}
                  onClick={() => handleCollectionClick(collection)}
                >                
                 <Database className="mr-1 h-4 w-4" />
                  {collection}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDropdownOptionClick('changeDisplayName', collection)}>
                        Change Display Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDropdownOptionClick('copyFullName', collection)}>
                        Copy Full Name
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-1 md:col-span-3">
          {selectedCollection && (
            <>
              <div className="flex justify-between items-center mb-4 dark:text-white">
                <h2 className="text-xl font-semibold">{selectedCollection}</h2>
                <Button onClick={handleExport}>
                  <SquareArrowOutUpRight className="mr-2 h-4 w-4"/>
                  Export
                </Button>
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
