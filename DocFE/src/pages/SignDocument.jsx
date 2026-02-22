import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CheckCircle, ArrowLeft, Loader2, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SignDocument = () => {
  const { id } = useParams(); // Retrieves ID from the URL path
  const navigate = useNavigate();
  const { toast } = useToast();

  const [signerName, setSignerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [docUrl, setDocUrl] = useState(null);

  // 1. Fetch the file blob to preview the document
  useEffect(() => {
    const loadPreview = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/documents/download/${id}`);
        if (!response.ok) throw new Error("Could not load PDF");
        const blob = await response.blob();
        setDocUrl(URL.createObjectURL(blob));
      } catch (error) {
        toast({ variant: "destructive", title: "Load Error", description: "Failed to fetch document preview." });
      }
    };
    loadPreview();
  }, [id, toast]);

  // 2. Submit the signature to the Java backend
  const handleFinalSign = async () => {
    if (!signerName.trim()) {
      toast({ variant: "destructive", title: "Required", description: "Please enter your full name to sign." });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}/sign?signerName=${encodeURIComponent(signerName)}`, {
        method: "POST",
      });

      if (response.ok) {
        toast({ title: "Document Signed", description: "The vault has been updated successfully." });
        navigate("/dashboard"); // Return to list to see the "SIGNED" badge
      } else {
        throw new Error("Signing failed");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not process signature." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="mx-auto max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Vault
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PDF PREVIEW COLUMN */}
          <div className="lg:col-span-2 bg-card rounded-xl border shadow-lg overflow-hidden h-[700px]">
            {docUrl ? (
              <iframe src={`${docUrl}#toolbar=0`} className="w-full h-full" title="PDF Preview" />
            ) : (
              <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
            )}
          </div>

          {/* SIGNATURE ACTION COLUMN */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card p-6 rounded-xl border shadow-md">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <PenTool className="h-5 w-5 text-primary" /> Sign Document
              </h2>
              <p className="text-sm text-muted-foreground mb-6">By typing your name below, you are applying a legal digital signature to this document.</p>
              
              <div className="space-y-4">
                <label className="text-sm font-medium">Full Legal Name</label>
                <Input 
                  placeholder="Type your name here..." 
                  value={signerName} 
                  onChange={(e) => setSignerName(e.target.value)}
                  className="font-serif italic text-lg" // Stylized for signature feel
                />
                
                <Button className="w-full h-12 gap-2" onClick={handleFinalSign} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle className="h-5 w-5" /> Complete Signature</>}
                </Button>
              </div>
            </motion.div>

            <div className="p-4 bg-muted/50 rounded-lg border border-dashed text-xs text-muted-foreground">
              <p>ID: {id}</p>
              <p className="mt-1 italic">This action will be recorded in the SignVault audit trail.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignDocument;