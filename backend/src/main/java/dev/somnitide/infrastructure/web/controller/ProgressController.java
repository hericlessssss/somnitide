package dev.somnitide.infrastructure.web.controller;

import dev.somnitide.application.usecase.GetProgress;
import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.infrastructure.web.dto.response.ProgressResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me/progress")
@Tag(name = "Progress", description = "Personal sleep progress and ranking endpoints")
public class ProgressController {

    private final GetProgress getProgress;

    public ProgressController(GetProgress getProgress) {
        this.getProgress = getProgress;
    }

    @GetMapping
    @Operation(summary = "Get personal sleep progress score for a range of days")
    public ResponseEntity<ProgressResponse> getProgress(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "7") int days) {
        
        if (days <= 0 || days > 30) {
            throw new DomainException("INVALID_RANGE", "Days must be between 1 and 30");
        }

        String userId = jwt.getSubject();
        GetProgress.Response result = getProgress.execute(userId, days);
        
        return ResponseEntity.ok(ProgressResponse.from(result));
    }
}
