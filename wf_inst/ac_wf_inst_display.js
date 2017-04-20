"use strict";

var UI = require("lazuli-ui/index.js");
var Data = require("lazuli-data/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_display",
    entity_id       : "ac_wf_inst",
    title           : "Workflow Instance",
    requires_key    : true
});


module.exports.sections.addAll([
    { id: "main"    , type: "Display"      , entity: "ac_wf_inst" },
    { id: "nodes"   , type: "Section"      , title: "Node Sequence", visible: false },
    { id: "chg_hist", type: "ChangeHistory", entity: "ac_wf_inst", title: "Change History" }
]);


module.exports.links.addAll([
    { id: "skip"    , page_to: "ac_wf_inst_skip"      , page_key: "{page_key}" },
    { id: "freeze"  , page_to: "ac_wf_inst_freeze"    , page_key: "{page_key}" },
    { id: "unfreeze", page_to: "ac_wf_inst_unfreeze"  , page_key: "{page_key}" }
]);


module.exports.sections.get("nodes").render = function (render_opts) {
    var query,
        ac_wf_inst_node_rcd,
        curr_seq,
        prev_seq = -1,
        row_count = 0,
        outer_elem,
        table_elem,
        inner_elem;

    UI.Section.render.call(this, render_opts);
    outer_elem = this.getSectionElement(render_opts).addChild("div");
    table_elem = outer_elem.addChild("table", null, "table table-bordered table-condensed");
    ac_wf_inst_node_rcd = Data.entities.get("ac_wf_inst_node").clone({ id: "temp" });
    query = Data.entities.get("ac_wf_inst_node").getQuery();
    query.addCondition({ column: "A.wf_inst", operator: "=", value: this.owner.page.page_key });
    query.getColumn("A.id"        ).sortTop();
    query.getColumn("A.seq_number").sortTop();
    while (query.next()) {
        curr_seq = query.getColumn("A.seq_number").getNumber(0);
        if (!inner_elem || curr_seq !== prev_seq) {
            inner_elem = table_elem.addChild("tr", null, (row_count % 2 === 0) ? "css_row_even" : "css_row_odd").addChild("td");
            row_count += 1;
        }
        ac_wf_inst_node_rcd.populate(query.resultset);
        ac_wf_inst_node_rcd.renderTile(inner_elem, render_opts);
//        addButton(inner_elem,
//            query.getColumn("A.status").get(),
//            query.getColumn("A.title" ).get(),
//            "#page_id=ac_wf_inst_node_display&page_key=" + query.getColumn("A._key").get());
        prev_seq = curr_seq;
    }
    query.reset();
    outer_elem = this.getSectionElement(render_opts).addChild("div", null, null, "Legend");
    outer_elem = this.getSectionElement(render_opts).addChild("div");
    outer_elem.addChild("a", null, "css_tile btn btn-success", "Completed");
    outer_elem.addChild("a", null, "css_tile btn btn-primary", "Active");
    outer_elem.addChild("a", null, "css_tile btn btn-warning", "Pending");
    outer_elem.addChild("a", null, "css_tile btn btn-info"   , "Frozen");
    outer_elem.addChild("a", null, "css_tile btn"            , "Skipped");
};
