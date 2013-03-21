<?php
function clipapiprintapi() {
  $result = 'Unrecognized Service';
  if (arg(1) == 'GetPrintToken') {
    $result = clipapi_get('GetPrintToken', array('DeviceID' => arg(2)));
    $result = $result['PrintCartToken'];
  }

  print $result;
}
