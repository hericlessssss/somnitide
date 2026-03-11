package dev.somnitide.application.usecase;

import dev.somnitide.application.port.UserProfileRepository;
import dev.somnitide.domain.model.UserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GetRanking {

    private final UserProfileRepository repository;

    public GetRanking(UserProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<UserProfile> execute() {
        return repository.findTop100ByScore();
    }
}
