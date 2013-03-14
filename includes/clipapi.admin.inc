<?php

function clipapi_admin() {
  $form['clipapi_environment'] = array(
    '#type' => 'select',
    '#title' => t('Environment'),
    '#required' => TRUE,
    '#options' => array(
      'prod' => t('Production'),
      'dev' => t('Development'),
    ),
    '#default_value' => variable_get('clipapi_environment', 'prod'),
    '#description' => '<p>Production will target the xxx domain while Development will use <code>clip.pdn.coupons.com</code>.',
  );

  $form['clipapi_keylong'] = array(
    '#type' => 'textfield',
    '#title' => t('Long Key'),
    '#required' => TRUE,
    '#size' => 89,
    '#default_value' => variable_get('clipapi_keylong', 'prod'),
  );

  $form['clipapi_keyshort'] = array(
    '#type' => 'textfield',
    '#title' => t('Short Key'),
    '#required' => TRUE,
    '#size' => 16,
    '#default_value' => variable_get('clipapi_keyshort', 'prod'),
  );

  $form['clipapi_pid'] = array(
    '#type' => 'textfield',
    '#title' => t('PID'),
    '#required' => TRUE,
    '#size' => 16,
    '#default_value' => variable_get('clipapi_pid', 'prod'),
  );

  $form['clipapi_partner_token'] = array(
    '#type' => 'textfield',
    '#title' => t('Partner Token'),
    '#required' => TRUE,
    '#default_value' => variable_get('clipapi_partner_token', 'prod'),
  );
  
  return system_settings_form($form);
}

