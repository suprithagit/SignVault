package com.signvault.controller;

import com.signvault.entity.SignatureDocument;
import com.signvault.service.DocumentService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            SignatureDocument savedDoc = documentService.uploadDocument(file);
            return ResponseEntity.ok(savedDoc);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<SignatureDocument>> getAllDocuments() {
        // This calls the method we implemented in your Service earlier
        return ResponseEntity.ok(documentService.getAllDocuments());
    }
    
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String id) {
        Resource file = documentService.downloadDocument(id);
        
        // CONTENT_DISPOSITION: "attachment" triggers download, "inline" triggers view
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(file);
    }
    
    @PostMapping("/{id}/sign")
    public ResponseEntity<SignatureDocument> signDocument(
            @PathVariable String id, 
            @RequestParam String signerName) {
        // This calls the signDocument method we updated in your Service
        return ResponseEntity.ok(documentService.signDocument(id, signerName));
    }
}