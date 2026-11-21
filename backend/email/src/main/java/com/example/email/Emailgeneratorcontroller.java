package com.example.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins="*")
public class Emailgeneratorcontroller {
    @Autowired
    Emailgeneratorservice service;
    @PostMapping("/generate")
    public ResponseEntity<String> generateEmailresponse(@RequestBody Email emial)
    {
        System.out.println("Email content: " + emial.getEmaili()); // Debug
        System.out.println("Tone: " + emial.getTone());
        String response= service.generatereply(emial);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
