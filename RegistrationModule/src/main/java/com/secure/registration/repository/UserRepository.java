package com.secure.registration.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.secure.registration.entity.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    
    // Add this to support email-based lookups
    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}