"use strict";

var UI = require("lazuli-ui/index.js");
var Data = require("lazuli-data/index.js");
var Rhino = require("lazuli-rhino/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_notify_batch",
    entity_id       : "ac_wf_inst_node",
    title           : "Batch Send Workflow Notifications",
    allow_no_modifications: true
});


module.exports.buttons.addAll([
    { id: "save"  , label: "Save", main_button: false, save: true, css_class: "btn-primary" },
    { id: "cancel", label: "Cancel" }
]);


module.exports.defbind("setupEnd", "setupEnd", function () {
    var today,
        query,
        wf_node_row,
        text,
        user_id,
        user_text = {},
        delegatee,
        delegater,
        deleg_text = {};

    this.getTrans();            // ensure this.trans always created
    today = new Date();
    query = Data.entities.get("ac_wf_inst_node").getQuery();
    query.addCondition({ column: "A.status"  , operator: "=", value: "A" });                   // Active Tasks
    query.addCondition({ column: "A.due_date", operator: "<", value: today.internal() });      // due <= today
    // query.addCondition({ full_condition: "IFNULL(A.attributes  , '') NOT LIKE '%|SN|%'" });                // !skip notification
    query.addCondition({ full_condition: "A.ntfcn_status LIKE '%|DU|%'" });                       // !due notification not sent
    while (query.next()) {
        wf_node_row = query.getRow(this.getTrans());
        wf_node_row.getField("simple_url").validate();         // force call to getComputed()
        text = "\n\n"  + wf_node_row.getField("title"   ).get() +
            " for "    + wf_node_row.getField("wf_inst" ).getText() +
            " due on " + wf_node_row.getField("due_date").getText() +
            "\n\t" + Rhino.app.base_uri + wf_node_row.getField("simple_url").get();
        wf_node_row.getField("ntfcn_status").setItem("DU", false);
        wf_node_row.getField("ntfcn_status").setItem("DS", true);
        user_id = wf_node_row.getField("assigned_user").get();
        if (!user_id) {
            user_id = "batch";
        }
        if (!user_text[user_id]) {
            user_text[user_id] = Core.Format.convertNameFirstSpaceLast(wf_node_row.getField("assigned_user").getText()) + ":";
        }
        user_text[user_id] += text;
    }
    query.reset();
    query = Data.entities.get("ac_user_deleg").getQuery();
    query.addCondition({ full_condition: "A.delegater IN ( SELECT ZN.assigned_user FROM ac_wf_inst_node ZN WHERE ZN.status = 'A' and ZN.due_date < DATE(NOW()) )" });
    query.addCondition({ column: "A.get_ntfcns", operator: "=", value: "Y" });    // delegation set to 'get notifications'
    while (query.next()) {
        delegatee = query.getColumn("A.delegatee").get();
        delegater = query.getColumn("A.delegater").get();
        if (user_text[delegater]) {
            if (!deleg_text[delegatee]) {
                deleg_text[delegatee] = "";
            }
            deleg_text[delegatee] += "\n\nTasks delegated to you, assigned to " + user_text[delegater];
            if (!user_text[delegatee]) {            // Ensure all delegatees included in user_text loop, even if don't have tasks of their own
                user_text[delegatee] = Core.Format.convertNameFirstSpaceLast(Data.entities.get("ac_user").getRow(delegatee).getLabel("reference")) + ",";
            }
        }
    }
    query.reset();

    for (user_id in user_text) {
        if (user_text.hasOwnProperty(user_id)) {
            text = user_text[user_id] + (deleg_text[user_id] || "");
            this.addEmail({
                session            : this.session,
                to_user            : user_id,
                text_string        : Data.entities.get("ac_wf_inst_node").digest_text_string,
                text_detail        : "Tasks for " + text
            });
        }
    }
});


module.exports.defbind("updateAfterSections", "updateAfterSections", function (params) {
    this.updateTrans(params);
});
