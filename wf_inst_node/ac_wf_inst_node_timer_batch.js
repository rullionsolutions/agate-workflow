"use strict";

var UI = require("lazuli-ui/index.js");
var SQL = require("lazuli-sql/index.js");
var Data = require("lazuli-data/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_timer_batch",
    entity_id       : "ac_wf_inst_node",
    title           : "Batch Perform Timer Steps"
//    allow_no_modifications: true
});

// UI.pages.get(ac_wf_inst_node_timer_batch).buttons.addAll([
//     { id: "save"  , label: "Save", main_button: false, save: true, css_class: "btn-primary" },
//     { id: "cancel", label: "Cancel" }
// ]);

module.exports.defbind("setupEnd", "setupEnd", function () {
    var query,
        page,
        count = 0,
        node;

    // this.getTrans();            // ensure this.trans always created
    query = this.entity.getQuery();
    query.addCondition({ column: "page"    , operator:  "=", value: "ac_wf_inst_node_timer" });
    query.addCondition({ column: "status"  , operator:  "=", value: "A" });
    query.addCondition({ full_condition: "due_date <= " + SQL.Connection.escape((new Date()).internal()) + " OR due_date IS NULL" });
    // query.addCondition({ column: "due_date", operator: "<=", value: (new Date()).internal() });
    while (query.next()) {
      // C8684 - Ensure node is still active before performing it
        node = Data.entities.get("ac_wf_inst_node").getRow(query.getColumn("A._key").get());
        if (node.getField("status").get() === "A") {
            count += 1;
            page = this.session.getPage("ac_wf_inst_node_timer", query.getColumn("A._key").get());
            page.update({});
        }
    }
    query.reset();
    this.session.messages.add({ type: 'I', text: "Found " + count + " active timer steps due on/before today" });
});
// UI.pages.get(ac_wf_inst_node_timer_batch).updateAfterSections = function (params) {
//    this.updateTrans(params);
// };
