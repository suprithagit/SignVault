package com.doc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"com.doc", "com.signvault"})
@EnableMongoRepositories(basePackages = "com.signvault.repository")
public class DocSignatureAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(DocSignatureAppApplication.class, args);
    }
}