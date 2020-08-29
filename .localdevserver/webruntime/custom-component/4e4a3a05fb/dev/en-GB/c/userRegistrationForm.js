Webruntime.define('lwc/userRegistrationForm', ['lwc'], function (lwc) { 'use strict';

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        t: api_text,
        h: api_element
      } = $api;
      return [api_element("h1", {
        key: 0
      }, [api_text(" User Registration Form")])];
    }

    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetTokens = {
      hostAttribute: "lwc-userRegistrationForm_userRegistrationForm-host",
      shadowAttribute: "lwc-userRegistrationForm_userRegistrationForm"
    };

    class UserRegistrationForm extends lwc.LightningElement {}

    var userRegistrationForm = lwc.registerComponent(UserRegistrationForm, {
      tmpl: _tmpl
    });

    return userRegistrationForm;

});
