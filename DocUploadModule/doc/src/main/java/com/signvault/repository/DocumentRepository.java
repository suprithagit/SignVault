package com.signvault.repository;

import com.signvault.entity.SignatureDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends MongoRepository<SignatureDocument, String> {
    // Basic CRUD (Save, Find, Delete) is now available automatically
}