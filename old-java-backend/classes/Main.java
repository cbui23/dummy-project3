import static spark.Spark.*;
import java.sql.*;

public class Main {
    public static void main(String[] args) {
        // REQUIRED FOR RENDER: Bind to the port so the site goes "Live"
        port(Integer.parseInt(System.getenv().getOrDefault("PORT", "8080")));
        ipAddress("0.0.0.0");

        get("/", (req, res) -> {
            String status = testConnection();
            return "<h1>Database Status: " + status + "</h1>";
        });

        System.out.println("Server started. Waiting for connections...");
    }

    private static String testConnection() {
        String url = System.getenv("DB_URL");
        String user = System.getenv("DB_USER");
        String pass = System.getenv("DB_PASSWORD");

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            return "✅ Successfully connected to " + url;
        } catch (Exception e) {
            return "❌ Connection Failed: " + e.getMessage();
        }
    }
}