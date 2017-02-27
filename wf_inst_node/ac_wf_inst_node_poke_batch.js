"use strict";

// Execute automatic steps that should have completed, but weren't due to a record lock
var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_poke_batch",
    entity_id       : "ac_wf_inst_node",
    title           : "Batch Poke Automatic Steps",
    allow_no_modifications: true
});


module.exports.defbind("setupEnd", "setupEnd", function () {
    var query,
        node_row,
        count = 0;

    query = this.entity.getQuery();
    query.addCondition({ column: "attributes", operator: "CO", value: "|AU|" });
    query.addCondition({ column: "status"    , operator:  "=", value: "A" });
    query.addCondition({ column: "due_date"  , operator: "NU", value: "" });
    while (query.next()) {
        count += 1;
        node_row = query.getRow(this.getTrans());
        node_row.performThisAutomatedStep();
    }
    query.reset();
    this.session.messages.add({ type: 'I', text: "Found " + count + " active automatic steps" });
});
