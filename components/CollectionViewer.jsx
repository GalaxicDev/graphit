"use client";

import React, { useState } from "react";
import { Search, Database, Download, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function CollectionViewer({ collections, selectedCollection, initialDocuments, totalDocuments }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState(initialDocuments);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalDocuments / itemsPerPage);

  const handleCollectionClick = (collection) => {
    router.push(`?collection=${collection}`);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleExport = () => {
    alert(`Exporting ${selectedCollection} data...`);
  };

  const handleDelete = (id) => {
    console.log("Deleting document:", id);
  };

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );  

  const filteredDocuments = selectedCollection
    ? documents.filter((doc) =>
        JSON.stringify(doc).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Collection Viewer</h1>
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search collections or documents..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-2">Collections</h2>
          <ul className="space-y-2">
            {filteredCollections.map((collection) => (
              <li key={collection.name}>
                <Button
                  variant={selectedCollection === collection.name ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleCollectionClick(collection.name)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {collection.name}
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
                {filteredDocuments.map((doc) => (
                  <div key={doc._id} className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(doc, null, 2)}
                      </pre>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
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
                <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
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
                    className="w-12 rounded text-center border-none focus:outline-none"
                  />
                  <span> of {totalPages} </span>
                </div>
                <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
