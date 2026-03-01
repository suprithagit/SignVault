package com.secure.registration.dto.request;

import java.util.Set;
import jakarta.validation.constraints.*;

public record SignupRequest(
    @NotBlank @Size(min = 3, max = 20) String username,
    @NotBlank @Size(max = 50) @Email String email,
    @NotBlank @Size(min = 6, max = 40) String password,
    Set<String> roles
) {}