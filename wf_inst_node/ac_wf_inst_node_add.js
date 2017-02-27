"use strict";

var UI = require("lazuli-ui/index.js");
var Data = require("lazuli-data/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_add",
    entity_id       : "ac_wf_inst_node",
    title           : "Add a Subsequent Workflow Instance Node",
    short_title     : "Add Subsequent Node",
    transactional   : true,
    requires_key    : true
});


module.exports.sections.addAll([
    { id: "main"  , type: "Create", title: "New Node"  , entity: "ac_wf_inst_node" }
//    { id: "trns"  , type: "Create", title: "Transition", entity: "ac_wf_inst_trns", link_field: "to_node" }
]);


module.exports.defbind("setupStart", "setupStart", function () {
    // Create new node row before page.setup calls getPrimaryRow to avoid errors in ac_wf_inst_node.getTransRow
    this.curr_node = Data.entities.get("ac_wf_inst_node").getRow(this.page_key);
    this.primary_row = this.getTrans().createNewRow("ac_wf_inst_node", {
        wf_inst: Data.entities.get("ac_wf_inst").retrieve(this.getTrans(), this.curr_node.getField("wf_inst").get()),
        tmpl_node_id: "",
        tmpl_node_unknown: true,
    });
});


module.exports.defbind("setupEnd", "setupEnd", function () {
    this.new_node = this.getPrimaryRow();
    this.new_node.getField("wf_inst"   ).set(this.curr_node.getField("wf_inst"   ).get());
    this.new_node.getField("page_key"  ).set(this.curr_node.getField("page_key"  ).get());
    this.new_node.getField("seq_number").set(this.curr_node.getField("seq_number").getNumber(0) + 1);
    this.new_node.getField("prev_node" ).set(this.page_key);
    this.new_node.getField("outcome_id").set("save");
    delete this.new_node.tmpl_node_unknown;
//    this. new_node.wf_inst = Data.entities.get("ac_wf_inst").retrieve(this.getTrans(), this.new_node.getField("wf_inst").get());
});


module.exports.defbind("updateAfterSections", "updateAfterSections", function (/*params*/) {
    var wf_tmpl_node_fld,
        wf_tmpl_node,
        page_fld,
        p;

    wf_tmpl_node_fld = this.new_node.getField("wf_tmpl_node");
            page_fld = this.new_node.getField("page");

    if (wf_tmpl_node_fld.isChangedSincePreviousUpdate() && !wf_tmpl_node_fld.isBlank()) {
        try {
            wf_tmpl_node = this.new_node.wf_inst.nodes.get(wf_tmpl_node_fld.get());
            this.new_node.tmpl_node_id = wf_tmpl_node_fld.get();
            for (p in wf_tmpl_node) {
                if ((wf_tmpl_node.hasOwnProperty(p) || p === "page_id" || p === "actor_id") && p !== "id" && p !== "table"  //C9678
                    && (typeof wf_tmpl_node[p] !== "object")) {
                    this.new_node[p] = wf_tmpl_node[p];
                }
            }
            this.new_node.setupNodeFromTemplate(wf_tmpl_node_fld.get());
        } catch (e) {
            this.error(e);
            this.session.messages.add({ type: 'E', text: "Unknown WF Template Node" });
        }
    } else if ( page_fld.isChangedSincePreviousUpdate() && !page_fld.isBlank()) {
        try {
            this.new_node.setupNodeFromPage(page_fld.get());
        } catch (e2) {
            this.session.messages.add({ type: 'E', text: "Unknown Page" });
        }
    }
});


module.exports.defbind("presaveActivate", "presave", function () {
    var status = this.curr_node.getField("status").get();
    if (status === "C" || status === "K") {
        this.new_node.activate();
    }
});
