<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include "../../inc/function.php";
$result = array();
$result['status'] = true;
$datenow = date('Y-m-d H:i:s');

$unit_code = $_POST['unit_code'];
if($_POST['isvisit'] == "VISIT"){
    $postNameField = "FOTOHANDOVER";
    $encode = md5(date("dmYhisA"));
    $filename = $unit_code."_".$postNameField;
    $file_name = '../../save_pdf/'.$filename.'.png';
    move_uploaded_file($_FILES['foto']['tmp_name'], $file_name);
    $data['foto'] = $filename.".png";
}
$data['link'] = $_POST['link'];
$data['date_ho'] = $datenow;
$data['isvisit'] = $_POST['isvisit'];
$data['eligible'] = 'Sukses HO';

$res = updateById($data, "handover", "unit_code", $_POST['unit_code']);

if($res != 'false'){
    $result['remarks'] = 'Berhasil';
}else{
    $result['status'] = false;
    $result['remarks'] = $res;
}

echo json_encode($result);