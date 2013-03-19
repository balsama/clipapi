<?php
/**
 * Definition of CLIP API Services as an array
 */
function clipapi_services($browscap = FALSE) {
  $browscap = get_browser($_SERVER['HTTP_USER_AGENT']);
  $partner_token = variable_get('clipapi_partner_token', '');
  $pid = variable_get('clipapi_pid', '');

  $services['GetCategories'] = array(
    // The API returns an unencrypted string for this. Not sure what's up
    // with that
  );

  $services['GetOffers'] = array(
    'options' => array(
      'query' => array(
        'sPartnerToken' => $partner_token,
        'nPID' => $pid,
      ),
    ),
    'service' => array(
      'engine' => 'OffersEngine.asmx',
      'service' => 'GetOffers',
    ),
  );

  $services['GetDetectScript'] = array(
    'options' => array(
      'query' => array(
        'sPartnerToken' => $partner_token,
        'nPID' => $pid,
        'operatingSystem' => $browscap->platform,
        'browser' => $browscap->browser,
        'majorVer' => $browscap->majorver,
        'minorVer' => $browscap->minorver,
        'callBackFunc' => 'GetDeviceID',
        'autoInitiate' => 'false',
        'MACSecondPage' => '',
      ),
    ),
    'service' => array(
      'engine' => 'PrintEngine.asmx',
      'service' => 'GetDetectScript',
    ),
  );

  $services['GetInstallScript'] = array(
    'options' => array(
      'query' => array(
        'sPartnerToken' => $partner_token,
        'nPID' => $pid,
        'operatingSystem' => $browscap->platform,
        'browser' => 'Firefox', //$browscap->browser, Documentation says you can pass anything here, but "chrome" causes a 500 error
        'majorVer' => $browscap->majorver,
        'minorVer' => $browscap->minorver,
        'callBackFunc' => '',
        'autoInitiate' => 'false',
      ),
    ),
    'service' => array(
      'engine' => 'PrintEngine.asmx',
      'service' => 'GetInstallScript',
    ),
  );

  // Returns blank screen
  $services['GetPrintToken'] = array(
    'options' => array(
      'query' => array(
        'sPartnerToken' => $partner_token,
        'nPID' => $pid,
        'aCouponList' => array(
          '1',
          '2',
        ),
        'DeviceID' => '',
        'AccessID' => '',
        'AffliateIiD' => '',
        'PlatformID' => '15',
        'KeywordID' => '0',
      ),
    ),
    'service' => array(
      'engine' => 'PrintManger.ASPX',
      'service' => 'GetPrintToken',
    ),
  );

  $services['GetAllTargettedOffers'] = array(
    'options' => array(
      'query' => array(
        'sPartnerToken' => $partner_token,
        'nPID' => $pid,
      ),
    ),
    'service' => array(
      'engine' => 'TargettedEngine.asmx',
      'service' => 'GetAllTargettedOffers',
    ),
  );

  $services['GetUserRestrictions'] = array(
    'options' => array(
      'query' => array(
        'sPartnerToken' => $partner_token,
        'nPID' => $pid,
        'nAccountID' => '0',
        'nDeviceID' => '549166962',
      ),
    ),
    'service' => array(
      'engine' => 'PrintEngine.asmx',
      'service' => 'GetUserRestrictions',
    ),
  );

  $services['GetPrintToken'] = array(
    'options' => array(
      'query' => array(
        'sPartnerToken' => $partner_token,
        'nPID' => $pid,
        'aCouponList' => '17210387',
        'DeviceID' => '549166962',
        'AccessID' => '0',
        'AffiliateID' => 'false',
        'KeywordID' => '0',
        'PlatformID' => '15',
      ),
    ),
    'service' => array(
      'engine' => 'PrintManager.aspx',
      'service' => 'GetPrintToken',
    ),

  );

  return $services;
}
