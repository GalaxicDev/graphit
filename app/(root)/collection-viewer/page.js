'use client'

import { useState } from 'react'
import { Search, Database, Trash2, Download, Edit } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Sample data to simulate MongoDB collections and documents

const sampleCollections = ['users', 'products', 'orders', 'reviews']
const sampleDocuments = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com' },
  ],
  products: [
    { id: 1, name: 'Laptop', price: 999.99 },
    { id: 2, name: 'Smartphone', price: 599.99 },
    { id: 3, name: 'Headphones', price: 149.99 },
    { id: 4, name: 'Tablet', price: 399.99 },
    { id: 5, name: 'Smartwatch', price: 249.99 },
  ],
  orders: [
    { id: 1, customer: 'John Doe', total: 1299.98, date: '2023-05-01' },
    { id: 2, customer: 'Jane Smith', total: 599.99, date: '2023-05-02' },
    { id: 3, customer: 'Bob Johnson', total: 149.99, date: '2023-05-03' },
    { id: 4, customer: 'Alice Brown', total: 999.99, date: '2023-05-04' },
    { id: 5, customer: 'Charlie Davis', total: 849.98, date: '2023-05-05' },
  ],
  reviews: [
    { id: 1, product: 'Laptop', rating: 4.5, comment: 'Great performance!' },
    { id: 2, product: 'Smartphone', rating: 4.0, comment: 'Good value for money' },
    { id: 3, product: 'Headphones', rating: 5.0, comment: 'Excellent sound quality' },
    { id: 4, product: 'Tablet', rating: 3.5, comment: 'Decent, but could be better' },
    { id: 5, product: 'Smartwatch', rating: 4.2, comment: 'Nice features, comfortable to wear' },
  ],
}

export default function MongoDBViewer() {
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
    alert(`Deleting document with ID: ${id}`)
  }

  const handleEdit = (id) => {
    alert(`Editing document with ID: ${id}`)
  }

  const filteredCollections = sampleCollections.filter(collection =>
    collection.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDocuments = selectedCollection
    ? sampleDocuments[selectedCollection].filter(doc =>
        JSON.stringify(doc).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">MongoDB Collection Viewer</h1>
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
                {paginatedDocuments.map(doc => (
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

