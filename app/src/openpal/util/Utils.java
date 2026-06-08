package openpal.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Loads and caches the US-universities list from the bundled CSV. Provides
 * lookup by name as well as the full ordered list with names and URLs.
 */
public class Utils {

    private static final String UNIVERSITIES_CSV = "data/us_universities.csv";

    private static volatile Set<String> schools;

    private static volatile List<Map<String, String>> universities;

    public static boolean isSchoolValid(String name) {
        if (name == null || name.isBlank()) {
            return false;
        }
        return getSchools().contains(name.trim().toLowerCase());
    }

    public static List<Map<String, String>> getUniversities() {
        List<Map<String, String>> local = universities;
        if (local == null) {
            synchronized (Utils.class) {
                local = universities;
                if (local == null) {
                    local = loadUniversities();
                    universities = local;
                }
            }
        }
        return local;
    }

    private static List<Map<String, String>> loadUniversities() {
        List<Map<String, String>> result = new ArrayList<>();
        try (InputStream in = Utils.class.getClassLoader().getResourceAsStream(UNIVERSITIES_CSV)) {
            if (in == null) {
                return result;
            }
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(in, StandardCharsets.UTF_8))) {
                reader.readLine();
                String line;
                while ((line = reader.readLine()) != null) {
                    int comma = line.indexOf(',');
                    String name = (comma >= 0 ? line.substring(0, comma) : line).trim();
                    String url = comma >= 0 ? line.substring(comma + 1).trim() : "";
                    if (!name.isEmpty()) {
                        Map<String, String> university = new LinkedHashMap<>();
                        university.put("name", name);
                        university.put("url", url);
                        result.add(university);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Failed to load universities list: " + e.getMessage());
        }
        return result;
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
                reader.readLine();
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
