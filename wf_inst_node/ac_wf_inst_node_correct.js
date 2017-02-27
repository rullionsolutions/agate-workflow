"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_correct",
    entity_id       : "ac_wf_inst_node",
    title           : "Correct this Workflow Instance Node",
    short_title     : "Correct",
    transactional   : true,
    requires_key    : true
});


module.exports.sections.addAll([
    { id: "main"  , type: "Update"    , entity: "ac_wf_inst_node" }
//    { id: "params", type: "FlexUpdate", entity: "ac_wf_inst_parm", link_field: "wf_inst_node" },
//    { id: "trns"  , type: "ListUpdate", entity: "ac_wf_inst_trns", link_field: "from_node" }
]);


module.exports.defbind("setupEnd", "setupEnd", function () {
    if (this.getPrimaryRow().getField("status").get() === "A") {
        this.getPrimaryRow().setUserFromActor();
        this.getPrimaryRow().updateDates();
    }
});


module.exports.defbind("updateAfterSections", "updateAfterSections", function (params) {
    this.getPrimaryRow().getField("assigned_user").editable = this.getPrimaryRow().getField("attributes").isItem("OA");
});


module.exports.defbind("presaveUserChange", "presave", function () {
    var row = this.getPrimaryRow();
    if (row.getField("assigned_user").isModified()) {
        row.changeAssignedUser(row.getField("assigned_user").get());
    }
    // Set One Time Code - will only occur if one_time_lock_code is blank and if OT item is selected
    if (row.setOneTimeLockCode()) {
        row.emailAssignedUserAndDelegates();
    }
});
