package dev.somnitide.infrastructure.web.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record EndSessionRequest(
        @Min(1) @Max(5) Integer qualityRating,
        @Size(max = 500) String note) {
}
