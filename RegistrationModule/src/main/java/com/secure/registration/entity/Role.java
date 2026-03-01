package com.secure.registration.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.secure.registration.enums.ERole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "roles")
public class Role {
  @Id
  private String id;

  private ERole name;

  public Role(ERole name) {
    this.name = name;
  }
}