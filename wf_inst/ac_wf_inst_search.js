"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_search",
    entity_id       : "ac_wf_inst",
    title           : "Search for Workflow Instances",
    short_title     : "Workflow Instances"
});


module.exports.sections.addAll([
    { id: "main", type: "Search", entity: "ac_wf_inst" }
]);
