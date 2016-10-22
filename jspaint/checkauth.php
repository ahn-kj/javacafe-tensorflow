<?php

require_once('common.php');

if(isset($_SESSION['twitterAccessToken'])) {
	$token = unserialize($_SESSION['twitterAccessToken']);
	echo 'true';
} else {
	echo 'false';
}
?>