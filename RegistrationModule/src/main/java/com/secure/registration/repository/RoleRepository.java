package com.secure.registration.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.secure.registration.entity.Role;
import com.secure.registration.enums.ERole;

public interface RoleRepository  extends MongoRepository<Role, String> {
	  Optional<Role> findByName(ERole name);
}

