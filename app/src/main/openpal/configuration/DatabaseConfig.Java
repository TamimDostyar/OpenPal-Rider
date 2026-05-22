package openpal.configuration;

public class DatabaseConfig {

    private String databasePath = System.getenv("DATABASE_PATH");
    private String pw = System.getenv("DATABASE_PW");
    private String dbName = System.getenv("DATABASE_NAME");

    boolean loadEnv() {
        return databasePath != null && pw != null && dbName != null;
    }

    
}