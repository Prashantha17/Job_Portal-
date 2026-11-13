package com.talentflow.backend.dto.auth;

import com.talentflow.backend.entity.UserStatus;
import java.time.Instant;
import java.util.List;

public class UserProfileResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private UserStatus status;
    private List<String> roles;
    private Instant createdAt;

    public UserProfileResponse() {}

    public UserProfileResponse(Long id, String email, String firstName, String lastName,
                               String phone, UserStatus status, List<String> roles, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.status = status;
        this.roles = roles;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static UserProfileResponseBuilder builder() {
        return new UserProfileResponseBuilder();
    }

    public static class UserProfileResponseBuilder {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private UserStatus status;
        private List<String> roles;
        private Instant createdAt;

        public UserProfileResponseBuilder id(Long id) { this.id = id; return this; }
        public UserProfileResponseBuilder email(String email) { this.email = email; return this; }
        public UserProfileResponseBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserProfileResponseBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserProfileResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public UserProfileResponseBuilder status(UserStatus status) { this.status = status; return this; }
        public UserProfileResponseBuilder roles(List<String> roles) { this.roles = roles; return this; }
        public UserProfileResponseBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public UserProfileResponse build() {
            return new UserProfileResponse(id, email, firstName, lastName, phone, status, roles, createdAt);
        }
    }
}

