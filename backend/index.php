<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods:  POST, GET, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers:  Content-Type, X-Auth-Token, Origin, Authorization, enctype');
    

    require('db.php');
    $request = $_SERVER['REQUEST_URI'];
    try {
    
        if(strpos($request, 'login') !== false)
        {
            $email = $_POST['email'];
            $password = md5($_POST['password']);
        
            if(isset($_POST['register'])){
                $stmt = $conn->prepare("INSERT INTO users (email,password) VALUES (?,?)");
                $stmt->bind_param('ss', $email, $password);
                $stmt->execute();    
            }
            $stmt = $conn->prepare("SELECT * FROM users WHERE email=? AND password=? LIMIT 1");
            $stmt->bind_param('ss', $email, $password);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            header('Content-Type: application/json');

            echo json_encode(['message'=>'success', 'user'=>$user]);
            
            if($stmt->num_rows == 1){
                $result = $stmt->get_result();
                $user = $result->fetch_assoc();
                header('Content-Type: application/json');
            }
        }else if(strpos($request, 'bestScore') !== false)
        {
            $email = $_POST['email'];
            $bestScore = $_POST['bestScore'];
            $stmt = $conn->prepare("UPDATE users SET bestScore=? where email=?");
            $stmt->bind_param("ss", $bestScore, $email);
            $stmt->execute();
        }
    } catch (\Throwable $th) {
        header('Content-Type: application/json');
        echo $th;
    }