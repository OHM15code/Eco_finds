<?php
<!-- filepath: c:\Users\princ\Documents\Eco_finds\signup.php -->
<?php
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if ($username && $password) {
    $usersFile = 'users.txt';
    // Check if username already exists
    $users = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($users as $user) {
        list($existingUser, ) = explode(':', $user);
        if ($existingUser === $username) {
            echo "Username already exists. <a href='signup.html'>Try again</a>";
            exit;
        }
    }
    // Save new user (password is hashed for basic security)
    file_put_contents($usersFile, "$username:" . password_hash($password, PASSWORD_DEFAULT) . "\n", FILE_APPEND);
    echo "Signup successful! <a href='login.html'>Login now</a>";
} else {
    echo "Please fill all fields. <a href='signup.html'>Try again</a>";
}
?>