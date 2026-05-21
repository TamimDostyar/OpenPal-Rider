package openpal.controllers.profile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

public class Utils {

    private static final String UNIVERSITIES_CSV = "data/us_universities.csv";

    // lazily loaded, normalized (lowercase) set of valid US university names
    private static volatile Set<String> schools;

    /**
     * Checks whether the given school name matches a known US university
     * listed in resources/data/us_universities.csv.
     */
    public static boolean isSchoolValid(String name) {
        if (name == null || name.isBlank()) {
            return false;
        }
        return getSchools().contains(name.trim().toLowerCase());
    }

    private static Set<String> getSchools() {
        Set<String> local = schools;
        if (local == null) {
            synchronized (Utils.class) {
                local = schools;
                if (local == null) {
                    local = loadSchools();
                    schools = local;
                }
            }
        }
        return local;
    }

    private static Set<String> loadSchools() {
        Set<String> result = new HashSet<>();
        try (InputStream in = Utils.class.getClassLoader().getResourceAsStream(UNIVERSITIES_CSV)) {
            if (in == null) {
                return result;
            }
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(in, StandardCharsets.UTF_8))) {
                reader.readLine(); // skip header: name,url
                String line;
                while ((line = reader.readLine()) != null) {
                    int comma = line.indexOf(',');
                    String school = comma >= 0 ? line.substring(0, comma) : line;
                    school = school.trim();
                    if (!school.isEmpty()) {
                        result.add(school.toLowerCase());
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Failed to load universities list: " + e.getMessage());
        }
        return result;
    }
}
