<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=gkh_shops', 'root', '');
    $pdo->exec('DROP TABLE IF EXISTS shops');
    echo "Table dropped\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
