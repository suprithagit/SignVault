package com.signvault.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.signvault.dto.SignatureRequest;
import com.signvault.entity.SignatureDocument;
import com.signvault.repository.DocumentRepository;
import org.apache.pdfbox.Loader; // Required for PDFBox 3.0+
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.*;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class DocumentServiceImpl implements DocumentService {

    @Autowired
    private GridFsTemplate gridFsTemplate;

    @Autowired
    private GridFsOperations gridFsOperations;

    @Autowired
    private DocumentRepository repository;

    @Override
    public SignatureDocument uploadDocument(MultipartFile file) throws IOException {
        Object fileId = gridFsTemplate.store(
            file.getInputStream(), 
            file.getOriginalFilename(), 
            file.getContentType()
        );

        SignatureDocument doc = SignatureDocument.builder()
            .fileName(file.getOriginalFilename())
            .contentType(file.getContentType())
            .uploadDate(LocalDateTime.now())
            .status("PENDING")
            .gridFsId(fileId.toString())
            .build();

        return repository.save(doc); //
    }

    @Override
    public Resource downloadDocument(String id) {
        SignatureDocument doc = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document metadata not found"));

        GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(new ObjectId(doc.getGridFsId()))));
        
        if (gridFsFile == null) throw new RuntimeException("Binary file not found in GridFS");

        return gridFsOperations.getResource(gridFsFile); //
    }

    @Override
    public SignatureDocument applySignature(String id, SignatureRequest request) {
        try {
            SignatureDocument doc = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // 1. Get current binary
            byte[] pdfBytes;
            try (InputStream is = downloadDocument(id).getInputStream()) {
                pdfBytes = is.readAllBytes();
            }

            // 2. Process with PDFBox 3.x
            try (PDDocument pdDocument = Loader.loadPDF(pdfBytes)) {
                PDPage page = pdDocument.getPage(0); 
                float pageHeight = page.getMediaBox().getHeight();
                
                // Decode Base64 Image
                String b64Data = request.getSignatureImage();
                if (b64Data.contains(",")) b64Data = b64Data.split(",")[1];
                byte[] imageBytes = Base64.getDecoder().decode(b64Data);
                
                PDImageXObject pdImage = PDImageXObject.createFromByteArray(pdDocument, imageBytes, "sig");

                // 3. Overlay Content
                try (PDPageContentStream contentStream = new PDPageContentStream(pdDocument, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    float x = (float) request.getX();
                    
                    // THE FIX: Subtract the UI Y and Height from the total Page Height
                    float y = pageHeight - (float) request.getY() - (float) request.getHeight();
                    
                    contentStream.drawImage(pdImage, x, y, (float) request.getWidth(), (float) request.getHeight());
                }
                // 4. Save to Temp Stream and Re-upload
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                pdDocument.save(baos);

                try (InputStream signedIs = new ByteArrayInputStream(baos.toByteArray())) {
                    String signedName = "signed_" + doc.getFileName();
                    Object newFileId = gridFsTemplate.store(signedIs, signedName, "application/pdf");

                    // 5. Update Metadata
                    doc.setGridFsId(newFileId.toString());
                    doc.setFileName(signedName);
                    doc.setStatus("SIGNED");
                    doc.setSignedBy(request.getSignerName());
                    doc.setSignedAt(LocalDateTime.now()); //

                    return repository.save(doc);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to apply visual signature", e);
        }
    }

    @Override
    public List<SignatureDocument> getAllDocuments() {
        return repository.findAll();
    }

	@Override
	public SignatureDocument signDocument(String id, String signerName) {
		// TODO Auto-generated method stub
		return null;
	}
}