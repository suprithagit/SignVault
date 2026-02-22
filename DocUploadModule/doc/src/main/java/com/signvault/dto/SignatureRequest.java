package com.signvault.dto;

import lombok.Data;

@Data
public class SignatureRequest {
    private String signatureImage; // Base64 String
    private int x;
    private int y;
    private int width;
    private int height;
    private String signerName;
}