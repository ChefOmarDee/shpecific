"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CompanyCard from "@/components/CompanyCard";

const generateExcel = (companies) => {
  const headers = ["Applied?", "Company Name"];
  const rows = companies.map((company) => ["", company.name || ""]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "companies_to_apply.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Home = () => {
  const router = useRouter();
  const [major, setMajor] = useState("");
  const [keyword, setKeyword] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const majorOptions = [
    "Accounting",
    "Aerospace Engineering",
    "Biomedical Engineering",
    "Business",
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Engineering",
    "Computer Science",
    "Data Science",
    "Economics",
    "Electrical Engineering",
    "Environmental Engineering",
    "Finance",
    "Industrial Engineering",
    "Logistics",
    "Marketing",
    "Materials Science & Engineering",
    "Mechanical Engineering",
    "Nuclear Engineering",
    "Systems Engineering",
  ];

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ major, keyword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setCompanies(data);
    } catch (error) {
      setError("Failed to fetch companies. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyClick = (companyId) => {
    router.push(`/company/${companyId}`);
  };

  const handleExport = () => {
    if (companies.length > 0) {
      generateExcel(companies);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 bg-gradient-to-b from-navy-800 to-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-orange-500">
          Find Companies
        </h1>

        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full p-4 border border-orange-500  rounded-lg bg-navy-800 text-white border-navy-600 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select a major</option>
                {majorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <input
              type="text"
              placeholder="Enter keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full p-4 border rounded-lg bg-navy-800 text-white border-orange-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors duration-200 ease-in-out"
              >
                {loading ? "Searching..." : "Search"}
              </button>

              {companies.length > 0 && (
                <button
                  onClick={handleExport}
                  className="px-8 py-4 border border-orange-500 bg-navy-800 text-white rounded-lg hover:bg-navy-600 transition-colors duration-200 ease-in-out"
                >
                  Export to Excel
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-300">Loading results...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <CompanyCard
                  key={company._id}
                  company={company}
                  onClick={() => handleCompanyClick(company._id)}
                />
              ))}
              {!hasSearched ? (
                <div className="text-gray-300 col-span-full text-center">
                  Enter search criteria and click Search to find companies
                </div>
              ) : companies.length === 0 ? (
                <div className="text-gray-300 col-span-full text-center">
                  No results found
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
