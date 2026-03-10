import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Clock, CheckCircle2,
  Send, MoreHorizontal, Plus, Search, Loader2, Eye, ArrowRight, X, Download, PenTool,
  UserCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext"; 
import { useContent } from "@/contexts/ContentContext";
import { config } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFile, setStagedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const content = useContent();
  const t = content.dashboard || {};

  // 1. Fetch Remote Documents (Filtered by Owner ID / Email)
  const fetchDocuments = useCallback(async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      // Passing ownerEmail to match your updated Backend Controller
      const response = await fetch(`${API_BASE_URL}/documents?ownerEmail=${user.email}`, {
        credentials: 'include' 
      });
      
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Could not retrieve your document vault.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user?.email]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    } else if (isAuthenticated && user) {
      fetchDocuments();
    }
  }, [isAuthenticated, authLoading, navigate, fetchDocuments, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Download/View Logic
  const handleDownload = async (docId, fileName, openInTab = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/download/${docId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      if (openInTab) {
        window.open(url, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName || 'document.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not retrieve file data." });
    }
  };

  // 3. Delete Logic (Optimistic UI Update)
  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to permanently remove this document?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (response.ok) {
        toast({ title: "Deleted", description: "Document removed from cloud vault." });
        // Update state immediately without refetching
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      } else {
        throw new Error("Deletion failed");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the document.",
      });
    }
  };

  // 4. Commit to Backend (Upload)
  const handleCommitToBackend = async () => {
    if (!stagedFile || !user) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", stagedFile);
    formData.append("ownerEmail", user.email);
    formData.append("ownerName", user.username);

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const savedDoc = await response.json();
        toast({ title: "Success", description: "Document archived to your vault." });
        setStagedFile(null);
        setPreviewUrl(null);

        if (savedDoc && savedDoc.id) {
          navigate(`/sign/${savedDoc.id}`);
        }
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Connection error." });
    } finally {
      setIsUploading(false);
    }
  };

  // 5. Search Filtering
  const filteredDocuments = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusConfig = {
    PENDING: { label: "Pending", variant: "secondary" },
    SIGNED: { label: "Signed", variant: "default" },
    DRAFT: { label: "Draft", variant: "outline" },
  };

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: `url(${config.images.dashboardBg})`, backgroundSize: "cover", backgroundAttachment: "fixed" }}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        
        {/* PROFILE HEADER */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-3 bg-card/60 backdrop-blur-md border border-border/50 px-4 py-2 rounded-full shadow-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-none">Authenticated</p>
              <p className="text-sm font-bold text-primary">{user?.username || 'User'}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <UserCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>



        {/* STAGING AREA */}
        <AnimatePresence>
          {stagedFile && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-8 rounded-xl border-2 border-primary bg-primary/5 p-6 shadow-xl backdrop-blur-md">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white"><FileText className="h-6 w-6" /></div>
                  <div>
                    <h3 className="font-bold">{stagedFile.name}</h3>
                    <p className="text-xs text-muted-foreground">Ready for Vault • {(stagedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => window.open(previewUrl, '_blank')}><Eye className="mr-2 h-4 w-4" /> Preview</Button>
                  <Button onClick={handleCommitToBackend} disabled={isUploading}>{isUploading ? <Loader2 className="animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Archive & Next</>}</Button>
                  <Button variant="ghost" size="icon" onClick={() => { setStagedFile(null); setPreviewUrl(null); }}><X /></Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UPLOAD ZONE */}
        {!stagedFile && (
          <motion.div
            className={`mb-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all ${isDragging ? "border-primary bg-primary/10" : "border-border bg-card/40 backdrop-blur-sm hover:border-primary/50"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file?.type === "application/pdf") { setStagedFile(file); setPreviewUrl(URL.createObjectURL(file)); } }}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={(e) => { const file = e.target.files[0]; if (file) { setStagedFile(file); setPreviewUrl(URL.createObjectURL(file)); } }} />
            <div className="mb-4 rounded-full bg-primary/10 p-4"><Upload className={`h-8 w-8 ${isDragging ? "animate-bounce text-primary" : "text-muted-foreground"}`} /></div>
            <h2 className="text-xl font-semibold">Drop PDF to start signing</h2>
            <p className="text-muted-foreground text-sm mt-2">Maximum file size: 10MB</p>
          </motion.div>
        )}

        {/* ARCHIVE TABLE */}
        <div className="rounded-xl border bg-card/80 backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="border-b p-5 flex justify-between items-center bg-card/50">
            <h2 className="text-lg font-bold">Your Document Vault</h2>
            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 w-64 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search your archive..." 
                className="bg-transparent text-sm outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Document Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Upload Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="mx-auto animate-spin h-8 w-8 text-primary" /></td></tr>
                ) : filteredDocuments.length === 0 ? (
                  <tr><td colSpan="4" className="py-20 text-center text-muted-foreground">The vault is currently empty.</td></tr>
                ) : (
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="p-2 bg-muted rounded group-hover:bg-primary/20 transition-colors"><FileText className="h-5 w-5 text-primary" /></div>
                        <span className="font-medium">{doc.fileName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusConfig[doc.status]?.variant || "outline"}>
                          {statusConfig[doc.status]?.label || doc.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.id, doc.fileName, true)} title="View"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.id, doc.fileName)} title="Download"><Download className="h-4 w-4" /></Button>
                        
                        {/* Only show sign button if pending */}
                        {doc.status !== "SIGNED" && (
                          <Button variant="primary" size="sm" className="h-8 gap-1 shadow-md" onClick={() => navigate(`/sign/${doc.id}`)}>
                            <PenTool className="h-3.5 w-3.5" /> Sign
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10" 
                          onClick={() => handleDelete(doc.id)} 
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;