package com.example.email;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.stream.DoubleStream;


@Service
public class Emailgeneratorservice {
    //webclient use panni reactive na dnon-blocking web aa create panalam
    private final WebClient webclient;
    @Value("${gemini.api.url}")
    private String geminiapiurl;
    @Value("${gemini.api.key}")
    private String geminiapikey;

    public Emailgeneratorservice(WebClient.Builder webClientBuilder) {
        this.webclient =webClientBuilder.build();
    }



    public String generatereply(Email email) {
        //build the prompt,this is the propt which will go as an input to the gemini api
        String prompt = buildprompt(email);
        //build teh request ,request vanthu curl commmand aa postman la send pannailaa body laa default some json type commands came know,soo athuku thagundhamaathiri namma input taa ingha send pannanum
        /*{
  "contents": [
    {
      "parts": [
        {
          "text": "What is computer."
        }
      ]
    }
  ],This is a key value pair,parts is a key and the answer is value soo we are using map*


:*/

        //here we are creating the request body
        /*  What is Map<String, Object>?
Map → a collection of key-value pairs (like a dictionary in Python, or JSON object in JavaScript).

String → means the keys in this map must be strings.

Object → means the values can be any type (String, Integer, another Map, array, etc.).

So Map<String, Object> means:

Keys → "contents", "parts", "text", etc. (all strings)

Values → could be:

A string → "your prompt here"

Another map

An array

Number, Boolean, etc.
fisrt ->"contents:Object[]  //an array of objects
second->in object[]=parts:new object[];.... liijke this it moves on

*/
              Map<String, Object> requestBody = Map.of("contents", new Object[]
                {
                        Map.of("parts", new Object[]
                                {
                                        Map.of("text", prompt)
                                })
                });
        //Do request and get response
       /* 1. WebFlux vs Normal HTTP Clients
        Normal HTTP clients (like RestTemplate, OkHttp, etc.) are blocking by default.
        That means when you call them, they pause your code until the API replies — you automatically get the response object.

        WebFlux’s WebClient is non-blocking & reactive.
                That means when you call it, it doesn’t wait for the response — it gives you a Mono (a placeholder that will eventually contain the result).
                bodyToMono(String.class) means:
“When the Gemini API replies, convert the JSON body into a String for me.”

Without it, WebClient won’t know how to read and convert the response body.*/
         /* webflux use panni thaa namma innoru ai aaa call panna mudiyum ,but webflux is a non -blocking one,soo gemini la erundhu answer varaku time aachuna it will move to the next ,so bodyToMono verum future value thhaa erukum. so next line lo namm*/

                String response=webclient.post().uri(geminiapiurl + "?key=" + geminiapikey)

                .header("Content-Type","application/json")
                        .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        //Extracting response and return
        return extractResponse(response);


    }
// repsonse vanthu string la vandhuurukum ,then adhula map maari neriya key value pairs erukum,soo namakku  only answer mattum venum soo antha string json format ku chaange panni ,answer aa mattum extract panrom
    private String extractResponse(String response) {
        //string  aa aduthuerukaradhaa jsonnode aa chanege pandromm like aa tree
        try
        {
            ObjectMapper mapper=new ObjectMapper();
            JsonNode rootnode=mapper.readTree(response);//here the string is cinverted to jsonnode ,we can accress it using keys and arrays
            /*{
  "candidates": [
    {
      "content": {
        "parts": [
          { "text": "Hello from Gemini!" }
        ]
      }
    }
  ]
*/

            return rootnode.path("candidates")//goes to the canditates,it is an array
                    .get(0)//moves to the first element
                    .path("content")//in the first element moves to the content key
                    .path("parts")//in content ,next moves inside to the parts
                    .get(0)//parts kullaa first element ku poghum
                    .path("text")//hoes towards teh text key and
                    .asText();// getit as text



        }catch (Exception e)
        {
            return "Error processing request "+e.getMessage();
        }
    }


    private String buildprompt(Email email) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following emial content.please don't generate a subject line ");
        if (email.getTone() != null && !email.getTone().isEmpty()) {
            prompt.append("Use a").append(email.getTone()).append("tone");
        }
        prompt.append("\n Original email: \n").append(email.getEmaili());
        return prompt.toString();
    }
}

