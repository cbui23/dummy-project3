import java.sql.*;

/**
 * Updated for Render Deployment (CSCE 331)
 * This version pulls credentials from Environment Variables
 * instead of a local .properties file.
 */
public class dbSetup {

    public static Connection getConnection() {
        try {
            // Pulling from Render's 'Environment' settings
            String url = System.getenv("DB_URL");
            String user = System.getenv("DB_USER");
            String pass = System.getenv("DB_PASSWORD");

            // Check if variables are missing to provide a helpful error
            if (url == null || user == null || pass == null) {
                System.err.println("CRITICAL: Environment variables (DB_URL, DB_USER, DB_PASSWORD) are not set!");
                return null;
            }

            Class.forName("org.postgresql.Driver");
            return DriverManager.getConnection(url, user, pass);

        } catch (Exception e) {
            System.err.println("CRITICAL: Could not connect to database!");
            e.printStackTrace();
            return null;
        }
    }
}