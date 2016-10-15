<?php

/*
※使い方

以下の各設定を変更してください。

$GLOBALS['twitter'] = array(
	'consumerKey' => 'your consumer key',
	'consumerSecret' => 'your consumer secret',
	'callback' => 'http://yourhost/path/to/jspaint/auth.php?callback=1'
);
$GLOBALS['twitpic'] = array(
	'apiKey' => 'your twitpic api key'
);



*/

require_once 'Zend/Loader/Autoloader.php';
Zend_Loader_Autoloader::getInstance();

session_start();

$GLOBALS['twitter'] = array(
	'consumerKey' => 'CONSUMER_KEY_HERE',
	'consumerSecret' => 'CONSUMER_SECRET_HERE',
	'callback' => 'CALLBACK_HERE'
);
$GLOBALS['twitpic'] = array(
	'apiKey' => 'API_KEY_HERE'
);


$GLOBALS['twitter']['config'] = array(
  'version' => '1.0', // there is no other version...
  'requestScheme' => Zend_Oauth::REQUEST_SCHEME_HEADER,
  'signatureMethod' => 'HMAC-SHA1',
  'consumerKey' => $GLOBALS['twitter']['consumerKey'],
  'consumerSecret' => $GLOBALS['twitter']['consumerSecret'],
  'callbackUrl' => $GLOBALS['twitter']['callback'],
  'requestTokenUrl' => 'http://twitter.com/oauth/request_token',
  'authorizeUrl' => 'http://twitter.com/oauth/authorize',
  'accessTokenUrl' => 'http://twitter.com/oauth/access_token',
);


?>