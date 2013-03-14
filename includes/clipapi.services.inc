<?php
/**
 * Definition of CLIP API Services as an array
 */
function clipapi_services($browscap = FALSE) {
  $browscap = get_browser($_SERVER['HTTP_USER_AGENT']);
  $services['GetCategories'] = array(
    // The API returns an unencrypted string for this mofo. Not sure what's up
    // with that
  );

  $services['GetOffers'] = array(
    'options' => array(
      'query' => array(
        'sPartnerToken' => '8038e590-58b9-4deb-86fa-9638c3b94e6e',
        'nPID' => '16721',
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
        'sPartnerToken' => '8038e590-58b9-4deb-86fa-9638c3b94e6e',
        'nPID' => '16721',
        'operatingSystem' => $browscap->platform,
        'browser' => $browscap->browser,
        'majorVer' => $browscap->majorver,
        'minorVer' => $browscap->minorver,
        'callBackFunc' => 'GetDeviceID',
        'autoInitiate' => 'true',
        'MACSecondPage' => '',
      ),
      'external' => TRUE,
    ),
    'service' => array(
      'engine' => 'PrintEngine.asmx',
      'service' => 'GetDetectScript',
    ),
  );

  $services['GetInstallScript'] = array(
    'options' => array(
      'query' => array(
        'sPartnerToken' => '8038e590-58b9-4deb-86fa-9638c3b94e6e',
        'nPID' => '16721',
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
        'sPartnerToken' => '8038e590-58b9-4deb-86fa-9638c3b94e6e',
        'nPID' => '16721',
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
        'sPartnerToken' => '8038e590-58b9-4deb-86fa-9638c3b94e6e',
        'nPID' => '16721',
      ),
    ),
    'service' => array(
      'engine' => 'TargettedEngine.asmx',
      'service' => 'GetAllTargettedOffers',
    ),
  );

  return $services;
}
