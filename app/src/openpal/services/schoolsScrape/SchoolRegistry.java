package openpal.services.schoolsScrape;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class SchoolRegistry {

    private final Map<String, SchoolManager> byName;

    public SchoolRegistry(List<SchoolManager> schools) {
        this.byName = schools.stream()
            .collect(Collectors.toMap(s -> s.school().toLowerCase(), Function.identity()));
    }

    public SchoolManager get(String name) {
        SchoolManager school = name == null ? null : byName.get(name.toLowerCase());
        if (school == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown school: " + name);
        }
        return school;
    }
}
