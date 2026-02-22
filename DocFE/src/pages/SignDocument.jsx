import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, PenTool, Trash2, Save, Upload, Type, Move, RotateCcw, X, CheckCircle2 } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { Rnd } from "react-rnd"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SIGNATURE_STYLES = [
  { name: "Classic Script", class: "font-serif italic" },
  { name: "Formal", class: "font-sans uppercase tracking-widest" },
  { name: "Modern Hand", class: "font-mono font-bold" },
];

const SignDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [signerName, setSignerName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(SIGNATURE_STYLES[0].class);
  const [signatureType, setSignatureType] = useState("draw");
  const [isProcessing, setIsProcessing] = useState(false);
  const [docUrl, setDocUrl] = useState(null);
  
  // States for the signature object
  const [isPlaced, setIsPlaced] = useState(false);
  const [finalSignatureImg, setFinalSignatureImg] = useState(null);
  const [sigPosition, setSigPosition] = useState({ x: 150, y: 150 });
  const [sigSize, setSigSize] = useState({ width: 220, height: 100 });

  const sigCanvas = useRef(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/documents/download/${id}`);
        if (!response.ok) throw new Error("Could not load PDF");
        const blob = await response.blob();
        setDocUrl(URL.createObjectURL(blob));
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load document." });
      }
    };
    loadPreview();
  }, [id, toast]);

  // Handle placing the signature box on PDF
  const handlePlaceSignBox = () => {
    setIsPlaced(true);
    if (signatureType === "type") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 400; canvas.height = 150;
      const fontFamily = selectedStyle.includes('serif') ? 'serif' : selectedStyle.includes('mono') ? 'monospace' : 'sans-serif';
      ctx.font = `italic 40px ${fontFamily}`;
      ctx.fillText(signerName, 20, 80);
      setFinalSignatureImg(canvas.toDataURL("image/png"));
    }
    toast({ title: "Box Placed", description: "Drag the box to where you want to sign." });
  };

  // Capture the drawing once the user finishes
  const handleConfirmDrawing = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const data = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      setFinalSignatureImg(data);
      toast({ title: "Signature Captured" });
    }
  };

  const onImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFinalSignatureImg(reader.result);
        setIsPlaced(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFinalDoc = async () => {
    if (!finalSignatureImg) return toast({ variant: "destructive", title: "Wait!", description: "Please sign inside the box first." });
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}/final-sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureImage: finalSignatureImg,
          x: Math.round(sigPosition.x),
          y: Math.round(sigPosition.y),
          width: Math.round(sigSize.width),
          height: Math.round(sigSize.height),
          signerName: signerName || "Digital Signature"
        }),
      });
      if (response.ok) {
        toast({ title: "Document Signed Successfully" });
        navigate("/dashboard");
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Network Error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="mx-auto max-w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card p-5 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><PenTool size={18}/> 1. Choose Method</h2>
            
            <Tabs defaultValue="draw" onValueChange={(val) => { setSignatureType(val); setIsPlaced(false); setFinalSignatureImg(null); }}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="draw">Draw</TabsTrigger>
                <TabsTrigger value="type">Type</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="draw" className="text-sm text-muted-foreground py-4">
                Click "Place Box" and draw your signature directly on the document.
              </TabsContent>

              <TabsContent value="type" className="space-y-4">
                <Input placeholder="Type Name" value={signerName} onChange={(e) => setSignerName(e.target.value)} className={`h-12 ${selectedStyle}`} />
                <div className="flex gap-1">
                  {SIGNATURE_STYLES.map((s) => (
                    <button key={s.name} onClick={() => setSelectedStyle(s.class)} className={`flex-1 p-1 text-[10px] border rounded ${selectedStyle === s.class ? 'border-primary' : ''}`}>{s.name}</button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="upload" className="p-4 border-2 border-dashed rounded-xl text-center">
                <input type="file" id="sig-upload" hidden accept="image/*" onChange={onImageUpload} />
                <label htmlFor="sig-upload" className="cursor-pointer text-primary text-sm flex flex-col items-center gap-2">
                  <Upload size={20} /> Choose File
                </label>
              </TabsContent>
            </Tabs>

            <Button className="w-full mt-6 gap-2" onClick={handlePlaceSignBox} disabled={isPlaced}>
              <Move size={16} /> Place Sign Box
            </Button>
          </div>

          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            <RotateCcw size={16} className="mr-2"/> Reset All
          </Button>
        </div>

        {/* CENTER PANEL (PDF) */}
        <div className="lg:col-span-7 relative bg-slate-200 rounded-2xl border h-[80vh] overflow-hidden">
          <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-400 h-full">
            {docUrl && (
              <div className="relative bg-white shadow-2xl" style={{ width: '595px', height: '842px' }}>
                <iframe src={`${docUrl}#toolbar=0`} className="w-full h-full pointer-events-none" title="PDF" />
                
                {isPlaced && (
                  <Rnd
                    size={{ width: sigSize.width, height: sigSize.height }}
                    position={{ x: sigPosition.x, y: sigPosition.y }}
                    onDragStop={(e, d) => setSigPosition({ x: d.x, y: d.y })}
                    onResizeStop={(e, dir, ref, delta, pos) => {
                      setSigSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                      setSigPosition(pos);
                    }}
                    bounds="parent"
                    className="z-50 border-2 border-primary bg-white shadow-lg flex items-center justify-center group"
                  >
                    {/* IF TYPE/UPLOAD, SHOW IMAGE. IF DRAW, SHOW CANVAS */}
                    {signatureType === "draw" && !finalSignatureImg ? (
                      <div className="relative w-full h-full">
                        <SignatureCanvas 
                          ref={sigCanvas} 
                          penColor="black" 
                          canvasProps={{ className: "w-full h-full cursor-crosshair" }} 
                        />
                        <div className="absolute -bottom-8 left-0 flex gap-2">
                           <Button size="xs" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => sigCanvas.current.clear()}><Trash2 size={12}/></Button>
                           <Button size="xs" className="h-6 px-2 text-[10px]" onClick={handleConfirmDrawing}><CheckCircle2 size={12}/></Button>
                        </div>
                      </div>
                    ) : (
                      <img src={finalSignatureImg} className="w-full h-full pointer-events-none p-1" />
                    )}
                    
                    <button onClick={() => { setIsPlaced(false); setFinalSignatureImg(null); }} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1"><X size={14} /></button>
                  </Rnd>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-2xl border sticky top-24">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Save size={18}/> 2. Finalize</h3>
            <Button className="w-full h-16" onClick={handleSaveFinalDoc} disabled={!finalSignatureImg || isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin" /> : "Save Page"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignDocument;