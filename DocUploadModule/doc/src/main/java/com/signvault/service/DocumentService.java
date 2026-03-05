package com.signvault.service;

import com.signvault.dto.SignatureRequest;
import com.signvault.entity.SignatureDocument;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface DocumentService {
SignatureDocument uploadDocument(MultipartFile file, String ownerEmail, String ownerName) throws IOException;
    
    List<SignatureDocument> getDocumentsByOwner(String ownerEmail);
    
    void deleteDocument(String id);

    List<SignatureDocument> getAllDocuments();
    Resource downloadDocument(String id);
    SignatureDocument signDocument(String id, String signerName);
    SignatureDocument applySignature(String id, SignatureRequest request);
  
}