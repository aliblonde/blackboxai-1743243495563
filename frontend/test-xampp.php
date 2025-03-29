<?php
echo "<h1>XAMPP Connection Test</h1>";
echo "<p>If you can see this message, XAMPP is working correctly!</p>";

// Test MySQL connection
try {
    $conn = new PDO("mysql:host=localhost", "root", "");
    echo "<p>MySQL connection successful</p>";
} catch(PDOException $e) {
    echo "<p>MySQL connection failed: " . $e->getMessage() . "</p>";
}

// Test PHP version
echo "<p>PHP Version: " . phpversion() . "</p>";
?>