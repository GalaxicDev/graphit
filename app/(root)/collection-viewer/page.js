'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Database, SquareArrowOutUpRight, Edit, Trash2, Ellipsis, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import nextConfig from '@/next.config.mjs';
import { useUser } from '@/lib/UserContext'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export default function MongoDBViewer() {
    const [collections, setCollections] = useState([])
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [documents, setDocuments] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalDocuments, setTotalDocuments] = useState(0)
    const [successMessage, setSuccessMessage] = useState('')
    const [displaynameDialogOpen, setDisplaynameDialogOpen] = useState(false)
    const [selectedChannel, setSelectedChannel] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(null)
    const itemsPerPage = 10

    const { token } = useUser();

    useEffect(() => {
        // Fetch all collections
        axios.get(nextConfig.env.API_URL + '/collections', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                const collectionList = response.data.map(collection => collection); // Extract collection names and put them in a list
                setCollections(collectionList);
                console.log("collectionList", collectionList)
            })
            .catch(error => {
                console.error('Error fetching collections:', error)
            })
    }, [token])

    console.log("collections", collections)

    useEffect(() => {
        if (selectedCollection) {
            console.log("selectedCollection", selectedCollection)
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

    useEffect(() => {
      if (successMessage) {
        const timer = setTimeout(() => {
          setSuccessMessage("");
        }, 12000); // Hide the alert after 12 seconds
  
        return () => clearTimeout(timer);
      }
    }, [successMessage]);

    const handleCollectionClick = (collection) => {
      setSelectedCollection(collection.name);
      setCurrentPage(1);
    };

    const handleExport = (coll, format = 'json') => {
        axios.get(nextConfig.env.API_URL + `/collections/${coll}/export`, {
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

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(nextConfig.env.API_URL + `/collections/${selectedCollection}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // if success then remove the document from the list
      if (res.status === 200) {
        setDocuments(prev => prev.filter(doc => doc._id !== id));
        setSuccessMessage("Document deleted successfully.");
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document.');
    }
  }

  const handleDropdownOptionClick = (option, collection) => {
    setDropdownOpen(null);
    if (option === 'changeDisplayName') {
      setSelectedChannel(collection.name);
      setDisplaynameDialogOpen(true);
    } else if (option === 'copyFullName') {
      navigator.clipboard.writeText(collection.name);
      alert(`Copied full name: ${collection.name}`);
    }
  };

  const handleChangeDisplayName = async (newDisplayName) => {
    try {
      const res = await axios.put(nextConfig.env.API_URL + `/collections/${selectedChannel}`, {
        displayName: newDisplayName
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.status === 200) {
        setSuccessMessage("Display name changed successfully.");
        setCollections(prev => prev.map(collection => collection.name === selectedChannel ? { ...collection, displayName: newDisplayName } : collection));
      }
    } catch (error) {
      console.error('Error changing display name:', error);
      alert('Failed to change display name.');
    }
  }
  
  const filteredCollections = collections.filter(collection =>
    collection.displayName.toLowerCase().includes(searchTerm.toLowerCase())
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

      {successMessage && (
        <Alert variant="success" className="my-4 bg-green-500 text-white flex justify-between items-center">
          <div>
            <AlertTitle className="font-bold text-white">Success</AlertTitle>
            <AlertDescription className="font-bold text-white">{successMessage}</AlertDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSuccessMessage("")} className="text-white">
            <X className="h-5 w-5" />
          </Button>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Collections</h2>
          <ul className="space-y-2">
            {filteredCollections.map(collection => (
              <li key={collection.name} className="relative">
                <div
                  className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer dark:bg-gray-700 dark:text-white ${selectedCollection === collection.name ? 'bg-blue-200 dark:bg-blue-500' : ''}`}
                  onClick={() => handleCollectionClick(collection)}
                >
                  <div className="flex flex-col">
                    <span>{collection.displayName}</span>
                    {collection.displayName !== collection.name && (
                      <span className="text-xs text-gray-500">{collection.name}</span>
                    )}
                  </div>
                  <DropdownMenu open={dropdownOpen === collection.name} onOpenChange={(isOpen) => setDropdownOpen(isOpen ? collection.name : null)}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownOptionClick('changeDisplayName', collection);
                      }}>
                        Change Display Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownOptionClick('copyFullName', collection);
                      }}>
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
                <Button onClick={() => handleExport(selectedCollection)}>
                  <SquareArrowOutUpRight className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="space-y-4">
                {filteredDocuments.map(doc => (
                  <div key={doc._id} className="bg-gray-200 p-4 rounded-lg dark:bg-gray-700 dark:text-white">
                    <div className="flex justify-between items-start mb-2">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(doc, null, 2)}
                      </pre>
                      <div className="flex space-x-2">
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(doc._id)}>
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
                  <span className='text-sm dark:text-white pl-2'>
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
      <Dialog open={displaynameDialogOpen} onOpenChange={setDisplaynameDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Change Display Name</DialogTitle>
            <DialogDescription>
              Enter a new display name for the collection "{selectedChannel}".
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleChangeDisplayName(e.target[0].value);
              setDisplaynameDialogOpen(false);
            }}
          >
            <Input
              type="text"
              placeholder="New display name"
              required
              className="mt-4"
            />
            <div className="flex justify-end mt-4">
              <Button type="submit" className="bg-blue-600 text-white">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}