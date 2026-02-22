package com.signvault.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.signvault.entity.SignatureDocument;
import com.signvault.repository.DocumentRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
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
        // Store binary in GridFS buckets: fs.files and fs.chunks
        Object fileId = gridFsTemplate.store(
            file.getInputStream(), 
            file.getOriginalFilename(), 
            file.getContentType()
        );

        // Build metadata entity for signature_documents collection
        SignatureDocument doc = SignatureDocument.builder()
            .fileName(file.getOriginalFilename())
            .contentType(file.getContentType())
            .uploadDate(LocalDateTime.now())
            .status("PENDING")
            .gridFsId(fileId.toString()) // Keep reference to GridFS ID
            .build();

        return repository.save(doc);
    }

    @Override
    public List<SignatureDocument> getAllDocuments() {
        return repository.findAll();
    }

    @Override
    public Resource downloadDocument(String id) {
        // 1. Fetch metadata to find the correct gridFsId
        SignatureDocument doc = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Metadata not found for id: " + id));

        // 2. Convert gridFsId String to MongoDB ObjectId
        ObjectId gridFsObjectId = new ObjectId(doc.getGridFsId());

        // 3. Query GridFS bucket for the actual binary
        GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(gridFsObjectId)));

        if (gridFsFile == null) {
            throw new RuntimeException("Binary file not found in GridFS for id: " + doc.getGridFsId());
        }

        return gridFsOperations.getResource(gridFsFile);
    }
    
    @Override
    public SignatureDocument signDocument(String id, String signerName) {
        // 1. Find existing document metadata
        SignatureDocument doc = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // 2. Update tracking details
        doc.setSignedBy(signerName);
        doc.setSignedAt(LocalDateTime.now());
        doc.setStatus("SIGNED");

        // 3. Save the update back to MongoDB Atlas
        return repository.save(doc);
    }
}