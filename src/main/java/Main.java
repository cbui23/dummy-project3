import java.sql.Connection;
import java.sql.DriverManager;

public class Main {
    public static void main(String[] args) {
        System.out.println("Attempting to connect to the database...");

        // Pulling credentials from Render's Environment Variables
        String url = System.getenv("DB_URL");
        String user = System.getenv("DB_USER");
        String password = System.getenv("DB_PASSWORD");

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            if (conn != null) {
                System.out.println("Successfully connected to the database!");
                
                // Keep the app running so Render doesn't restart it
                System.out.println("Service is live. Waiting for requests...");
                Thread.currentThread().join(); 
            }
        } catch (Exception e) {
            System.err.println("Database connection failed!");
            e.printStackTrace();
        }
    }
}