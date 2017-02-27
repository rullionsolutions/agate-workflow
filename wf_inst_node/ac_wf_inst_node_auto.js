"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_auto",
    entity_id       : "ac_wf_inst_node",
    title           : "Generic Automated Task",
    wf_type         : "all",
    transactional   : true,
    security        : { all: true },
    workflow_only   : true
});
