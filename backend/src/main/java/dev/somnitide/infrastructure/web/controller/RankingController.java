package dev.somnitide.infrastructure.web.controller;

import dev.somnitide.application.usecase.GetPublicProfile;
import dev.somnitide.application.usecase.GetRanking;
import dev.somnitide.infrastructure.web.dto.response.ProfileResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ranking")
public class RankingController {

    private final GetRanking getRanking;
    private final GetPublicProfile getPublicProfile;

    public RankingController(GetRanking getRanking, GetPublicProfile getPublicProfile) {
        this.getRanking = getRanking;
        this.getPublicProfile = getPublicProfile;
    }

    @GetMapping
    public List<ProfileResponse> getTop100() {
        List<dev.somnitide.domain.model.UserProfile> top100 = getRanking.execute();
        return java.util.stream.IntStream.range(0, top100.size())
                .mapToObj(i -> ProfileResponse.fromDomain(top100.get(i), i + 1))
                .collect(Collectors.toList());
    }

    @GetMapping("/profile/{handle}")
    public ResponseEntity<ProfileResponse> getPublicProfile(@PathVariable String handle) {
        return getPublicProfile.execute(handle)
                .map(p -> ResponseEntity.ok(ProfileResponse.fromDomain(p.profile(), p.rankPosition())))
                .orElse(ResponseEntity.notFound().build());
    }
}
