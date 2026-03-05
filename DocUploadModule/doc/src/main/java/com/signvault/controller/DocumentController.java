package com.signvault.controller;

import com.signvault.dto.SignatureRequest;
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

    /**
     * Unified Get endpoint. 
     * Uses @RequestParam(required = false) to prevent Ambiguous Mapping error.
     * URL: GET /api/documents?ownerEmail=test@example.com
     */
    @GetMapping
    public ResponseEntity<List<SignatureDocument>> getDocuments(@RequestParam(required = false) String ownerEmail) {
        if (ownerEmail != null && !ownerEmail.isEmpty()) {
            // Fetches documents for the specific user
            return ResponseEntity.ok(documentService.getDocumentsByOwner(ownerEmail));
        }
        // Fallback: Fetch all documents (useful for admin or initial testing)
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("ownerEmail") String ownerEmail,
            @RequestParam("ownerName") String ownerName) {
        try {
            SignatureDocument savedDoc = documentService.uploadDocument(file, ownerEmail, ownerName);
            return ResponseEntity.ok(savedDoc);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String id) {
        Resource file = documentService.downloadDocument(id);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(file);
    }

    @PostMapping("/{id}/sign")
    public ResponseEntity<SignatureDocument> signDocument(
            @PathVariable String id, 
            @RequestParam String signerName) {
        return ResponseEntity.ok(documentService.signDocument(id, signerName));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable String id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Delete failed: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/final-sign")
    public ResponseEntity<?> finalizeSignature(
            @PathVariable String id, 
            @RequestBody SignatureRequest request) {
        try {
            SignatureDocument updatedDoc = documentService.applySignature(id, request);
            return ResponseEntity.ok(updatedDoc);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Signature failed: " + e.getMessage());
        }
    }
}