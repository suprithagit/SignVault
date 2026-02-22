import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CheckCircle, ArrowLeft, Loader2, PenTool, Trash2, Save, Upload, Type, Edit3 } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SignDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States
  const [signerName, setSignerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [docUrl, setDocUrl] = useState(null);
  const [signatureType, setSignatureType] = useState("draw");
  const [uploadedImage, setUploadedImage] = useState(null);
  
  // Refs
  const sigCanvas = useRef(null);

  // 1. Load Preview
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

  // 2. Clear Logic
  const handleClear = () => {
    if (signatureType === "draw") {
      sigCanvas.current.clear();
    } else if (signatureType === "upload") {
      setUploadedImage(null);
    } else {
      setSignerName("");
    }
    toast({ description: "Signature cleared." });
  };

  // 3. Image Upload Logic
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 4. Final Save/Sign Logic
  const handleSaveSignature = async () => {
    let signatureData = "";

    if (signatureType === "draw") {
      if (sigCanvas.current.isEmpty()) {
        return toast({ variant: "destructive", title: "Empty Signature", description: "Please draw your signature first." });
      }
      signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    } else if (signatureType === "upload") {
      if (!uploadedImage) {
        return toast({ variant: "destructive", title: "Missing Image", description: "Please upload a signature image." });
      }
      signatureData = uploadedImage;
    } else if (signatureType === "type") {
      if (!signerName.trim()) {
        return toast({ variant: "destructive", title: "Missing Name", description: "Please type your name." });
      }
      // Note: For "Type", you usually convert text to image on backend or use a signature font
      signatureData = `TEXT_SIG:${signerName}`; 
    }

    setIsProcessing(true);
    try {
      // Sending the signature as a POST body (Base64)
      const response = await fetch(`${API_BASE_URL}/documents/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureData: signatureData,
          signerName: signerName,
          type: signatureType
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Document signed and saved to vault." });
        navigate("/dashboard");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save signature." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="mx-auto max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Vault
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PDF PREVIEW */}
          <div className="lg:col-span-2 bg-card rounded-xl border shadow-lg overflow-hidden h-[750px]">
            {docUrl ? (
              <iframe src={`${docUrl}#toolbar=0`} className="w-full h-full" title="PDF Preview" />
            ) : (
              <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
            )}
          </div>

          {/* SIGNATURE PANEL */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 rounded-xl border shadow-md">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Edit3 className="h-5 w-5 text-primary" /> Create Signature
              </h2>

              <Tabs defaultValue="draw" className="w-full" onValueChange={setSignatureType}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="draw" className="gap-1"><PenTool className="h-3 w-3" /> Draw</TabsTrigger>
                  <TabsTrigger value="type" className="gap-1"><Type className="h-3 w-3" /> Type</TabsTrigger>
                  <TabsTrigger value="upload" className="gap-1"><Upload className="h-3 w-3" /> Upload</TabsTrigger>
                </TabsList>

                {/* DRAWING BOARD */}
                <TabsContent value="draw" className="border rounded-lg bg-white overflow-hidden">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ className: "w-full h-48 cursor-crosshair" }}
                  />
                </TabsContent>

                {/* TYPE TO SIGN */}
                <TabsContent value="type" className="space-y-4">
                  <div className="p-8 border rounded-lg bg-slate-50 flex items-center justify-center">
                    <Input
                      placeholder="Enter full name"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="text-2xl text-center italic font-serif border-none bg-transparent focus-visible:ring-0 shadow-none"
                    />
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground italic">Standard digital font signature applied</p>
                </TabsContent>

                {/* UPLOAD IMAGE */}
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Uploaded signature" className="max-h-32 object-contain" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <label className="cursor-pointer text-sm text-primary hover:underline">
                          Click to upload PNG/JPG
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button variant="outline" onClick={handleClear} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Clear
                </Button>
                <Button onClick={handleSaveSignature} disabled={isProcessing} className="gap-2">
                  {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                  Save Sign
                </Button>
              </div>
            </motion.div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-[11px] text-muted-foreground">
              <p className="font-semibold text-primary mb-1">LEGAL DISCLOSURE</p>
              <p>By saving this signature, you agree that this electronic representation is as legally binding as a handwritten signature. SignVault records your IP address and timestamp for audit purposes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignDocument;