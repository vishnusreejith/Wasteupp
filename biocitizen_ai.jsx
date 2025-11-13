import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Functions ---

/**
 * A simple utility to create a data URL for downloading files.
 * @param {string} data The string content to download
 * @param {string} type The MIME type (e.g., 'text/plain', 'application/json')
 * @returns {string} A blob URL
 */
const createDownloadUrl = (data, type) => {
  const blob = new Blob([data], { type });
  return URL.createObjectURL(blob);
};

/**
 * Converts an image file to a Base64 string.
 * @param {File} file The image file
 * @returns {Promise<{data: string, mimeType: string, previewUrl: string}>}
 */
const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64Data = dataUrl.split(',')[1];
      resolve({
        data: base64Data,
        mimeType: file.type,
        previewUrl: dataUrl,
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- SVG Icons ---

const IconLoader = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className="animate-spin"
  >
    <path
      d="M12 2.99988V5.99988M12 18.0001V21.0001M21 12.0001H18M6 12.0001H3M18.364 5.63613L16.2427 7.75745M7.75739 16.2427L5.63607 18.364M18.364 18.364L16.2427 16.2427M7.75739 7.75745L5.63607 5.63613"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconChat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const IconImage = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const IconInfo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const IconSend = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const IconDownload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Core Components ---

/**
 * About Tab Component
 */
const AboutTab = () => (
  <div className="p-6 bg-white rounded-lg shadow-inner">
    <h2 className="text-2xl font-bold text-green-800 mb-4">Welcome to BioCitizen AI!</h2>
    <p className="text-gray-700 mb-4">
      This application is a tool for citizen scientists, students, and nature enthusiasts
      to help in biodiversity assessment. Our goal is to make data collection and
      analysis simple, accessible, and powerful.
    </p>
    <div className="space-y-3 text-gray-700">
      <p>
        <strong className="text-green-700">How it works:</strong>
      </p>
      <ul className="list-disc list-inside space-y-2 pl-4">
        <li>
          <strong>Chat Analyst:</strong> Use our AI-powered chatbot to identify species
          from images, ask questions about ecology, or get help analyzing your data.
        </li>
        <li>
          <strong>Data Analyzer:</strong> Upload your field observations as a CSV file,
          or **upload an image of your handwritten notes!** The AI will read your
          data, display it, and calculate key biodiversity indices.
        </li>
        <li>
          <strong>Download Your Results:</strong> You can download a log of your chat
          with the AI or your parsed data table (as JSON) at any time.
        </li>
      </ul>
      <p className="pt-4 font-semibold text-green-800">
        Together, we can contribute valuable data to understand and protect our planet's biodiversity.
      </p>
    </div>
  </div>
);

/**
 * Data Uploader Tab Component
 */
const DataUploaderTab = ({ setChatPreload, setActiveTab }) => {
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // State for index calculations
  const [speciesColumn, setSpeciesColumn] = useState("");
  const [abundanceColumn, setAbundanceColumn] = useState(""); // Optional
  const [indices, setIndices] = useState(null);
  const [calculationError, setCalculationError] = useState("");

  const resetData = () => {
    setParsedData([]);
    setHeaders([]);
    setFileName("");
    setError("");
    setDownloadUrl(null);
    setSpeciesColumn("");
    setAbundanceColumn("");
    setIndices(null);
    setCalculationError("");
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    resetData();

    if (file && file.type === "text/csv") {
      setFileName(file.name);
      // Use PapaParse (assumed to be on window.Papa)
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setParsedData(results.data);
            setHeaders(Object.keys(results.data[0]));
            // Create download link for this data
            const jsonString = JSON.stringify(results.data, null, 2);
            setDownloadUrl(createDownloadUrl(jsonString, "application/json"));
          } else {
            setError("CSV file is empty or could not be parsed.");
          }
        },
        error: (err) => {
          setError(`Error parsing CSV: ${err.message}`);
        },
      });
    } else if (file) {
      setError("Please upload a valid .csv file.");
    }
    // Reset file input to allow re-uploading the same file
    event.target.value = null;
  };

  const handleImageTableUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file (jpg, png, etc.).");
      return;
    }
    
    resetData();
    setIsOcrLoading(true);
    setFileName(file.name);

    try {
      const { data: base64Image, mimeType } = await imageToBase64(file);
      
      const apiKey = ""; // Leave as-is
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const systemPrompt = "You are a data extraction tool. You will be given an image of a table (handwritten or typed) containing biodiversity data. Your task is to extract this data and return **ONLY** a valid JSON array of objects. The keys in the objects should be the column headers. Be as accurate as possible. Do not include markdown formatting (like ```json) or any other explanatory text. Just return the valid JSON array.";
      
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: "Extract the table data from this image and return it as a JSON array of objects." },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      const responseText = candidate?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error("Invalid response structure from AI.");
      }

      // Try to parse the JSON response
      let parsedJson;
      try {
        // Clean up potential markdown formatting just in case
        const cleanResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedJson = JSON.parse(cleanResponse);
      } catch (e) {
        console.error("Failed to parse JSON from AI response:", responseText);
        throw new Error("The AI failed to return valid JSON. The table might be unclear.");
      }
      
      if (Array.isArray(parsedJson) && parsedJson.length > 0) {
        setParsedData(parsedJson);
        setHeaders(Object.keys(parsedJson[0]));
        const jsonString = JSON.stringify(parsedJson, null, 2);
        setDownloadUrl(createDownloadUrl(jsonString, "application/json"));
      } else {
        throw new Error("AI returned empty or invalid data. Please ensure the image is clear.");
      }

    } catch (err) {
      setError(`Error during image analysis: ${err.message}`);
    } finally {
      setIsOcrLoading(false);
      // Reset file input
      event.target.value = null;
    }
  };


  const handleCalculateIndices = () => {
    if (!speciesColumn) {
      setCalculationError("Please select a column containing species names.");
      return;
    }

    setCalculationError("");
    
    // Create a map to store species counts
    const speciesCounts = new Map();
    let totalIndividuals = 0;
    
    // Determine if we are using presence-only or abundance data
    const useAbundance = abundanceColumn && headers.includes(abundanceColumn);

    for (const row of parsedData) {
      const species = row[speciesColumn];
      if (!species) continue; // Skip rows without a species name

      let count = 1; // Default for presence-only
      if (useAbundance) {
        // AI might return numbers as strings, so parseFloat/parseInt is robust
        const parsedCount = parseFloat(String(row[abundanceColumn]).replace(/,/g, '')); // Remove commas
        if (!isNaN(parsedCount) && parsedCount > 0) {
          count = parsedCount;
        } else {
          count = 1; // Treat invalid abundance as 1
        }
      }

      speciesCounts.set(species, (speciesCounts.get(species) || 0) + count);
      totalIndividuals += count;
    }

    if (speciesCounts.size === 0) {
      setCalculationError("No valid species data found in the selected column.");
      return;
    }

    const S = speciesCounts.size; // Species Richness
    let H_shannon = 0;
    let D_simpson = 0;

    for (const count of speciesCounts.values()) {
      const pi = count / totalIndividuals; // Proportion of species i
      if (pi > 0) {
        H_shannon -= pi * Math.log(pi); // Shannon
      }
      D_simpson += pi * pi; // Simpson
    }
    
    // Simpson's Index of Diversity (1 - D)
    const D_simpson_diversity = 1 - D_simpson;

    setIndices({
      richness: S,
      totalIndividuals: totalIndividuals,
      shannon: H_shannon.toFixed(4),
      simpson: D_simpson_diversity.toFixed(4),
    });
  };

  const handleSendToAnalyst = () => {
    if (!indices) return;

    let summary = `Hello! I just analyzed my dataset (${fileName}) and calculated these biodiversity indices. Can you help me interpret them?\n\n`;
    summary += `--- Calculated Indices ---\n`;
    summary += `Species Richness (S): ${indices.richness}\n`;
    summary += `Total Individuals (N): ${indices.totalIndividuals}\n`;
    summary += `Shannon Index (H'): ${indices.shannon}\n`;
    summary += `Simpson's Index (1-D): ${indices.simpson}\n\n`;
    summary += `--- Data Context ---\n`;
    summary += `Species Column: '${speciesColumn}'\n`;
    summary += `Abundance Column: ${abundanceColumn ? `'${abundanceColumn}'` : 'None (used row count)'}\n`;
    summary += `Total Rows Analyzed: ${parsedData.length}\n`;

    setChatPreload(summary);
    setActiveTab('chat');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-inner space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Data Uploader & Analyzer</h2>
      
      {/* Upload Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <label
            htmlFor="csv-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors w-full justify-center"
          >
            <IconUpload />
            <span className="ml-2">Upload .csv File</span>
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvUpload}
          />
          <p className="text-xs text-gray-500 mt-2">For spreadsheet data.</p>
        </div>
        
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <label
            htmlFor="image-table-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors w-full justify-center"
          >
            <IconImage />
            <span className="ml-2">Upload Image of Table</span>
          </label>
          <input
            id="image-table-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageTableUpload}
          />
          <p className="text-xs text-gray-500 mt-2">For handwritten or printed notes.</p>
        </div>
      </div>

      {/* Loading and Error Display */}
      {isOcrLoading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <IconLoader />
          <span className="ml-3 text-blue-700 font-medium">AI is reading your data table...</span>
        </div>
      )}
      {fileName && !isOcrLoading && (
        <p className="text-sm text-gray-600 text-center">File: {fileName}</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}


      {parsedData.length > 0 && (
        <>
          {/* Column Selection & Calculation */}
          <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4 border border-gray-200">
            <h3 className="text-xl font-semibold text-green-700">Calculate Biodiversity Indices</h3>
            <p className="text-sm text-gray-600">
              Select the columns from your data that represent species names and (optionally) their abundance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="species-col" className="block text-sm font-medium text-gray-700 mb-1">
                  Species Column <span className="text-red-600">*</span>
                </label>
                <select
                  id="species-col"
                  value={speciesColumn}
                  onChange={(e) => setSpeciesColumn(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select species column</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="abundance-col" className="block text-sm font-medium text-gray-700 mb-1">
                  Abundance/Count Column (Optional)
                </label>
                <select
                  id="abundance-col"
                  value={abundanceColumn}
                  onChange={(e) => setAbundanceColumn(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">None (use row count)</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
              <div className="md:self-end">
                <button
                  onClick={handleCalculateIndices}
                  disabled={!speciesColumn}
                  className="w-full p-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  Calculate
                </button>
              </div>
            </div>
            {calculationError && <p className="mt-2 text-sm text-red-600">{calculationError}</p>}
          </div>

          {/* Indices Display */}
          {indices && (
            <div className="p-4 bg-green-50 rounded-lg shadow space-y-4 border border-green-200">
              <h3 className="text-xl font-semibold text-green-800">Calculated Indices</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg shadow border">
                  <p className="text-sm font-medium text-gray-500">Species Richness (S)</p>
                  <p className="text-2xl font-bold text-green-700">{indices.richness}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow border">
                  <p className="text-sm font-medium text-gray-500">Total Individuals (N)</p>
                  <p className="text-2xl font-bold text-green-700">{indices.totalIndividuals}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow border">
                  <p className="text-sm font-medium text-gray-500">Shannon Index (H')</p>
                  <p className="text-2xl font-bold text-green-700">{indices.shannon}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow border">
                  <p className="text-sm font-medium text-gray-500">Simpson's Index (1-D)</p>
                  <p className="text-2xl font-bold text-green-700">{indices.simpson}</p>
                </div>
              </div>
              <div className="text-center pt-2">
                <button
                  onClick={handleSendToAnalyst}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                  <IconChat />
                  <span className="ml-2">Discuss Results with AI Analyst</span>
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-700">Extracted Data</h3>
              <a
                href={downloadUrl}
                download={`${fileName.split('.')[0]}_data.json`}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition-colors"
              >
                <IconDownload />
                <span className="ml-1.5">Download Data (JSON)</span>
              </a>
            </div>
            <div className="max-h-[500px] overflow-auto border border-gray-200 rounded-lg shadow">
              <table className="w-full min-w-max text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-800 uppercase bg-gray-100 sticky top-0">
                  <tr>
                    {headers.map((header) => (
                      <th key={header} scope="col" className="px-6 py-3">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {headers.map((header) => (
                        <td key={`${index}-${header}`} className="px-6 py-4">
                          {String(row[header])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Chat Analyst Tab Component
 */
const ChatAnalystTab = ({ preloadPrompt, setPreloadPrompt }) => {
  const [chatHistory, setChatHistory] = useState([
    {
      role: "model",
      text: "Hello! I'm BioBot. Ask me a question about biodiversity, upload an image for identification, or discuss your calculated indices!",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null); // { data, mimeType, previewUrl }
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = React.useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Watch for the preloadPrompt
  useEffect(() => {
    if (preloadPrompt) {
      setUserInput(preloadPrompt);
      setPreloadPrompt(""); // Clear the preload state after loading it
    }
  }, [preloadPrompt, setPreloadPrompt]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const imageB64 = await imageToBase64(file);
        setUploadedImage(imageB64);
      } catch (error) {
        console.error("Error converting image:", error);
        // Display error to user in chat
        setChatHistory(prev => [...prev, { role: 'model', text: 'Sorry, I had trouble reading that image. Please try again.' }]);
      }
    }
    // Reset file input
    event.target.value = null;
  };

  const callGeminiAPI = async (prompt, base64Image, mimeType) => {
    setIsLoading(true);
    
    const apiKey = ""; // Leave as-is
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const systemPrompt = "You are a friendly and helpful biodiversity expert assisting a citizen scientist. Your goal is to identify species (from images), analyze simple datasets (when text is provided), and answer questions about ecology. When a user provides biodiversity indices (Richness, Shannon, Simpson), help them interpret what these numbers mean in a simple, understandable way. For example, explain what high or low diversity means. Be encouraging and clear.";

    // Construct the payload
    let contentParts = [{ text: prompt }];
    if (base64Image && mimeType) {
      // This tab is for "what is this?" images, not table OCR
      contentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      });
    }

    const payload = {
      contents: [{ parts: contentParts }],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (candidate && candidate.content?.parts?.[0]?.text) {
        const modelResponse = candidate.content.parts[0].text;
        setChatHistory(prev => [...prev, { role: "model", text: modelResponse }]);
      } else {
        throw new Error("Invalid response structure from API.");
      }

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setChatHistory(prev => [...prev, { role: "model", text: `Sorry, I encountered an error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prompt = userInput.trim();
    if (!prompt && !uploadedImage) return;

    // Add user's message to chat
    setChatHistory(prev => [
      ...prev,
      {
        role: "user",
        text: prompt,
        imagePreview: uploadedImage?.previewUrl,
      },
    ]);

    // Call API
    callGeminiAPI(prompt, uploadedImage?.data, uploadedImage?.mimeType);

    // Reset inputs
    setUserInput("");
    setUploadedImage(null);
  };

  const handleDownloadChat = () => {
    const chatLog = chatHistory
      .map(msg => `[${msg.role === 'user' ? 'User' : 'BioBot'}]\n${msg.text}\n${msg.imagePreview ? '(Image Attached)\n' : ''}`)
      .join('\n---------------------------------\n');
      
    const url = createDownloadUrl(chatLog, 'text/plain');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biocitizen_ai_chat_log.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-lg shadow-inner">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-green-800">Chat Analyst</h2>
        <button
          onClick={handleDownloadChat}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <IconDownload />
          <span className="ml-1.5">Download Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md ${
                message.role === "user"
                  ? "bg-blue-100 text-blue-900"
                  : "bg-white text-gray-800"
              }`}
            >
              {message.imagePreview && (
                <img
                  src={message.imagePreview}
                  alt="User upload"
                  className="rounded-lg mb-2 max-h-48"
                />
              )}
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs p-3 rounded-lg shadow-md bg-white text-gray-800">
              <div className="flex items-center space-x-2">
                <IconLoader />
                <span>BioBot is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
        {uploadedImage && (
          <div className="relative inline-block p-1 mb-2 border border-gray-300 rounded-lg">
            <img
              src={uploadedImage.previewUrl}
              alt="Preview"
              className="h-20 w-20 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => setUploadedImage(null)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 shadow hover:bg-red-700"
            >
              <IconX />
            </button>
          </div>
        )}
        <div className="flex items-start space-x-2">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message or upload an image for identification..."
            rows="2"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <label
            htmlFor="image-upload-chat"
            className="p-3 h-full cursor-pointer text-gray-600 hover:text-green-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <IconImage />
            <input
              id="image-upload-chat"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
          <button
            type="submit"
            disabled={isLoading || (!userInput && !uploadedImage)}
            className="p-3 h-full bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <IconLoader /> : <IconSend />}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Main App Component
 */
export default function App() {
  const { useState, useEffect } = React;
  const [activeTab, setActiveTab] = useState("chat"); // 'chat', 'data', 'about'
  const [chatPreload, setChatPreload] = useState(""); // State for preloading chat

  const renderTabContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatAnalystTab preloadPrompt={chatPreload} setPreloadPrompt={setChatPreload} />;
      case "data":
        // Pass setters to DataUploaderTab
        return <DataUploaderTab setChatPreload={setChatPreload} setActiveTab={setActiveTab} />;
      case "about":
        return <AboutTab />;
      default:
        return <ChatAnalystTab preloadPrompt={chatPreload} setPreloadPrompt={setChatPreload} />;
    }
  };

  const NavButton = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 md:flex-none md:px-6 py-3 flex items-center justify-center space-x-2 rounded-t-lg transition-all ${
        activeTab === tabName
          ? "bg-white text-green-700 font-semibold shadow-inner-top"
          : "bg-green-700 text-white hover:bg-green-600"
      }`}
      style={activeTab === tabName ? {boxShadow: '0 -5px 10px -5px rgba(0, 0, 0, 0.1)'} : {}}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
  
  // A simple check for PapaParse
  useEffect(() => {
    if (typeof window.Papa === 'undefined') {
      console.warn("PapaParse library (papaparse.min.js) is not loaded. CSV uploading will not work.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-green-50 font-inter text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800">
            BioCitizen AI
          </h1>
          <p className="text-lg md:text-xl text-green-600 mt-2">
            Your AI-Powered Biodiversity Assessment Tool
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex flex-col md:flex-row md:space-x-1">
          <NavButton tabName="chat" label="Chat Analyst" icon={<IconChat />} />
          <NavButton tabName="data" label="Data Analyzer" icon={<IconUpload />} />
          <NavButton tabName="about" label="About" icon={<IconInfo />} />
          <div className="hidden md:block flex-grow border-b-2 border-green-700"></div>
        </nav>

        {/* Tab Content */}
        <main className="bg-white rounded-b-lg shadow-xl">
          {renderTabContent()}
        </main>
        
        <footer className="text-center text-sm text-gray-500 mt-8">
          <p>Powered by AI. Built for Citizen Science.</p>
        </footer>
      </div>
    </div>
  );
}
