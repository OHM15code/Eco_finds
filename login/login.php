<?php
<!-- filepath: c:\Users\princ\Documents\Eco_finds\login.php -->
<?php
// Example: Hardcoded credentials
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if ($username === 'admin' && $password === 'password123') {
    echo "Login successful!";
} else {
    echo "Invalid username or password.";
}
?>