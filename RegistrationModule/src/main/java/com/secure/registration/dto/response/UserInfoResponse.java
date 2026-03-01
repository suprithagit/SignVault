package com.secure.registration.dto.response;


import java.util.List;

/**
 * Clean Java 21 Record for returning authenticated user data.
 * Sent back to the client after a successful /signin.
 */
public record UserInfoResponse(
    String id,
    String username,
    String email,
    List<String> roles
) {}