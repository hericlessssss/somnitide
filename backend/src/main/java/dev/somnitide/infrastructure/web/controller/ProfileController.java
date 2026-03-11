package dev.somnitide.infrastructure.web.controller;

import dev.somnitide.application.usecase.GetProfile;
import dev.somnitide.application.usecase.UpdateProfile;
import dev.somnitide.domain.model.UserProfile;
import dev.somnitide.infrastructure.web.dto.response.ProfileResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final GetProfile getProfile;
    private final UpdateProfile updateProfile;

    public ProfileController(GetProfile getProfile, UpdateProfile updateProfile) {
        this.getProfile = getProfile;
        this.updateProfile = updateProfile;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        return getProfile.execute(jwt.getSubject())
                .map(p -> ResponseEntity.ok(ProfileResponse.fromDomain(p)))
                .orElse(ResponseEntity.ok().build());
    }

    @PostMapping("/me")
    public ProfileResponse updateMyProfile(@AuthenticationPrincipal Jwt jwt,
                                           @Valid @RequestBody UpdateProfile.Request request) {
        UserProfile profile = updateProfile.execute(jwt.getSubject(), request);
        return ProfileResponse.fromDomain(profile);
    }
}
