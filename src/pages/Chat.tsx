import { useState, useEffect, useRef } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Bot, MessageSquare, Send, Trash2, Loader2, Upload, File, X, FileText, Search } from "lucide-react";
import { chatAPI, isAuthenticated, fileAPI } from "@/lib/api";
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  file?: {
    name: string;
    type: string;
    size: number;
  };
  fileAnalysis?: {
    fileId: string;
    fileName: string;
  };
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  fileUrl?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'premium'>('free');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Function to format text by converting asterisks to bold for main points only
  const formatMessageText = (text: string) => {
    // Check if text is undefined, null, or empty
    if (!text || typeof text !== 'string') {
      return text || '';
    }
    
    // Split the text by asterisks and create bold elements
    const parts = text.split(/(\*[^*]+\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // Remove the asterisks and make it bold
        const boldText = part.slice(1, -1);
        
        // Only make certain types of text bold (main points, key info)
        const isMainPoint = (
          // Bold key characteristics, important info, numbers, dates
          /^(Version|Author|Creator|Software|Creation|Modification|Language|Pages|Dimensions|Content|Fonts|Elements|Profile|LinkedIn|Behance|PDF|Word|Microsoft|Arial|Calibri|Cambria|January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}:\d{2}|IST|en-IN|points|A4|letter|portrait|bitmap|color|indexed|compressed|hyperlinks|structured|accessibility|professional|resume|portfolio|single-page|standard|MediaBox|ProcSet|StructTreeRoot|Marked|true|false|PDF\/Text|ImageB|ImageC|ImageI|Arial-BoldMT|Calibri-Italic|Cambria|Calibri-Bold|ArialMT|https?:\/\/[^\s]+)/i.test(boldText) ||
          // Bold important phrases and key terms
          /^(key characteristics|summary|version|author|creator|software|creation date|modification date|language|pages|page dimensions|content type|fonts used|interactive elements|structure|accessibility|professional document|resume|portfolio|single-page|standard letter|A4 portrait|bitmap images|color images|indexed images|compressed content|hyperlinks|structured content|accessibility purposes|professional document|resume|portfolio piece|online profiles|Behance profile|LinkedIn profile|Indian Standard Time|English India|MediaBox size|ProcSet content|StructTreeRoot structure|Marked document|PDF version|Microsoft Word|Word LTSC|creation time|modification time|time zone|language specification|page count|page size|content stream|font embedding|font referencing|interactive links|structured content|accessibility features|document structure|professional content|career document|portfolio document|single page document|standard document size|A4 document size|portrait orientation|image content|text content|compressed stream|embedded fonts|referenced fonts|external links|profile links|social media|professional networking|design platform|career networking|document metadata|file properties|document information|creation details|modification details|language settings|page specifications|content specifications|font specifications|link specifications|structure specifications|accessibility specifications|document type|document purpose|document format|document size|document orientation|document content|document fonts|document links|document structure|document accessibility|document metadata|document properties|document information|document details|document settings|document specifications|document type|document purpose|document format|document size|document orientation|document content|document fonts|document links|document structure|document accessibility|document metadata|document properties|document information|document details|document settings|document specifications)/i.test(boldText)
        );
        
        if (isMainPoint) {
          return <strong key={index} className="font-bold text-judicial-gold">{boldText}</strong>;
        } else {
          // Return regular text without bold for non-main points
          return <span key={index}>{boldText}</span>;
        }
      }
      return part;
    });
  };

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth');
      return;
    }
    loadChatHistory();
  }, [navigate]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    };
    
    // Small delay to ensure DOM is updated
    setTimeout(scrollToBottom, 100);
  }, [messages, isLoading]);

  const loadChatHistory = async () => {
    try {
      const history = await chatAPI.getHistory();
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      ...(currentFileId && {
        fileAnalysis: {
          fileId: currentFileId,
          fileName: uploadedFiles.find(f => f.id === currentFileId)?.name || 'Uploaded File'
        }
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      
      if (currentFileId) {
        // Send file analysis request
        response = await fileAPI.analyzeFile(currentFileId, inputMessage.trim());
      } else {
        // Send regular chat message
        response = await chatAPI.sendMessage(inputMessage.trim());
      }
      
      // Handle different response structures for file analysis vs regular chat
      const content = currentFileId 
        ? (response.analysis || response.response || 'No analysis available')
        : (response.response || 'No response available');
      
      // Debug logging for file analysis
      if (currentFileId) {
        console.log('File analysis response:', response);
        console.log('Using content:', content);
      }
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: content,
        timestamp: new Date().toISOString(),
        ...(currentFileId && {
          fileAnalysis: {
            fileId: currentFileId,
            fileName: uploadedFiles.find(f => f.id === currentFileId)?.name || 'Uploaded File'
          }
        })
      };

      setMessages(prev => [...prev, assistantMessage]);
      setRemainingMessages(response.remainingMessages);
      setSubscriptionStatus(response.subscriptionStatus);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      try {
        await chatAPI.clearHistory();
        setMessages([]);
        setCurrentFileId(null);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF or image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const response = await fileAPI.uploadFile(selectedFile);
      
      const uploadedFile: UploadedFile = {
        id: response.file._id,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        fileUrl: response.file.fileUrl
      };
      
      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      // Add a message showing the uploaded file
      const uploadMessage: ChatMessage = {
        role: 'user',
        content: `Uploaded file: ${selectedFile.name}`,
        timestamp: new Date().toISOString(),
        file: {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size
        }
      };
      
      setMessages(prev => [...prev, uploadMessage]);
      setSelectedFile(null);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setRemainingMessages(response.remainingMessages);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectFileForAnalysis = (fileId: string) => {
    setCurrentFileId(fileId);
    const fileName = uploadedFiles.find(f => f.id === fileId)?.name || 'Uploaded File';
    
    // Add a message indicating file selection
    const fileSelectionMessage: ChatMessage = {
      role: 'user',
      content: `Selected file for analysis: ${fileName}`,
      timestamp: new Date().toISOString(),
      fileAnalysis: {
        fileId,
        fileName
      }
    };
    
    setMessages(prev => [...prev, fileSelectionMessage]);
  };

  const removeFileFromAnalysis = () => {
    setCurrentFileId(null);
    
    // Add a message indicating file removal
    const fileRemovalMessage: ChatMessage = {
      role: 'user',
      content: 'Removed file from analysis context',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, fileRemovalMessage]);
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (currentFileId === fileId) {
      setCurrentFileId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-judicial-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center p-2 sm:p-3 rounded-full bg-judicial-gold/10 mb-4 sm:mb-6">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-judicial-gold" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Chat with <span className="text-judicial-gold">Dastavez AI</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg mb-4 px-4 sm:px-0">
            Get instant answers to your legal questions. Our AI assistant is trained on extensive legal databases to provide accurate and helpful responses.
          </p>
          
          {/* Subscription Status */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <span className="text-gray-400">
              Status: <span className={`font-semibold ${subscriptionStatus === 'premium' ? 'text-judicial-gold' : 'text-gray-300'}`}>
                {subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
              </span>
            </span>
            {remainingMessages !== null && (
              <span className="text-gray-400">
                Messages remaining: <span className="font-semibold text-judicial-gold">{remainingMessages}</span>
              </span>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl lg:max-w-5xl mx-auto">
          <div className="bg-judicial-navy/30 rounded-xl border border-judicial-gold/10 overflow-hidden shadow-xl">
            {/* Chat Messages */}
            <div className="h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh] overflow-y-auto bg-transparent chat-messages-container">
              <div className="p-4 sm:p-6">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12 sm:py-16">
                    <Bot className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 sm:mb-6 text-judicial-gold/50" />
                    <p className="text-lg sm:text-xl mb-2 sm:mb-3 font-medium">Start a conversation with Dastavez AI</p>
                    <p className="text-gray-500 text-sm sm:text-base">Ask any legal question and get instant answers</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] rounded-2xl p-3 sm:p-4 md:p-5 shadow-lg ${
                            message.role === 'user'
                              ? 'bg-judicial-gold text-judicial-dark'
                              : 'bg-judicial-navy/60 text-white border border-judicial-gold/20'
                          }`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            {message.role === 'assistant' && (
                              <div className="flex-shrink-0">
                                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-judicial-gold" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                                {formatMessageText(message.content || '')}
                              </p>
                              {message.file && (
                                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-judicial-gold/10 rounded-lg border border-judicial-gold/20">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <File className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm text-judicial-gold font-medium truncate">
                                        {message.file.name}
                                      </p>
                                      <p className="text-xs text-judicial-gold/70">
                                        {formatFileSize(message.file.size)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {message.fileAnalysis && (
                                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm text-blue-500 font-medium truncate">
                                        Analyzing: {message.fileAnalysis.fileName}
                                      </p>
                                      <p className="text-xs text-blue-500/70">
                                        File ID: {message.fileAnalysis.fileId}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <p className={`text-xs mt-3 sm:mt-4 ${
                                message.role === 'user' ? 'text-judicial-dark/60' : 'text-gray-400'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-judicial-navy/60 text-white border border-judicial-gold/20 rounded-2xl p-3 sm:p-4 md:p-5 max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] shadow-lg">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-judicial-gold flex-shrink-0" />
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-judicial-gold" />
                          <span className="text-sm font-medium">
                            {currentFileId ? 'Analyzing file...' : 'AI is thinking...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} className="h-4 sm:h-6" />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-judicial-gold/10 p-4 sm:p-6 bg-judicial-navy/20">
              {/* File Upload Section */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 sm:px-5 py-2 sm:py-3 bg-judicial-navy/50 border border-judicial-gold/20 text-judicial-gold rounded-lg hover:bg-judicial-navy/70 transition-all duration-200 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium"
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Upload Document</span>
                    <span className="sm:hidden">Upload</span>
                  </button>
                  
                  {selectedFile && (
                    <div className="flex items-center gap-2 sm:gap-3 bg-judicial-gold/10 border border-judicial-gold/20 rounded-lg px-3 sm:px-4 py-2 sm:py-3 max-w-xs">
                      <File className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-judicial-gold font-medium truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-judicial-gold/70">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="text-judicial-gold hover:text-red-400 flex-shrink-0 transition-colors p-1"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  )}
                  
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="px-3 sm:px-5 py-2 sm:py-3 bg-judicial-gold text-judicial-dark rounded-lg font-semibold hover:bg-judicial-lightGold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 sm:gap-3 text-xs sm:text-sm"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-gray-400 mt-2 sm:mt-3">
                  Supported formats: PDF, JPEG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>

              {/* Current File Analysis Status */}
              {currentFileId && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-500 font-medium">
                        Analyzing: {uploadedFiles.find(f => f.id === currentFileId)?.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFileFromAnalysis}
                      className="text-blue-500 hover:text-red-400 transition-colors p-1"
                      title="Remove file from analysis"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={currentFileId ? "Ask a question about the uploaded file..." : "Ask your legal question..."}
                  className="flex-1 p-3 sm:p-4 rounded-lg bg-judicial-navy/50 border border-judicial-gold/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-judicial-gold focus:border-transparent text-sm sm:text-base transition-all duration-200"
                  disabled={isLoading}
                />
                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 sm:px-6 py-3 sm:py-4 bg-judicial-gold text-judicial-dark rounded-lg font-semibold hover:bg-judicial-lightGold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearChat}
                      className="px-4 sm:px-6 py-3 sm:py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                      title="Clear chat history"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Uploaded Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="p-3 sm:p-4 bg-judicial-navy/30 border border-judicial-gold/20 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <File className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => selectFileForAnalysis(file.id)}
                      disabled={currentFileId === file.id}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {currentFileId === file.id ? 'Analyzing' : 'Analyze'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(file.id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-4 sm:p-6 rounded-xl bg-judicial-navy/30 border border-judicial-gold/10">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="p-2 rounded-lg bg-judicial-gold/10 mr-3 sm:mr-4">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">24/7 Availability</h3>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Get instant answers to your legal questions anytime, anywhere. No waiting for office hours.
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-xl bg-judicial-navy/30 border border-judicial-gold/10">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="p-2 rounded-lg bg-judicial-gold/10 mr-3 sm:mr-4">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">Natural Conversation</h3>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Chat naturally with our AI assistant. Ask questions in plain language and get clear, concise answers.
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-xl bg-judicial-navy/30 border border-judicial-gold/10 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="p-2 rounded-lg bg-judicial-gold/10 mr-3 sm:mr-4">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">Legal Expertise</h3>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Access a wealth of legal knowledge. Our AI is trained on extensive legal databases and case law.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chat; 