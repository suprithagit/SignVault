package com.signvault.repository;

import com.signvault.entity.SignatureDocument;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends MongoRepository<SignatureDocument, String> {
	List<SignatureDocument> findByOwnerId(String ownerId);
}