import static spark.Spark.*;
import java.sql.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        ipAddress("0.0.0.0");
        String portStr = System.getenv("PORT");
        int portNumber = (portStr != null) ? Integer.parseInt(portStr) : 8080;
        port(portNumber);

        // --- ROUTE 1: THE KIOSK (MENU) ---
        get("/", (req, res) -> {
            return getKioskHtml();
        });

        // --- ROUTE 2: THE CART ---
        get("/cart", (req, res) -> {
            return getCartHtml();
        });

        init();
    }

    private static String getKioskHtml() {
        StringBuilder html = new StringBuilder();
        html.append("<html><head><title>Boba Kiosk</title>");
        html.append("<style>")
            .append("body { font-family: Arial; text-align: center; background: #fdf5e6; }")
            .append(".nav { background: #6c5b7b; padding: 15px; color: white; display: flex; justify-content: space-between; }")
            .append(".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px; }")
            .append(".card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer; }")
            .append("button { padding: 10px 20px; background: #f8b195; border: none; border-radius: 5px; cursor: pointer; }")
            .append("</style></head><body>");

        html.append("<div class='nav'><span>🧋 Boba Kiosk</span><a href='/cart' style='color:white;'>View Cart 🛒</a></div>");
        html.append("<h1>Select Your Items</h1>");

        // DATABASE LOOP: Pulling from your Project 2 'menu_items' table
        try (Connection conn = DriverManager.getConnection(System.getenv("DB_URL"), System.getenv("DB_USER"), System.getenv("DB_PASSWORD"))) {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT name, price FROM menu_items"); // Use your actual table name

            html.append("<div class='grid'>");
            while (rs.next()) {
                String name = rs.getString("name");
                double price = rs.getDouble("price");
                html.append("<div class='card' onclick='addToCart(\"" + name + "\")'>");
                html.append("<h3>" + name + "</h3>");
                html.append("<p>$" + String.format("%.2f", price) + "</p>");
                html.append("</div>");
            }
            html.append("</div>");
        } catch (Exception e) {
            html.append("<p style='color:red;'>DB Error: " + e.getMessage() + "</p>");
        }

        // Script to save item names to the browser's local storage
        html.append("<script>")
            .append("function addToCart(name) {")
            .append("  let cart = JSON.parse(localStorage.getItem('bobaCart') || '[]');")
            .append("  cart.push(name);")
            .append("  localStorage.setItem('bobaCart', JSON.stringify(cart));")
            .append("  alert(name + ' added!');")
            .append("}")
            .append("</script></body></html>");

        return html.toString();
    }

    private static String getCartHtml() {
        return "<html><head><title>Your Cart</title></head><body style='font-family: Arial; padding: 50px;'> " +
               "<h1>Your Selection</h1>" +
               "<ul id='cartList'></ul>" +
               "<button onclick='submitOrder()' style='background:green; color:white; padding:15px;'>Submit Order</button>" +
               "<br><br><a href='/'>Go Back to Menu</a>" +
               "<script>" +
               "  const cart = JSON.parse(localStorage.getItem('bobaCart') || '[]');" +
               "  const list = document.getElementById('cartList');" +
               "  cart.forEach(item => { let li = document.createElement('li'); li.innerText = item; list.appendChild(li); });" +
               "  function submitOrder() { alert('Order sent to Database!'); localStorage.clear(); window.location.href='/'; }" +
               "</script></body></html>";
    }
}