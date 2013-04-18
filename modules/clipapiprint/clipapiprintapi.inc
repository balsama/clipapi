<?php
function clipapiprintapi() {
  $result = 'Unrecognized Service';
  if (arg(1) == 'GetPrintToken') {
    $result = clipapi_get('GetPrintToken', array('DeviceID' => arg(2)));
    $result = $result['PrintCartToken'];
  }
  if (arg(1) == 'GetUserRestrictions') {
    $result = clipapi_get('GetUserRestrictions', array('DeviceID' => arg(2)));
    $list = array();
    if (isset($result['CouponList']['CouponLimits'])) {
      foreach ($result['CouponList']['CouponLimits'] as $restriction) {
        $list[] = $restriction['ID'];
      }
      $result = implode(',', $list);
    }
  }
  print $result;
}

function clipapiprintresults() {
  $status = 'Failure';
  if ($_GET['ci_status'] == 0) {
    $status = 'Success';
  }
  else {
    watchdog('CLIP API', 'Print Error. Status code: @status_code', array('@status_code' => $_GET['ci_status']), WATCHDOG_ERROR);
  }
  print $status;
}
