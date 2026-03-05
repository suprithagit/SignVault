package com.signvault.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "signature_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignatureDocument {
    @Id
    private String id;
    private String fileName;
    private String contentType;
    private String status; // "PENDING" or "SIGNED"
    private LocalDateTime uploadDate;
    private String gridFsId; // Link to the binary file in GridFS
    
    private String ownerId;
    // Tracking fields for signatures
    private String signedBy;      // Captures the signer's name
    private LocalDateTime signedAt; // Captures the timestamp of signature
}