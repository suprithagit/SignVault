package com.secure.registration.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.secure.registration.dto.request.LoginRequest;
import com.secure.registration.dto.request.SignupRequest;
import com.secure.registration.dto.response.MessageResponse;
import com.secure.registration.dto.response.UserInfoResponse;
import com.secure.registration.entity.Role;
import com.secure.registration.entity.User;
import com.secure.registration.enums.ERole;
import com.secure.registration.repository.RoleRepository;
import com.secure.registration.repository.UserRepository;
import com.secure.registration.security.JwtUtils;
import com.secure.registration.service.UserDetailsImpl;




@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor // Automatically creates constructor for final fields
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<UserInfoResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        var userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(new UserInfoResponse(
                        userDetails.id(),
                        userDetails.username(),
                        userDetails.email(),
                        roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.username())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.email())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        var user = User.builder()
                .username(signUpRequest.username())
                .email(signUpRequest.email())
                .password(encoder.encode(signUpRequest.password()))
                .build();

        Set<String> strRoles = signUpRequest.roles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            roles.add(getRole(ERole.ROLE_USER));
        } else {
            strRoles.forEach(role -> {
                Role foundRole = switch (role.toLowerCase()) {
                    case "admin" -> getRole(ERole.ROLE_ADMIN);
                    case "mod"   -> getRole(ERole.ROLE_MODERATOR);
                    default      -> getRole(ERole.ROLE_USER);
                };
                roles.add(foundRole);
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    private Role getRole(ERole roleEnum) {
        return roleRepository.findByName(roleEnum)
                .orElseThrow(() -> new RuntimeException("Error: Role " + roleEnum + " is not found."));
    }
}