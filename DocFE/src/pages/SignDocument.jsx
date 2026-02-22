import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, PenTool, Trash2, Save, Upload, Type, Move, RotateCcw, X, CheckCircle2 } from "lucide-react";
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
  
  // UI States
  const [signerName, setSignerName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(SIGNATURE_STYLES[0].class);
  const [signatureType, setSignatureType] = useState("draw");
  const [isProcessing, setIsProcessing] = useState(false);
  const [docUrl, setDocUrl] = useState(null);
  
  // Signature States
  const [isPlaced, setIsPlaced] = useState(false);
  const [finalSignatureImg, setFinalSignatureImg] = useState(null);
  const [sigPosition, setSigPosition] = useState({ x: 150, y: 150 });
  const [sigSize, setSigSize] = useState({ width: 220, height: 100 });

  const sigCanvas = useRef(null);

  // Load PDF Preview
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

  // ACTION: Capture drawing and convert to PNG cache
  const handleConfirmDrawing = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      // Custom trim function since getTrimmedCanvas has issues in alpha version
      const canvas = sigCanvas.current.getCanvas();
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          if (data[index + 3] > 0) { // alpha > 0
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const trimmedWidth = maxX - minX + 1;
      const trimmedHeight = maxY - minY + 1;

      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = trimmedWidth;
      trimmedCanvas.height = trimmedHeight;
      const trimmedCtx = trimmedCanvas.getContext('2d');
      trimmedCtx.drawImage(canvas, -minX, -minY);

      const dataUrl = trimmedCanvas.toDataURL("image/png");
      setFinalSignatureImg(dataUrl); 
      setIsPlaced(true);
      toast({ 
        title: "Signature Placed", 
        description: "Your drawing has been converted and placed on the PDF. Drag to reposition." 
      });
    } else {
      toast({ 
        variant: "destructive", 
        title: "Empty Canvas", 
        description: "Please draw your signature before clicking confirm." 
      });
    }
  };

  // Place the cached/typed signature onto the PDF
  const handlePlaceSignBox = () => {
    if (signatureType === "draw" && !finalSignatureImg) {
      return toast({ variant: "destructive", title: "Wait!", description: "Please confirm your drawing by clicking the green checkmark first." });
    }

    if (signatureType === "type") {
      if (!signerName) return toast({ variant: "destructive", title: "Name required", description: "Please type your name first." });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 400; canvas.height = 150;
      const fontFamily = selectedStyle.includes('serif') ? 'serif' : selectedStyle.includes('mono') ? 'monospace' : 'sans-serif';
      ctx.font = `italic 40px ${fontFamily}`;
      ctx.fillStyle = "black";
      ctx.fillText(signerName, 20, 80);
      setFinalSignatureImg(canvas.toDataURL("image/png"));
    }

    setIsPlaced(true);
    toast({ title: "Box Placed", description: "Drag the box to where you want the signature." });
  };

  const onImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFinalSignatureImg(reader.result);
        toast({ title: "Image Uploaded", description: "Click 'Place Sign Box' to continue." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseSignature = () => {
    setIsPlaced(false);
  };

  const handleSaveFinalDoc = async () => {
    if (!finalSignatureImg) return;
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
        toast({ title: "Success", description: "Document signed and saved." });
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
        
        {/* LEFT PANEL: Signature Creation */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card p-5 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><PenTool size={18}/> 1. Choose Method</h2>
            
            <Tabs defaultValue="draw" onValueChange={(val) => { 
              setSignatureType(val); 
              setIsPlaced(false); 
              setFinalSignatureImg(null); 
            }}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="draw">Draw</TabsTrigger>
                <TabsTrigger value="type">Type</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>

              {/* DRAW TAB */}
              <TabsContent value="draw" className="space-y-4">
                <div className="border rounded-lg bg-white h-40 relative overflow-hidden">
                   <SignatureCanvas 
                    ref={sigCanvas} 
                    penColor="black" 
                    canvasProps={{ className: "w-full h-full cursor-crosshair" }} 
                  />
                </div>

                {/* CACHE BOX (Initially empty, then displays captured PNG) */}
                <div className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition-all ${finalSignatureImg && signatureType === "draw" ? 'border-green-200 bg-green-50/50' : 'border-slate-100 bg-slate-50/30 opacity-40'}`}>
                  {finalSignatureImg && signatureType === "draw" ? (
                    <>
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-bold uppercase">Image Ready</span>
                      </div>
                      <div className="bg-white p-2 border rounded shadow-sm w-full flex justify-center">
                        <img src={finalSignatureImg} alt="cache preview" className="h-16 object-contain" />
                      </div>
                    </>
                  ) : (
                    <div className="h-16 flex items-center justify-center text-xs text-slate-400">
                      Signature will appear here after confirming
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => { sigCanvas.current.clear(); setFinalSignatureImg(null); }}>
                    <Trash2 size={14} /> Clear
                  </Button>
                  <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleConfirmDrawing}>
                    <CheckCircle2 size={14} /> Confirm
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground text-center italic">Draw above and click 'Confirm' to save.</p>
              </TabsContent>

              {/* TYPE TAB */}
              <TabsContent value="type" className="space-y-4">
                <Input 
                  placeholder="Type Name" 
                  value={signerName} 
                  onChange={(e) => setSignerName(e.target.value)} 
                  className={`h-12 ${selectedStyle}`} 
                />
                <div className="flex gap-1">
                  {SIGNATURE_STYLES.map((s) => (
                    <button 
                      key={s.name} 
                      onClick={() => setSelectedStyle(s.class)} 
                      className={`flex-1 p-1 text-[10px] border rounded transition-all ${selectedStyle === s.class ? 'border-primary bg-primary/5 font-bold' : 'border-slate-200'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* UPLOAD TAB */}
              <TabsContent value="upload" className="p-4 border-2 border-dashed rounded-xl text-center">
                <input type="file" id="sig-upload" hidden accept="image/*" onChange={onImageUpload} />
                <label htmlFor="sig-upload" className="cursor-pointer text-primary text-sm flex flex-col items-center gap-2">
                  {finalSignatureImg && signatureType === 'upload' ? <CheckCircle2 size={24} className="text-green-500" /> : <Upload size={24} />}
                  <span className="font-semibold">{finalSignatureImg && signatureType === 'upload' ? "Image Ready" : "Choose Signature File"}</span>
                </label>
              </TabsContent>
            </Tabs>

            <Button 
              className="w-full mt-6 gap-2 h-12" 
              onClick={handlePlaceSignBox} 
              disabled={isPlaced || (signatureType === "draw" && !finalSignatureImg)}
            >
              <Move size={16} /> Place Sign Box
            </Button>
          </div>

          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            <RotateCcw size={16} className="mr-2"/> Reset All
          </Button>
        </div>

        {/* CENTER PANEL: PDF Preview & Drag/Drop Signature */}
        <div className="lg:col-span-7 relative bg-slate-200 rounded-2xl border h-[80vh] overflow-hidden">
          <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-400 h-full">
            {docUrl && (
              <div className="relative bg-white shadow-2xl" style={{ width: '595px', height: '842px' }}>
                <iframe src={`${docUrl}#toolbar=0`} className="w-full h-full pointer-events-none" title="PDF" />
                
                {isPlaced && finalSignatureImg && (
                  <Rnd
                    size={{ width: sigSize.width, height: sigSize.height }}
                    position={{ x: sigPosition.x, y: sigPosition.y }}
                    onDragStop={(e, d) => setSigPosition({ x: d.x, y: d.y })}
                    onResizeStop={(e, dir, ref, delta, pos) => {
                      setSigSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                      setSigPosition(pos);
                    }}
                    bounds="parent"
                    className="z-50 border-2 border-primary bg-white/60 backdrop-blur-[1px] shadow-lg flex items-center justify-center group"
                  >
                    <img src={finalSignatureImg} className="w-full h-full object-contain pointer-events-none p-1" />
                    <button 
                      onClick={handleCloseSignature} 
                      className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-transform active:scale-90"
                    >
                      <X size={14} />
                    </button>
                  </Rnd>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Final Save */}
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-2xl border sticky top-24">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground"><Save size={16}/> 2. Finalize</h3>
            <Button className="w-full h-16 text-lg font-bold" onClick={handleSaveFinalDoc} disabled={!isPlaced || isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin" /> : "Save Page"}
            </Button>
            <p className="text-[10px] mt-4 text-center text-muted-foreground">This will permanently apply the signature to the current document.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignDocument;