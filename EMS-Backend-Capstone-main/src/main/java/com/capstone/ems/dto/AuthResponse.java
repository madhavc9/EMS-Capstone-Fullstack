package com.capstone.ems.dto;

//AuthResponse.java
public class AuthResponse {

 private String token;
 private String role;
 private Long employeeId; 

 public AuthResponse(String token, String role, Long employeeId) {
     this.token = token;
     this.role = role;
     this.employeeId = employeeId;
 }

 public String getToken() {
     return token;
 }

 public String getRole() {
     return role;
 }

 public Long getEmployeeId() {
     return employeeId;
 }

 public void setToken(String token) {
     this.token = token;
 }

 public void setRole(String role) {
     this.role = role;
 }

 public void setEmployeeId(Long employeeId) {
     this.employeeId = employeeId;
 }
}
