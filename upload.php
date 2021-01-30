<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$servername = "localhost";
$username = ""; //SESUAIKAN user untuk db
$password = ""; //SESUAIKAN password untuk db
$dbname = "ocr"; //Nama DB, db nya ada di root folder ya ocr.sql

$result = array();
$result['status'] = true;
$datenow = date('Y-m-d H:i:s');

$type = $_POST['type'];
$provinsi = $_POST['provinsi'];
$kabupaten = $_POST['kabupaten'];
$nik = $_POST['nik'];
$nama = $_POST['nama'];
$ttl = $_POST['ttl'];
$jk = $_POST['jk'];
$alamat = $_POST['alamat'];
$rtrw = $_POST['rtrw'];
$desa = $_POST['desa'];
$kec = $_POST['kec'];
$agama = $_POST['agama'];
$statuskawin = $_POST['statuskawin'];
$pekerjaan = $_POST['pekerjaan'];

$filename = date("dmYhisA");
$foto = $filename.".png";
if($type == 'file'){
  $pathName = 'file_upload/'.$foto;
  move_uploaded_file($_FILES['foto']['tmp_name'], $pathName);
}else{
  $img = $_POST['foto'];
  $img = str_replace('data:image/png;base64,', '', $img);
  $img = str_replace(' ', '+', $img);
  $data = base64_decode($img);
  $pathName = 'file_upload/'.$foto;
  $success = file_put_contents($pathName, $data);
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
  $result['status'] = false;
  $result['remarks'] = "Connection failed: " . $conn->connect_error;
}

$sql = "INSERT INTO `ktp` (`id`, `provinsi`, `kabupaten`, `nik`, `nama`, `ttl`, `jk`, `alamat`, `rtrw`, `desa`, `kec`, `agama`, `statuskawin`, `pekerjaan`, `foto`) VALUES 
                          (NULL, '".$provinsi."', '".$kabupaten."', '".$nik."', '".$nama."', '".$ttl."', '".$jk."', '".$alamat."', '".$rtrw."', '".$desa."', '".$kec."', '".$agama."', '".$statuskawin."', '".$pekerjaan."', '".$foto."')";

if ($conn->query($sql) === TRUE) {
  $result['remarks'] = 'New record created successfully';
} else {
  $result['status'] = false;
  $result['remarks'] = "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
echo json_encode($result);