<?php
require_once('common.php');

if(!isset($_SESSION['twitterAccessToken'])) {
	header('HTTP/1.0 403 Forbidden');
	exit;
}

if(!isset($_POST['media'])) {
}

$media = $_POST['media'];
if(strpos($media,'data:image/png;base64,') !== 0) {
	header('HTTP/1.0 500 Internal Server Error');
	exit;
}

$media = str_replace('data:image/png;base64,','',$media);

$tmpFile = tempnam(sys_get_temp_dir(), 'jspaint_image');
file_put_contents($tmpFile,base64_decode($media));

$message = isset($_POST['message']) ? $_POST['message'] : 'yo ho!';

$token = unserialize($_SESSION['twitterAccessToken']);

$accessToken = new Zend_Oauth_Token_Access();
$accessToken->setToken($token->getToken());
$accessToken->setTokenSecret($token->getTokenSecret());

$config = new Zend_Oauth_Config($GLOBALS['twitter']['config']);
$config->setToken($accessToken);
$config->setRequestMethod(Zend_Oauth::GET);

$xAuthServiceProvider = 'https://api.twitter.com/1/account/verify_credentials.json';

$client = new Zend_Http_Client();
$client->resetParameters();
$client->setHeaders('X-Verify-Credentials-Authorization', $accessToken->toHeader($xAuthServiceProvider, $config, array(),'http://api.twitter.com/'));
$client->setHeaders('X-Auth-Service-Provider', $xAuthServiceProvider);
$client->setUri('http://api.twitpic.com/2/upload.json');
$client->setParameterPost(array('key' => $GLOBALS['twitpic']['apiKey'],'message' => $message));
$client->setFileUpload($tmpFile, 'media');


$response = $client->request('POST');
//$response = Zend_Json::decode($response->getBody(), Zend_Json::TYPE_OBJECT);

unlink($tmpFile);

$ret = new stdClass;
if($response->isError()) {
	$ret->status = false;
	$ret->message = $response->getMessage();
} else {
	$ret->status = true;
	if(function_exists('json_decode')) {
		$body = json_decode($response->getBody());
	} else {
		$body = Zend_Json::decode($response->getBody(), Zend_Json::TYPE_OBJECT);
	}
	$ret->url = $body->url;
	
	if(isset($_POST['tweet']) && $_POST['tweet']) {
		// tweet this.
		$twitterConfig = array(
			'username' => $token->getParam('screen_name'),
			'accessToken' => $token,
			'consumerKey' => $GLOBALS['twitter']['config']['consumerKey'],
			'consumerSecret' => $GLOBALS['twitter']['config']['consumerSecret']
		);
	
		$twitter = new Zend_Service_Twitter($twitterConfig);
		//var_dump($twitter);
		$tweet = $message.' '.$body->url;
		$tweetret = $twitter->status->update($tweet);
		//var_dump($tweetret);
	}
}
if(function_exists('json_encode')) {
	echo json_encode($ret);
} else {
	echo Zend_Json::encode($ret);
}

?>