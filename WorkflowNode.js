"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Section.clone({
    id: "WorkflowNode"
});


module.exports.override("render", function (element, render_opts) {
    var workflow = this.owner.page.source_obj,
        first_node = workflow.nodes.get(workflow.first_node_id),
        sctn_elem,
        ul_elem,
        li_elem;

    UI.Section.render.call(this, element, render_opts);
    sctn_elem = this.getSectionElement(render_opts);
      ul_elem = sctn_elem.addChild("ul");
      li_elem = ul_elem.addChild("li");
    first_node.render(li_elem, render_opts, []);
});
