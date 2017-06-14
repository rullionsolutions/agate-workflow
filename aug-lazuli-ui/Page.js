"use strict";

var UI = require("lazuli-ui/index.js");


UI.Page.define("addWorkflowState", function (workflow_state_field, transition) {
    if (!this.workflow_state_fields) {
        this.workflow_state_fields = {};
    }
    this.workflow_state_fields[workflow_state_field.id] = workflow_state_field;
});
