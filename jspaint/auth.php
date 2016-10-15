<?php
require_once('common.php');

$consumer = new Zend_Oauth_Consumer($GLOBALS['twitter']['config']);

if(!isset($_GET['callback'])) {
	$token = $consumer->getRequestToken();
	
	$_SESSION['twitterRequestToken'] = serialize($token);
	
	$consumer->redirect();
} else if(isset($_GET['oauth_token']) && isset($_GET['oauth_verifier']) && isset($_SESSION['twitterRequestToken'])) {
	$token = $consumer->getAccessToken($_GET,unserialize($_SESSION['twitterRequestToken']));
	
	$_SESSION['twitterAccessToken'] = serialize($token);
	$_SESSION['twitterRequestToken'] = null;
} else if(isset($_GET['denied'])) {
	$_SESSION['twitterRequestToken'] = null;
	$_SESSION['twitterAccessToken'] = null;
	//echo 'oops';
}
header('Location: index.php');
?>