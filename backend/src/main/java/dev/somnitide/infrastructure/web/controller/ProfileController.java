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

import java.util.List;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final GetProfile getProfile;
    private final UpdateProfile updateProfile;
    private final dev.somnitide.application.port.UserProfileRepository profileRepository;

    public ProfileController(GetProfile getProfile, UpdateProfile updateProfile,
                             dev.somnitide.application.port.UserProfileRepository profileRepository) {
        this.getProfile = getProfile;
        this.updateProfile = updateProfile;
        this.profileRepository = profileRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return getProfile.execute(userId)
                .map(p -> ResponseEntity.ok(ProfileResponse.fromDomain(p.profile(), p.rankPosition())))
                .orElse(ResponseEntity.ok().build());
    }

    @PostMapping("/me")
    public ProfileResponse updateMyProfile(@AuthenticationPrincipal Jwt jwt,
                                           @Valid @RequestBody UpdateProfile.Request request) {
        String userId = jwt.getSubject();
        UserProfile profile = updateProfile.execute(userId, request);
        Integer rankPosition = computeRankPosition(userId);
        return ProfileResponse.fromDomain(profile, rankPosition);
    }

    private Integer computeRankPosition(String userId) {
        List<UserProfile> ranked = profileRepository.findTop100ByScore();
        for (int i = 0; i < ranked.size(); i++) {
            if (ranked.get(i).getUserId().equals(userId)) {
                return i + 1;
            }
        }
        return null;
    }
}
