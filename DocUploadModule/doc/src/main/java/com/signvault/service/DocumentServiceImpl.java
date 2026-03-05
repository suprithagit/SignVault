package com.signvault.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.signvault.dto.SignatureRequest;
import com.signvault.entity.SignatureDocument;
import com.signvault.repository.DocumentRepository;
import org.apache.pdfbox.Loader; 
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
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
    public SignatureDocument uploadDocument(MultipartFile file, String ownerEmail, String ownerName) throws IOException {
        // Store binary in GridFS
        ObjectId fileId = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType());
        
        // Save metadata linked to user
        SignatureDocument doc = SignatureDocument.builder()
            .fileName(file.getOriginalFilename())
            .contentType(file.getContentType())
            .uploadDate(LocalDateTime.now())
            .status("PENDING")
            .gridFsId(fileId.toString())
            .ownerId(ownerEmail) // Using email as the identifier
            .build();
            
        return repository.save(doc);
    }

    @Override
    public List<SignatureDocument> getDocumentsByOwner(String ownerEmail) {
        return repository.findByOwnerId(ownerEmail);
    }

    @Override
    public void deleteDocument(String id) {
        SignatureDocument doc = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found"));

        // 1. Remove binary file from GridFS to save space
        gridFsTemplate.delete(new Query(Criteria.where("_id").is(new ObjectId(doc.getGridFsId()))));

        // 2. Remove metadata from MongoDB
        repository.deleteById(id);
    }

    @Override
    public Resource downloadDocument(String id) {
        SignatureDocument doc = repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(new ObjectId(doc.getGridFsId()))));
        return gridFsOperations.getResource(gridFsFile);
    }

    @Override
    public SignatureDocument applySignature(String id, SignatureRequest request) {
        try {
            SignatureDocument doc = repository.findById(id).orElseThrow(() -> new RuntimeException("Document not found"));
            
            byte[] pdfBytes;
            try (InputStream is = downloadDocument(id).getInputStream()) {
                pdfBytes = is.readAllBytes();
            }

            try (PDDocument pdDocument = Loader.loadPDF(pdfBytes)) {
                // Handle first page
                PDPage page = pdDocument.getPage(0); 
                PDRectangle mediaBox = page.getMediaBox();
                float pdfWidth = mediaBox.getWidth();
                float pdfHeight = mediaBox.getHeight();
                
                // FE assumes a fixed 595x842 canvas. We must scale the coordinates if the PDF is different.
                float scaleX = pdfWidth / 595f;
                float scaleY = pdfHeight / 842f;

                String b64 = request.getSignatureImage();
                if (b64.contains(",")) b64 = b64.split(",")[1];
                byte[] imageBytes = Base64.getDecoder().decode(b64);
                
                // PDFBox 3.x uses createFromData
                PDImageXObject pdImage = PDImageXObject.createFromByteArray(pdDocument, imageBytes, "sig");

                try (PDPageContentStream contents = new PDPageContentStream(pdDocument, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    // Scaled Coordinates
                    float x = (float) request.getX() * scaleX;
                    float width = (float) request.getWidth() * scaleX;
                    float height = (float) request.getHeight() * scaleY;
                    
                    // Flip Y: PDF (0,0) is bottom-left. UI (0,0) is top-left.
                    float y = pdfHeight - ((float) request.getY() * scaleY) - height;
                    
                    contents.drawImage(pdImage, x, y, width, height);
                }

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                pdDocument.save(baos);

                try (InputStream signedIs = new ByteArrayInputStream(baos.toByteArray())) {
                    String originalName = doc.getFileName(); 
                    
                    // 1. Store the new file
                    Object newFileId = gridFsTemplate.store(signedIs, originalName, "application/pdf");

                    // 2. Delete the old version to avoid storage bloat
                    gridFsTemplate.delete(new Query(Criteria.where("_id").is(new ObjectId(doc.getGridFsId()))));

                    // 3. Update metadata
                    doc.setGridFsId(newFileId.toString());
                    doc.setStatus("SIGNED");
                    doc.setSignedBy(request.getSignerName());
                    doc.setSignedAt(LocalDateTime.now());
                    return repository.save(doc);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Signature placement failed: " + e.getMessage());
        }
    }

    @Override
    public List<SignatureDocument> getAllDocuments() { 
        return repository.findAll(); 
    }
    
    @Override
    public SignatureDocument signDocument(String id, String signerName) {
        SignatureDocument doc = repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        doc.setSignedBy(signerName); 
        doc.setStatus("SIGNED");
        return repository.save(doc);
    }
}